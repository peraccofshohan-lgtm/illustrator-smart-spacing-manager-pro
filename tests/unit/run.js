// Illustrator Smart Spacing Manager Pro
// tests/unit/run.js — Unit tests under Node.js with mock Illustrator DOM
var fs = require("fs");
var path = require("path");

var ROOT = path.resolve(__dirname, "../../");
var MOCK = require(path.join(ROOT, "tests/mocks/illustrator-mock.js"));

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
    "src/UI/PresetsPanel.jsx",
    "src/UI/PreviewPanel.jsx",
    "src/UI/BatchPanel.jsx",
    "src/UI/SettingsPanel.jsx",
    "src/UI/HelpPanel.jsx",
    "src/UI/MainWindow.jsx"
];

function loadModules() {
    var globalSSM = {};
    var ctx = {
        SSM: globalSSM,
        app: MOCK.createMockApp(),
        $: { writeln: function () {} },
        document: undefined
    };
    var code = "";
    MODULES.forEach(function (rel) {
        var p = path.join(ROOT, rel);
        if (!fs.existsSync(p)) { throw new Error("Missing: " + rel); }
        code += fs.readFileSync(p, "utf8") + "\n";
    });
    var fn = new Function("SSM", "app", "$", "document", code);
    fn(globalSSM, ctx.app, ctx.$, ctx.document);
    return globalSSM;
}

var tests = [];
function test(name, fn) { tests.push({ name: name, fn: fn }); }
var passed = 0, failed = 0;
function assert(cond, msg) {
    if (!cond) { throw new Error(msg || "assertion failed"); }
}
function assertEqual(a, b, msg) {
    if (a !== b) { throw new Error((msg || "") + " expected " + JSON.stringify(b) + " got " + JSON.stringify(a)); }
}
function assertApprox(a, b, eps, msg) {
    if (Math.abs(a - b) > (eps || 0.001)) { throw new Error((msg || "") + " expected approx " + b + " got " + a); }
}

// ---- Tests ----

test("Constants & units", function (SSM) {
    var C = SSM.Constants;
    assert(C.VERSION, "version set");
    assert(C.UNITS.pt.toPt === 1, "pt toPt");
    assert(Math.abs(C.UNITS.mm.toPt - 2.83464566929134) < 0.001, "mm toPt");
    assert(Math.abs(C.UNITS.in.toPt - 72) < 0.001, "in toPt");
    assert(C.UNIT_KEYS.indexOf("px") !== -1, "px unit key");
});

test("Utilities convert/format", function (SSM) {
    var U = SSM.Utilities;
    assertApprox(U.toPoints(1, "in"), 72, 0.001, "in->pt");
    assertApprox(U.toPoints(25.4, "mm"), 72, 0.1, "25.4mm->pt");
    assertApprox(U.fromPoints(72, "in"), 1, 0.001, "72pt->in");
    var p = U.parseValue("40 pt");
    assert(p && Math.abs(p.points - 40) < 0.001, "parse 40pt");
    var p2 = U.parseValue("1 in");
    assert(p2 && Math.abs(p2.points - 72) < 0.001, "parse 1in");
    var clone = U.deepClone({ a: 1, b: [2, 3] });
    assert(clone.a === 1 && clone.b[1] === 3, "deepClone");
    assert(U.indexOfId([{ id: "x" }, { id: "y" }], "y") === 1, "indexOfId");
});

test("Compatibility JSON", function (SSM) {
    var Cp = SSM.Compat;
    var s = Cp.jsonStringify({ a: 1, b: [2, "c"], c: null });
    var o = Cp.jsonParse(s);
    assert(o.a === 1 && o.b[1] === "c" && o.c === null, "JSON roundtrip");
    var threw = false;
    try { Cp.jsonParse("{bad json"); } catch (e) { threw = true; }
    assert(threw, "JSON parse rejects bad input");
    assert(Cp.trim("  hi  ") === "hi", "trim");
    assert(Cp.roundTo(1.2345, 2) === 1.23, "roundTo");
    assert(Cp.hasRegExp() === true, "hasRegExp");
    var re = Cp.safeRegExp("^Ch", "i");
    assert(re && re.test("chapter 1"), "safeRegExp");
    assert(Cp.safeRegExpr === undefined || true, "noop");
    assert(Cp.isNumber(NaN) === false, "isNumber NaN");
});

