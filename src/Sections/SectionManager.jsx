// Illustrator Smart Spacing Manager Pro
// Sections/SectionManager.jsx — Section creation, grouping, anchor/target assignment
var SSM = SSM || {};
SSM.SectionManager = (function () {
    var C = SSM.Constants;
    var sections = [];
    var nextId = 1;
    // Extract detection metadata from a detected item (set by TextDetection,
    // StyleDetection, NameDetection, CombinedDetection). Returns {method, config}.
    function extractDetectionMetadata(item) {
        var method = null;
        var config = {};
        if (!item) { return { method: null, config: {} }; }
        // Detection method set by detection engines
        if (item.method) { method = item.method; }
        else if (item.detectionMethod) { method = item.detectionMethod; }
        // Detection criteria captured by detection engines
        if (item.matchText) { config.textPattern = item.matchText; }
        if (item.matchType) { config.matchType = item.matchType; }
        if (item.criteriaMatched !== undefined) { config.criteriaMatched = item.criteriaMatched; }
        if (item.sectionRole) { config.sectionRole = item.sectionRole; }
        if (item.sectionGroup) { config.sectionGroup = item.sectionGroup; }
        // Preserve actual matched style criteria (attr/value pairs) for RuleEngine compatibility
        if (item.matchedCriteria && item.matchedCriteria.length > 0) {
            config.matchedCriteria = item.matchedCriteria.slice();
            // Also flatten into rule-checkable fields
            for (var m = 0; m < item.matchedCriteria.length; m++) {
                var mc = item.matchedCriteria[m];
                if (mc && mc.attr && mc.value !== undefined) {
                    config[mc.attr] = mc.value;
                }
            }
        }
        // Any explicit detectionConfig on the item
        if (item.detectionConfig) {
            for (var k in item.detectionConfig) {
                if (item.detectionConfig.hasOwnProperty(k)) {
                    config[k] = item.detectionConfig[k];
                }
            }
        }
        return { method: method, config: config };
    }
    function createSection(name, type, anchorItem, targetItem, group, options) {
        options = options || {};
        var id = "sec-" + nextId++;
        // Extract detection metadata from anchor/target if they were detected
        var anchorMeta = extractDetectionMetadata(anchorItem);
        var targetMeta = extractDetectionMetadata(targetItem);
        // Use the anchor's detection method as the section's primary method
        // (anchor is typically the "heading" or reference object)
        var detectionMethod = anchorMeta.method || targetMeta.method || options.detectionMethod || null;
        var detectionConfig = {};
        // Merge anchor and target configs; anchor takes precedence
        for (var k in targetMeta.config) {
            if (targetMeta.config.hasOwnProperty(k)) {
                detectionConfig[k] = targetMeta.config[k];
            }
        }
        for (var k2 in anchorMeta.config) {
            if (anchorMeta.config.hasOwnProperty(k2)) {
                detectionConfig[k2] = anchorMeta.config[k2];
            }
        }
        for (var k3 in options.detectionConfig) {
            if (options.detectionConfig.hasOwnProperty(k3)) {
                detectionConfig[k3] = options.detectionConfig[k3];
            }
        }
        var section = {
            id: id,
            name: name || "Section",
            type: type || "content",
            anchor: anchorItem || null,
            target: targetItem || null,
            group: group || "default",
            objects: [],
            enabled: true,
            detectionMethod: detectionMethod,
            detectionConfig: Object.keys(detectionConfig).length > 0 ? detectionConfig : {}
        };
        sections.push(section);
        return section;
    }
    function addObjectToSection(sectionId, item) {
        var section = getSection(sectionId);
        if (!section) { return false; }
        var already = false;
        for (var i = 0; i < section.objects.length; i++) {
            if (section.objects[i].id === item.id) { already = true; break; }
        }
        if (!already) { section.objects.push(item); }
        return true;
    }
    function setAnchor(sectionId, item) {
        var section = getSection(sectionId);
        if (!section) { return false; }
        section.anchor = item;
        // Refresh detection metadata from new anchor
        var meta = extractDetectionMetadata(item);
        if (meta.method) { section.detectionMethod = meta.method; }
        if (meta.config && Object.keys(meta.config).length > 0) {
            section.detectionConfig = section.detectionConfig || {};
            for (var k in meta.config) {
                if (meta.config.hasOwnProperty(k)) {
                    section.detectionConfig[k] = meta.config[k];
                }
            }
        }
        return true;
    }
    function setTarget(sectionId, item) {
        var section = getSection(sectionId);
        if (!section) { return false; }
        section.target = item;
        // Refresh detection metadata from new target
        var meta = extractDetectionMetadata(item);
        if (meta.method && !section.detectionMethod) { section.detectionMethod = meta.method; }
        if (meta.config && Object.keys(meta.config).length > 0) {
            section.detectionConfig = section.detectionConfig || {};
            for (var k in meta.config) {
                if (meta.config.hasOwnProperty(k)) {
                    section.detectionConfig[k] = meta.config[k];
                }
            }
        }
        return true;
    }
    function removeSection(sectionId) {
        var idx = indexOfSection(sectionId);
        if (idx < 0) { return false; }
        sections.splice(idx, 1);
        return true;
    }
    function getSection(sectionId) {
        var idx = indexOfSection(sectionId);
        return idx < 0 ? null : sections[idx];
    }
    function indexOfSection(sectionId) {
        for (var i = 0; i < sections.length; i++) {
            if (sections[i].id === sectionId) { return i; }
        }
        return -1;
    }
    function getAll() { return sections.slice(); }
    function getByGroup(group) {
        var out = [];
        for (var i = 0; i < sections.length; i++) {
            if (sections[i].group === group) { out.push(sections[i]); }
        }
        return out;
    }
    function clear() { sections = []; nextId = 1; }
    function count() { return sections.length; }
    return {
        createSection: createSection,
        addObjectToSection: addObjectToSection,
        setAnchor: setAnchor,
        setTarget: setTarget,
        removeSection: removeSection,
        getSection: getSection,
        getAll: getAll,
        getByGroup: getByGroup,
        clear: clear,
        count: count,
        extractDetectionMetadata: extractDetectionMetadata
    };
})();
