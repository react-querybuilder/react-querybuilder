// Lodash was previously used only for a deep clone. We can simply
// pull the pieces in and avoid a dependency entirely.

// Please note the typing of these functions is abysmal.
// Ramda is not typed and thus we are abusing `any` in this file.

// https://github.com/ramda/ramda/blob/v0.25.0/source/type.js
function type(val?: object | null): string {
  return val === null
    ? 'Null'
    : val === undefined
      ? 'Undefined'
      : Object.prototype.toString.call(val).slice(8, -1);
}

// https://github.com/ramda/ramda/blob/v0.25.0/source/internal/_cloneRegExp.js
function cloneRegExp(pattern: RegExp): RegExp {
  return new RegExp(
    pattern.source,
    (pattern.global ? 'g' : '') +
      (pattern.ignoreCase ? 'i' : '') +
      (pattern.multiline ? 'm' : '') +
      (pattern.sticky ? 'y' : '') +
      (pattern.unicode ? 'u' : ''),
  );
}

// https://github.com/ramda/ramda/blob/v0.25.0/source/internal/_clone.js
function clone(value: any, refFrom: any, refTo: any, deep: any): any {
  function copy(copiedValue: any): any {
    const len = refFrom.length;
    let idx = 0;
    while (idx < len) {
      if (value === refFrom[idx]) {
        return refTo[idx];
      }
      idx += 1;
    }
    refFrom[idx + 1] = value;
    refTo[idx + 1] = copiedValue;
    for (const key in value) {
      copiedValue[key] = deep
        ? clone(value[key], refFrom, refTo, true)
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
      return cloneRegExp(value);
    default:
      return value;
  }
}

export default function deepClone<T>(value: any): T {
  return value != null && typeof value.clone === 'function'
    ? value.clone()
    : clone(value, [], [], true);
}
