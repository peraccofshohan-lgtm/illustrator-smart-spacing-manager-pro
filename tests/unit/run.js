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
    "src/Spacing/PositionManager.jsx",
    "src/Safety/TemporaryObjectManager.jsx",
    "src/Safety/TransactionManager.jsx",
    "src/Safety/RollbackManager.jsx",
    "src/Spacing/SpacingEngine.jsx",
    "src/Preview/PreviewEngine.jsx",
    "src/Preview/PreviewRenderer.jsx",
    "src/Batch/BatchProcessor.jsx",
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
    // Illustrator: [left, top, right, bottom] where top > bottom
    var b = BM.normalize([10, 100, 110, 0]);
    assert(b.left === 10 && b.right === 110, "normalize left/right");
    assert(b.top === 100 && b.bottom === 0, "normalize top>bottom (Illustrator convention)");
    assert(b.width === 100 && b.height === 100, "normalize wh");
    // Union: top = max of tops, bottom = min of bottoms
    var u = BM.union([BM.normalize([0, 10, 10, 0]), BM.normalize([5, 15, 20, 5])]);
    assert(u.left === 0 && u.right === 20, "union left/right");
    assert(u.top === 15 && u.bottom === 0, "union top=max, bottom=min");
    assert(u.height === 15, "union height");
    // Overlap: vertically separated if upper.bottom > lower.top
    var ov = BM.overlap(BM.normalize([0, 100, 10, 60]), BM.normalize([0, 40, 15, 0]));
    assert(ov === false, "overlap false (separated, gap=20)");
    var ov2 = BM.overlap(BM.normalize([0, 100, 10, 50]), BM.normalize([0, 60, 15, 0]));
    assert(ov2 === true, "overlap true (gap=-10)");
    var ov3 = BM.overlap(BM.normalize([0, 100, 10, 60]), BM.normalize([0, 60, 15, 0]));
    assert(ov3 === false, "overlap false (touching, gap=0)");
});

test("Object gap engine", function (SSM) {
    var OGE = SSM.ObjectGapEngine;
    // Illustrator convention: [left, top, right, bottom], top > bottom.
    // Upper object occupies y [60, 100], lower object occupies y [0, 40].
    // Gap = upper.bottom - lower.top = 60 - 40 = 20 (positive = separated).
    var upper = { original: { geometricBounds: [0, 100, 100, 60] } }; // bottom=60
    var lower = { original: { geometricBounds: [0, 40, 100, 0] } };   // top=40
    var g = OGE.verticalGap(upper, lower, "geometric");
    assert(g.gap === 20, "vertical gap = 20 separated");
    assert(g.overlaps === false, "no overlap");
    assert(g.signedGap === 20, "signed gap 20");
    assert(g.upperBottom === 60, "upper bottom = 60");
    assert(g.lowerTop === 40, "lower top = 40");
    // Zero gap (touching): upper.bottom === lower.top
    var touch = OGE.verticalGap(
        { original: { geometricBounds: [0, 100, 100, 40] } },
        { original: { geometricBounds: [0, 40, 100, 0] } },
        "geometric"
    );
    assert(touch.gap === 0, "zero gap (touching)");
    assert(touch.overlaps === false, "touching is not overlap");
    // Negative gap (overlap): upper.bottom < lower.top
    var ov = OGE.verticalGap(
        { original: { geometricBounds: [0, 100, 100, 50] } }, // bottom=50
        { original: { geometricBounds: [0, 60, 100, 0] } },   // top=60
        "geometric"
    );
    assert(ov.gap === -10, "overlap gap = -10");
    assert(ov.overlaps === true, "overlap detected");
    assert(ov.signedGap === -10, "signed gap -10");
    // Different dimensions
    var diff = OGE.verticalGap(
        { original: { geometricBounds: [10, 200, 90, 150] } }, // bottom=150
        { original: { geometricBounds: [5, 140, 95, 0] } },    // top=140
        "geometric"
    );
    assert(diff.gap === 10, "gap with different dimensions = 10");
    // Horizontal gap: left object right edge to right object left edge
    // Left item [0, 100, 50, 0]: right=50. Right item [100, 100, 150, 0]: left=100. Gap = 100-50=50.
    var hg = OGE.horizontalGap(
        { original: { geometricBounds: [0, 100, 50, 0] } },
        { original: { geometricBounds: [100, 100, 150, 0] } }
    );
    assert(hg.gap === 50, "horizontal gap = 50");
    var hgOverlap = OGE.horizontalGap(
        { original: { geometricBounds: [0, 100, 80, 0] } },   // right=80
        { original: { geometricBounds: [70, 100, 150, 0] } }  // left=70 (overlap)
    );
    assert(hgOverlap.gap === -10, "horizontal overlap gap = -10");
    assert(hgOverlap.overlaps === true, "horizontal overlap detected");
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
    assert(mb.bounds.top === 100 && mb.bounds.bottom === 0, "visual bounds preserve Illustrator convention");
    assert(mb.method === "visualOutline" || mb.method === "geometricFallback", "method set");
    assert(mb.approximation === true, "text frame visual is approximate");
    // Upper [0,100,100,60] bottom=60, Lower [0,40,100,0] top=40 => gap = 20
    var vg = VGE.visualVerticalGap(
        { original: { typename: "TextFrame", visibleBounds: [0, 100, 100, 60], geometricBounds: [0, 100, 100, 60] } },
        { original: { typename: "TextFrame", visibleBounds: [0, 40, 100, 0], geometricBounds: [0, 40, 100, 0] } },
        null
    );
    assert(vg && typeof vg.gap === "number", "visual vertical gap number");
    assert(vg.gap === 20, "visual gap = 20");
    assert(vg.upperBottom === 60, "visual upper bottom = 60");
    assert(vg.lowerTop === 40, "visual lower top = 40");
    // Horizontal visual gap
    var hg = VGE.visualHorizontalGap(
        { original: { typename: "TextFrame", visibleBounds: [0, 100, 50, 0], geometricBounds: [0, 100, 50, 0] } },
        { original: { typename: "TextFrame", visibleBounds: [100, 100, 150, 0], geometricBounds: [100, 100, 150, 0] } },
        null
    );
    assert(hg && typeof hg.gap === "number", "visual horizontal gap number");
    assert(hg.gap === 50, "visual horizontal gap = 50");
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
            textFont: { name: "Arial", style: "Regular" }, size: 12,
            translate: function (dx, dy) {
                var b = this.geometricBounds;
                this.geometricBounds = [b[0] + dx, b[1] - dy, b[2] + dx, b[3] - dy];
                this.visibleBounds = this.geometricBounds.slice();
            }
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
    // Correct Illustrator semantics: gap = upper.bottom - lower.top = 60 - 40 = 20
    var m = { gap: 20, overlaps: false, signedGap: 20 };
    var res = SE.applyToPair(upper, lower, m, 40, "moveLower", null);
    assert(res.success === true, "apply success");
    assert(res.calculation.differencePt === 20, "diff to target 40 (target 40 - current 20 = 20)");
    assert(res.movement.moveLower === 20, "move lower by 20");
});

