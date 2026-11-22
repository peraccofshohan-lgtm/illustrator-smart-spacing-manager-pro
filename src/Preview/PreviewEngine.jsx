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
            var calc = computeCalculation(measurement, rule, targetPt);
            if (!calc) { continue; }
            var movement = computeMovement(calc, rule);
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
                resolvedDirection: calc.resolvedDirection || rule.direction,
                anchorBehavior: rule.anchorBehavior,
                unit: rule.unit,
                precision: rule.precision || 2,
                currentGap: calc.currentGapPt,
                targetGap: calc.targetGapPt,
                difference: calc.differencePt,
                absDifference: calc.absDifference,
                moveUpper: movement.moveUpper,
                moveLower: movement.moveLower,
                moveLeft: movement.moveLeft,
                moveRight: movement.moveRight,
                overlaps: calc.overlaps,
                reliability: measurement.reliability || "exact",
                method: measurement.method || "objectGap",
                warning: null,
                applied: false,
                vertical: calc.vertical,
                horizontal: calc.horizontal
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
    function computeCalculation(measurement, rule, targetPt) {
        var dir = rule.direction;
        var resolvedDirection = dir;
        var vertical = null;
        var horizontal = null;
        var currentGap = 0;
        var targetGapPt = targetPt;
        var difference = 0;
        var overlaps = false;

        if (dir === C.DIRECTIONS.VERTICAL) {
            vertical = measurement;
            if (!vertical) { return null; }
            currentGap = vertical.gap;
            overlaps = vertical.overlaps;
            difference = targetPt - currentGap;
        } else if (dir === C.DIRECTIONS.HORIZONTAL) {
            horizontal = measurement;
            if (!horizontal) { return null; }
            currentGap = horizontal.gap;
            overlaps = horizontal.overlaps;
            difference = targetPt - currentGap;
        } else if (dir === C.DIRECTIONS.BOTH) {
            vertical = measurement.vertical;
            horizontal = measurement.horizontal;
            if (!vertical || !horizontal) { return null; }
            currentGap = vertical.gap; // primary display value
            overlaps = vertical.overlaps || horizontal.overlaps;
            difference = targetPt - vertical.gap;
        } else if (dir === C.DIRECTIONS.AUTO) {
            var v = measurement.vertical;
            var h = measurement.horizontal;
            if (!v && !h) { return null; }
            // Genuine auto-detect: choose the axis with the larger absolute gap.
            // If only one axis is available, use that one.
            if (v && h) {
                if (Math.abs(v.gap) >= Math.abs(h.gap)) {
                    resolvedDirection = C.DIRECTIONS.VERTICAL;
                    vertical = v;
                } else {
                    resolvedDirection = C.DIRECTIONS.HORIZONTAL;
                    horizontal = h;
                }
            } else if (v) {
                resolvedDirection = C.DIRECTIONS.VERTICAL;
                vertical = v;
            } else {
                resolvedDirection = C.DIRECTIONS.HORIZONTAL;
                horizontal = h;
            }
            var m = resolvedDirection === C.DIRECTIONS.VERTICAL ? vertical : horizontal;
            if (!m) { return null; }
            currentGap = m.gap;
            overlaps = m.overlaps;
            difference = targetPt - currentGap;
        } else {
            return null;
        }

        return {
            resolvedDirection: resolvedDirection,
            vertical: vertical,
            horizontal: horizontal,
            currentGapPt: currentGap,
            targetGapPt: targetGapPt,
            differencePt: difference,
            absDifference: Math.abs(difference),
            overlaps: overlaps,
            moveUp: difference > 0,
            moveDown: difference < 0
        };
    }
    function computeMovement(calc, rule) {
        var anchorBehavior = rule.anchorBehavior || C.ANCHOR_BEHAVIORS.MOVE_LOWER;
        var dir = calc.resolvedDirection || rule.direction;
        var result = {
            moveUpper: 0,
            moveLower: 0,
            moveLeft: 0,
            moveRight: 0,
            anchorBehavior: anchorBehavior
        };
        // Vertical movement
        var vDiff = calc.differencePt;
        switch (anchorBehavior) {
            case "moveLower":
                result.moveLower = vDiff;
                break;
            case "moveUpper":
                result.moveUpper = -vDiff;
                break;
            case "keepFirst":
                result.moveLower = vDiff;
                break;
            case "keepLast":
                result.moveUpper = -vDiff;
                break;
            case "symmetric":
                result.moveUpper = -vDiff / 2;
                result.moveLower = vDiff / 2;
                break;
            default:
                result.moveLower = vDiff;
        }
        // Horizontal movement (only for BOTH axes)
        if (dir === C.DIRECTIONS.BOTH && calc.horizontal) {
            var hDiff = calc.targetGapPt - calc.horizontal.gap;
            switch (anchorBehavior) {
                case "moveLower":
                    result.moveRight = hDiff;
                    break;
                case "moveUpper":
                    result.moveLeft = -hDiff;
                    break;
                case "keepFirst":
                    result.moveRight = hDiff;
                    break;
                case "keepLast":
                    result.moveLeft = -hDiff;
                    break;
                case "symmetric":
                    result.moveLeft = -hDiff / 2;
                    result.moveRight = hDiff / 2;
                    break;
                default:
                    result.moveRight = hDiff;
            }
        }
        return result;
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
                    // so computeCalculation can consistently resolve the axis.
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
    return {
        buildPreview: buildPreview
    };
})();
