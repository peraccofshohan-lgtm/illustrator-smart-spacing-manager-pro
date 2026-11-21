// Illustrator Smart Spacing Manager Pro
// Rules/ConflictResolver.jsx — Detect conflicting rule movements
var SSM = SSM || {};
SSM.ConflictResolver = (function () {
    // Detect conflicts among enabled rules. Returns array of conflict descriptors.
    function detectConflicts(rules, sections) {
        var conflicts = [];
        var enabledRules = [];
        for (var r = 0; r < rules.length; r++) {
            if (rules[r].enabled) { enabledRules.push(rules[r]); }
        }
        // Pairwise conflict check
        for (var i = 0; i < enabledRules.length; i++) {
            for (var j = i + 1; j < enabledRules.length; j++) {
                var a = enabledRules[i], b = enabledRules[j];
                var conflict = checkPair(a, b);
                if (conflict) { conflicts.push(conflict); }
            }
        }
        return conflicts;
    }
    function checkPair(a, b) {
        // Same scope and same direction with different target gaps => conflict
        if (a.scope === b.scope && a.direction === b.direction &&
            a.targetGap !== b.targetGap) {
            return {
                ruleA: a.id,
                ruleB: b.id,
                ruleAName: a.name,
                ruleBName: b.name,
                type: "conflictingTargetGap",
                message: "Rules '" + a.name + "' (" + a.targetGap + a.unit + ") and '" + b.name + "' (" + b.targetGap + b.unit + ") target different gaps on overlapping scope '" + a.scope + "' and direction '" + a.direction + "'.",
                severity: "high"
            };
        }
        // Same scope, same direction, same gap, but different anchor behaviors => potential conflict
        if (a.scope === b.scope && a.direction === b.direction &&
            a.targetGap === b.targetGap && a.anchorBehavior !== b.anchorBehavior) {
            return {
                ruleA: a.id,
                ruleB: b.id,
                ruleAName: a.name,
                ruleBName: b.name,
                type: "conflictingAnchorBehavior",
                message: "Rules '" + a.name + "' and '" + b.name + "' use different anchor behaviors (" + a.anchorBehavior + " vs " + b.anchorBehavior + ") on overlapping scope '" + a.scope + "'.",
                severity: "medium"
            };
        }
        // Same measurement target with different measurement modes on same scope
        if (a.scope === b.scope && a.measurementMode !== b.measurementMode) {
            return {
                ruleA: a.id,
                ruleB: b.id,
                ruleAName: a.name,
                ruleBName: b.name,
                type: "conflictingMeasurementMode",
                message: "Rules '" + a.name + "' (" + a.measurementMode + ") and '" + b.name + "' (" + b.measurementMode + ") use different measurement modes on overlapping scope '" + a.scope + "'.",
                severity: "medium"
            };
        }
        return null;
    }
    function resolve(conflicts, strategy) {
        // strategy: "warn" | "skipLowerPriority" | "user"
        var resolved = [];
        for (var i = 0; i < conflicts.length; i++) {
            var c = conflicts[i];
            resolved.push({ conflict: c, action: strategy === "skipLowerPriority" ? "skip" : "warn" });
        }
        return resolved;
    }
    return {
        detectConflicts: detectConflicts,
        resolve: resolve,
        checkPair: checkPair
    };
})();
