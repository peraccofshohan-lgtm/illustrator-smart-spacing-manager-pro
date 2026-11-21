// Illustrator Smart Spacing Manager Pro
// Detection/ManualDetection.jsx — Manual selection detection
var SSM = SSM || {};
SSM.ManualDetection = (function () {
    var DM = SSM.DocumentManager;
    var BM = SSM.BoundsManager;
    var C = SSM.Constants;
    function run(doc, includeLocked, includeHidden) {
        doc = doc || DM.getActiveDocument();
        if (!doc) { return { items: [], warning: "No active document" }; }
        var selection = DM.getSelection(doc);
        var items = [];
        var warnings = [];
        for (var i = 0; i < selection.length; i++) {
            var item = selection[i];
            if (!item) { continue; }
            if (item.locked && !includeLocked) {
                warnings.push("Skipped locked object: " + item.name);
                continue;
            }
            if (item.hidden && !includeHidden) {
                warnings.push("Skipped hidden object: " + item.name);
                continue;
            }
            item.method = C.DETECTION_METHODS.MANUAL;
            item.sectionRole = null;
            item.sectionGroup = null;
            items.push(item);
        }
        return { items: items, warnings: warnings };
    }
    return {
        run: run
    };
})();
