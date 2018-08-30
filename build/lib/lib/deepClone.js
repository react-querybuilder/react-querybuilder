"use strict";
// Lodash was previously used only for a deep clone. We can simply
// pull the pieces in and avoid a dependency entirely.
Object.defineProperty(exports, "__esModule", { value: true });
// https://github.com/ramda/ramda/blob/v0.25.0/source/type.js
function type(val) {
    return val === null
        ? 'Null'
        : val === undefined
            ? 'Undefined'
            : Object.prototype.toString.call(val).slice(8, -1);
}
// https://github.com/ramda/ramda/blob/v0.25.0/source/internal/_cloneRegExp.js
function _cloneRegExp(pattern) {
    return new RegExp(pattern.source, (pattern.global ? 'g' : '') +
        (pattern.ignoreCase ? 'i' : '') +
        (pattern.multiline ? 'm' : '') +
        (pattern.sticky ? 'y' : '') +
        (pattern.unicode ? 'u' : ''));
}
// https://github.com/ramda/ramda/blob/v0.25.0/source/internal/_clone.js
function _clone(value, refFrom, refTo, deep) {
    function copy(copiedValue) {
        var len = refFrom.length;
        var idx = 0;
        while (idx < len) {
            if (value === refFrom[idx]) {
                return refTo[idx];
            }
            idx += 1;
        }
        refFrom[idx + 1] = value;
        refTo[idx + 1] = copiedValue;
        for (var key in value) {
            copiedValue[key] = deep
                ? _clone(value[key], refFrom, refTo, true)
                : value[key];
        }
        return copiedValue;
    }
    switch (type(value)) {
        case 'Object':
            return copy({});
        case 'Array':
            return copy([]);
        case 'Date':
            return new Date(value.valueOf());
        case 'RegExp':
            return _cloneRegExp(value);
        default:
            return value;
    }
}
function deepClone(value) {
    return value != null && typeof value.clone === 'function'
        ? value.clone()
        : _clone(value, [], [], true);
}
exports.default = deepClone;
//# sourceMappingURL=deepClone.js.map