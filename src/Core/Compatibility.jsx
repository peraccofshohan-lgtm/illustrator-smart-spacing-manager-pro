// Illustrator Smart Spacing Manager Pro
// Core/Compatibility.jsx — ES3 compatibility helpers
var SSM = SSM || {};
SSM.Compat = (function () {
    function isArray(v) {
        return v !== null && typeof v === "object" && typeof v.length === "number" && typeof v.push === "function";
    }
    function trim(s) {
        if (s === null || s === undefined) { return ""; }
        s = String(s);
        var start = 0, end = s.length - 1;
        while (start <= end && (s.charAt(start) === " " || s.charAt(start) === "\t" || s.charAt(start) === "\n" || s.charAt(start) === "\r")) { start++; }
        while (end >= start && (s.charAt(end) === " " || s.charAt(end) === "\t" || s.charAt(end) === "\n" || s.charAt(end) === "\r")) { end--; }
        return s.substring(start, end + 1);
    }
    function startsWith(s, prefix) {
        s = String(s); prefix = String(prefix);
        return s.length >= prefix.length && s.substring(0, prefix.length) === prefix;
    }
    function endsWith(s, suffix) {
        s = String(s); suffix = String(suffix);
        return s.length >= suffix.length && s.substring(s.length - suffix.length) === suffix;
    }
    function contains(s, sub) {
        return String(s).indexOf(String(sub)) !== -1;
    }
    function toLower(s) {
        return String(s).toLowerCase();
    }
    function clamp(v, min, max) {
        if (v < min) { return min; }
        if (v > max) { return max; }
        return v;
    }
    function isNumber(v) {
        return typeof v === "number" && !isNaN(v) && isFinite(v);
    }
    function toNumber(v, fallback) {
        var n = parseFloat(v);
        if (isNaN(n) || !isFinite(n)) { return (fallback !== undefined ? fallback : 0); }
        return n;
    }
    function roundTo(v, decimals) {
        var factor = Math.pow(10, decimals);
        return Math.round(v * factor) / factor;
    }
    function formatNumber(v, decimals) {
        var r = roundTo(v, decimals);
        var s = String(r);
        if (decimals > 0 && s.indexOf(".") !== -1) {
            var parts = s.split(".");
            while (parts[1].length < decimals) { parts[1] += "0"; }
            s = parts[0] + "." + parts[1];
        } else if (decimals > 0) {
            s += ".";
            for (var i = 0; i < decimals; i++) { s += "0"; }
        }
        return s;
    }
    function uid(prefix) {
        var d = new Date();
        var t = d.getTime().toString(36);
        var r = Math.floor(Math.random() * 1000000).toString(36);
        return (prefix || "id") + "-" + t + r;
    }
    function now() {
        var d = new Date();
        return d.getTime();
    }
    function hasRegExp() {
        try {
            var re = new RegExp("a");
            return typeof re.test === "function";
        } catch (e) {
            return false;
        }
    }
    function safeRegExp(pattern, flags) {
        try {
            return new RegExp(pattern, flags || "");
        } catch (e) {
            return null;
        }
    }
    // ES3-safe JSON serializer (no eval, no JSON dependency)
    function jsonStringify(value) {
        var seen = [];
        function enc(v) {
            if (v === null || v === undefined) { return "null"; }
            var t = typeof v;
            if (t === "number") {
                if (isNaN(v) || !isFinite(v)) { return "null"; }
                return String(v);
            }
            if (t === "boolean") { return v ? "true" : "false"; }
            if (t === "string") { return encString(v); }
            if (isArray(v)) {
                var parts = [];
                for (var i = 0; i < v.length; i++) { parts.push(enc(v[i])); }
                return "[" + parts.join(",") + "]";
            }
            if (t === "object") {
                var out = [];
                for (var k in v) {
                    if (v.hasOwnProperty(k)) {
                        out.push(encString(k) + ":" + enc(v[k]));
                    }
                }
                return "{" + out.join(",") + "}";
            }
            return "null";
        }
        function encString(s) {
            var out = "\"";
            for (var i = 0; i < s.length; i++) {
                var c = s.charAt(i);
                var code = s.charCodeAt(i);
                if (c === "\"") { out += "\\\""; }
                else if (c === "\\") { out += "\\\\"; }
                else if (c === "\n") { out += "\\n"; }
                else if (c === "\r") { out += "\\r"; }
                else if (c === "\t") { out += "\\t"; }
                else if (c === "\b") { out += "\\b"; }
                else if (c === "\f") { out += "\\f"; }
                else if (code < 32) {
                    var hex = code.toString(16);
                    while (hex.length < 4) { hex = "0" + hex; }
                    out += "\\u" + hex;
                } else { out += c; }
            }
            return out + "\"";
        }
        return enc(value);
    }
    // ES3-safe JSON parser (recursive descent, no eval)
    function jsonParse(text) {
        if (typeof text !== "string") { throw new Error("jsonParse: input must be a string"); }
        var pos = 0;
        var len = text.length;
        function err(msg) { throw new Error("JSON parse error at position " + pos + ": " + msg); }
        function skipWs() {
            while (pos < len) {
                var c = text.charAt(pos);
                if (c === " " || c === "\t" || c === "\n" || c === "\r") { pos++; } else { break; }
            }
        }
        function parseValue() {
            skipWs();
            if (pos >= len) { err("unexpected end of input"); }
            var c = text.charAt(pos);
            if (c === "{") { return parseObject(); }
            if (c === "[") { return parseArray(); }
            if (c === "\"") { return parseString(); }
            if (c === "t" || c === "f") { return parseBool(); }
            if (c === "n") { return parseNull(); }
            return parseNumber();
        }
        function parseObject() {
            pos++; // {
            var obj = {};
            skipWs();
            if (pos < len && text.charAt(pos) === "}") { pos++; return obj; }
            while (true) {
                skipWs();
                if (pos >= len || text.charAt(pos) !== "\"") { err("expected string key"); }
                var key = parseString();
                skipWs();
                if (pos >= len || text.charAt(pos) !== ":") { err("expected ':'"); }
                pos++;
                obj[key] = parseValue();
                skipWs();
                if (pos >= len) { err("unterminated object"); }
                var c = text.charAt(pos);
                if (c === ",") { pos++; continue; }
                if (c === "}") { pos++; return obj; }
                err("expected ',' or '}'");
            }
        }
        function parseArray() {
            pos++; // [
            var arr = [];
            skipWs();
            if (pos < len && text.charAt(pos) === "]") { pos++; return arr; }
            while (true) {
                arr.push(parseValue());
                skipWs();
                if (pos >= len) { err("unterminated array"); }
                var c = text.charAt(pos);
                if (c === ",") { pos++; continue; }
                if (c === "]") { pos++; return arr; }
                err("expected ',' or ']'");
            }
        }
        function parseString() {
            pos++; // opening quote
            var out = "";
            while (pos < len) {
                var c = text.charAt(pos);
                if (c === "\"") { pos++; return out; }
                if (c === "\\") {
                    pos++;
                    if (pos >= len) { err("unterminated escape"); }
                    var e = text.charAt(pos);
                    if (e === "\"") { out += "\""; }
                    else if (e === "\\") { out += "\\"; }
                    else if (e === "/") { out += "/"; }
                    else if (e === "n") { out += "\n"; }
                    else if (e === "r") { out += "\r"; }
                    else if (e === "t") { out += "\t"; }
                    else if (e === "b") { out += "\b"; }
                    else if (e === "f") { out += "\f"; }
                    else if (e === "u") {
                        var hex = text.substring(pos + 1, pos + 5);
                        if (!/^[0-9a-fA-F]{4}$/.test(hex)) { err("invalid unicode escape"); }
                        out += String.fromCharCode(parseInt(hex, 16));
                        pos += 4;
                    } else { err("invalid escape '\\" + e + "'"); }
                    pos++;
                    continue;
                }
                out += c;
                pos++;
            }
            err("unterminated string");
        }
        function parseBool() {
            if (text.substring(pos, pos + 4) === "true") { pos += 4; return true; }
            if (text.substring(pos, pos + 5) === "false") { pos += 5; return false; }
            err("invalid literal");
        }
        function parseNull() {
            if (text.substring(pos, pos + 4) === "null") { pos += 4; return null; }
            err("invalid literal");
        }
        function parseNumber() {
            var start = pos;
            if (pos < len && text.charAt(pos) === "-") { pos++; }
            var digits = 0;
            while (pos < len && text.charAt(pos) >= "0" && text.charAt(pos) <= "9") { pos++; digits++; }
            if (pos < len && text.charAt(pos) === ".") {
                pos++;
                while (pos < len && text.charAt(pos) >= "0" && text.charAt(pos) <= "9") { pos++; digits++; }
            }
            if (pos < len && (text.charAt(pos) === "e" || text.charAt(pos) === "E")) {
                pos++;
                if (pos < len && (text.charAt(pos) === "+" || text.charAt(pos) === "-")) { pos++; }
                var edigits = 0;
                while (pos < len && text.charAt(pos) >= "0" && text.charAt(pos) <= "9") { pos++; edigits++; }
                if (edigits === 0) { err("invalid exponent"); }
            }
            if (digits === 0) { err("invalid number"); }
            var n = parseFloat(text.substring(start, pos));
            if (isNaN(n)) { err("invalid number"); }
            return n;
        }
        var result = parseValue();
        skipWs();
        if (pos !== len) { err("trailing characters"); }
        return result;
    }
    return {
        isArray: isArray,
        trim: trim,
        startsWith: startsWith,
        endsWith: endsWith,
        contains: contains,
        toLower: toLower,
        clamp: clamp,
        isNumber: isNumber,
        toNumber: toNumber,
        roundTo: roundTo,
        formatNumber: formatNumber,
        uid: uid,
        now: now,
        hasRegExp: hasRegExp,
        safeRegExp: safeRegExp,
        jsonStringify: jsonStringify,
        jsonParse: jsonParse
    };
})();
