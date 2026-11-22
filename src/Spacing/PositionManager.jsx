// Illustrator Smart Spacing Manager Pro
// Spacing/PositionManager.jsx — Position capture & restoration for rollback
var SSM = SSM || {};
SSM.PositionManager = (function () {
    var snapshots = [];
    var DEFAULT_TOLERANCE = 0.001; // points — Illustrator coordinate precision
    function capture(items) {
        var snap = [];
        var allValid = true;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var ref = item.original || item;
            var pos = null;
            try {
                var b = ref.geometricBounds;
                if (b && b.length === 4) {
                    pos = { left: b[0], top: b[1], right: b[2], bottom: b[3] };
                } else {
                    allValid = false;
                }
            } catch (e) {
                allValid = false;
                pos = null;
            }
            snap.push({ id: item.id, name: item.name, position: pos });
        }
        var snapshot = { id: SSM.Compat.uid("snap"), time: SSM.Compat.now(), items: snap, allValid: allValid };
        snapshots.push(snapshot);
        return snapshot.id;
    }
    function restore(snapshotId, doc, tolerance) {
        tolerance = tolerance !== undefined ? tolerance : DEFAULT_TOLERANCE;
        var snap = null;
        var idx = -1;
        for (var i = 0; i < snapshots.length; i++) {
            if (snapshots[i].id === snapshotId) { snap = snapshots[i]; idx = i; break; }
        }
        if (!snap) { return false; }
        // If the snapshot captured items with missing/invalid positions, restoration cannot succeed
        if (snap.allValid === false) { return false; }
        var ok = true;
        var restored = 0;
        for (var i = 0; i < snap.items.length; i++) {
            var entry = snap.items[i];
            // A captured entry with no position cannot be restored — treat as failure
            if (!entry.position) { ok = false; continue; }
            // Find the live item by id in the document
            var liveItem = findLiveItem(entry.id, doc);
            if (!liveItem) { ok = false; continue; }
            try {
                var cur = liveItem.geometricBounds;
                if (cur && cur.length === 4) {
                    // Restore using PageItem.translate(dx, dy).
                    // Illustrator convention: translate(dx, dy) — positive dx moves right,
                    // positive dy moves down (decreases top and bottom).
                    // geometricBounds = [left, top, right, bottom] where top > bottom.
                    // To move from cur to entry.position:
                    //   dx = entry.position.left - cur[0]
                    //   dy = cur[1] - entry.position.top  (because translate subtracts dy from top)
                    var dx = entry.position.left - cur[0];
                    var dy = cur[1] - entry.position.top;
                    liveItem.translate(dx, dy);
                    restored++;
                } else {
                    ok = false;
                }
            } catch (e) {
                SSM.Logger.warn("PositionManager.restore: failed to restore " + entry.id, e);
                ok = false;
            }
        }
        // Verify restoration: every item must be within tolerance of captured position
        if (ok && restored > 0) {
            ok = verifyRestoration(snap, doc, tolerance);
        }
        // Remove snapshot only if restoration succeeded
        if (ok) {
            snapshots.splice(idx, 1);
        }
        return ok;
    }
    // Verify that all items in a snapshot have been restored to their captured
    // positions within the defined tolerance. Returns true only if every item
    // is verified restored. A missing position or missing item is a failure.
    function verifyRestoration(snap, doc, tolerance) {
        tolerance = tolerance !== undefined ? tolerance : DEFAULT_TOLERANCE;
        for (var i = 0; i < snap.items.length; i++) {
            var entry = snap.items[i];
            // A captured entry with no position cannot be verified — failure
            if (!entry.position) { return false; }
            var liveItem = findLiveItem(entry.id, doc);
            if (!liveItem) { return false; }
            try {
                var cur = liveItem.geometricBounds;
                if (!cur || cur.length !== 4) { return false; }
                if (Math.abs(cur[0] - entry.position.left) > tolerance) { return false; }
                if (Math.abs(cur[1] - entry.position.top) > tolerance) { return false; }
                if (Math.abs(cur[2] - entry.position.right) > tolerance) { return false; }
                if (Math.abs(cur[3] - entry.position.bottom) > tolerance) { return false; }
            } catch (e) {
                SSM.Logger.warn("PositionManager.verifyRestoration: failed for " + entry.id, e);
                return false;
            }
        }
        return true;
    }
    function findLiveItem(id, doc) {
        if (!doc) { return null; }
        try {
            var items = doc.pageItems;
            for (var i = 0; i < items.length; i++) {
                if (items[i] && items[i].id == id) { return items[i]; }
            }
        } catch (e) { /* ignore */ }
        return null;
    }
    function getSnapshot(snapshotId) {
        for (var i = 0; i < snapshots.length; i++) {
            if (snapshots[i].id === snapshotId) { return snapshots[i]; }
        }
        return null;
    }
    function clear() { snapshots = []; }
    return {
        capture: capture,
        restore: restore,
        verifyRestoration: verifyRestoration,
        getSnapshot: getSnapshot,
        clear: clear
    };
})();
