// Illustrator Smart Spacing Manager Pro
// Detection/DetectionRegistry.jsx — Registry of available detection methods
var SSM = SSM || {};
SSM.DetectionRegistry = (function () {
    var C = SSM.Constants;
    var methods = [
        { id: C.DETECTION_METHODS.MANUAL, name: "Manual Selection", description: "Use currently selected objects in Illustrator", panel: "ManualDetection" },
        { id: C.DETECTION_METHODS.TEXT, name: "Text Matching", description: "Match text frame contents by pattern", panel: "TextDetection" },
        { id: C.DETECTION_METHODS.STYLE, name: "Style Matching", description: "Match typography & appearance attributes", panel: "StyleDetection" },
        { id: C.DETECTION_METHODS.NAME, name: "Object Naming", description: "Match page item / layer / group names", panel: "NameDetection" },
        { id: C.DETECTION_METHODS.COMBINED, name: "Combined Detection", description: "Combine multiple detection methods", panel: "CombinedDetection" }
    ];
    function getAll() { return methods.slice(); }
    function getById(id) {
        for (var i = 0; i < methods.length; i++) {
            if (methods[i].id === id) { return methods[i]; }
        }
        return null;
    }
    function run(doc, methodId, config) {
        var method = getById(methodId);
        if (!method) { return { items: [], warning: "Unknown detection method: " + methodId }; }
        if (methodId === C.DETECTION_METHODS.COMBINED) {
            return SSM.CombinedDetection.run(doc, config || []);
        }
        switch (methodId) {
            case C.DETECTION_METHODS.MANUAL: return SSM.ManualDetection.run(doc, config);
            case C.DETECTION_METHODS.TEXT: return SSM.TextDetection.run(doc, config);
            case C.DETECTION_METHODS.STYLE: return SSM.StyleDetection.run(doc, config);
            case C.DETECTION_METHODS.NAME: return SSM.NameDetection.run(doc, config);
            default: return { items: [], warning: "Method not implemented: " + methodId };
        }
    }
    return {
        getAll: getAll,
        getById: getById,
        run: run
    };
})();
