// Illustrator Smart Spacing Manager Pro
// Rules/ConflictResolver.jsx — Detect conflicting rule movements
var SSM = SSM || {};
SSM.ConflictResolver = (function () {
    function detectConflicts(rules, sections) {
        var conflicts = [];
        // Build map of section -> rules targeting it
        var sectionRules = {};
        for (var r = 0; r < rules.length; r++) {
            var rule = rules[r];
            if (!rule.enabled) { continue; }
            var scope = rule.scope;
            // Simplification: flag rules with same scope and direction but different targets on overlapping sections
            var key = scope + "|" + rule.direction;
            if (!sectionRules[key]) { sectionRules[key] = []; }
            sectionRules[key].push(rule);
        }
        for (var k in sectionRules) {
            if (!sectionRules.hasOwnProperty(k)) { continue; }
            var group = sectionRules[k];
            for (var i = 0; i < group.length; i++) {
                for (var j = i + 1; j < group.length; j++) {
                    var a = group[i], b = group[j];
                    if (a.targetGap !== b.targetGap) {
                        conflicts.push({
                            ruleA: a.id,
                            ruleB: b.id,
                            type: "conflictingTargetGap",
                            message: "Rules '" + a.name + "' (" + a.targetGap + a.unit + ") and '" + b.name + "' (" + b.targetGap + b.unit + ") target different gaps on overlapping scope '" + a.scope + "'.",
                            severity: "high"
                        });
                    }
                }
            }
        }
        return conflicts;
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
        resolve: resolve
    };
})();
