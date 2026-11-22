// Illustrator Smart Spacing Manager Pro
// Diagnostics/Logger.jsx — Diagnostic logging (ES3)
var SSM = SSM || {};
SSM.Logger = (function () {
    var entries = [];
    var MAX_ENTRIES = 500;
    var level = "info";
    var LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
    function setLevel(l) { level = l; }
    function getLevel() { return level; }
    function log(lvl, msg, data) {
        if (LEVELS[lvl] === undefined || LEVELS[lvl] < LEVELS[level]) { return; }
        var entry = {
            time: SSM.Compat.now(),
            level: lvl,
            message: String(msg),
            data: data !== undefined ? data : null
        };
        entries.push(entry);
        if (entries.length > MAX_ENTRIES) {
            entries.splice(0, entries.length - MAX_ENTRIES);
        }
        try {
            if (typeof $ !== "undefined" && $.writeln) { $.writeln("[SSM][" + lvl + "] " + msg); }
        } catch (e) { /* ignore */ }
    }
    function debug(msg, data) { log("debug", msg, data); }
    function info(msg, data) { log("info", msg, data); }
    function warn(msg, data) { log("warn", msg, data); }
    function error(msg, data) { log("error", msg, data); }
    function getEntries() { return entries.slice(); }
    function clear() { entries = []; }
    function toText() {
        var lines = [];
        for (var i = 0; i < entries.length; i++) {
            var e = entries[i];
            lines.push(new Date(e.time).toISOString() + " [" + e.level + "] " + e.message);
        }
        return lines.join("\n");
    }
    return {
        setLevel: setLevel,
        getLevel: getLevel,
        debug: debug,
        info: info,
        warn: warn,
        error: error,
        getEntries: getEntries,
        clear: clear,
        toText: toText
    };
})();
