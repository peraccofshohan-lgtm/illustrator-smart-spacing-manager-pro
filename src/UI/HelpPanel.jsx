// Illustrator Smart Spacing Manager Pro
// UI/HelpPanel.jsx — Help and Diagnostics panel
var SSM = SSM || {};
SSM.UI.Help = (function () {
    var H = SSM.UIHelpers;
    var C = SSM.Constants;
    function build(parent, app) {
        var panel = H.addPanel(parent, "Help & Diagnostics", { margins: 12, spacing: 10 });
        H.addStaticText(panel, C.APP_NAME, { width: 300 });
        H.addStaticText(panel, "Version " + C.VERSION + " (build " + C.BUILD + ")", { width: 200 });
        H.addStaticText(panel, "Platform: Adobe Illustrator ExtendScript (JSX)", { width: 300 });
        H.addStaticText(panel, "ES3-compatible. No external runtime required.", { width: 300 });
        H.addStaticText(panel, "", { height: 8 });
        H.addStaticText(panel, "Supported features:", { width: 200 });
        H.addStaticText(panel, "• Manual / Text / Style / Name / Combined detection", { width: 300 });
        H.addStaticText(panel, "• Object Gap & Visual Gap measurement", { width: 300 });
        H.addStaticText(panel, "• Vertical / Horizontal / Both / Auto direction", { width: 300 });
        var txt = H.addEditText(panel,
            "Known limitations:\n" +
            "• Visual measurement uses duplicate + outline; complex text may fall back to geometric bounds.\n" +
            "• Rotated objects measured via axis-aligned bounding boxes (approximate).\n" +
            "• Batch processing operates within the active document (not across multiple .ai files).\n" +
            "• Not yet validated in live Illustrator (prerelease v0.1.0).\n",
            { width: 340, height: 150, multiline: true });
        var btnLog = H.addButton(panel, "Show Error Log", { width: 130 });
        var btnClear = H.addButton(panel, "Clear Log", { width: 100 });
        var lblLog = H.addStaticText(panel, "", { width: 340, multiline: true, height: 60 });
        btnLog.onClick = function () {
            lblLog.text = SSM.ErrorReporter.toText() || "(no errors)";
        };
        btnClear.onClick = function () {
            SSM.ErrorReporter.clear();
            lblLog.text = "(log cleared)";
        };
        return { panel: panel };
    }
    return { build: build };
})();
