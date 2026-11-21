// Illustrator Smart Spacing Manager Pro
// UI/DetectionPanel.jsx — Detection panel
var SSM = SSM || {};
SSM.UI.Detection = (function () {
    var H = SSM.UIHelpers;
    var C = SSM.Constants;
    function build(parent, app) {
        var panel = H.addPanel(parent, "Detection", { margins: 12, spacing: 10 });
        var methodGroup = H.addGroup(panel, "column", { alignChildren: "left", spacing: 8 });
        H.addStaticText(methodGroup, "Detection Method:");
        var ddMethod = H.addDropdown(methodGroup, ["Manual Selection", "Text Matching", "Style Matching", "Object Naming", "Combined Detection"], 0, { width: 220 });
        var settingsGroup = H.addGroup(panel, "column", { alignChildren: "left", spacing: 8 });
        H.addStaticText(settingsGroup, "Pattern / Criteria:");
        var edPattern = H.addEditText(settingsGroup, "Chapter", { width: 220 });
        var cbCase = H.addCheckbox(settingsGroup, "Case sensitive", false);
        var cbWhole = H.addCheckbox(settingsGroup, "Whole word", false);
        var cbRegex = H.addCheckbox(settingsGroup, "Use regular expressions", true);
        var btnDetect = H.addButton(panel, "Detect Objects", { width: 140 });
        var list = H.addListBox(panel, [], { width: 300, height: 160 });
        var lblCount = H.addStaticText(panel, "Results: 0", { width: 200 });
        var lblWarn = H.addStaticText(panel, "", { width: 300 });
        function showSettings(method) {
            for (var i = 0; i < settingsGroup.children.length; i++) { settingsGroup.children[i].visible = false; }
            settingsGroup.children[0].visible = true; // label
            if (method === C.DETECTION_METHODS.TEXT) {
                edPattern.visible = true; cbCase.visible = true; cbWhole.visible = true; cbRegex.visible = true;
            } else if (method === C.DETECTION_METHODS.STYLE) {
                edPattern.visible = true; cbCase.visible = true; cbWhole.visible = false; cbRegex.visible = false;
            } else if (method === C.DETECTION_METHODS.NAME) {
                edPattern.visible = true; cbCase.visible = true; cbWhole.visible = false; cbRegex.visible = true;
            } else if (method === C.DETECTION_METHODS.MANUAL) {
                // no pattern controls
            } else {
                edPattern.visible = true; cbCase.visible = true; cbWhole.visible = true; cbRegex.visible = true;
            }
        }
        ddMethod.onChange = function () {
            var idx = ddMethod.selection ? ddMethod.selection.index : 0;
            var methods = [C.DETECTION_METHODS.MANUAL, C.DETECTION_METHODS.TEXT, C.DETECTION_METHODS.STYLE, C.DETECTION_METHODS.NAME, C.DETECTION_METHODS.COMBINED];
            showSettings(methods[idx]);
        };
        showSettings(C.DETECTION_METHODS.MANUAL);
        btnDetect.onClick = function () {
            var idx = ddMethod.selection ? ddMethod.selection.index : 0;
            var methods = [C.DETECTION_METHODS.MANUAL, C.DETECTION_METHODS.TEXT, C.DETECTION_METHODS.STYLE, C.DETECTION_METHODS.NAME, C.DETECTION_METHODS.COMBINED];
            var config = {
                pattern: edPattern.text,
                caseSensitive: cbCase.value,
                wholeWord: cbWhole.value,
                useRegex: cbRegex.value
            };
            var result = SSM.DetectionRegistry.run(null, methods[idx], config);
            var items = [];
            if (result.items) {
                for (var i = 0; i < result.items.length; i++) {
                    items.push(result.items[i].name || result.items[i].id);
                }
            }
            list.items = items; // reset via replace
            // ScriptUI listbox: remove all then add
            list.removeAll();
            for (var i = 0; i < items.length; i++) { list.add("item", items[i]); }
            lblCount.text = "Results: " + items.length;
            lblWarn.text = result.warnings ? result.warnings.join("; ") : "";
            app.state.set("detections", result.items || []);
            app.actions.refreshDashboard();
        };
        return { panel: panel };
    }
    return { build: build };
})();
