// Illustrator Smart Spacing Manager Pro
// Sections/RelationshipEngine.jsx — Section-to-section relationships
var SSM = SSM || {};
SSM.RelationshipEngine = (function () {
    var SectionManager = SSM.SectionManager;
    var relationships = [];
    function createRelationship(fromSectionId, toSectionId, type, anchorBehavior, targetGap, unit) {
        var rel = {
            id: SSM.Compat.uid("rel"),
            fromSectionId: fromSectionId,
            toSectionId: toSectionId,
            type: type || "headingToContent", // headingToContent, contentToHeading, headingToHeading, sectionToSection
            anchorBehavior: anchorBehavior || "moveLower",
            targetGap: targetGap || 0,
            unit: unit || "pt",
            enabled: true
        };
        relationships.push(rel);
        return rel;
    }
    function getAll() { return relationships.slice(); }
    function getForSection(sectionId) {
        var out = [];
        for (var i = 0; i < relationships.length; i++) {
            if (relationships[i].fromSectionId === sectionId || relationships[i].toSectionId === sectionId) {
                out.push(relationships[i]);
            }
        }
        return out;
    }
    function remove(relId) {
        for (var i = 0; i < relationships.length; i++) {
            if (relationships[i].id === relId) { relationships.splice(i, 1); return true; }
        }
        return false;
    }
    function clear() { relationships = []; }
    function buildSectionChain(group) {
        // Return sections of a group ordered by vertical position (top to bottom)
        var sections = SectionManager.getByGroup(group);
        // sort by anchor/top item bounds
        sections.sort(function (a, b) {
            var ya = a.anchor && a.anchor.bounds ? a.anchor.bounds.top : 0;
            var yb = b.anchor && b.anchor.bounds ? b.anchor.bounds.top : 0;
            return ya - yb;
        });
        return sections;
    }
    return {
        createRelationship: createRelationship,
        getAll: getAll,
        getForSection: getForSection,
        remove: remove,
        clear: clear,
        buildSectionChain: buildSectionChain
    };
})();
