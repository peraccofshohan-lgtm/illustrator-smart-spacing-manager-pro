// Illustrator Smart Spacing Manager Pro
// Spacing/PositionManager.jsx — Position capture & restoration for rollback
var SSM = SSM || {};
SSM.PositionManager = (function () {
    var snapshots = [];
    function capture(items) {
        var snap = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var ref = item.original || item;
            var pos = null;
            try {
                var b = ref.geometricBounds;
                if (b && b.length === 4) {
                    pos = { left: b[0], top: b[1], right: b[2], bottom: b[3] };
                }
            } catch (e) { pos = null; }
            snap.push({ id: item.id, name: item.name, position: pos });
        }
        var snapshot = { id: SSM.Compat.uid("snap"), time: SSM.Compat.now(), items: snap };
        snapshots.push(snapshot);
        return snapshot.id;
    }
    function restore(snapshotId, doc) {
        var snap = null;
        var idx = -1;
        for (var i = 0; i < snapshots.length; i++) {
            if (snapshots[i].id === snapshotId) { snap = snapshots[i]; idx = i; break; }
        }
        if (!snap) { return false; }
        var ok = true;
        var restored = 0;
        for (var i = 0; i < snap.items.length; i++) {
            var entry = snap.items[i];
            if (!entry.position) { continue; }
            // Find the live item by id in the document
            var liveItem = findLiveItem(entry.id, doc);
            if (!liveItem) { ok = false; continue; }
            try {
                var cur = liveItem.geometricBounds;
                if (cur && cur.length === 4) {
                    var dx = entry.position.left - cur[0];
                    // Illustrator: dy positive moves down (screen coords). In Illustrator coords,
                    // moving top from cur[1] to entry.position.top means translate y by -(entry.position.top - cur[1]).
                    var dy = -(entry.position.top - cur[1]);
                    liveItem.translate(dx, dy);
                    restored++;
                }
            } catch (e) {
                SSM.Logger.warn("PositionManager.restore: failed to restore " + entry.id, e);
                ok = false;
            }
        }
        // Remove snapshot only if restoration succeeded
        if (ok) {
            snapshots.splice(idx, 1);
        }
        return ok;
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
        getSnapshot: getSnapshot,
        clear: clear
    };
})();
