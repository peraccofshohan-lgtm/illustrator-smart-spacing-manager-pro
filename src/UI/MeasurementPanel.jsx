// Illustrator Smart Spacing Manager Pro
// UI/MeasurementPanel.jsx — Measurement panel
var SSM = SSM || {};
SSM.UI.Measurement = (function () {
    var H = SSM.UIHelpers;
    var C = SSM.Constants;
    function build(parent, app) {
        var panel = H.addPanel(parent, "Measurement", { margins: 12, spacing: 10 });
        var m1 = H.addGroup(panel, "group", { alignChildren: "left", spacing: 8 });
        H.addStaticText(m1, "Measurement mode:");
        var ddMode = H.addDropdown(m1, ["Object Gap", "Visual Gap"], 0, { width: 140 });
        H.addStaticText(m1, "Bounds type:");
        var ddBounds = H.addDropdown(m1, ["Geometric bounds", "Visible bounds", "Control bounds"], 0, { width: 160 });
        var m2 = H.addGroup(panel, "group", { alignChildren: "left", spacing: 8 });
        H.addStaticText(m2, "Direction:");
        var ddDir = H.addDropdown(m2, ["Vertical", "Horizontal", "Both axes", "Auto detect"], 0, { width: 140 });
        H.addStaticText(m2, "Unit:");
        var ddUnit = H.addDropdown(m2, C.UNIT_KEYS, 0, { width: 80 });
        H.addStaticText(m2, "Precision:");
        var ddPrec = H.addDropdown(m2, ["0", "1", "2", "3", "4"], 2, { width: 60 });
        var m3 = H.addGroup(panel, "group", { alignChildren: "left", spacing: 8 });
        var cbOverlap = H.addCheckbox(m3, "Warn on overlap", true);
        var cbSigned = H.addCheckbox(m3, "Signed gap", true);
        var btnMeasure = H.addButton(panel, "Measure Selected Pair", { width: 160 });
        var lblResult = H.addStaticText(panel, "Result: —", { width: 300 });
        var lblRel = H.addStaticText(panel, "Reliability: —", { width: 300 });
        btnMeasure.onClick = function () {
            var st = app.state.get();
            var sel = st.selection;
            if (!sel || sel.length < 2) { lblResult.text = "Select two objects first."; return; }
            var upper = sel[0], lower = sel[1];
            var mode = ddMode.selection ? ddMode.selection.text : "Object Gap";
            var bounds = ddBounds.selection ? ddBounds.selection.text : "Geometric bounds";
            var bt = bounds.indexOf("Visible") !== -1 ? C.BOUNDS_TYPES.VISIBLE : (bounds.indexOf("Control") !== -1 ? C.BOUNDS_TYPES.CONTROL : C.BOUNDS_TYPES.GEOMETRIC);
            var measurement = null;
            if (mode.indexOf("Visual") !== -1) {
                measurement = SSM.VisualGapEngine.visualVerticalGap(upper.original, lower.original, null);
            } else {
                measurement = SSM.ObjectGapEngine.verticalGap(upper.original, lower.original, bt);
            }
            if (!measurement) { lblResult.text = "Cannot measure."; return; }
            var norm = SSM.MeasurementNormalizer.normalizeGap(measurement, ddUnit.selection ? ddUnit.selection.text : "pt", parseInt(ddPrec.selection ? ddPrec.selection.text : "2", 10));
            lblResult.text = "Result: " + norm.display + (measurement.overlaps ? " (OVERLAP)" : "");
            lblRel.text = "Reliability: " + (measurement.reliability || "exact");
        };
        return { panel: panel };
    }
    return { build: build };
})();
