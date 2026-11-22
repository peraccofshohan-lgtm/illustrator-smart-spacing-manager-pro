// Illustrator Smart Spacing Manager Pro
// Spacing/SpacingEngine.jsx — Apply spacing adjustments to document objects
var SSM = SSM || {};
SSM.SpacingEngine = (function () {
    var Calculator = SSM.SpacingCalculator;
    var TransactionManager = SSM.TransactionManager;
    var TemporaryObjectManager = SSM.TemporaryObjectManager;
    var C = SSM.Constants;

    function applyToPair(upperItem, lowerItem, measurement, targetGapPt, anchorBehavior, doc) {
        var calc = Calculator.calculate(measurement, targetGapPt);
        if (!calc) { return { success: false, error: "Cannot calculate spacing" }; }
        var movement = Calculator.movementForAnchor(calc, anchorBehavior);
        var applied = applyMovement(upperItem, movement.moveUpper, lowerItem, movement.moveLower, doc);
        return {
            success: applied.success,
            calculation: calc,
            movement: movement,
            error: applied.error,
            upperItem: upperItem ? upperItem.id : null,
            lowerItem: lowerItem ? lowerItem.id : null
        };
    }

    function applyMovement(upperItem, moveUpperPt, lowerItem, moveLowerPt, doc) {
        var errors = [];
        if (upperItem && moveUpperPt !== 0) {
            var ok = moveItemBy(upperItem, 0, moveUpperPt, doc);
            if (!ok) { errors.push("Failed to move upper item " + (upperItem.name || upperItem.id)); }
        }
        if (lowerItem && moveLowerPt !== 0) {
            var ok2 = moveItemBy(lowerItem, 0, moveLowerPt, doc);
            if (!ok2) { errors.push("Failed to move lower item " + (lowerItem.name || lowerItem.id)); }
        }
        return { success: errors.length === 0, error: errors.length > 0 ? errors.join("; ") : null };
    }

    // Resolve AUTO direction to a concrete axis using the same deterministic rule
    // as PreviewEngine: choose the axis with the larger absolute gap.
    // If only one axis is available, use that one. Returns null if none available.
    function resolveAutoDirection(measurement) {
        var v = measurement && measurement.vertical;
        var h = measurement && measurement.horizontal;
        if (!v && !h) { return null; }
        if (v && h) {
            return Math.abs(v.gap) >= Math.abs(h.gap) ? C.DIRECTIONS.VERTICAL : C.DIRECTIONS.HORIZONTAL;
        }
        return v ? C.DIRECTIONS.VERTICAL : C.DIRECTIONS.HORIZONTAL;
    }

    function moveItemBy(itemRef, dxPt, dyPt, doc) {
        try {
            // Resolve the object whose geometricBounds we will modify.
            // Prefer .original (the live Illustrator object) when it exists;
            // otherwise use the itemRef itself.
            var target = null;
            if (itemRef.original) {
                target = itemRef.original;
            } else {
                target = itemRef;
            }
            // Use PageItem.translate(dx, dy) — the Illustrator-supported
            // positioning API. Direct geometricBounds assignment is not
            // guaranteed to be writable in all Illustrator environments.
            // Illustrator convention: translate(dx, dy) — positive dx moves
            // right, positive dy moves down (decreases top and bottom).
            // geometricBounds = [left, top, right, bottom] where top > bottom.
            // dyPt positive = move down (top and bottom decrease).
            if (target && typeof target.translate === "function") {
                target.translate(dxPt, dyPt);
                return true;
            }
            SSM.Logger.warn("SpacingEngine.moveItemBy: no translateable item");
            return false;
        } catch (e) {
            SSM.Logger.warn("SpacingEngine.moveItemBy failed", e);
            return false;
        }
    }

    // Apply spacing to all sections using their resolved rules. Wrapped in a transaction
    // so partial operations can be rolled back on failure.
    function applyToSections(sections, rules, doc) {
        var results = [];
        var txnId = null;
        var itemsToSnapshot = [];
        var hasFailure = false;
        // Collect all anchor/target items for snapshot
        for (var s = 0; s < sections.length; s++) {
            var sec = sections[s];
            if (!sec.enabled || !sec.anchor || !sec.target) { continue; }
            itemsToSnapshot.push(sec.anchor);
            itemsToSnapshot.push(sec.target);
        }
        if (itemsToSnapshot.length > 0) {
            txnId = TransactionManager.begin(itemsToSnapshot, doc);
        }
        try {
            for (var s = 0; s < sections.length; s++) {
                var section = sections[s];
                if (!section.enabled || !section.anchor || !section.target) { continue; }
                // Resolve the specific rule for this section
                var rule = SSM.RuleEngine.resolveRuleForSection(section, rules);
                if (!rule || !rule.enabled) { continue; }
                var anchor = section.anchor.original || section.anchor;
                var target = section.target.original || section.target;
                var measurement = measureForRule(section, rule, doc);
                if (!measurement) { continue; }
                var targetPt = SSM.MeasurementNormalizer.targetGapToPoints(rule.targetGap, rule.unit);
                // Resolve AUTO to a concrete axis using the same rule as Preview.
                var effectiveDir = rule.direction;
                var effectiveMeasurement = measurement;
                if (effectiveDir === C.DIRECTIONS.AUTO) {
                    effectiveDir = resolveAutoDirection(measurement);
                    if (!effectiveDir) { continue; }
                    effectiveMeasurement = effectiveDir === C.DIRECTIONS.VERTICAL
                        ? measurement.vertical
                        : measurement.horizontal;
                }
                var effectiveRule = {
                    direction: effectiveDir,
                    anchorBehavior: rule.anchorBehavior || C.ANCHOR_BEHAVIORS.MOVE_LOWER
                };
                var result = applyToPairWithDirection(section.anchor, section.target, effectiveMeasurement, targetPt, effectiveRule, doc);
                result.sectionId = section.id;
                result.sectionName = section.name;
                result.ruleId = rule.id;
                result.ruleName = rule.name;
                results.push(result);
                if (!result.success) {
                    hasFailure = true;
                    break;
                }
            }
            if (hasFailure) {
                var rollbackOk = false;
                if (txnId) {
                    rollbackOk = TransactionManager.rollback();
                    if (!rollbackOk) {
                        SSM.Logger.error("Rollback FAILED after partial movement failure — positions may be inconsistent");
                    }
                }
                TemporaryObjectManager.cleanup(doc);
                return {
                    success: false,
                    rolledBack: rollbackOk,
                    error: rollbackOk ? "Partial movement failure — rolled back" : "Partial movement failure — rollback FAILED, positions may be inconsistent",
                    results: results
                };
            }
            if (txnId) { TransactionManager.commit(); }
            TemporaryObjectManager.cleanup(doc);
            return { success: true, results: results };
        } catch (e) {
            SSM.Logger.error("SpacingEngine.applyToSections failed, rolling back", e);
            var rollbackOk2 = false;
            if (txnId) {
                rollbackOk2 = TransactionManager.rollback();
                if (!rollbackOk2) {
                    SSM.Logger.error("Rollback FAILED after exception — positions may be inconsistent");
                }
            }
            TemporaryObjectManager.cleanup(doc);
            return {
                success: false,
                rolledBack: rollbackOk2,
                error: rollbackOk2 ? "Operation failed — rolled back" : "Operation failed — rollback FAILED, positions may be inconsistent",
                results: results
            };
        }
    }

    function applyToPairWithDirection(upperItem, lowerItem, measurement, targetGapPt, rule, doc) {
        var dir = rule.direction;
        var anchorBehavior = rule.anchorBehavior || C.ANCHOR_BEHAVIORS.MOVE_LOWER;
        // Resolve AUTO to a concrete axis using the same deterministic rule as Preview.
        if (dir === C.DIRECTIONS.AUTO) {
            dir = resolveAutoDirection(measurement);
            if (!dir) { return { success: false, error: "Cannot resolve AUTO direction" }; }
            measurement = dir === C.DIRECTIONS.VERTICAL
                ? measurement.vertical
                : measurement.horizontal;
        }
        if (dir === C.DIRECTIONS.BOTH && measurement.vertical && measurement.horizontal) {
            // Independent vertical and horizontal adjustments
            var vc = Calculator.calculate(measurement.vertical, targetGapPt);
            var hc = Calculator.calculate(measurement.horizontal, targetGapPt);
            var vm = Calculator.movementForAnchor(vc, anchorBehavior);
            var hm = Calculator.movementForAnchor(hc, anchorBehavior);
            // Apply vertical: move upper/lower items (Y axis)
            var vApplied = applyMovement(upperItem, vm.moveUpper, lowerItem, vm.moveLower, doc);
            // Apply horizontal: move items left/right (X axis)
            // For horizontal, upperItem = left item, lowerItem = right item
            var hApplied = applyHorizontalMovement(upperItem, lowerItem, hm, doc);
            var success = vApplied.success && hApplied.success;
            var error = null;
            if (!vApplied.success) { error = vApplied.error; }
            if (!hApplied.success && !error) { error = hApplied.error; }
            return {
                success: success,
                error: error,
                calculation: vc,
                movement: { moveUpper: vm.moveUpper, moveLower: vm.moveLower, moveLeft: hm.moveLeft, moveRight: hm.moveRight },
                upperItem: upperItem ? upperItem.id : null,
                lowerItem: lowerItem ? lowerItem.id : null,
                bothAxes: true,
                verticalResult: { calc: vc, movement: vm, applied: vApplied },
                horizontalResult: { calc: hc, movement: hm, applied: hApplied }
            };
        }
        // Single axis
        var calc = Calculator.calculate(measurement, targetGapPt);
        if (!calc) { return { success: false, error: "Cannot calculate spacing" }; }
        var movement = Calculator.movementForAnchor(calc, anchorBehavior);
        var applied = applyMovement(upperItem, movement.moveUpper, lowerItem, movement.moveLower, doc);
        return {
            success: applied.success,
            calculation: calc,
            movement: movement,
            error: applied.error,
            upperItem: upperItem ? upperItem.id : null,
            lowerItem: lowerItem ? lowerItem.id : null,
            bothAxes: false
        };
    }

    function applyHorizontalMovement(leftItem, rightItem, movement, doc) {
        var errors = [];
        // In Illustrator, translate(dx, dy): dx positive moves right.
        // Horizontal gap = rightItem.left - leftItem.right.
        // To increase gap, move rightItem right (+dx) or leftItem left (-dx).
        if (leftItem && movement.moveLeft !== 0) {
            // moveLeft: negative means move left item left (away from right item)
            var ok = moveItemBy(leftItem, movement.moveLeft, 0, doc);
            if (!ok) { errors.push("Failed to move left item " + (leftItem.name || leftItem.id)); }
        }
        if (rightItem && movement.moveRight !== 0) {
            // moveRight: positive means move right item right (away from left item)
            var ok2 = moveItemBy(rightItem, movement.moveRight, 0, doc);
            if (!ok2) { errors.push("Failed to move right item " + (rightItem.name || rightItem.id)); }
        }
        return { success: errors.length === 0, error: errors.length > 0 ? errors.join("; ") : null };
    }

    function measureForRule(section, rule, doc) {
        var anchor = section.anchor.original || section.anchor;
        var target = section.target.original || section.target;
        if (rule.direction === C.DIRECTIONS.VERTICAL || rule.direction === C.DIRECTIONS.AUTO) {
            if (rule.measurementMode === "visual") {
                var v = SSM.VisualGapEngine.visualVerticalGap(anchor, target, doc);
                if (rule.direction === C.DIRECTIONS.AUTO) {
                    var h = SSM.VisualGapEngine.visualHorizontalGap(anchor, target, doc);
                    // Always return {vertical, horizontal} shape for AUTO direction
                    if (v && h) { return { vertical: v, horizontal: h }; }
                    if (v) { return { vertical: v, horizontal: null }; }
                    if (h) { return { vertical: null, horizontal: h }; }
                    return null;
                }
                return v;
            }
            var v2 = SSM.ObjectGapEngine.verticalGap(anchor, target, rule.boundsType);
            if (rule.direction === C.DIRECTIONS.AUTO) {
                var h2 = SSM.ObjectGapEngine.horizontalGap(anchor, target, rule.boundsType);
                if (v2 && h2) { return { vertical: v2, horizontal: h2 }; }
                if (v2) { return { vertical: v2, horizontal: null }; }
                if (h2) { return { vertical: null, horizontal: h2 }; }
                return null;
            }
            return v2;
        }
        if (rule.direction === C.DIRECTIONS.HORIZONTAL) {
            if (rule.measurementMode === "visual") {
                return SSM.VisualGapEngine.visualHorizontalGap(anchor, target, doc);
            }
            return SSM.ObjectGapEngine.horizontalGap(anchor, target, rule.boundsType);
        }
        if (rule.direction === C.DIRECTIONS.BOTH) {
            var v = (rule.measurementMode === "visual")
                ? SSM.VisualGapEngine.visualVerticalGap(anchor, target, doc)
                : SSM.ObjectGapEngine.verticalGap(anchor, target, rule.boundsType);
            var h = (rule.measurementMode === "visual")
                ? SSM.VisualGapEngine.visualHorizontalGap(anchor, target, doc)
                : SSM.ObjectGapEngine.horizontalGap(anchor, target, rule.boundsType);
            if (!v || !h) { return null; }
            return { vertical: v, horizontal: h };
        }
        return null;
    }

    // Apply spacing using preview entries — preserves the exact rule, measurement
    // mode, bounds type, direction, unit, and anchor behavior from the preview.
    // Wrapped in a transaction for rollback protection.
    function applySelectedEntries(sections, rules, previewEntries, doc) {
        var results = [];
        var txnId = null;
        var itemsToSnapshot = [];
        var hasFailure = false;
        for (var s = 0; s < sections.length; s++) {
            var sec = sections[s];
            if (!sec.enabled || !sec.anchor || !sec.target) { continue; }
            itemsToSnapshot.push(sec.anchor);
            itemsToSnapshot.push(sec.target);
        }
        if (itemsToSnapshot.length > 0) {
            txnId = TransactionManager.begin(itemsToSnapshot, doc);
        }
        try {
            for (var s = 0; s < sections.length; s++) {
                var section = sections[s];
                if (!section.enabled || !section.anchor || !section.target) { continue; }
                // Find the matching preview entry for this section
                var entry = null;
                for (var e = 0; e < (previewEntries || []).length; e++) {
                    if (previewEntries[e].sectionId === section.id) {
                        entry = previewEntries[e];
                        break;
                    }
                }
                if (!entry) { continue; }
                // Use the SAME resolved rule from the preview entry.
                // Look up the rule from the passed rules array (not the internal registry)
                // so applySelectedEntries works with the same rules as the preview.
                var rule = null;
                for (var ri = 0; ri < (rules || []).length; ri++) {
                    if ((rules[ri]).id === entry.ruleId) {
                        rule = rules[ri];
                        break;
                    }
                }
                if (!rule || !rule.enabled) { continue; }
                var anchor = section.anchor.original || section.anchor;
                var target = section.target.original || section.target;
                // Re-measure using the same method as the preview.
                // For BOTH axes, obtain both vertical and horizontal measurements.
                var measurement = null;
                if (entry.resolvedDirection === C.DIRECTIONS.BOTH) {
                    if (entry.measurementMode === "visual") {
                        var v = SSM.VisualGapEngine.visualVerticalGap(anchor, target, doc);
                        var h = SSM.VisualGapEngine.visualHorizontalGap(anchor, target, doc);
                    } else {
                        var v = SSM.ObjectGapEngine.verticalGap(anchor, target, entry.boundsType);
                        var h = SSM.ObjectGapEngine.horizontalGap(anchor, target, entry.boundsType);
                    }
                    if (!v || !h) { continue; }
                    measurement = { vertical: v, horizontal: h };
                } else if (entry.measurementMode === "visual") {
                    if (entry.resolvedDirection === C.DIRECTIONS.HORIZONTAL) {
                        measurement = SSM.VisualGapEngine.visualHorizontalGap(anchor, target, doc);
                    } else {
                        measurement = SSM.VisualGapEngine.visualVerticalGap(anchor, target, doc);
                    }
                } else {
                    if (entry.resolvedDirection === C.DIRECTIONS.HORIZONTAL) {
                        measurement = SSM.ObjectGapEngine.horizontalGap(anchor, target, entry.boundsType);
                    } else {
                        measurement = SSM.ObjectGapEngine.verticalGap(anchor, target, entry.boundsType);
                    }
                }
                if (!measurement) { continue; }
                var targetPt = SSM.MeasurementNormalizer.targetGapToPoints(entry.targetGap, entry.unit);
                var result = applyToPairWithDirection(section.anchor, section.target, measurement, targetPt, {
                    direction: entry.resolvedDirection || entry.direction,
                    anchorBehavior: entry.anchorBehavior
                }, doc);
                result.sectionId = section.id;
                result.sectionName = section.name;
                result.ruleId = entry.ruleId;
                result.ruleName = entry.ruleName;
                results.push(result);
                if (!result.success) {
                    hasFailure = true;
                    break;
                }
            }
            if (hasFailure) {
                var rollbackOk = false;
                if (txnId) {
                    rollbackOk = TransactionManager.rollback();
                    if (!rollbackOk) {
                        SSM.Logger.error("Rollback FAILED after partial movement failure (applySelected) — positions may be inconsistent");
                    }
                }
                TemporaryObjectManager.cleanup(doc);
                return {
                    success: false,
                    rolledBack: rollbackOk,
                    error: rollbackOk ? "Partial movement failure — rolled back" : "Partial movement failure — rollback FAILED, positions may be inconsistent",
                    results: results
                };
            }
            if (txnId) { TransactionManager.commit(); }
            TemporaryObjectManager.cleanup(doc);
            return { success: true, results: results };
        } catch (e) {
            SSM.Logger.error("applySelectedEntries failed, rolling back", e);
            var rollbackOk2 = false;
            if (txnId) {
                rollbackOk2 = TransactionManager.rollback();
                if (!rollbackOk2) {
                    SSM.Logger.error("Rollback FAILED after exception (applySelected) — positions may be inconsistent");
                }
            }
            TemporaryObjectManager.cleanup(doc);
            return {
                success: false,
                rolledBack: rollbackOk2,
                error: rollbackOk2 ? "Operation failed — rolled back" : "Operation failed — rollback FAILED, positions may be inconsistent",
                results: results
            };
        }
    }

    return {
        applyToPair: applyToPair,
        applyMovement: applyMovement,
        moveItemBy: moveItemBy,
        applyToSections: applyToSections,
        applyToPairWithDirection: applyToPairWithDirection,
        applyHorizontalMovement: applyHorizontalMovement,
        applySelectedEntries: applySelectedEntries
    };
})();