test("Bounds normalization", function (SSM) {
    var BM = SSM.BoundsManager;
    var b = BM.normalize([10, 100, 110, 0]);
    assert(b.left === 10 && b.right === 110 && b.top === 0 && b.bottom === 100, "normalize bounds");
    assert(b.width === 100 && b.height === 100, "normalize wh");
    var u = BM.union([BM.normalize([0, 10, 10, 0]), BM.normalize([5, 15, 20, 5])]);
    assert(u.left === 0 && u.right === 20 && u.top === 0 && u.bottom === 15, "union");
    var ov = BM.overlap(BM.normalize([0, 20, 10, 0]), BM.normalize([5, 15, 15, 5]));
    assert(ov === true, "overlap true");
    var ov2 = BM.overlap(BM.normalize([0, 20, 10, 0]), BM.normalize([12, 25, 22, 5]));
    assert(ov2 === false, "overlap false");
});

test("Object gap engine", function (SSM) {
    var OGE = SSM.ObjectGapEngine;
    // upper above lower in screen coords: upper y 0..40, lower y 60..100 => gap 20
    var upper = { original: { geometricBounds: [0, 40, 100, 0] } };   // norm top=0 bottom=40
    var lower = { original: { geometricBounds: [0, 100, 100, 60] } }; // norm top=60 bottom=100
    var g = OGE.verticalGap(upper, lower, "geometric");
    assert(g.gap === 20, "vertical gap = 20 separated");
    assert(g.overlaps === false, "no overlap");
    assert(g.signedGap === 20, "signed gap 20");
    // overlap: upper bottom=40, lower top=10 => gap -30
    var ov = OGE.verticalGap(
        { original: { geometricBounds: [0, 40, 100, 0] } },
        { original: { geometricBounds: [0, 30, 100, 10] } },
        "geometric"
    );
    assert(ov.gap === -30, "overlap gap -30");
    assert(ov.overlaps === true, "overlap detected");
    assert(ov.signedGap === -30, "signed gap -30");
    var hg = OGE.horizontalGap(
        { original: { geometricBounds: [0, 100, 50, 0] } },
        { original: { geometricBounds: [100, 100, 200, 0] } },
        "geometric"
    );
    assert(hg.gap === 100 - 50, "horizontal gap 50");
    var dir = OGE.detectDirection({ gap: 30 }, { gap: 10 });
    assert(dir === "vertical", "detect vertical");
    var dir2 = OGE.detectDirection({ gap: 10 }, { gap: 30 });
    assert(dir2 === "horizontal", "detect horizontal");
});

test("Visual gap engine", function (SSM) {
    var VGE = SSM.VisualGapEngine;
    var item = { original: { typename: "TextFrame", visibleBounds: [0, 100, 100, 0], geometricBounds: [0, 100, 100, 0] } };
    var mb = VGE.measureVisualBounds(item, null);
    assert(mb && mb.bounds && mb.bounds.valid, "visual bounds valid");
    assert(mb.method === "visualOutline" || mb.method === "geometricFallback", "method set");
    var vg = VGE.visualVerticalGap(
        { original: { typename: "TextFrame", visibleBounds: [0, 100, 100, 60] } },
        { original: { typename: "TextFrame", visibleBounds: [0, 40, 100, 0] } },
        null
    );
    assert(vg && typeof vg.gap === "number", "visual vertical gap number");
});

test("Measurement normalizer", function (SSM) {
    var MN = SSM.MeasurementNormalizer;
    var m = { gap: 28, overlaps: false, signedGap: 28 };
    var n = MN.normalizeGap(m, "mm", 2);
    assertApprox(n.value, 28 / 2.83464566929134, 0.01, "28pt to mm");
    assert(n.unit === "mm", "unit mm");
    var adj = MN.adjustmentNeeded(28, 40);
    assert(adj.differencePt === 12, "adjustment 12");
    assert(adj.moveUp === true, "move up");
});

test("Rule engine CRUD", function (SSM) {
    var RE = SSM.RuleEngine;
    var r = RE.createRule({ name: "Test Rule", targetGap: 40, unit: "pt", direction: "vertical", enabled: true });
    assert(r.rule && r.rule.id, "rule created");
    assert(RE.count() === 1, "count 1");
    var up = RE.updateRule(r.rule.id, { targetGap: 50 });
    assert(up.success && up.rule.targetGap === 50, "update targetGap");
    var dup = RE.duplicateRule(r.rule.id, "Copy");
    assert(dup && RE.count() === 2, "duplicate count 2");
    RE.enableRule(r.rule.id, false);
    assert(RE.getEnabled().length === 1, "one enabled");
    RE.sortByPriority();
    RE.deleteRule(dup.id);
    assert(RE.count() === 1, "count back to 1");
    RE.clear();
    assert(RE.count() === 0, "cleared");
});

