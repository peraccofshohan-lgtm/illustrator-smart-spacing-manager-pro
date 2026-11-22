// Illustrator Smart Spacing Manager Pro
// Core/Constants.jsx — Central constants (ES3 compatible)
var SSM = SSM || {};
SSM.Constants = (function () {
    var VERSION = "0.1.0";
    var BUILD = "0.1.0";
    var APP_NAME = "Illustrator Smart Spacing Manager Pro";
    var APP_SHORT = "Smart Spacing Manager Pro";
    var PT_PER_MM = 2.83464566929134;
    var PT_PER_CM = 28.3464566929134;
    var PT_PER_IN = 72;
    var PT_PER_PX = 0.75; // 96dpi CSS px -> pt (72/96)
    var UNITS = {
        pt: { label: "Points (pt)", toPt: 1, fromPt: 1 },
        mm: { label: "Millimeters (mm)", toPt: PT_PER_MM, fromPt: 1 / PT_PER_MM },
        cm: { label: "Centimeters (cm)", toPt: PT_PER_CM, fromPt: 1 / PT_PER_CM },
        in: { label: "Inches (in)", toPt: PT_PER_IN, fromPt: 1 / PT_PER_IN },
        px: { label: "Pixels (px)", toPt: PT_PER_PX, fromPt: 1 / PT_PER_PX }
    };
    var UNIT_KEYS = ["pt", "mm", "cm", "in", "px"];
    var MEASUREMENT_MODES = {
        OBJECT: "object",
        VISUAL: "visual"
    };
    var BOUNDS_TYPES = {
        GEOMETRIC: "geometric",
        VISIBLE: "visible",
        CONTROL: "control"
    };
    var DIRECTIONS = {
        VERTICAL: "vertical",
        HORIZONTAL: "horizontal",
        BOTH: "both",
        AUTO: "auto"
    };
    var ANCHOR_BEHAVIORS = {
        MOVE_LOWER: "moveLower",
        MOVE_UPPER: "moveUpper",
        KEEP_FIRST: "keepFirst",
        KEEP_LAST: "keepLast",
        SYMMETRIC: "symmetric"
    };
    var SCOPES = {
        SELECTION: "selection",
        SECTIONS: "sections",
        ACTIVE_ARTBOARD: "activeArtboard",
        SELECTED_ARTBOARDS: "selectedArtboards",
        ALL_ARTBOARDS: "allArtboards",
        DOCUMENT: "document"
    };
    var DETECTION_METHODS = {
        MANUAL: "manual",
        TEXT: "text",
        STYLE: "style",
        NAME: "name",
        COMBINED: "combined"
    };
    var TEXT_MATCH_TYPES = {
        EXACT: "exact",
        CONTAINS: "contains",
        STARTS_WITH: "startsWith",
        ENDS_WITH: "endsWith",
        REGEX: "regex",
        PATTERN: "pattern"
    };
    var PREVIEW_LAYER_NAME = "__SSM_Preview__";
    var TEMP_LAYER_NAME = "__SSM_Temp__";
    var MAX_RULES = 200;
    var MAX_SECTIONS = 5000;
    var EPSILON = 0.001;
    var DEFAULTS = {
        unit: "pt",
        precision: 2,
        measurementMode: "object",
        boundsType: "geometric",
        direction: "vertical",
        scope: "selection",
        anchorBehavior: "moveLower",
        tolerance: 0.5,
        excludeLocked: true,
        excludeHidden: true,
        excludeGuides: true,
        excludeTemplate: true,
        showPreviewIndicators: true,
        logLevel: "info"
    };
    // Initialize module namespaces so UI modules can attach safely
    SSM.UI = SSM.UI || {};
    SSM.Detection = SSM.Detection || {};
    SSM.Measurement = SSM.Measurement || {};
    SSM.Sections = SSM.Sections || {};
    SSM.Rules = SSM.Rules || {};
    SSM.Spacing = SSM.Spacing || {};
    SSM.Preview = SSM.Preview || {};
    SSM.Batch = SSM.Batch || {};
    SSM.Safety = SSM.Safety || {};
    SSM.Diagnostics = SSM.Diagnostics || {};

    return {
        VERSION: VERSION,
        BUILD: BUILD,
        APP_NAME: APP_NAME,
        APP_SHORT: APP_SHORT,
        UNITS: UNITS,
        UNIT_KEYS: UNIT_KEYS,
        MEASUREMENT_MODES: MEASUREMENT_MODES,
        BOUNDS_TYPES: BOUNDS_TYPES,
        DIRECTIONS: DIRECTIONS,
        ANCHOR_BEHAVIORS: ANCHOR_BEHAVIORS,
        SCOPES: SCOPES,
        DETECTION_METHODS: DETECTION_METHODS,
        TEXT_MATCH_TYPES: TEXT_MATCH_TYPES,
        PREVIEW_LAYER_NAME: PREVIEW_LAYER_NAME,
        TEMP_LAYER_NAME: TEMP_LAYER_NAME,
        MAX_RULES: MAX_RULES,
        MAX_SECTIONS: MAX_SECTIONS,
        EPSILON: EPSILON,
        DEFAULTS: DEFAULTS,
        PT_PER_MM: PT_PER_MM,
        PT_PER_CM: PT_PER_CM,
        PT_PER_IN: PT_PER_IN,
        PT_PER_PX: PT_PER_PX
    };
})();
