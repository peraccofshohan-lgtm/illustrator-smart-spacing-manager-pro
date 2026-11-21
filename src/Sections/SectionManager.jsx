// Illustrator Smart Spacing Manager Pro
// Sections/SectionManager.jsx — Section creation, grouping, anchor/target assignment
var SSM = SSM || {};
SSM.SectionManager = (function () {
    var C = SSM.Constants;
    var sections = [];
    var nextId = 1;
    function createSection(name, type, anchorItem, targetItem, group) {
        var id = "sec-" + nextId++;
        var section = {
            id: id,
            name: name || "Section",
            type: type || "content",
            anchor: anchorItem || null,
            target: targetItem || null,
            group: group || "default",
            objects: [],
            enabled: true
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
        return true;
    }
    function setTarget(sectionId, item) {
        var section = getSection(sectionId);
        if (!section) { return false; }
        section.target = item;
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
        count: count
    };
})();
