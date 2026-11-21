// Illustrator Smart Spacing Manager Pro
// Rules/RuleEngine.jsx — Rule CRUD, enable/disable, reorder, conflicts
var SSM = SSM || {};
SSM.RuleEngine = (function () {
    var C = SSM.Constants;
    var Validator = SSM.RuleValidator;
    var rules = [];
    function createRule(config) {
        config = config || {};
        var rule = {
            id: config.id || SSM.Compat.uid("rule"),
            name: config.name || "Untitled Rule",
            description: config.description || "",
            detectionMethod: config.detectionMethod || C.DETECTION_METHODS.MANUAL,
            detectionConfig: config.detectionConfig || {},
            measurementMode: config.measurementMode || C.MEASUREMENT_MODES.OBJECT,
            boundsType: config.boundsType || C.BOUNDS_TYPES.GEOMETRIC,
            direction: config.direction || C.DIRECTIONS.VERTICAL,
            targetGap: config.targetGap !== undefined ? config.targetGap : 0,
            unit: config.unit || "pt",
            tolerance: config.tolerance !== undefined ? config.tolerance : 0.5,
            scope: config.scope || C.SCOPES.SELECTION,
            anchorBehavior: config.anchorBehavior || C.ANCHOR_BEHAVIORS.MOVE_LOWER,
            priority: config.priority !== undefined ? config.priority : 0,
            enabled: config.enabled !== undefined ? config.enabled : true,
            conflictBehavior: config.conflictBehavior || "warn",
            fallbackBehavior: config.fallbackBehavior || "skip",
            created: SSM.Compat.now(),
            modified: SSM.Compat.now()
        };
        var validation = Validator.validate(rule);
        if (!validation.valid) {
            return { rule: null, errors: validation.errors, warnings: validation.warnings };
        }
        rules.push(rule);
        return { rule: rule, errors: [], warnings: validation.warnings };
    }
    function getRule(ruleId) {
        for (var i = 0; i < rules.length; i++) {
            if (rules[i].id === ruleId) { return rules[i]; }
        }
        return null;
    }
    function getAll() { return rules.slice(); }
    function getEnabled() {
        var out = [];
        for (var i = 0; i < rules.length; i++) {
            if (rules[i].enabled) { out.push(rules[i]); }
        }
        return out;
    }
    function updateRule(ruleId, changes) {
        var rule = getRule(ruleId);
        if (!rule) { return { success: false, error: "Rule not found" }; }
        for (var k in changes) {
            if (changes.hasOwnProperty(k) && k !== "id" && k !== "created") {
                rule[k] = changes[k];
            }
        }
        rule.modified = SSM.Compat.now();
        var validation = Validator.validate(rule);
        if (!validation.valid) {
            return { success: false, errors: validation.errors, warnings: validation.warnings };
        }
        return { success: true, rule: rule, warnings: validation.warnings };
    }
    function deleteRule(ruleId) {
        for (var i = 0; i < rules.length; i++) {
            if (rules[i].id === ruleId) { rules.splice(i, 1); return true; }
        }
        return false;
    }
    function enableRule(ruleId, enabled) {
        var rule = getRule(ruleId);
        if (!rule) { return false; }
        rule.enabled = enabled !== undefined ? enabled : true;
        rule.modified = SSM.Compat.now();
        return true;
    }
    function duplicateRule(ruleId, newName) {
        var rule = getRule(ruleId);
        if (!rule) { return null; }
        var dup = {
            id: SSM.Compat.uid("rule"),
            name: newName || rule.name + " (copy)",
            description: rule.description,
            detectionMethod: rule.detectionMethod,
            detectionConfig: rule.detectionConfig,
            measurementMode: rule.measurementMode,
            boundsType: rule.boundsType,
            direction: rule.direction,
            targetGap: rule.targetGap,
            unit: rule.unit,
            tolerance: rule.tolerance,
            scope: rule.scope,
            anchorBehavior: rule.anchorBehavior,
            priority: rule.priority,
            enabled: rule.enabled,
            conflictBehavior: rule.conflictBehavior,
            fallbackBehavior: rule.fallbackBehavior,
            created: SSM.Compat.now(),
            modified: SSM.Compat.now()
        };
        rules.push(dup);
        return dup;
    }
    function reorderRule(ruleId, newIndex) {
        var idx = -1;
        for (var i = 0; i < rules.length; i++) {
            if (rules[i].id === ruleId) { idx = i; break; }
        }
        if (idx < 0) { return false; }
        var rule = rules.splice(idx, 1)[0];
        newIndex = Math.max(0, Math.min(newIndex, rules.length));
        rules.splice(newIndex, 0, rule);
        return true;
    }
    function setPriority(ruleId, priority) {
        var rule = getRule(ruleId);
        if (!rule) { return false; }
        rule.priority = priority;
        rule.modified = SSM.Compat.now();
        return true;
    }
    function sortByPriority() {
        rules.sort(function (a, b) { return b.priority - a.priority; });
    }
    function clear() { rules = []; }
    function count() { return rules.length; }
    // Resolve the single most applicable rule for a section using:
    // section type, detection method, detection criteria, scope, direction,
    // measurement mode, and priority. Returns null if no rule matches.
    function resolveRuleForSection(section, rules) {
        rules = rules || getAll();
        var candidates = [];
        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];
            if (!rule.enabled) { continue; }
            var score = 0;
            // Scope match
            if (rule.scope === C.SCOPES.SECTIONS || rule.scope === C.SCOPES.DOCUMENT) { score += 4; }
            else if (rule.scope === C.SCOPES.SELECTION) { score += 2; }
            // Section type match via detection config
            if (rule.detectionConfig && rule.detectionConfig.sectionType &&
                section.type === rule.detectionConfig.sectionType) { score += 3; }
            // Detection method relevance
            if (rule.detectionMethod === C.DETECTION_METHODS.COMBINED) { score += 2; }
            else if (rule.detectionMethod === C.DETECTION_METHODS.MANUAL) { score += 1; }
            // Direction match (vertical preferred for section stacking; but honor rule's direction)
            if (rule.direction === C.DIRECTIONS.VERTICAL) { score += 1; }
            // Priority (higher = more specific)
            score += (rule.priority || 0);
            candidates.push({ rule: rule, score: score });
        }
        if (candidates.length === 0) { return null; }
        candidates.sort(function (a, b) { return b.score - a.score; });
        return candidates[0].rule;
    }
    return {
        createRule: createRule,
        getRule: getRule,
        getAll: getAll,
        getEnabled: getEnabled,
        updateRule: updateRule,
        deleteRule: deleteRule,
        enableRule: enableRule,
        duplicateRule: duplicateRule,
        reorderRule: reorderRule,
        setPriority: setPriority,
        sortByPriority: sortByPriority,
        resolveRuleForSection: resolveRuleForSection,
        clear: clear,
        count: count
    };
})();
