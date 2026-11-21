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
            var rule = findRule(rules, section);
            if (!rule || !rule.enabled) { continue; }
            var measurement = null;
            if (rule.measurementMode === "visual") {
                measurement = SSM.VisualGapEngine.visualVerticalGap(section.anchor.original, section.target.original, doc);
            } else {
                measurement = SSM.ObjectGapEngine.verticalGap(section.anchor.original, section.target.original, rule.boundsType);
            }
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
                detectionMethod: section.anchor.detectionReasons ? section.anchor.detectionReasons.join(", ") : rule.detectionMethod,
                measurementMode: rule.measurementMode,
                direction: rule.direction,
                currentGap: calc.currentGapPt,
                targetGap: calc.targetGapPt,
                difference: calc.differencePt,
                absDifference: calc.absDifference,
                moveUpper: movement.moveUpper,
                moveLower: movement.moveLower,
                unit: rule.unit,
                precision: rule.precision || 2,
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
    function findRule(rules, section) {
        // Simplest: return first enabled rule; in future match by scope/detection
        for (var i = 0; i < rules.length; i++) {
            if (rules[i].enabled) { return rules[i]; }
        }
        return null;
    }
    return {
        buildPreview: buildPreview
    };
})();
