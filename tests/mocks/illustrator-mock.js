// Illustrator Smart Spacing Manager Pro
// tests/mocks/illustrator-mock.js — Mock Illustrator DOM for Node.js testing
var nextId = 1000;
function nextIdFn() { return nextId++; }

// Create a mock page item with read-only geometricBounds/visibleBounds.
// Direct assignment to geometricBounds/visibleBounds throws — production code
// must use translate() instead (like real Illustrator).
function makeItem(type, name, bounds, contents) {
    var currentBounds = bounds || [0, 100, 100, 0];
    var item = {
        id: nextIdFn(),
        name: name || "",
        typename: type || "PathItem",
        locked: false,
        hidden: false,
        visible: true,
        layer: { name: "Layer 1" },
        width: bounds ? Math.abs(bounds[2] - bounds[0]) : 100,
        height: bounds ? Math.abs(bounds[3] - bounds[1]) : 100,
        contents: contents !== undefined ? contents : "",
        textFont: contents !== undefined ? { name: "Arial", style: "Regular" } : null,
        size: contents !== undefined ? 12 : null,
        fillColor: { typename: "RGBColor", red: 0, green: 0, blue: 0 },
        strokeWidth: 1,
        opacity: 100,
        duplicate: function (layer) {
            var copy = makeItem(type, name + " (copy)", bounds, contents);
            copy.id = nextIdFn();
            return copy;
        },
        createOutline: function () {
            // mock outlining: keep bounds
            return this;
        },
        translate: function (dx, dy) {
            var b = item.geometricBounds;
            currentBounds = [b[0] + dx, b[1] - dy, b[2] + dx, b[3] - dy];
            // visibleBounds getter returns currentBounds — no direct assignment needed
            // (like real Illustrator, visibleBounds is read-only)
        }
    };
    // geometricBounds and visibleBounds are read-only properties (like real Illustrator).
    // Direct assignment throws — production code must use translate() instead.
    Object.defineProperty(item, 'geometricBounds', {
        get: function () { return currentBounds; },
        set: function (v) { throw new Error("geometricBounds is read-only — use translate()"); },
        enumerable: true,
        configurable: false
    });
    Object.defineProperty(item, 'visibleBounds', {
        get: function () { return currentBounds; },
        set: function (v) { throw new Error("visibleBounds is read-only — use translate()"); },
        enumerable: true,
        configurable: false
    });
    return item;
}

function createMockApp() {
    function nextIdFn() { return nextId++; }
    var doc = {
        name: "Test Document",
        artboards: [
            { name: "Artboard 1", artboardRect: [0, 500, 500, 0], index: 0 }
        ],
        artboardsCount: 1,
        pageItems: [],
        layers: [{ name: "Layer 1" }],
        selection: []
    };
    doc.layers.add = function () {
        var layer = { name: "Layer " + (this.length + 1), pageItems: [] };
        this.push(layer);
        return layer;
    };
    return {
        documents: [doc],
        activeDocument: doc,
        doc: doc
    };
}
module.exports = { createMockApp: createMockApp, makeItem: makeItem };
