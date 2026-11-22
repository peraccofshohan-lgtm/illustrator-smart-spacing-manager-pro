// Illustrator Smart Spacing Manager Pro
// scripts/validate-build.js — Validate the built JSX artifact
var fs = require("fs");
var path = require("path");

var ROOT = path.resolve(__dirname, "..");
var JSX = path.join(ROOT, "dist", "Illustrator_Smart_Spacing_Manager_Pro.jsx");

function main() {
    var failed = 0;
    if (!fs.existsSync(JSX)) {
        console.error("FAIL: artifact missing: " + JSX);
        process.exit(1);
    }
    var code = fs.readFileSync(JSX, "utf8");
    if (code.length === 0) {
        console.error("FAIL: artifact is empty");
        failed++;
    } else {
        console.log("OK: artifact not empty (" + code.length + " chars)");
    }
    var entryPoints = [
        "SSM.UI.MainWindow",
        "SSM.StateManager",
        "SSM.Constants",
        "SSM.DocumentManager",
        "SSM.ObjectGapEngine",
        "SSM.VisualGapEngine",
        "SSM.RuleEngine",
        "SSM.PreviewEngine",
        "SSM.SpacingEngine"
    ];
    entryPoints.forEach(function (ep) {
        if (code.indexOf(ep) === -1) {
            console.error("FAIL: missing entry point " + ep);
            failed++;
        } else {
            console.log("OK: entry point " + ep);
        }
    });
    if (failed > 0) {
        console.error("\nBuild validation FAILED");
        process.exit(1);
    }
    console.log("\nBuild validation PASSED");
}

main();
