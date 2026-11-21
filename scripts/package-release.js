// Illustrator Smart Spacing Manager Pro
// scripts/package-release.js — Prepare release metadata and checksums
var fs = require("fs");
var path = require("path");
var crypto = require("crypto");

var ROOT = path.resolve(__dirname, "..");
var DIST = path.join(ROOT, "dist");
var JSX = path.join(DIST, "Illustrator_Smart_Spacing_Manager_Pro.jsx");

function main() {
    if (!fs.existsSync(JSX)) {
        console.error("FAIL: artifact missing: " + JSX);
        process.exit(1);
    }
    var pkg = require(path.join(ROOT, "package.json"));
    var epochSec = process.env.SOURCE_DATE_EPOCH ? parseInt(process.env.SOURCE_DATE_EPOCH, 10) : Math.floor(Date.now() / 1000);
    var buildDate = new Date(epochSec * 1000).toISOString();
    var data = fs.readFileSync(JSX);
    var sha = crypto.createHash("sha256").update(data).digest("hex");
    var size = data.length;
    var meta = {
        name: "Illustrator Smart Spacing Manager Pro",
        filename: "Illustrator_Smart_Spacing_Manager_Pro.jsx",
        version: pkg.version,
        size: size,
        sha256: sha,
        buildDate: buildDate,
        platform: "Adobe Illustrator ExtendScript (JSX)",
        es3Compatible: true,
        externalRuntime: false
    };
    fs.writeFileSync(path.join(DIST, "release-meta.json"), JSON.stringify(meta, null, 2), "utf8");
    fs.writeFileSync(path.join(DIST, "Illustrator_Smart_Spacing_Manager_Pro.jsx.sha256"), sha + "\n", "utf8");
    console.log("Release metadata:");
    console.log("  " + JSON.stringify(meta, null, 2));
}

main();
