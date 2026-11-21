// Illustrator Smart Spacing Manager Pro
// UI/SettingsPanel.jsx — Settings panel
var SSM = SSM || {};
SSM.UI.Settings = (function () {
    var H = SSM.UIHelpers;
    var C = SSM.Constants;
    function build(parent, app) {
        var panel = H.addPanel(parent, "Settings", { margins: 12, spacing: 10 });
        var s1 = H.addGroup(panel, "group", { alignChildren: "left", spacing: 8 });
        H.addStaticText(s1, "Default unit:");
        var ddUnit = H.addDropdown(s1, C.UNIT_KEYS, 0, { width: 80 });
        H.addStaticText(s1, "Precision:");
        var ddPrec = H.addDropdown(s1, ["0", "1", "2", "3", "4"], 2, { width: 60 });
        H.addStaticText(s1, "Default mode:");
        var ddMode = H.addDropdown(s1, ["Object Gap", "Visual Gap"], 0, { width: 120 });
        var s2 = H.addGroup(panel, "group", { alignChildren: "left", spacing: 8 });
        var cbLock = H.addCheckbox(s2, "Exclude locked objects", true);
        var cbHide = H.addCheckbox(s2, "Exclude hidden objects", true);
        var cbGuide = H.addCheckbox(s2, "Exclude guides", true);
        var cbTemp = H.addCheckbox(s2, "Exclude template layers", true);
        var cbPrev = H.addCheckbox(s2, "Show preview indicators", true);
        var btnSave = H.addButton(panel, "Save Settings", { width: 120 });
        var btnReset = H.addButton(panel, "Reset to Defaults", { width: 140 });
        var lbl = H.addStaticText(panel, "", { width: 260 });
        function load() {
            var st = app.state.get();
            var ui = C.UNIT_KEYS.indexOf(st.unit);
            ddUnit.selection = ui >= 0 ? ui : 0;
            ddPrec.selection = st.precision;
            ddMode.selection = st.measurementMode === "visual" ? 1 : 0;
            cbLock.value = st.excludeLocked; cbHide.value = st.excludeHidden;
            cbGuide.value = st.excludeGuides; cbTemp.value = st.excludeTemplate; cbPrev.value = st.previewIndicators;
        }
        btnSave.onClick = function () {
            app.state.patch({
                unit: ddUnit.selection ? ddUnit.selection.text : "pt",
                precision: parseInt(ddPrec.selection ? ddPrec.selection.text : "2", 10),
                measurementMode: ddMode.selection ? (ddMode.selection.index === 1 ? "visual" : "object") : "object",
                excludeLocked: cbLock.value, excludeHidden: cbHide.value,
                excludeGuides: cbGuide.value, excludeTemplate: cbTemp.value,
                previewIndicators: cbPrev.value
            });
            lbl.text = "Settings saved.";
        };
        btnReset.onClick = function () {
            app.state.patch(C.DEFAULTS);
            load();
            lbl.text = "Settings reset to defaults.";
        };
        load();
        return { panel: panel };
    }
    return { build: build };
})();