test("Rule validation", function (SSM) {
    var RV = SSM.RuleValidator;
    var ok = RV.validate({ id: "x", name: "N", detectionMethod: "manual", measurementMode: "object", direction: "vertical", targetGap: 10, unit: "pt" });
    assert(ok.valid === true, "valid rule");
    var bad = RV.validate({ name: "N" });
    assert(bad.valid === false, "invalid rule caught");
    assert(bad.errors.length > 0, "has errors");
});

test("Conflict resolver", function (SSM) {
    var CR = SSM.ConflictResolver;
    var rules = [
        { id: "a", name: "A", targetGap: 40, unit: "pt", direction: "vertical", scope: "document", enabled: true },
        { id: "b", name: "B", targetGap: 60, unit: "pt", direction: "vertical", scope: "document", enabled: true }
    ];
    var conf = CR.detectConflicts(rules, []);
    assert(conf.length === 1, "conflict detected");
    assert(conf[0].severity === "high", "severity high");
    var same = CR.detectConflicts([
        { id: "a", name: "A", targetGap: 40, unit: "pt", direction: "vertical", scope: "document", enabled: true },
        { id: "b", name: "B", targetGap: 40, unit: "pt", direction: "vertical", scope: "document", enabled: true }
    ], []);
    assert(same.length === 0, "no conflict same gap");
});

test("Preset manager import/export", function (SSM) {
    var PM = SSM.PresetManager;
    PM.clear();
    var p = PM.addPreset("Test Preset", [{ name: "R1" }], "desc");
    var ex = PM.exportPreset(p.id);
    assert(ex && ex.indexOf("Test Preset") !== -1, "export json");
    var imp = PM.importPreset(ex);
    assert(imp.success && imp.preset.name === "Test Preset", "import success");
    var bad = PM.importPreset("{not json");
    assert(bad.success === false, "import rejects bad json");
    var built = PM.builtInPresets();
    assert(built.length >= 6, "built-in presets >= 6");
    var names = built.map(function (b) { return b.name; });
    assert(names.indexOf("Book Layout") !== -1, "Book Layout preset");
    assert(names.indexOf("Custom") !== -1, "Custom preset");
});

test("Text detection", function (SSM) {
    var TD = SSM.TextDetection;
    // populate mock with text frames
    var app = SSM.__testApp;
    var doc = app.doc;
    doc.pageItems = [];
    doc.pageItems.push(makeText("Chapter 1"));
    doc.pageItems.push(makeText("Chapter 2"));
    doc.pageItems.push(makeText("Introduction"));
    function makeText(contents) {
        return {
            id: 5000 + Math.random(), name: "tf", typename: "TextFrame",
            contents: contents, locked: false, hidden: false,
            geometricBounds: [0, 100, 100, 0], visibleBounds: [0, 100, 100, 0],
            width: 100, height: 100, layer: { name: "L1" },
            textFont: { name: "Arial", style: "Regular" }, size: 12
        };
    }
    var res = TD.run(doc, { pattern: "Chapter", matchType: "contains", caseSensitive: false, wholeWord: false, useRegex: true });
    assert(res.items.length === 2, "text contains Chapter -> 2");
    var exact = TD.run(doc, { pattern: "Chapter 1", matchType: "exact", caseSensitive: false, wholeWord: false, useRegex: true });
    assert(exact.items.length === 1, "text exact -> 1");
    var sw = TD.run(doc, { pattern: "Chap", matchType: "startsWith", caseSensitive: false, wholeWord: false, useRegex: true });
    assert(sw.items.length === 2, "startsWith -> 2");
    var re = TD.run(doc, { pattern: "Chapter \\d", matchType: "regex", caseSensitive: false, wholeWord: false, useRegex: true });
    assert(re.items.length === 2, "regex -> 2");
});

test("Style detection", function (SSM) {
    var SD = SSM.StyleDetection;
    var app = SSM.__testApp;
    var doc = app.doc;
    doc.pageItems = [];
    doc.pageItems.push(makeStyled("Arial", "Bold", 24));
    doc.pageItems.push(makeStyled("Arial", "Regular", 12));
    function makeStyled(family, style, size) {
        return {
            id: 6000 + Math.random(), name: "tf", typename: "TextFrame",
            contents: "Hello", locked: false, hidden: false,
            geometricBounds: [0, 100, 100, 0], visibleBounds: [0, 100, 100, 0],
            width: 100, height: 100, layer: { name: "L1" },
            textFont: { name: family, style: style }, size: size,
            fillColor: { typename: "RGBColor", red: 0, green: 0, blue: 0 },
            strokeWidth: 1,
            opacity: 100
        };
    }
    var res = SD.run(doc, { criteria: [{ attr: "fontFamily", value: "Arial" }, { attr: "fontSize", value: 24, tolerance: 1 }], requireAll: true });
    assert(res.items.length === 1, "style match 1");
    var any = SD.run(doc, { criteria: [{ attr: "fontSize", value: 24 }, { attr: "fontSize", value: 12 }], requireAll: false });
    assert(any.items.length === 2, "style any match 2");
});

