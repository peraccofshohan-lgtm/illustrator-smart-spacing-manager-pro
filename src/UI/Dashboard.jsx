// Illustrator Smart Spacing Manager Pro
// UI/Dashboard.jsx — Dashboard panel
var SSM = SSM || {};
SSM.UI.Dashboard = (function () {
    var H = SSM.UIHelpers;
    var C = SSM.Constants;
    function build(parent, app) {
        var panel = H.addPanel(parent, "Dashboard", { margins: 12, spacing: 10 });
        var info = H.addGroup(panel, "column", { alignChildren: "left", spacing: 4 });
        var docLabel = H.addStaticText(info, "Document: —", { width: 260 });
        var abLabel = H.addStaticText(info, "Artboards: 0", { width: 260 });
        var itemsLabel = H.addStaticText(info, "Detected objects: 0", { width: 260 });
        var sectionsLabel = H.addStaticText(info, "Detected sections: 0", { width: 260 });
        var rulesLabel = H.addStaticText(info, "Active rules: 0", { width: 260 });
        var opLabel = H.addStaticText(info, "Last operation: —", { width: 260 });
        var modeLabel = H.addStaticText(info, "Mode: Object / Vertical", { width: 260 });
        var warnLabel = H.addStaticText(info, "Warnings: 0", { width: 260, multiline: false });
        H.addStaticText(info, "", { height: 10 });
        var actions = H.addGroup(panel, "group", { alignChildren: "left", spacing: 8 });
        var btnScan = H.addButton(actions, "Scan Document", { width: 120 });
        var btnRefresh = H.addButton(actions, "Refresh Selection", { width: 120 });
        var btnPreview = H.addButton(actions, "Preview", { width: 100 });
        var btnApply = H.addButton(actions, "Apply", { width: 100 });
        var btnRules = H.addButton(actions, "Rule Manager", { width: 120 });
        function refresh() {
            var st = app.state.get();
            docLabel.text = st.document ? ("Document: " + (st.document.name || "Untitled")) : "Document: —";
            abLabel.text = "Artboards: " + (st.artboards ? st.artboards.length : 0);
            itemsLabel.text = "Detected objects: " + (st.items ? st.items.length : 0);
            sectionsLabel.text = "Detected sections: " + (st.sections ? st.sections.length : 0);
            rulesLabel.text = "Active rules: " + (st.rules ? st.rules.length : 0);
            opLabel.text = "Last operation: " + (st.lastOperation || "—");
            modeLabel.text = "Mode: " + st.measurementMode + " / " + st.direction;
            var w = st.warnings ? st.warnings.length : 0;
            warnLabel.text = "Warnings: " + w;
            btnPreview.enabled = st.items && st.items.length > 0;
            btnApply.enabled = st.sections && st.sections.length > 0;
        }
        btnScan.onClick = function () { app.actions.scanDocument(); };
        btnRefresh.onClick = function () { app.actions.refreshSelection(); };
        btnPreview.onClick = function () { app.actions.preview(); };
        btnApply.onClick = function () { app.actions.apply(); };
        btnRules.onClick = function () { app.actions.openRules(); };
        return { panel: panel, refresh: refresh };
    }
    return { build: build };
})();
