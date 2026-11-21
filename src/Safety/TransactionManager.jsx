// Illustrator Smart Spacing Manager Pro
// Safety/TransactionManager.jsx — Transactional guard for spacing operations
var SSM = SSM || {};
SSM.TransactionManager = (function () {
    var PositionManager = SSM.PositionManager;
    var active = null;
    function begin(items) {
        active = {
            id: SSM.Compat.uid("txn"),
            start: SSM.Compat.now(),
            snapshotId: PositionManager.capture(items),
            steps: [],
            committed: false,
            rolledBack: false
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
        if (active.snapshotId) {
            PositionManager.restore(active.snapshotId);
        }
        active.rolledBack = true;
        active = null;
        return true;
    }
    function getActive() { return active; }
    return {
        begin: begin,
        recordStep: recordStep,
        commit: commit,
        rollback: rollback,
        getActive: getActive
    };
})();
