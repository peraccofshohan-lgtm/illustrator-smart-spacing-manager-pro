// Illustrator Smart Spacing Manager Pro
// Main.jsx — Application entry point
// Launches the floating ScriptUI palette. Standalone JSX — no external runtime.
var SSM = SSM || {};
(function () {
    "use strict";
    // Initialize core state with defaults
    SSM.StateManager.patch(SSM.Constants.DEFAULTS);
    // Load built-in presets
    var builtIn = SSM.PresetManager.builtInPresets();
    for (var i = 0; i < builtIn.length; i++) {
        var b = builtIn[i];
        SSM.PresetManager.addPreset(b.name, b.rules, b.description);
    }
    SSM.Logger.info("Illustrator Smart Spacing Manager Pro v" + SSM.Constants.VERSION + " initialized");
    function main() {
        if (app.documents.length === 0) {
            alert("Illustrator Smart Spacing Manager Pro\n\nNo document is open. Please open an Illustrator document and run the script again.");
            return;
        }
        var appContext = {
            state: SSM.StateManager,
            actions: {}
        };
        var win = SSM.UI.MainWindow.create(appContext);
        win.center();
        win.show();
    }
    try {
        main();
    } catch (e) {
        SSM.ErrorReporter.report("MAIN_ERROR", String(e));
        alert("Illustrator Smart Spacing Manager Pro failed to start:\n" + String(e));
    }
})();
