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
            var first = sel[0], second = sel[1];
            var mode = ddMode.selection ? ddMode.selection.text : "Object Gap";
            var bounds = ddBounds.selection ? ddBounds.selection.text : "Geometric bounds";
            var bt = bounds.indexOf("Visible") !== -1 ? C.BOUNDS_TYPES.VISIBLE : (bounds.indexOf("Control") !== -1 ? C.BOUNDS_TYPES.CONTROL : C.BOUNDS_TYPES.GEOMETRIC);
            var dirSel = ddDir.selection ? ddDir.selection.text : "Vertical";
            var dir = dirSel === "Horizontal" ? C.DIRECTIONS.HORIZONTAL :
                      dirSel === "Both axes" ? C.DIRECTIONS.BOTH :
                      dirSel === "Auto detect" ? C.DIRECTIONS.AUTO : C.DIRECTIONS.VERTICAL;
            var measurement = null;
            var isVisual = mode.indexOf("Visual") !== -1;
            if (dir === C.DIRECTIONS.HORIZONTAL) {
                measurement = isVisual
                    ? SSM.VisualGapEngine.visualHorizontalGap(first.original, second.original, null)
                    : SSM.ObjectGapEngine.horizontalGap(first.original, second.original, bt);
            } else if (dir === C.DIRECTIONS.BOTH) {
                var v = isVisual
                    ? SSM.VisualGapEngine.visualVerticalGap(first.original, second.original, null)
                    : SSM.ObjectGapEngine.verticalGap(first.original, second.original, bt);
                var h = isVisual
                    ? SSM.VisualGapEngine.visualHorizontalGap(first.original, second.original, null)
                    : SSM.ObjectGapEngine.horizontalGap(first.original, second.original, bt);
                if (v && h) { v.horizontal = h; measurement = v; }
                else { measurement = v || h; }
            } else if (dir === C.DIRECTIONS.AUTO) {
                var v = isVisual
                    ? SSM.VisualGapEngine.visualVerticalGap(first.original, second.original, null)
                    : SSM.ObjectGapEngine.verticalGap(first.original, second.original, bt);
                var h = isVisual
                    ? SSM.VisualGapEngine.visualHorizontalGap(first.original, second.original, null)
                    : SSM.ObjectGapEngine.horizontalGap(first.original, second.original, bt);
                measurement = SSM.ObjectGapEngine.detectDirection(v, h);
                // detectDirection returns a direction string, not a measurement; fall back to vertical
                if (typeof measurement === "string") { measurement = v; }
            } else {
                measurement = isVisual
                    ? SSM.VisualGapEngine.visualVerticalGap(first.original, second.original, null)
                    : SSM.ObjectGapEngine.verticalGap(first.original, second.original, bt);
            }
            if (!measurement) { lblResult.text = "Cannot measure."; lblRel.text = "Reliability: —"; return; }
            var unit = ddUnit.selection ? ddUnit.selection.text : "pt";
            var prec = parseInt(ddPrec.selection ? ddPrec.selection.text : "2", 10);
            var norm = SSM.MeasurementNormalizer.normalizeGap(measurement, unit, prec);
            var dirLabel = dirSel;
            if (measurement.horizontal) {
                lblResult.text = "Result: V=" + norm.display + " H=" + SSM.MeasurementNormalizer.roundForDisplay(measurement.horizontal.gap, unit, prec) + (measurement.overlaps ? " (OVERLAP)" : "");
            } else {
                lblResult.text = "Result: " + norm.display + (measurement.overlaps ? " (OVERLAP)" : "");
            }
            lblRel.text = "Reliability: " + (measurement.reliability || "exact") + " (" + (measurement.method || "objectGap") + ")";
        };
        return { panel: panel };
    }
    return { build: build };
})();
