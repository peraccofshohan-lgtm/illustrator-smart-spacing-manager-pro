// Illustrator Smart Spacing Manager Pro
// Core/DocumentManager.jsx — Illustrator document & artboard access layer
var SSM = SSM || {};
SSM.DocumentManager = (function () {
    var C = SSM.Constants;
    function getActiveDocument() {
        try {
            var d = app.activeDocument;
            if (!d) { return null; }
            return d;
        } catch (e) {
            SSM.Logger.warn("DocumentManager.getActiveDocument failed", e);
            return null;
        }
    }
    function documentExists() {
        try {
            return app.documents.length > 0;
        } catch (e) {
            return false;
        }
    }
    function getArtboards(doc) {
        doc = doc || getActiveDocument();
        if (!doc) { return []; }
        var out = [];
        try {
            var abs = doc.artboards;
            if (!abs) { return out; }
            var len = abs.length;
            for (var i = 0; i < len; i++) {
                var ab = abs[i];
                out.push({
                    index: i,
                    name: ab.name,
                    bounds: ab.artboardRect, // [left, top, right, bottom]
                    active: i === doc.artboards.getActiveArtboardIndex ? true : false
                });
            }
        } catch (e) {
            SSM.Logger.warn("DocumentManager.getArtboards failed", e);
        }
        return out;
    }
    function getArtboardBounds(doc, index) {
        doc = doc || getActiveDocument();
        if (!doc) { return null; }
        try {
            var ab = doc.artboards[index];
            if (!ab) { return null; }
            return ab.artboardRect; // [left, top, right, bottom]
        } catch (e) {
            SSM.Logger.warn("DocumentManager.getArtboardBounds failed", e);
            return null;
        }
    }
    function getPageItems(doc) {
        doc = doc || getActiveDocument();
        if (!doc) { return []; }
        var out = [];
        try {
            var items = doc.pageItems;
            var len = items.length;
            for (var i = 0; i < len; i++) {
                var item = items[i];
                out.push(serializeItem(item));
            }
        } catch (e) {
            SSM.Logger.warn("DocumentManager.getPageItems failed", e);
        }
        return out;
    }
    function serializeItem(item) {
        if (!item) { return null; }
        try {
            var name = item.name || "";
            var locked = !!item.locked;
            var hidden = !!item.hidden;
            var visible = !!item.visible;
            var type = item.typename || "PageItem";
            var gb = null;
            var vb = null;
            try { gb = item.geometricBounds; } catch (e) { /* ignore */ }
            try { vb = item.visibleBounds; } catch (e) { vb = gb; }
            var width = 0, height = 0;
            if (gb && gb.length === 4) {
                width = Math.abs(gb[2] - gb[0]);
                height = Math.abs(gb[3] - gb[1]);
            }
            var parentLayer = null;
            try { if (item.layer) { parentLayer = item.layer.name; } } catch (e) { /* ignore */ }
            return {
                id: item.id || item.toString(),
                name: name,
                type: type,
                locked: locked,
                hidden: hidden,
                visible: visible,
                parentLayer: parentLayer,
                geometricBounds: gb,
                visibleBounds: vb || gb,
                width: width,
                height: height,
                original: item // stored reference (mock-safe)
            };
        } catch (e) {
            return null;
        }
    }
    function getSelection(doc) {
        doc = doc || getActiveDocument();
        if (!doc) { return []; }
        var out = [];
        try {
            var sel = doc.selection;
            if (!sel) { return out; }
            var len = sel.length;
            for (var i = 0; i < len; i++) {
                var item = sel[i];
                if (item) { out.push(serializeItem(item)); }
            }
        } catch (e) {
            SSM.Logger.warn("DocumentManager.getSelection failed", e);
        }
        return out;
    }
    function createPreviewLayer(doc) {
        doc = doc || getActiveDocument();
        if (!doc) { return null; }
        try {
            // Remove existing preview layer first
            removePreviewLayer(doc);
            var layer = doc.layers.add();
            layer.name = C.PREVIEW_LAYER_NAME;
            try { layer.zOrder(ZOrderMethod.SENDTOBACK); } catch (e) { /* ignore */ }
            return layer;
        } catch (e) {
            SSM.Logger.warn("DocumentManager.createPreviewLayer failed", e);
            return null;
        }
    }
    function removePreviewLayer(doc) {
        doc = doc || getActiveDocument();
        if (!doc) { return; }
        try {
            var layers = doc.layers;
            var len = layers.length;
            for (var i = len - 1; i >= 0; i--) {
                if (layers[i] && layers[i].name === C.PREVIEW_LAYER_NAME) {
                    layers[i].remove();
                }
            }
        } catch (e) {
            SSM.Logger.warn("DocumentManager.removePreviewLayer failed", e);
        }
    }
    return {
        getActiveDocument: getActiveDocument,
        documentExists: documentExists,
        getArtboards: getArtboards,
        getArtboardBounds: getArtboardBounds,
        getPageItems: getPageItems,
        serializeItem: serializeItem,
        getSelection: getSelection,
        createPreviewLayer: createPreviewLayer,
        removePreviewLayer: removePreviewLayer
    };
})();
