// Illustrator Smart Spacing Manager Pro
// UI/RulesPanel.jsx — Rules panel
var SSM = SSM || {};
SSM.UI.Rules = (function () {
    var H = SSM.UIHelpers;
    var C = SSM.Constants;
    function build(parent, app) {
        var panel = H.addPanel(parent, "Spacing Rules", { margins: 12, spacing: 10 });
        var top = H.addGroup(panel, "group", { alignChildren: "left", spacing: 8 });
        var edName = H.addEditText(top, "Rule name", { width: 140 });
        var ddDir = H.addDropdown(top, ["Vertical", "Horizontal"], 0, { width: 100 });
        var edGap = H.addEditText(top, "40", { width: 60 });
        var ddUnit = H.addDropdown(top, C.UNIT_KEYS, 0, { width: 60 });
        var btnCreate = H.addButton(top, "Create Rule", { width: 100 });
        var list = H.addListBox(panel, [], { width: 340, height: 150 });
        var btns = H.addGroup(panel, "group", { alignChildren: "left", spacing: 6 });
        var btnEnable = H.addButton(btns, "Enable", { width: 70 });
        var btnDisable = H.addButton(btns, "Disable", { width: 70 });
        var btnDup = H.addButton(btns, "Duplicate", { width: 70 });
        var btnDel = H.addButton(btns, "Delete", { width: 70 });
        var btnExport = H.addButton(btns, "Export", { width: 70 });
        var lbl = H.addStaticText(panel, "Rules: 0", { width: 150 });
        function refresh() {
            var re = SSM.RuleEngine;
            var rules = re.getAll();
            list.removeAll();
            for (var i = 0; i < rules.length; i++) {
                list.add("item", (rules[i].enabled ? "" : "[OFF] ") + rules[i].name + " — " + rules[i].targetGap + rules[i].unit);
            }
            lbl.text = "Rules: " + rules.length;
        }
        btnCreate.onClick = function () {
            var re = SSM.RuleEngine;
            var result = re.createRule({
                name: edName.text || "New Rule",
                direction: ddDir.selection ? ddDir.selection.text : "Vertical",
                targetGap: parseFloat(edGap.text) || 0,
                unit: ddUnit.selection ? ddUnit.selection.text : "pt",
                enabled: true
            });
            if (result.rule) { refresh(); app.actions.refreshDashboard(); }
            else { alert("Rule error: " + result.errors.join("; ")); }
        };
        btnEnable.onClick = function () { var s = list.selection; if (s) { SSM.RuleEngine.enableRule(getIdByText(s.text), true); refresh(); } };
        btnDisable.onClick = function () { var s = list.selection; if (s) { SSM.RuleEngine.enableRule(getIdByText(s.text), false); refresh(); } };
        btnDup.onClick = function () { var s = list.selection; if (s) { var id = getIdByText(s.text); var rule = SSM.RuleEngine.getRule(id); if (rule) { SSM.RuleEngine.duplicateRule(id, rule.name + " (copy)"); refresh(); } } };
        btnDel.onClick = function () { var s = list.selection; if (s) { SSM.RuleEngine.deleteRule(getIdByText(s.text)); refresh(); } };
        btnExport.onClick = function () { alert("Use the Presets tab to export presets."); };
        function getIdByText(text) {
            var name = text.replace(/^\[OFF\]\s*/, "").split(" — ")[0];
            var rules = SSM.RuleEngine.getAll();
            for (var i = 0; i < rules.length; i++) { if (rules[i].name === name) { return rules[i].id; } }
            return null;
        }
        refresh();
        return { panel: panel, refresh: refresh };
    }
    return { build: build };
})();
