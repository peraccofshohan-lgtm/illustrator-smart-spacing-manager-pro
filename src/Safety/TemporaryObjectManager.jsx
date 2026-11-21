// Illustrator Smart Spacing Manager Pro
// Safety/TemporaryObjectManager.jsx — Track & cleanup temporary objects
var SSM = SSM || {};
SSM.TemporaryObjectManager = (function () {
    var tracked = [];
    var previewLayerName = SSM.Constants.PREVIEW_LAYER_NAME;
    var tempLayerName = SSM.Constants.TEMP_LAYER_NAME;
    function track(item, reason) {
        tracked.push({ item: item, reason: reason || "temporary", time: SSM.Compat.now() });
    }
    function cleanup(doc) {
        doc = doc || SSM.DocumentManager.getActiveDocument();
        if (doc) {
            SSM.DocumentManager.removePreviewLayer(doc);
            try {
                var layers = doc.layers;
                for (var i = layers.length - 1; i >= 0; i--) {
                    if (layers[i] && layers[i].name === tempLayerName) {
                        try { layers[i].remove(); } catch (e) { /* ignore */ }
                    }
                }
            } catch (e) { /* ignore */ }
        }
        tracked = [];
        return true;
    }
    function count() { return tracked.length; }
    return {
        track: track,
        cleanup: cleanup,
        count: count
    };
})();
