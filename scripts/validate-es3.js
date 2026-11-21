// Illustrator Smart Spacing Manager Pro
// scripts/validate-es3.js — Static ES3 compatibility check on the built JSX
var fs = require("fs");
var path = require("path");

var ROOT = path.resolve(__dirname, "..");
var JSX = path.join(ROOT, "dist", "Illustrator_Smart_Spacing_Manager_Pro.jsx");

var UNSUPPORTED = [
    { name: "let", re: /\blet\b/ },
    { name: "const", re: /\bconst\b/ },
    { name: "arrow functions", re: /=>/ },
    { name: "classes", re: /\bclass\b/ },
    { name: "template literals", re: /`/ },
    { name: "async", re: /\basync\b/ },
    { name: "await", re: /\bawait\b/ },
    { name: "optional chaining", re: /\?\./ },
    { name: "nullish coalescing", re: /\?\?/ },
    { name: "import", re: /\bimport\b/ },
    { name: "Promise", re: /\bPromise\b/ },
    { name: "fetch", re: /\bfetch\b/ },
    { name: "eval", re: /\beval\s*\(/ }
];

function main() {
    if (!fs.existsSync(JSX)) {
        console.error("Build artifact not found: " + JSX);
        process.exit(1);
    }
    var code = fs.readFileSync(JSX, "utf8");
    // Strip comments so words like "import/export" in documentation don't false-positive
    var stripped = code
        .replace(/\/\*[\s\S]*?\*\//g, " ")
        .replace(/\/\/[^\n]*/g, " ");
    var failed = 0;
    UNSUPPORTED.forEach(function (item) {
        var matches = stripped.match(item.re);
        var count = matches ? matches.length : 0;
        if (count > 0) {
            console.error("FAIL: ES3-unsupported feature '" + item.name + "' found " + count + " time(s)");
            failed++;
        } else {
            console.log("OK: no '" + item.name + "'");
        }
    });
    // Check header presence
    if (code.indexOf("Illustrator Smart Spacing Manager Pro") === -1) {
        console.error("FAIL: missing version header");
        failed++;
    }
    if (failed > 0) {
        console.error("\nES3 validation FAILED with " + failed + " issue(s)");
        process.exit(1);
    }
    console.log("\nES3 validation PASSED");
}

main();
