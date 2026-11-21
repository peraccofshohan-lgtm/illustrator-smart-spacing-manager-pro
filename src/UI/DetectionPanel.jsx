// Illustrator Smart Spacing Manager Pro
// UI/DetectionPanel.jsx — Detection panel with per-method controls
var SSM = SSM || {};
SSM.UI.Detection = (function () {
    var H = SSM.UIHelpers;
    var C = SSM.Constants;
    function build(parent, app) {
        var panel = H.addPanel(parent, "Detection", { margins: 12, spacing: 10 });
        // Method selector
        var methodGroup = H.addGroup(panel, "group", { alignChildren: "left", spacing: 8 });
        H.addStaticText(methodGroup, "Detection Method:");
        var ddMethod = H.addDropdown(methodGroup, ["Manual Selection", "Text Matching", "Style Matching", "Object Naming", "Combined Detection"], 0, { width: 200 });
        // ---- Text matching controls ----
        var textGroup = H.addGroup(panel, "column", { alignChildren: "left", spacing: 6, visible: false });
        H.addStaticText(textGroup, "Text pattern:");
        var edPattern = H.addEditText(textGroup, "Chapter", { width: 220 });
        var cbCase = H.addCheckbox(textGroup, "Case sensitive", false);
        var cbWhole = H.addCheckbox(textGroup, "Whole word", false);
        var cbRegex = H.addCheckbox(textGroup, "Use regular expressions", true);
        // ---- Style matching controls ----
        var styleGroup = H.addGroup(panel, "column", { alignChildren: "left", spacing: 6, visible: false });
        H.addStaticText(styleGroup, "Match criteria (all must match):");
        H.addStaticText(styleGroup, "Font family:");
        var edFontFamily = H.addEditText(styleGroup, "", { width: 200 });
        H.addStaticText(styleGroup, "Font style:");
        var edFontStyle = H.addEditText(styleGroup, "", { width: 200 });
        H.addStaticText(styleGroup, "Font size (pt):");
        var edFontSize = H.addEditText(styleGroup, "", { width: 200 });
        H.addStaticText(styleGroup, "Character style:");
        var edCharStyle = H.addEditText(styleGroup, "", { width: 200 });
        H.addStaticText(styleGroup, "Fill color:");
        var edFillColor = H.addEditText(styleGroup, "", { width: 200 });
        // ---- Object naming controls ----
        var nameGroup = H.addGroup(panel, "column", { alignChildren: "left", spacing: 6, visible: false });
        H.addStaticText(nameGroup, "Name pattern:");
        var edNamePattern = H.addEditText(nameGroup, "CHAPTER", { width: 220 });
        var cbNameCase = H.addCheckbox(nameGroup, "Case sensitive", false);
        var cbNameWildcard = H.addCheckbox(nameGroup, "Use wildcards (* ?)", true);
        var cbNameRegex = H.addCheckbox(nameGroup, "Use regular expressions", false);
        // ---- Detect button and results ----
        var btnDetect = H.addButton(panel, "Detect Objects", { width: 140 });
        var list = H.addListBox(panel, [], { width: 340, height: 150 });
        var lblCount = H.addStaticText(panel, "Results: 0", { width: 200 });
        var lblWarn = H.addStaticText(panel, "", { width: 340 });
        function showSettings(method) {
            textGroup.visible = false;
            styleGroup.visible = false;
            nameGroup.visible = false;
            if (method === C.DETECTION_METHODS.TEXT) { textGroup.visible = true; }
            else if (method === C.DETECTION_METHODS.STYLE) { styleGroup.visible = true; }
            else if (method === C.DETECTION_METHODS.NAME) { nameGroup.visible = true; }
            else if (method === C.DETECTION_METHODS.COMBINED) {
                textGroup.visible = true; styleGroup.visible = true; nameGroup.visible = true;
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
            var method = methods[idx];
            var config = {};
            if (method === C.DETECTION_METHODS.TEXT || method === C.DETECTION_METHODS.COMBINED) {
                config = {
                    pattern: edPattern.text,
                    caseSensitive: cbCase.value,
                    wholeWord: cbWhole.value,
                    useRegex: cbRegex.value
                };
            }
            if (method === C.DETECTION_METHODS.STYLE || method === C.DETECTION_METHODS.COMBINED) {
                var criteria = [];
                if (edFontFamily.text) { criteria.push({ attr: "fontFamily", value: edFontFamily.text }); }
                if (edFontStyle.text) { criteria.push({ attr: "fontStyle", value: edFontStyle.text }); }
                if (edFontSize.text) { criteria.push({ attr: "fontSize", value: parseFloat(edFontSize.text) || 0, tolerance: 0.5 }); }
                if (edCharStyle.text) { criteria.push({ attr: "characterStyle", value: edCharStyle.text }); }
                if (edFillColor.text) { criteria.push({ attr: "fillColor", value: edFillColor.text }); }
                config.criteria = criteria;
                config.requireAll = true;
            }
            if (method === C.DETECTION_METHODS.NAME || method === C.DETECTION_METHODS.COMBINED) {
                config = {
                    pattern: edNamePattern.text,
                    caseSensitive: cbNameCase.value,
                    wildcard: cbNameWildcard.value,
                    matchType: cbNameRegex.value ? C.TEXT_MATCH_TYPES.REGEX : C.TEXT_MATCH_TYPES.PATTERN
                };
            }
            if (method === C.DETECTION_METHODS.MANUAL) {
                config = {};
            }
            var result = SSM.DetectionRegistry.run(null, method, config);
            var items = [];
            if (result.items) {
                for (var i = 0; i < result.items.length; i++) {
                    items.push(result.items[i].name || result.items[i].id);
                }
            }
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
