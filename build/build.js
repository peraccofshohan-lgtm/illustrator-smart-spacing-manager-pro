// Illustrator Smart Spacing Manager Pro — Build script
// Concatenates ES3-compatible source modules into a single distributable JSX.
var fs = require("fs");
var path = require("path");
var crypto = require("crypto");

var ROOT = path.resolve(__dirname, "..");
var SRC = path.join(ROOT, "src");
var DIST = path.join(ROOT, "dist");
var OUT = path.join(DIST, "Illustrator_Smart_Spacing_Manager_Pro.jsx");

// Deterministic module order (dependencies before dependents)
var MODULES = [
    "src/Core/Constants.jsx",
    "src/Core/Compatibility.jsx",
    "src/Core/Utilities.jsx",
    "src/Diagnostics/Logger.jsx",
    "src/Diagnostics/ErrorReporter.jsx",
    "src/Core/DocumentManager.jsx",
    "src/Core/StateManager.jsx",
    "src/Measurement/BoundsManager.jsx",
    "src/Measurement/ObjectGapEngine.jsx",
    "src/Measurement/VisualGapEngine.jsx",
    "src/Measurement/MeasurementNormalizer.jsx",
    "src/Measurement/MeasurementReliability.jsx",
    "src/Detection/ManualDetection.jsx",
    "src/Detection/TextDetection.jsx",
    "src/Detection/StyleDetection.jsx",
    "src/Detection/NameDetection.jsx",
    "src/Detection/CombinedDetection.jsx",
    "src/Detection/DetectionRegistry.jsx",
    "src/Sections/SectionManager.jsx",
    "src/Sections/RelationshipEngine.jsx",
    "src/Rules/RuleValidator.jsx",
    "src/Rules/RuleEngine.jsx",
    "src/Rules/ConflictResolver.jsx",
    "src/Rules/PresetManager.jsx",
    "src/Spacing/SpacingCalculator.jsx",
    "src/Spacing/SpacingEngine.jsx",
    "src/Spacing/PositionManager.jsx",
    "src/Preview/PreviewEngine.jsx",
    "src/Preview/PreviewRenderer.jsx",
    "src/Batch/BatchProcessor.jsx",
    "src/Safety/TemporaryObjectManager.jsx",
    "src/Safety/TransactionManager.jsx",
    "src/Safety/RollbackManager.jsx",
    "src/UI/UIHelpers.jsx",
    "src/UI/Dashboard.jsx",
    "src/UI/DetectionPanel.jsx",
    "src/UI/SectionPanel.jsx",
    "src/UI/MeasurementPanel.jsx",
    "src/UI/RulesPanel.jsx",
    "src/UI/PreviewPanel.jsx",
    "src/UI/BatchPanel.jsx",
    "src/UI/SettingsPanel.jsx",
    "src/UI/HelpPanel.jsx",
    "src/UI/MainWindow.jsx",
    "src/Main.jsx"
];

var UNSUPPORTED = [
    /\blet\b/, /\bconst\b/, /=>/, /\bclass\b/, /`/, /\basync\b/, /\bawait\b/,
    /\?\./, /\?\?/, /import\b/, /from\b/, /\bPromise\b/, /fetch\b/, /\beval\s*\(/
];

function readModules() {
    var parts = [];
    MODULES.forEach(function (rel) {
        var p = path.join(ROOT, rel);
        if (!fs.existsSync(p)) {
            throw new Error("Missing module: " + rel);
        }
        parts.push("/* === " + rel + " === */\n" + fs.readFileSync(p, "utf8") + "\n");
    });
    return parts.join("\n");
}

function es3Check(code) {
    var stripped = code
        .replace(/\/\*[\s\S]*?\*\//g, " ")
        .replace(/\/\/[^\n]*/g, " ");
    var problems = [];
    UNSUPPORTED.forEach(function (re, i) {
        var m = stripped.match(re);
        if (m) { problems.push("Pattern " + i + " (" + re + ") matched " + m.length + " time(s)"); }
    });
    return problems;
}

function main() {
    if (!fs.existsSync(DIST)) { fs.mkdirSync(DIST, { recursive: true }); }

    var body = readModules();
    var problems = es3Check(body);
    if (problems.length > 0) {
        console.error("ES3 compatibility check FAILED:");
        problems.forEach(function (p) { console.error(" - " + p); });
        process.exit(1);
    }

    var pkg = require(path.join(ROOT, "package.json"));
    var epochSec = process.env.SOURCE_DATE_EPOCH ? parseInt(process.env.SOURCE_DATE_EPOCH, 10) : Math.floor(Date.now() / 1000);
    var buildDate = new Date(epochSec * 1000).toISOString();
    var header = "/*\n";
    header += " * Illustrator Smart Spacing Manager Pro\n";
    header += " * v" + pkg.version + "\n";
    header += " * Build: " + buildDate + "\n";
    header += " * Adobe Illustrator ExtendScript (JSX) — ES3 compatible\n";
    header += " * Standalone: no CEP, UXP, Node.js, or external runtime required.\n";
    header += " */\n\n";

    var versionInject = "SSM.Constants.VERSION = \"" + pkg.version + "\";\nSSM.Constants.BUILD = \"" + buildDate + "\";\n\n";
    var output = header + versionInject + body;

    fs.writeFileSync(OUT, output, "utf8");

    var sha = crypto.createHash("sha256").update(fs.readFileSync(OUT)).digest("hex");
    var size = fs.statSync(OUT).size;

    // Write checksum file
    fs.writeFileSync(path.join(DIST, "Illustrator_Smart_Spacing_Manager_Pro.jsx.sha256"), sha + "\n", "utf8");

    console.log("Build OK:");
    console.log("  Output: " + OUT);
    console.log("  Size: " + size + " bytes");
    console.log("  SHA-256: " + sha);
    console.log("  Modules: " + MODULES.length);
    if (problems.length === 0) { console.log("  ES3 check: passed"); }
}

main();
