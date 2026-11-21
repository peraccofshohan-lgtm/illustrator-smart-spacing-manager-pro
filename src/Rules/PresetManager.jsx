// Illustrator Smart Spacing Manager Pro
// Rules/PresetManager.jsx — Preset save/load/import/export
var SSM = SSM || {};
SSM.PresetManager = (function () {
    var C = SSM.Constants;
    var RuleEngine = SSM.RuleEngine;
    var Compat = SSM.Compat;
    var presets = [];
    var presetLocation = "~/Illustrator Smart Spacing Manager Pro Presets/";
    function addPreset(name, rules, description) {
        var preset = {
            id: Compat.uid("preset"),
            name: name || "Untitled Preset",
            description: description || "",
            rules: rules || [],
            created: Compat.now(),
            modified: Compat.now()
        };
        presets.push(preset);
        return preset;
    }
    function getAll() { return presets.slice(); }
    function getPreset(id) {
        for (var i = 0; i < presets.length; i++) {
            if (presets[i].id === id) { return presets[i]; }
        }
        return null;
    }
    function deletePreset(id) {
        for (var i = 0; i < presets.length; i++) {
            if (presets[i].id === id) { presets.splice(i, 1); return true; }
        }
        return false;
    }
    function exportPreset(presetId) {
        var preset = getPreset(presetId);
        if (!preset) { return null; }
        try {
            return Compat.jsonStringify(preset);
        } catch (e) {
            SSM.Logger.warn("PresetManager.exportPreset failed", e);
            return null;
        }
    }
    function importPreset(jsonText) {
        if (!jsonText) { return { success: false, error: "Empty input" }; }
        try {
            var data = Compat.jsonParse(jsonText);
            if (!data || typeof data !== "object") { return { success: false, error: "Invalid preset format" }; }
            if (!data.name) { data.name = "Imported Preset"; }
            if (!data.rules) { data.rules = []; }
            data.id = Compat.uid("preset");
            data.imported = Compat.now();
            data.modified = Compat.now();
            presets.push(data);
            return { success: true, preset: data };
        } catch (e) {
            return { success: false, error: "Parse error: " + String(e) };
        }
    }
    function saveRulesAsPreset(name, description) {
        var rules = RuleEngine.getAll();
        return addPreset(name, rules, description);
    }
    function loadPresetIntoRules(presetId, clearExisting) {
        var preset = getPreset(presetId);
        if (!preset) { return { success: false, error: "Preset not found" }; }
        if (clearExisting) { RuleEngine.clear(); }
        var loaded = [];
        var errors = [];
        for (var i = 0; i < preset.rules.length; i++) {
            var r = preset.rules[i];
            var result = RuleEngine.createRule(r);
            if (result.rule) { loaded.push(result.rule); }
            else { errors.push(result.errors); }
        }
        return { success: loaded.length > 0, loaded: loaded, errors: errors };
    }
    function exportRules(rules) {
        try {
            return Compat.jsonStringify({ name: "Exported Rules", rules: rules || [], exported: Compat.now() });
        } catch (e) {
            SSM.Logger.warn("PresetManager.exportRules failed", e);
            return null;
        }
    }
    function importJson(jsonText) {
        return importPreset(jsonText);
    }
    function setLocation(loc) { presetLocation = loc; }
    function getLocation() { return presetLocation; }
    function clear() { presets = []; }
    function count() { return presets.length; }
    // Built-in example presets
    function builtInPresets() {
        return [
            {
                name: "Book Layout",
                description: "Chapter heading to body gap 40pt, illustration to caption 12pt",
                rules: [
                    { name: "Chapter Heading to Body", detectionMethod: "text", measurementMode: "visual", direction: "vertical", targetGap: 40, unit: "pt", scope: "document", anchorBehavior: "moveLower", enabled: true },
                    { name: "Illustration to Caption", detectionMethod: "name", measurementMode: "visual", direction: "vertical", targetGap: 12, unit: "pt", scope: "document", anchorBehavior: "moveLower", enabled: true }
                ]
            },
            {
                name: "Magazine Layout",
                description: "Subheading to paragraph 18pt, image to caption 10pt",
                rules: [
                    { name: "Subheading to Paragraph", detectionMethod: "style", measurementMode: "object", direction: "vertical", targetGap: 18, unit: "pt", scope: "document", anchorBehavior: "moveLower", enabled: true },
                    { name: "Image to Caption", detectionMethod: "name", measurementMode: "object", direction: "vertical", targetGap: 10, unit: "pt", scope: "document", anchorBehavior: "moveLower", enabled: true }
                ]
            },
            {
                name: "Editorial Layout",
                description: "Heading to intro 30pt, body to image 24pt",
                rules: [
                    { name: "Heading to Intro", detectionMethod: "text", measurementMode: "visual", direction: "vertical", targetGap: 30, unit: "pt", scope: "document", anchorBehavior: "moveLower", enabled: true },
                    { name: "Body to Image", detectionMethod: "name", measurementMode: "object", direction: "vertical", targetGap: 24, unit: "pt", scope: "document", anchorBehavior: "moveLower", enabled: true }
                ]
            },
            {
                name: "Report Layout",
                description: "Section heading to body 24pt, table to caption 14pt",
                rules: [
                    { name: "Section to Body", detectionMethod: "style", measurementMode: "object", direction: "vertical", targetGap: 24, unit: "pt", scope: "document", anchorBehavior: "moveLower", enabled: true },
                    { name: "Table to Caption", detectionMethod: "name", measurementMode: "object", direction: "vertical", targetGap: 14, unit: "pt", scope: "document", anchorBehavior: "moveLower", enabled: true }
                ]
            },
            {
                name: "Catalogue Layout",
                description: "Product heading to description 16pt, image to price 10pt",
                rules: [
                    { name: "Product to Description", detectionMethod: "name", measurementMode: "object", direction: "vertical", targetGap: 16, unit: "pt", scope: "document", anchorBehavior: "moveLower", enabled: true },
                    { name: "Image to Price", detectionMethod: "name", measurementMode: "object", direction: "vertical", targetGap: 10, unit: "pt", scope: "document", anchorBehavior: "moveLower", enabled: true }
                ]
            },
            {
                name: "General Graphic Design",
                description: "Generic object spacing 20pt both axes",
                rules: [
                    { name: "General Spacing", detectionMethod: "manual", measurementMode: "object", direction: "both", targetGap: 20, unit: "pt", scope: "selection", anchorBehavior: "moveLower", enabled: true }
                ]
            },
            {
                name: "Custom",
                description: "Empty custom preset for your own rules",
                rules: []
            }
        ];
    }
    return {
        addPreset: addPreset,
        getAll: getAll,
        getPreset: getPreset,
        deletePreset: deletePreset,
        exportPreset: exportPreset,
        importPreset: importPreset,
        saveRulesAsPreset: saveRulesAsPreset,
        loadPresetIntoRules: loadPresetIntoRules,
        setLocation: setLocation,
        getLocation: getLocation,
        clear: clear,
        count: count,
        builtInPresets: builtInPresets,
        exportRules: exportRules,
        importJson: importJson
    };
})();