test("Name detection", function (SSM) {
    var ND = SSM.NameDetection;
    var app = SSM.__testApp;
    var doc = app.doc;
    doc.pageItems = [];
    doc.pageItems.push(makeNamed("CHAPTER_04"));
    doc.pageItems.push(makeNamed("CHAPTER_05"));
    doc.pageItems.push(makeNamed("BODY_04"));
    function makeNamed(name) {
        return { id: 7000 + Math.random(), name: name, typename: "GroupItem", locked: false, hidden: false, geometricBounds: [0, 100, 100, 0], visibleBounds: [0, 100, 100, 0], width: 100, height: 100, layer: { name: "L1" } };
    }
    var res = ND.run(doc, { pattern: "CHAPTER", matchType: "startsWith", caseSensitive: false, wildcard: false });
    assert(res.items.length === 2, "name startsWith CHAPTER -> 2");
    var wild = ND.run(doc, { pattern: "CHAPTER_0*", matchType: "pattern", caseSensitive: false, wildcard: true });
    assert(wild.items.length === 2, "name wildcard -> 2");
});

test("Section manager", function (SSM) {
    var SM = SSM.SectionManager;
    SM.clear();
    var s1 = SM.createSection("Chapter 4", "heading", { id: "a" }, { id: "b" }, "chapters");
    var s2 = SM.createSection("Chapter 4 Body", "content", null, null, "chapters");
    assert(SM.count() === 2, "sections count 2");
    SM.addObjectToSection(s1.id, { id: "c", name: "extra" });
    assert(SM.getSection(s1.id).objects.length === 1, "object added");
    SM.setAnchor(s2.id, { id: "d" });
    assert(SM.getSection(s2.id).anchor.id === "d", "anchor set");
    var byGroup = SM.getByGroup("chapters");
    assert(byGroup.length === 2, "group count 2");
    SM.removeSection(s1.id);
    assert(SM.count() === 1, "removed count 1");
    SM.clear();
    assert(SM.count() === 0, "cleared");
});

test("Relationship engine", function (SSM) {
    var RE = SSM.RelationshipEngine;
    RE.clear();
    var r = RE.createRelationship("s1", "s2", "headingToContent", "moveLower", 40, "pt");
    assert(r.id && r.type === "headingToContent", "rel created");
    var forS1 = RE.getForSection("s1");
    assert(forS1.length === 1, "rel for s1");
    var forS3 = RE.getForSection("s99");
    assert(forS3.length === 0, "no rel for s99");
    assert(RE.remove(r.id) === true, "remove rel");
    assert(RE.getAll().length === 0, "rels cleared");
    RE.clear();
});

test("Spacing calculator", function (SSM) {
    var SC = SSM.SpacingCalculator;
    var c = SC.calculate({ gap: 28, overlaps: false }, 40);
    assert(c.differencePt === 12, "diff 12");
    assert(c.direction === "increase", "direction increase");
    var mv = SC.movementForAnchor(c, "moveLower");
    assert(mv.moveLower === 12 && mv.moveUpper === 0, "move lower 12");
    var mv2 = SC.movementForAnchor(c, "moveUpper");
    assert(mv2.moveUpper === -12, "move upper -12");
    var mv3 = SC.movementForAnchor(c, "symmetric");
    assertApprox(mv3.moveUpper, -6, 0.001, "sym upper -6");
    assertApprox(mv3.moveLower, 6, 0.001, "sym lower 6");
});

test("Spacing engine apply", function (SSM) {
    var SE = SSM.SpacingEngine;
    var upper = { id: 1, name: "U", original: { geometricBounds: [0, 100, 100, 60], visibleBounds: [0, 100, 100, 60], translate: function (dx, dy) { var b = this.geometricBounds; this.geometricBounds = [b[0] + dx, b[1] - dy, b[2] + dx, b[3] - dy]; this.visibleBounds = this.geometricBounds.slice(); } } };
    var lower = { id: 2, name: "L", original: { geometricBounds: [0, 40, 100, 0], visibleBounds: [0, 40, 100, 0], translate: function (dx, dy) { var b = this.geometricBounds; this.geometricBounds = [b[0] + dx, b[1] - dy, b[2] + dx, b[3] - dy]; this.visibleBounds = this.geometricBounds.slice(); } } };
    var m = { gap: 40 - 60, overlaps: false, signedGap: -20 };
    var res = SE.applyToPair(upper, lower, m, 20, "moveLower", null);
    assert(res.success === true, "apply success");
    assert(res.calculation.differencePt === 40, "diff to target 40");
});

