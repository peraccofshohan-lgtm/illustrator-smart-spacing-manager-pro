// Illustrator Smart Spacing Manager Pro
// Measurement/MeasurementNormalizer.jsx — Unit conversion & precision for measurements
var SSM = SSM || {};
SSM.MeasurementNormalizer = (function () {
    var U = SSM.Utilities;
    function normalizeGap(measurement, targetUnit, precision) {
        if (!measurement) { return null; }
        var pt = measurement.gap;
        var v = U.fromPoints(pt, targetUnit);
        var absV = U.fromPoints(Math.abs(pt), targetUnit);
        return {
            originalPt: pt,
            value: U.roundTo(v, precision !== undefined ? precision : 2),
            absValue: U.roundTo(absV, precision !== undefined ? precision : 2),
            unit: targetUnit,
            precision: precision !== undefined ? precision : 2,
            overlaps: measurement.overlaps,
            signedGap: measurement.signedGap,
            signedValue: U.roundTo(v, precision !== undefined ? precision : 2),
            display: U.formatValue(pt, targetUnit, precision !== undefined ? precision : 2)
        };
    }
    function targetGapToPoints(targetValue, unit) {
        return U.toPoints(targetValue, unit);
    }
    function adjustmentNeeded(currentPt, targetPt) {
        var diff = targetPt - currentPt;
        return {
            currentPt: currentPt,
            targetPt: targetPt,
            differencePt: diff,
            absDifference: Math.abs(diff),
            moveUp: diff > 0,
            moveDown: diff < 0
        };
    }
    function roundForDisplay(valuePt, unit, precision) {
        return U.formatValue(valuePt, unit, precision);
    }
    return {
        normalizeGap: normalizeGap,
        targetGapToPoints: targetGapToPoints,
        adjustmentNeeded: adjustmentNeeded,
        roundForDisplay: roundForDisplay
    };
})();
