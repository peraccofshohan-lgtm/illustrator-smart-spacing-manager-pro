// Illustrator Smart Spacing Manager Pro
// Batch/BatchProcessor.jsx — Batch processing across artboards / selections
var SSM = SSM || {};
SSM.BatchProcessor = (function () {
    var C = SSM.Constants;
    function process(doc, scope, rules, sections, onProgress) {
        var results = [];
        doc = doc || SSM.DocumentManager.getActiveDocument();
        if (!doc) { return { success: false, error: "No active document" }; }
        var artboards = SSM.DocumentManager.getArtboards(doc);
        var targets = [];
        switch (scope) {
            case C.SCOPES.ACTIVE_ARTBOARD:
                targets = artboards.filter(function (ab) { return ab.active; });
                break;
            case C.SCOPES.SELECTED_ARTBOARDS:
                targets = artboards; // all (selection of artboards not exposed in ExtendScript reliably)
                break;
            case C.SCOPES.ALL_ARTBOARDS:
                targets = artboards;
                break;
            case C.SCOPES.SELECTION:
            case C.SCOPES.SECTIONS:
            case C.SCOPES.DOCUMENT:
            default:
                targets = [{ index: -1, name: "document", active: true }];
                break;
        }
        for (var t = 0; t < targets.length; t++) {
            if (onProgress) { onProgress(t, targets.length, targets[t].name); }
            var batchResult = {
                target: targets[t].name,
                index: targets[t].index,
                results: []
            };
            var preview = SSM.PreviewEngine.buildPreview(sections, rules, doc);
            for (var p = 0; p < preview.length; p++) {
                var entry = preview[p];
                entry.applied = true;
                batchResult.results.push(entry);
            }
            results.push(batchResult);
        }
        return { success: true, results: results };
    }
    return {
        process: process
    };
})();
