// Illustrator Smart Spacing Manager Pro
// Measurement/BoundsManager.jsx — Geometric/visible bounds normalization
var SSM = SSM || {};
SSM.BoundsManager = (function () {
    var C = SSM.Constants;
    // Normalize raw Illustrator bounds [left, top, right, bottom] into
    // {left, top, right, bottom, width, height, centerX, centerY}.
    // Illustrator's y increases upward; here top is the smaller y value
    // (visual top) when flattened for UI display.
    function normalize(bounds) {
        if (!bounds || bounds.length !== 4) {
            return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, centerX: 0, centerY: 0, valid: false };
        }
        var l = bounds[0], t = bounds[1], r = bounds[2], b = bounds[3];
        var left = Math.min(l, r);
        var right = Math.max(l, r);
        var bottom = Math.max(t, b);
        var top = Math.min(t, b);
        var width = right - left;
        var height = bottom - top;
        return {
            left: left, top: top, right: right, bottom: bottom,
            width: width, height: height,
            centerX: (left + right) / 2,
            centerY: (top + bottom) / 2,
            valid: width >= 0 && height >= 0
        };
    }
    function boundsOfItem(item, boundsType) {
        boundsType = boundsType || C.BOUNDS_TYPES.GEOMETRIC;
        // SerializeItem wrappers store the live object in .original
        var real = (item && item.original) ? item.original : item;
        var raw = null;
        try {
            if (boundsType === C.BOUNDS_TYPES.VISIBLE) {
                raw = real.visibleBounds;
                if (!raw) { raw = real.geometricBounds; }
            } else if (boundsType === C.BOUNDS_TYPES.CONTROL) {
                raw = real.controlBounds || real.geometricBounds;
            } else {
                raw = real.geometricBounds;
            }
        } catch (e) {
            raw = null;
        }
        if (!raw || raw.length !== 4) {
            return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, centerX: 0, centerY: 0, valid: false, source: "none" };
        }
        var norm = normalize(raw);
        norm.source = boundsType;
        norm.raw = raw;
        return norm;
    }
    function union(boundsList) {
        if (!boundsList || boundsList.length === 0) {
            return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, centerX: 0, centerY: 0, valid: false };
        }
        var first = true;
        var l, t, r, b;
        for (var i = 0; i < boundsList.length; i++) {
            var nb = boundsList[i];
            if (!nb || !nb.valid) { continue; }
            if (first) { l = nb.left; t = nb.top; r = nb.right; b = nb.bottom; first = false; }
            else {
                if (nb.left < l) { l = nb.left; }
                if (nb.top < t) { t = nb.top; }
                if (nb.right > r) { r = nb.right; }
                if (nb.bottom > b) { b = nb.bottom; }
            }
        }
        if (first) { return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, centerX: 0, centerY: 0, valid: false }; }
        return {
            left: l, top: t, right: r, bottom: b,
            width: r - l, height: b - t,
            centerX: (l + r) / 2, centerY: (t + b) / 2,
            valid: true
        };
    }
    function intersection(b1, b2) {
        var l = Math.max(b1.left, b2.left);
        var t = Math.max(b1.top, b2.top);
        var r = Math.min(b1.right, b2.right);
        var b = Math.min(b1.bottom, b2.bottom);
        var valid = l < r && t < b;
        return { left: l, top: t, right: r, bottom: b, width: r - l, height: b - t, valid: valid };
    }
    function contains(b1, b2) {
        return b2.left >= b1.left && b2.top >= b1.top &&
               b2.right <= b1.right && b2.bottom <= b1.bottom;
    }
    function overlap(b1, b2) {
        return !(b1.right <= b2.left || b2.right <= b1.left ||
                 b1.bottom <= b2.top || b2.bottom <= b1.top);
    }
    return {
        normalize: normalize,
        boundsOfItem: boundsOfItem,
        union: union,
        intersection: intersection,
        contains: contains,
        overlap: overlap
    };
})();
