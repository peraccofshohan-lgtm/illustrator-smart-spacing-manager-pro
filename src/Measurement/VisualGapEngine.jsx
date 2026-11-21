// Illustrator Smart Spacing Manager Pro
// Measurement/VisualGapEngine.jsx — Visual measurement via duplicate-outlining
// Strategy: duplicate the item into a temporary layer, outline the duplicate
// (text frames only), measure the outlined geometry, then remove all temporary
// objects. The original item is never modified. Measurements from outlined text
// are treated as approximate because ExtendScript cannot reliably recover exact
// glyph boundaries for all scripts and formatting cases.
var SSM = SSM || {};
SSM.VisualGapEngine = (function () {
    var BM = SSM.BoundsManager;
    var C = SSM.Constants;
    var TEMP_LAYER_NAME = C.TEMP_LAYER_NAME;
    // Duplicate an item onto a temp layer, outline text duplicate, measure, then remove.
    // Returns {bounds, reliability, method, approximation, rawBounds} or null.
    function measureVisualBounds(item, doc) {
        if (!item) { return null; }
        var originalRef = item.original || item;
        var tempLayer = null;
        var dup = null;
        var result = null;
        var outliningAttempted = false;
        var outliningSucceeded = false;
        try {
            doc = doc || SSM.DocumentManager.getActiveDocument();
            if (!doc) { return null; }
            // Create a dedicated temporary measurement layer
            tempLayer = doc.layers.add();
            tempLayer.name = TEMP_LAYER_NAME;
            try {
                dup = originalRef.duplicate(tempLayer);
            } catch (e) {
                SSM.Logger.warn("VisualGapEngine: duplicate failed", e);
                if (tempLayer) {
                    try { tempLayer.remove(); } catch (e2) { /* ignore */ }
                }
                return fallbackVisualBounds(item);
            }
            // Attempt to convert text duplicate to outlines where supported.
            // capture the return value of createOutline (the outlined artwork)
            try {
                outliningAttempted = true;
                if (dup.typename === "TextFrame") {
                    var outlined = dup.createOutline();
                    if (outlined) {
                        outliningSucceeded = true;
                        // Measure the outlined geometry result, not the original duplicate
                        dup = outlined;
                    }
                }
            } catch (e) {
                SSM.Logger.warn("VisualGapEngine: outline failed, using frame bounds", e);
            }
            // Measure the (possibly outlined) duplicate's visible bounds
            var rawBounds = null;
            try { rawBounds = dup.visibleBounds; } catch (e) { rawBounds = null; }
            if (!rawBounds || rawBounds.length !== 4) {
                try { rawBounds = dup.geometricBounds; } catch (e) { rawBounds = null; }
            }
            if (rawBounds && rawBounds.length === 4) {
                var nb = BM.normalize(rawBounds);
                nb.valid = true;
                // Text-frame visual measurement is approximate unless we can confirm
                // exact glyph geometry. createOutline on a duplicate is our best effort;
                // we mark it approximate to remain honest about limitations.
                var isText = (originalRef.typename === "TextFrame");
                result = {
                    mode: "visual",
                    boundsType: "visual",
                    bounds: nb,
                    rawBounds: rawBounds,
                    reliability: (isText && outliningSucceeded) ? "approximate" : (isText ? "approximate" : "exact"),
                    method: "visualOutline",
                    approximation: isText ? true : false,
                    outliningAttempted: outliningAttempted,
                    outliningSucceeded: outliningSucceeded,
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
            // dup is owned by tempLayer; removing the layer removes dup.
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
            outliningAttempted: false,
            outliningSucceeded: false,
            unit: "pt"
        };
    }
    function visualVerticalGap(upperItem, lowerItem, doc) {
        if (!upperItem || !lowerItem) { return null; }
        var ub = measureVisualBounds(upperItem, doc);
        var lb = measureVisualBounds(lowerItem, doc);
        if (!ub || !lb || !ub.bounds || !lb.bounds) { return null; }
        // Gap = UpperObjectBottom - LowerObjectTop
        var gap = ub.bounds.bottom - lb.bounds.top;
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
            lowerReliability: lb.reliability,
            upperOutliningSucceeded: ub.outliningSucceeded,
            lowerOutliningSucceeded: lb.outliningSucceeded
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
            rightReliability: rb.reliability,
            leftOutliningSucceeded: lb.outliningSucceeded,
            rightOutliningSucceeded: rb.outliningSucceeded
        };
    }
    return {
        measureVisualBounds: measureVisualBounds,
        visualVerticalGap: visualVerticalGap,
        visualHorizontalGap: visualHorizontalGap,
        fallbackVisualBounds: fallbackVisualBounds
    };
})();
