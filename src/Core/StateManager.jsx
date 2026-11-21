// Illustrator Smart Spacing Manager Pro
// Core/StateManager.jsx — Application state container (ES3)
var SSM = SSM || {};
SSM.StateManager = (function () {
    var state = {
        initialized: false,
        document: null,
        artboards: [],
        items: [],
        selection: [],
        detections: [],
        sections: [],
        rules: [],
        activeRuleId: null,
        measurementMode: "object",
        boundsType: "geometric",
        direction: "vertical",
        unit: "pt",
        precision: 2,
        scope: "selection",
        anchorBehavior: "moveLower",
        tolerance: 0.5,
        previewEnabled: true,
        previewIndicators: true,
        excludeLocked: true,
        excludeHidden: true,
        excludeGuides: true,
        excludeTemplate: true,
        lastOperation: null,
        warnings: []
    };
    function get() {
        // Return a shallow copy of public state
        return {
            initialized: state.initialized,
            document: state.document,
            artboards: state.artboards.slice(),
            items: state.items.slice(),
            selection: state.selection.slice(),
            detections: state.detections.slice(),
            sections: state.sections.slice(),
            rules: state.rules.slice(),
            activeRuleId: state.activeRuleId,
            measurementMode: state.measurementMode,
            boundsType: state.boundsType,
            direction: state.direction,
            unit: state.unit,
            precision: state.precision,
            scope: state.scope,
            anchorBehavior: state.anchorBehavior,
            tolerance: state.tolerance,
            previewEnabled: state.previewEnabled,
            previewIndicators: state.previewIndicators,
            excludeLocked: state.excludeLocked,
            excludeHidden: state.excludeHidden,
            excludeGuides: state.excludeGuides,
            excludeTemplate: state.excludeTemplate,
            lastOperation: state.lastOperation,
            warnings: state.warnings.slice()
        };
    }
    function set(key, value) {
        if (state.hasOwnProperty(key)) {
            state[key] = value;
            SSM.Logger.debug("State set: " + key);
        } else {
            SSM.Logger.warn("StateManager: unknown key " + key);
        }
    }
    function patch(partial) {
        for (var k in partial) {
            if (partial.hasOwnProperty(k)) {
                set(k, partial[k]);
            }
        }
    }
    function reset() {
        state = {
            initialized: false,
            document: null,
            artboards: [],
            items: [],
            selection: [],
            detections: [],
            sections: [],
            rules: [],
            activeRuleId: null,
            measurementMode: "object",
            boundsType: "geometric",
            direction: "vertical",
            unit: "pt",
            precision: 2,
            scope: "selection",
            anchorBehavior: "moveLower",
            tolerance: 0.5,
            previewEnabled: true,
            previewIndicators: true,
            excludeLocked: true,
            excludeHidden: true,
            excludeGuides: true,
            excludeTemplate: true,
            lastOperation: null,
            warnings: []
        };
    }
    function addWarning(msg) {
        state.warnings.push({ id: SSM.Compat.uid("wrn"), message: String(msg), time: SSM.Compat.now() });
        SSM.Logger.warn(msg);
    }
    function clearWarnings() { state.warnings = []; }
    function getWarnings() { return state.warnings.slice(); }
    return {
        get: get,
        set: set,
        patch: patch,
        reset: reset,
        addWarning: addWarning,
        clearWarnings: clearWarnings,
        getWarnings: getWarnings
    };
})();
