// Illustrator Smart Spacing Manager Pro
// UI/PreviewPanel.jsx — Preview panel
var SSM = SSM || {};
SSM.UI.Preview = (function () {
    var H = SSM.UIHelpers;
    var C = SSM.Constants;
    function build(parent, app) {
        var panel = H.addPanel(parent, "Preview", { margins: 12, spacing: 10 });
        var btnPreview = H.addButton(panel, "Build Preview", { width: 130 });
        var btnApplyAll = H.addButton(panel, "Apply All", { width: 100 });
        var btnCancel = H.addButton(panel, "Cancel / Clear", { width: 120 });
        var list = H.addListBox(panel, [], { width: 380, height: 200 });
        var lblSummary = H.addStaticText(panel, "Preview entries: 0", { width: 200 });
        var entries = [];
        btnPreview.onClick = function () {
            var st = app.state.get();
            entries = SSM.PreviewEngine.buildPreview(st.sections, st.rules, null);
            list.removeAll();
            for (var i = 0; i < entries.length; i++) {
                var e = entries[i];
                list.add("item", e.sectionName + ": " + e.currentDisplay + " → " + e.targetDisplay + " (Δ" + e.diffDisplay + ")");
            }
            lblSummary.text = "Preview entries: " + entries.length;
            app.state.set("previewEntries", entries);
            if (st.previewIndicators) {
                SSM.PreviewRenderer.render(entries, null);
            }
        };
        btnApplyAll.onClick = function () {
            app.actions.applyAll();
        };
        btnCancel.onClick = function () {
            list.removeAll();
            lblSummary.text = "Preview entries: 0";
            SSM.PreviewRenderer.clear(null);
            entries = [];
        };
        return { panel: panel };
    }
    return { build: build };
})();