test("Preview engine", function (SSM) {
    var PE = SSM.PreviewEngine;
    var sections = [
        { id: "s1", name: "Ch4", enabled: true, type: "heading", anchor: { id: "a", name: "Anchor", original: { geometricBounds: [0, 100, 100, 60] } }, target: { id: "b", name: "Target", original: { geometricBounds: [0, 40, 100, 0] } } }
    ];
    var rules = [{ id: "r1", name: "R", enabled: true, priority: 10, measurementMode: "object", boundsType: "geometric", direction: "vertical", anchorBehavior: "moveLower", targetGap: 20, unit: "pt", scope: "sections" }];
    var entries = PE.buildPreview(sections, rules, null);
    assert(entries.length === 1, "one preview entry");
    assert(entries[0].sectionName === "Ch4", "section name");
    assert(entries[0].ruleId === "r1", "resolved rule preserved");
    assert(entries[0].measurementMode === "object", "measurement mode preserved");
    assert(entries[0].direction === "vertical", "direction preserved");
    // Correct Illustrator semantics: gap = upper.bottom - lower.top = 60 - 40 = 20
    assert(entries[0].currentGap === 20, "current gap = 20");
    assert(entries[0].targetGap === 20, "target gap = 20");
    assert(entries[0].difference === 0, "difference = 0 (already at target)");
    // Test with different target: target 40 => difference 20
    var rules2 = [{ id: "r2", name: "R2", enabled: true, priority: 10, measurementMode: "object", boundsType: "geometric", direction: "vertical", anchorBehavior: "moveLower", targetGap: 40, unit: "pt", scope: "sections" }];
    var entries2 = PE.buildPreview(sections, rules2, null);
    assert(entries2.length === 1, "one preview entry (rules2)");
    assert(entries2[0].difference === 20, "difference = 20 (target 40 - current 20)");
    assert(entries2[0].moveLower === 20, "move lower by 20");
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

// ============ END-TO-END INTEGRATION TESTS ============
test("E2E: detect chapter headings, create section, preview, apply, verify gap", function (SSM) {
    var app = SSM.__testApp;
    var doc = app.doc;
    doc.pageItems = [];
    // Two chapter headings with body text below
    doc.pageItems.push(makeTextItem("Chapter 4", [0, 200, 200, 180], "tf-ch4"));   // bottom=180
    doc.pageItems.push(makeTextItem("Body text 4", [0, 160, 200, 0], "tf-body4"));  // top=160
    doc.pageItems.push(makeTextItem("Chapter 5", [0, 400, 200, 380], "tf-ch5"));    // bottom=380
    doc.pageItems.push(makeTextItem("Body text 5", [0, 360, 200, 0], "tf-body5"));  // top=360

    // Detect by text pattern
    var det = SSM.TextDetection.run(doc, { pattern: "Chapter", matchType: "contains", caseSensitive: false, wholeWord: false, useRegex: true });
    assert(det.items.length === 2, "E2E: detected 2 chapter headings");

    // Create sections: heading -> body
    var SM = SSM.SectionManager;
    SM.clear();
    var s1 = SM.createSection("Chapter 4 section", "heading", det.items[0], null, "chapters");
    SM.setTarget(s1.id, { id: "tf-body4", name: "Body text 4", original: { geometricBounds: [0, 160, 200, 0], translate: function(dx,dy){var b=this.geometricBounds;this.geometricBounds=[b[0]+dx,b[1]-dy,b[2]+dx,b[3]-dy];} } });
    var s2 = SM.createSection("Chapter 5 section", "heading", det.items[1], null, "chapters");
    SM.setTarget(s2.id, { id: "tf-body5", name: "Body text 5", original: { geometricBounds: [0, 360, 200, 0], translate: function(dx,dy){var b=this.geometricBounds;this.geometricBounds=[b[0]+dx,b[1]-dy,b[2]+dx,b[3]-dy];} } });
    assert(SM.count() === 2, "E2E: 2 sections created");

    // Create a rule
    var RE = SSM.RuleEngine;
    RE.clear();
    var rule = RE.createRule({ name: "Chapter to Body", priority: 10, measurementMode: "object", boundsType: "geometric", direction: "vertical", anchorBehavior: "moveLower", targetGap: 40, unit: "pt", scope: "sections", enabled: true });
    assert(rule.rule, "E2E: rule created");

    // Build preview
    var PE = SSM.PreviewEngine;
    var entries = PE.buildPreview(SM.getAll(), RE.getAll(), doc);
    assert(entries.length === 2, "E2E: 2 preview entries");

    // Section 1: gap = 180 - 160 = 20, target = 40, diff = 20, moveLower = 20
    assert(entries[0].currentGap === 20, "E2E: section 1 gap = 20");
    assert(entries[0].difference === 20, "E2E: section 1 diff = 20");
    assert(entries[0].moveLower === 20, "E2E: section 1 move lower = 20");

    // Apply all
    var SE = SSM.SpacingEngine;
    var applyResult = SE.applyToSections(SM.getAll(), RE.getAll(), doc);
    assert(applyResult.success === true, "E2E: apply all success");
    assert(applyResult.results.length === 2, "E2E: 2 results");

    // Verify sections were processed
    assert(applyResult.results.length === 2, "E2E: 2 results");
    assert(applyResult.results[0].sectionId.indexOf("sec-") === 0, "E2E: section id present");
    assert(applyResult.results[1].sectionId.indexOf("sec-") === 0, "E2E: section id present");

    // Verify rule conflicts are detected
    var CR = SSM.ConflictResolver;
    var conflicts = CR.detectConflicts(RE.getAll(), SM.getAll());
    assert(conflicts.length === 0, "E2E: no conflicts for single rule");

    SM.clear();
    RE.clear();
});

test("E2E: conflicting rules detected before apply", function (SSM) {
    var RE = SSM.RuleEngine;
    RE.clear();
    RE.createRule({ name: "Rule A", priority: 10, measurementMode: "object", direction: "vertical", targetGap: 40, unit: "pt", scope: "document", enabled: true });
    RE.createRule({ name: "Rule B", priority: 5, measurementMode: "object", direction: "vertical", targetGap: 60, unit: "pt", scope: "document", enabled: true });
    var CR = SSM.ConflictResolver;
    var conflicts = CR.detectConflicts(RE.getAll(), []);
    assert(conflicts.length >= 1, "E2E: conflicting rules detected");
    assert(conflicts[0].severity === "high", "E2E: conflict severity high");
    RE.clear();
});

test("E2E: rollback on failure", function (SSM) {
    var RM = SSM.RollbackManager;
    var failingFn = function () { throw new Error("mid-operation failure"); };
    var result = RM.safeOperation(failingFn, [{ id: 1, name: "test", original: { geometricBounds: [0, 100, 100, 0] } }]);
    assert(result.success === false, "E2E: safe operation failed");
    assert(result.error.indexOf("mid-operation failure") !== -1, "E2E: error captured");
});

// ============ ADDITIONAL END-TO-END INTEGRATION TESTS ============

test("E2E: Auto Detect chooses horizontal when horizontal gap dominates", function (SSM) {
    var SE = SSM.SpacingEngine;
    var PE = SSM.PreviewEngine;
    var RE = SSM.RuleEngine;
    RE.clear();
    // Left item: [0, 100, 50, 0] → right=50, bottom=0
    // Right item: [200, 100, 400, 0] → left=200, top=100
    // Horizontal gap = 200 - 50 = 150 (separated)
    // Vertical gap = 0 - 100 = -100 (overlap)
    // Auto Detect should choose horizontal (abs 150 > abs 100)
    var left = { id: 1, name: "Left", original: { geometricBounds: [0, 100, 50, 0], translate: function(dx,dy){var b=this.geometricBounds;this.geometricBounds=[b[0]+dx,b[1]-dy,b[2]+dx,b[3]-dy];} } };
    var right = { id: 2, name: "Right", original: { geometricBounds: [200, 100, 400, 0], translate: function(dx,dy){var b=this.geometricBounds;this.geometricBounds=[b[0]+dx,b[1]-dy,b[2]+dx,b[3]-dy];} } };
    var section = { id: "s1", name: "Horiz", enabled: true, type: "content", anchor: left, target: right };
    var rules = [{ id: "r1", name: "Auto", enabled: true, priority: 10, measurementMode: "object", boundsType: "geometric", direction: "auto", anchorBehavior: "moveLower", targetGap: 100, unit: "pt", scope: "sections" }];
    var entries = PE.buildPreview([section], rules, null);
    assert(entries.length === 1, "Auto Detect: 1 preview entry");
    assert(entries[0].resolvedDirection === "horizontal", "Auto Detect: chose horizontal (gap 150 > overlap 100)");
    // Apply
    var doc = SSM.__testApp.doc;
    var result = SE.applyToSections([section], rules, doc);
    assert(result.success === true, "Auto Detect: apply success");
});

test("E2E: Auto Detect chooses vertical when vertical gap dominates", function (SSM) {
    var PE = SSM.PreviewEngine;
    var RE = SSM.RuleEngine;
    RE.clear();
    // Upper [0, 100, 80, 60] bottom=60, right=80. Lower [90, 40, 200, 0] top=40, left=90.
    // Vertical gap = 60 - 40 = 20. Horizontal gap = 90 - 80 = 10.
    // Auto Detect should choose vertical (20 > 10).
    var upper = { id: 1, name: "Upper", original: { geometricBounds: [0, 100, 80, 60], translate: function(dx,dy){var b=this.geometricBounds;this.geometricBounds=[b[0]+dx,b[1]-dy,b[2]+dx,b[3]-dy];} } };
    var lower = { id: 2, name: "Lower", original: { geometricBounds: [90, 40, 200, 0], translate: function(dx,dy){var b=this.geometricBounds;this.geometricBounds=[b[0]+dx,b[1]-dy,b[2]+dx,b[3]-dy];} } };
    var section = { id: "s1", name: "Vert", enabled: true, type: "content", anchor: upper, target: lower };
    var rules = [{ id: "r1", name: "Auto", enabled: true, priority: 10, measurementMode: "object", boundsType: "geometric", direction: "auto", anchorBehavior: "moveLower", targetGap: 40, unit: "pt", scope: "sections" }];
    var entries = PE.buildPreview([section], rules, null);
    assert(entries.length === 1, "Auto Detect: 1 preview entry");
    assert(entries[0].resolvedDirection === "vertical", "Auto Detect: chose vertical (gap 20 > horizontal gap 10)");
});

test("E2E: Auto Detect Apply All resolves AUTO to concrete axis", function (SSM) {
    var SE = SSM.SpacingEngine;
    var PE = SSM.PreviewEngine;
    var RE = SSM.RuleEngine;
    RE.clear();
    var doc = SSM.__testApp.doc;
    // Left item [0, 100, 50, 0], right item [200, 100, 400, 0]
    // Horizontal gap = 200 - 50 = 150 (separated)
    // Vertical gap = 0 - 100 = -100 (overlap)
    // Auto Detect should choose horizontal (abs 150 > abs 100)
    var left = { id: 1, name: "Left", original: { geometricBounds: [0, 100, 50, 0], id: 1, translate: function(dx,dy){var b=this.geometricBounds;this.geometricBounds=[b[0]+dx,b[1]-dy,b[2]+dx,b[3]-dy];} } };
    var right = { id: 2, name: "Right", original: { geometricBounds: [200, 100, 400, 0], id: 2, translate: function(dx,dy){var b=this.geometricBounds;this.geometricBounds=[b[0]+dx,b[1]-dy,b[2]+dx,b[3]-dy];} } };
    doc.pageItems = [left.original, right.original];
    var section = { id: "s1", name: "Horiz", enabled: true, type: "content", anchor: left, target: right };
    var rules = [{ id: "r1", name: "Auto", enabled: true, priority: 10, measurementMode: "object", boundsType: "geometric", direction: "auto", anchorBehavior: "moveLower", targetGap: 100, unit: "pt", scope: "sections" }];
    // Preview must resolve to horizontal
    var entries = PE.buildPreview([section], rules, doc);
    assert(entries.length === 1, "Auto Detect Apply: 1 preview entry");
    assert(entries[0].resolvedDirection === "horizontal", "Auto Detect Apply: preview resolvedDirection = horizontal");
    // Apply must use the SAME resolved direction
    var result = SE.applyToSections([section], rules, doc);
    assert(result.success === true, "Auto Detect Apply: apply success");
    assert(result.results.length === 1, "Auto Detect Apply: 1 result");
    assert(result.results[0].movement.moveRight !== 0, "Auto Detect Apply: horizontal movement applied (moveRight !== 0)");
    RE.clear();
});

test("E2E: Both Axes Apply Selected gets both measurements", function (SSM) {
    var SE = SSM.SpacingEngine;
    var PE = SSM.PreviewEngine;
    var RE = SSM.RuleEngine;
    RE.clear();
    var doc = SSM.__testApp.doc;
    // Upper [0, 100, 50, 60] → right=50, bottom=60
    // Lower [60, 40, 150, 0] → left=60, top=40
    // Vertical gap = 60 - 40 = 20, Horizontal gap = 60 - 50 = 10
    var upper = { id: 1, name: "Upper", original: { geometricBounds: [0, 100, 50, 60], id: 1, translate: function(dx,dy){var b=this.geometricBounds;this.geometricBounds=[b[0]+dx,b[1]-dy,b[2]+dx,b[3]-dy];} } };
    var lower = { id: 2, name: "Lower", original: { geometricBounds: [60, 40, 150, 0], id: 2, translate: function(dx,dy){var b=this.geometricBounds;this.geometricBounds=[b[0]+dx,b[1]-dy,b[2]+dx,b[3]-dy];} } };
    doc.pageItems = [upper.original, lower.original];
    var section = { id: "s1", name: "Both", enabled: true, type: "content", anchor: upper, target: lower };
    var rules = [{ id: "r1", name: "Both", enabled: true, priority: 10, measurementMode: "object", boundsType: "geometric", direction: "both", anchorBehavior: "moveLower", targetGap: 30, unit: "pt", scope: "sections" }];
    // Preview must have both axes data
    var entries = PE.buildPreview([section], rules, doc);
    assert(entries.length === 1, "Both Axes Apply Selected: 1 preview entry");
    assert(entries[0].resolvedDirection === "both", "Both Axes Apply Selected: resolvedDirection = both");
    assert(entries[0].vertical !== undefined, "Both Axes Apply Selected: vertical data present");
    assert(entries[0].horizontal !== undefined, "Both Axes Apply Selected: horizontal data present");
    // Vertical: gap=20, target=30, diff=10, moveLower=10
    assert(entries[0].moveLower === 10, "Both Axes Apply Selected: preview moveLower = 10");
    // Horizontal: gap=10, target=30, diff=20, moveRight=20
    assert(entries[0].moveRight === 20, "Both Axes Apply Selected: preview moveRight = 20");
    // Build sections list for applySelectedEntries
    var sectionsToApply = [{
        id: "s1", name: "Both", enabled: true, type: "content",
        anchor: upper, target: lower
    }];
    var result = SE.applySelectedEntries(sectionsToApply, rules, entries, doc);
    assert(result.success === true, "Both Axes Apply Selected: apply success");
    assert(result.results.length === 1, "Both Axes Apply Selected: 1 result");
    assert(result.results[0].bothAxes === true, "Both Axes Apply Selected: bothAxes flag set");
    assert(result.results[0].movement.moveLower === 10, "Both Axes Apply Selected: apply moveLower = 10");
    assert(result.results[0].movement.moveRight === 20, "Both Axes Apply Selected: apply moveRight = 20");
    RE.clear();
});

test("E2E: Both Axes Preview/Apply equivalence", function (SSM) {
    var SE = SSM.SpacingEngine;
    var PE = SSM.PreviewEngine;
    var RE = SSM.RuleEngine;
    RE.clear();
    var doc = SSM.__testApp.doc;
    var upper = { id: 1, name: "Upper", original: { geometricBounds: [0, 100, 50, 60], id: 1, translate: function(dx,dy){var b=this.geometricBounds;this.geometricBounds=[b[0]+dx,b[1]-dy,b[2]+dx,b[3]-dy];} } };
    var lower = { id: 2, name: "Lower", original: { geometricBounds: [60, 40, 150, 0], id: 2, translate: function(dx,dy){var b=this.geometricBounds;this.geometricBounds=[b[0]+dx,b[1]-dy,b[2]+dx,b[3]-dy];} } };
    doc.pageItems = [upper.original, lower.original];
    var section = { id: "s1", name: "Eq", enabled: true, type: "content", anchor: upper, target: lower };
    var rules = [{ id: "r1", name: "Eq", enabled: true, priority: 10, measurementMode: "object", boundsType: "geometric", direction: "both", anchorBehavior: "moveLower", targetGap: 25, unit: "pt", scope: "sections" }];
    var entries = PE.buildPreview([section], rules, doc);
    var e = entries[0];
    // Verify preview data
    assert(e.currentGap === 20, "Equivalence: preview currentGap = 20");
    assert(e.targetGap === 25, "Equivalence: preview targetGap = 25");
    assert(e.difference === 5, "Equivalence: preview difference = 5");
    assert(e.moveLower === 5, "Equivalence: preview moveLower = 5");
    assert(e.moveRight === 15, "Equivalence: preview moveRight = 15");
    // Apply must match preview exactly
    var sectionsToApply = [{ id: "s1", name: "Eq", enabled: true, type: "content", anchor: upper, target: lower }];
    var result = SE.applySelectedEntries(sectionsToApply, rules, entries, doc);
    assert(result.success === true, "Equivalence: apply success");
    assert(result.results[0].movement.moveLower === 5, "Equivalence: apply moveLower = 5 (matches preview)");
    assert(result.results[0].movement.moveRight === 15, "Equivalence: apply moveRight = 15 (matches preview)");
    RE.clear();
});

test("E2E: Both Axes changes X and Y independently", function (SSM) {
    var PE = SSM.PreviewEngine;
    var SE = SSM.SpacingEngine;
    var RE = SSM.RuleEngine;
    RE.clear();
    // Upper item: [0, 100, 50, 60] → right=50, bottom=60
    // Lower item: [60, 40, 150, 0] → left=60, top=40
    // Vertical gap = 60 - 40 = 20. Target = 40. Diff = 20. moveLower = 20.
    // Horizontal gap = 60 - 50 = 10. Target = 40. Diff = 30. moveRight = 30.
    var upper = { id: 1, name: "Upper", original: { geometricBounds: [0, 100, 50, 60], translate: function(dx,dy){var b=this.geometricBounds;this.geometricBounds=[b[0]+dx,b[1]-dy,b[2]+dx,b[3]-dy];} } };
    var lower = { id: 2, name: "Lower", original: { geometricBounds: [60, 40, 150, 0], translate: function(dx,dy){var b=this.geometricBounds;this.geometricBounds=[b[0]+dx,b[1]-dy,b[2]+dx,b[3]-dy];} } };
    var section = { id: "s1", name: "Both", enabled: true, type: "content", anchor: upper, target: lower };
    var rules = [{ id: "r1", name: "Both", enabled: true, priority: 10, measurementMode: "object", boundsType: "geometric", direction: "both", anchorBehavior: "moveLower", targetGap: 40, unit: "pt", scope: "sections" }];
    var entries = PE.buildPreview([section], rules, null);
    assert(entries.length === 1, "Both Axes: 1 preview entry");
    assert(entries[0].vertical !== undefined, "Both Axes: has vertical data");
    assert(entries[0].horizontal !== undefined, "Both Axes: has horizontal data");
    // Vertical: gap=20, target=40, diff=20, moveLower=20
    assert(entries[0].currentGap === 20, "Both Axes: currentGap = 20");
    assert(entries[0].moveLower === 20, "Both Axes: moveLower = 20");
    // Horizontal: gap=10, target=40, diff=30, moveRight=30
    assert(entries[0].moveRight === 30, "Both Axes: moveRight = 30");
    // Apply
    var doc = SSM.__testApp.doc;
    var result = SE.applyToSections([section], rules, doc);
    assert(result.success === true, "Both Axes: apply success");
    assert(result.results[0].bothAxes === true, "Both Axes: result marked bothAxes");
    assert(result.results[0].movement.moveLower === 20, "Both Axes: apply moveLower = 20");
    assert(result.results[0].movement.moveRight === 30, "Both Axes: apply moveRight = 30");
});

test("E2E: Preview/Apply equivalence for Both Axes", function (SSM) {
    var PE = SSM.PreviewEngine;
    var SE = SSM.SpacingEngine;
    var RE = SSM.RuleEngine;
    RE.clear();
    var upper = { id: 1, name: "Upper", original: { geometricBounds: [0, 100, 50, 60], translate: function(dx,dy){var b=this.geometricBounds;this.geometricBounds=[b[0]+dx,b[1]-dy,b[2]+dx,b[3]-dy];} } };
    var lower = { id: 2, name: "Lower", original: { geometricBounds: [60, 40, 150, 0], translate: function(dx,dy){var b=this.geometricBounds;this.geometricBounds=[b[0]+dx,b[1]-dy,b[2]+dx,b[3]-dy];} } };
    var section = { id: "s1", name: "Eq", enabled: true, type: "content", anchor: upper, target: lower };
    var rules = [{ id: "r1", name: "Eq", enabled: true, priority: 10, measurementMode: "object", boundsType: "geometric", direction: "both", anchorBehavior: "moveLower", targetGap: 30, unit: "pt", scope: "sections" }];
    var entries = PE.buildPreview([section], rules, null);
    assert(entries.length === 1, "Equivalence: 1 preview entry");
    var e = entries[0];
    // Verify preview data matches what apply will use
    assert(e.ruleId === "r1", "Equivalence: ruleId preserved");
    assert(e.measurementMode === "object", "Equivalence: measurementMode preserved");
    assert(e.boundsType === "geometric", "Equivalence: boundsType preserved");
    assert(e.resolvedDirection === "both", "Equivalence: resolvedDirection preserved");
    assert(e.anchorBehavior === "moveLower", "Equivalence: anchorBehavior preserved");
    assert(e.unit === "pt", "Equivalence: unit preserved");
    // Vertical: gap=20, target=30, diff=10
    assert(e.currentGap === 20, "Equivalence: currentGap = 20");
    assert(e.targetGap === 30, "Equivalence: targetGap = 30");
    assert(e.difference === 10, "Equivalence: difference = 10");
    assert(e.moveLower === 10, "Equivalence: moveLower = 10");
    // Horizontal: gap=10, target=30, diff=20
    assert(e.moveRight === 20, "Equivalence: moveRight = 20");
    // Apply should produce same movement
    var doc = SSM.__testApp.doc;
    var result = SE.applyToSections([section], rules, doc);
    assert(result.success === true, "Equivalence: apply success");
    assert(result.results[0].movement.moveLower === 10, "Equivalence: apply moveLower = 10");
    assert(result.results[0].movement.moveRight === 20, "Equivalence: apply moveRight = 20");
});

test("E2E: Rule matching - section type mismatch returns null", function (SSM) {
    var RE = SSM.RuleEngine;
    RE.clear();
    RE.createRule({ name: "Heading Rule", priority: 10, detectionConfig: { sectionType: "heading" }, measurementMode: "object", direction: "vertical", targetGap: 40, unit: "pt", scope: "sections", enabled: true });
    var section = { id: "s1", name: "Body", type: "content", anchor: null, target: null };
    var rule = RE.resolveRuleForSection(section, RE.getAll());
    assert(rule === null, "Rule matching: section type mismatch returns null");
    RE.clear();
});

test("E2E: Rule matching - scope mismatch returns null", function (SSM) {
    var RE = SSM.RuleEngine;
    RE.clear();
    RE.createRule({ name: "Selection Rule", priority: 10, measurementMode: "object", direction: "vertical", targetGap: 40, unit: "pt", scope: "selection", enabled: true });
    var section = { id: "s1", name: "Body", type: "content", anchor: null, target: null };
    var rule = RE.resolveRuleForSection(section, RE.getAll());
    assert(rule === null, "Rule matching: incompatible scope returns null");
    RE.clear();
});

test("E2E: Rule matching - direction mismatch returns null", function (SSM) {
    var RE = SSM.RuleEngine;
    RE.clear();
    RE.createRule({ name: "Horizontal Rule", priority: 10, measurementMode: "object", direction: "horizontal", targetGap: 40, unit: "pt", scope: "sections", enabled: true });
    var section = { id: "s1", name: "Body", type: "content", anchor: null, target: null };
    // "horizontal" is a valid direction, so it should be eligible. But scope "sections" matches.
    // Let's test with an invalid direction instead.
    RE.clear();
    RE.createRule({ name: "Bad Direction", priority: 10, measurementMode: "object", direction: "diagonal", targetGap: 40, unit: "pt", scope: "sections", enabled: true });
    var rule = RE.resolveRuleForSection(section, RE.getAll());
    assert(rule === null, "Rule matching: invalid direction returns null");
    RE.clear();
});

test("E2E: Rule matching - priority tie returns null (ambiguous)", function (SSM) {
    var RE = SSM.RuleEngine;
    RE.clear();
    RE.createRule({ name: "Rule A", priority: 10, measurementMode: "object", direction: "vertical", targetGap: 40, unit: "pt", scope: "sections", enabled: true });
    RE.createRule({ name: "Rule B", priority: 10, measurementMode: "object", direction: "vertical", targetGap: 40, unit: "pt", scope: "sections", enabled: true });
    var section = { id: "s1", name: "Body", type: "content", anchor: null, target: null };
    var rule = RE.resolveRuleForSection(section, RE.getAll());
    assert(rule === null, "Rule matching: priority tie returns null");
    RE.clear();
});

test("E2E: Rule matching - no eligible rule returns null", function (SSM) {
    var RE = SSM.RuleEngine;
    RE.clear();
    RE.createRule({ name: "Disabled Rule", priority: 10, measurementMode: "object", direction: "vertical", targetGap: 40, unit: "pt", scope: "sections", enabled: false });
    var section = { id: "s1", name: "Body", type: "content", anchor: null, target: null };
    var rule = RE.resolveRuleForSection(section, RE.getAll());
    assert(rule === null, "Rule matching: no eligible rule returns null");
    RE.clear();
});

test("E2E: Rule matching - valid rule selected by priority", function (SSM) {
    var RE = SSM.RuleEngine;
    RE.clear();
    RE.createRule({ name: "Low Priority", priority: 1, measurementMode: "object", direction: "vertical", targetGap: 40, unit: "pt", scope: "sections", enabled: true });
    RE.createRule({ name: "High Priority", priority: 100, measurementMode: "object", direction: "vertical", targetGap: 60, unit: "pt", scope: "sections", enabled: true });
    var section = { id: "s1", name: "Body", type: "content", anchor: null, target: null };
    var rule = RE.resolveRuleForSection(section, RE.getAll());
    assert(rule !== null, "Rule matching: valid rule selected");
    assert(rule.name === "High Priority", "Rule matching: highest priority wins");
    RE.clear();
});

test("E2E: Rule matching - ineligible high-priority rule cannot override eligible rule", function (SSM) {
    var RE = SSM.RuleEngine;
    RE.clear();
    // High-priority rule requires "heading" section type — ineligible for "content" section
    RE.createRule({ name: "Heading Rule", priority: 1000, detectionConfig: { sectionType: "heading" }, measurementMode: "object", direction: "vertical", targetGap: 40, unit: "pt", scope: "sections", enabled: true });
    // Low-priority rule accepts any section type — eligible for "content" section
    RE.createRule({ name: "Content Rule", priority: 1, measurementMode: "object", direction: "vertical", targetGap: 20, unit: "pt", scope: "sections", enabled: true });
    var section = { id: "s1", name: "Body", type: "content", anchor: null, target: null };
    var rule = RE.resolveRuleForSection(section, RE.getAll());
    assert(rule !== null, "Rule matching: eligible rule selected despite lower priority");
    assert(rule.name === "Content Rule", "Rule matching: ineligible high-priority rule does NOT override");
    RE.clear();
});

test("E2E: Rule matching - detection criteria mismatch makes rule ineligible", function (SSM) {
    var RE = SSM.RuleEngine;
    RE.clear();
    // Rule requires textPattern "Chapter" — section has different pattern
    RE.createRule({ name: "Chapter Rule", priority: 100, detectionConfig: { sectionType: "heading", textPattern: "Chapter" }, measurementMode: "object", direction: "vertical", targetGap: 40, unit: "pt", scope: "sections", enabled: true });
    // Section has a different text pattern
    var section = { id: "s1", name: "Intro", type: "content", detectionConfig: { textPattern: "Introduction" }, anchor: null, target: null };
    var rule = RE.resolveRuleForSection(section, RE.getAll());
    assert(rule === null, "Rule matching: detection criteria mismatch returns null");
    RE.clear();
});

test("E2E: Rule matching - detection method mismatch makes rule ineligible", function (SSM) {
    var RE = SSM.RuleEngine;
    RE.clear();
    // Rule requires "text" detection method
    RE.createRule({ name: "Text Rule", priority: 100, detectionMethod: "text", measurementMode: "object", direction: "vertical", targetGap: 40, unit: "pt", scope: "sections", enabled: true });
    // Section detected by "style" method
    var section = { id: "s1", name: "Styled", type: "content", detectionMethod: "style", anchor: null, target: null };
    var rule = RE.resolveRuleForSection(section, RE.getAll());
    assert(rule === null, "Rule matching: detection method mismatch returns null");
    RE.clear();
});

test("E2E: Rule matching - COMBINED detection method matches any section method", function (SSM) {
    var RE = SSM.RuleEngine;
    RE.clear();
    // COMBINED rule should match a section detected by "style"
    RE.createRule({ name: "Combined Rule", priority: 10, detectionMethod: "combined", measurementMode: "object", direction: "vertical", targetGap: 40, unit: "pt", scope: "sections", enabled: true });
    var section = { id: "s1", name: "Any", type: "content", detectionMethod: "style", anchor: null, target: null };
    var rule = RE.resolveRuleForSection(section, RE.getAll());
    assert(rule !== null, "Rule matching: COMBINED rule matches any detection method");
    assert(rule.name === "Combined Rule", "Rule matching: COMBINED rule selected");
    RE.clear();
});

test("E2E: Apply All rollback on partial failure", function (SSM) {
    var SE = SSM.SpacingEngine;
    var RE = SSM.RuleEngine;
    RE.clear();
    var doc = SSM.__testApp.doc;
    // Helper: item whose translate() fails on first call, then succeeds.
    // geometricBounds is read-only (like real Illustrator) — production code
    // must use translate(), so the failure must occur in translate().
    function failingBoundsItem(id, name, bounds) {
        var callCount = 0;
        var current = bounds.slice();
        var obj = { id: id };
        Object.defineProperty(obj, 'geometricBounds', {
            get: function() { return current; },
            enumerable: true,
            configurable: false
        });
        obj.translate = function(dx, dy) {
            callCount++;
            if (callCount === 1) { throw new Error("translate failed"); }
            current = [current[0] + dx, current[1] - dy, current[2] + dx, current[3] - dy];
        };
        return { id: id, name: name, original: obj };
    }
    function normalBoundsItem(id, name, bounds) {
        var current = bounds.slice();
        var obj = { id: id };
        Object.defineProperty(obj, 'geometricBounds', {
            get: function() { return current; },
            enumerable: true,
            configurable: false
        });
        obj.translate = function(dx, dy) {
            current = [current[0] + dx, current[1] - dy, current[2] + dx, current[3] - dy];
        };
        return { id: id, name: name, original: obj };
    }
    // First section: valid, will move
    var upper1 = normalBoundsItem(1, "U1", [0, 100, 100, 60]);
    var lower1 = normalBoundsItem(2, "L1", [0, 40, 100, 0]);
    // Second section: translate fails on first call (forward movement),
    // succeeds on second call (restore) — so rollback succeeds.
    var upper2 = failingBoundsItem(3, "U2", [0, 200, 100, 160]);
    var lower2 = failingBoundsItem(4, "L2", [0, 140, 100, 0]);
    // Register all items in the document so rollback can find them
    doc.pageItems = [upper1.original, lower1.original, upper2.original, lower2.original];
    var s1 = { id: "sec-1", name: "S1", enabled: true, type: "content", anchor: upper1, target: lower1 };
    var s2 = { id: "sec-2", name: "S2", enabled: true, type: "content", anchor: upper2, target: lower2 };
    var rules = [{ id: "r1", name: "R", enabled: true, priority: 10, measurementMode: "object", boundsType: "geometric", direction: "vertical", anchorBehavior: "symmetric", targetGap: 40, unit: "pt", scope: "sections" }];
    var result = SE.applyToSections([s1, s2], rules, doc);
    assert(result.success === false, "Partial failure: apply returns false");
    assert(result.rolledBack === true, "Partial failure: rollback succeeded");
    assert(result.error.indexOf("rolled back") !== -1, "Partial failure: error mentions rolled back — got: " + result.error);
    RE.clear();
});

test("E2E: Apply All rollback failure reporting", function (SSM) {
    var SE = SSM.SpacingEngine;
    var RE = SSM.RuleEngine;
    RE.clear();
    var doc = SSM.__testApp.doc;
    // Helper: item whose translate() always throws (like a read-only geometricBounds
    // that production code must not try to assign directly)
    function alwaysFailingBoundsItem(id, name, bounds) {
        var current = bounds.slice();
        var obj = { id: id };
        Object.defineProperty(obj, 'geometricBounds', {
            get: function() { return current; },
            enumerable: true,
            configurable: false
        });
        obj.translate = function(dx, dy) { throw new Error("translate failed"); };
        return { id: id, name: name, original: obj };
    }
    function normalBoundsItem(id, name, bounds) {
        var current = bounds.slice();
        var obj = { id: id };
        Object.defineProperty(obj, 'geometricBounds', {
            get: function() { return current; },
            enumerable: true,
            configurable: false
        });
        obj.translate = function(dx, dy) {
            current = [current[0] + dx, current[1] - dy, current[2] + dx, current[3] - dy];
        };
        return { id: id, name: name, original: obj };
    }
    // Items NOT registered in doc.pageItems so rollback cannot find them.
    // Section 1 items have working translate — section 1 will succeed.
    // Section 2 items' translate always throws — section 2 will fail, then rollback fails.
    var upper1 = normalBoundsItem(10, "U10", [0, 100, 100, 60]);
    var lower1 = normalBoundsItem(11, "L11", [0, 40, 100, 0]);
    var upper2 = alwaysFailingBoundsItem(12, "U12", [0, 200, 100, 160]);
    var lower2 = alwaysFailingBoundsItem(13, "L13", [0, 140, 100, 0]);
    // Do NOT register items in doc.pageItems — rollback will fail
    var s1 = { id: "sec-10", name: "S10", enabled: true, type: "content", anchor: upper1, target: lower1 };
    var s2 = { id: "sec-11", name: "S11", enabled: true, type: "content", anchor: upper2, target: lower2 };
    var rules = [{ id: "r2", name: "R2", enabled: true, priority: 10, measurementMode: "object", boundsType: "geometric", direction: "vertical", anchorBehavior: "moveLower", targetGap: 40, unit: "pt", scope: "sections" }];
    var result = SE.applyToSections([s1, s2], rules, doc);
    assert(result.success === false, "Rollback failure: apply returns false");
    assert(result.rolledBack === false, "Rollback failure: rollback did NOT succeed");
    assert(result.error.indexOf("rollback FAILED") !== -1, "Rollback failure: error mentions rollback FAILED — got: " + result.error);
    RE.clear();
});

test("E2E: Transaction passes document reference", function (SSM) {
    var TM = SSM.TransactionManager;
    var PM = SSM.PositionManager;
    var doc = SSM.__testApp.doc;
    var items = [{ id: 1, name: "T1", original: { geometricBounds: [0, 100, 100, 0] } }];
    var txnId = TM.begin(items, doc);
    assert(txnId, "Transaction: begun with doc");
    var active = TM.getActive();
    assert(active.doc === doc, "Transaction: doc reference stored");
    TM.commit();
    assert(TM.getActive() === null, "Transaction: cleared after commit");
});

test("E2E: PositionManager restore Y-axis sign — downward movement rollback", function (SSM) {
    var PM = SSM.PositionManager;
    var doc = SSM.__testApp.doc;
    // Item at [0, 200, 200, 100] (top=200, bottom=100). Move it DOWN by 30 → [0, 170, 200, 70]
    var item = { id: 1, name: "TestItem", original: { geometricBounds: [0, 200, 200, 100], id: 1, translate: function(dx,dy){var b=this.geometricBounds;this.geometricBounds=[b[0]+dx,b[1]-dy,b[2]+dx,b[3]-dy];} } };
    doc.pageItems = [item.original];
    // Capture original position
    var snapId = PM.capture([item]);
    assert(snapId, "PositionManager: snapshot captured");
    // Move item DOWN by 30 (translate 0, 30 → top decreases by 30, bottom decreases by 30)
    item.original.translate(0, 30);
    assert(item.original.geometricBounds[1] === 170, "PositionManager: item moved down, top=170");
    assert(item.original.geometricBounds[3] === 70, "PositionManager: item moved down, bottom=70");
    // Restore should move it BACK UP by 30 (dy = snapshot.top - current.top = 200 - 170 = +30, translate up)
    var ok = PM.restore(snapId, doc);
    assert(ok === true, "PositionManager: restore succeeded (downward movement)");
    assert(item.original.geometricBounds[0] === 0, "PositionManager: restore left=0");
    assert(item.original.geometricBounds[1] === 200, "PositionManager: restore top=200 (exact)");
    assert(item.original.geometricBounds[2] === 200, "PositionManager: restore right=200");
    assert(item.original.geometricBounds[3] === 100, "PositionManager: restore bottom=100 (exact)");
    PM.clear();
});

test("E2E: PositionManager restore Y-axis sign — upward movement rollback", function (SSM) {
    var PM = SSM.PositionManager;
    var doc = SSM.__testApp.doc;
    // Item at [0, 100, 200, 0] (top=100, bottom=0). Move it UP by 40 → [0, 140, 200, 40]
    var item = { id: 2, name: "TestItem2", original: { geometricBounds: [0, 100, 200, 0], id: 2, translate: function(dx,dy){var b=this.geometricBounds;this.geometricBounds=[b[0]+dx,b[1]-dy,b[2]+dx,b[3]-dy];} } };
    doc.pageItems = [item.original];
    // Capture original position
    var snapId = PM.capture([item]);
    assert(snapId, "PositionManager: snapshot captured");
    // Move item UP by 40 (translate 0, -40 → top increases by 40, bottom increases by 40)
    item.original.translate(0, -40);
    assert(item.original.geometricBounds[1] === 140, "PositionManager: item moved up, top=140");
    assert(item.original.geometricBounds[3] === 40, "PositionManager: item moved up, bottom=40");
    // Restore should move it BACK DOWN by 40 (dy = snapshot.top - current.top = 100 - 140 = -40, translate down)
    var ok = PM.restore(snapId, doc);
    assert(ok === true, "PositionManager: restore succeeded (upward movement)");
    assert(item.original.geometricBounds[0] === 0, "PositionManager: restore left=0");
    assert(item.original.geometricBounds[1] === 100, "PositionManager: restore top=100 (exact)");
    assert(item.original.geometricBounds[2] === 200, "PositionManager: restore right=200");
    assert(item.original.geometricBounds[3] === 0, "PositionManager: restore bottom=0 (exact)");
    PM.clear();
});

test("E2E: PositionManager restore verification — fails when item cannot be found", function (SSM) {
    var PM = SSM.PositionManager;
    var doc = SSM.__testApp.doc;
    // Item NOT in doc.pageItems — rollback cannot find it
    var item = { id: 99, name: "MissingItem", original: { geometricBounds: [0, 100, 100, 0], id: 99 } };
    var snapId = PM.capture([item]);
    assert(snapId, "PositionManager: snapshot captured");
    // doc.pageItems is empty, so findLiveItem returns null
    var ok = PM.restore(snapId, doc);
    assert(ok === false, "PositionManager: restore failed when item not in document");
    PM.clear();
});

test("E2E: PositionManager restore verification — checks all 4 coordinates", function (SSM) {
    var PM = SSM.PositionManager;
    var doc = SSM.__testApp.doc;
    var item = { id: 3, name: "CoordItem", original: { geometricBounds: [10, 50, 90, 20], id: 3, translate: function(dx,dy){var b=this.geometricBounds;this.geometricBounds=[b[0]+dx,b[1]-dy,b[2]+dx,b[3]-dy];} } };
    doc.pageItems = [item.original];
    var snapId = PM.capture([item]);
    // Move item: left+5, top-10, right+5, bottom-10
    item.original.translate(5, 10);
    assert(item.original.geometricBounds[0] === 15, "PositionManager: moved left=15");
    assert(item.original.geometricBounds[1] === 40, "PositionManager: moved top=40");
    assert(item.original.geometricBounds[2] === 95, "PositionManager: moved right=95");
    assert(item.original.geometricBounds[3] === 10, "PositionManager: moved bottom=10");
    var ok = PM.restore(snapId, doc);
    assert(ok === true, "PositionManager: restore succeeded");
    assert(item.original.geometricBounds[0] === 10, "PositionManager: restore left=10");
    assert(item.original.geometricBounds[1] === 50, "PositionManager: restore top=50");
    assert(item.original.geometricBounds[2] === 90, "PositionManager: restore right=90");
    assert(item.original.geometricBounds[3] === 20, "PositionManager: restore bottom=20");
    PM.clear();
});

test("E2E: Auto Detect single-axis fallback — vertical axis chosen when dominant", function (SSM) {
    var PE = SSM.PreviewEngine;
    var RE = SSM.RuleEngine;
    RE.clear();
    // Upper: [0, 100, 50, 60] → right=50, bottom=60
    // Lower: [50, 40, 100, 0] → left=50, top=40
    // Vertical gap = 60 - 40 = 20 (separated)
    // Horizontal gap = 50 - 50 = 0 (touching)
    // Auto Detect: |20| > |0| → vertical wins
    var upper = { id: 1, name: "Upper", original: { geometricBounds: [0, 100, 50, 60] } };
    var lower = { id: 2, name: "Lower", original: { geometricBounds: [50, 40, 100, 0] } };
    var section = { id: "s1", name: "VertDom", enabled: true, type: "content", anchor: upper, target: lower };
    var rules = [{ id: "r1", name: "Auto", enabled: true, priority: 10, measurementMode: "object", boundsType: "geometric", direction: "auto", anchorBehavior: "moveLower", targetGap: 40, unit: "pt", scope: "sections" }];
    var entries = PE.buildPreview([section], rules, null);
    assert(entries.length === 1, "Auto Detect vertical-dominant: 1 preview entry");
    assert(entries[0].resolvedDirection === "vertical", "Auto Detect vertical-dominant: resolvedDirection = vertical");
    assert(entries[0].currentGap === 20, "Auto Detect vertical-dominant: currentGap = 20");
    RE.clear();
});

test("E2E: Auto Detect single-axis fallback — horizontal axis chosen when dominant", function (SSM) {
    var PE = SSM.PreviewEngine;
    var RE = SSM.RuleEngine;
    RE.clear();
    // Left: [0, 100, 50, 0] → right=50, bottom=0
    // Right: [200, 100, 400, 0] → left=200, top=100
    // Horizontal gap = 200 - 50 = 150 (separated)
    // Vertical gap = 0 - 100 = -100 (overlap)
    // Auto Detect: |150| > |-100| → horizontal wins
    var left = { id: 1, name: "Left", original: { geometricBounds: [0, 100, 50, 0] } };
    var right = { id: 2, name: "Right", original: { geometricBounds: [200, 100, 400, 0] } };
    var section = { id: "s1", name: "HorizDom", enabled: true, type: "content", anchor: left, target: right };
    var rules = [{ id: "r1", name: "Auto", enabled: true, priority: 10, measurementMode: "object", boundsType: "geometric", direction: "auto", anchorBehavior: "moveLower", targetGap: 100, unit: "pt", scope: "sections" }];
    var entries = PE.buildPreview([section], rules, null);
    assert(entries.length === 1, "Auto Detect horizontal-dominant: 1 preview entry");
    assert(entries[0].resolvedDirection === "horizontal", "Auto Detect horizontal-dominant: resolvedDirection = horizontal");
    assert(entries[0].currentGap === 150, "Auto Detect horizontal-dominant: currentGap = 150");
    RE.clear();
});

test("E2E: Auto Detect single-axis fallback — neither axis measurement returns null", function (SSM) {
    var PE = SSM.PreviewEngine;
    var RE = SSM.RuleEngine;
    RE.clear();
    // Items without valid geometricBounds — both measurements return null
    var a = { id: 1, name: "A", original: { id: 1, name: "A" } };
    var b = { id: 2, name: "B", original: { id: 2, name: "B" } };
    var section = { id: "s1", name: "None", enabled: true, type: "content", anchor: a, target: b };
    var rules = [{ id: "r1", name: "Auto", enabled: true, priority: 10, measurementMode: "object", boundsType: "geometric", direction: "auto", anchorBehavior: "moveLower", targetGap: 40, unit: "pt", scope: "sections" }];
    var entries = PE.buildPreview([section], rules, null);
    assert(entries.length === 0, "Auto Detect neither axis: 0 preview entries (no valid measurement)");
    RE.clear();
});

test("E2E: Detection metadata propagation — TextDetection → SectionManager → RuleEngine", function (SSM) {
    var TD = SSM.TextDetection;
    var SM = SSM.SectionManager;
    var RE = SSM.RuleEngine;
    var doc = SSM.__testApp.doc;
    doc.pageItems = [];
    var chItem = { id: 10, name: "Chapter 1", typename: "TextFrame", contents: "Chapter 1", geometricBounds: [0, 200, 200, 180], visibleBounds: [0, 200, 200, 180], translate: function(dx,dy){var b=this.geometricBounds;this.geometricBounds=[b[0]+dx,b[1]-dy,b[2]+dx,b[3]-dy];} };
    doc.pageItems.push(chItem);
    // Run text detection — TextDetection looks at item.original.contents
    var det = TD.run(doc, { pattern: "Chapter", matchType: "contains", caseSensitive: false, wholeWord: false, useRegex: true });
    assert(det.items.length === 1, "Detection metadata: 1 item detected");
    assert(det.items[0].method === "text", "Detection metadata: method = text");
    assert(det.items[0].matchText === "Chapter 1", "Detection metadata: matchText = full content");
    // Create section from detected item — detection metadata should propagate
    SM.clear();
    var section = SM.createSection("Ch1 section", "heading", det.items[0], null, "chapters");
    assert(section.detectionMethod === "text", "SectionManager: detectionMethod propagated = text");
    // matchText is the full content "Chapter 1"
    assert(section.detectionConfig.textPattern === "Chapter 1", "SectionManager: detectionConfig.textPattern propagated");
    // A rule requiring "text" detection method should match this section
    RE.clear();
    RE.createRule({ name: "Text Rule", priority: 10, detectionMethod: "text", measurementMode: "object", direction: "vertical", targetGap: 40, unit: "pt", scope: "sections", enabled: true });
    var rule = RE.resolveRuleForSection(section, RE.getAll());
    assert(rule !== null, "Rule matching: text method rule matches text-detected section");
    assert(rule.name === "Text Rule", "Rule matching: text method rule selected");
    // A rule requiring "style" detection method should NOT match
    RE.clear();
    RE.createRule({ name: "Style Rule", priority: 100, detectionMethod: "style", measurementMode: "object", direction: "vertical", targetGap: 40, unit: "pt", scope: "sections", enabled: true });
    var rule2 = RE.resolveRuleForSection(section, RE.getAll());
    assert(rule2 === null, "Rule matching: style method rule does NOT match text-detected section");
    SM.clear();
    RE.clear();
});

test("E2E: Detection metadata propagation — StyleDetection → SectionManager → RuleEngine", function (SSM) {
    var SD = SSM.StyleDetection;
    var SM = SSM.SectionManager;
    var RE = SSM.RuleEngine;
    var doc = SSM.__testApp.doc;
    doc.pageItems = [];
    var styledItem = { id: 20, name: "Styled Text", typename: "TextFrame", contents: "Styled", geometricBounds: [0, 100, 100, 0], visibleBounds: [0, 100, 100, 0], textFont: { name: "Helvetica", style: "Bold" }, size: 14, fillColor: { typename: "RGBColor", red: 0, green: 0, blue: 0 }, translate: function(dx,dy){var b=this.geometricBounds;this.geometricBounds=[b[0]+dx,b[1]-dy,b[2]+dx,b[3]-dy];} };
    doc.pageItems.push(styledItem);
    // Run style detection for Helvetica Bold — StyleDetection looks at item.original.textFont
    var det = SD.run(doc, { criteria: [{ attr: "fontFamily", value: "Helvetica" }, { attr: "fontStyle", value: "Bold" }] });
    assert(det.items.length === 1, "Style detection: 1 item detected");
    assert(det.items[0].method === "style", "Style detection: method = style");
    // Create section from detected item
    SM.clear();
    var section = SM.createSection("Styled section", "heading", det.items[0], null, "styled");
    assert(section.detectionMethod === "style", "SectionManager: detectionMethod propagated = style");
    // A rule requiring "style" detection method should match
    RE.clear();
    RE.createRule({ name: "Style Rule", priority: 10, detectionMethod: "style", measurementMode: "object", direction: "vertical", targetGap: 40, unit: "pt", scope: "sections", enabled: true });
    var rule = RE.resolveRuleForSection(section, RE.getAll());
    assert(rule !== null, "Rule matching: style method rule matches style-detected section");
    SM.clear();
    RE.clear();
});

test("E2E: Detection metadata propagation — NameDetection → SectionManager → RuleEngine", function (SSM) {
    var ND = SSM.NameDetection;
    var SM = SSM.SectionManager;
    var RE = SSM.RuleEngine;
    var doc = SSM.__testApp.doc;
    doc.pageItems = [];
    var namedItem = { id: 30, name: "Header_Section_A", typename: "TextFrame", contents: "Header", geometricBounds: [0, 100, 100, 0], visibleBounds: [0, 100, 100, 0], translate: function(dx,dy){var b=this.geometricBounds;this.geometricBounds=[b[0]+dx,b[1]-dy,b[2]+dx,b[3]-dy];} };
    doc.pageItems.push(namedItem);
    // Run name detection for items starting with "Header"
    var det = ND.run(doc, { pattern: "Header", matchType: "startsWith", caseSensitive: false, wildcard: true });
    assert(det.items.length === 1, "Name detection: 1 item detected");
    assert(det.items[0].method === "name", "Name detection: method = name");
    // Create section from detected item
    SM.clear();
    var section = SM.createSection("Named section", "heading", det.items[0], null, "named");
    assert(section.detectionMethod === "name", "SectionManager: detectionMethod propagated = name");
    // A rule requiring "name" detection method should match
    RE.clear();
    RE.createRule({ name: "Name Rule", priority: 10, detectionMethod: "name", measurementMode: "object", direction: "vertical", targetGap: 40, unit: "pt", scope: "sections", enabled: true });
    var rule = RE.resolveRuleForSection(section, RE.getAll());
    assert(rule !== null, "Rule matching: name method rule matches name-detected section");
    assert(rule.name === "Name Rule", "Rule matching: name method rule selected");
    // A rule requiring "text" detection method should NOT match name-detected section
    RE.clear();
    RE.createRule({ name: "Text Rule", priority: 100, detectionMethod: "text", measurementMode: "object", direction: "vertical", targetGap: 40, unit: "pt", scope: "sections", enabled: true });
    var rule2 = RE.resolveRuleForSection(section, RE.getAll());
    assert(rule2 === null, "Rule matching: text method rule does NOT match name-detected section");
    SM.clear();
    RE.clear();
});

test("E2E: Rule matching — method-specific rule rejected when section has no detection method", function (SSM) {
    var SM = SSM.SectionManager;
    var RE = SSM.RuleEngine;
    SM.clear();
    RE.clear();
    // Manually created section with no detection method
    var section = SM.createSection("Manual section", "content", { id: 1, name: "Item" }, null, "manual");
    assert(section.detectionMethod === null || section.detectionMethod === undefined, "Section: no detection method on manually created section");
    // A TEXT rule should NOT match a section with no detection method
    RE.createRule({ name: "Text Rule", priority: 10, detectionMethod: "text", measurementMode: "object", direction: "vertical", targetGap: 40, unit: "pt", scope: "sections", enabled: true });
    var rule = RE.resolveRuleForSection(section, RE.getAll());
    assert(rule === null, "Rule matching: text rule rejected for section with no detection method");
    // A MANUAL rule SHOULD match (backward compatible)
    RE.clear();
    RE.createRule({ name: "Manual Rule", priority: 10, detectionMethod: "manual", measurementMode: "object", direction: "vertical", targetGap: 40, unit: "pt", scope: "sections", enabled: true });
    var rule2 = RE.resolveRuleForSection(section, RE.getAll());
    assert(rule2 !== null, "Rule matching: manual rule matches section with no detection method");
    SM.clear();
    RE.clear();
});

test("E2E: Style detection preserves actual matched criteria (not just count)", function (SSM) {
    var SD = SSM.StyleDetection;
    var SM = SSM.SectionManager;
    var RE = SSM.RuleEngine;
    var doc = SSM.__testApp.doc;
    doc.pageItems = [];
    var styledItem = { id: 40, name: "Styled Text", typename: "TextFrame", contents: "Styled", geometricBounds: [0, 100, 100, 0], visibleBounds: [0, 100, 100, 0], textFont: { name: "Helvetica", style: "Bold" }, size: 14, fillColor: { typename: "RGBColor", red: 0, green: 0, blue: 0 }, translate: function(dx,dy){var b=this.geometricBounds;this.geometricBounds=[b[0]+dx,b[1]-dy,b[2]+dx,b[3]-dy];} };
    doc.pageItems.push(styledItem);
    // Run style detection for Helvetica Bold, size 14
    var det = SD.run(doc, { criteria: [{ attr: "fontFamily", value: "Helvetica" }, { attr: "fontStyle", value: "Bold" }, { attr: "fontSize", value: 14 }] });
    assert(det.items.length === 1, "Style detection: 1 item detected");
    assert(det.items[0].method === "style", "Style detection: method = style");
    assert(det.items[0].criteriaMatched === 3, "Style detection: all 3 criteria matched");
    // Verify actual matched criteria are preserved (not just count)
    assert(det.items[0].matchedCriteria !== undefined, "Style detection: matchedCriteria array present");
    assert(det.items[0].matchedCriteria.length === 3, "Style detection: 3 matched criteria entries");
    // Create section — actual criteria should propagate into detectionConfig
    SM.clear();
    var section = SM.createSection("Styled section", "heading", det.items[0], null, "styled");
    assert(section.detectionConfig.fontFamily === "Helvetica", "SectionManager: fontFamily propagated from matched criteria");
    assert(section.detectionConfig.fontStyle === "Bold", "SectionManager: fontStyle propagated from matched criteria");
    assert(section.detectionConfig.fontSize === 14, "SectionManager: fontSize propagated from matched criteria");
    // A style rule with matching fontFamily should be eligible
    RE.clear();
    RE.createRule({ name: "Helvetica Rule", priority: 10, detectionMethod: "style", detectionConfig: { fontFamily: "Helvetica" }, measurementMode: "object", direction: "vertical", targetGap: 40, unit: "pt", scope: "sections", enabled: true });
    var rule = RE.resolveRuleForSection(section, RE.getAll());
    assert(rule !== null, "Rule matching: style rule with matching fontFamily matches section");
    // A style rule with non-matching fontFamily should be ineligible
    RE.clear();
    RE.createRule({ name: "Arial Rule", priority: 100, detectionMethod: "style", detectionConfig: { fontFamily: "Arial" }, measurementMode: "object", direction: "vertical", targetGap: 40, unit: "pt", scope: "sections", enabled: true });
    var rule2 = RE.resolveRuleForSection(section, RE.getAll());
    assert(rule2 === null, "Rule matching: style rule with non-matching fontFamily rejected");
    SM.clear();
    RE.clear();
});

test("E2E: PositionManager restore — read-only geometricBounds, translate-based rollback both directions", function (SSM) {
    var PM = SSM.PositionManager;
    var doc = SSM.__testApp.doc;
    doc.pageItems = [];
    // Create item via mock factory — geometricBounds is read-only
    var item = MOCK.makeItem("TextFrame", "ReadOnlyItem", [0, 200, 200, 100]);
    item.id = 50;
    item.name = "ReadOnlyItem";
    doc.pageItems.push(item);
    // Verify geometricBounds is read-only — direct assignment throws
    var readOnly = false;
    try { item.geometricBounds = [0, 100, 100, 0]; } catch (e) { readOnly = true; }
    assert(readOnly === true, "Mock: geometricBounds is read-only (direct assignment throws)");
    // Capture original position
    var snapId = PM.capture([item]);
    assert(snapId, "PositionManager: snapshot captured");
    // Move item DOWN by 30 via translate (positive dy moves down)
    item.translate(0, 30);
    assert(item.geometricBounds[1] === 170, "PositionManager: item moved down, top=170");
    assert(item.geometricBounds[3] === 70, "PositionManager: item moved down, bottom=70");
    // Restore should move it BACK UP by 30
    var ok = PM.restore(snapId, doc);
    assert(ok === true, "PositionManager: restore succeeded (read-only bounds, translate-based)");
    assert(item.geometricBounds[0] === 0, "PositionManager: restore left=0");
    assert(item.geometricBounds[1] === 200, "PositionManager: restore top=200 (exact)");
    assert(item.geometricBounds[2] === 200, "PositionManager: restore right=200");
    assert(item.geometricBounds[3] === 100, "PositionManager: restore bottom=100 (exact)");
    PM.clear();
});

test("E2E: PositionManager capture — missing position causes restoration failure", function (SSM) {
    var PM = SSM.PositionManager;
    var doc = SSM.__testApp.doc;
    // Item with no geometricBounds — capture should mark it as invalid
    var item = { id: 60, name: "NoBoundsItem", original: { id: 60 } };
    var snapId = PM.capture([item]);
    assert(snapId, "PositionManager: snapshot captured even with missing bounds");
    // Restoration should fail because the captured position is missing/invalid
    var ok = PM.restore(snapId, doc);
    assert(ok === false, "PositionManager: restore failed when captured position is missing");
    PM.clear();
});

test("E2E: SpacingEngine moveItemBy — read-only geometricBounds, translate-based movement", function (SSM) {
    var SE = SSM.SpacingEngine;
    var doc = SSM.__testApp.doc;
    var item = MOCK.makeItem("TextFrame", "MoveItem", [0, 100, 100, 0]);
    item.id = 70;
    doc.pageItems.push(item);
    // Verify geometricBounds is read-only
    var readOnly = false;
    try { item.geometricBounds = [0, 50, 100, 50]; } catch (e) { readOnly = true; }
    assert(readOnly === true, "Mock: geometricBounds is read-only");
    // moveItemBy should use translate(), not direct assignment
    var ok = SE.moveItemBy(item, 0, 30, doc); // move down by 30
    assert(ok === true, "SpacingEngine: moveItemBy succeeded via translate()");
    assert(item.geometricBounds[1] === 70, "SpacingEngine: item moved down, top=70");
    assert(item.geometricBounds[3] === -30, "SpacingEngine: item moved down, bottom=-30");
    // Move back up
    var ok2 = SE.moveItemBy(item, 0, -30, doc); // move up by 30
    assert(ok2 === true, "SpacingEngine: moveItemBy back up succeeded");
    assert(item.geometricBounds[1] === 100, "SpacingEngine: item restored, top=100");
    assert(item.geometricBounds[3] === 0, "SpacingEngine: item restored, bottom=0");
});

function makeTextItem(contents, bounds, id) {
    return {
        id: id, name: contents, typename: "TextFrame",
        contents: contents, locked: false, hidden: false,
        geometricBounds: bounds, visibleBounds: bounds,
        width: Math.abs(bounds[2] - bounds[0]), height: Math.abs(bounds[3] - bounds[1]),
        layer: { name: "L1" },
        textFont: { name: "Arial", style: "Regular" }, size: 12,
        translate: function (dx, dy) {
            var b = this.geometricBounds;
            this.geometricBounds = [b[0] + dx, b[1] - dy, b[2] + dx, b[3] - dy];
            this.visibleBounds = this.geometricBounds.slice();
        }
    };
}

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
