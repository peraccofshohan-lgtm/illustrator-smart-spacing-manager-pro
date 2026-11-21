// Illustrator Smart Spacing Manager Pro
// Safety/TransactionManager.jsx — Transactional guard for spacing operations
var SSM = SSM || {};
SSM.TransactionManager = (function () {
    var PositionManager = SSM.PositionManager;
    var active = null;
    function begin(items, doc) {
        active = {
            id: SSM.Compat.uid("txn"),
            start: SSM.Compat.now(),
            snapshotId: PositionManager.capture(items),
            doc: doc,
            steps: [],
            committed: false,
            rolledBack: false,
            restorationSucceeded: false
        };
        return active.id;
    }
    function recordStep(description, before, after) {
        if (!active) { return; }
        active.steps.push({ description: description, before: before, after: after, time: SSM.Compat.now() });
    }
    function commit() {
        if (!active) { return false; }
        active.committed = true;
        active = null;
        return true;
    }
    function rollback() {
        if (!active) { return false; }
        if (active.snapshotId && active.doc) {
            active.restorationSucceeded = PositionManager.restore(active.snapshotId, active.doc);
        } else if (active.snapshotId) {
            active.restorationSucceeded = PositionManager.restore(active.snapshotId);
        }
        active.rolledBack = true;
        var ok = active.restorationSucceeded;
        active = null;
        return ok;
    }
    function getActive() { return active; }
    function restorationSucceeded() {
        return active ? active.restorationSucceeded : null;
    }
    return {
        begin: begin,
        recordStep: recordStep,
        commit: commit,
        rollback: rollback,
        getActive: getActive,
        restorationSucceeded: restorationSucceeded
    };
})();
