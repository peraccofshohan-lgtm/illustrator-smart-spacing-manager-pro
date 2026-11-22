// Illustrator Smart Spacing Manager Pro
// Measurement/ObjectGapEngine.jsx — Object-to-object gap measurement
// Coordinate convention: Illustrator geometricBounds = [left, top, right, bottom]
// where top > bottom. Vertical gap = upperObject.bottom - lowerObject.top.
// Positive = separated, zero = touching, negative = overlap.
var SSM = SSM || {};
SSM.ObjectGapEngine = (function () {
    var BM = SSM.BoundsManager;
    var C = SSM.Constants;
    function verticalGap(upperItem, lowerItem, boundsType) {
        if (!upperItem || !lowerItem) { return null; }
        var ub = BM.boundsOfItem(upperItem, boundsType);
        var lb = BM.boundsOfItem(lowerItem, boundsType);
        if (!ub.valid || !lb.valid) { return null; }
        // Gap = UpperObjectBottom - LowerObjectTop
        // Positive = separated, zero = touching, negative = overlap
        var gap = ub.bottom - lb.top;
        var overlaps = gap < 0;
        return {
            mode: "object",
            boundsType: boundsType,
            gap: gap,
            absGap: Math.abs(gap),
            overlaps: overlaps,
            signedGap: gap,
            upperBottom: ub.bottom,
            lowerTop: lb.top,
            unit: "pt",
            reliability: "exact",
            method: "objectGap",
            upperBounds: ub,
            lowerBounds: lb
        };
    }
    function horizontalGap(leftItem, rightItem, boundsType) {
        if (!leftItem || !rightItem) { return null; }
        var lb = BM.boundsOfItem(leftItem, boundsType);
        var rb = BM.boundsOfItem(rightItem, boundsType);
        if (!lb.valid || !rb.valid) { return null; }
        // Gap = RightObjectLeft - LeftObjectRight
        var gap = rb.left - lb.right;
        var overlaps = gap < 0;
        return {
            mode: "object",
            boundsType: boundsType,
            gap: gap,
            absGap: Math.abs(gap),
            overlaps: overlaps,
            signedGap: gap,
            leftRight: lb.right,
            rightLeft: rb.left,
            unit: "pt",
            reliability: "exact",
            method: "objectGap",
            leftBounds: lb,
            rightBounds: rb
        };
    }
    function bothAxes(a, b, boundsType) {
        return {
            vertical: verticalGap(a, b, boundsType),
            horizontal: horizontalGap(a, b, boundsType)
        };
    }
    function detectDirection(gapVertical, gapHorizontal) {
        // If one axis dominates significantly, detect that direction
        if (!gapVertical && !gapHorizontal) { return null; }
        var va = gapVertical ? Math.abs(gapVertical.gap) : 0;
        var ha = gapHorizontal ? Math.abs(gapHorizontal.gap) : 0;
        if (va === 0 && ha === 0) { return null; }
        if (va >= ha) { return C.DIRECTIONS.VERTICAL; }
        return C.DIRECTIONS.HORIZONTAL;
    }
    return {
        verticalGap: verticalGap,
        horizontalGap: horizontalGap,
        bothAxes: bothAxes,
        detectDirection: detectDirection
    };
})();
