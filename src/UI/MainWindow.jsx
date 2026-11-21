// Illustrator Smart Spacing Manager Pro
// UI/MainWindow.jsx — Main floating ScriptUI palette
var SSM = SSM || {};
SSM.UI.MainWindow = (function () {
    var H = SSM.UIHelpers;
    var C = SSM.Constants;
    function create(app) {
        var win = new Window("palette", C.APP_SHORT, undefined, { closeable: true });
        win.orientation = "column";
        win.alignChildren = ["fill", "top"];
        var tabbed = H.addTabbedPanel(win, { alignment: "fill" });
        function addTab(title, builder) {
            var tab = tabbed.add("tab", undefined, title);
            tab.orientation = "column";
            tab.alignChildren = ["fill", "top"];
            tab.margins = 10;
            tab.spacing = 10;
            var result = builder(tab, app);
            return result;
        }
        var dashboard = addTab("Dashboard", SSM.UI.Dashboard.build);
        var detection = addTab("Detection", SSM.UI.Detection.build);
        var sections = addTab("Sections", SSM.UI.Section.build);
        var measurement = addTab("Measurement", SSM.UI.Measurement.build);
        var rules = addTab("Rules", SSM.UI.Rules.build);
        var presets = addTab("Presets", SSM.UI.Presets.build);
        var preview = addTab("Preview", SSM.UI.Preview.build);
        var batch = addTab("Batch", SSM.UI.Batch.build);
        var settings = addTab("Settings", SSM.UI.Settings.build);
        var help = addTab("Help", SSM.UI.Help.build);
        // Actions
        app.actions = {
            scanDocument: function () {
                var st = app.state.get();
                var items = [];
                var warnings = [];
                try {
                    var doc = SSM.DocumentManager.getActiveDocument();
                    if (!doc) { warnings.push("No active document"); }
                    else {
                        var all = SSM.DocumentManager.getPageItems(doc);
                        items = all;
                        app.state.set("items", all);
                        app.state.set("document", { name: doc.name, artboards: doc.artboards ? doc.artboards.length : 0 });
                        app.state.set("artboards", SSM.DocumentManager.getArtboards(doc));
                        var sel = SSM.DocumentManager.getSelection(doc);
                        app.state.set("selection", sel);
                    }
                } catch (e) {
                    warnings.push("Scan error: " + String(e));
                    SSM.ErrorReporter.report("SCAN_ERROR", String(e));
                }
                st = app.state.get();
                st.warnings = warnings;
                dashboard.refresh();
                SSM.Logger.info("Scan complete", { items: items.length, warnings: warnings.length });
            },
            refreshSelection: function () {
                var doc = SSM.DocumentManager.getActiveDocument();
                var sel = doc ? SSM.DocumentManager.getSelection(doc) : [];
                app.state.set("selection", sel);
                dashboard.refresh();
            },
            refreshDashboard: function () { dashboard.refresh(); },
            preview: function () { previewBuild(); },
            apply: function () { applySelected(); },
            applyAll: function () { applyAll(); },
            openRules: function () { tabbed.selection = 4; } // Rules tab index
        };
        function previewBuild() {
            var st = app.state.get();
            var entries = SSM.PreviewEngine.buildPreview(st.sections, st.rules, null);
            var list = getListBox(preview.panel);
            list.removeAll();
            for (var i = 0; i < entries.length; i++) {
                var e = entries[i];
                list.add("item", e.sectionName + ": " + e.currentDisplay + " → " + e.targetDisplay + " (Δ" + e.diffDisplay + ")");
            }
            var summary = getStaticText(preview.panel, "Preview entries: ");
            if (summary) { summary.text = "Preview entries: " + entries.length; }
            app.state.set("previewEntries", entries);
            if (st.previewIndicators) {
                SSM.PreviewRenderer.render(entries, null);
            }
            dashboard.refresh();
        }
        function applySelected() {
            var st = app.state.get();
            var entries = st.previewEntries || [];
            if (entries.length === 0) { alert("No preview entries to apply."); return; }
            var doc = SSM.DocumentManager.getActiveDocument();
            if (!doc) { alert("No active document."); return; }
            // Detect conflicts before applying
            var conflicts = SSM.ConflictResolver.detectConflicts(st.rules, st.sections);
            if (conflicts.length > 0) {
                var msgs = [];
                for (var c = 0; c < conflicts.length; c++) { msgs.push(conflicts[c].message); }
                if (!confirm("Rule conflicts detected:\n" + msgs.join("\n") + "\n\nContinue anyway?")) { return; }
            }
            var applied = 0;
            var failed = 0;
            for (var i = 0; i < entries.length; i++) {
                var e = entries[i];
                // Use the SAME resolved rule from the preview entry
                var rule = SSM.RuleEngine.getRule(e.ruleId);
                if (!rule || !rule.enabled) { failed++; continue; }
                var anchor = findItemById(st.sections, e.anchorId);
                var target = findItemById(st.sections, e.targetId);
                if (!anchor || !target) { failed++; continue; }
                // Re-measure using the same method as the preview
                var measurement = null;
                if (e.measurementMode === "visual") {
                    if (e.direction === C.DIRECTIONS.HORIZONTAL) {
                        measurement = SSM.VisualGapEngine.visualHorizontalGap(anchor.original, target.original, doc);
                    } else {
                        measurement = SSM.VisualGapEngine.visualVerticalGap(anchor.original, target.original, doc);
                    }
                } else {
                    if (e.direction === C.DIRECTIONS.HORIZONTAL) {
                        measurement = SSM.ObjectGapEngine.horizontalGap(anchor.original, target.original, e.boundsType);
                    } else {
                        measurement = SSM.ObjectGapEngine.verticalGap(anchor.original, target.original, e.boundsType);
                    }
                }
                if (!measurement) { failed++; continue; }
                var targetPt = SSM.MeasurementNormalizer.targetGapToPoints(e.targetGap, e.unit);
                var result = SSM.SpacingEngine.applyToPair(anchor, target, measurement, targetPt, e.anchorBehavior, doc);
                if (result.success) { applied++; } else { failed++; }
                e.applied = true;
            }
            alert("Applied to " + applied + " section(s)." + (failed > 0 ? " (" + failed + " failed)" : ""));
            dashboard.refresh();
        }
        function applyAll() {
            var st = app.state.get();
            var doc = SSM.DocumentManager.getActiveDocument();
            if (!doc) { alert("No active document."); return; }
            // Detect conflicts before applying
            var conflicts = SSM.ConflictResolver.detectConflicts(st.rules, st.sections);
            if (conflicts.length > 0) {
                var msgs = [];
                for (var c = 0; c < conflicts.length; c++) { msgs.push(conflicts[c].message); }
                if (!confirm("Rule conflicts detected:\n" + msgs.join("\n") + "\n\nContinue anyway?")) { return; }
            }
            var result = SSM.SpacingEngine.applyToSections(st.sections, st.rules, doc);
            if (result.success) {
                alert("Apply all complete: " + result.results.length + " section(s) processed.");
            } else {
                alert("Apply all failed: " + result.error + ". Partial changes may have been rolled back.");
            }
            dashboard.refresh();
        }
        function getListBox(panel) {
            for (var i = 0; i < panel.children.length; i++) {
                if (panel.children[i] && panel.children[i].typename === "ListBox") { return panel.children[i]; }
            }
            return null;
        }
        function getStaticText(panel, startsWith) {
            for (var i = 0; i < panel.children.length; i++) {
                var c = panel.children[i];
                if (c && c.text && c.text.indexOf(startsWith) === 0) { return c; }
            }
            return null;
        }
        function findItemById(sections, id) {
            for (var s = 0; s < sections.length; s++) {
                var sec = sections[s];
                if (sec.anchor && sec.anchor.id === id) { return sec.anchor; }
                if (sec.target && sec.target.id === id) { return sec.target; }
                for (var o = 0; o < (sec.objects || []).length; o++) {
                    if (sec.objects[o].id === id) { return sec.objects[o]; }
                }
            }
            return null;
        }
        win.onClose = function () {
            SSM.PreviewRenderer.clear(null);
        };
        return win;
    }
    return { create: create };
})();
