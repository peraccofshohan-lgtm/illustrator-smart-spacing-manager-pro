// Illustrator Smart Spacing Manager Pro
// UI/BatchPanel.jsx — Batch processing panel
var SSM = SSM || {};
SSM.UI.Batch = (function () {
    var H = SSM.UIHelpers;
    var C = SSM.Constants;
    function build(parent, app) {
        var panel = H.addPanel(parent, "Batch Processing", { margins: 12, spacing: 10 });
        H.addStaticText(panel, "Scope:");
        var ddScope = H.addDropdown(panel, ["Selection", "Sections", "Active Artboard", "Selected Artboards", "All Artboards", "Document"], 0, { width: 200 });
        var btnRun = H.addButton(panel, "Run Batch Preview", { width: 160 });
        var btnApply = H.addButton(panel, "Apply Batch", { width: 120 });
        var lbl = H.addStaticText(panel, "Batch result: —", { width: 300 });
        btnRun.onClick = function () {
            var st = app.state.get();
            var scopeKey = ["selection", "sections", "activeArtboard", "selectedArtboards", "allArtboards", "document"][ddScope.selection ? ddScope.selection.index : 0];
            var result = SSM.BatchProcessor.process(null, scopeKey, st.rules, st.sections, function (i, n, name) {});
            if (result.success) {
                var total = 0;
                for (var r = 0; r < result.results.length; r++) { total += result.results[r].results.length; }
                lbl.text = "Batch result: " + result.results.length + " targets, " + total + " entries";
            } else {
                lbl.text = "Batch error: " + result.error;
            }
        };
        btnApply.onClick = function () { app.actions.applyAll(); };
        return { panel: panel };
    }
    return { build: build };
})();
