// Illustrator Smart Spacing Manager Pro
// Diagnostics/ErrorReporter.jsx — Structured error reporting
var SSM = SSM || {};
SSM.ErrorReporter = (function () {
    var errors = [];
    function report(code, message, context) {
        var err = {
            id: SSM.Compat.uid("err"),
            code: code || "UNKNOWN",
            message: String(message || "Unknown error"),
            context: context || {},
            time: SSM.Compat.now()
        };
        errors.push(err);
        SSM.Logger.error("[" + err.code + "] " + err.message, context);
        return err;
    }
    function getErrors() { return errors.slice(); }
    function clear() { errors = []; }
    function hasErrors() { return errors.length > 0; }
    function toText() {
        var lines = [];
        for (var i = 0; i < errors.length; i++) {
            var e = errors[i];
            lines.push(e.code + ": " + e.message);
        }
        return lines.join("\n");
    }
    return {
        report: report,
        getErrors: getErrors,
        clear: clear,
        hasErrors: hasErrors,
        toText: toText
    };
})();
