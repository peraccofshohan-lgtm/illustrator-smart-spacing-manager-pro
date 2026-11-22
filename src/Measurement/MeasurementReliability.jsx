// Illustrator Smart Spacing Manager Pro
// Measurement/MeasurementReliability.jsx — Reliability scoring & warnings
var SSM = SSM || {};
SSM.MeasurementReliability = (function () {
    function assess(mode, method, reliability, rotation, clipping, textFrame, outlinedFallback) {
        var score = 100;
        var notes = [];
        if (reliability === "approximate") { score -= 30; notes.push("Approximate measurement"); }
        if (rotation) { score -= 15; notes.push("Rotated object (axis-aligned bounds approximation)"); }
        if (clipping) { score -= 20; notes.push("Clipped group / mask present"); }
        if (textFrame && !outlinedFallback) { score -= 10; notes.push("Text frame visual bounds estimated"); }
        if (mode === "visual") { notes.push("Visual measurement engine used"); }
        if (score < 0) { score = 0; }
        return {
            score: score,
            level: score >= 80 ? "high" : (score >= 50 ? "medium" : "low"),
            notes: notes,
            isApproximate: reliability === "approximate" || score < 80
        };
    }
    function warningFor(reliability) {
        if (!reliability) { return null; }
        if (reliability.isApproximate) {
            return "Measurement is approximate (" + reliability.level + " confidence): " + reliability.notes.join("; ");
        }
        return null;
    }
    return {
        assess: assess,
        warningFor: warningFor
    };
})();
