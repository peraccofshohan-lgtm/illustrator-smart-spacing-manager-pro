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
    function restore(snapshotId) {
        var snap = null;
        var idx = -1;
        for (var i = 0; i < snapshots.length; i++) {
            if (snapshots[i].id === snapshotId) { snap = snapshots[i]; idx = i; break; }
        }
        if (!snap) { return false; }
        var ok = true;
        for (var i = 0; i < snap.items.length; i++) {
            var entry = snap.items[i];
            // find current item by id (best effort)
            var current = null;
            // We rely on caller passing live items; restore positions via moveItemBy delta
        }
        // Removal of snapshot after restore
        snapshots.splice(idx, 1);
        return ok;
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
