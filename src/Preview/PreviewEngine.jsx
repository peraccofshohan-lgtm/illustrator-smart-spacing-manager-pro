// Illustrator Smart Spacing Manager Pro
// Preview/PreviewEngine.jsx — Compute preview entries without modifying document
var SSM = SSM || {};
SSM.PreviewEngine = (function () {
    var C = SSM.Constants;
    var Normalizer = SSM.MeasurementNormalizer;
    function buildPreview(sections, rules, doc) {
        var entries = [];
        for (var s = 0; s < sections.length; s++) {
            var section = sections[s];
            if (!section.enabled || !section.anchor || !section.target) { continue; }
            // Resolve the specific rule for this section deterministically
            var rule = SSM.RuleEngine.resolveRuleForSection(section, rules);
            if (!rule || !rule.enabled) { continue; }
            var measurement = measureForRule(section, rule, doc);
            if (!measurement) { continue; }
            var targetPt = SSM.MeasurementNormalizer.targetGapToPoints(rule.targetGap, rule.unit);
            var calc = SSM.SpacingCalculator.calculate(measurement, targetPt);
            var movement = SSM.SpacingCalculator.movementForAnchor(calc, rule.anchorBehavior);
            var entry = {
                id: SSM.Compat.uid("prev"),
                sectionId: section.id,
                sectionName: section.name,
                anchorId: section.anchor.id,
                targetId: section.target.id,
                anchorName: section.anchor.name,
                targetName: section.target.name,
                ruleId: rule.id,
                ruleName: rule.name,
                detectionMethod: rule.detectionMethod,
                measurementMode: rule.measurementMode,
                boundsType: rule.boundsType,
                direction: rule.direction,
                anchorBehavior: rule.anchorBehavior,
                unit: rule.unit,
                precision: rule.precision || 2,
                currentGap: calc.currentGapPt,
                targetGap: calc.targetGapPt,
                difference: calc.differencePt,
                absDifference: calc.absDifference,
                moveUpper: movement.moveUpper,
                moveLower: movement.moveLower,
                overlaps: calc.overlaps,
                reliability: measurement.reliability || "exact",
                method: measurement.method || "objectGap",
                warning: null,
                applied: false
            };
            entry.currentDisplay = Normalizer.roundForDisplay(calc.currentGapPt, rule.unit, entry.precision);
            entry.targetDisplay = Normalizer.roundForDisplay(calc.targetGapPt, rule.unit, entry.precision);
            entry.diffDisplay = Normalizer.roundForDisplay(calc.absDifference, rule.unit, entry.precision);
            if (calc.overlaps) {
                entry.warning = "Objects overlap (negative gap).";
            }
            if (entry.reliability === "approximate") {
                entry.warning = (entry.warning ? entry.warning + " " : "") + "Measurement is approximate.";
            }
            entries.push(entry);
        }
        return entries;
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
            // Return combined; use vertical as primary for gap value
            v.horizontal = h;
            return v;
        }
        return null;
    }
    return {
        buildPreview: buildPreview
    };
})();
