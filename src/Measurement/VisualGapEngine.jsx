// Illustrator Smart Spacing Manager Pro
// Measurement/VisualGapEngine.jsx — Visual measurement via duplicate-outlining
var SSM = SSM || {};
SSM.VisualGapEngine = (function () {
    var BM = SSM.BoundsManager;
    var C = SSM.Constants;
    // Duplicate an item onto a temp layer, outline text duplicate, measure, then remove.
    function measureVisualBounds(item, doc) {
        if (!item) { return null; }
        var originalRef = item.original || item;
        var tempLayer = null;
        var dup = null;
        var outlined = null;
        var result = null;
        try {
            doc = doc || SSM.DocumentManager.getActiveDocument();
            if (!doc) { return null; }
            tempLayer = doc.layers.add();
            tempLayer.name = C.TEMP_LAYER_NAME;
            try {
                dup = originalRef.duplicate(tempLayer);
            } catch (e) {
                SSM.Logger.warn("VisualGapEngine: duplicate failed", e);
                if (tempLayer) { tempLayer.remove(); }
                return fallbackVisualBounds(item);
            }
            // Attempt to convert text to outlines where supported
            try {
                if (dup.typename === "TextFrame") {
                    dup.createOutline();
                }
            } catch (e) {
                SSM.Logger.warn("VisualGapEngine: outline failed, using frame bounds", e);
            }
            // Now measure the duplicate's visible bounds
            var rawBounds = null;
            try { rawBounds = dup.visibleBounds; } catch (e) { rawBounds = null; }
            if (!rawBounds || rawBounds.length !== 4) {
                try { rawBounds = dup.geometricBounds; } catch (e) { rawBounds = null; }
            }
            if (rawBounds && rawBounds.length === 4) {
                var nb = BM.normalize(rawBounds);
                nb.valid = true;
                result = {
                    mode: "visual",
                    boundsType: "visual",
                    bounds: nb,
                    rawBounds: rawBounds,
                    reliability: dup.typename === "TextFrame" ? "approximate" : "exact",
                    method: "visualOutline",
                    approximation: dup.typename === "TextFrame" ? true : false,
                    unit: "pt"
                };
            } else {
                result = fallbackVisualBounds(item);
            }
        } catch (e) {
            SSM.Logger.warn("VisualGapEngine: measurement failed", e);
            result = fallbackVisualBounds(item);
        } finally {
            if (tempLayer) {
                try { tempLayer.remove(); } catch (e2) { SSM.Logger.warn("VisualGapEngine: temp cleanup failed", e2); }
            }
        }
        return result;
    }
    function fallbackVisualBounds(item) {
        var b = BM.boundsOfItem(item, C.BOUNDS_TYPES.GEOMETRIC);
        return {
            mode: "visual",
            boundsType: "geometricFallback",
            bounds: b,
            rawBounds: b.raw,
            reliability: "approximate",
            method: "geometricFallback",
            approximation: true,
            unit: "pt"
        };
    }
    function visualVerticalGap(upperItem, lowerItem, doc) {
        if (!upperItem || !lowerItem) { return null; }
        var ub = measureVisualBounds(upperItem, doc);
        var lb = measureVisualBounds(lowerItem, doc);
        if (!ub || !lb || !ub.bounds || !lb.bounds) { return null; }
        var gap = lb.bounds.top - ub.bounds.bottom;
        var overlaps = gap < 0;
        var reliable = ub.reliability === "exact" && lb.reliability === "exact";
        return {
            mode: "visual",
            gap: gap,
            absGap: Math.abs(gap),
            overlaps: overlaps,
            signedGap: gap,
            upperBottom: ub.bounds.bottom,
            lowerTop: lb.bounds.top,
            unit: "pt",
            reliability: reliable ? "exact" : "approximate",
            method: "visualOutline",
            upperBounds: ub.bounds,
            lowerBounds: lb.bounds,
            upperReliability: ub.reliability,
            lowerReliability: lb.reliability
        };
    }
    function visualHorizontalGap(leftItem, rightItem, doc) {
        if (!leftItem || !rightItem) { return null; }
        var lb = measureVisualBounds(leftItem, doc);
        var rb = measureVisualBounds(rightItem, doc);
        if (!lb || !rb || !lb.bounds || !rb.bounds) { return null; }
        var gap = rb.bounds.left - lb.bounds.right;
        var overlaps = gap < 0;
        var reliable = lb.reliability === "exact" && rb.reliability === "exact";
        return {
            mode: "visual",
            gap: gap,
            absGap: Math.abs(gap),
            overlaps: overlaps,
            signedGap: gap,
            leftRight: lb.bounds.right,
            rightLeft: rb.bounds.left,
            unit: "pt",
            reliability: reliable ? "exact" : "approximate",
            method: "visualOutline",
            leftBounds: lb.bounds,
            rightBounds: rb.bounds,
            leftReliability: lb.reliability,
            rightReliability: rb.reliability
        };
    }
    return {
        measureVisualBounds: measureVisualBounds,
        visualVerticalGap: visualVerticalGap,
        visualHorizontalGap: visualHorizontalGap,
        fallbackVisualBounds: fallbackVisualBounds
    };
})();
