// Illustrator Smart Spacing Manager Pro
// Core/Utilities.jsx — Unit conversion, formatting, generic helpers
var SSM = SSM || {};
SSM.Utilities = (function () {
    var C = SSM.Constants;
    function convert(value, fromUnit, toUnit) {
        var fromUnitObj = C.UNITS[fromUnit] || C.UNITS.pt;
        var toUnitObj = C.UNITS[toUnit] || C.UNITS.pt;
        var pt = value * fromUnitObj.toPt;
        return pt * toUnitObj.fromPt;
    }
    function toPoints(value, unit) {
        var u = C.UNITS[unit] || C.UNITS.pt;
        return value * u.toPt;
    }
    function fromPoints(value, unit) {
        var u = C.UNITS[unit] || C.UNITS.pt;
        return value * u.fromPt;
    }
    function formatValue(valuePt, unit, precision) {
        var v = fromPoints(valuePt, unit);
        return SSM.Compat.formatNumber(v, precision !== undefined ? precision : 2) + " " + unit;
    }
    function parseValue(text, defaultUnit) {
        // Parses "40", "40pt", "12 mm", "1.5in" etc. Returns {value, unit, points}
        if (text === null || text === undefined) { return null; }
        var s = SSM.Compat.trim(String(text));
        if (s === "") { return null; }
        var m = s.match(/^([-+]?[0-9]*\.?[0-9]+)\s*(pt|mm|cm|in|px)?$/i);
        if (!m) { return null; }
        var num = parseFloat(m[1]);
        if (isNaN(num)) { return null; }
        var unit = m[2] ? m[2].toLowerCase() : (defaultUnit || "pt");
        if (!C.UNITS[unit]) { unit = defaultUnit || "pt"; }
        return { value: num, unit: unit, points: toPoints(num, unit) };
    }
    function deepClone(obj) {
        if (obj === null || obj === undefined) { return obj; }
        if (typeof obj !== "object") { return obj; }
        if (SSM.Compat.isArray(obj)) {
            var arr = [];
            for (var i = 0; i < obj.length; i++) { arr.push(deepClone(obj[i])); }
            return arr;
        }
        var out = {};
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) { out[k] = deepClone(obj[k]); }
        }
        return out;
    }
    function uniqueById(items) {
        var seen = {};
        var out = [];
        for (var i = 0; i < items.length; i++) {
            var id = items[i].id;
            if (!seen[id]) { seen[id] = true; out.push(items[i]); }
        }
        return out;
    }
    function indexOfId(items, id) {
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === id) { return i; }
        }
        return -1;
    }
    function sortByY(items, ascending) {
        var copy = items.slice();
        copy.sort(function (a, b) {
            var ya = a.bounds ? a.bounds[1] : 0;
            var yb = b.bounds ? b.bounds[1] : 0;
            return ascending ? (ya - yb) : (yb - ya);
        });
        return copy;
    }
    function sortByX(items, ascending) {
        var copy = items.slice();
        copy.sort(function (a, b) {
            var xa = a.bounds ? a.bounds[0] : 0;
            var xb = b.bounds ? b.bounds[0] : 0;
            return ascending ? (xa - xb) : (xb - xa);
        });
        return copy;
    }
    function escapeHtml(s) {
        s = String(s);
        return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }
    return {
        convert: convert,
        toPoints: toPoints,
        fromPoints: fromPoints,
        formatValue: formatValue,
        parseValue: parseValue,
        deepClone: deepClone,
        uniqueById: uniqueById,
        indexOfId: indexOfId,
        sortByY: sortByY,
        sortByX: sortByX,
        escapeHtml: escapeHtml,
        roundTo: SSM.Compat.roundTo,
        formatNumber: SSM.Compat.formatNumber
    };
})();
