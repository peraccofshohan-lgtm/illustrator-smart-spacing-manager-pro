// Illustrator Smart Spacing Manager Pro
// Detection/CombinedDetection.jsx — Combine multiple detection methods
var SSM = SSM || {};
SSM.CombinedDetection = (function () {
    var C = SSM.Constants;
    function run(doc, methods) {
        // methods: array of {method, config}
        doc = doc || SSM.DocumentManager.getActiveDocument();
        if (!doc) { return { items: [], warning: "No active document" }; }
        var all = [];
        var byId = {};
        var warnings = [];
        for (var m = 0; m < methods.length; m++) {
            var method = methods[m];
            var result = null;
            try {
                switch (method.method) {
                    case C.DETECTION_METHODS.MANUAL:
                        result = SSM.ManualDetection.run(doc, method.config);
                        break;
                    case C.DETECTION_METHODS.TEXT:
                        result = SSM.TextDetection.run(doc, method.config);
                        break;
                    case C.DETECTION_METHODS.STYLE:
                        result = SSM.StyleDetection.run(doc, method.config);
                        break;
                    case C.DETECTION_METHODS.NAME:
                        result = SSM.NameDetection.run(doc, method.config);
                        break;
                    default:
                        warnings.push("Unknown detection method: " + method.method);
                }
            } catch (e) {
                warnings.push("Combined method " + method.method + " failed: " + String(e));
                SSM.Logger.warn("CombinedDetection: " + method.method, e);
            }
            if (result) {
                if (result.warnings) {
                    for (var w = 0; w < result.warnings.length; w++) { warnings.push(result.warnings[w]); }
                }
                if (result.items) {
                    for (var i = 0; i < result.items.length; i++) {
                        var item = result.items[i];
                        item.detectionReasons = item.detectionReasons || [];
                        item.detectionReasons.push(method.method);
                        var id = item.id;
                        if (!byId[id]) {
                            byId[id] = item;
                            all.push(item);
                        } else {
                            // merge reasons, avoid duplicates
                            var existing = byId[id];
                            for (var r = 0; r < item.detectionReasons.length; r++) {
                                var reason = item.detectionReasons[r];
                                var found = false;
                                for (var e = 0; e < existing.detectionReasons.length; e++) {
                                    if (existing.detectionReasons[e] === reason) { found = true; break; }
                                }
                                if (!found) { existing.detectionReasons.push(reason); }
                            }
                        }
                    }
                }
            }
        }
        return { items: all, warnings: warnings };
    }
    return {
        run: run
    };
})();
