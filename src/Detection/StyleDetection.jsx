// Illustrator Smart Spacing Manager Pro
// Detection/StyleDetection.jsx — Style/typography attribute matching
var SSM = SSM || {};
SSM.StyleDetection = (function () {
    var DM = SSM.DocumentManager;
    var C = SSM.Constants;
    function attrMatches(item, attr, value, tolerance) {
        if (!item || !item.original) { return false; }
        var actual = null;
        try {
            switch (attr) {
                case "fontFamily": actual = item.original.textFont ? item.original.textFont.name : null; break;
                case "fontStyle": actual = item.original.textFont ? item.original.textFont.style : null; break;
                case "fontSize": actual = item.original.size; break;
                case "fillColor": actual = colorToString(item.original.fillColor); break;
                case "strokeColor": actual = colorToString(item.original.strokeColor); break;
                case "strokeWeight": actual = item.original.strokeWidth; break;
                case "opacity": actual = item.original.opacity; break;
                case "objectType": actual = item.type; break;
                default: actual = null;
            }
        } catch (e) {
            SSM.Logger.warn("StyleDetection.attrMatches: " + attr, e);
            return false;
        }
        if (actual === null || actual === undefined) { return false; }
        if (tolerance !== undefined && typeof actual === "number" && typeof value === "number") {
            return Math.abs(actual - value) <= (tolerance || 0);
        }
        if (typeof actual === "string" && typeof value === "string") {
            return actual.toLowerCase() === value.toLowerCase();
        }
        return String(actual) === String(value);
    }
    function colorToString(color) {
        if (!color) { return "none"; }
        try {
            var t = color.typename;
            if (t === "RGBColor") return "rgb(" + color.red + "," + color.green + "," + color.blue + ")";
            if (t === "CMYKColor") return "cmyk(" + color.cyan + "," + color.magenta + "," + color.yellow + "," + color.black + ")";
            if (t === "SpotColor") return "spot(" + (color.spot && color.spot.name ? color.spot.name : "unknown") + ")";
            if (t === "GradientColor") return "gradient";
            if (t === "PatternColor") return "pattern";
            return String(t);
        } catch (e) { return "unknown"; }
    }
    function run(doc, config) {
        doc = doc || DM.getActiveDocument();
        if (!doc) { return { items: [], warning: "No active document" }; }
        config = config || {};
        var criteria = config.criteria || []; // [{attr, value, tolerance}]
        var requireAll = config.requireAll !== undefined ? config.requireAll : true;
        var items = [];
        var warnings = [];
        try {
            var pageItems = DM.getPageItems(doc);
            for (var i = 0; i < pageItems.length; i++) {
                var item = pageItems[i];
                if (!item || !item.original) { continue; }
                var matchCount = 0;
                for (var c = 0; c < criteria.length; c++) {
                    var crit = criteria[c];
                    if (attrMatches(item, crit.attr, crit.value, crit.tolerance)) { matchCount++; }
                }
                var matched = requireAll ? (matchCount === criteria.length) : (matchCount > 0);
                if (matched && criteria.length > 0) {
                    item.method = C.DETECTION_METHODS.STYLE;
                    item.sectionRole = null;
                    item.sectionGroup = null;
                    item.criteriaMatched = matchCount;
                    items.push(item);
                }
            }
        } catch (e) {
            warnings.push("Style detection error: " + String(e));
            SSM.Logger.warn("StyleDetection.run failed", e);
        }
        return { items: items, warnings: warnings };
    }
    return {
        run: run,
        attrMatches: attrMatches
    };
})();
