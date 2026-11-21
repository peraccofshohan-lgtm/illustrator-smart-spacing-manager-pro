// Illustrator Smart Spacing Manager Pro
// Spacing/SpacingCalculator.jsx — Gap delta computation
var SSM = SSM || {};
SSM.SpacingCalculator = (function () {
    function calculate(measurement, targetGapPt) {
        if (!measurement) { return null; }
        var current = measurement.gap;
        var diff = targetGapPt - current;
        return {
            currentGapPt: current,
            targetGapPt: targetGapPt,
            differencePt: diff,
            absDifference: Math.abs(diff),
            moveAmount: diff,
            direction: diff > 0 ? "increase" : (diff < 0 ? "decrease" : "none"),
            overlaps: measurement.overlaps
        };
    }
    function movementForAnchor(calc, anchorBehavior) {
        if (!calc) { return null; }
        var move = calc.moveAmount;
        var result = {
            moveUpper: 0,
            moveLower: 0,
            anchorBehavior: anchorBehavior || "moveLower"
        };
        switch (anchorBehavior) {
            case "moveLower":
                result.moveLower = move;
                break;
            case "moveUpper":
                result.moveUpper = -move;
                break;
            case "keepFirst":
                result.moveLower = move;
                break;
            case "keepLast":
                result.moveUpper = -move;
                break;
            case "symmetric":
                result.moveUpper = -move / 2;
                result.moveLower = move / 2;
                break;
            default:
                result.moveLower = move;
        }
        return result;
    }
    return {
        calculate: calculate,
        movementForAnchor: movementForAnchor
    };
})();