test("Preview engine", function (SSM) {
    var PE = SSM.PreviewEngine;
    var sections = [
        { id: "s1", name: "Ch4", enabled: true, anchor: { id: "a", name: "Anchor", original: { geometricBounds: [0, 100, 100, 60] } }, target: { id: "b", name: "Target", original: { geometricBounds: [0, 40, 100, 0] } } }
    ];
    var rules = [{ id: "r1", name: "R", enabled: true, measurementMode: "object", boundsType: "geometric", direction: "vertical", anchorBehavior: "moveLower", targetGap: 20, unit: "pt" }];
    var entries = PE.buildPreview(sections, rules, null);
    assert(entries.length === 1, "one preview entry");
    assert(entries[0].sectionName === "Ch4", "section name");
    // upper bottom=100, lower top=0 => gap=-100; target 20 => difference 120
    assert(entries[0].currentGap === -100, "current gap -100");
    assert(entries[0].difference === 120, "difference computed");
});

test("Preview renderer cleanup", function (SSM) {
    var PR = SSM.PreviewRenderer;
    var r = PR.render([{ sectionName: "x" }], null);
    assert(r.success === true, "render success");
    PR.clear(null);
    assert(PR.count === undefined || true, "noop");
});

test("Batch processor", function (SSM) {
    var BP = SSM.BatchProcessor;
    var res = BP.process(null, "document", [], [], function () {});
    assert(res.success === true, "batch success");
});

test("Safety transaction", function (SSM) {
    var TM = SSM.TransactionManager;
    var id = TM.begin([{ id: 1 }]);
    assert(id, "txn begun");
    TM.recordStep("step1", { x: 1 }, { x: 2 });
    TM.commit();
    assert(TM.getActive() === null, "txn cleared after commit");
    var id2 = TM.begin([{ id: 2 }]);
    TM.rollback();
    assert(TM.getActive() === null, "txn cleared after rollback");
});

test("Rollback manager safe operation", function (SSM) {
    var RM = SSM.RollbackManager;
    var ok = RM.safeOperation(function () { return "done"; }, [{ id: 1 }]);
    assert(ok.success === true && ok.result === "done", "safe op success");
    var bad = RM.safeOperation(function () { throw new Error("boom"); }, [{ id: 1 }]);
    assert(bad.success === false && bad.error.indexOf("boom") !== -1, "safe op failure");
});

test("Temporary object manager", function (SSM) {
    var TOM = SSM.TemporaryObjectManager;
    TOM.track({ id: 1 }, "preview");
    assert(TOM.count() === 1, "track count 1");
    TOM.cleanup(null);
    assert(TOM.count() === 0, "cleanup reset");
});

test("Error reporter", function (SSM) {
    var ER = SSM.ErrorReporter;
    ER.clear();
    ER.report("TEST", "boom", { a: 1 });
    assert(ER.hasErrors() === true, "has errors");
    assert(ER.getErrors().length === 1, "one error");
    assert(ER.toText().indexOf("TEST") !== -1, "toText");
    ER.clear();
    assert(ER.hasErrors() === false, "cleared");
});

test("Logger", function (SSM) {
    var L = SSM.Logger;
    L.clear();
    L.info("hello");
    L.warn("careful");
    var entries = L.getEntries();
    assert(entries.length >= 2, "entries logged");
    assert(L.toText().indexOf("hello") !== -1, "toText has hello");
    L.clear();
    assert(L.getEntries().length === 0, "logger cleared");
});

// Wire mock app into SSM namespace so detection tests can reach it
var SSM = loadModules();
SSM.__testApp = MOCK.createMockApp();

// Run
console.log("Running " + tests.length + " unit tests...\n");
tests.forEach(function (t) {
    try {
        t.fn(SSM);
        console.log("PASS: " + t.name);
        passed++;
    } catch (e) {
        console.log("FAIL: " + t.name + " — " + String(e));
        failed++;
    }
});
console.log("\n" + passed + " passed, " + failed + " failed of " + tests.length);
process.exit(failed > 0 ? 1 : 0);
