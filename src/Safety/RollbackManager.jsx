// Illustrator Smart Spacing Manager Pro
// Safety/RollbackManager.jsx — Coordinated rollback across modules
var SSM = SSM || {};
SSM.RollbackManager = (function () {
    var TransactionManager = SSM.TransactionManager;
    var TemporaryObjectManager = SSM.TemporaryObjectManager;
    function safeOperation(fn, items) {
        var txnId = TransactionManager.begin(items);
        try {
            var result = fn();
            TransactionManager.commit();
            TemporaryObjectManager.cleanup();
            return { success: true, result: result, txnId: txnId };
        } catch (e) {
            SSM.Logger.error("RollbackManager: operation failed, rolling back", e);
            TransactionManager.rollback();
            TemporaryObjectManager.cleanup();
            return { success: false, error: String(e), txnId: txnId };
        }
    }
    return {
        safeOperation: safeOperation
    };
})();
