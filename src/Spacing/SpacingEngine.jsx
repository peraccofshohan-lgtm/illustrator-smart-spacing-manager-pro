// Illustrator Smart Spacing Manager Pro
// Spacing/SpacingEngine.jsx — Apply spacing adjustments to document objects
var SSM = SSM || {};
SSM.SpacingEngine = (function () {
    var DM = SSM.DocumentManager;
    var BM = SSM.BoundsManager;
    var Calculator = SSM.SpacingCalculator;
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
            // Illustrator: move (dx, dy) where dy positive moves down (in screen coordinates)
            item.translate(dxPt, -dyPt); // translate uses top-left origin, y down
            return true;
        } catch (e) {
            SSM.Logger.warn("SpacingEngine.moveItemBy failed", e);
            return false;
        }
    }
    function applyToSections(sections, rules, doc) {
        var results = [];
        for (var s = 0; s < sections.length; s++) {
            var section = sections[s];
            if (!section.enabled) { continue; }
            var anchor = section.anchor;
            var target = section.target;
            if (!anchor || !target) { continue; }
            // Find applicable rule for this section (simplified: first enabled rule matching scope)
            var rule = null;
            for (var r = 0; r < rules.length; r++) {
                if (rules[r].enabled && rules[r].scope === "document") { rule = rules[r]; break; }
            }
            if (!rule) { continue; }
            var measurement = null;
            if (rule.measurementMode === "visual") {
                measurement = SSM.VisualGapEngine.visualVerticalGap(anchor.original, target.original, doc);
            } else {
                measurement = SSM.ObjectGapEngine.verticalGap(anchor.original, target.original, rule.boundsType);
            }
            if (!measurement) { continue; }
            var targetPt = SSM.MeasurementNormalizer.targetGapToPoints(rule.targetGap, rule.unit);
            var result = applyToPair(anchor, target, measurement, targetPt, rule.anchorBehavior, doc);
            result.sectionId = section.id;
            result.sectionName = section.name;
            results.push(result);
        }
        return results;
    }
    return {
        applyToPair: applyToPair,
        applyMovement: applyMovement,
        moveItemBy: moveItemBy,
        applyToSections: applyToSections
    };
})();
