// Illustrator Smart Spacing Manager Pro
// Detection/NameDetection.jsx — Object/layer/group naming detection
var SSM = SSM || {};
SSM.NameDetection = (function () {
    var DM = SSM.DocumentManager;
    var C = SSM.Constants;
    var Compat = SSM.Compat;
    function nameMatches(name, pattern, matchType, caseSensitive, wildcard) {
        if (name === null || name === undefined || pattern === null || pattern === undefined) { return false; }
        var n = caseSensitive ? String(name) : String(name).toLowerCase();
        var p = caseSensitive ? String(pattern) : String(pattern).toLowerCase();
        switch (matchType) {
            case C.TEXT_MATCH_TYPES.EXACT: return n === p;
            case C.TEXT_MATCH_TYPES.CONTAINS: return n.indexOf(p) !== -1;
            case C.TEXT_MATCH_TYPES.STARTS_WITH: return Compat.startsWith(n, p);
            case C.TEXT_MATCH_TYPES.ENDS_WITH: return Compat.endsWith(n, p);
            case C.TEXT_MATCH_TYPES.PATTERN:
                if (wildcard) {
                    var regex = "^";
                    for (var i = 0; i < p.length; i++) {
                        var c = p.charAt(i);
                        if (c === "*") { regex += ".*"; }
                        else if (c === "?") { regex += "."; }
                        else { regex += escapeRegExp(c); }
                    }
                    regex += "$";
                    var re = Compat.safeRegExp(regex, caseSensitive ? "" : "i");
                    return re ? re.test(n) : false;
                }
                return n.indexOf(p) !== -1;
            case C.TEXT_MATCH_TYPES.REGEX:
                var re2 = Compat.safeRegExp(pattern, caseSensitive ? "" : "i");
                return re2 ? re2.test(n) : false;
            default: return n === p;
        }
    }
    function escapeRegExp(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
    function run(doc, config) {
        doc = doc || DM.getActiveDocument();
        if (!doc) { return { items: [], warning: "No active document" }; }
        config = config || {};
        var pattern = config.pattern || "";
        var matchType = config.matchType || C.TEXT_MATCH_TYPES.CONTAINS;
        var caseSensitive = config.caseSensitive !== undefined ? config.caseSensitive : false;
        var wildcard = config.wildcard !== undefined ? config.wildcard : true;
        var matchLayer = config.matchLayer !== undefined ? config.matchLayer : false;
        var matchGroup = config.matchGroup !== undefined ? config.matchGroup : false;
        var items = [];
        var warnings = [];
        try {
            var pageItems = DM.getPageItems(doc);
            for (var i = 0; i < pageItems.length; i++) {
                var item = pageItems[i];
                if (!item) { continue; }
                var matched = false;
                if (nameMatches(item.name, pattern, matchType, caseSensitive, wildcard)) { matched = true; }
                if (!matched && matchLayer && item.parentLayer) {
                    matched = nameMatches(item.parentLayer, pattern, matchType, caseSensitive, wildcard);
                }
                if (matched) {
                    item.method = C.DETECTION_METHODS.NAME;
                    item.sectionRole = null;
                    item.sectionGroup = null;
                    items.push(item);
                }
            }
        } catch (e) {
            warnings.push("Name detection error: " + String(e));
            SSM.Logger.warn("NameDetection.run failed", e);
        }
        return { items: items, warnings: warnings };
    }
    return {
        run: run,
        nameMatches: nameMatches
    };
})();
