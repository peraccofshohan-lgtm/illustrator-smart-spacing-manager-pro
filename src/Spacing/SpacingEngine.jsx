// Illustrator Smart Spacing Manager Pro
// Spacing/SpacingEngine.jsx — Apply spacing adjustments to document objects
var SSM = SSM || {};
SSM.SpacingEngine = (function () {
    var DM = SSM.DocumentManager;
    var BM = SSM.BoundsManager;
    var Calculator = SSM.SpacingCalculator;
    var PositionManager = SSM.PositionManager;
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
    function moveItemBy(itemRef, dxPt, dyPt, doc) {
        try {
            var item = itemRef.original || itemRef;
            if (!item) { return false; }
            // Illustrator translate(dx, dy): dy positive moves down in screen coordinates.
            // Illustrator's y increases upward, so to move an object down by dyPt (toward
            // smaller y / bottom), we translate by -dyPt in y.
            item.translate(dxPt, -dyPt);
            return true;
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
        // Collect all anchor/target items for snapshot
        for (var s = 0; s < sections.length; s++) {
            var sec = sections[s];
            if (!sec.enabled || !sec.anchor || !sec.target) { continue; }
            itemsToSnapshot.push(sec.anchor);
            itemsToSnapshot.push(sec.target);
        }
        if (itemsToSnapshot.length > 0) {
            txnId = TransactionManager.begin(itemsToSnapshot);
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
                var result = applyToPair(section.anchor, section.target, measurement, targetPt, rule.anchorBehavior, doc);
                result.sectionId = section.id;
                result.sectionName = section.name;
                result.ruleId = rule.id;
                result.ruleName = rule.name;
                results.push(result);
            }
            if (txnId) { TransactionManager.commit(); }
            TemporaryObjectManager.cleanup(doc);
            return { success: true, results: results };
        } catch (e) {
            SSM.Logger.error("SpacingEngine.applyToSections failed, rolling back", e);
            if (txnId) { TransactionManager.rollback(); }
            TemporaryObjectManager.cleanup(doc);
            return { success: false, error: String(e), results: results };
        }
    }
    function measureForRule(section, rule, doc) {
        var anchor = section.anchor.original || section.anchor;
        var target = section.target.original || section.target;
        if (rule.direction === C.DIRECTIONS.VERTICAL || rule.direction === C.DIRECTIONS.AUTO) {
            if (rule.measurementMode === "visual") {
                return SSM.VisualGapEngine.visualVerticalGap(anchor, target, doc);
            }
            return SSM.ObjectGapEngine.verticalGap(anchor, target, rule.boundsType);
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
            v.horizontal = h;
            return v;
        }
        return null;
    }
    return {
        applyToPair: applyToPair,
        applyMovement: applyMovement,
        moveItemBy: moveItemBy,
        applyToSections: applyToSections
    };
})();
