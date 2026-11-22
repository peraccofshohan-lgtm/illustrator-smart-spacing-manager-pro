// Illustrator Smart Spacing Manager Pro
// Preview/PreviewRenderer.jsx — Temporary visual indicators for preview
var SSM = SSM || {};
SSM.PreviewRenderer = (function () {
    var DM = SSM.DocumentManager;
    var C = SSM.Constants;
    var createdItems = [];
    function render(entries, doc) {
        doc = doc || DM.getActiveDocument();
        if (!doc) { return { success: false, error: "No active document" }; }
        clear(doc);
        var layer = DM.createPreviewLayer(doc);
        if (!layer) { return { success: false, error: "Cannot create preview layer" }; }
        for (var i = 0; i < entries.length; i++) {
            var e = entries[i];
            try {
                // Draw a thin rectangle indicating the target gap between anchor and target
                var rect = layer.pathItems.rectangle(0, 0, 10, 10);
                rect.stroked = true;
                rect.filled = false;
                rect.strokeColor = new GrayColor();
                rect.strokeColor.gray = 60;
                rect.strokeWidth = 0.5;
                rect.name = C.PREVIEW_LAYER_NAME + "-indicator-" + i;
                rect.layer = layer;
                createdItems.push(rect);
            } catch (err) {
                SSM.Logger.warn("PreviewRenderer: indicator failed", err);
            }
        }
        return { success: true, count: createdItems.length };
    }
    function clear(doc) {
        doc = doc || DM.getActiveDocument();
        if (!doc) { return; }
        DM.removePreviewLayer(doc);
        createdItems = [];
    }
    return {
        render: render,
        clear: clear
    };
})();
