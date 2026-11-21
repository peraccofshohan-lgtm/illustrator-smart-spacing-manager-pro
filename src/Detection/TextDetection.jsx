// Illustrator Smart Spacing Manager Pro
// Detection/TextDetection.jsx — Text content matching detection
var SSM = SSM || {};
SSM.TextDetection = (function () {
    var DM = SSM.DocumentManager;
    var C = SSM.Constants;
    var Compat = SSM.Compat;
    function matchesText(text, pattern, matchType, caseSensitive, wholeWord, useRegex) {
        if (text === null || text === undefined || pattern === null || pattern === undefined) { return false; }
        var t = caseSensitive ? String(text) : String(text).toLowerCase();
        var p = caseSensitive ? String(pattern) : String(pattern).toLowerCase();
        if (wholeWord && matchType !== C.TEXT_MATCH_TYPES.REGEX) {
            // word boundary-ish
            var re = new RegExp("\\b" + escapeRegExp(p) + "\\b", caseSensitive ? "" : "i");
            return re.test(t);
        }
        switch (matchType) {
            case C.TEXT_MATCH_TYPES.EXACT: return t === p;
            case C.TEXT_MATCH_TYPES.CONTAINS: return t.indexOf(p) !== -1;
            case C.TEXT_MATCH_TYPES.STARTS_WITH: return Compat.startsWith(t, p);
            case C.TEXT_MATCH_TYPES.ENDS_WITH: return Compat.endsWith(t, p);
            case C.TEXT_MATCH_TYPES.PATTERN: return wildcardMatch(t, p, caseSensitive);
            case C.TEXT_MATCH_TYPES.REGEX:
                if (!useRegex) { return false; }
                var re = Compat.safeRegExp(pattern, caseSensitive ? "" : "i");
                if (!re) { return false; }
                return re.test(t);
            default: return t === p;
        }
    }
    function escapeRegExp(s) {
        return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    function wildcardMatch(text, pattern, caseSensitive) {
        // Convert simple * ? wildcards to regex
        var regex = "^";
        for (var i = 0; i < pattern.length; i++) {
            var c = pattern.charAt(i);
            if (c === "*") { regex += ".*"; }
            else if (c === "?") { regex += "."; }
            else { regex += escapeRegExp(c); }
        }
        regex += "$";
        var re = Compat.safeRegExp(regex, caseSensitive ? "" : "i");
        if (!re) { return false; }
        return re.test(text);
    }
    function run(doc, config) {
        doc = doc || DM.getActiveDocument();
        if (!doc) { return { items: [], warning: "No active document" }; }
        config = config || {};
        var pattern = config.pattern || "";
        var matchType = config.matchType || C.TEXT_MATCH_TYPES.CONTAINS;
        var caseSensitive = config.caseSensitive !== undefined ? config.caseSensitive : false;
        var wholeWord = config.wholeWord !== undefined ? config.wholeWord : false;
        var useRegex = config.useRegex !== undefined ? config.useRegex : true;
        var items = [];
        var warnings = [];
        try {
            var pageItems = DM.getPageItems(doc);
            for (var i = 0; i < pageItems.length; i++) {
                var item = pageItems[i];
                if (!item || !item.original) { continue; }
                var text = null;
                try {
                    if (item.original.typename === "TextFrame") {
                        text = item.original.contents;
                    }
                } catch (e) { text = null; }
                if (text === null || text === "") { continue; }
                if (matchesText(text, pattern, matchType, caseSensitive, wholeWord, useRegex)) {
                    item.method = C.DETECTION_METHODS.TEXT;
                    item.sectionRole = null;
                    item.sectionGroup = null;
                    item.matchText = text;
                    item.matchType = matchType;
                    items.push(item);
                }
            }
        } catch (e) {
            warnings.push("Text detection error: " + String(e));
            SSM.Logger.warn("TextDetection.run failed", e);
        }
        return { items: items, warnings: warnings };
    }
    return {
        run: run,
        matchesText: matchesText
    };
})();
