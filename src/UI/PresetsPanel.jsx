// Illustrator Smart Spacing Manager Pro
// UI/PresetsPanel.jsx — Presets panel (create, export, import, delete)
var SSM = SSM || {};
SSM.UI.Presets = (function () {
    var H = SSM.UIHelpers;
    var C = SSM.Constants;
    function build(parent, app) {
        var panel = H.addPanel(parent, "Presets", { margins: 12, spacing: 10 });
        H.addStaticText(panel, "Save, load, export and reuse spacing rule presets.", { width: 300 });
        var list = H.addListBox(panel, [], { width: 320, height: 130 });
        var btns = H.addGroup(panel, "group", { alignChildren: "left", spacing: 6 });
        var btnSave = H.addButton(btns, "Save Rules as Preset", { width: 140 });
        var btnExport = H.addButton(btns, "Export Selected", { width: 120 });
        var btnImport = H.addButton(btns, "Import Preset", { width: 120 });
        var btnDel = H.addButton(btns, "Delete Selected", { width: 120 });
        var btnRefresh = H.addButton(btns, "Refresh", { width: 90 });
        var lbl = H.addStaticText(panel, "Presets: 0", { width: 150 });
        var status = H.addStaticText(panel, "", { width: 300 });
        function refresh() {
            var pm = SSM.PresetManager;
            var presets = pm.getAll();
            list.removeAll();
            for (var i = 0; i < presets.length; i++) {
                list.add("item", presets[i].name);
            }
            lbl.text = "Presets: " + presets.length;
        }
        btnSave.onClick = function () {
            var name = prompt("Preset name:", "My Preset");
            if (!name) { return; }
            var pm = SSM.PresetManager;
            var preset = pm.saveRulesAsPreset(name, "Saved " + name);
            app.state.set("presets", pm.getAll());
            refresh();
            status.text = "Saved preset: " + name;
        };
        btnExport.onClick = function () {
            var sel = list.selection;
            if (!sel) { status.text = "Select a preset first."; return; }
            var pm = SSM.PresetManager;
            var preset = null;
            var all = pm.getAll();
            for (var i = 0; i < all.length; i++) { if (all[i].name === sel.text) { preset = all[i]; break; } }
            if (!preset) { status.text = "Preset not found."; return; }
            var json = pm.exportRules(preset.rules);
            if (!json) { status.text = "Export failed."; return; }
            try {
                if (typeof File !== "undefined") {
                    var save = File.saveDialog("Export preset as", "JSON files:*.json");
                    if (save) { save.open("w"); save.write(json); save.close(); status.text = "Exported to " + save.fsName; }
                } else {
                    status.text = json; // fallback: show JSON
                }
            } catch (e) {
                status.text = "Export error: " + String(e);
                SSM.ErrorReporter.report("PRESET_EXPORT", String(e));
            }
        };
        btnImport.onClick = function () {
            try {
                if (typeof File !== "undefined") {
                    var open = File.openDialog("Import preset", "JSON files:*.json");
                    if (!open) { return; }
                    open.open("r"); var json = open.read(); open.close();
                    var result = pm.importJson(json);
                    if (result.success) {
                        app.state.set("presets", pm.getAll());
                        refresh();
                        status.text = "Imported: " + result.preset.name;
                    } else {
                        status.text = "Import failed: " + result.error;
                    }
                } else {
                    status.text = "File dialog unavailable in this environment.";
                }
            } catch (e) {
                status.text = "Import error: " + String(e);
                SSM.ErrorReporter.report("PRESET_IMPORT", String(e));
            }
        };
        btnDel.onClick = function () {
            var sel = list.selection;
            if (!sel) { status.text = "Select a preset first."; return; }
            var pm = SSM.PresetManager;
            var all = pm.getAll();
            var id = null;
            for (var i = 0; i < all.length; i++) { if (all[i].name === sel.text) { id = all[i].id; break; } }
            if (id && pm.deletePreset(id)) {
                app.state.set("presets", pm.getAll());
                refresh();
                status.text = "Deleted: " + sel.text;
            }
        };
        btnRefresh.onClick = function () { refresh(); status.text = "Refreshed."; };
        refresh();
        return { panel: panel, refresh: refresh };
    }
    return { build: build };
})();
