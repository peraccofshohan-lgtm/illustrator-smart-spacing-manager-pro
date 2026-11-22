// Illustrator Smart Spacing Manager Pro
// Rules/RuleValidator.jsx — Rule validation
var SSM = SSM || {};
SSM.RuleValidator = (function () {
    var C = SSM.Constants;
    function validate(rule) {
        var errors = [];
        var warnings = [];
        if (!rule) { errors.push("Rule is null"); return { valid: false, errors: errors, warnings: warnings }; }
        if (!rule.id) { errors.push("Rule missing id"); }
        if (!rule.name || rule.name.length === 0) { errors.push("Rule missing name"); }
        if (!rule.detectionMethod) { errors.push("Rule missing detectionMethod"); }
        if (!rule.measurementMode) { errors.push("Rule missing measurementMode"); }
        if (!rule.direction) { errors.push("Rule missing direction"); }
        if (!rule.unit || !C.UNITS[rule.unit]) { errors.push("Rule has invalid unit: " + rule.unit); }
        if (rule.targetGap === undefined || rule.targetGap === null) { errors.push("Rule missing targetGap"); }
        else if (isNaN(rule.targetGap)) { errors.push("Rule targetGap is not a number"); }
        if (!rule.anchorBehavior) { warnings.push("Rule missing anchorBehavior, defaulting to moveLower"); }
        if (!rule.scope) { warnings.push("Rule missing scope, defaulting to selection"); }
        return { valid: errors.length === 0, errors: errors, warnings: warnings };
    }
    function validateAll(rules) {
        var results = [];
        var allValid = true;
        for (var i = 0; i < rules.length; i++) {
            var r = validate(rules[i]);
            r.ruleId = rules[i].id;
            r.ruleName = rules[i].name;
            results.push(r);
            if (!r.valid) { allValid = false; }
        }
        return { allValid: allValid, results: results };
    }
    return {
        validate: validate,
        validateAll: validateAll
    };
})();
