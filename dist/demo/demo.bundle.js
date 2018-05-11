/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 52);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var freeGlobal = __webpack_require__(32);

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

if (process.env.NODE_ENV === 'production') {
  module.exports = __webpack_require__(58);
} else {
  module.exports = __webpack_require__(59);
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */



/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var validateFormat = function validateFormat(format) {};

if (process.env.NODE_ENV !== 'production') {
  validateFormat = function validateFormat(format) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  };
}

function invariant(condition, format, a, b, c, d, e, f) {
  validateFormat(format);

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
}

module.exports = invariant;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */

function makeEmptyFunction(arg) {
  return function () {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
var emptyFunction = function emptyFunction() {};

emptyFunction.thatReturns = makeEmptyFunction;
emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
emptyFunction.thatReturnsNull = makeEmptyFunction(null);
emptyFunction.thatReturnsThis = function () {
  return this;
};
emptyFunction.thatReturnsArgument = function (arg) {
  return arg;
};

module.exports = emptyFunction;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var baseIsNative = __webpack_require__(81),
    getValue = __webpack_require__(86);

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

module.exports = getNative;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/


/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};


/***/ }),
/* 7 */
/***/ (function(module, exports) {

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

module.exports = isObject;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */



var emptyObject = {};

if (process.env.NODE_ENV !== 'production') {
  Object.freeze(emptyObject);
}

module.exports = emptyObject;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */



var emptyFunction = __webpack_require__(4);

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning = emptyFunction;

if (process.env.NODE_ENV !== 'production') {
  var printWarning = function printWarning(format) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var argIndex = 0;
    var message = 'Warning: ' + format.replace(/%s/g, function () {
      return args[argIndex++];
    });
    if (typeof console !== 'undefined') {
      console.error(message);
    }
    try {
      // --- Welcome to debugging React ---
      // This error was thrown as a convenience so that you can use this stack
      // to find the callsite that caused this warning to fire.
      throw new Error(message);
    } catch (x) {}
  };

  warning = function warning(condition, format) {
    if (format === undefined) {
      throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
    }

    if (format.indexOf('Failed Composite propType: ') === 0) {
      return; // Ignore CompositeComponent proptype check.
    }

    if (!condition) {
      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      printWarning.apply(undefined, [format].concat(args));
    }
  };
}

module.exports = warning;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

if (process.env.NODE_ENV !== 'production') {
  var REACT_ELEMENT_TYPE = (typeof Symbol === 'function' &&
    Symbol.for &&
    Symbol.for('react.element')) ||
    0xeac7;

  var isValidElement = function(object) {
    return typeof object === 'object' &&
      object !== null &&
      object.$$typeof === REACT_ELEMENT_TYPE;
  };

  // By explicitly using `prop-types` you are opting into new development behavior.
  // http://fb.me/prop-types-in-prod
  var throwOnDirectAccess = true;
  module.exports = __webpack_require__(60)(isValidElement, throwOnDirectAccess);
} else {
  // By explicitly using `prop-types` you are opting into new production behavior.
  // http://fb.me/prop-types-in-prod
  module.exports = __webpack_require__(61)();
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

var listCacheClear = __webpack_require__(71),
    listCacheDelete = __webpack_require__(72),
    listCacheGet = __webpack_require__(73),
    listCacheHas = __webpack_require__(74),
    listCacheSet = __webpack_require__(75);

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

module.exports = ListCache;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

var eq = __webpack_require__(30);

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

module.exports = assocIndexOf;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(20),
    getRawTag = __webpack_require__(82),
    objectToString = __webpack_require__(83);

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

module.exports = baseGetTag;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(5);

/* Built-in method references that are verified to be native. */
var nativeCreate = getNative(Object, 'create');

module.exports = nativeCreate;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

var isKeyable = __webpack_require__(96);

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

module.exports = getMapData;


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

var assignValue = __webpack_require__(34),
    baseAssignValue = __webpack_require__(35);

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    if (newValue === undefined) {
      newValue = source[key];
    }
    if (isNew) {
      baseAssignValue(object, key, newValue);
    } else {
      assignValue(object, key, newValue);
    }
  }
  return object;
}

module.exports = copyObject;


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



if (process.env.NODE_ENV !== 'production') {
  var invariant = __webpack_require__(3);
  var warning = __webpack_require__(9);
  var ReactPropTypesSecret = __webpack_require__(18);
  var loggedTypeFailures = {};
}

/**
 * Assert that the values match with the type specs.
 * Error messages are memorized and will only be shown once.
 *
 * @param {object} typeSpecs Map of name to a ReactPropType
 * @param {object} values Runtime values that need to be type-checked
 * @param {string} location e.g. "prop", "context", "child context"
 * @param {string} componentName Name of the component for error messages.
 * @param {?Function} getStack Returns the component stack.
 * @private
 */
function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
  if (process.env.NODE_ENV !== 'production') {
    for (var typeSpecName in typeSpecs) {
      if (typeSpecs.hasOwnProperty(typeSpecName)) {
        var error;
        // Prop type validation may throw. In case they do, we don't want to
        // fail the render phase where it didn't fail before. So we log it.
        // After these have been cleaned up, we'll let them throw.
        try {
          // This is intentionally an invariant that gets caught. It's the same
          // behavior as without this statement except with a better message.
          invariant(typeof typeSpecs[typeSpecName] === 'function', '%s: %s type `%s` is invalid; it must be a function, usually from ' + 'the `prop-types` package, but received `%s`.', componentName || 'React class', location, typeSpecName, typeof typeSpecs[typeSpecName]);
          error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
        } catch (ex) {
          error = ex;
        }
        warning(!error || error instanceof Error, '%s: type specification of %s `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error);
        if (error instanceof Error && !(error.message in loggedTypeFailures)) {
          // Only monitor this failure once because there tends to be a lot of the
          // same error.
          loggedTypeFailures[error.message] = true;

          var stack = getStack ? getStack() : '';

          warning(false, 'Failed %s type: %s%s', location, error.message, stack != null ? stack : '');
        }
      }
    }
  }
}

module.exports = checkPropTypes;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

module.exports = ReactPropTypesSecret;


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(5),
    root = __webpack_require__(1);

/* Built-in method references that are verified to be native. */
var Map = getNative(root, 'Map');

module.exports = Map;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__(1);

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

var arrayLikeKeys = __webpack_require__(36),
    baseKeys = __webpack_require__(112),
    isArrayLike = __webpack_require__(40);

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

module.exports = keys;


/***/ }),
/* 22 */
/***/ (function(module, exports) {

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;


/***/ }),
/* 23 */
/***/ (function(module, exports) {

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

module.exports = isArray;


/***/ }),
/* 24 */
/***/ (function(module, exports) {

module.exports = function(module) {
	if(!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if(!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 25 */
/***/ (function(module, exports) {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

module.exports = isPrototype;


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

var arrayFilter = __webpack_require__(120),
    stubArray = __webpack_require__(42);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};

module.exports = getSymbols;


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

var Uint8Array = __webpack_require__(131);

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}

module.exports = cloneArrayBuffer;


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

var rng = __webpack_require__(63);
var bytesToUuid = __webpack_require__(64);

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options == 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || bytesToUuid(rnds);
}

module.exports = v4;


/***/ }),
/* 29 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 30 */
/***/ (function(module, exports) {

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

module.exports = eq;


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(13),
    isObject = __webpack_require__(7);

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

module.exports = isFunction;


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(29)))

/***/ }),
/* 33 */
/***/ (function(module, exports) {

/** Used for built-in method references. */
var funcProto = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

module.exports = toSource;


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

var baseAssignValue = __webpack_require__(35),
    eq = __webpack_require__(30);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue(object, key, value);
  }
}

module.exports = assignValue;


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

var defineProperty = __webpack_require__(101);

/**
 * The base implementation of `assignValue` and `assignMergeValue` without
 * value checks.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function baseAssignValue(object, key, value) {
  if (key == '__proto__' && defineProperty) {
    defineProperty(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    });
  } else {
    object[key] = value;
  }
}

module.exports = baseAssignValue;


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

var baseTimes = __webpack_require__(103),
    isArguments = __webpack_require__(104),
    isArray = __webpack_require__(23),
    isBuffer = __webpack_require__(37),
    isIndex = __webpack_require__(107),
    isTypedArray = __webpack_require__(108);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = arrayLikeKeys;


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {var root = __webpack_require__(1),
    stubFalse = __webpack_require__(106);

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

module.exports = isBuffer;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(24)(module)))

/***/ }),
/* 38 */
/***/ (function(module, exports) {

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

module.exports = isLength;


/***/ }),
/* 39 */
/***/ (function(module, exports) {

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

module.exports = overArg;


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

var isFunction = __webpack_require__(31),
    isLength = __webpack_require__(38);

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

module.exports = isArrayLike;


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

var arrayLikeKeys = __webpack_require__(36),
    baseKeysIn = __webpack_require__(115),
    isArrayLike = __webpack_require__(40);

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}

module.exports = keysIn;


/***/ }),
/* 42 */
/***/ (function(module, exports) {

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

module.exports = stubArray;


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

var arrayPush = __webpack_require__(44),
    getPrototype = __webpack_require__(45),
    getSymbols = __webpack_require__(26),
    stubArray = __webpack_require__(42);

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own and inherited enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
  var result = [];
  while (object) {
    arrayPush(result, getSymbols(object));
    object = getPrototype(object);
  }
  return result;
};

module.exports = getSymbolsIn;


/***/ }),
/* 44 */
/***/ (function(module, exports) {

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

module.exports = arrayPush;


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

var overArg = __webpack_require__(39);

/** Built-in value references. */
var getPrototype = overArg(Object.getPrototypeOf, Object);

module.exports = getPrototype;


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

var arrayPush = __webpack_require__(44),
    isArray = __webpack_require__(23);

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

module.exports = baseGetAllKeys;


/***/ }),
/* 47 */
/***/ (function(module, exports) {

/**
 * A specialized version of `_.reduce` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @param {boolean} [initAccum] Specify using the first element of `array` as
 *  the initial value.
 * @returns {*} Returns the accumulated value.
 */
function arrayReduce(array, iteratee, accumulator, initAccum) {
  var index = -1,
      length = array == null ? 0 : array.length;

  if (initAccum && length) {
    accumulator = array[++index];
  }
  while (++index < length) {
    accumulator = iteratee(accumulator, array[index], index, array);
  }
  return accumulator;
}

module.exports = arrayReduce;


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */



var canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

/**
 * Simple, lightweight module assisting with the detection and context of
 * Worker. Helps avoid circular dependencies and allows code to reason about
 * whether or not they are in a Worker, even if they never include the main
 * `ReactWorker` dependency.
 */
var ExecutionEnvironment = {

  canUseDOM: canUseDOM,

  canUseWorkers: typeof Worker !== 'undefined',

  canUseEventListeners: canUseDOM && !!(window.addEventListener || window.attachEvent),

  canUseViewport: canUseDOM && !!window.screen,

  isInWorker: !canUseDOM // For now, this is true - might change in the future.

};

module.exports = ExecutionEnvironment;

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @typechecks
 */

/* eslint-disable fb-www/typeof-undefined */

/**
 * Same as document.activeElement but wraps in a try-catch block. In IE it is
 * not safe to call document.activeElement if there is nothing focused.
 *
 * The activeElement will be null only if the document or document body is not
 * yet defined.
 *
 * @param {?DOMDocument} doc Defaults to current document.
 * @return {?DOMElement}
 */
function getActiveElement(doc) /*?DOMElement*/{
  doc = doc || (typeof document !== 'undefined' ? document : undefined);
  if (typeof doc === 'undefined') {
    return null;
  }
  try {
    return doc.activeElement || doc.body;
  } catch (e) {
    return doc.body;
  }
}

module.exports = getActiveElement;

/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @typechecks
 * 
 */

/*eslint-disable no-self-compare */



var hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * inlined Object.is polyfill to avoid requiring consumers ship their own
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 */
function is(x, y) {
  // SameValue algorithm
  if (x === y) {
    // Steps 1-5, 7-10
    // Steps 6.b-6.e: +0 != -0
    // Added the nonzero y check to make Flow happy, but it is redundant
    return x !== 0 || y !== 0 || 1 / x === 1 / y;
  } else {
    // Step 6.a: NaN == NaN
    return x !== x && y !== y;
  }
}

/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 */
function shallowEqual(objA, objB) {
  if (is(objA, objB)) {
    return true;
  }

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }

  var keysA = Object.keys(objA);
  var keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  for (var i = 0; i < keysA.length; i++) {
    if (!hasOwnProperty.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
      return false;
    }
  }

  return true;
}

module.exports = shallowEqual;

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */

var isTextNode = __webpack_require__(146);

/*eslint-disable no-bitwise */

/**
 * Checks if a given DOM node contains or is another DOM node.
 */
function containsNode(outerNode, innerNode) {
  if (!outerNode || !innerNode) {
    return false;
  } else if (outerNode === innerNode) {
    return true;
  } else if (isTextNode(outerNode)) {
    return false;
  } else if (isTextNode(innerNode)) {
    return containsNode(outerNode, innerNode.parentNode);
  } else if ('contains' in outerNode) {
    return outerNode.contains(innerNode);
  } else if (outerNode.compareDocumentPosition) {
    return !!(outerNode.compareDocumentPosition(innerNode) & 16);
  } else {
    return false;
  }
}

module.exports = containsNode;

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

__webpack_require__(53);

var _index = __webpack_require__(54);

var _index2 = _interopRequireDefault(_index);

var _reactDom = __webpack_require__(144);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _react = __webpack_require__(2);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var fields = [{ name: 'firstName', label: 'First Name' }, { name: 'lastName', label: 'Last Name' }, { name: 'age', label: 'Age' }, { name: 'address', label: 'Address' }, { name: 'phone', label: 'Phone' }, { name: 'email', label: 'Email' }, { name: 'twitter', label: 'Twitter' }, { name: 'isDev', label: 'Is a Developer?', value: false }];

var RootView = function (_React$Component) {
    _inherits(RootView, _React$Component);

    function RootView() {
        _classCallCheck(this, RootView);

        var _this = _possibleConstructorReturn(this, (RootView.__proto__ || Object.getPrototypeOf(RootView)).call(this));

        _this.state = {
            query: {}
        };
        return _this;
    }

    _createClass(RootView, [{
        key: 'render',
        value: function render() {
            var controlElements = {
                valueEditor: this.customValueEditor()
            };
            return _react2.default.createElement(
                'div',
                { className: 'flex-box' },
                _react2.default.createElement(
                    'div',
                    { className: 'scroll' },
                    _react2.default.createElement(_index2.default, { fields: this.props.fields,
                        controlElements: controlElements,
                        controlClassnames: { fields: 'form-control' },
                        onQueryChange: this.logQuery.bind(this) })
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'shrink query-log scroll' },
                    _react2.default.createElement(
                        'h4',
                        null,
                        'Query'
                    ),
                    _react2.default.createElement(
                        'pre',
                        null,
                        JSON.stringify(this.state.query, null, 2)
                    )
                )
            );
        }
    }, {
        key: 'customValueEditor',
        value: function customValueEditor() {
            var checkbox = function (_React$Component2) {
                _inherits(MyCheckbox, _React$Component2);

                function MyCheckbox(props) {
                    _classCallCheck(this, MyCheckbox);

                    return _possibleConstructorReturn(this, (MyCheckbox.__proto__ || Object.getPrototypeOf(MyCheckbox)).call(this, props));
                }

                _createClass(MyCheckbox, [{
                    key: 'render',
                    value: function render() {
                        var _this3 = this;

                        if (this.props.field !== 'isDev' || this.props.operator !== '=') {
                            return _react2.default.createElement('input', { type: 'text',
                                value: this.props.value,
                                onChange: function onChange(e) {
                                    return _this3.props.handleOnChange(e.target.value);
                                } });
                        }

                        return _react2.default.createElement(
                            'span',
                            null,
                            _react2.default.createElement('input', { type: 'checkbox',
                                value: !!this.props.value,
                                onChange: function onChange(e) {
                                    return _this3.props.handleOnChange(e.target.checked);
                                } })
                        );
                    }
                }]);

                return MyCheckbox;
            }(_react2.default.Component);
            return checkbox;
        }
    }, {
        key: 'logQuery',
        value: function logQuery(query) {
            this.setState({ query: query });
        }
    }]);

    return RootView;
}(_react2.default.Component);

_reactDom2.default.render(_react2.default.createElement(RootView, { fields: fields }), document.querySelector('.container'));

/***/ }),
/* 53 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _QueryBuilder = __webpack_require__(55);

var _QueryBuilder2 = _interopRequireDefault(_QueryBuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _QueryBuilder2.default;

/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _index = __webpack_require__(56);

var _propTypes = __webpack_require__(10);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(2);

var _react2 = _interopRequireDefault(_react);

var _RuleGroup = __webpack_require__(66);

var _RuleGroup2 = _interopRequireDefault(_RuleGroup);

var _cloneDeep = __webpack_require__(68);

var _cloneDeep2 = _interopRequireDefault(_cloneDeep);

var _v = __webpack_require__(28);

var _v2 = _interopRequireDefault(_v);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var QueryBuilder = function (_React$Component) {
  _inherits(QueryBuilder, _React$Component);

  _createClass(QueryBuilder, null, [{
    key: 'defaultProps',
    get: function get() {
      return {
        query: null,
        dataTypes: QueryBuilder.defaultDataTypes,
        fields: [],
        operators: QueryBuilder.defaultOperators,
        combinators: QueryBuilder.defaultCombinators,
        translations: QueryBuilder.defaultTranslations,
        controlElements: null,
        getOperators: null,
        onQueryChange: null,
        controlClassnames: null
      };
    }
  }, {
    key: 'propTypes',
    get: function get() {
      return {
        query: _propTypes2.default.object,
        dataTypes: _propTypes2.default.array,
        fields: _propTypes2.default.array.isRequired,
        operators: _propTypes2.default.array,
        combinators: _propTypes2.default.array,
        controlElements: _propTypes2.default.shape({
          addGroupAction: _propTypes2.default.func,
          removeGroupAction: _propTypes2.default.func,
          addRuleAction: _propTypes2.default.func,
          removeRuleAction: _propTypes2.default.func,
          combinatorSelector: _propTypes2.default.func,
          dataTypeSelector: _propTypes2.default.func,
          fieldSelector: _propTypes2.default.func,
          operatorSelector: _propTypes2.default.func,
          valueEditor: _propTypes2.default.func
        }),
        getOperators: _propTypes2.default.func,
        onQueryChange: _propTypes2.default.func,
        controlClassnames: _propTypes2.default.object,
        translations: _propTypes2.default.object
      };
    }
  }]);

  function QueryBuilder() {
    var _ref;

    _classCallCheck(this, QueryBuilder);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _this = _possibleConstructorReturn(this, (_ref = QueryBuilder.__proto__ || Object.getPrototypeOf(QueryBuilder)).call.apply(_ref, [this].concat(args)));

    _this.state = {
      root: {},
      schema: {}
    };
    return _this;
  }

  _createClass(QueryBuilder, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      var _this2 = this;

      var _props = this.props,
          dataTypes = _props.dataTypes,
          fields = _props.fields,
          operators = _props.operators,
          combinators = _props.combinators,
          controlElements = _props.controlElements,
          controlClassnames = _props.controlClassnames;

      var classNames = Object.assign({}, QueryBuilder.defaultControlClassnames, controlClassnames);
      var controls = Object.assign({}, QueryBuilder.defaultControlElements, controlElements);
      this.setState({
        root: this.getInitialQuery(),
        schema: {
          dataTypes: dataTypes,
          fields: fields,
          operators: operators,
          combinators: combinators,

          classNames: classNames,

          createRule: this.createRule.bind(this),
          createRuleGroup: this.createRuleGroup.bind(this),
          onRuleAdd: this._notifyQueryChange.bind(this, this.onRuleAdd),
          onGroupAdd: this._notifyQueryChange.bind(this, this.onGroupAdd),
          onRuleRemove: this._notifyQueryChange.bind(this, this.onRuleRemove),
          onGroupRemove: this._notifyQueryChange.bind(this, this.onGroupRemove),
          onPropChange: this._notifyQueryChange.bind(this, this.onPropChange),
          getLevel: this.getLevel.bind(this),
          isRuleGroup: this.isRuleGroup.bind(this),
          controls: controls,
          getOperators: function getOperators() {
            return _this2.getOperators.apply(_this2, arguments);
          }
        }
      });
    }
  }, {
    key: 'getInitialQuery',
    value: function getInitialQuery() {
      return this.props.query || this.createRuleGroup();
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._notifyQueryChange(null);
    }
  }, {
    key: 'render',
    value: function render() {
      var _state = this.state,
          _state$root = _state.root,
          id = _state$root.id,
          rules = _state$root.rules,
          combinator = _state$root.combinator,
          schema = _state.schema;
      var translations = this.props.translations;


      return _react2.default.createElement(
        'div',
        { className: 'queryBuilder ' + schema.classNames.queryBuilder },
        _react2.default.createElement(_RuleGroup2.default, {
          translations: translations,
          rules: rules,
          combinator: combinator,
          schema: schema,
          id: id,
          parentId: null
        })
      );
    }
  }, {
    key: 'isRuleGroup',
    value: function isRuleGroup(rule) {
      return !!(rule.combinator && rule.rules);
    }
  }, {
    key: 'createRule',
    value: function createRule() {
      var _state$schema = this.state.schema,
          dataTypes = _state$schema.dataTypes,
          fields = _state$schema.fields,
          operators = _state$schema.operators;


      return {
        id: 'r-' + (0, _v2.default)(),
        dataType: dataTypes[0].name,
        field: fields[0].name,
        value: '',
        operator: operators[0].name
      };
    }
  }, {
    key: 'createRuleGroup',
    value: function createRuleGroup() {
      return {
        id: 'g-' + (0, _v2.default)(),
        rules: [],
        combinator: this.props.combinators[0].name
      };
    }
  }, {
    key: 'getOperators',
    value: function getOperators(dataType) {
      if (this.props.getOperators) {
        var ops = this.props.getOperators(dataType);
        if (ops) {
          return ops;
        }
      }

      return this.props.operators;
    }
  }, {
    key: 'onRuleAdd',
    value: function onRuleAdd(rule, parentId) {
      var parent = this._findRule(parentId, this.state.root);
      parent.rules.push(rule);

      this.setState({ root: this.state.root });
    }
  }, {
    key: 'onGroupAdd',
    value: function onGroupAdd(group, parentId) {
      var parent = this._findRule(parentId, this.state.root);
      parent.rules.push(group);

      this.setState({ root: this.state.root });
    }
  }, {
    key: 'onPropChange',
    value: function onPropChange(prop, value, ruleId) {
      var rule = this._findRule(ruleId, this.state.root);
      Object.assign(rule, _defineProperty({}, prop, value));

      this.setState({ root: this.state.root });
    }
  }, {
    key: 'onRuleRemove',
    value: function onRuleRemove(ruleId, parentId) {
      var parent = this._findRule(parentId, this.state.root);
      var index = parent.rules.findIndex(function (x) {
        return x.id === ruleId;
      });

      parent.rules.splice(index, 1);
      this.setState({ root: this.state.root });
    }
  }, {
    key: 'onGroupRemove',
    value: function onGroupRemove(groupId, parentId) {
      var parent = this._findRule(parentId, this.state.root);
      var index = parent.rules.findIndex(function (x) {
        return x.id === groupId;
      });

      parent.rules.splice(index, 1);
      this.setState({ root: this.state.root });
    }
  }, {
    key: 'getLevel',
    value: function getLevel(id) {
      return this._getLevel(id, 0, this.state.root);
    }
  }, {
    key: '_getLevel',
    value: function _getLevel(id, index, root) {
      var _this3 = this;

      var isRuleGroup = this.state.schema.isRuleGroup;


      var foundAtIndex = -1;
      if (root.id === id) {
        foundAtIndex = index;
      } else if (isRuleGroup(root)) {
        root.rules.forEach(function (rule) {
          if (foundAtIndex === -1) {
            var indexForRule = index;
            if (isRuleGroup(rule)) indexForRule++;
            foundAtIndex = _this3._getLevel(id, indexForRule, rule);
          }
        });
      }
      return foundAtIndex;
    }
  }, {
    key: '_findRule',
    value: function _findRule(id, parent) {
      var isRuleGroup = this.state.schema.isRuleGroup;


      if (parent.id === id) {
        return parent;
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = parent.rules[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var rule = _step.value;

          if (rule.id === id) {
            return rule;
          } else if (isRuleGroup(rule)) {
            var subRule = this._findRule(id, rule);
            if (subRule) {
              return subRule;
            }
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: '_notifyQueryChange',
    value: function _notifyQueryChange(fn) {
      if (fn) {
        for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }

        fn.call.apply(fn, [this].concat(args));
      }

      var onQueryChange = this.props.onQueryChange;

      if (onQueryChange) {
        var query = (0, _cloneDeep2.default)(this.state.root);
        onQueryChange(query);
      }
    }
  }], [{
    key: 'defaultTranslations',
    get: function get() {
      return {
        dataTypes: {
          title: 'Data Types'
        },
        fields: {
          title: 'Fields'
        },
        operators: {
          title: 'Operators'
        },
        value: {
          title: 'Value'
        },
        removeRule: {
          label: 'x',
          title: 'Remove rule'
        },
        removeGroup: {
          label: 'x',
          title: 'Remove group'
        },
        addRule: {
          label: '+Rule',
          title: 'Add rule'
        },
        addGroup: {
          label: '+Group',
          title: 'Add group'
        },
        combinators: {
          title: 'Combinators'
        }
      };
    }
  }, {
    key: 'defaultDataTypes',
    get: function get() {
      return [{ name: 'string_type', label: 'String' }, { name: 'integer_type', label: 'Integer' }, { name: 'date_type', label: 'Date' }, { name: 'float_type', label: 'Float' }, { name: 'json_type', label: 'JSON' }];
    }
  }, {
    key: 'defaultOperators',
    get: function get() {
      return [{ name: 'null', label: 'Is Null' }, { name: 'notNull', label: 'Is Not Null' }, { name: 'in', label: 'In' }, { name: 'notIn', label: 'Not In' }, { name: '=', label: '=' }, { name: '!=', label: '!=' }, { name: '<', label: '<' }, { name: '>', label: '>' }, { name: '<=', label: '<=' }, { name: '>=', label: '>=' }];
    }
  }, {
    key: 'defaultCombinators',
    get: function get() {
      return [{ name: 'and', label: 'AND' }, { name: 'or', label: 'OR' }];
    }
  }, {
    key: 'defaultControlClassnames',
    get: function get() {
      return {
        queryBuilder: '',

        ruleGroup: '',
        combinators: '',
        addRule: '',
        addGroup: '',
        removeGroup: '',

        rule: '',
        dataTypes: '',
        fields: '',
        operators: '',
        value: '',
        removeRule: ''
      };
    }
  }, {
    key: 'defaultControlElements',
    get: function get() {
      return {
        addGroupAction: _index.ActionElement,
        removeGroupAction: _index.ActionElement,
        addRuleAction: _index.ActionElement,
        removeRuleAction: _index.ActionElement,
        combinatorSelector: _index.ValueSelector,
        dataTypeSelector: _index.ValueSelector,
        fieldSelector: _index.ValueSelector,
        operatorSelector: _index.ValueSelector,
        valueEditor: _index.ValueEditor
      };
    }
  }]);

  return QueryBuilder;
}(_react2.default.Component);

exports.default = QueryBuilder;

/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ValueEditor = __webpack_require__(57);

Object.defineProperty(exports, 'ValueEditor', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_ValueEditor).default;
  }
});

var _ValueSelector = __webpack_require__(62);

Object.defineProperty(exports, 'ValueSelector', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_ValueSelector).default;
  }
});

var _ActionElement = __webpack_require__(65);

Object.defineProperty(exports, 'ActionElement', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_ActionElement).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = __webpack_require__(2);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(10);

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ValueEditor = function ValueEditor(props) {
  var field = props.field,
      operator = props.operator,
      value = props.value,
      handleOnChange = props.handleOnChange,
      title = props.title;


  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  return _react2.default.createElement('input', { type: 'text',
    value: value,
    title: title,
    onChange: function onChange(e) {
      return handleOnChange(e.target.value);
    } });
};

ValueEditor.displayName = 'ValueEditor';

ValueEditor.propTypes = {
  field: _propTypes2.default.string,
  operator: _propTypes2.default.string,
  value: _propTypes2.default.string,
  handleOnChange: _propTypes2.default.func,
  title: _propTypes2.default.string
};

exports.default = ValueEditor;

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/** @license React v16.3.2
 * react.production.min.js
 *
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var m=__webpack_require__(6),n=__webpack_require__(3),p=__webpack_require__(8),q=__webpack_require__(4),r="function"===typeof Symbol&&Symbol["for"],t=r?Symbol["for"]("react.element"):60103,u=r?Symbol["for"]("react.portal"):60106,v=r?Symbol["for"]("react.fragment"):60107,w=r?Symbol["for"]("react.strict_mode"):60108,x=r?Symbol["for"]("react.provider"):60109,y=r?Symbol["for"]("react.context"):60110,z=r?Symbol["for"]("react.async_mode"):60111,A=r?Symbol["for"]("react.forward_ref"):
60112,B="function"===typeof Symbol&&Symbol.iterator;function C(a){for(var b=arguments.length-1,e="http://reactjs.org/docs/error-decoder.html?invariant\x3d"+a,c=0;c<b;c++)e+="\x26args[]\x3d"+encodeURIComponent(arguments[c+1]);n(!1,"Minified React error #"+a+"; visit %s for the full message or use the non-minified dev environment for full errors and additional helpful warnings. ",e)}var D={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}};
function E(a,b,e){this.props=a;this.context=b;this.refs=p;this.updater=e||D}E.prototype.isReactComponent={};E.prototype.setState=function(a,b){"object"!==typeof a&&"function"!==typeof a&&null!=a?C("85"):void 0;this.updater.enqueueSetState(this,a,b,"setState")};E.prototype.forceUpdate=function(a){this.updater.enqueueForceUpdate(this,a,"forceUpdate")};function F(){}F.prototype=E.prototype;function G(a,b,e){this.props=a;this.context=b;this.refs=p;this.updater=e||D}var H=G.prototype=new F;
H.constructor=G;m(H,E.prototype);H.isPureReactComponent=!0;var I={current:null},J=Object.prototype.hasOwnProperty,K={key:!0,ref:!0,__self:!0,__source:!0};
function L(a,b,e){var c=void 0,d={},g=null,h=null;if(null!=b)for(c in void 0!==b.ref&&(h=b.ref),void 0!==b.key&&(g=""+b.key),b)J.call(b,c)&&!K.hasOwnProperty(c)&&(d[c]=b[c]);var f=arguments.length-2;if(1===f)d.children=e;else if(1<f){for(var k=Array(f),l=0;l<f;l++)k[l]=arguments[l+2];d.children=k}if(a&&a.defaultProps)for(c in f=a.defaultProps,f)void 0===d[c]&&(d[c]=f[c]);return{$$typeof:t,type:a,key:g,ref:h,props:d,_owner:I.current}}
function M(a){return"object"===typeof a&&null!==a&&a.$$typeof===t}function escape(a){var b={"\x3d":"\x3d0",":":"\x3d2"};return"$"+(""+a).replace(/[=:]/g,function(a){return b[a]})}var N=/\/+/g,O=[];function P(a,b,e,c){if(O.length){var d=O.pop();d.result=a;d.keyPrefix=b;d.func=e;d.context=c;d.count=0;return d}return{result:a,keyPrefix:b,func:e,context:c,count:0}}function Q(a){a.result=null;a.keyPrefix=null;a.func=null;a.context=null;a.count=0;10>O.length&&O.push(a)}
function R(a,b,e,c){var d=typeof a;if("undefined"===d||"boolean"===d)a=null;var g=!1;if(null===a)g=!0;else switch(d){case "string":case "number":g=!0;break;case "object":switch(a.$$typeof){case t:case u:g=!0}}if(g)return e(c,a,""===b?"."+S(a,0):b),1;g=0;b=""===b?".":b+":";if(Array.isArray(a))for(var h=0;h<a.length;h++){d=a[h];var f=b+S(d,h);g+=R(d,f,e,c)}else if(null===a||"undefined"===typeof a?f=null:(f=B&&a[B]||a["@@iterator"],f="function"===typeof f?f:null),"function"===typeof f)for(a=f.call(a),
h=0;!(d=a.next()).done;)d=d.value,f=b+S(d,h++),g+=R(d,f,e,c);else"object"===d&&(e=""+a,C("31","[object Object]"===e?"object with keys {"+Object.keys(a).join(", ")+"}":e,""));return g}function S(a,b){return"object"===typeof a&&null!==a&&null!=a.key?escape(a.key):b.toString(36)}function T(a,b){a.func.call(a.context,b,a.count++)}
function U(a,b,e){var c=a.result,d=a.keyPrefix;a=a.func.call(a.context,b,a.count++);Array.isArray(a)?V(a,c,e,q.thatReturnsArgument):null!=a&&(M(a)&&(b=d+(!a.key||b&&b.key===a.key?"":(""+a.key).replace(N,"$\x26/")+"/")+e,a={$$typeof:t,type:a.type,key:b,ref:a.ref,props:a.props,_owner:a._owner}),c.push(a))}function V(a,b,e,c,d){var g="";null!=e&&(g=(""+e).replace(N,"$\x26/")+"/");b=P(b,g,c,d);null==a||R(a,"",U,b);Q(b)}
var W={Children:{map:function(a,b,e){if(null==a)return a;var c=[];V(a,c,null,b,e);return c},forEach:function(a,b,e){if(null==a)return a;b=P(null,null,b,e);null==a||R(a,"",T,b);Q(b)},count:function(a){return null==a?0:R(a,"",q.thatReturnsNull,null)},toArray:function(a){var b=[];V(a,b,null,q.thatReturnsArgument);return b},only:function(a){M(a)?void 0:C("143");return a}},createRef:function(){return{current:null}},Component:E,PureComponent:G,createContext:function(a,b){void 0===b&&(b=null);a={$$typeof:y,
_calculateChangedBits:b,_defaultValue:a,_currentValue:a,_changedBits:0,Provider:null,Consumer:null};a.Provider={$$typeof:x,_context:a};return a.Consumer=a},forwardRef:function(a){return{$$typeof:A,render:a}},Fragment:v,StrictMode:w,unstable_AsyncMode:z,createElement:L,cloneElement:function(a,b,e){null===a||void 0===a?C("267",a):void 0;var c=void 0,d=m({},a.props),g=a.key,h=a.ref,f=a._owner;if(null!=b){void 0!==b.ref&&(h=b.ref,f=I.current);void 0!==b.key&&(g=""+b.key);var k=void 0;a.type&&a.type.defaultProps&&
(k=a.type.defaultProps);for(c in b)J.call(b,c)&&!K.hasOwnProperty(c)&&(d[c]=void 0===b[c]&&void 0!==k?k[c]:b[c])}c=arguments.length-2;if(1===c)d.children=e;else if(1<c){k=Array(c);for(var l=0;l<c;l++)k[l]=arguments[l+2];d.children=k}return{$$typeof:t,type:a.type,key:g,ref:h,props:d,_owner:f}},createFactory:function(a){var b=L.bind(null,a);b.type=a;return b},isValidElement:M,version:"16.3.2",__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED:{ReactCurrentOwner:I,assign:m}},X=Object.freeze({default:W}),
Y=X&&W||X;module.exports=Y["default"]?Y["default"]:Y;


/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/** @license React v16.3.2
 * react.development.js
 *
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */





if (process.env.NODE_ENV !== "production") {
  (function() {
'use strict';

var _assign = __webpack_require__(6);
var invariant = __webpack_require__(3);
var emptyObject = __webpack_require__(8);
var warning = __webpack_require__(9);
var emptyFunction = __webpack_require__(4);
var checkPropTypes = __webpack_require__(17);

// TODO: this is special because it gets imported during build.

var ReactVersion = '16.3.2';

// The Symbol used to tag the ReactElement-like types. If there is no native Symbol
// nor polyfill, then a plain number is used for performance.
var hasSymbol = typeof Symbol === 'function' && Symbol['for'];

var REACT_ELEMENT_TYPE = hasSymbol ? Symbol['for']('react.element') : 0xeac7;
var REACT_CALL_TYPE = hasSymbol ? Symbol['for']('react.call') : 0xeac8;
var REACT_RETURN_TYPE = hasSymbol ? Symbol['for']('react.return') : 0xeac9;
var REACT_PORTAL_TYPE = hasSymbol ? Symbol['for']('react.portal') : 0xeaca;
var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol['for']('react.fragment') : 0xeacb;
var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol['for']('react.strict_mode') : 0xeacc;
var REACT_PROVIDER_TYPE = hasSymbol ? Symbol['for']('react.provider') : 0xeacd;
var REACT_CONTEXT_TYPE = hasSymbol ? Symbol['for']('react.context') : 0xeace;
var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol['for']('react.async_mode') : 0xeacf;
var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol['for']('react.forward_ref') : 0xead0;

var MAYBE_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
var FAUX_ITERATOR_SYMBOL = '@@iterator';

function getIteratorFn(maybeIterable) {
  if (maybeIterable === null || typeof maybeIterable === 'undefined') {
    return null;
  }
  var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
  if (typeof maybeIterator === 'function') {
    return maybeIterator;
  }
  return null;
}

// Relying on the `invariant()` implementation lets us
// have preserve the format and params in the www builds.

/**
 * Forked from fbjs/warning:
 * https://github.com/facebook/fbjs/blob/e66ba20ad5be433eb54423f2b097d829324d9de6/packages/fbjs/src/__forks__/warning.js
 *
 * Only change is we use console.warn instead of console.error,
 * and do nothing when 'console' is not supported.
 * This really simplifies the code.
 * ---
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var lowPriorityWarning = function () {};

{
  var printWarning = function (format) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var argIndex = 0;
    var message = 'Warning: ' + format.replace(/%s/g, function () {
      return args[argIndex++];
    });
    if (typeof console !== 'undefined') {
      console.warn(message);
    }
    try {
      // --- Welcome to debugging React ---
      // This error was thrown as a convenience so that you can use this stack
      // to find the callsite that caused this warning to fire.
      throw new Error(message);
    } catch (x) {}
  };

  lowPriorityWarning = function (condition, format) {
    if (format === undefined) {
      throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
    }
    if (!condition) {
      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      printWarning.apply(undefined, [format].concat(args));
    }
  };
}

var lowPriorityWarning$1 = lowPriorityWarning;

var didWarnStateUpdateForUnmountedComponent = {};

function warnNoop(publicInstance, callerName) {
  {
    var _constructor = publicInstance.constructor;
    var componentName = _constructor && (_constructor.displayName || _constructor.name) || 'ReactClass';
    var warningKey = componentName + '.' + callerName;
    if (didWarnStateUpdateForUnmountedComponent[warningKey]) {
      return;
    }
    warning(false, "Can't call %s on a component that is not yet mounted. " + 'This is a no-op, but it might indicate a bug in your application. ' + 'Instead, assign to `this.state` directly or define a `state = {};` ' + 'class property with the desired state in the %s component.', callerName, componentName);
    didWarnStateUpdateForUnmountedComponent[warningKey] = true;
  }
}

/**
 * This is the abstract API for an update queue.
 */
var ReactNoopUpdateQueue = {
  /**
   * Checks whether or not this composite component is mounted.
   * @param {ReactClass} publicInstance The instance we want to test.
   * @return {boolean} True if mounted, false otherwise.
   * @protected
   * @final
   */
  isMounted: function (publicInstance) {
    return false;
  },

  /**
   * Forces an update. This should only be invoked when it is known with
   * certainty that we are **not** in a DOM transaction.
   *
   * You may want to call this when you know that some deeper aspect of the
   * component's state has changed but `setState` was not called.
   *
   * This will not invoke `shouldComponentUpdate`, but it will invoke
   * `componentWillUpdate` and `componentDidUpdate`.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {?function} callback Called after component is updated.
   * @param {?string} callerName name of the calling function in the public API.
   * @internal
   */
  enqueueForceUpdate: function (publicInstance, callback, callerName) {
    warnNoop(publicInstance, 'forceUpdate');
  },

  /**
   * Replaces all of the state. Always use this or `setState` to mutate state.
   * You should treat `this.state` as immutable.
   *
   * There is no guarantee that `this.state` will be immediately updated, so
   * accessing `this.state` after calling this method may return the old value.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object} completeState Next state.
   * @param {?function} callback Called after component is updated.
   * @param {?string} callerName name of the calling function in the public API.
   * @internal
   */
  enqueueReplaceState: function (publicInstance, completeState, callback, callerName) {
    warnNoop(publicInstance, 'replaceState');
  },

  /**
   * Sets a subset of the state. This only exists because _pendingState is
   * internal. This provides a merging strategy that is not available to deep
   * properties which is confusing. TODO: Expose pendingState or don't use it
   * during the merge.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object} partialState Next partial state to be merged with state.
   * @param {?function} callback Called after component is updated.
   * @param {?string} Name of the calling function in the public API.
   * @internal
   */
  enqueueSetState: function (publicInstance, partialState, callback, callerName) {
    warnNoop(publicInstance, 'setState');
  }
};

/**
 * Base class helpers for the updating state of a component.
 */
function Component(props, context, updater) {
  this.props = props;
  this.context = context;
  this.refs = emptyObject;
  // We initialize the default updater but the real one gets injected by the
  // renderer.
  this.updater = updater || ReactNoopUpdateQueue;
}

Component.prototype.isReactComponent = {};

/**
 * Sets a subset of the state. Always use this to mutate
 * state. You should treat `this.state` as immutable.
 *
 * There is no guarantee that `this.state` will be immediately updated, so
 * accessing `this.state` after calling this method may return the old value.
 *
 * There is no guarantee that calls to `setState` will run synchronously,
 * as they may eventually be batched together.  You can provide an optional
 * callback that will be executed when the call to setState is actually
 * completed.
 *
 * When a function is provided to setState, it will be called at some point in
 * the future (not synchronously). It will be called with the up to date
 * component arguments (state, props, context). These values can be different
 * from this.* because your function may be called after receiveProps but before
 * shouldComponentUpdate, and this new state, props, and context will not yet be
 * assigned to this.
 *
 * @param {object|function} partialState Next partial state or function to
 *        produce next partial state to be merged with current state.
 * @param {?function} callback Called after state is updated.
 * @final
 * @protected
 */
Component.prototype.setState = function (partialState, callback) {
  !(typeof partialState === 'object' || typeof partialState === 'function' || partialState == null) ? invariant(false, 'setState(...): takes an object of state variables to update or a function which returns an object of state variables.') : void 0;
  this.updater.enqueueSetState(this, partialState, callback, 'setState');
};

/**
 * Forces an update. This should only be invoked when it is known with
 * certainty that we are **not** in a DOM transaction.
 *
 * You may want to call this when you know that some deeper aspect of the
 * component's state has changed but `setState` was not called.
 *
 * This will not invoke `shouldComponentUpdate`, but it will invoke
 * `componentWillUpdate` and `componentDidUpdate`.
 *
 * @param {?function} callback Called after update is complete.
 * @final
 * @protected
 */
Component.prototype.forceUpdate = function (callback) {
  this.updater.enqueueForceUpdate(this, callback, 'forceUpdate');
};

/**
 * Deprecated APIs. These APIs used to exist on classic React classes but since
 * we would like to deprecate them, we're not going to move them over to this
 * modern base class. Instead, we define a getter that warns if it's accessed.
 */
{
  var deprecatedAPIs = {
    isMounted: ['isMounted', 'Instead, make sure to clean up subscriptions and pending requests in ' + 'componentWillUnmount to prevent memory leaks.'],
    replaceState: ['replaceState', 'Refactor your code to use setState instead (see ' + 'https://github.com/facebook/react/issues/3236).']
  };
  var defineDeprecationWarning = function (methodName, info) {
    Object.defineProperty(Component.prototype, methodName, {
      get: function () {
        lowPriorityWarning$1(false, '%s(...) is deprecated in plain JavaScript React classes. %s', info[0], info[1]);
        return undefined;
      }
    });
  };
  for (var fnName in deprecatedAPIs) {
    if (deprecatedAPIs.hasOwnProperty(fnName)) {
      defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
    }
  }
}

function ComponentDummy() {}
ComponentDummy.prototype = Component.prototype;

/**
 * Convenience component with default shallow equality check for sCU.
 */
function PureComponent(props, context, updater) {
  this.props = props;
  this.context = context;
  this.refs = emptyObject;
  this.updater = updater || ReactNoopUpdateQueue;
}

var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
pureComponentPrototype.constructor = PureComponent;
// Avoid an extra prototype jump for these methods.
_assign(pureComponentPrototype, Component.prototype);
pureComponentPrototype.isPureReactComponent = true;

// an immutable object with a single mutable value
function createRef() {
  var refObject = {
    current: null
  };
  {
    Object.seal(refObject);
  }
  return refObject;
}

/**
 * Keeps track of the current owner.
 *
 * The current owner is the component who should own any components that are
 * currently being constructed.
 */
var ReactCurrentOwner = {
  /**
   * @internal
   * @type {ReactComponent}
   */
  current: null
};

var hasOwnProperty = Object.prototype.hasOwnProperty;

var RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true
};

var specialPropKeyWarningShown = void 0;
var specialPropRefWarningShown = void 0;

function hasValidRef(config) {
  {
    if (hasOwnProperty.call(config, 'ref')) {
      var getter = Object.getOwnPropertyDescriptor(config, 'ref').get;
      if (getter && getter.isReactWarning) {
        return false;
      }
    }
  }
  return config.ref !== undefined;
}

function hasValidKey(config) {
  {
    if (hasOwnProperty.call(config, 'key')) {
      var getter = Object.getOwnPropertyDescriptor(config, 'key').get;
      if (getter && getter.isReactWarning) {
        return false;
      }
    }
  }
  return config.key !== undefined;
}

function defineKeyPropWarningGetter(props, displayName) {
  var warnAboutAccessingKey = function () {
    if (!specialPropKeyWarningShown) {
      specialPropKeyWarningShown = true;
      warning(false, '%s: `key` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://fb.me/react-special-props)', displayName);
    }
  };
  warnAboutAccessingKey.isReactWarning = true;
  Object.defineProperty(props, 'key', {
    get: warnAboutAccessingKey,
    configurable: true
  });
}

function defineRefPropWarningGetter(props, displayName) {
  var warnAboutAccessingRef = function () {
    if (!specialPropRefWarningShown) {
      specialPropRefWarningShown = true;
      warning(false, '%s: `ref` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://fb.me/react-special-props)', displayName);
    }
  };
  warnAboutAccessingRef.isReactWarning = true;
  Object.defineProperty(props, 'ref', {
    get: warnAboutAccessingRef,
    configurable: true
  });
}

/**
 * Factory method to create a new React element. This no longer adheres to
 * the class pattern, so do not use new to call it. Also, no instanceof check
 * will work. Instead test $$typeof field against Symbol.for('react.element') to check
 * if something is a React Element.
 *
 * @param {*} type
 * @param {*} key
 * @param {string|object} ref
 * @param {*} self A *temporary* helper to detect places where `this` is
 * different from the `owner` when React.createElement is called, so that we
 * can warn. We want to get rid of owner and replace string `ref`s with arrow
 * functions, and as long as `this` and owner are the same, there will be no
 * change in behavior.
 * @param {*} source An annotation object (added by a transpiler or otherwise)
 * indicating filename, line number, and/or other information.
 * @param {*} owner
 * @param {*} props
 * @internal
 */
var ReactElement = function (type, key, ref, self, source, owner, props) {
  var element = {
    // This tag allows us to uniquely identify this as a React Element
    $$typeof: REACT_ELEMENT_TYPE,

    // Built-in properties that belong on the element
    type: type,
    key: key,
    ref: ref,
    props: props,

    // Record the component responsible for creating this element.
    _owner: owner
  };

  {
    // The validation flag is currently mutative. We put it on
    // an external backing store so that we can freeze the whole object.
    // This can be replaced with a WeakMap once they are implemented in
    // commonly used development environments.
    element._store = {};

    // To make comparing ReactElements easier for testing purposes, we make
    // the validation flag non-enumerable (where possible, which should
    // include every environment we run tests in), so the test framework
    // ignores it.
    Object.defineProperty(element._store, 'validated', {
      configurable: false,
      enumerable: false,
      writable: true,
      value: false
    });
    // self and source are DEV only properties.
    Object.defineProperty(element, '_self', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: self
    });
    // Two elements created in two different places should be considered
    // equal for testing purposes and therefore we hide it from enumeration.
    Object.defineProperty(element, '_source', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: source
    });
    if (Object.freeze) {
      Object.freeze(element.props);
      Object.freeze(element);
    }
  }

  return element;
};

/**
 * Create and return a new ReactElement of the given type.
 * See https://reactjs.org/docs/react-api.html#createelement
 */
function createElement(type, config, children) {
  var propName = void 0;

  // Reserved names are extracted
  var props = {};

  var key = null;
  var ref = null;
  var self = null;
  var source = null;

  if (config != null) {
    if (hasValidRef(config)) {
      ref = config.ref;
    }
    if (hasValidKey(config)) {
      key = '' + config.key;
    }

    self = config.__self === undefined ? null : config.__self;
    source = config.__source === undefined ? null : config.__source;
    // Remaining properties are added to a new props object
    for (propName in config) {
      if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
        props[propName] = config[propName];
      }
    }
  }

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
  var childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    var childArray = Array(childrenLength);
    for (var i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    {
      if (Object.freeze) {
        Object.freeze(childArray);
      }
    }
    props.children = childArray;
  }

  // Resolve default props
  if (type && type.defaultProps) {
    var defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }
  {
    if (key || ref) {
      if (typeof props.$$typeof === 'undefined' || props.$$typeof !== REACT_ELEMENT_TYPE) {
        var displayName = typeof type === 'function' ? type.displayName || type.name || 'Unknown' : type;
        if (key) {
          defineKeyPropWarningGetter(props, displayName);
        }
        if (ref) {
          defineRefPropWarningGetter(props, displayName);
        }
      }
    }
  }
  return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
}

/**
 * Return a function that produces ReactElements of a given type.
 * See https://reactjs.org/docs/react-api.html#createfactory
 */


function cloneAndReplaceKey(oldElement, newKey) {
  var newElement = ReactElement(oldElement.type, newKey, oldElement.ref, oldElement._self, oldElement._source, oldElement._owner, oldElement.props);

  return newElement;
}

/**
 * Clone and return a new ReactElement using element as the starting point.
 * See https://reactjs.org/docs/react-api.html#cloneelement
 */
function cloneElement(element, config, children) {
  !!(element === null || element === undefined) ? invariant(false, 'React.cloneElement(...): The argument must be a React element, but you passed %s.', element) : void 0;

  var propName = void 0;

  // Original props are copied
  var props = _assign({}, element.props);

  // Reserved names are extracted
  var key = element.key;
  var ref = element.ref;
  // Self is preserved since the owner is preserved.
  var self = element._self;
  // Source is preserved since cloneElement is unlikely to be targeted by a
  // transpiler, and the original source is probably a better indicator of the
  // true owner.
  var source = element._source;

  // Owner will be preserved, unless ref is overridden
  var owner = element._owner;

  if (config != null) {
    if (hasValidRef(config)) {
      // Silently steal the ref from the parent.
      ref = config.ref;
      owner = ReactCurrentOwner.current;
    }
    if (hasValidKey(config)) {
      key = '' + config.key;
    }

    // Remaining properties override existing props
    var defaultProps = void 0;
    if (element.type && element.type.defaultProps) {
      defaultProps = element.type.defaultProps;
    }
    for (propName in config) {
      if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
        if (config[propName] === undefined && defaultProps !== undefined) {
          // Resolve default props
          props[propName] = defaultProps[propName];
        } else {
          props[propName] = config[propName];
        }
      }
    }
  }

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
  var childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    var childArray = Array(childrenLength);
    for (var i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }

  return ReactElement(element.type, key, ref, self, source, owner, props);
}

/**
 * Verifies the object is a ReactElement.
 * See https://reactjs.org/docs/react-api.html#isvalidelement
 * @param {?object} object
 * @return {boolean} True if `object` is a valid component.
 * @final
 */
function isValidElement(object) {
  return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
}

var ReactDebugCurrentFrame = {};

{
  // Component that is being worked on
  ReactDebugCurrentFrame.getCurrentStack = null;

  ReactDebugCurrentFrame.getStackAddendum = function () {
    var impl = ReactDebugCurrentFrame.getCurrentStack;
    if (impl) {
      return impl();
    }
    return null;
  };
}

var SEPARATOR = '.';
var SUBSEPARATOR = ':';

/**
 * Escape and wrap key so it is safe to use as a reactid
 *
 * @param {string} key to be escaped.
 * @return {string} the escaped key.
 */
function escape(key) {
  var escapeRegex = /[=:]/g;
  var escaperLookup = {
    '=': '=0',
    ':': '=2'
  };
  var escapedString = ('' + key).replace(escapeRegex, function (match) {
    return escaperLookup[match];
  });

  return '$' + escapedString;
}

/**
 * TODO: Test that a single child and an array with one item have the same key
 * pattern.
 */

var didWarnAboutMaps = false;

var userProvidedKeyEscapeRegex = /\/+/g;
function escapeUserProvidedKey(text) {
  return ('' + text).replace(userProvidedKeyEscapeRegex, '$&/');
}

var POOL_SIZE = 10;
var traverseContextPool = [];
function getPooledTraverseContext(mapResult, keyPrefix, mapFunction, mapContext) {
  if (traverseContextPool.length) {
    var traverseContext = traverseContextPool.pop();
    traverseContext.result = mapResult;
    traverseContext.keyPrefix = keyPrefix;
    traverseContext.func = mapFunction;
    traverseContext.context = mapContext;
    traverseContext.count = 0;
    return traverseContext;
  } else {
    return {
      result: mapResult,
      keyPrefix: keyPrefix,
      func: mapFunction,
      context: mapContext,
      count: 0
    };
  }
}

function releaseTraverseContext(traverseContext) {
  traverseContext.result = null;
  traverseContext.keyPrefix = null;
  traverseContext.func = null;
  traverseContext.context = null;
  traverseContext.count = 0;
  if (traverseContextPool.length < POOL_SIZE) {
    traverseContextPool.push(traverseContext);
  }
}

/**
 * @param {?*} children Children tree container.
 * @param {!string} nameSoFar Name of the key path so far.
 * @param {!function} callback Callback to invoke with each child found.
 * @param {?*} traverseContext Used to pass information throughout the traversal
 * process.
 * @return {!number} The number of children in this subtree.
 */
function traverseAllChildrenImpl(children, nameSoFar, callback, traverseContext) {
  var type = typeof children;

  if (type === 'undefined' || type === 'boolean') {
    // All of the above are perceived as null.
    children = null;
  }

  var invokeCallback = false;

  if (children === null) {
    invokeCallback = true;
  } else {
    switch (type) {
      case 'string':
      case 'number':
        invokeCallback = true;
        break;
      case 'object':
        switch (children.$$typeof) {
          case REACT_ELEMENT_TYPE:
          case REACT_PORTAL_TYPE:
            invokeCallback = true;
        }
    }
  }

  if (invokeCallback) {
    callback(traverseContext, children,
    // If it's the only child, treat the name as if it was wrapped in an array
    // so that it's consistent if the number of children grows.
    nameSoFar === '' ? SEPARATOR + getComponentKey(children, 0) : nameSoFar);
    return 1;
  }

  var child = void 0;
  var nextName = void 0;
  var subtreeCount = 0; // Count of children found in the current subtree.
  var nextNamePrefix = nameSoFar === '' ? SEPARATOR : nameSoFar + SUBSEPARATOR;

  if (Array.isArray(children)) {
    for (var i = 0; i < children.length; i++) {
      child = children[i];
      nextName = nextNamePrefix + getComponentKey(child, i);
      subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
    }
  } else {
    var iteratorFn = getIteratorFn(children);
    if (typeof iteratorFn === 'function') {
      {
        // Warn about using Maps as children
        if (iteratorFn === children.entries) {
          !didWarnAboutMaps ? warning(false, 'Using Maps as children is unsupported and will likely yield ' + 'unexpected results. Convert it to a sequence/iterable of keyed ' + 'ReactElements instead.%s', ReactDebugCurrentFrame.getStackAddendum()) : void 0;
          didWarnAboutMaps = true;
        }
      }

      var iterator = iteratorFn.call(children);
      var step = void 0;
      var ii = 0;
      while (!(step = iterator.next()).done) {
        child = step.value;
        nextName = nextNamePrefix + getComponentKey(child, ii++);
        subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
      }
    } else if (type === 'object') {
      var addendum = '';
      {
        addendum = ' If you meant to render a collection of children, use an array ' + 'instead.' + ReactDebugCurrentFrame.getStackAddendum();
      }
      var childrenString = '' + children;
      invariant(false, 'Objects are not valid as a React child (found: %s).%s', childrenString === '[object Object]' ? 'object with keys {' + Object.keys(children).join(', ') + '}' : childrenString, addendum);
    }
  }

  return subtreeCount;
}

/**
 * Traverses children that are typically specified as `props.children`, but
 * might also be specified through attributes:
 *
 * - `traverseAllChildren(this.props.children, ...)`
 * - `traverseAllChildren(this.props.leftPanelChildren, ...)`
 *
 * The `traverseContext` is an optional argument that is passed through the
 * entire traversal. It can be used to store accumulations or anything else that
 * the callback might find relevant.
 *
 * @param {?*} children Children tree object.
 * @param {!function} callback To invoke upon traversing each child.
 * @param {?*} traverseContext Context for traversal.
 * @return {!number} The number of children in this subtree.
 */
function traverseAllChildren(children, callback, traverseContext) {
  if (children == null) {
    return 0;
  }

  return traverseAllChildrenImpl(children, '', callback, traverseContext);
}

/**
 * Generate a key string that identifies a component within a set.
 *
 * @param {*} component A component that could contain a manual key.
 * @param {number} index Index that is used if a manual key is not provided.
 * @return {string}
 */
function getComponentKey(component, index) {
  // Do some typechecking here since we call this blindly. We want to ensure
  // that we don't block potential future ES APIs.
  if (typeof component === 'object' && component !== null && component.key != null) {
    // Explicit key
    return escape(component.key);
  }
  // Implicit key determined by the index in the set
  return index.toString(36);
}

function forEachSingleChild(bookKeeping, child, name) {
  var func = bookKeeping.func,
      context = bookKeeping.context;

  func.call(context, child, bookKeeping.count++);
}

/**
 * Iterates through children that are typically specified as `props.children`.
 *
 * See https://reactjs.org/docs/react-api.html#react.children.foreach
 *
 * The provided forEachFunc(child, index) will be called for each
 * leaf child.
 *
 * @param {?*} children Children tree container.
 * @param {function(*, int)} forEachFunc
 * @param {*} forEachContext Context for forEachContext.
 */
function forEachChildren(children, forEachFunc, forEachContext) {
  if (children == null) {
    return children;
  }
  var traverseContext = getPooledTraverseContext(null, null, forEachFunc, forEachContext);
  traverseAllChildren(children, forEachSingleChild, traverseContext);
  releaseTraverseContext(traverseContext);
}

function mapSingleChildIntoContext(bookKeeping, child, childKey) {
  var result = bookKeeping.result,
      keyPrefix = bookKeeping.keyPrefix,
      func = bookKeeping.func,
      context = bookKeeping.context;


  var mappedChild = func.call(context, child, bookKeeping.count++);
  if (Array.isArray(mappedChild)) {
    mapIntoWithKeyPrefixInternal(mappedChild, result, childKey, emptyFunction.thatReturnsArgument);
  } else if (mappedChild != null) {
    if (isValidElement(mappedChild)) {
      mappedChild = cloneAndReplaceKey(mappedChild,
      // Keep both the (mapped) and old keys if they differ, just as
      // traverseAllChildren used to do for objects as children
      keyPrefix + (mappedChild.key && (!child || child.key !== mappedChild.key) ? escapeUserProvidedKey(mappedChild.key) + '/' : '') + childKey);
    }
    result.push(mappedChild);
  }
}

function mapIntoWithKeyPrefixInternal(children, array, prefix, func, context) {
  var escapedPrefix = '';
  if (prefix != null) {
    escapedPrefix = escapeUserProvidedKey(prefix) + '/';
  }
  var traverseContext = getPooledTraverseContext(array, escapedPrefix, func, context);
  traverseAllChildren(children, mapSingleChildIntoContext, traverseContext);
  releaseTraverseContext(traverseContext);
}

/**
 * Maps children that are typically specified as `props.children`.
 *
 * See https://reactjs.org/docs/react-api.html#react.children.map
 *
 * The provided mapFunction(child, key, index) will be called for each
 * leaf child.
 *
 * @param {?*} children Children tree container.
 * @param {function(*, int)} func The map function.
 * @param {*} context Context for mapFunction.
 * @return {object} Object containing the ordered map of results.
 */
function mapChildren(children, func, context) {
  if (children == null) {
    return children;
  }
  var result = [];
  mapIntoWithKeyPrefixInternal(children, result, null, func, context);
  return result;
}

/**
 * Count the number of children that are typically specified as
 * `props.children`.
 *
 * See https://reactjs.org/docs/react-api.html#react.children.count
 *
 * @param {?*} children Children tree container.
 * @return {number} The number of children.
 */
function countChildren(children, context) {
  return traverseAllChildren(children, emptyFunction.thatReturnsNull, null);
}

/**
 * Flatten a children object (typically specified as `props.children`) and
 * return an array with appropriately re-keyed children.
 *
 * See https://reactjs.org/docs/react-api.html#react.children.toarray
 */
function toArray(children) {
  var result = [];
  mapIntoWithKeyPrefixInternal(children, result, null, emptyFunction.thatReturnsArgument);
  return result;
}

/**
 * Returns the first child in a collection of children and verifies that there
 * is only one child in the collection.
 *
 * See https://reactjs.org/docs/react-api.html#react.children.only
 *
 * The current implementation of this function assumes that a single child gets
 * passed without a wrapper, but the purpose of this helper function is to
 * abstract away the particular structure of children.
 *
 * @param {?object} children Child collection structure.
 * @return {ReactElement} The first and only `ReactElement` contained in the
 * structure.
 */
function onlyChild(children) {
  !isValidElement(children) ? invariant(false, 'React.Children.only expected to receive a single React element child.') : void 0;
  return children;
}

function createContext(defaultValue, calculateChangedBits) {
  if (calculateChangedBits === undefined) {
    calculateChangedBits = null;
  } else {
    {
      !(calculateChangedBits === null || typeof calculateChangedBits === 'function') ? warning(false, 'createContext: Expected the optional second argument to be a ' + 'function. Instead received: %s', calculateChangedBits) : void 0;
    }
  }

  var context = {
    $$typeof: REACT_CONTEXT_TYPE,
    _calculateChangedBits: calculateChangedBits,
    _defaultValue: defaultValue,
    _currentValue: defaultValue,
    _changedBits: 0,
    // These are circular
    Provider: null,
    Consumer: null
  };

  context.Provider = {
    $$typeof: REACT_PROVIDER_TYPE,
    _context: context
  };
  context.Consumer = context;

  {
    context._currentRenderer = null;
  }

  return context;
}

function forwardRef(render) {
  {
    !(typeof render === 'function') ? warning(false, 'forwardRef requires a render function but was given %s.', render === null ? 'null' : typeof render) : void 0;
  }

  return {
    $$typeof: REACT_FORWARD_REF_TYPE,
    render: render
  };
}

var describeComponentFrame = function (name, source, ownerName) {
  return '\n    in ' + (name || 'Unknown') + (source ? ' (at ' + source.fileName.replace(/^.*[\\\/]/, '') + ':' + source.lineNumber + ')' : ownerName ? ' (created by ' + ownerName + ')' : '');
};

function isValidElementType(type) {
  return typeof type === 'string' || typeof type === 'function' ||
  // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
  type === REACT_FRAGMENT_TYPE || type === REACT_ASYNC_MODE_TYPE || type === REACT_STRICT_MODE_TYPE || typeof type === 'object' && type !== null && (type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE);
}

function getComponentName(fiber) {
  var type = fiber.type;

  if (typeof type === 'function') {
    return type.displayName || type.name;
  }
  if (typeof type === 'string') {
    return type;
  }
  switch (type) {
    case REACT_FRAGMENT_TYPE:
      return 'ReactFragment';
    case REACT_PORTAL_TYPE:
      return 'ReactPortal';
    case REACT_CALL_TYPE:
      return 'ReactCall';
    case REACT_RETURN_TYPE:
      return 'ReactReturn';
  }
  if (typeof type === 'object' && type !== null) {
    switch (type.$$typeof) {
      case REACT_FORWARD_REF_TYPE:
        var functionName = type.render.displayName || type.render.name || '';
        return functionName !== '' ? 'ForwardRef(' + functionName + ')' : 'ForwardRef';
    }
  }
  return null;
}

/**
 * ReactElementValidator provides a wrapper around a element factory
 * which validates the props passed to the element. This is intended to be
 * used only in DEV and could be replaced by a static type checker for languages
 * that support it.
 */

var currentlyValidatingElement = void 0;
var propTypesMisspellWarningShown = void 0;

var getDisplayName = function () {};
var getStackAddendum = function () {};

{
  currentlyValidatingElement = null;

  propTypesMisspellWarningShown = false;

  getDisplayName = function (element) {
    if (element == null) {
      return '#empty';
    } else if (typeof element === 'string' || typeof element === 'number') {
      return '#text';
    } else if (typeof element.type === 'string') {
      return element.type;
    } else if (element.type === REACT_FRAGMENT_TYPE) {
      return 'React.Fragment';
    } else {
      return element.type.displayName || element.type.name || 'Unknown';
    }
  };

  getStackAddendum = function () {
    var stack = '';
    if (currentlyValidatingElement) {
      var name = getDisplayName(currentlyValidatingElement);
      var owner = currentlyValidatingElement._owner;
      stack += describeComponentFrame(name, currentlyValidatingElement._source, owner && getComponentName(owner));
    }
    stack += ReactDebugCurrentFrame.getStackAddendum() || '';
    return stack;
  };
}

function getDeclarationErrorAddendum() {
  if (ReactCurrentOwner.current) {
    var name = getComponentName(ReactCurrentOwner.current);
    if (name) {
      return '\n\nCheck the render method of `' + name + '`.';
    }
  }
  return '';
}

function getSourceInfoErrorAddendum(elementProps) {
  if (elementProps !== null && elementProps !== undefined && elementProps.__source !== undefined) {
    var source = elementProps.__source;
    var fileName = source.fileName.replace(/^.*[\\\/]/, '');
    var lineNumber = source.lineNumber;
    return '\n\nCheck your code at ' + fileName + ':' + lineNumber + '.';
  }
  return '';
}

/**
 * Warn if there's no key explicitly set on dynamic arrays of children or
 * object keys are not valid. This allows us to keep track of children between
 * updates.
 */
var ownerHasKeyUseWarning = {};

function getCurrentComponentErrorInfo(parentType) {
  var info = getDeclarationErrorAddendum();

  if (!info) {
    var parentName = typeof parentType === 'string' ? parentType : parentType.displayName || parentType.name;
    if (parentName) {
      info = '\n\nCheck the top-level render call using <' + parentName + '>.';
    }
  }
  return info;
}

/**
 * Warn if the element doesn't have an explicit key assigned to it.
 * This element is in an array. The array could grow and shrink or be
 * reordered. All children that haven't already been validated are required to
 * have a "key" property assigned to it. Error statuses are cached so a warning
 * will only be shown once.
 *
 * @internal
 * @param {ReactElement} element Element that requires a key.
 * @param {*} parentType element's parent's type.
 */
function validateExplicitKey(element, parentType) {
  if (!element._store || element._store.validated || element.key != null) {
    return;
  }
  element._store.validated = true;

  var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);
  if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
    return;
  }
  ownerHasKeyUseWarning[currentComponentErrorInfo] = true;

  // Usually the current owner is the offender, but if it accepts children as a
  // property, it may be the creator of the child that's responsible for
  // assigning it a key.
  var childOwner = '';
  if (element && element._owner && element._owner !== ReactCurrentOwner.current) {
    // Give the component that originally created this child.
    childOwner = ' It was passed a child from ' + getComponentName(element._owner) + '.';
  }

  currentlyValidatingElement = element;
  {
    warning(false, 'Each child in an array or iterator should have a unique "key" prop.' + '%s%s See https://fb.me/react-warning-keys for more information.%s', currentComponentErrorInfo, childOwner, getStackAddendum());
  }
  currentlyValidatingElement = null;
}

/**
 * Ensure that every element either is passed in a static location, in an
 * array with an explicit keys property defined, or in an object literal
 * with valid key property.
 *
 * @internal
 * @param {ReactNode} node Statically passed child of any type.
 * @param {*} parentType node's parent's type.
 */
function validateChildKeys(node, parentType) {
  if (typeof node !== 'object') {
    return;
  }
  if (Array.isArray(node)) {
    for (var i = 0; i < node.length; i++) {
      var child = node[i];
      if (isValidElement(child)) {
        validateExplicitKey(child, parentType);
      }
    }
  } else if (isValidElement(node)) {
    // This element was passed in a valid location.
    if (node._store) {
      node._store.validated = true;
    }
  } else if (node) {
    var iteratorFn = getIteratorFn(node);
    if (typeof iteratorFn === 'function') {
      // Entry iterators used to provide implicit keys,
      // but now we print a separate warning for them later.
      if (iteratorFn !== node.entries) {
        var iterator = iteratorFn.call(node);
        var step = void 0;
        while (!(step = iterator.next()).done) {
          if (isValidElement(step.value)) {
            validateExplicitKey(step.value, parentType);
          }
        }
      }
    }
  }
}

/**
 * Given an element, validate that its props follow the propTypes definition,
 * provided by the type.
 *
 * @param {ReactElement} element
 */
function validatePropTypes(element) {
  var componentClass = element.type;
  if (typeof componentClass !== 'function') {
    return;
  }
  var name = componentClass.displayName || componentClass.name;
  var propTypes = componentClass.propTypes;
  if (propTypes) {
    currentlyValidatingElement = element;
    checkPropTypes(propTypes, element.props, 'prop', name, getStackAddendum);
    currentlyValidatingElement = null;
  } else if (componentClass.PropTypes !== undefined && !propTypesMisspellWarningShown) {
    propTypesMisspellWarningShown = true;
    warning(false, 'Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?', name || 'Unknown');
  }
  if (typeof componentClass.getDefaultProps === 'function') {
    !componentClass.getDefaultProps.isReactClassApproved ? warning(false, 'getDefaultProps is only used on classic React.createClass ' + 'definitions. Use a static property named `defaultProps` instead.') : void 0;
  }
}

/**
 * Given a fragment, validate that it can only be provided with fragment props
 * @param {ReactElement} fragment
 */
function validateFragmentProps(fragment) {
  currentlyValidatingElement = fragment;

  var keys = Object.keys(fragment.props);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (key !== 'children' && key !== 'key') {
      warning(false, 'Invalid prop `%s` supplied to `React.Fragment`. ' + 'React.Fragment can only have `key` and `children` props.%s', key, getStackAddendum());
      break;
    }
  }

  if (fragment.ref !== null) {
    warning(false, 'Invalid attribute `ref` supplied to `React.Fragment`.%s', getStackAddendum());
  }

  currentlyValidatingElement = null;
}

function createElementWithValidation(type, props, children) {
  var validType = isValidElementType(type);

  // We warn in this case but don't throw. We expect the element creation to
  // succeed and there will likely be errors in render.
  if (!validType) {
    var info = '';
    if (type === undefined || typeof type === 'object' && type !== null && Object.keys(type).length === 0) {
      info += ' You likely forgot to export your component from the file ' + "it's defined in, or you might have mixed up default and named imports.";
    }

    var sourceInfo = getSourceInfoErrorAddendum(props);
    if (sourceInfo) {
      info += sourceInfo;
    } else {
      info += getDeclarationErrorAddendum();
    }

    info += getStackAddendum() || '';

    var typeString = void 0;
    if (type === null) {
      typeString = 'null';
    } else if (Array.isArray(type)) {
      typeString = 'array';
    } else {
      typeString = typeof type;
    }

    warning(false, 'React.createElement: type is invalid -- expected a string (for ' + 'built-in components) or a class/function (for composite ' + 'components) but got: %s.%s', typeString, info);
  }

  var element = createElement.apply(this, arguments);

  // The result can be nullish if a mock or a custom function is used.
  // TODO: Drop this when these are no longer allowed as the type argument.
  if (element == null) {
    return element;
  }

  // Skip key warning if the type isn't valid since our key validation logic
  // doesn't expect a non-string/function type and can throw confusing errors.
  // We don't want exception behavior to differ between dev and prod.
  // (Rendering will throw with a helpful message and as soon as the type is
  // fixed, the key warnings will appear.)
  if (validType) {
    for (var i = 2; i < arguments.length; i++) {
      validateChildKeys(arguments[i], type);
    }
  }

  if (type === REACT_FRAGMENT_TYPE) {
    validateFragmentProps(element);
  } else {
    validatePropTypes(element);
  }

  return element;
}

function createFactoryWithValidation(type) {
  var validatedFactory = createElementWithValidation.bind(null, type);
  validatedFactory.type = type;
  // Legacy hook: remove it
  {
    Object.defineProperty(validatedFactory, 'type', {
      enumerable: false,
      get: function () {
        lowPriorityWarning$1(false, 'Factory.type is deprecated. Access the class directly ' + 'before passing it to createFactory.');
        Object.defineProperty(this, 'type', {
          value: type
        });
        return type;
      }
    });
  }

  return validatedFactory;
}

function cloneElementWithValidation(element, props, children) {
  var newElement = cloneElement.apply(this, arguments);
  for (var i = 2; i < arguments.length; i++) {
    validateChildKeys(arguments[i], newElement.type);
  }
  validatePropTypes(newElement);
  return newElement;
}

var React = {
  Children: {
    map: mapChildren,
    forEach: forEachChildren,
    count: countChildren,
    toArray: toArray,
    only: onlyChild
  },

  createRef: createRef,
  Component: Component,
  PureComponent: PureComponent,

  createContext: createContext,
  forwardRef: forwardRef,

  Fragment: REACT_FRAGMENT_TYPE,
  StrictMode: REACT_STRICT_MODE_TYPE,
  unstable_AsyncMode: REACT_ASYNC_MODE_TYPE,

  createElement: createElementWithValidation,
  cloneElement: cloneElementWithValidation,
  createFactory: createFactoryWithValidation,
  isValidElement: isValidElement,

  version: ReactVersion,

  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
    ReactCurrentOwner: ReactCurrentOwner,
    // Used by renderers to avoid bundling object-assign twice in UMD bundles:
    assign: _assign
  }
};

{
  _assign(React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, {
    // These should not be included in production.
    ReactDebugCurrentFrame: ReactDebugCurrentFrame,
    // Shim for React DOM 16.0.0 which still destructured (but not used) this.
    // TODO: remove in React 17.0.
    ReactComponentTreeHook: {}
  });
}



var React$2 = Object.freeze({
	default: React
});

var React$3 = ( React$2 && React ) || React$2;

// TODO: decide on the top-level export form.
// This is hacky but makes it work with both Rollup and Jest.
var react = React$3['default'] ? React$3['default'] : React$3;

module.exports = react;
  })();
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



var emptyFunction = __webpack_require__(4);
var invariant = __webpack_require__(3);
var warning = __webpack_require__(9);
var assign = __webpack_require__(6);

var ReactPropTypesSecret = __webpack_require__(18);
var checkPropTypes = __webpack_require__(17);

module.exports = function(isValidElement, throwOnDirectAccess) {
  /* global Symbol */
  var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

  /**
   * Returns the iterator method function contained on the iterable object.
   *
   * Be sure to invoke the function with the iterable as context:
   *
   *     var iteratorFn = getIteratorFn(myIterable);
   *     if (iteratorFn) {
   *       var iterator = iteratorFn.call(myIterable);
   *       ...
   *     }
   *
   * @param {?object} maybeIterable
   * @return {?function}
   */
  function getIteratorFn(maybeIterable) {
    var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
    if (typeof iteratorFn === 'function') {
      return iteratorFn;
    }
  }

  /**
   * Collection of methods that allow declaration and validation of props that are
   * supplied to React components. Example usage:
   *
   *   var Props = require('ReactPropTypes');
   *   var MyArticle = React.createClass({
   *     propTypes: {
   *       // An optional string prop named "description".
   *       description: Props.string,
   *
   *       // A required enum prop named "category".
   *       category: Props.oneOf(['News','Photos']).isRequired,
   *
   *       // A prop named "dialog" that requires an instance of Dialog.
   *       dialog: Props.instanceOf(Dialog).isRequired
   *     },
   *     render: function() { ... }
   *   });
   *
   * A more formal specification of how these methods are used:
   *
   *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
   *   decl := ReactPropTypes.{type}(.isRequired)?
   *
   * Each and every declaration produces a function with the same signature. This
   * allows the creation of custom validation functions. For example:
   *
   *  var MyLink = React.createClass({
   *    propTypes: {
   *      // An optional string or URI prop named "href".
   *      href: function(props, propName, componentName) {
   *        var propValue = props[propName];
   *        if (propValue != null && typeof propValue !== 'string' &&
   *            !(propValue instanceof URI)) {
   *          return new Error(
   *            'Expected a string or an URI for ' + propName + ' in ' +
   *            componentName
   *          );
   *        }
   *      }
   *    },
   *    render: function() {...}
   *  });
   *
   * @internal
   */

  var ANONYMOUS = '<<anonymous>>';

  // Important!
  // Keep this list in sync with production version in `./factoryWithThrowingShims.js`.
  var ReactPropTypes = {
    array: createPrimitiveTypeChecker('array'),
    bool: createPrimitiveTypeChecker('boolean'),
    func: createPrimitiveTypeChecker('function'),
    number: createPrimitiveTypeChecker('number'),
    object: createPrimitiveTypeChecker('object'),
    string: createPrimitiveTypeChecker('string'),
    symbol: createPrimitiveTypeChecker('symbol'),

    any: createAnyTypeChecker(),
    arrayOf: createArrayOfTypeChecker,
    element: createElementTypeChecker(),
    instanceOf: createInstanceTypeChecker,
    node: createNodeChecker(),
    objectOf: createObjectOfTypeChecker,
    oneOf: createEnumTypeChecker,
    oneOfType: createUnionTypeChecker,
    shape: createShapeTypeChecker,
    exact: createStrictShapeTypeChecker,
  };

  /**
   * inlined Object.is polyfill to avoid requiring consumers ship their own
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
   */
  /*eslint-disable no-self-compare*/
  function is(x, y) {
    // SameValue algorithm
    if (x === y) {
      // Steps 1-5, 7-10
      // Steps 6.b-6.e: +0 != -0
      return x !== 0 || 1 / x === 1 / y;
    } else {
      // Step 6.a: NaN == NaN
      return x !== x && y !== y;
    }
  }
  /*eslint-enable no-self-compare*/

  /**
   * We use an Error-like object for backward compatibility as people may call
   * PropTypes directly and inspect their output. However, we don't use real
   * Errors anymore. We don't inspect their stack anyway, and creating them
   * is prohibitively expensive if they are created too often, such as what
   * happens in oneOfType() for any type before the one that matched.
   */
  function PropTypeError(message) {
    this.message = message;
    this.stack = '';
  }
  // Make `instanceof Error` still work for returned errors.
  PropTypeError.prototype = Error.prototype;

  function createChainableTypeChecker(validate) {
    if (process.env.NODE_ENV !== 'production') {
      var manualPropTypeCallCache = {};
      var manualPropTypeWarningCount = 0;
    }
    function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
      componentName = componentName || ANONYMOUS;
      propFullName = propFullName || propName;

      if (secret !== ReactPropTypesSecret) {
        if (throwOnDirectAccess) {
          // New behavior only for users of `prop-types` package
          invariant(
            false,
            'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
            'Use `PropTypes.checkPropTypes()` to call them. ' +
            'Read more at http://fb.me/use-check-prop-types'
          );
        } else if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
          // Old behavior for people using React.PropTypes
          var cacheKey = componentName + ':' + propName;
          if (
            !manualPropTypeCallCache[cacheKey] &&
            // Avoid spamming the console because they are often not actionable except for lib authors
            manualPropTypeWarningCount < 3
          ) {
            warning(
              false,
              'You are manually calling a React.PropTypes validation ' +
              'function for the `%s` prop on `%s`. This is deprecated ' +
              'and will throw in the standalone `prop-types` package. ' +
              'You may be seeing this warning due to a third-party PropTypes ' +
              'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.',
              propFullName,
              componentName
            );
            manualPropTypeCallCache[cacheKey] = true;
            manualPropTypeWarningCount++;
          }
        }
      }
      if (props[propName] == null) {
        if (isRequired) {
          if (props[propName] === null) {
            return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));
          }
          return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));
        }
        return null;
      } else {
        return validate(props, propName, componentName, location, propFullName);
      }
    }

    var chainedCheckType = checkType.bind(null, false);
    chainedCheckType.isRequired = checkType.bind(null, true);

    return chainedCheckType;
  }

  function createPrimitiveTypeChecker(expectedType) {
    function validate(props, propName, componentName, location, propFullName, secret) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== expectedType) {
        // `propValue` being instance of, say, date/regexp, pass the 'object'
        // check, but we can offer a more precise error message here rather than
        // 'of type `object`'.
        var preciseType = getPreciseType(propValue);

        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createAnyTypeChecker() {
    return createChainableTypeChecker(emptyFunction.thatReturnsNull);
  }

  function createArrayOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
      }
      var propValue = props[propName];
      if (!Array.isArray(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
      }
      for (var i = 0; i < propValue.length; i++) {
        var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret);
        if (error instanceof Error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createElementTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      if (!isValidElement(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createInstanceTypeChecker(expectedClass) {
    function validate(props, propName, componentName, location, propFullName) {
      if (!(props[propName] instanceof expectedClass)) {
        var expectedClassName = expectedClass.name || ANONYMOUS;
        var actualClassName = getClassName(props[propName]);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createEnumTypeChecker(expectedValues) {
    if (!Array.isArray(expectedValues)) {
      process.env.NODE_ENV !== 'production' ? warning(false, 'Invalid argument supplied to oneOf, expected an instance of array.') : void 0;
      return emptyFunction.thatReturnsNull;
    }

    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      for (var i = 0; i < expectedValues.length; i++) {
        if (is(propValue, expectedValues[i])) {
          return null;
        }
      }

      var valuesString = JSON.stringify(expectedValues);
      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + propValue + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createObjectOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
      }
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
      }
      for (var key in propValue) {
        if (propValue.hasOwnProperty(key)) {
          var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
          if (error instanceof Error) {
            return error;
          }
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createUnionTypeChecker(arrayOfTypeCheckers) {
    if (!Array.isArray(arrayOfTypeCheckers)) {
      process.env.NODE_ENV !== 'production' ? warning(false, 'Invalid argument supplied to oneOfType, expected an instance of array.') : void 0;
      return emptyFunction.thatReturnsNull;
    }

    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
      var checker = arrayOfTypeCheckers[i];
      if (typeof checker !== 'function') {
        warning(
          false,
          'Invalid argument supplied to oneOfType. Expected an array of check functions, but ' +
          'received %s at index %s.',
          getPostfixForTypeWarning(checker),
          i
        );
        return emptyFunction.thatReturnsNull;
      }
    }

    function validate(props, propName, componentName, location, propFullName) {
      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
        var checker = arrayOfTypeCheckers[i];
        if (checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret) == null) {
          return null;
        }
      }

      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createNodeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      if (!isNode(props[propName])) {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
      }
      for (var key in shapeTypes) {
        var checker = shapeTypes[key];
        if (!checker) {
          continue;
        }
        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
        if (error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createStrictShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
      }
      // We need to check all keys in case some are required but missing from
      // props.
      var allKeys = assign({}, props[propName], shapeTypes);
      for (var key in allKeys) {
        var checker = shapeTypes[key];
        if (!checker) {
          return new PropTypeError(
            'Invalid ' + location + ' `' + propFullName + '` key `' + key + '` supplied to `' + componentName + '`.' +
            '\nBad object: ' + JSON.stringify(props[propName], null, '  ') +
            '\nValid keys: ' +  JSON.stringify(Object.keys(shapeTypes), null, '  ')
          );
        }
        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
        if (error) {
          return error;
        }
      }
      return null;
    }

    return createChainableTypeChecker(validate);
  }

  function isNode(propValue) {
    switch (typeof propValue) {
      case 'number':
      case 'string':
      case 'undefined':
        return true;
      case 'boolean':
        return !propValue;
      case 'object':
        if (Array.isArray(propValue)) {
          return propValue.every(isNode);
        }
        if (propValue === null || isValidElement(propValue)) {
          return true;
        }

        var iteratorFn = getIteratorFn(propValue);
        if (iteratorFn) {
          var iterator = iteratorFn.call(propValue);
          var step;
          if (iteratorFn !== propValue.entries) {
            while (!(step = iterator.next()).done) {
              if (!isNode(step.value)) {
                return false;
              }
            }
          } else {
            // Iterator will provide entry [k,v] tuples rather than values.
            while (!(step = iterator.next()).done) {
              var entry = step.value;
              if (entry) {
                if (!isNode(entry[1])) {
                  return false;
                }
              }
            }
          }
        } else {
          return false;
        }

        return true;
      default:
        return false;
    }
  }

  function isSymbol(propType, propValue) {
    // Native Symbol.
    if (propType === 'symbol') {
      return true;
    }

    // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'
    if (propValue['@@toStringTag'] === 'Symbol') {
      return true;
    }

    // Fallback for non-spec compliant Symbols which are polyfilled.
    if (typeof Symbol === 'function' && propValue instanceof Symbol) {
      return true;
    }

    return false;
  }

  // Equivalent of `typeof` but with special handling for array and regexp.
  function getPropType(propValue) {
    var propType = typeof propValue;
    if (Array.isArray(propValue)) {
      return 'array';
    }
    if (propValue instanceof RegExp) {
      // Old webkits (at least until Android 4.0) return 'function' rather than
      // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
      // passes PropTypes.object.
      return 'object';
    }
    if (isSymbol(propType, propValue)) {
      return 'symbol';
    }
    return propType;
  }

  // This handles more types than `getPropType`. Only used for error messages.
  // See `createPrimitiveTypeChecker`.
  function getPreciseType(propValue) {
    if (typeof propValue === 'undefined' || propValue === null) {
      return '' + propValue;
    }
    var propType = getPropType(propValue);
    if (propType === 'object') {
      if (propValue instanceof Date) {
        return 'date';
      } else if (propValue instanceof RegExp) {
        return 'regexp';
      }
    }
    return propType;
  }

  // Returns a string that is postfixed to a warning about an invalid type.
  // For example, "undefined" or "of type array"
  function getPostfixForTypeWarning(value) {
    var type = getPreciseType(value);
    switch (type) {
      case 'array':
      case 'object':
        return 'an ' + type;
      case 'boolean':
      case 'date':
      case 'regexp':
        return 'a ' + type;
      default:
        return type;
    }
  }

  // Returns class name of the object, if any.
  function getClassName(propValue) {
    if (!propValue.constructor || !propValue.constructor.name) {
      return ANONYMOUS;
    }
    return propValue.constructor.name;
  }

  ReactPropTypes.checkPropTypes = checkPropTypes;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



var emptyFunction = __webpack_require__(4);
var invariant = __webpack_require__(3);
var ReactPropTypesSecret = __webpack_require__(18);

module.exports = function() {
  function shim(props, propName, componentName, location, propFullName, secret) {
    if (secret === ReactPropTypesSecret) {
      // It is still safe when called from React.
      return;
    }
    invariant(
      false,
      'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
      'Use PropTypes.checkPropTypes() to call them. ' +
      'Read more at http://fb.me/use-check-prop-types'
    );
  };
  shim.isRequired = shim;
  function getShim() {
    return shim;
  };
  // Important!
  // Keep this list in sync with production version in `./factoryWithTypeCheckers.js`.
  var ReactPropTypes = {
    array: shim,
    bool: shim,
    func: shim,
    number: shim,
    object: shim,
    string: shim,
    symbol: shim,

    any: shim,
    arrayOf: getShim,
    element: shim,
    instanceOf: getShim,
    node: shim,
    objectOf: getShim,
    oneOf: getShim,
    oneOfType: getShim,
    shape: getShim,
    exact: getShim
  };

  ReactPropTypes.checkPropTypes = emptyFunction;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};


/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _v = __webpack_require__(28);

var _v2 = _interopRequireDefault(_v);

var _react = __webpack_require__(2);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(10);

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ValueSelector = function ValueSelector(props) {
  var value = props.value,
      options = props.options,
      className = props.className,
      handleOnChange = props.handleOnChange,
      title = props.title;


  return _react2.default.createElement(
    'select',
    { className: className,
      value: value,
      title: title,
      onChange: function onChange(e) {
        return handleOnChange(e.target.value);
      } },
    options.map(function (option) {
      return _react2.default.createElement(
        'option',
        { key: option.id || option.name, value: option.name },
        option.label
      );
    })
  );
};

ValueSelector.displayName = 'ValueSelector';

ValueSelector.propTypes = {
  value: _propTypes2.default.string,
  options: _propTypes2.default.array.isRequired,
  className: _propTypes2.default.string,
  handleOnChange: _propTypes2.default.func,
  title: _propTypes2.default.string
};

exports.default = ValueSelector;

/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {// Unique ID creation requires a high quality random # generator.  In the
// browser this is a little complicated due to unknown quality of Math.random()
// and inconsistent support for the `crypto` API.  We do the best we can via
// feature-detection
var rng;

var crypto = global.crypto || global.msCrypto; // for IE 11
if (crypto && crypto.getRandomValues) {
  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
  var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef
  rng = function whatwgRNG() {
    crypto.getRandomValues(rnds8);
    return rnds8;
  };
}

if (!rng) {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var rnds = new Array(16);
  rng = function() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return rnds;
  };
}

module.exports = rng;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(29)))

/***/ }),
/* 64 */
/***/ (function(module, exports) {

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  return bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]];
}

module.exports = bytesToUuid;


/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = __webpack_require__(2);

var _react2 = _interopRequireDefault(_react);

var _propTypes = __webpack_require__(10);

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ActionElement = function ActionElement(props) {
  var label = props.label,
      className = props.className,
      handleOnClick = props.handleOnClick,
      title = props.title;


  return _react2.default.createElement(
    'button',
    { className: className,
      title: title,
      onClick: function onClick(e) {
        return handleOnClick(e);
      } },
    label
  );
};

ActionElement.displayName = 'ActionElement';

ActionElement.propTypes = {
  label: _propTypes2.default.string,
  className: _propTypes2.default.string,
  handleOnClick: _propTypes2.default.func,
  title: _propTypes2.default.string
};

exports.default = ActionElement;

/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(2);

var _react2 = _interopRequireDefault(_react);

var _Rule = __webpack_require__(67);

var _Rule2 = _interopRequireDefault(_Rule);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RuleGroup = function (_React$Component) {
  _inherits(RuleGroup, _React$Component);

  function RuleGroup() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, RuleGroup);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = RuleGroup.__proto__ || Object.getPrototypeOf(RuleGroup)).call.apply(_ref, [this].concat(args))), _this), _this.onCombinatorChange = function (value) {
      var onPropChange = _this.props.schema.onPropChange;


      onPropChange('combinator', value, _this.props.id);
    }, _this.addRule = function (event) {
      event.preventDefault();
      event.stopPropagation();

      var _this$props$schema = _this.props.schema,
          createRule = _this$props$schema.createRule,
          onRuleAdd = _this$props$schema.onRuleAdd;


      var newRule = createRule();
      onRuleAdd(newRule, _this.props.id);
    }, _this.addGroup = function (event) {
      event.preventDefault();
      event.stopPropagation();

      var _this$props$schema2 = _this.props.schema,
          createRuleGroup = _this$props$schema2.createRuleGroup,
          onGroupAdd = _this$props$schema2.onGroupAdd;

      var newGroup = createRuleGroup();
      onGroupAdd(newGroup, _this.props.id);
    }, _this.removeGroup = function (event) {
      event.preventDefault();
      event.stopPropagation();

      _this.props.schema.onGroupRemove(_this.props.id, _this.props.parentId);
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(RuleGroup, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          combinator = _props.combinator,
          rules = _props.rules,
          translations = _props.translations,
          _props$schema = _props.schema,
          combinators = _props$schema.combinators,
          controls = _props$schema.controls,
          onRuleRemove = _props$schema.onRuleRemove,
          isRuleGroup = _props$schema.isRuleGroup,
          getLevel = _props$schema.getLevel,
          classNames = _props$schema.classNames;

      var level = getLevel(this.props.id);
      return _react2.default.createElement(
        'div',
        { className: 'ruleGroup ' + classNames.ruleGroup },
        _react2.default.createElement(controls.combinatorSelector, {
          options: combinators,
          value: combinator,
          title: translations.combinators.title,
          className: 'ruleGroup-combinators ' + classNames.combinators,
          handleOnChange: this.onCombinatorChange,
          rules: rules,
          level: level
        }),
        _react2.default.createElement(controls.addRuleAction, {
          label: translations.addRule.label,
          title: translations.addRule.title,
          className: 'ruleGroup-addRule ' + classNames.addRule,
          handleOnClick: this.addRule,
          rules: rules,
          level: level
        }),
        _react2.default.createElement(controls.addGroupAction, {
          label: translations.addGroup.label,
          title: translations.addGroup.title,
          className: 'ruleGroup-addGroup ' + classNames.addGroup,
          handleOnClick: this.addGroup,
          rules: rules,
          level: level
        }),
        this.hasParentGroup() ? _react2.default.createElement(controls.removeGroupAction, {
          label: translations.removeGroup.label,
          title: translations.removeGroup.title,
          className: 'ruleGroup-remove ' + classNames.removeGroup,
          handleOnClick: this.removeGroup,
          rules: rules,
          level: level
        }) : null,
        rules.map(function (r) {
          return isRuleGroup(r) ? _react2.default.createElement(RuleGroup, {
            key: r.id,
            id: r.id,
            schema: _this2.props.schema,
            parentId: _this2.props.id,
            combinator: r.combinator,
            translations: _this2.props.translations,
            rules: r.rules
          }) : _react2.default.createElement(_Rule2.default, {
            key: r.id,
            id: r.id,
            dataType: r.dataType,
            field: r.field,
            value: r.value,
            operator: r.operator,
            schema: _this2.props.schema,
            parentId: _this2.props.id,
            translations: _this2.props.translations,
            onRuleRemove: onRuleRemove
          });
        })
      );
    }
  }, {
    key: 'hasParentGroup',
    value: function hasParentGroup() {
      return this.props.parentId;
    }
  }], [{
    key: 'defaultProps',
    get: function get() {
      return {
        id: null,
        parentId: null,
        rules: [],
        combinator: 'and',
        schema: {}
      };
    }
  }]);

  return RuleGroup;
}(_react2.default.Component);

exports.default = RuleGroup;

/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(2);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Rule = function (_React$Component) {
  _inherits(Rule, _React$Component);

  function Rule() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Rule);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Rule.__proto__ || Object.getPrototypeOf(Rule)).call.apply(_ref, [this].concat(args))), _this), _this.onDataTypeChange = function (value) {
      _this.onElementChanged('dataType', value);
    }, _this.onFieldChanged = function (value) {
      _this.onElementChanged('field', value);
    }, _this.onOperatorChanged = function (value) {
      _this.onElementChanged('operator', value);
    }, _this.onValueChanged = function (value) {
      _this.onElementChanged('value', value);
    }, _this.onElementChanged = function (property, value) {
      var _this$props = _this.props,
          id = _this$props.id,
          onPropChange = _this$props.schema.onPropChange;


      onPropChange(property, value, id);
    }, _this.removeRule = function (event) {
      event.preventDefault();
      event.stopPropagation();

      _this.props.schema.onRuleRemove(_this.props.id, _this.props.parentId);
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Rule, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          dataType = _props.dataType,
          field = _props.field,
          operator = _props.operator,
          value = _props.value,
          translations = _props.translations,
          _props$schema = _props.schema,
          dataTypes = _props$schema.dataTypes,
          fields = _props$schema.fields,
          controls = _props$schema.controls,
          getOperators = _props$schema.getOperators,
          getLevel = _props$schema.getLevel,
          classNames = _props$schema.classNames;

      var level = getLevel(this.props.id);
      return _react2.default.createElement(
        'div',
        { className: 'rule ' + classNames.rule },
        _react2.default.createElement(controls.dataTypeSelector, {
          title: translations.dataTypes.title,
          options: dataTypes,
          value: dataType,
          className: 'rule-operators ' + classNames.dataTypes,
          handleOnChange: this.onDataTypeChange,
          level: level
        }),
        _react2.default.createElement(controls.fieldSelector, {
          options: fields,
          title: translations.fields.title,
          value: field,
          className: 'rule-fields ' + classNames.fields,
          handleOnChange: this.onFieldChanged,
          level: level
        }),
        _react2.default.createElement(controls.operatorSelector, {
          field: field,
          title: translations.operators.title,
          options: getOperators(field),
          value: operator,
          className: 'rule-operators ' + classNames.operators,
          handleOnChange: this.onOperatorChanged,
          level: level
        }),
        _react2.default.createElement(controls.valueEditor, {
          field: field,
          title: translations.value.title,
          operator: operator,
          value: value,
          className: 'rule-value ' + classNames.value,
          handleOnChange: this.onValueChanged,
          level: level
        }),
        _react2.default.createElement(controls.removeRuleAction, {
          label: translations.removeRule.label,
          title: translations.removeRule.title,
          className: 'rule-remove ' + classNames.removeRule,
          handleOnClick: this.removeRule,
          level: level
        })
      );
    }
  }], [{
    key: 'defaultProps',
    get: function get() {
      return {
        id: null,
        parentId: null,
        dataType: null,
        field: null,
        operator: null,
        value: null,
        schema: null
      };
    }
  }]);

  return Rule;
}(_react2.default.Component);

exports.default = Rule;

/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

var baseClone = __webpack_require__(69);

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG = 1,
    CLONE_SYMBOLS_FLAG = 4;

/**
 * This method is like `_.clone` except that it recursively clones `value`.
 *
 * @static
 * @memberOf _
 * @since 1.0.0
 * @category Lang
 * @param {*} value The value to recursively clone.
 * @returns {*} Returns the deep cloned value.
 * @see _.clone
 * @example
 *
 * var objects = [{ 'a': 1 }, { 'b': 2 }];
 *
 * var deep = _.cloneDeep(objects);
 * console.log(deep[0] === objects[0]);
 * // => false
 */
function cloneDeep(value) {
  return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
}

module.exports = cloneDeep;


/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

var Stack = __webpack_require__(70),
    arrayEach = __webpack_require__(100),
    assignValue = __webpack_require__(34),
    baseAssign = __webpack_require__(102),
    baseAssignIn = __webpack_require__(114),
    cloneBuffer = __webpack_require__(117),
    copyArray = __webpack_require__(118),
    copySymbols = __webpack_require__(119),
    copySymbolsIn = __webpack_require__(121),
    getAllKeys = __webpack_require__(122),
    getAllKeysIn = __webpack_require__(123),
    getTag = __webpack_require__(124),
    initCloneArray = __webpack_require__(129),
    initCloneByTag = __webpack_require__(130),
    initCloneObject = __webpack_require__(142),
    isArray = __webpack_require__(23),
    isBuffer = __webpack_require__(37),
    isObject = __webpack_require__(7),
    keys = __webpack_require__(21);

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG = 1,
    CLONE_FLAT_FLAG = 2,
    CLONE_SYMBOLS_FLAG = 4;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values supported by `_.clone`. */
var cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] =
cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
cloneableTags[boolTag] = cloneableTags[dateTag] =
cloneableTags[float32Tag] = cloneableTags[float64Tag] =
cloneableTags[int8Tag] = cloneableTags[int16Tag] =
cloneableTags[int32Tag] = cloneableTags[mapTag] =
cloneableTags[numberTag] = cloneableTags[objectTag] =
cloneableTags[regexpTag] = cloneableTags[setTag] =
cloneableTags[stringTag] = cloneableTags[symbolTag] =
cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] =
cloneableTags[weakMapTag] = false;

/**
 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
 * traversed objects.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Deep clone
 *  2 - Flatten inherited properties
 *  4 - Clone symbols
 * @param {Function} [customizer] The function to customize cloning.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The parent object of `value`.
 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone(value, bitmask, customizer, key, object, stack) {
  var result,
      isDeep = bitmask & CLONE_DEEP_FLAG,
      isFlat = bitmask & CLONE_FLAT_FLAG,
      isFull = bitmask & CLONE_SYMBOLS_FLAG;

  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!isObject(value)) {
    return value;
  }
  var isArr = isArray(value);
  if (isArr) {
    result = initCloneArray(value);
    if (!isDeep) {
      return copyArray(value, result);
    }
  } else {
    var tag = getTag(value),
        isFunc = tag == funcTag || tag == genTag;

    if (isBuffer(value)) {
      return cloneBuffer(value, isDeep);
    }
    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
      result = (isFlat || isFunc) ? {} : initCloneObject(value);
      if (!isDeep) {
        return isFlat
          ? copySymbolsIn(value, baseAssignIn(result, value))
          : copySymbols(value, baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = initCloneByTag(value, tag, baseClone, isDeep);
    }
  }
  // Check for circular references and return its corresponding clone.
  stack || (stack = new Stack);
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);

  var keysFunc = isFull
    ? (isFlat ? getAllKeysIn : getAllKeys)
    : (isFlat ? keysIn : keys);

  var props = isArr ? undefined : keysFunc(value);
  arrayEach(props || value, function(subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    }
    // Recursively populate clone (susceptible to call stack limits).
    assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
  });
  return result;
}

module.exports = baseClone;


/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

var ListCache = __webpack_require__(11),
    stackClear = __webpack_require__(76),
    stackDelete = __webpack_require__(77),
    stackGet = __webpack_require__(78),
    stackHas = __webpack_require__(79),
    stackSet = __webpack_require__(80);

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

module.exports = Stack;


/***/ }),
/* 71 */
/***/ (function(module, exports) {

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

module.exports = listCacheClear;


/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

var assocIndexOf = __webpack_require__(12);

/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

module.exports = listCacheDelete;


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

var assocIndexOf = __webpack_require__(12);

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

module.exports = listCacheGet;


/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

var assocIndexOf = __webpack_require__(12);

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

module.exports = listCacheHas;


/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

var assocIndexOf = __webpack_require__(12);

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

module.exports = listCacheSet;


/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

var ListCache = __webpack_require__(11);

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
  this.size = 0;
}

module.exports = stackClear;


/***/ }),
/* 77 */
/***/ (function(module, exports) {

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

module.exports = stackDelete;


/***/ }),
/* 78 */
/***/ (function(module, exports) {

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

module.exports = stackGet;


/***/ }),
/* 79 */
/***/ (function(module, exports) {

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

module.exports = stackHas;


/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

var ListCache = __webpack_require__(11),
    Map = __webpack_require__(19),
    MapCache = __webpack_require__(87);

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

module.exports = stackSet;


/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

var isFunction = __webpack_require__(31),
    isMasked = __webpack_require__(84),
    isObject = __webpack_require__(7),
    toSource = __webpack_require__(33);

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

module.exports = baseIsNative;


/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(20);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

module.exports = getRawTag;


/***/ }),
/* 83 */
/***/ (function(module, exports) {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;


/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

var coreJsData = __webpack_require__(85);

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

module.exports = isMasked;


/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__(1);

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

module.exports = coreJsData;


/***/ }),
/* 86 */
/***/ (function(module, exports) {

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

module.exports = getValue;


/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

var mapCacheClear = __webpack_require__(88),
    mapCacheDelete = __webpack_require__(95),
    mapCacheGet = __webpack_require__(97),
    mapCacheHas = __webpack_require__(98),
    mapCacheSet = __webpack_require__(99);

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

module.exports = MapCache;


/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

var Hash = __webpack_require__(89),
    ListCache = __webpack_require__(11),
    Map = __webpack_require__(19);

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

module.exports = mapCacheClear;


/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

var hashClear = __webpack_require__(90),
    hashDelete = __webpack_require__(91),
    hashGet = __webpack_require__(92),
    hashHas = __webpack_require__(93),
    hashSet = __webpack_require__(94);

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

module.exports = Hash;


/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

var nativeCreate = __webpack_require__(14);

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

module.exports = hashClear;


/***/ }),
/* 91 */
/***/ (function(module, exports) {

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = hashDelete;


/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

var nativeCreate = __webpack_require__(14);

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

module.exports = hashGet;


/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

var nativeCreate = __webpack_require__(14);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
}

module.exports = hashHas;


/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

var nativeCreate = __webpack_require__(14);

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

module.exports = hashSet;


/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

var getMapData = __webpack_require__(15);

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = mapCacheDelete;


/***/ }),
/* 96 */
/***/ (function(module, exports) {

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

module.exports = isKeyable;


/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

var getMapData = __webpack_require__(15);

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

module.exports = mapCacheGet;


/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

var getMapData = __webpack_require__(15);

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

module.exports = mapCacheHas;


/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

var getMapData = __webpack_require__(15);

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

module.exports = mapCacheSet;


/***/ }),
/* 100 */
/***/ (function(module, exports) {

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

module.exports = arrayEach;


/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(5);

var defineProperty = (function() {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

module.exports = defineProperty;


/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

var copyObject = __webpack_require__(16),
    keys = __webpack_require__(21);

/**
 * The base implementation of `_.assign` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return object && copyObject(source, keys(source), object);
}

module.exports = baseAssign;


/***/ }),
/* 103 */
/***/ (function(module, exports) {

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

module.exports = baseTimes;


/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

var baseIsArguments = __webpack_require__(105),
    isObjectLike = __webpack_require__(22);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

module.exports = isArguments;


/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(13),
    isObjectLike = __webpack_require__(22);

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

module.exports = baseIsArguments;


/***/ }),
/* 106 */
/***/ (function(module, exports) {

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = stubFalse;


/***/ }),
/* 107 */
/***/ (function(module, exports) {

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

module.exports = isIndex;


/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

var baseIsTypedArray = __webpack_require__(109),
    baseUnary = __webpack_require__(110),
    nodeUtil = __webpack_require__(111);

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

module.exports = isTypedArray;


/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(13),
    isLength = __webpack_require__(38),
    isObjectLike = __webpack_require__(22);

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

module.exports = baseIsTypedArray;


/***/ }),
/* 110 */
/***/ (function(module, exports) {

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

module.exports = baseUnary;


/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {var freeGlobal = __webpack_require__(32);

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

module.exports = nodeUtil;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(24)(module)))

/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

var isPrototype = __webpack_require__(25),
    nativeKeys = __webpack_require__(113);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

module.exports = baseKeys;


/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

var overArg = __webpack_require__(39);

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object);

module.exports = nativeKeys;


/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

var copyObject = __webpack_require__(16),
    keysIn = __webpack_require__(41);

/**
 * The base implementation of `_.assignIn` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssignIn(object, source) {
  return object && copyObject(source, keysIn(source), object);
}

module.exports = baseAssignIn;


/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(7),
    isPrototype = __webpack_require__(25),
    nativeKeysIn = __webpack_require__(116);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeysIn(object) {
  if (!isObject(object)) {
    return nativeKeysIn(object);
  }
  var isProto = isPrototype(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = baseKeysIn;


/***/ }),
/* 116 */
/***/ (function(module, exports) {

/**
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}

module.exports = nativeKeysIn;


/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {var root = __webpack_require__(1);

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined,
    allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;

/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var length = buffer.length,
      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

  buffer.copy(result);
  return result;
}

module.exports = cloneBuffer;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(24)(module)))

/***/ }),
/* 118 */
/***/ (function(module, exports) {

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

module.exports = copyArray;


/***/ }),
/* 119 */
/***/ (function(module, exports, __webpack_require__) {

var copyObject = __webpack_require__(16),
    getSymbols = __webpack_require__(26);

/**
 * Copies own symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbols(source, object) {
  return copyObject(source, getSymbols(source), object);
}

module.exports = copySymbols;


/***/ }),
/* 120 */
/***/ (function(module, exports) {

/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

module.exports = arrayFilter;


/***/ }),
/* 121 */
/***/ (function(module, exports, __webpack_require__) {

var copyObject = __webpack_require__(16),
    getSymbolsIn = __webpack_require__(43);

/**
 * Copies own and inherited symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbolsIn(source, object) {
  return copyObject(source, getSymbolsIn(source), object);
}

module.exports = copySymbolsIn;


/***/ }),
/* 122 */
/***/ (function(module, exports, __webpack_require__) {

var baseGetAllKeys = __webpack_require__(46),
    getSymbols = __webpack_require__(26),
    keys = __webpack_require__(21);

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

module.exports = getAllKeys;


/***/ }),
/* 123 */
/***/ (function(module, exports, __webpack_require__) {

var baseGetAllKeys = __webpack_require__(46),
    getSymbolsIn = __webpack_require__(43),
    keysIn = __webpack_require__(41);

/**
 * Creates an array of own and inherited enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeysIn(object) {
  return baseGetAllKeys(object, keysIn, getSymbolsIn);
}

module.exports = getAllKeysIn;


/***/ }),
/* 124 */
/***/ (function(module, exports, __webpack_require__) {

var DataView = __webpack_require__(125),
    Map = __webpack_require__(19),
    Promise = __webpack_require__(126),
    Set = __webpack_require__(127),
    WeakMap = __webpack_require__(128),
    baseGetTag = __webpack_require__(13),
    toSource = __webpack_require__(33);

/** `Object#toString` result references. */
var mapTag = '[object Map]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    setTag = '[object Set]',
    weakMapTag = '[object WeakMap]';

var dataViewTag = '[object DataView]';

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = baseGetTag(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

module.exports = getTag;


/***/ }),
/* 125 */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(5),
    root = __webpack_require__(1);

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView');

module.exports = DataView;


/***/ }),
/* 126 */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(5),
    root = __webpack_require__(1);

/* Built-in method references that are verified to be native. */
var Promise = getNative(root, 'Promise');

module.exports = Promise;


/***/ }),
/* 127 */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(5),
    root = __webpack_require__(1);

/* Built-in method references that are verified to be native. */
var Set = getNative(root, 'Set');

module.exports = Set;


/***/ }),
/* 128 */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(5),
    root = __webpack_require__(1);

/* Built-in method references that are verified to be native. */
var WeakMap = getNative(root, 'WeakMap');

module.exports = WeakMap;


/***/ }),
/* 129 */
/***/ (function(module, exports) {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function initCloneArray(array) {
  var length = array.length,
      result = array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

module.exports = initCloneArray;


/***/ }),
/* 130 */
/***/ (function(module, exports, __webpack_require__) {

var cloneArrayBuffer = __webpack_require__(27),
    cloneDataView = __webpack_require__(132),
    cloneMap = __webpack_require__(133),
    cloneRegExp = __webpack_require__(136),
    cloneSet = __webpack_require__(137),
    cloneSymbol = __webpack_require__(140),
    cloneTypedArray = __webpack_require__(141);

/** `Object#toString` result references. */
var boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, cloneFunc, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag:
      return cloneArrayBuffer(object);

    case boolTag:
    case dateTag:
      return new Ctor(+object);

    case dataViewTag:
      return cloneDataView(object, isDeep);

    case float32Tag: case float64Tag:
    case int8Tag: case int16Tag: case int32Tag:
    case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
      return cloneTypedArray(object, isDeep);

    case mapTag:
      return cloneMap(object, isDeep, cloneFunc);

    case numberTag:
    case stringTag:
      return new Ctor(object);

    case regexpTag:
      return cloneRegExp(object);

    case setTag:
      return cloneSet(object, isDeep, cloneFunc);

    case symbolTag:
      return cloneSymbol(object);
  }
}

module.exports = initCloneByTag;


/***/ }),
/* 131 */
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__(1);

/** Built-in value references. */
var Uint8Array = root.Uint8Array;

module.exports = Uint8Array;


/***/ }),
/* 132 */
/***/ (function(module, exports, __webpack_require__) {

var cloneArrayBuffer = __webpack_require__(27);

/**
 * Creates a clone of `dataView`.
 *
 * @private
 * @param {Object} dataView The data view to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned data view.
 */
function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

module.exports = cloneDataView;


/***/ }),
/* 133 */
/***/ (function(module, exports, __webpack_require__) {

var addMapEntry = __webpack_require__(134),
    arrayReduce = __webpack_require__(47),
    mapToArray = __webpack_require__(135);

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG = 1;

/**
 * Creates a clone of `map`.
 *
 * @private
 * @param {Object} map The map to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned map.
 */
function cloneMap(map, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(mapToArray(map), CLONE_DEEP_FLAG) : mapToArray(map);
  return arrayReduce(array, addMapEntry, new map.constructor);
}

module.exports = cloneMap;


/***/ }),
/* 134 */
/***/ (function(module, exports) {

/**
 * Adds the key-value `pair` to `map`.
 *
 * @private
 * @param {Object} map The map to modify.
 * @param {Array} pair The key-value pair to add.
 * @returns {Object} Returns `map`.
 */
function addMapEntry(map, pair) {
  // Don't return `map.set` because it's not chainable in IE 11.
  map.set(pair[0], pair[1]);
  return map;
}

module.exports = addMapEntry;


/***/ }),
/* 135 */
/***/ (function(module, exports) {

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

module.exports = mapToArray;


/***/ }),
/* 136 */
/***/ (function(module, exports) {

/** Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;

/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} regexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */
function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

module.exports = cloneRegExp;


/***/ }),
/* 137 */
/***/ (function(module, exports, __webpack_require__) {

var addSetEntry = __webpack_require__(138),
    arrayReduce = __webpack_require__(47),
    setToArray = __webpack_require__(139);

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG = 1;

/**
 * Creates a clone of `set`.
 *
 * @private
 * @param {Object} set The set to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned set.
 */
function cloneSet(set, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(setToArray(set), CLONE_DEEP_FLAG) : setToArray(set);
  return arrayReduce(array, addSetEntry, new set.constructor);
}

module.exports = cloneSet;


/***/ }),
/* 138 */
/***/ (function(module, exports) {

/**
 * Adds `value` to `set`.
 *
 * @private
 * @param {Object} set The set to modify.
 * @param {*} value The value to add.
 * @returns {Object} Returns `set`.
 */
function addSetEntry(set, value) {
  // Don't return `set.add` because it's not chainable in IE 11.
  set.add(value);
  return set;
}

module.exports = addSetEntry;


/***/ }),
/* 139 */
/***/ (function(module, exports) {

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

module.exports = setToArray;


/***/ }),
/* 140 */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(20);

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a clone of the `symbol` object.
 *
 * @private
 * @param {Object} symbol The symbol object to clone.
 * @returns {Object} Returns the cloned symbol object.
 */
function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}

module.exports = cloneSymbol;


/***/ }),
/* 141 */
/***/ (function(module, exports, __webpack_require__) {

var cloneArrayBuffer = __webpack_require__(27);

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

module.exports = cloneTypedArray;


/***/ }),
/* 142 */
/***/ (function(module, exports, __webpack_require__) {

var baseCreate = __webpack_require__(143),
    getPrototype = __webpack_require__(45),
    isPrototype = __webpack_require__(25);

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return (typeof object.constructor == 'function' && !isPrototype(object))
    ? baseCreate(getPrototype(object))
    : {};
}

module.exports = initCloneObject;


/***/ }),
/* 143 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(7);

/** Built-in value references. */
var objectCreate = Object.create;

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} proto The object to inherit from.
 * @returns {Object} Returns the new object.
 */
var baseCreate = (function() {
  function object() {}
  return function(proto) {
    if (!isObject(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object;
    object.prototype = undefined;
    return result;
  };
}());

module.exports = baseCreate;


/***/ }),
/* 144 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

function checkDCE() {
  /* global __REACT_DEVTOOLS_GLOBAL_HOOK__ */
  if (
    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined' ||
    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== 'function'
  ) {
    return;
  }
  if (process.env.NODE_ENV !== 'production') {
    // This branch is unreachable because this function is only called
    // in production, but the condition is true only in development.
    // Therefore if the branch is still here, dead code elimination wasn't
    // properly applied.
    // Don't change the message. React DevTools relies on it. Also make sure
    // this message doesn't occur elsewhere in this function, or it will cause
    // a false positive.
    throw new Error('^_^');
  }
  try {
    // Verify that the code above has been dead code eliminated (DCE'd).
    __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
  } catch (err) {
    // DevTools shouldn't crash React, no matter what.
    // We should still report in case we break this code.
    console.error(err);
  }
}

if (process.env.NODE_ENV === 'production') {
  // DCE check should happen before ReactDOM bundle executes so that
  // DevTools can report bad minification during injection.
  checkDCE();
  module.exports = __webpack_require__(145);
} else {
  module.exports = __webpack_require__(148);
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 145 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/** @license React v16.3.2
 * react-dom.production.min.js
 *
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/*
 Modernizr 3.0.0pre (Custom Build) | MIT
*/
var ba=__webpack_require__(3),ea=__webpack_require__(2),m=__webpack_require__(48),A=__webpack_require__(6),C=__webpack_require__(4),fa=__webpack_require__(49),ha=__webpack_require__(50),ja=__webpack_require__(51),ka=__webpack_require__(8);
function D(a){for(var b=arguments.length-1,c="http://reactjs.org/docs/error-decoder.html?invariant\x3d"+a,d=0;d<b;d++)c+="\x26args[]\x3d"+encodeURIComponent(arguments[d+1]);ba(!1,"Minified React error #"+a+"; visit %s for the full message or use the non-minified dev environment for full errors and additional helpful warnings. ",c)}ea?void 0:D("227");
function ma(a,b,c,d,e,f,h,g,k){this._hasCaughtError=!1;this._caughtError=null;var v=Array.prototype.slice.call(arguments,3);try{b.apply(c,v)}catch(l){this._caughtError=l,this._hasCaughtError=!0}}
var E={_caughtError:null,_hasCaughtError:!1,_rethrowError:null,_hasRethrowError:!1,invokeGuardedCallback:function(a,b,c,d,e,f,h,g,k){ma.apply(E,arguments)},invokeGuardedCallbackAndCatchFirstError:function(a,b,c,d,e,f,h,g,k){E.invokeGuardedCallback.apply(this,arguments);if(E.hasCaughtError()){var v=E.clearCaughtError();E._hasRethrowError||(E._hasRethrowError=!0,E._rethrowError=v)}},rethrowCaughtError:function(){return na.apply(E,arguments)},hasCaughtError:function(){return E._hasCaughtError},clearCaughtError:function(){if(E._hasCaughtError){var a=
E._caughtError;E._caughtError=null;E._hasCaughtError=!1;return a}D("198")}};function na(){if(E._hasRethrowError){var a=E._rethrowError;E._rethrowError=null;E._hasRethrowError=!1;throw a;}}var oa=null,pa={};
function qa(){if(oa)for(var a in pa){var b=pa[a],c=oa.indexOf(a);-1<c?void 0:D("96",a);if(!ra[c]){b.extractEvents?void 0:D("97",a);ra[c]=b;c=b.eventTypes;for(var d in c){var e=void 0;var f=c[d],h=b,g=d;sa.hasOwnProperty(g)?D("99",g):void 0;sa[g]=f;var k=f.phasedRegistrationNames;if(k){for(e in k)k.hasOwnProperty(e)&&ta(k[e],h,g);e=!0}else f.registrationName?(ta(f.registrationName,h,g),e=!0):e=!1;e?void 0:D("98",d,a)}}}}
function ta(a,b,c){ua[a]?D("100",a):void 0;ua[a]=b;va[a]=b.eventTypes[c].dependencies}var ra=[],sa={},ua={},va={};function wa(a){oa?D("101"):void 0;oa=Array.prototype.slice.call(a);qa()}function xa(a){var b=!1,c;for(c in a)if(a.hasOwnProperty(c)){var d=a[c];pa.hasOwnProperty(c)&&pa[c]===d||(pa[c]?D("102",c):void 0,pa[c]=d,b=!0)}b&&qa()}
var Ca=Object.freeze({plugins:ra,eventNameDispatchConfigs:sa,registrationNameModules:ua,registrationNameDependencies:va,possibleRegistrationNames:null,injectEventPluginOrder:wa,injectEventPluginsByName:xa}),Da=null,Ea=null,Fa=null;function Ga(a,b,c,d){b=a.type||"unknown-event";a.currentTarget=Fa(d);E.invokeGuardedCallbackAndCatchFirstError(b,c,void 0,a);a.currentTarget=null}
function Ha(a,b){null==b?D("30"):void 0;if(null==a)return b;if(Array.isArray(a)){if(Array.isArray(b))return a.push.apply(a,b),a;a.push(b);return a}return Array.isArray(b)?[a].concat(b):[a,b]}function Ia(a,b,c){Array.isArray(a)?a.forEach(b,c):a&&b.call(c,a)}var Ja=null;
function Ka(a,b){if(a){var c=a._dispatchListeners,d=a._dispatchInstances;if(Array.isArray(c))for(var e=0;e<c.length&&!a.isPropagationStopped();e++)Ga(a,b,c[e],d[e]);else c&&Ga(a,b,c,d);a._dispatchListeners=null;a._dispatchInstances=null;a.isPersistent()||a.constructor.release(a)}}function La(a){return Ka(a,!0)}function Ma(a){return Ka(a,!1)}var Na={injectEventPluginOrder:wa,injectEventPluginsByName:xa};
function Oa(a,b){var c=a.stateNode;if(!c)return null;var d=Da(c);if(!d)return null;c=d[b];a:switch(b){case "onClick":case "onClickCapture":case "onDoubleClick":case "onDoubleClickCapture":case "onMouseDown":case "onMouseDownCapture":case "onMouseMove":case "onMouseMoveCapture":case "onMouseUp":case "onMouseUpCapture":(d=!d.disabled)||(a=a.type,d=!("button"===a||"input"===a||"select"===a||"textarea"===a));a=!d;break a;default:a=!1}if(a)return null;c&&"function"!==typeof c?D("231",b,typeof c):void 0;
return c}function Pa(a,b){null!==a&&(Ja=Ha(Ja,a));a=Ja;Ja=null;a&&(b?Ia(a,La):Ia(a,Ma),Ja?D("95"):void 0,E.rethrowCaughtError())}function Qa(a,b,c,d){for(var e=null,f=0;f<ra.length;f++){var h=ra[f];h&&(h=h.extractEvents(a,b,c,d))&&(e=Ha(e,h))}Pa(e,!1)}var Ra=Object.freeze({injection:Na,getListener:Oa,runEventsInBatch:Pa,runExtractedEventsInBatch:Qa}),Sa=Math.random().toString(36).slice(2),F="__reactInternalInstance$"+Sa,Ta="__reactEventHandlers$"+Sa;
function Ua(a){if(a[F])return a[F];for(;!a[F];)if(a.parentNode)a=a.parentNode;else return null;a=a[F];return 5===a.tag||6===a.tag?a:null}function Va(a){if(5===a.tag||6===a.tag)return a.stateNode;D("33")}function Xa(a){return a[Ta]||null}var bb=Object.freeze({precacheFiberNode:function(a,b){b[F]=a},getClosestInstanceFromNode:Ua,getInstanceFromNode:function(a){a=a[F];return!a||5!==a.tag&&6!==a.tag?null:a},getNodeFromInstance:Va,getFiberCurrentPropsFromNode:Xa,updateFiberProps:function(a,b){a[Ta]=b}});
function L(a){do a=a["return"];while(a&&5!==a.tag);return a?a:null}function cb(a,b,c){for(var d=[];a;)d.push(a),a=L(a);for(a=d.length;0<a--;)b(d[a],"captured",c);for(a=0;a<d.length;a++)b(d[a],"bubbled",c)}function db(a,b,c){if(b=Oa(a,c.dispatchConfig.phasedRegistrationNames[b]))c._dispatchListeners=Ha(c._dispatchListeners,b),c._dispatchInstances=Ha(c._dispatchInstances,a)}function eb(a){a&&a.dispatchConfig.phasedRegistrationNames&&cb(a._targetInst,db,a)}
function fb(a){if(a&&a.dispatchConfig.phasedRegistrationNames){var b=a._targetInst;b=b?L(b):null;cb(b,db,a)}}function gb(a,b,c){a&&c&&c.dispatchConfig.registrationName&&(b=Oa(a,c.dispatchConfig.registrationName))&&(c._dispatchListeners=Ha(c._dispatchListeners,b),c._dispatchInstances=Ha(c._dispatchInstances,a))}function hb(a){a&&a.dispatchConfig.registrationName&&gb(a._targetInst,null,a)}function ib(a){Ia(a,eb)}
function jb(a,b,c,d){if(c&&d)a:{var e=c;for(var f=d,h=0,g=e;g;g=L(g))h++;g=0;for(var k=f;k;k=L(k))g++;for(;0<h-g;)e=L(e),h--;for(;0<g-h;)f=L(f),g--;for(;h--;){if(e===f||e===f.alternate)break a;e=L(e);f=L(f)}e=null}else e=null;f=e;for(e=[];c&&c!==f;){h=c.alternate;if(null!==h&&h===f)break;e.push(c);c=L(c)}for(c=[];d&&d!==f;){h=d.alternate;if(null!==h&&h===f)break;c.push(d);d=L(d)}for(d=0;d<e.length;d++)gb(e[d],"bubbled",a);for(a=c.length;0<a--;)gb(c[a],"captured",b)}
var kb=Object.freeze({accumulateTwoPhaseDispatches:ib,accumulateTwoPhaseDispatchesSkipTarget:function(a){Ia(a,fb)},accumulateEnterLeaveDispatches:jb,accumulateDirectDispatches:function(a){Ia(a,hb)}}),lb=null;function mb(){!lb&&m.canUseDOM&&(lb="textContent"in document.documentElement?"textContent":"innerText");return lb}var M={_root:null,_startText:null,_fallbackText:null};
function nb(){if(M._fallbackText)return M._fallbackText;var a,b=M._startText,c=b.length,d,e=ob(),f=e.length;for(a=0;a<c&&b[a]===e[a];a++);var h=c-a;for(d=1;d<=h&&b[c-d]===e[f-d];d++);M._fallbackText=e.slice(a,1<d?1-d:void 0);return M._fallbackText}function ob(){return"value"in M._root?M._root.value:M._root[mb()]}
var pb="dispatchConfig _targetInst nativeEvent isDefaultPrevented isPropagationStopped _dispatchListeners _dispatchInstances".split(" "),qb={type:null,target:null,currentTarget:C.thatReturnsNull,eventPhase:null,bubbles:null,cancelable:null,timeStamp:function(a){return a.timeStamp||Date.now()},defaultPrevented:null,isTrusted:null};
function N(a,b,c,d){this.dispatchConfig=a;this._targetInst=b;this.nativeEvent=c;a=this.constructor.Interface;for(var e in a)a.hasOwnProperty(e)&&((b=a[e])?this[e]=b(c):"target"===e?this.target=d:this[e]=c[e]);this.isDefaultPrevented=(null!=c.defaultPrevented?c.defaultPrevented:!1===c.returnValue)?C.thatReturnsTrue:C.thatReturnsFalse;this.isPropagationStopped=C.thatReturnsFalse;return this}
A(N.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():"unknown"!==typeof a.returnValue&&(a.returnValue=!1),this.isDefaultPrevented=C.thatReturnsTrue)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():"unknown"!==typeof a.cancelBubble&&(a.cancelBubble=!0),this.isPropagationStopped=C.thatReturnsTrue)},persist:function(){this.isPersistent=C.thatReturnsTrue},isPersistent:C.thatReturnsFalse,
destructor:function(){var a=this.constructor.Interface,b;for(b in a)this[b]=null;for(a=0;a<pb.length;a++)this[pb[a]]=null}});N.Interface=qb;N.extend=function(a){function b(){}function c(){return d.apply(this,arguments)}var d=this;b.prototype=d.prototype;var e=new b;A(e,c.prototype);c.prototype=e;c.prototype.constructor=c;c.Interface=A({},d.Interface,a);c.extend=d.extend;rb(c);return c};rb(N);
function sb(a,b,c,d){if(this.eventPool.length){var e=this.eventPool.pop();this.call(e,a,b,c,d);return e}return new this(a,b,c,d)}function tb(a){a instanceof this?void 0:D("223");a.destructor();10>this.eventPool.length&&this.eventPool.push(a)}function rb(a){a.eventPool=[];a.getPooled=sb;a.release=tb}var ub=N.extend({data:null}),vb=N.extend({data:null}),wb=[9,13,27,32],xb=m.canUseDOM&&"CompositionEvent"in window,yb=null;m.canUseDOM&&"documentMode"in document&&(yb=document.documentMode);
var zb=m.canUseDOM&&"TextEvent"in window&&!yb,Ab=m.canUseDOM&&(!xb||yb&&8<yb&&11>=yb),Bb=String.fromCharCode(32),Kb={beforeInput:{phasedRegistrationNames:{bubbled:"onBeforeInput",captured:"onBeforeInputCapture"},dependencies:["topCompositionEnd","topKeyPress","topTextInput","topPaste"]},compositionEnd:{phasedRegistrationNames:{bubbled:"onCompositionEnd",captured:"onCompositionEndCapture"},dependencies:"topBlur topCompositionEnd topKeyDown topKeyPress topKeyUp topMouseDown".split(" ")},compositionStart:{phasedRegistrationNames:{bubbled:"onCompositionStart",
captured:"onCompositionStartCapture"},dependencies:"topBlur topCompositionStart topKeyDown topKeyPress topKeyUp topMouseDown".split(" ")},compositionUpdate:{phasedRegistrationNames:{bubbled:"onCompositionUpdate",captured:"onCompositionUpdateCapture"},dependencies:"topBlur topCompositionUpdate topKeyDown topKeyPress topKeyUp topMouseDown".split(" ")}},Lb=!1;
function Mb(a,b){switch(a){case "topKeyUp":return-1!==wb.indexOf(b.keyCode);case "topKeyDown":return 229!==b.keyCode;case "topKeyPress":case "topMouseDown":case "topBlur":return!0;default:return!1}}function Nb(a){a=a.detail;return"object"===typeof a&&"data"in a?a.data:null}var Ob=!1;function Pb(a,b){switch(a){case "topCompositionEnd":return Nb(b);case "topKeyPress":if(32!==b.which)return null;Lb=!0;return Bb;case "topTextInput":return a=b.data,a===Bb&&Lb?null:a;default:return null}}
function Qb(a,b){if(Ob)return"topCompositionEnd"===a||!xb&&Mb(a,b)?(a=nb(),M._root=null,M._startText=null,M._fallbackText=null,Ob=!1,a):null;switch(a){case "topPaste":return null;case "topKeyPress":if(!(b.ctrlKey||b.altKey||b.metaKey)||b.ctrlKey&&b.altKey){if(b.char&&1<b.char.length)return b.char;if(b.which)return String.fromCharCode(b.which)}return null;case "topCompositionEnd":return Ab?null:b.data;default:return null}}
var Rb={eventTypes:Kb,extractEvents:function(a,b,c,d){var e=void 0;var f=void 0;if(xb)b:{switch(a){case "topCompositionStart":e=Kb.compositionStart;break b;case "topCompositionEnd":e=Kb.compositionEnd;break b;case "topCompositionUpdate":e=Kb.compositionUpdate;break b}e=void 0}else Ob?Mb(a,c)&&(e=Kb.compositionEnd):"topKeyDown"===a&&229===c.keyCode&&(e=Kb.compositionStart);e?(Ab&&(Ob||e!==Kb.compositionStart?e===Kb.compositionEnd&&Ob&&(f=nb()):(M._root=d,M._startText=ob(),Ob=!0)),e=ub.getPooled(e,
b,c,d),f?e.data=f:(f=Nb(c),null!==f&&(e.data=f)),ib(e),f=e):f=null;(a=zb?Pb(a,c):Qb(a,c))?(b=vb.getPooled(Kb.beforeInput,b,c,d),b.data=a,ib(b)):b=null;return null===f?b:null===b?f:[f,b]}},Sb=null,Tb={injectFiberControlledHostComponent:function(a){Sb=a}},Ub=null,Vb=null;function Wb(a){if(a=Ea(a)){Sb&&"function"===typeof Sb.restoreControlledState?void 0:D("194");var b=Da(a.stateNode);Sb.restoreControlledState(a.stateNode,a.type,b)}}function Xb(a){Ub?Vb?Vb.push(a):Vb=[a]:Ub=a}
function Yb(){return null!==Ub||null!==Vb}function Zb(){if(Ub){var a=Ub,b=Vb;Vb=Ub=null;Wb(a);if(b)for(a=0;a<b.length;a++)Wb(b[a])}}var $b=Object.freeze({injection:Tb,enqueueStateRestore:Xb,needsStateRestore:Yb,restoreStateIfNeeded:Zb});function ac(a,b){return a(b)}function bc(a,b,c){return a(b,c)}function cc(){}var dc=!1;function ec(a,b){if(dc)return a(b);dc=!0;try{return ac(a,b)}finally{dc=!1,Yb()&&(cc(),Zb())}}
var fc={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function gc(a){var b=a&&a.nodeName&&a.nodeName.toLowerCase();return"input"===b?!!fc[a.type]:"textarea"===b?!0:!1}function hc(a){a=a.target||window;a.correspondingUseElement&&(a=a.correspondingUseElement);return 3===a.nodeType?a.parentNode:a}
function ic(a,b){if(!m.canUseDOM||b&&!("addEventListener"in document))return!1;a="on"+a;b=a in document;b||(b=document.createElement("div"),b.setAttribute(a,"return;"),b="function"===typeof b[a]);return b}function jc(a){var b=a.type;return(a=a.nodeName)&&"input"===a.toLowerCase()&&("checkbox"===b||"radio"===b)}
function kc(a){var b=jc(a)?"checked":"value",c=Object.getOwnPropertyDescriptor(a.constructor.prototype,b),d=""+a[b];if(!a.hasOwnProperty(b)&&"function"===typeof c.get&&"function"===typeof c.set)return Object.defineProperty(a,b,{configurable:!0,get:function(){return c.get.call(this)},set:function(a){d=""+a;c.set.call(this,a)}}),Object.defineProperty(a,b,{enumerable:c.enumerable}),{getValue:function(){return d},setValue:function(a){d=""+a},stopTracking:function(){a._valueTracker=null;delete a[b]}}}
function lc(a){a._valueTracker||(a._valueTracker=kc(a))}function mc(a){if(!a)return!1;var b=a._valueTracker;if(!b)return!0;var c=b.getValue();var d="";a&&(d=jc(a)?a.checked?"true":"false":a.value);a=d;return a!==c?(b.setValue(a),!0):!1}
var nc=ea.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,O="function"===typeof Symbol&&Symbol["for"],oc=O?Symbol["for"]("react.element"):60103,pc=O?Symbol["for"]("react.call"):60104,qc=O?Symbol["for"]("react.return"):60105,rc=O?Symbol["for"]("react.portal"):60106,sc=O?Symbol["for"]("react.fragment"):60107,tc=O?Symbol["for"]("react.strict_mode"):60108,uc=O?Symbol["for"]("react.provider"):60109,vc=O?Symbol["for"]("react.context"):60110,wc=O?Symbol["for"]("react.async_mode"):60111,
xc=O?Symbol["for"]("react.forward_ref"):60112,yc="function"===typeof Symbol&&Symbol.iterator;function zc(a){if(null===a||"undefined"===typeof a)return null;a=yc&&a[yc]||a["@@iterator"];return"function"===typeof a?a:null}
function Ac(a){a=a.type;if("function"===typeof a)return a.displayName||a.name;if("string"===typeof a)return a;switch(a){case sc:return"ReactFragment";case rc:return"ReactPortal";case pc:return"ReactCall";case qc:return"ReactReturn"}if("object"===typeof a&&null!==a)switch(a.$$typeof){case xc:return a=a.render.displayName||a.render.name||"",""!==a?"ForwardRef("+a+")":"ForwardRef"}return null}
function Bc(a){var b="";do{a:switch(a.tag){case 0:case 1:case 2:case 5:var c=a._debugOwner,d=a._debugSource;var e=Ac(a);var f=null;c&&(f=Ac(c));c=d;e="\n    in "+(e||"Unknown")+(c?" (at "+c.fileName.replace(/^.*[\\\/]/,"")+":"+c.lineNumber+")":f?" (created by "+f+")":"");break a;default:e=""}b+=e;a=a["return"]}while(a);return b}
var Cc=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,Dc={},Ec={};function Fc(a){if(Ec.hasOwnProperty(a))return!0;if(Dc.hasOwnProperty(a))return!1;if(Cc.test(a))return Ec[a]=!0;Dc[a]=!0;return!1}
function Gc(a,b,c,d){if(null!==c&&0===c.type)return!1;switch(typeof b){case "function":case "symbol":return!0;case "boolean":if(d)return!1;if(null!==c)return!c.acceptsBooleans;a=a.toLowerCase().slice(0,5);return"data-"!==a&&"aria-"!==a;default:return!1}}function Hc(a,b,c,d){if(null===b||"undefined"===typeof b||Gc(a,b,c,d))return!0;if(null!==c)switch(c.type){case 3:return!b;case 4:return!1===b;case 5:return isNaN(b);case 6:return isNaN(b)||1>b}return!1}
function U(a,b,c,d,e){this.acceptsBooleans=2===b||3===b||4===b;this.attributeName=d;this.attributeNamespace=e;this.mustUseProperty=c;this.propertyName=a;this.type=b}var V={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(a){V[a]=new U(a,0,!1,a,null)});
[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(a){var b=a[0];V[b]=new U(b,1,!1,a[1],null)});["contentEditable","draggable","spellCheck","value"].forEach(function(a){V[a]=new U(a,2,!1,a.toLowerCase(),null)});["autoReverse","externalResourcesRequired","preserveAlpha"].forEach(function(a){V[a]=new U(a,2,!1,a,null)});
"allowFullScreen async autoFocus autoPlay controls default defer disabled formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(a){V[a]=new U(a,3,!1,a.toLowerCase(),null)});["checked","multiple","muted","selected"].forEach(function(a){V[a]=new U(a,3,!0,a.toLowerCase(),null)});["capture","download"].forEach(function(a){V[a]=new U(a,4,!1,a.toLowerCase(),null)});
["cols","rows","size","span"].forEach(function(a){V[a]=new U(a,6,!1,a.toLowerCase(),null)});["rowSpan","start"].forEach(function(a){V[a]=new U(a,5,!1,a.toLowerCase(),null)});var Sc=/[\-:]([a-z])/g;function Tc(a){return a[1].toUpperCase()}
"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(a){var b=a.replace(Sc,
Tc);V[b]=new U(b,1,!1,a,null)});"xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(a){var b=a.replace(Sc,Tc);V[b]=new U(b,1,!1,a,"http://www.w3.org/1999/xlink")});["xml:base","xml:lang","xml:space"].forEach(function(a){var b=a.replace(Sc,Tc);V[b]=new U(b,1,!1,a,"http://www.w3.org/XML/1998/namespace")});V.tabIndex=new U("tabIndex",1,!1,"tabindex",null);
function Uc(a,b,c,d){var e=V.hasOwnProperty(b)?V[b]:null;var f=null!==e?0===e.type:d?!1:!(2<b.length)||"o"!==b[0]&&"O"!==b[0]||"n"!==b[1]&&"N"!==b[1]?!1:!0;f||(Hc(b,c,e,d)&&(c=null),d||null===e?Fc(b)&&(null===c?a.removeAttribute(b):a.setAttribute(b,""+c)):e.mustUseProperty?a[e.propertyName]=null===c?3===e.type?!1:"":c:(b=e.attributeName,d=e.attributeNamespace,null===c?a.removeAttribute(b):(e=e.type,c=3===e||4===e&&!0===c?"":""+c,d?a.setAttributeNS(d,b,c):a.setAttribute(b,c))))}
function Vc(a,b){var c=b.checked;return A({},b,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:null!=c?c:a._wrapperState.initialChecked})}function Wc(a,b){var c=null==b.defaultValue?"":b.defaultValue,d=null!=b.checked?b.checked:b.defaultChecked;c=Xc(null!=b.value?b.value:c);a._wrapperState={initialChecked:d,initialValue:c,controlled:"checkbox"===b.type||"radio"===b.type?null!=b.checked:null!=b.value}}function Yc(a,b){b=b.checked;null!=b&&Uc(a,"checked",b,!1)}
function Zc(a,b){Yc(a,b);var c=Xc(b.value);if(null!=c)if("number"===b.type){if(0===c&&""===a.value||a.value!=c)a.value=""+c}else a.value!==""+c&&(a.value=""+c);b.hasOwnProperty("value")?$c(a,b.type,c):b.hasOwnProperty("defaultValue")&&$c(a,b.type,Xc(b.defaultValue));null==b.checked&&null!=b.defaultChecked&&(a.defaultChecked=!!b.defaultChecked)}
function ad(a,b){if(b.hasOwnProperty("value")||b.hasOwnProperty("defaultValue"))""===a.value&&(a.value=""+a._wrapperState.initialValue),a.defaultValue=""+a._wrapperState.initialValue;b=a.name;""!==b&&(a.name="");a.defaultChecked=!a.defaultChecked;a.defaultChecked=!a.defaultChecked;""!==b&&(a.name=b)}function $c(a,b,c){if("number"!==b||a.ownerDocument.activeElement!==a)null==c?a.defaultValue=""+a._wrapperState.initialValue:a.defaultValue!==""+c&&(a.defaultValue=""+c)}
function Xc(a){switch(typeof a){case "boolean":case "number":case "object":case "string":case "undefined":return a;default:return""}}var bd={change:{phasedRegistrationNames:{bubbled:"onChange",captured:"onChangeCapture"},dependencies:"topBlur topChange topClick topFocus topInput topKeyDown topKeyUp topSelectionChange".split(" ")}};function cd(a,b,c){a=N.getPooled(bd.change,a,b,c);a.type="change";Xb(c);ib(a);return a}var dd=null,ed=null;function fd(a){Pa(a,!1)}
function gd(a){var b=Va(a);if(mc(b))return a}function hd(a,b){if("topChange"===a)return b}var id=!1;m.canUseDOM&&(id=ic("input")&&(!document.documentMode||9<document.documentMode));function jd(){dd&&(dd.detachEvent("onpropertychange",kd),ed=dd=null)}function kd(a){"value"===a.propertyName&&gd(ed)&&(a=cd(ed,a,hc(a)),ec(fd,a))}function ld(a,b,c){"topFocus"===a?(jd(),dd=b,ed=c,dd.attachEvent("onpropertychange",kd)):"topBlur"===a&&jd()}
function md(a){if("topSelectionChange"===a||"topKeyUp"===a||"topKeyDown"===a)return gd(ed)}function nd(a,b){if("topClick"===a)return gd(b)}function od(a,b){if("topInput"===a||"topChange"===a)return gd(b)}
var pd={eventTypes:bd,_isInputEventSupported:id,extractEvents:function(a,b,c,d){var e=b?Va(b):window,f=void 0,h=void 0,g=e.nodeName&&e.nodeName.toLowerCase();"select"===g||"input"===g&&"file"===e.type?f=hd:gc(e)?id?f=od:(f=md,h=ld):(g=e.nodeName)&&"input"===g.toLowerCase()&&("checkbox"===e.type||"radio"===e.type)&&(f=nd);if(f&&(f=f(a,b)))return cd(f,c,d);h&&h(a,e,b);"topBlur"===a&&null!=b&&(a=b._wrapperState||e._wrapperState)&&a.controlled&&"number"===e.type&&$c(e,"number",e.value)}},qd=N.extend({view:null,
detail:null}),rd={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function sd(a){var b=this.nativeEvent;return b.getModifierState?b.getModifierState(a):(a=rd[a])?!!b[a]:!1}function td(){return sd}
var ud=qd.extend({screenX:null,screenY:null,clientX:null,clientY:null,pageX:null,pageY:null,ctrlKey:null,shiftKey:null,altKey:null,metaKey:null,getModifierState:td,button:null,buttons:null,relatedTarget:function(a){return a.relatedTarget||(a.fromElement===a.srcElement?a.toElement:a.fromElement)}}),vd={mouseEnter:{registrationName:"onMouseEnter",dependencies:["topMouseOut","topMouseOver"]},mouseLeave:{registrationName:"onMouseLeave",dependencies:["topMouseOut","topMouseOver"]}},wd={eventTypes:vd,extractEvents:function(a,
b,c,d){if("topMouseOver"===a&&(c.relatedTarget||c.fromElement)||"topMouseOut"!==a&&"topMouseOver"!==a)return null;var e=d.window===d?d:(e=d.ownerDocument)?e.defaultView||e.parentWindow:window;"topMouseOut"===a?(a=b,b=(b=c.relatedTarget||c.toElement)?Ua(b):null):a=null;if(a===b)return null;var f=null==a?e:Va(a);e=null==b?e:Va(b);var h=ud.getPooled(vd.mouseLeave,a,c,d);h.type="mouseleave";h.target=f;h.relatedTarget=e;c=ud.getPooled(vd.mouseEnter,b,c,d);c.type="mouseenter";c.target=e;c.relatedTarget=
f;jb(h,c,a,b);return[h,c]}};function xd(a){var b=a;if(a.alternate)for(;b["return"];)b=b["return"];else{if(0!==(b.effectTag&2))return 1;for(;b["return"];)if(b=b["return"],0!==(b.effectTag&2))return 1}return 3===b.tag?2:3}function yd(a){return(a=a._reactInternalFiber)?2===xd(a):!1}function zd(a){2!==xd(a)?D("188"):void 0}
function Ad(a){var b=a.alternate;if(!b)return b=xd(a),3===b?D("188"):void 0,1===b?null:a;for(var c=a,d=b;;){var e=c["return"],f=e?e.alternate:null;if(!e||!f)break;if(e.child===f.child){for(var h=e.child;h;){if(h===c)return zd(e),a;if(h===d)return zd(e),b;h=h.sibling}D("188")}if(c["return"]!==d["return"])c=e,d=f;else{h=!1;for(var g=e.child;g;){if(g===c){h=!0;c=e;d=f;break}if(g===d){h=!0;d=e;c=f;break}g=g.sibling}if(!h){for(g=f.child;g;){if(g===c){h=!0;c=f;d=e;break}if(g===d){h=!0;d=f;c=e;break}g=g.sibling}h?
void 0:D("189")}}c.alternate!==d?D("190"):void 0}3!==c.tag?D("188"):void 0;return c.stateNode.current===c?a:b}function Bd(a){a=Ad(a);if(!a)return null;for(var b=a;;){if(5===b.tag||6===b.tag)return b;if(b.child)b.child["return"]=b,b=b.child;else{if(b===a)break;for(;!b.sibling;){if(!b["return"]||b["return"]===a)return null;b=b["return"]}b.sibling["return"]=b["return"];b=b.sibling}}return null}
function Cd(a){a=Ad(a);if(!a)return null;for(var b=a;;){if(5===b.tag||6===b.tag)return b;if(b.child&&4!==b.tag)b.child["return"]=b,b=b.child;else{if(b===a)break;for(;!b.sibling;){if(!b["return"]||b["return"]===a)return null;b=b["return"]}b.sibling["return"]=b["return"];b=b.sibling}}return null}var Dd=N.extend({animationName:null,elapsedTime:null,pseudoElement:null}),Ed=N.extend({clipboardData:function(a){return"clipboardData"in a?a.clipboardData:window.clipboardData}}),Fd=qd.extend({relatedTarget:null});
function Gd(a){var b=a.keyCode;"charCode"in a?(a=a.charCode,0===a&&13===b&&(a=13)):a=b;10===a&&(a=13);return 32<=a||13===a?a:0}
var Hd={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Id={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",
116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Jd=qd.extend({key:function(a){if(a.key){var b=Hd[a.key]||a.key;if("Unidentified"!==b)return b}return"keypress"===a.type?(a=Gd(a),13===a?"Enter":String.fromCharCode(a)):"keydown"===a.type||"keyup"===a.type?Id[a.keyCode]||"Unidentified":""},location:null,ctrlKey:null,shiftKey:null,altKey:null,metaKey:null,repeat:null,locale:null,getModifierState:td,charCode:function(a){return"keypress"===
a.type?Gd(a):0},keyCode:function(a){return"keydown"===a.type||"keyup"===a.type?a.keyCode:0},which:function(a){return"keypress"===a.type?Gd(a):"keydown"===a.type||"keyup"===a.type?a.keyCode:0}}),Kd=ud.extend({dataTransfer:null}),Ld=qd.extend({touches:null,targetTouches:null,changedTouches:null,altKey:null,metaKey:null,ctrlKey:null,shiftKey:null,getModifierState:td}),Md=N.extend({propertyName:null,elapsedTime:null,pseudoElement:null}),Nd=ud.extend({deltaX:function(a){return"deltaX"in a?a.deltaX:"wheelDeltaX"in
a?-a.wheelDeltaX:0},deltaY:function(a){return"deltaY"in a?a.deltaY:"wheelDeltaY"in a?-a.wheelDeltaY:"wheelDelta"in a?-a.wheelDelta:0},deltaZ:null,deltaMode:null}),Od={},Pd={};function Qd(a,b){var c=a[0].toUpperCase()+a.slice(1),d="on"+c;c="top"+c;b={phasedRegistrationNames:{bubbled:d,captured:d+"Capture"},dependencies:[c],isInteractive:b};Od[a]=b;Pd[c]=b}
"blur cancel click close contextMenu copy cut doubleClick dragEnd dragStart drop focus input invalid keyDown keyPress keyUp mouseDown mouseUp paste pause play rateChange reset seeked submit touchCancel touchEnd touchStart volumeChange".split(" ").forEach(function(a){Qd(a,!0)});
"abort animationEnd animationIteration animationStart canPlay canPlayThrough drag dragEnter dragExit dragLeave dragOver durationChange emptied encrypted ended error load loadedData loadedMetadata loadStart mouseMove mouseOut mouseOver playing progress scroll seeking stalled suspend timeUpdate toggle touchMove transitionEnd waiting wheel".split(" ").forEach(function(a){Qd(a,!1)});
var Rd={eventTypes:Od,isInteractiveTopLevelEventType:function(a){a=Pd[a];return void 0!==a&&!0===a.isInteractive},extractEvents:function(a,b,c,d){var e=Pd[a];if(!e)return null;switch(a){case "topKeyPress":if(0===Gd(c))return null;case "topKeyDown":case "topKeyUp":a=Jd;break;case "topBlur":case "topFocus":a=Fd;break;case "topClick":if(2===c.button)return null;case "topDoubleClick":case "topMouseDown":case "topMouseMove":case "topMouseUp":case "topMouseOut":case "topMouseOver":case "topContextMenu":a=
ud;break;case "topDrag":case "topDragEnd":case "topDragEnter":case "topDragExit":case "topDragLeave":case "topDragOver":case "topDragStart":case "topDrop":a=Kd;break;case "topTouchCancel":case "topTouchEnd":case "topTouchMove":case "topTouchStart":a=Ld;break;case "topAnimationEnd":case "topAnimationIteration":case "topAnimationStart":a=Dd;break;case "topTransitionEnd":a=Md;break;case "topScroll":a=qd;break;case "topWheel":a=Nd;break;case "topCopy":case "topCut":case "topPaste":a=Ed;break;default:a=
N}b=a.getPooled(e,b,c,d);ib(b);return b}},Sd=Rd.isInteractiveTopLevelEventType,Td=[];function Ud(a){var b=a.targetInst;do{if(!b){a.ancestors.push(b);break}var c;for(c=b;c["return"];)c=c["return"];c=3!==c.tag?null:c.stateNode.containerInfo;if(!c)break;a.ancestors.push(b);b=Ua(c)}while(b);for(c=0;c<a.ancestors.length;c++)b=a.ancestors[c],Qa(a.topLevelType,b,a.nativeEvent,hc(a.nativeEvent))}var Vd=!0;function Wd(a){Vd=!!a}
function W(a,b,c){if(!c)return null;a=(Sd(a)?Xd:Yd).bind(null,a);c.addEventListener(b,a,!1)}function Zd(a,b,c){if(!c)return null;a=(Sd(a)?Xd:Yd).bind(null,a);c.addEventListener(b,a,!0)}function Xd(a,b){bc(Yd,a,b)}
function Yd(a,b){if(Vd){var c=hc(b);c=Ua(c);null!==c&&"number"===typeof c.tag&&2!==xd(c)&&(c=null);if(Td.length){var d=Td.pop();d.topLevelType=a;d.nativeEvent=b;d.targetInst=c;a=d}else a={topLevelType:a,nativeEvent:b,targetInst:c,ancestors:[]};try{ec(Ud,a)}finally{a.topLevelType=null,a.nativeEvent=null,a.targetInst=null,a.ancestors.length=0,10>Td.length&&Td.push(a)}}}
var $d=Object.freeze({get _enabled(){return Vd},setEnabled:Wd,isEnabled:function(){return Vd},trapBubbledEvent:W,trapCapturedEvent:Zd,dispatchEvent:Yd});function ae(a,b){var c={};c[a.toLowerCase()]=b.toLowerCase();c["Webkit"+a]="webkit"+b;c["Moz"+a]="moz"+b;c["ms"+a]="MS"+b;c["O"+a]="o"+b.toLowerCase();return c}
var be={animationend:ae("Animation","AnimationEnd"),animationiteration:ae("Animation","AnimationIteration"),animationstart:ae("Animation","AnimationStart"),transitionend:ae("Transition","TransitionEnd")},ce={},de={};m.canUseDOM&&(de=document.createElement("div").style,"AnimationEvent"in window||(delete be.animationend.animation,delete be.animationiteration.animation,delete be.animationstart.animation),"TransitionEvent"in window||delete be.transitionend.transition);
function ee(a){if(ce[a])return ce[a];if(!be[a])return a;var b=be[a],c;for(c in b)if(b.hasOwnProperty(c)&&c in de)return ce[a]=b[c];return a}
var fe={topAnimationEnd:ee("animationend"),topAnimationIteration:ee("animationiteration"),topAnimationStart:ee("animationstart"),topBlur:"blur",topCancel:"cancel",topChange:"change",topClick:"click",topClose:"close",topCompositionEnd:"compositionend",topCompositionStart:"compositionstart",topCompositionUpdate:"compositionupdate",topContextMenu:"contextmenu",topCopy:"copy",topCut:"cut",topDoubleClick:"dblclick",topDrag:"drag",topDragEnd:"dragend",topDragEnter:"dragenter",topDragExit:"dragexit",topDragLeave:"dragleave",
topDragOver:"dragover",topDragStart:"dragstart",topDrop:"drop",topFocus:"focus",topInput:"input",topKeyDown:"keydown",topKeyPress:"keypress",topKeyUp:"keyup",topLoad:"load",topLoadStart:"loadstart",topMouseDown:"mousedown",topMouseMove:"mousemove",topMouseOut:"mouseout",topMouseOver:"mouseover",topMouseUp:"mouseup",topPaste:"paste",topScroll:"scroll",topSelectionChange:"selectionchange",topTextInput:"textInput",topToggle:"toggle",topTouchCancel:"touchcancel",topTouchEnd:"touchend",topTouchMove:"touchmove",
topTouchStart:"touchstart",topTransitionEnd:ee("transitionend"),topWheel:"wheel"},ge={topAbort:"abort",topCanPlay:"canplay",topCanPlayThrough:"canplaythrough",topDurationChange:"durationchange",topEmptied:"emptied",topEncrypted:"encrypted",topEnded:"ended",topError:"error",topLoadedData:"loadeddata",topLoadedMetadata:"loadedmetadata",topLoadStart:"loadstart",topPause:"pause",topPlay:"play",topPlaying:"playing",topProgress:"progress",topRateChange:"ratechange",topSeeked:"seeked",topSeeking:"seeking",
topStalled:"stalled",topSuspend:"suspend",topTimeUpdate:"timeupdate",topVolumeChange:"volumechange",topWaiting:"waiting"},he={},ie=0,je="_reactListenersID"+(""+Math.random()).slice(2);function ke(a){Object.prototype.hasOwnProperty.call(a,je)||(a[je]=ie++,he[a[je]]={});return he[a[je]]}function le(a){for(;a&&a.firstChild;)a=a.firstChild;return a}
function me(a,b){var c=le(a);a=0;for(var d;c;){if(3===c.nodeType){d=a+c.textContent.length;if(a<=b&&d>=b)return{node:c,offset:b-a};a=d}a:{for(;c;){if(c.nextSibling){c=c.nextSibling;break a}c=c.parentNode}c=void 0}c=le(c)}}function ne(a){var b=a&&a.nodeName&&a.nodeName.toLowerCase();return b&&("input"===b&&"text"===a.type||"textarea"===b||"true"===a.contentEditable)}
var oe=m.canUseDOM&&"documentMode"in document&&11>=document.documentMode,pe={select:{phasedRegistrationNames:{bubbled:"onSelect",captured:"onSelectCapture"},dependencies:"topBlur topContextMenu topFocus topKeyDown topKeyUp topMouseDown topMouseUp topSelectionChange".split(" ")}},qe=null,re=null,se=null,te=!1;
function ue(a,b){if(te||null==qe||qe!==fa())return null;var c=qe;"selectionStart"in c&&ne(c)?c={start:c.selectionStart,end:c.selectionEnd}:window.getSelection?(c=window.getSelection(),c={anchorNode:c.anchorNode,anchorOffset:c.anchorOffset,focusNode:c.focusNode,focusOffset:c.focusOffset}):c=void 0;return se&&ha(se,c)?null:(se=c,a=N.getPooled(pe.select,re,a,b),a.type="select",a.target=qe,ib(a),a)}
var ve={eventTypes:pe,extractEvents:function(a,b,c,d){var e=d.window===d?d.document:9===d.nodeType?d:d.ownerDocument,f;if(!(f=!e)){a:{e=ke(e);f=va.onSelect;for(var h=0;h<f.length;h++){var g=f[h];if(!e.hasOwnProperty(g)||!e[g]){e=!1;break a}}e=!0}f=!e}if(f)return null;e=b?Va(b):window;switch(a){case "topFocus":if(gc(e)||"true"===e.contentEditable)qe=e,re=b,se=null;break;case "topBlur":se=re=qe=null;break;case "topMouseDown":te=!0;break;case "topContextMenu":case "topMouseUp":return te=!1,ue(c,d);case "topSelectionChange":if(oe)break;
case "topKeyDown":case "topKeyUp":return ue(c,d)}return null}};Na.injectEventPluginOrder("ResponderEventPlugin SimpleEventPlugin TapEventPlugin EnterLeaveEventPlugin ChangeEventPlugin SelectEventPlugin BeforeInputEventPlugin".split(" "));Da=bb.getFiberCurrentPropsFromNode;Ea=bb.getInstanceFromNode;Fa=bb.getNodeFromInstance;Na.injectEventPluginsByName({SimpleEventPlugin:Rd,EnterLeaveEventPlugin:wd,ChangeEventPlugin:pd,SelectEventPlugin:ve,BeforeInputEventPlugin:Rb});
function xe(a,b,c,d){this.tag=a;this.key=c;this.stateNode=this.type=null;this.sibling=this.child=this["return"]=null;this.index=0;this.ref=null;this.pendingProps=b;this.memoizedState=this.updateQueue=this.memoizedProps=null;this.mode=d;this.effectTag=0;this.lastEffect=this.firstEffect=this.nextEffect=null;this.expirationTime=0;this.alternate=null}
function ze(a,b,c){var d=a.alternate;null===d?(d=new xe(a.tag,b,a.key,a.mode),d.type=a.type,d.stateNode=a.stateNode,d.alternate=a,a.alternate=d):(d.pendingProps=b,d.effectTag=0,d.nextEffect=null,d.firstEffect=null,d.lastEffect=null);d.expirationTime=c;d.child=a.child;d.memoizedProps=a.memoizedProps;d.memoizedState=a.memoizedState;d.updateQueue=a.updateQueue;d.sibling=a.sibling;d.index=a.index;d.ref=a.ref;return d}
function Ae(a,b,c){var d=a.type,e=a.key;a=a.props;var f=void 0;if("function"===typeof d)f=d.prototype&&d.prototype.isReactComponent?2:0;else if("string"===typeof d)f=5;else switch(d){case sc:return Be(a.children,b,c,e);case wc:f=11;b|=3;break;case tc:f=11;b|=2;break;case pc:f=7;break;case qc:f=9;break;default:if("object"===typeof d&&null!==d)switch(d.$$typeof){case uc:f=13;break;case vc:f=12;break;case xc:f=14;break;default:if("number"===typeof d.tag)return b=d,b.pendingProps=a,b.expirationTime=c,
b;D("130",null==d?d:typeof d,"")}else D("130",null==d?d:typeof d,"")}b=new xe(f,a,e,b);b.type=d;b.expirationTime=c;return b}function Be(a,b,c,d){a=new xe(10,a,d,b);a.expirationTime=c;return a}function Ce(a,b,c){a=new xe(6,a,null,b);a.expirationTime=c;return a}function De(a,b,c){b=new xe(4,null!==a.children?a.children:[],a.key,b);b.expirationTime=c;b.stateNode={containerInfo:a.containerInfo,pendingChildren:null,implementation:a.implementation};return b}var Ee=null,Fe=null;
function Ge(a){return function(b){try{return a(b)}catch(c){}}}function He(a){if("undefined"===typeof __REACT_DEVTOOLS_GLOBAL_HOOK__)return!1;var b=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(b.isDisabled||!b.supportsFiber)return!0;try{var c=b.inject(a);Ee=Ge(function(a){return b.onCommitFiberRoot(c,a)});Fe=Ge(function(a){return b.onCommitFiberUnmount(c,a)})}catch(d){}return!0}function Ie(a){"function"===typeof Ee&&Ee(a)}function Je(a){"function"===typeof Fe&&Fe(a)}new Set;
function Ke(a){return{baseState:a,expirationTime:0,first:null,last:null,callbackList:null,hasForceUpdate:!1,isInitialized:!1,capturedValues:null}}function Le(a,b){null===a.last?a.first=a.last=b:(a.last.next=b,a.last=b);if(0===a.expirationTime||a.expirationTime>b.expirationTime)a.expirationTime=b.expirationTime}var Me=void 0,Ne=void 0;
function Oe(a){Me=Ne=null;var b=a.alternate,c=a.updateQueue;null===c&&(c=a.updateQueue=Ke(null));null!==b?(a=b.updateQueue,null===a&&(a=b.updateQueue=Ke(null))):a=null;Me=c;Ne=a!==c?a:null}function Pe(a,b){Oe(a);a=Me;var c=Ne;null===c?Le(a,b):null===a.last||null===c.last?(Le(a,b),Le(c,b)):(Le(a,b),c.last=b)}function Qe(a,b,c,d){a=a.partialState;return"function"===typeof a?a.call(b,c,d):a}
function Re(a,b,c,d,e,f){null!==a&&a.updateQueue===c&&(c=b.updateQueue={baseState:c.baseState,expirationTime:c.expirationTime,first:c.first,last:c.last,isInitialized:c.isInitialized,capturedValues:c.capturedValues,callbackList:null,hasForceUpdate:!1});c.expirationTime=0;c.isInitialized?a=c.baseState:(a=c.baseState=b.memoizedState,c.isInitialized=!0);for(var h=!0,g=c.first,k=!1;null!==g;){var v=g.expirationTime;if(v>f){var l=c.expirationTime;if(0===l||l>v)c.expirationTime=v;k||(k=!0,c.baseState=a)}else{k||
(c.first=g.next,null===c.first&&(c.last=null));if(g.isReplace)a=Qe(g,d,a,e),h=!0;else if(v=Qe(g,d,a,e))a=h?A({},a,v):A(a,v),h=!1;g.isForced&&(c.hasForceUpdate=!0);null!==g.callback&&(v=c.callbackList,null===v&&(v=c.callbackList=[]),v.push(g));null!==g.capturedValue&&(v=c.capturedValues,null===v?c.capturedValues=[g.capturedValue]:v.push(g.capturedValue))}g=g.next}null!==c.callbackList?b.effectTag|=32:null!==c.first||c.hasForceUpdate||null!==c.capturedValues||(b.updateQueue=null);k||(c.baseState=a);
return a}function Se(a,b){var c=a.callbackList;if(null!==c)for(a.callbackList=null,a=0;a<c.length;a++){var d=c[a],e=d.callback;d.callback=null;"function"!==typeof e?D("191",e):void 0;e.call(b)}}
function Te(a,b,c,d,e){function f(a,b,c,d,e,f){if(null===b||null!==a.updateQueue&&a.updateQueue.hasForceUpdate)return!0;var n=a.stateNode;a=a.type;return"function"===typeof n.shouldComponentUpdate?n.shouldComponentUpdate(c,e,f):a.prototype&&a.prototype.isPureReactComponent?!ha(b,c)||!ha(d,e):!0}function h(a,b){b.updater=r;a.stateNode=b;b._reactInternalFiber=a}function g(a,b,c,d){a=b.state;"function"===typeof b.componentWillReceiveProps&&b.componentWillReceiveProps(c,d);"function"===typeof b.UNSAFE_componentWillReceiveProps&&
b.UNSAFE_componentWillReceiveProps(c,d);b.state!==a&&r.enqueueReplaceState(b,b.state,null)}function k(a,b,c,d){a=a.type;if("function"===typeof a.getDerivedStateFromProps)return a.getDerivedStateFromProps.call(null,c,d)}var v=a.cacheContext,l=a.getMaskedContext,p=a.getUnmaskedContext,z=a.isContextConsumer,B=a.hasContextChanged,r={isMounted:yd,enqueueSetState:function(a,d,e){a=a._reactInternalFiber;e=void 0===e?null:e;var f=c(a);Pe(a,{expirationTime:f,partialState:d,callback:e,isReplace:!1,isForced:!1,
capturedValue:null,next:null});b(a,f)},enqueueReplaceState:function(a,d,e){a=a._reactInternalFiber;e=void 0===e?null:e;var f=c(a);Pe(a,{expirationTime:f,partialState:d,callback:e,isReplace:!0,isForced:!1,capturedValue:null,next:null});b(a,f)},enqueueForceUpdate:function(a,d){a=a._reactInternalFiber;d=void 0===d?null:d;var e=c(a);Pe(a,{expirationTime:e,partialState:null,callback:d,isReplace:!1,isForced:!0,capturedValue:null,next:null});b(a,e)}};return{adoptClassInstance:h,callGetDerivedStateFromProps:k,
constructClassInstance:function(a,b){var c=a.type,d=p(a),e=z(a),f=e?l(a,d):ka;c=new c(b,f);var n=null!==c.state&&void 0!==c.state?c.state:null;h(a,c);a.memoizedState=n;b=k(a,c,b,n);null!==b&&void 0!==b&&(a.memoizedState=A({},a.memoizedState,b));e&&v(a,d,f);return c},mountClassInstance:function(a,b){var c=a.type,d=a.alternate,e=a.stateNode,f=a.pendingProps,n=p(a);e.props=f;e.state=a.memoizedState;e.refs=ka;e.context=l(a,n);"function"===typeof c.getDerivedStateFromProps||"function"===typeof e.getSnapshotBeforeUpdate||
"function"!==typeof e.UNSAFE_componentWillMount&&"function"!==typeof e.componentWillMount||(c=e.state,"function"===typeof e.componentWillMount&&e.componentWillMount(),"function"===typeof e.UNSAFE_componentWillMount&&e.UNSAFE_componentWillMount(),c!==e.state&&r.enqueueReplaceState(e,e.state,null),c=a.updateQueue,null!==c&&(e.state=Re(d,a,c,e,f,b)));"function"===typeof e.componentDidMount&&(a.effectTag|=4)},resumeMountClassInstance:function(a,b){var c=a.type,n=a.stateNode;n.props=a.memoizedProps;n.state=
a.memoizedState;var h=a.memoizedProps,r=a.pendingProps,z=n.context,q=p(a);q=l(a,q);(c="function"===typeof c.getDerivedStateFromProps||"function"===typeof n.getSnapshotBeforeUpdate)||"function"!==typeof n.UNSAFE_componentWillReceiveProps&&"function"!==typeof n.componentWillReceiveProps||(h!==r||z!==q)&&g(a,n,r,q);z=a.memoizedState;b=null!==a.updateQueue?Re(null,a,a.updateQueue,n,r,b):z;var u=void 0;h!==r&&(u=k(a,n,r,b));if(null!==u&&void 0!==u){b=null===b||void 0===b?u:A({},b,u);var t=a.updateQueue;
null!==t&&(t.baseState=A({},t.baseState,u))}if(!(h!==r||z!==b||B()||null!==a.updateQueue&&a.updateQueue.hasForceUpdate))return"function"===typeof n.componentDidMount&&(a.effectTag|=4),!1;(h=f(a,h,r,z,b,q))?(c||"function"!==typeof n.UNSAFE_componentWillMount&&"function"!==typeof n.componentWillMount||("function"===typeof n.componentWillMount&&n.componentWillMount(),"function"===typeof n.UNSAFE_componentWillMount&&n.UNSAFE_componentWillMount()),"function"===typeof n.componentDidMount&&(a.effectTag|=
4)):("function"===typeof n.componentDidMount&&(a.effectTag|=4),d(a,r),e(a,b));n.props=r;n.state=b;n.context=q;return h},updateClassInstance:function(a,b,c){var n=b.type,x=b.stateNode;x.props=b.memoizedProps;x.state=b.memoizedState;var h=b.memoizedProps,r=b.pendingProps,q=x.context,u=p(b);u=l(b,u);(n="function"===typeof n.getDerivedStateFromProps||"function"===typeof x.getSnapshotBeforeUpdate)||"function"!==typeof x.UNSAFE_componentWillReceiveProps&&"function"!==typeof x.componentWillReceiveProps||
(h!==r||q!==u)&&g(b,x,r,u);q=b.memoizedState;c=null!==b.updateQueue?Re(a,b,b.updateQueue,x,r,c):q;var t=void 0;h!==r&&(t=k(b,x,r,c));if(null!==t&&void 0!==t){c=null===c||void 0===c?t:A({},c,t);var y=b.updateQueue;null!==y&&(y.baseState=A({},y.baseState,t))}if(!(h!==r||q!==c||B()||null!==b.updateQueue&&b.updateQueue.hasForceUpdate))return"function"!==typeof x.componentDidUpdate||h===a.memoizedProps&&q===a.memoizedState||(b.effectTag|=4),"function"!==typeof x.getSnapshotBeforeUpdate||h===a.memoizedProps&&
q===a.memoizedState||(b.effectTag|=2048),!1;(t=f(b,h,r,q,c,u))?(n||"function"!==typeof x.UNSAFE_componentWillUpdate&&"function"!==typeof x.componentWillUpdate||("function"===typeof x.componentWillUpdate&&x.componentWillUpdate(r,c,u),"function"===typeof x.UNSAFE_componentWillUpdate&&x.UNSAFE_componentWillUpdate(r,c,u)),"function"===typeof x.componentDidUpdate&&(b.effectTag|=4),"function"===typeof x.getSnapshotBeforeUpdate&&(b.effectTag|=2048)):("function"!==typeof x.componentDidUpdate||h===a.memoizedProps&&
q===a.memoizedState||(b.effectTag|=4),"function"!==typeof x.getSnapshotBeforeUpdate||h===a.memoizedProps&&q===a.memoizedState||(b.effectTag|=2048),d(b,r),e(b,c));x.props=r;x.state=c;x.context=u;return t}}}var Ue=Array.isArray;
function Ve(a,b,c){a=c.ref;if(null!==a&&"function"!==typeof a&&"object"!==typeof a){if(c._owner){c=c._owner;var d=void 0;c&&(2!==c.tag?D("110"):void 0,d=c.stateNode);d?void 0:D("147",a);var e=""+a;if(null!==b&&null!==b.ref&&b.ref._stringRef===e)return b.ref;b=function(a){var b=d.refs===ka?d.refs={}:d.refs;null===a?delete b[e]:b[e]=a};b._stringRef=e;return b}"string"!==typeof a?D("148"):void 0;c._owner?void 0:D("254",a)}return a}
function We(a,b){"textarea"!==a.type&&D("31","[object Object]"===Object.prototype.toString.call(b)?"object with keys {"+Object.keys(b).join(", ")+"}":b,"")}
function Xe(a){function b(b,c){if(a){var d=b.lastEffect;null!==d?(d.nextEffect=c,b.lastEffect=c):b.firstEffect=b.lastEffect=c;c.nextEffect=null;c.effectTag=8}}function c(c,d){if(!a)return null;for(;null!==d;)b(c,d),d=d.sibling;return null}function d(a,b){for(a=new Map;null!==b;)null!==b.key?a.set(b.key,b):a.set(b.index,b),b=b.sibling;return a}function e(a,b,c){a=ze(a,b,c);a.index=0;a.sibling=null;return a}function f(b,c,d){b.index=d;if(!a)return c;d=b.alternate;if(null!==d)return d=d.index,d<c?(b.effectTag=
2,c):d;b.effectTag=2;return c}function h(b){a&&null===b.alternate&&(b.effectTag=2);return b}function g(a,b,c,d){if(null===b||6!==b.tag)return b=Ce(c,a.mode,d),b["return"]=a,b;b=e(b,c,d);b["return"]=a;return b}function k(a,b,c,d){if(null!==b&&b.type===c.type)return d=e(b,c.props,d),d.ref=Ve(a,b,c),d["return"]=a,d;d=Ae(c,a.mode,d);d.ref=Ve(a,b,c);d["return"]=a;return d}function v(a,b,c,d){if(null===b||4!==b.tag||b.stateNode.containerInfo!==c.containerInfo||b.stateNode.implementation!==c.implementation)return b=
De(c,a.mode,d),b["return"]=a,b;b=e(b,c.children||[],d);b["return"]=a;return b}function l(a,b,c,d,f){if(null===b||10!==b.tag)return b=Be(c,a.mode,d,f),b["return"]=a,b;b=e(b,c,d);b["return"]=a;return b}function p(a,b,c){if("string"===typeof b||"number"===typeof b)return b=Ce(""+b,a.mode,c),b["return"]=a,b;if("object"===typeof b&&null!==b){switch(b.$$typeof){case oc:return c=Ae(b,a.mode,c),c.ref=Ve(a,null,b),c["return"]=a,c;case rc:return b=De(b,a.mode,c),b["return"]=a,b}if(Ue(b)||zc(b))return b=Be(b,
a.mode,c,null),b["return"]=a,b;We(a,b)}return null}function z(a,b,c,d){var e=null!==b?b.key:null;if("string"===typeof c||"number"===typeof c)return null!==e?null:g(a,b,""+c,d);if("object"===typeof c&&null!==c){switch(c.$$typeof){case oc:return c.key===e?c.type===sc?l(a,b,c.props.children,d,e):k(a,b,c,d):null;case rc:return c.key===e?v(a,b,c,d):null}if(Ue(c)||zc(c))return null!==e?null:l(a,b,c,d,null);We(a,c)}return null}function B(a,b,c,d,e){if("string"===typeof d||"number"===typeof d)return a=a.get(c)||
null,g(b,a,""+d,e);if("object"===typeof d&&null!==d){switch(d.$$typeof){case oc:return a=a.get(null===d.key?c:d.key)||null,d.type===sc?l(b,a,d.props.children,e,d.key):k(b,a,d,e);case rc:return a=a.get(null===d.key?c:d.key)||null,v(b,a,d,e)}if(Ue(d)||zc(d))return a=a.get(c)||null,l(b,a,d,e,null);We(b,d)}return null}function r(e,l,g,h){for(var r=null,k=null,q=l,u=l=0,t=null;null!==q&&u<g.length;u++){q.index>u?(t=q,q=null):t=q.sibling;var n=z(e,q,g[u],h);if(null===n){null===q&&(q=t);break}a&&q&&null===
n.alternate&&b(e,q);l=f(n,l,u);null===k?r=n:k.sibling=n;k=n;q=t}if(u===g.length)return c(e,q),r;if(null===q){for(;u<g.length;u++)if(q=p(e,g[u],h))l=f(q,l,u),null===k?r=q:k.sibling=q,k=q;return r}for(q=d(e,q);u<g.length;u++)if(t=B(q,e,u,g[u],h)){if(a&&null!==t.alternate)q["delete"](null===t.key?u:t.key);l=f(t,l,u);null===k?r=t:k.sibling=t;k=t}a&&q.forEach(function(a){return b(e,a)});return r}function Q(e,l,g,h){var r=zc(g);"function"!==typeof r?D("150"):void 0;g=r.call(g);null==g?D("151"):void 0;for(var k=
r=null,q=l,u=l=0,t=null,n=g.next();null!==q&&!n.done;u++,n=g.next()){q.index>u?(t=q,q=null):t=q.sibling;var H=z(e,q,n.value,h);if(null===H){q||(q=t);break}a&&q&&null===H.alternate&&b(e,q);l=f(H,l,u);null===k?r=H:k.sibling=H;k=H;q=t}if(n.done)return c(e,q),r;if(null===q){for(;!n.done;u++,n=g.next())n=p(e,n.value,h),null!==n&&(l=f(n,l,u),null===k?r=n:k.sibling=n,k=n);return r}for(q=d(e,q);!n.done;u++,n=g.next())if(n=B(q,e,u,n.value,h),null!==n){if(a&&null!==n.alternate)q["delete"](null===n.key?u:n.key);
l=f(n,l,u);null===k?r=n:k.sibling=n;k=n}a&&q.forEach(function(a){return b(e,a)});return r}return function(a,d,f,l){"object"===typeof f&&null!==f&&f.type===sc&&null===f.key&&(f=f.props.children);var g="object"===typeof f&&null!==f;if(g)switch(f.$$typeof){case oc:a:{var k=f.key;for(g=d;null!==g;){if(g.key===k)if(10===g.tag?f.type===sc:g.type===f.type){c(a,g.sibling);d=e(g,f.type===sc?f.props.children:f.props,l);d.ref=Ve(a,g,f);d["return"]=a;a=d;break a}else{c(a,g);break}else b(a,g);g=g.sibling}f.type===
sc?(d=Be(f.props.children,a.mode,l,f.key),d["return"]=a,a=d):(l=Ae(f,a.mode,l),l.ref=Ve(a,d,f),l["return"]=a,a=l)}return h(a);case rc:a:{for(g=f.key;null!==d;){if(d.key===g)if(4===d.tag&&d.stateNode.containerInfo===f.containerInfo&&d.stateNode.implementation===f.implementation){c(a,d.sibling);d=e(d,f.children||[],l);d["return"]=a;a=d;break a}else{c(a,d);break}else b(a,d);d=d.sibling}d=De(f,a.mode,l);d["return"]=a;a=d}return h(a)}if("string"===typeof f||"number"===typeof f)return f=""+f,null!==d&&
6===d.tag?(c(a,d.sibling),d=e(d,f,l),d["return"]=a,a=d):(c(a,d),d=Ce(f,a.mode,l),d["return"]=a,a=d),h(a);if(Ue(f))return r(a,d,f,l);if(zc(f))return Q(a,d,f,l);g&&We(a,f);if("undefined"===typeof f)switch(a.tag){case 2:case 1:l=a.type,D("152",l.displayName||l.name||"Component")}return c(a,d)}}var Ye=Xe(!0),Ze=Xe(!1);
function $e(a,b,c,d,e,f,h){function g(a,b,c){k(a,b,c,b.expirationTime)}function k(a,b,c,d){b.child=null===a?Ze(b,null,c,d):Ye(b,a.child,c,d)}function v(a,b){var c=b.ref;if(null===a&&null!==c||null!==a&&a.ref!==c)b.effectTag|=128}function l(a,b,c,d,e,f){v(a,b);if(!c&&!e)return d&&y(b,!1),r(a,b);c=b.stateNode;nc.current=b;var l=e?null:c.render();b.effectTag|=1;e&&(k(a,b,null,f),b.child=null);k(a,b,l,f);b.memoizedState=c.state;b.memoizedProps=c.props;d&&y(b,!0);return b.child}function p(a){var b=a.stateNode;
b.pendingContext?t(a,b.pendingContext,b.pendingContext!==b.context):b.context&&t(a,b.context,!1);Y(a,b.containerInfo)}function z(a,b,c,d){var e=a.child;for(null!==e&&(e["return"]=a);null!==e;){switch(e.tag){case 12:var f=e.stateNode|0;if(e.type===b&&0!==(f&c)){for(f=e;null!==f;){var l=f.alternate;if(0===f.expirationTime||f.expirationTime>d)f.expirationTime=d,null!==l&&(0===l.expirationTime||l.expirationTime>d)&&(l.expirationTime=d);else if(null!==l&&(0===l.expirationTime||l.expirationTime>d))l.expirationTime=
d;else break;f=f["return"]}f=null}else f=e.child;break;case 13:f=e.type===a.type?null:e.child;break;default:f=e.child}if(null!==f)f["return"]=e;else for(f=e;null!==f;){if(f===a){f=null;break}e=f.sibling;if(null!==e){f=e;break}f=f["return"]}e=f}}function B(a,b,c){var d=b.type._context,e=b.pendingProps,f=b.memoizedProps;if(!q()&&f===e)return b.stateNode=0,G(b),r(a,b);var l=e.value;b.memoizedProps=e;if(null===f)l=1073741823;else if(f.value===e.value){if(f.children===e.children)return b.stateNode=0,G(b),
r(a,b);l=0}else{var h=f.value;if(h===l&&(0!==h||1/h===1/l)||h!==h&&l!==l){if(f.children===e.children)return b.stateNode=0,G(b),r(a,b);l=0}else if(l="function"===typeof d._calculateChangedBits?d._calculateChangedBits(h,l):1073741823,l|=0,0===l){if(f.children===e.children)return b.stateNode=0,G(b),r(a,b)}else z(b,d,l,c)}b.stateNode=l;G(b);g(a,b,e.children);return b.child}function r(a,b){null!==a&&b.child!==a.child?D("153"):void 0;if(null!==b.child){a=b.child;var c=ze(a,a.pendingProps,a.expirationTime);
b.child=c;for(c["return"]=b;null!==a.sibling;)a=a.sibling,c=c.sibling=ze(a,a.pendingProps,a.expirationTime),c["return"]=b;c.sibling=null}return b.child}var Q=a.shouldSetTextContent,n=a.shouldDeprioritizeSubtree,x=b.pushHostContext,Y=b.pushHostContainer,G=d.pushProvider,R=c.getMaskedContext,S=c.getUnmaskedContext,q=c.hasContextChanged,u=c.pushContextProvider,t=c.pushTopLevelContextObject,y=c.invalidateContextProvider,H=e.enterHydrationState,Wa=e.resetHydrationState,Cb=e.tryToClaimNextHydratableInstance;
a=Te(c,f,h,function(a,b){a.memoizedProps=b},function(a,b){a.memoizedState=b});var Jc=a.adoptClassInstance,Kc=a.callGetDerivedStateFromProps,Lc=a.constructClassInstance,Db=a.mountClassInstance,Mc=a.resumeMountClassInstance,Eb=a.updateClassInstance;return{beginWork:function(a,b,c){if(0===b.expirationTime||b.expirationTime>c){switch(b.tag){case 3:p(b);break;case 2:u(b);break;case 4:Y(b,b.stateNode.containerInfo);break;case 13:G(b)}return null}switch(b.tag){case 0:null!==a?D("155"):void 0;var d=b.type,
e=b.pendingProps,f=S(b);f=R(b,f);d=d(e,f);b.effectTag|=1;"object"===typeof d&&null!==d&&"function"===typeof d.render&&void 0===d.$$typeof?(f=b.type,b.tag=2,b.memoizedState=null!==d.state&&void 0!==d.state?d.state:null,"function"===typeof f.getDerivedStateFromProps&&(e=Kc(b,d,e,b.memoizedState),null!==e&&void 0!==e&&(b.memoizedState=A({},b.memoizedState,e))),e=u(b),Jc(b,d),Db(b,c),a=l(a,b,!0,e,!1,c)):(b.tag=1,g(a,b,d),b.memoizedProps=e,a=b.child);return a;case 1:return e=b.type,c=b.pendingProps,q()||
b.memoizedProps!==c?(d=S(b),d=R(b,d),e=e(c,d),b.effectTag|=1,g(a,b,e),b.memoizedProps=c,a=b.child):a=r(a,b),a;case 2:e=u(b);null===a?null===b.stateNode?(Lc(b,b.pendingProps),Db(b,c),d=!0):d=Mc(b,c):d=Eb(a,b,c);f=!1;var h=b.updateQueue;null!==h&&null!==h.capturedValues&&(f=d=!0);return l(a,b,d,e,f,c);case 3:a:if(p(b),d=b.updateQueue,null!==d){f=b.memoizedState;e=Re(a,b,d,null,null,c);b.memoizedState=e;d=b.updateQueue;if(null!==d&&null!==d.capturedValues)d=null;else if(f===e){Wa();a=r(a,b);break a}else d=
e.element;f=b.stateNode;(null===a||null===a.child)&&f.hydrate&&H(b)?(b.effectTag|=2,b.child=Ze(b,null,d,c)):(Wa(),g(a,b,d));b.memoizedState=e;a=b.child}else Wa(),a=r(a,b);return a;case 5:a:{x(b);null===a&&Cb(b);e=b.type;h=b.memoizedProps;d=b.pendingProps;f=null!==a?a.memoizedProps:null;if(!q()&&h===d){if(h=b.mode&1&&n(e,d))b.expirationTime=1073741823;if(!h||1073741823!==c){a=r(a,b);break a}}h=d.children;Q(e,d)?h=null:f&&Q(e,f)&&(b.effectTag|=16);v(a,b);1073741823!==c&&b.mode&1&&n(e,d)?(b.expirationTime=
1073741823,b.memoizedProps=d,a=null):(g(a,b,h),b.memoizedProps=d,a=b.child)}return a;case 6:return null===a&&Cb(b),b.memoizedProps=b.pendingProps,null;case 8:b.tag=7;case 7:return e=b.pendingProps,q()||b.memoizedProps!==e||(e=b.memoizedProps),d=e.children,b.stateNode=null===a?Ze(b,b.stateNode,d,c):Ye(b,a.stateNode,d,c),b.memoizedProps=e,b.stateNode;case 9:return null;case 4:return Y(b,b.stateNode.containerInfo),e=b.pendingProps,q()||b.memoizedProps!==e?(null===a?b.child=Ye(b,null,e,c):g(a,b,e),b.memoizedProps=
e,a=b.child):a=r(a,b),a;case 14:return c=b.type.render,c=c(b.pendingProps,b.ref),g(a,b,c),b.memoizedProps=c,b.child;case 10:return c=b.pendingProps,q()||b.memoizedProps!==c?(g(a,b,c),b.memoizedProps=c,a=b.child):a=r(a,b),a;case 11:return c=b.pendingProps.children,q()||null!==c&&b.memoizedProps!==c?(g(a,b,c),b.memoizedProps=c,a=b.child):a=r(a,b),a;case 13:return B(a,b,c);case 12:a:{d=b.type;f=b.pendingProps;h=b.memoizedProps;e=d._currentValue;var t=d._changedBits;if(q()||0!==t||h!==f){b.memoizedProps=
f;var k=f.unstable_observedBits;if(void 0===k||null===k)k=1073741823;b.stateNode=k;if(0!==(t&k))z(b,d,t,c);else if(h===f){a=r(a,b);break a}c=f.children;c=c(e);g(a,b,c);a=b.child}else a=r(a,b)}return a;default:D("156")}}}}
function af(a,b,c,d,e){function f(a){a.effectTag|=4}var h=a.createInstance,g=a.createTextInstance,k=a.appendInitialChild,v=a.finalizeInitialChildren,l=a.prepareUpdate,p=a.persistence,z=b.getRootHostContainer,B=b.popHostContext,r=b.getHostContext,Q=b.popHostContainer,n=c.popContextProvider,x=c.popTopLevelContextObject,Y=d.popProvider,G=e.prepareToHydrateHostInstance,R=e.prepareToHydrateHostTextInstance,S=e.popHydrationState,q=void 0,u=void 0,t=void 0;a.mutation?(q=function(){},u=function(a,b,c){(b.updateQueue=
c)&&f(b)},t=function(a,b,c,d){c!==d&&f(b)}):p?D("235"):D("236");return{completeWork:function(a,b,c){var d=b.pendingProps;switch(b.tag){case 1:return null;case 2:return n(b),a=b.stateNode,d=b.updateQueue,null!==d&&null!==d.capturedValues&&(b.effectTag&=-65,"function"===typeof a.componentDidCatch?b.effectTag|=256:d.capturedValues=null),null;case 3:Q(b);x(b);d=b.stateNode;d.pendingContext&&(d.context=d.pendingContext,d.pendingContext=null);if(null===a||null===a.child)S(b),b.effectTag&=-3;q(b);a=b.updateQueue;
null!==a&&null!==a.capturedValues&&(b.effectTag|=256);return null;case 5:B(b);c=z();var e=b.type;if(null!==a&&null!=b.stateNode){var p=a.memoizedProps,H=b.stateNode,y=r();H=l(H,e,p,d,c,y);u(a,b,H,e,p,d,c,y);a.ref!==b.ref&&(b.effectTag|=128)}else{if(!d)return null===b.stateNode?D("166"):void 0,null;a=r();if(S(b))G(b,c,a)&&f(b);else{p=h(e,d,c,a,b);a:for(y=b.child;null!==y;){if(5===y.tag||6===y.tag)k(p,y.stateNode);else if(4!==y.tag&&null!==y.child){y.child["return"]=y;y=y.child;continue}if(y===b)break;
for(;null===y.sibling;){if(null===y["return"]||y["return"]===b)break a;y=y["return"]}y.sibling["return"]=y["return"];y=y.sibling}v(p,e,d,c,a)&&f(b);b.stateNode=p}null!==b.ref&&(b.effectTag|=128)}return null;case 6:if(a&&null!=b.stateNode)t(a,b,a.memoizedProps,d);else{if("string"!==typeof d)return null===b.stateNode?D("166"):void 0,null;a=z();c=r();S(b)?R(b)&&f(b):b.stateNode=g(d,a,c,b)}return null;case 7:(d=b.memoizedProps)?void 0:D("165");b.tag=8;e=[];a:for((p=b.stateNode)&&(p["return"]=b);null!==
p;){if(5===p.tag||6===p.tag||4===p.tag)D("247");else if(9===p.tag)e.push(p.pendingProps.value);else if(null!==p.child){p.child["return"]=p;p=p.child;continue}for(;null===p.sibling;){if(null===p["return"]||p["return"]===b)break a;p=p["return"]}p.sibling["return"]=p["return"];p=p.sibling}p=d.handler;d=p(d.props,e);b.child=Ye(b,null!==a?a.child:null,d,c);return b.child;case 8:return b.tag=7,null;case 9:return null;case 14:return null;case 10:return null;case 11:return null;case 4:return Q(b),q(b),null;
case 13:return Y(b),null;case 12:return null;case 0:D("167");default:D("156")}}}}
function bf(a,b,c,d,e){var f=a.popHostContainer,h=a.popHostContext,g=b.popContextProvider,k=b.popTopLevelContextObject,v=c.popProvider;return{throwException:function(a,b,c){b.effectTag|=512;b.firstEffect=b.lastEffect=null;b={value:c,source:b,stack:Bc(b)};do{switch(a.tag){case 3:Oe(a);a.updateQueue.capturedValues=[b];a.effectTag|=1024;return;case 2:if(c=a.stateNode,0===(a.effectTag&64)&&null!==c&&"function"===typeof c.componentDidCatch&&!e(c)){Oe(a);c=a.updateQueue;var d=c.capturedValues;null===d?
c.capturedValues=[b]:d.push(b);a.effectTag|=1024;return}}a=a["return"]}while(null!==a)},unwindWork:function(a){switch(a.tag){case 2:g(a);var b=a.effectTag;return b&1024?(a.effectTag=b&-1025|64,a):null;case 3:return f(a),k(a),b=a.effectTag,b&1024?(a.effectTag=b&-1025|64,a):null;case 5:return h(a),null;case 4:return f(a),null;case 13:return v(a),null;default:return null}},unwindInterruptedWork:function(a){switch(a.tag){case 2:g(a);break;case 3:f(a);k(a);break;case 5:h(a);break;case 4:f(a);break;case 13:v(a)}}}}
function cf(a,b){var c=b.source;null===b.stack&&Bc(c);null!==c&&Ac(c);b=b.value;null!==a&&2===a.tag&&Ac(a);try{b&&b.suppressReactErrorLogging||console.error(b)}catch(d){d&&d.suppressReactErrorLogging||console.error(d)}}
function df(a,b,c,d,e){function f(a){var c=a.ref;if(null!==c)if("function"===typeof c)try{c(null)}catch(t){b(a,t)}else c.current=null}function h(a){"function"===typeof Je&&Je(a);switch(a.tag){case 2:f(a);var c=a.stateNode;if("function"===typeof c.componentWillUnmount)try{c.props=a.memoizedProps,c.state=a.memoizedState,c.componentWillUnmount()}catch(t){b(a,t)}break;case 5:f(a);break;case 7:g(a.stateNode);break;case 4:p&&v(a)}}function g(a){for(var b=a;;)if(h(b),null===b.child||p&&4===b.tag){if(b===
a)break;for(;null===b.sibling;){if(null===b["return"]||b["return"]===a)return;b=b["return"]}b.sibling["return"]=b["return"];b=b.sibling}else b.child["return"]=b,b=b.child}function k(a){return 5===a.tag||3===a.tag||4===a.tag}function v(a){for(var b=a,c=!1,d=void 0,e=void 0;;){if(!c){c=b["return"];a:for(;;){null===c?D("160"):void 0;switch(c.tag){case 5:d=c.stateNode;e=!1;break a;case 3:d=c.stateNode.containerInfo;e=!0;break a;case 4:d=c.stateNode.containerInfo;e=!0;break a}c=c["return"]}c=!0}if(5===
b.tag||6===b.tag)g(b),e?S(d,b.stateNode):R(d,b.stateNode);else if(4===b.tag?d=b.stateNode.containerInfo:h(b),null!==b.child){b.child["return"]=b;b=b.child;continue}if(b===a)break;for(;null===b.sibling;){if(null===b["return"]||b["return"]===a)return;b=b["return"];4===b.tag&&(c=!1)}b.sibling["return"]=b["return"];b=b.sibling}}var l=a.getPublicInstance,p=a.mutation;a=a.persistence;p||(a?D("235"):D("236"));var z=p.commitMount,B=p.commitUpdate,r=p.resetTextContent,Q=p.commitTextUpdate,n=p.appendChild,
x=p.appendChildToContainer,Y=p.insertBefore,G=p.insertInContainerBefore,R=p.removeChild,S=p.removeChildFromContainer;return{commitBeforeMutationLifeCycles:function(a,b){switch(b.tag){case 2:if(b.effectTag&2048&&null!==a){var c=a.memoizedProps,d=a.memoizedState;a=b.stateNode;a.props=b.memoizedProps;a.state=b.memoizedState;b=a.getSnapshotBeforeUpdate(c,d);a.__reactInternalSnapshotBeforeUpdate=b}break;case 3:case 5:case 6:case 4:break;default:D("163")}},commitResetTextContent:function(a){r(a.stateNode)},
commitPlacement:function(a){a:{for(var b=a["return"];null!==b;){if(k(b)){var c=b;break a}b=b["return"]}D("160");c=void 0}var d=b=void 0;switch(c.tag){case 5:b=c.stateNode;d=!1;break;case 3:b=c.stateNode.containerInfo;d=!0;break;case 4:b=c.stateNode.containerInfo;d=!0;break;default:D("161")}c.effectTag&16&&(r(b),c.effectTag&=-17);a:b:for(c=a;;){for(;null===c.sibling;){if(null===c["return"]||k(c["return"])){c=null;break a}c=c["return"]}c.sibling["return"]=c["return"];for(c=c.sibling;5!==c.tag&&6!==
c.tag;){if(c.effectTag&2)continue b;if(null===c.child||4===c.tag)continue b;else c.child["return"]=c,c=c.child}if(!(c.effectTag&2)){c=c.stateNode;break a}}for(var e=a;;){if(5===e.tag||6===e.tag)c?d?G(b,e.stateNode,c):Y(b,e.stateNode,c):d?x(b,e.stateNode):n(b,e.stateNode);else if(4!==e.tag&&null!==e.child){e.child["return"]=e;e=e.child;continue}if(e===a)break;for(;null===e.sibling;){if(null===e["return"]||e["return"]===a)return;e=e["return"]}e.sibling["return"]=e["return"];e=e.sibling}},commitDeletion:function(a){v(a);
a["return"]=null;a.child=null;a.alternate&&(a.alternate.child=null,a.alternate["return"]=null)},commitWork:function(a,b){switch(b.tag){case 2:break;case 5:var c=b.stateNode;if(null!=c){var d=b.memoizedProps;a=null!==a?a.memoizedProps:d;var e=b.type,f=b.updateQueue;b.updateQueue=null;null!==f&&B(c,f,e,a,d,b)}break;case 6:null===b.stateNode?D("162"):void 0;c=b.memoizedProps;Q(b.stateNode,null!==a?a.memoizedProps:c,c);break;case 3:break;default:D("163")}},commitLifeCycles:function(a,b,c){switch(c.tag){case 2:a=
c.stateNode;if(c.effectTag&4)if(null===b)a.props=c.memoizedProps,a.state=c.memoizedState,a.componentDidMount();else{var d=b.memoizedProps;b=b.memoizedState;a.props=c.memoizedProps;a.state=c.memoizedState;a.componentDidUpdate(d,b,a.__reactInternalSnapshotBeforeUpdate)}c=c.updateQueue;null!==c&&Se(c,a);break;case 3:b=c.updateQueue;if(null!==b){a=null;if(null!==c.child)switch(c.child.tag){case 5:a=l(c.child.stateNode);break;case 2:a=c.child.stateNode}Se(b,a)}break;case 5:a=c.stateNode;null===b&&c.effectTag&
4&&z(a,c.type,c.memoizedProps,c);break;case 6:break;case 4:break;default:D("163")}},commitErrorLogging:function(a,b){switch(a.tag){case 2:var c=a.type;b=a.stateNode;var d=a.updateQueue;null===d||null===d.capturedValues?D("264"):void 0;var f=d.capturedValues;d.capturedValues=null;"function"!==typeof c.getDerivedStateFromCatch&&e(b);b.props=a.memoizedProps;b.state=a.memoizedState;for(c=0;c<f.length;c++){d=f[c];var l=d.value,g=d.stack;cf(a,d);b.componentDidCatch(l,{componentStack:null!==g?g:""})}break;
case 3:c=a.updateQueue;null===c||null===c.capturedValues?D("264"):void 0;f=c.capturedValues;c.capturedValues=null;for(c=0;c<f.length;c++)d=f[c],cf(a,d),b(d.value);break;default:D("265")}},commitAttachRef:function(a){var b=a.ref;if(null!==b){var c=a.stateNode;switch(a.tag){case 5:a=l(c);break;default:a=c}"function"===typeof b?b(a):b.current=a}},commitDetachRef:function(a){a=a.ref;null!==a&&("function"===typeof a?a(null):a.current=null)}}}var ef={};
function ff(a,b){function c(a){a===ef?D("174"):void 0;return a}var d=a.getChildHostContext,e=a.getRootHostContext;a=b.createCursor;var f=b.push,h=b.pop,g=a(ef),k=a(ef),v=a(ef);return{getHostContext:function(){return c(g.current)},getRootHostContainer:function(){return c(v.current)},popHostContainer:function(a){h(g,a);h(k,a);h(v,a)},popHostContext:function(a){k.current===a&&(h(g,a),h(k,a))},pushHostContainer:function(a,b){f(v,b,a);f(k,a,a);f(g,ef,a);b=e(b);h(g,a);f(g,b,a)},pushHostContext:function(a){var b=
c(v.current),e=c(g.current);b=d(e,a.type,b);e!==b&&(f(k,a,a),f(g,b,a))}}}
function gf(a){function b(a,b){var c=new xe(5,null,null,0);c.type="DELETED";c.stateNode=b;c["return"]=a;c.effectTag=8;null!==a.lastEffect?(a.lastEffect.nextEffect=c,a.lastEffect=c):a.firstEffect=a.lastEffect=c}function c(a,b){switch(a.tag){case 5:return b=f(b,a.type,a.pendingProps),null!==b?(a.stateNode=b,!0):!1;case 6:return b=h(b,a.pendingProps),null!==b?(a.stateNode=b,!0):!1;default:return!1}}function d(a){for(a=a["return"];null!==a&&5!==a.tag&&3!==a.tag;)a=a["return"];p=a}var e=a.shouldSetTextContent;
a=a.hydration;if(!a)return{enterHydrationState:function(){return!1},resetHydrationState:function(){},tryToClaimNextHydratableInstance:function(){},prepareToHydrateHostInstance:function(){D("175")},prepareToHydrateHostTextInstance:function(){D("176")},popHydrationState:function(){return!1}};var f=a.canHydrateInstance,h=a.canHydrateTextInstance,g=a.getNextHydratableSibling,k=a.getFirstHydratableChild,v=a.hydrateInstance,l=a.hydrateTextInstance,p=null,z=null,B=!1;return{enterHydrationState:function(a){z=
k(a.stateNode.containerInfo);p=a;return B=!0},resetHydrationState:function(){z=p=null;B=!1},tryToClaimNextHydratableInstance:function(a){if(B){var d=z;if(d){if(!c(a,d)){d=g(d);if(!d||!c(a,d)){a.effectTag|=2;B=!1;p=a;return}b(p,z)}p=a;z=k(d)}else a.effectTag|=2,B=!1,p=a}},prepareToHydrateHostInstance:function(a,b,c){b=v(a.stateNode,a.type,a.memoizedProps,b,c,a);a.updateQueue=b;return null!==b?!0:!1},prepareToHydrateHostTextInstance:function(a){return l(a.stateNode,a.memoizedProps,a)},popHydrationState:function(a){if(a!==
p)return!1;if(!B)return d(a),B=!0,!1;var c=a.type;if(5!==a.tag||"head"!==c&&"body"!==c&&!e(c,a.memoizedProps))for(c=z;c;)b(a,c),c=g(c);d(a);z=p?g(a.stateNode):null;return!0}}}
function hf(a){function b(a,b,c){a=a.stateNode;a.__reactInternalMemoizedUnmaskedChildContext=b;a.__reactInternalMemoizedMaskedChildContext=c}function c(a){return 2===a.tag&&null!=a.type.childContextTypes}function d(a,b){var c=a.stateNode,d=a.type.childContextTypes;if("function"!==typeof c.getChildContext)return b;c=c.getChildContext();for(var e in c)e in d?void 0:D("108",Ac(a)||"Unknown",e);return A({},b,c)}var e=a.createCursor,f=a.push,h=a.pop,g=e(ka),k=e(!1),v=ka;return{getUnmaskedContext:function(a){return c(a)?
v:g.current},cacheContext:b,getMaskedContext:function(a,c){var d=a.type.contextTypes;if(!d)return ka;var e=a.stateNode;if(e&&e.__reactInternalMemoizedUnmaskedChildContext===c)return e.__reactInternalMemoizedMaskedChildContext;var f={},g;for(g in d)f[g]=c[g];e&&b(a,c,f);return f},hasContextChanged:function(){return k.current},isContextConsumer:function(a){return 2===a.tag&&null!=a.type.contextTypes},isContextProvider:c,popContextProvider:function(a){c(a)&&(h(k,a),h(g,a))},popTopLevelContextObject:function(a){h(k,
a);h(g,a)},pushTopLevelContextObject:function(a,b,c){null!=g.cursor?D("168"):void 0;f(g,b,a);f(k,c,a)},processChildContext:d,pushContextProvider:function(a){if(!c(a))return!1;var b=a.stateNode;b=b&&b.__reactInternalMemoizedMergedChildContext||ka;v=g.current;f(g,b,a);f(k,k.current,a);return!0},invalidateContextProvider:function(a,b){var c=a.stateNode;c?void 0:D("169");if(b){var e=d(a,v);c.__reactInternalMemoizedMergedChildContext=e;h(k,a);h(g,a);f(g,e,a)}else h(k,a);f(k,b,a)},findCurrentUnmaskedContext:function(a){for(2!==
xd(a)||2!==a.tag?D("170"):void 0;3!==a.tag;){if(c(a))return a.stateNode.__reactInternalMemoizedMergedChildContext;(a=a["return"])?void 0:D("171")}return a.stateNode.context}}}
function jf(a){var b=a.createCursor,c=a.push,d=a.pop,e=b(null),f=b(null),h=b(0);return{pushProvider:function(a){var b=a.type._context;c(h,b._changedBits,a);c(f,b._currentValue,a);c(e,a,a);b._currentValue=a.pendingProps.value;b._changedBits=a.stateNode},popProvider:function(a){var b=h.current,c=f.current;d(e,a);d(f,a);d(h,a);a=a.type._context;a._currentValue=c;a._changedBits=b}}}
function kf(){var a=[],b=-1;return{createCursor:function(a){return{current:a}},isEmpty:function(){return-1===b},pop:function(c){0>b||(c.current=a[b],a[b]=null,b--)},push:function(c,d){b++;a[b]=c.current;c.current=d},checkThatStackIsEmpty:function(){},resetStackAfterFatalErrorInDev:function(){}}}
function lf(a){function b(){if(null!==I)for(var a=I["return"];null!==a;)Lc(a),a=a["return"];Ya=null;Z=0;I=null;Nc=!1}function c(a){return null!==ya&&ya.has(a)}function d(a){for(;;){var b=a.alternate,c=a["return"],d=a.sibling;if(0===(a.effectTag&512)){b=Cb(b,a,Z);var e=a;if(1073741823===Z||1073741823!==e.expirationTime){b:switch(e.tag){case 3:case 2:var f=e.updateQueue;f=null===f?0:f.expirationTime;break b;default:f=0}for(var g=e.child;null!==g;)0!==g.expirationTime&&(0===f||f>g.expirationTime)&&(f=
g.expirationTime),g=g.sibling;e.expirationTime=f}if(null!==b)return b;null!==c&&0===(c.effectTag&512)&&(null===c.firstEffect&&(c.firstEffect=a.firstEffect),null!==a.lastEffect&&(null!==c.lastEffect&&(c.lastEffect.nextEffect=a.firstEffect),c.lastEffect=a.lastEffect),1<a.effectTag&&(null!==c.lastEffect?c.lastEffect.nextEffect=a:c.firstEffect=a,c.lastEffect=a));if(null!==d)return d;if(null!==c)a=c;else{Nc=!0;break}}else{a=Kc(a);if(null!==a)return a.effectTag&=2559,a;null!==c&&(c.firstEffect=c.lastEffect=
null,c.effectTag|=512);if(null!==d)return d;if(null!==c)a=c;else break}}return null}function e(a){var b=Wa(a.alternate,a,Z);null===b&&(b=d(a));nc.current=null;return b}function f(a,c,f){ca?D("243"):void 0;ca=!0;if(c!==Z||a!==Ya||null===I)b(),Ya=a,Z=c,I=ze(Ya.current,null,Z),a.pendingCommitExpirationTime=0;var g=!1;do{try{if(f)for(;null!==I&&!S();)I=e(I);else for(;null!==I;)I=e(I)}catch(Oc){if(null===I){g=!0;q(Oc);break}f=I;var h=f["return"];if(null===h){g=!0;q(Oc);break}Jc(h,f,Oc);I=d(f)}break}while(1);
ca=!1;if(g||null!==I)return null;if(Nc)return a.pendingCommitExpirationTime=c,a.current.alternate;D("262")}function h(a,b,c,d){a={value:c,source:a,stack:Bc(a)};Pe(b,{expirationTime:d,partialState:null,callback:null,isReplace:!1,isForced:!1,capturedValue:a,next:null});v(b,d)}function g(a,b){a:{ca&&!Za?D("263"):void 0;for(var d=a["return"];null!==d;){switch(d.tag){case 2:var e=d.stateNode;if("function"===typeof d.type.getDerivedStateFromCatch||"function"===typeof e.componentDidCatch&&!c(e)){h(a,d,b,
1);a=void 0;break a}break;case 3:h(a,d,b,1);a=void 0;break a}d=d["return"]}3===a.tag&&h(a,a,b,1);a=void 0}return a}function k(a){a=0!==ia?ia:ca?Za?1:Z:a.mode&1?za?10*(((l()+15)/10|0)+1):25*(((l()+500)/25|0)+1):1;za&&(0===da||a>da)&&(da=a);return a}function v(a,c){a:{for(;null!==a;){if(0===a.expirationTime||a.expirationTime>c)a.expirationTime=c;null!==a.alternate&&(0===a.alternate.expirationTime||a.alternate.expirationTime>c)&&(a.alternate.expirationTime=c);if(null===a["return"])if(3===a.tag){var d=
a.stateNode;!ca&&0!==Z&&c<Z&&b();ca&&!Za&&Ya===d||B(d,c);Fb>xg&&D("185")}else{c=void 0;break a}a=a["return"]}c=void 0}return c}function l(){ye=Ic()-Pc;return yg=(ye/10|0)+2}function p(a,b,c,d,e){var f=ia;ia=1;try{return a(b,c,d,e)}finally{ia=f}}function z(a){if(0!==Gb){if(a>Gb)return;mg(Qc)}var b=Ic()-Pc;Gb=a;Qc=lg(Q,{timeout:10*(a-2)-b})}function B(a,b){if(null===a.nextScheduledRoot)a.remainingExpirationTime=b,null===K?(la=K=a,a.nextScheduledRoot=a):(K=K.nextScheduledRoot=a,K.nextScheduledRoot=la);
else{var c=a.remainingExpirationTime;if(0===c||b<c)a.remainingExpirationTime=b}T||(J?Hb&&(aa=a,P=1,G(a,1,!1)):1===b?n():z(b))}function r(){var a=0,b=null;if(null!==K)for(var c=K,d=la;null!==d;){var e=d.remainingExpirationTime;if(0===e){null===c||null===K?D("244"):void 0;if(d===d.nextScheduledRoot){la=K=d.nextScheduledRoot=null;break}else if(d===la)la=e=d.nextScheduledRoot,K.nextScheduledRoot=e,d.nextScheduledRoot=null;else if(d===K){K=c;K.nextScheduledRoot=la;d.nextScheduledRoot=null;break}else c.nextScheduledRoot=
d.nextScheduledRoot,d.nextScheduledRoot=null;d=c.nextScheduledRoot}else{if(0===a||e<a)a=e,b=d;if(d===K)break;c=d;d=d.nextScheduledRoot}}c=aa;null!==c&&c===b&&1===a?Fb++:Fb=0;aa=b;P=a}function Q(a){x(0,!0,a)}function n(){x(1,!1,null)}function x(a,b,c){$a=c;r();if(b)for(;null!==aa&&0!==P&&(0===a||a>=P)&&(!Ib||l()>=P);)G(aa,P,!Ib),r();else for(;null!==aa&&0!==P&&(0===a||a>=P);)G(aa,P,!1),r();null!==$a&&(Gb=0,Qc=-1);0!==P&&z(P);$a=null;Ib=!1;Y()}function Y(){Fb=0;if(null!==Aa){var a=Aa;Aa=null;for(var b=
0;b<a.length;b++){var c=a[b];try{c._onComplete()}catch(wg){Ba||(Ba=!0,Jb=wg)}}}if(Ba)throw a=Jb,Jb=null,Ba=!1,a;}function G(a,b,c){T?D("245"):void 0;T=!0;c?(c=a.finishedWork,null!==c?R(a,c,b):(a.finishedWork=null,c=f(a,b,!0),null!==c&&(S()?a.finishedWork=c:R(a,c,b)))):(c=a.finishedWork,null!==c?R(a,c,b):(a.finishedWork=null,c=f(a,b,!1),null!==c&&R(a,c,b)));T=!1}function R(a,b,c){var d=a.firstBatch;if(null!==d&&d._expirationTime<=c&&(null===Aa?Aa=[d]:Aa.push(d),d._defer)){a.finishedWork=b;a.remainingExpirationTime=
0;return}a.finishedWork=null;Za=ca=!0;c=b.stateNode;c.current===b?D("177"):void 0;d=c.pendingCommitExpirationTime;0===d?D("261"):void 0;c.pendingCommitExpirationTime=0;var e=l();nc.current=null;if(1<b.effectTag)if(null!==b.lastEffect){b.lastEffect.nextEffect=b;var f=b.firstEffect}else f=b;else f=b.firstEffect;zg(c.containerInfo);for(w=f;null!==w;){var h=!1,k=void 0;try{for(;null!==w;)w.effectTag&2048&&Db(w.alternate,w),w=w.nextEffect}catch(ab){h=!0,k=ab}h&&(null===w?D("178"):void 0,g(w,k),null!==
w&&(w=w.nextEffect))}for(w=f;null!==w;){h=!1;k=void 0;try{for(;null!==w;){var p=w.effectTag;p&16&&Mc(w);if(p&128){var n=w.alternate;null!==n&&kg(n)}switch(p&14){case 2:Eb(w);w.effectTag&=-3;break;case 6:Eb(w);w.effectTag&=-3;we(w.alternate,w);break;case 4:we(w.alternate,w);break;case 8:gg(w)}w=w.nextEffect}}catch(ab){h=!0,k=ab}h&&(null===w?D("178"):void 0,g(w,k),null!==w&&(w=w.nextEffect))}Ag(c.containerInfo);c.current=b;for(w=f;null!==w;){p=!1;n=void 0;try{for(f=c,h=e,k=d;null!==w;){var r=w.effectTag;
r&36&&hg(f,w.alternate,w,h,k);r&256&&ig(w,q);r&128&&jg(w);var t=w.nextEffect;w.nextEffect=null;w=t}}catch(ab){p=!0,n=ab}p&&(null===w?D("178"):void 0,g(w,n),null!==w&&(w=w.nextEffect))}ca=Za=!1;"function"===typeof Ie&&Ie(b.stateNode);b=c.current.expirationTime;0===b&&(ya=null);a.remainingExpirationTime=b}function S(){return null===$a||$a.timeRemaining()>Bg?!1:Ib=!0}function q(a){null===aa?D("246"):void 0;aa.remainingExpirationTime=0;Ba||(Ba=!0,Jb=a)}var u=kf(),t=ff(a,u),y=hf(u);u=jf(u);var H=gf(a),
Wa=$e(a,t,y,u,H,v,k).beginWork,Cb=af(a,t,y,u,H).completeWork;t=bf(t,y,u,v,c);var Jc=t.throwException,Kc=t.unwindWork,Lc=t.unwindInterruptedWork;t=df(a,g,v,k,function(a){null===ya?ya=new Set([a]):ya.add(a)},l);var Db=t.commitBeforeMutationLifeCycles,Mc=t.commitResetTextContent,Eb=t.commitPlacement,gg=t.commitDeletion,we=t.commitWork,hg=t.commitLifeCycles,ig=t.commitErrorLogging,jg=t.commitAttachRef,kg=t.commitDetachRef,Ic=a.now,lg=a.scheduleDeferredCallback,mg=a.cancelDeferredCallback,zg=a.prepareForCommit,
Ag=a.resetAfterCommit,Pc=Ic(),yg=2,ye=Pc,Rc=0,ia=0,ca=!1,I=null,Ya=null,Z=0,w=null,Za=!1,Nc=!1,ya=null,la=null,K=null,Gb=0,Qc=-1,T=!1,aa=null,P=0,da=0,Ib=!1,Ba=!1,Jb=null,$a=null,J=!1,Hb=!1,za=!1,Aa=null,xg=1E3,Fb=0,Bg=1;return{recalculateCurrentTime:l,computeExpirationForFiber:k,scheduleWork:v,requestWork:B,flushRoot:function(a,b){T?D("253"):void 0;aa=a;P=b;G(a,b,!1);n();Y()},batchedUpdates:function(a,b){var c=J;J=!0;try{return a(b)}finally{(J=c)||T||n()}},unbatchedUpdates:function(a,b){if(J&&!Hb){Hb=
!0;try{return a(b)}finally{Hb=!1}}return a(b)},flushSync:function(a,b){T?D("187"):void 0;var c=J;J=!0;try{return p(a,b)}finally{J=c,n()}},flushControlled:function(a){var b=J;J=!0;try{p(a)}finally{(J=b)||T||x(1,!1,null)}},deferredUpdates:function(a){var b=ia;ia=25*(((l()+500)/25|0)+1);try{return a()}finally{ia=b}},syncUpdates:p,interactiveUpdates:function(a,b,c){if(za)return a(b,c);J||T||0===da||(x(da,!1,null),da=0);var d=za,e=J;J=za=!0;try{return a(b,c)}finally{za=d,(J=e)||T||n()}},flushInteractiveUpdates:function(){T||
0===da||(x(da,!1,null),da=0)},computeUniqueAsyncExpiration:function(){var a=25*(((l()+500)/25|0)+1);a<=Rc&&(a=Rc+1);return Rc=a},legacyContext:y}}
function mf(a){function b(a,b,c,d,e,h){d=b.current;if(c){c=c._reactInternalFiber;var l=g(c);c=k(c)?v(c,l):l}else c=ka;null===b.context?b.context=c:b.pendingContext=c;b=h;Pe(d,{expirationTime:e,partialState:{element:a},callback:void 0===b?null:b,isReplace:!1,isForced:!1,capturedValue:null,next:null});f(d,e);return e}var c=a.getPublicInstance;a=lf(a);var d=a.recalculateCurrentTime,e=a.computeExpirationForFiber,f=a.scheduleWork,h=a.legacyContext,g=h.findCurrentUnmaskedContext,k=h.isContextProvider,v=
h.processChildContext;return{createContainer:function(a,b,c){b=new xe(3,null,null,b?3:0);a={current:b,containerInfo:a,pendingChildren:null,pendingCommitExpirationTime:0,finishedWork:null,context:null,pendingContext:null,hydrate:c,remainingExpirationTime:0,firstBatch:null,nextScheduledRoot:null};return b.stateNode=a},updateContainer:function(a,c,f,h){var g=c.current,k=d();g=e(g);return b(a,c,f,k,g,h)},updateContainerAtExpirationTime:function(a,c,e,f,g){var h=d();return b(a,c,e,h,f,g)},flushRoot:a.flushRoot,
requestWork:a.requestWork,computeUniqueAsyncExpiration:a.computeUniqueAsyncExpiration,batchedUpdates:a.batchedUpdates,unbatchedUpdates:a.unbatchedUpdates,deferredUpdates:a.deferredUpdates,syncUpdates:a.syncUpdates,interactiveUpdates:a.interactiveUpdates,flushInteractiveUpdates:a.flushInteractiveUpdates,flushControlled:a.flushControlled,flushSync:a.flushSync,getPublicRootInstance:function(a){a=a.current;if(!a.child)return null;switch(a.child.tag){case 5:return c(a.child.stateNode);default:return a.child.stateNode}},
findHostInstance:function(a){var b=a._reactInternalFiber;void 0===b&&("function"===typeof a.render?D("188"):D("268",Object.keys(a)));a=Bd(b);return null===a?null:a.stateNode},findHostInstanceWithNoPortals:function(a){a=Cd(a);return null===a?null:a.stateNode},injectIntoDevTools:function(a){var b=a.findFiberByHostInstance;return He(A({},a,{findHostInstanceByFiber:function(a){a=Bd(a);return null===a?null:a.stateNode},findFiberByHostInstance:function(a){return b?b(a):null}}))}}}
var nf=Object.freeze({default:mf}),of=nf&&mf||nf,pf=of["default"]?of["default"]:of;function qf(a,b,c){var d=3<arguments.length&&void 0!==arguments[3]?arguments[3]:null;return{$$typeof:rc,key:null==d?null:""+d,children:a,containerInfo:b,implementation:c}}var rf="object"===typeof performance&&"function"===typeof performance.now,sf=void 0;sf=rf?function(){return performance.now()}:function(){return Date.now()};var tf=void 0,uf=void 0;
if(m.canUseDOM)if("function"!==typeof requestIdleCallback||"function"!==typeof cancelIdleCallback){var vf=null,wf=!1,xf=-1,yf=!1,zf=0,Af=33,Bf=33,Cf=void 0;Cf=rf?{didTimeout:!1,timeRemaining:function(){var a=zf-performance.now();return 0<a?a:0}}:{didTimeout:!1,timeRemaining:function(){var a=zf-Date.now();return 0<a?a:0}};var Df="__reactIdleCallback$"+Math.random().toString(36).slice(2);window.addEventListener("message",function(a){if(a.source===window&&a.data===Df){wf=!1;a=sf();if(0>=zf-a)if(-1!==
xf&&xf<=a)Cf.didTimeout=!0;else{yf||(yf=!0,requestAnimationFrame(Ef));return}else Cf.didTimeout=!1;xf=-1;a=vf;vf=null;null!==a&&a(Cf)}},!1);var Ef=function(a){yf=!1;var b=a-zf+Bf;b<Bf&&Af<Bf?(8>b&&(b=8),Bf=b<Af?Af:b):Af=b;zf=a+Bf;wf||(wf=!0,window.postMessage(Df,"*"))};tf=function(a,b){vf=a;null!=b&&"number"===typeof b.timeout&&(xf=sf()+b.timeout);yf||(yf=!0,requestAnimationFrame(Ef));return 0};uf=function(){vf=null;wf=!1;xf=-1}}else tf=window.requestIdleCallback,uf=window.cancelIdleCallback;else tf=
function(a){return setTimeout(function(){a({timeRemaining:function(){return Infinity},didTimeout:!1})})},uf=function(a){clearTimeout(a)};function Ff(a){var b="";ea.Children.forEach(a,function(a){null==a||"string"!==typeof a&&"number"!==typeof a||(b+=a)});return b}function Gf(a,b){a=A({children:void 0},b);if(b=Ff(b.children))a.children=b;return a}
function Hf(a,b,c,d){a=a.options;if(b){b={};for(var e=0;e<c.length;e++)b["$"+c[e]]=!0;for(c=0;c<a.length;c++)e=b.hasOwnProperty("$"+a[c].value),a[c].selected!==e&&(a[c].selected=e),e&&d&&(a[c].defaultSelected=!0)}else{c=""+c;b=null;for(e=0;e<a.length;e++){if(a[e].value===c){a[e].selected=!0;d&&(a[e].defaultSelected=!0);return}null!==b||a[e].disabled||(b=a[e])}null!==b&&(b.selected=!0)}}
function If(a,b){var c=b.value;a._wrapperState={initialValue:null!=c?c:b.defaultValue,wasMultiple:!!b.multiple}}function Jf(a,b){null!=b.dangerouslySetInnerHTML?D("91"):void 0;return A({},b,{value:void 0,defaultValue:void 0,children:""+a._wrapperState.initialValue})}function Kf(a,b){var c=b.value;null==c&&(c=b.defaultValue,b=b.children,null!=b&&(null!=c?D("92"):void 0,Array.isArray(b)&&(1>=b.length?void 0:D("93"),b=b[0]),c=""+b),null==c&&(c=""));a._wrapperState={initialValue:""+c}}
function Lf(a,b){var c=b.value;null!=c&&(c=""+c,c!==a.value&&(a.value=c),null==b.defaultValue&&(a.defaultValue=c));null!=b.defaultValue&&(a.defaultValue=b.defaultValue)}function Mf(a){var b=a.textContent;b===a._wrapperState.initialValue&&(a.value=b)}var Nf={html:"http://www.w3.org/1999/xhtml",mathml:"http://www.w3.org/1998/Math/MathML",svg:"http://www.w3.org/2000/svg"};
function Of(a){switch(a){case "svg":return"http://www.w3.org/2000/svg";case "math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function Pf(a,b){return null==a||"http://www.w3.org/1999/xhtml"===a?Of(b):"http://www.w3.org/2000/svg"===a&&"foreignObject"===b?"http://www.w3.org/1999/xhtml":a}
var Qf=void 0,Rf=function(a){return"undefined"!==typeof MSApp&&MSApp.execUnsafeLocalFunction?function(b,c,d,e){MSApp.execUnsafeLocalFunction(function(){return a(b,c,d,e)})}:a}(function(a,b){if(a.namespaceURI!==Nf.svg||"innerHTML"in a)a.innerHTML=b;else{Qf=Qf||document.createElement("div");Qf.innerHTML="\x3csvg\x3e"+b+"\x3c/svg\x3e";for(b=Qf.firstChild;a.firstChild;)a.removeChild(a.firstChild);for(;b.firstChild;)a.appendChild(b.firstChild)}});
function Sf(a,b){if(b){var c=a.firstChild;if(c&&c===a.lastChild&&3===c.nodeType){c.nodeValue=b;return}}a.textContent=b}
var Tf={animationIterationCount:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,
stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},Uf=["Webkit","ms","Moz","O"];Object.keys(Tf).forEach(function(a){Uf.forEach(function(b){b=b+a.charAt(0).toUpperCase()+a.substring(1);Tf[b]=Tf[a]})});
function Vf(a,b){a=a.style;for(var c in b)if(b.hasOwnProperty(c)){var d=0===c.indexOf("--");var e=c;var f=b[c];e=null==f||"boolean"===typeof f||""===f?"":d||"number"!==typeof f||0===f||Tf.hasOwnProperty(e)&&Tf[e]?(""+f).trim():f+"px";"float"===c&&(c="cssFloat");d?a.setProperty(c,e):a[c]=e}}var Wf=A({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});
function Xf(a,b,c){b&&(Wf[a]&&(null!=b.children||null!=b.dangerouslySetInnerHTML?D("137",a,c()):void 0),null!=b.dangerouslySetInnerHTML&&(null!=b.children?D("60"):void 0,"object"===typeof b.dangerouslySetInnerHTML&&"__html"in b.dangerouslySetInnerHTML?void 0:D("61")),null!=b.style&&"object"!==typeof b.style?D("62",c()):void 0)}
function Yf(a,b){if(-1===a.indexOf("-"))return"string"===typeof b.is;switch(a){case "annotation-xml":case "color-profile":case "font-face":case "font-face-src":case "font-face-uri":case "font-face-format":case "font-face-name":case "missing-glyph":return!1;default:return!0}}var Zf=C.thatReturns("");
function $f(a,b){a=9===a.nodeType||11===a.nodeType?a:a.ownerDocument;var c=ke(a);b=va[b];for(var d=0;d<b.length;d++){var e=b[d];c.hasOwnProperty(e)&&c[e]||("topScroll"===e?Zd("topScroll","scroll",a):"topFocus"===e||"topBlur"===e?(Zd("topFocus","focus",a),Zd("topBlur","blur",a),c.topBlur=!0,c.topFocus=!0):"topCancel"===e?(ic("cancel",!0)&&Zd("topCancel","cancel",a),c.topCancel=!0):"topClose"===e?(ic("close",!0)&&Zd("topClose","close",a),c.topClose=!0):fe.hasOwnProperty(e)&&W(e,fe[e],a),c[e]=!0)}}
function ag(a,b,c,d){c=9===c.nodeType?c:c.ownerDocument;d===Nf.html&&(d=Of(a));d===Nf.html?"script"===a?(a=c.createElement("div"),a.innerHTML="\x3cscript\x3e\x3c/script\x3e",a=a.removeChild(a.firstChild)):a="string"===typeof b.is?c.createElement(a,{is:b.is}):c.createElement(a):a=c.createElementNS(d,a);return a}function bg(a,b){return(9===b.nodeType?b:b.ownerDocument).createTextNode(a)}
function cg(a,b,c,d){var e=Yf(b,c);switch(b){case "iframe":case "object":W("topLoad","load",a);var f=c;break;case "video":case "audio":for(f in ge)ge.hasOwnProperty(f)&&W(f,ge[f],a);f=c;break;case "source":W("topError","error",a);f=c;break;case "img":case "image":case "link":W("topError","error",a);W("topLoad","load",a);f=c;break;case "form":W("topReset","reset",a);W("topSubmit","submit",a);f=c;break;case "details":W("topToggle","toggle",a);f=c;break;case "input":Wc(a,c);f=Vc(a,c);W("topInvalid",
"invalid",a);$f(d,"onChange");break;case "option":f=Gf(a,c);break;case "select":If(a,c);f=A({},c,{value:void 0});W("topInvalid","invalid",a);$f(d,"onChange");break;case "textarea":Kf(a,c);f=Jf(a,c);W("topInvalid","invalid",a);$f(d,"onChange");break;default:f=c}Xf(b,f,Zf);var h=f,g;for(g in h)if(h.hasOwnProperty(g)){var k=h[g];"style"===g?Vf(a,k,Zf):"dangerouslySetInnerHTML"===g?(k=k?k.__html:void 0,null!=k&&Rf(a,k)):"children"===g?"string"===typeof k?("textarea"!==b||""!==k)&&Sf(a,k):"number"===typeof k&&
Sf(a,""+k):"suppressContentEditableWarning"!==g&&"suppressHydrationWarning"!==g&&"autoFocus"!==g&&(ua.hasOwnProperty(g)?null!=k&&$f(d,g):null!=k&&Uc(a,g,k,e))}switch(b){case "input":lc(a);ad(a,c);break;case "textarea":lc(a);Mf(a,c);break;case "option":null!=c.value&&a.setAttribute("value",c.value);break;case "select":a.multiple=!!c.multiple;b=c.value;null!=b?Hf(a,!!c.multiple,b,!1):null!=c.defaultValue&&Hf(a,!!c.multiple,c.defaultValue,!0);break;default:"function"===typeof f.onClick&&(a.onclick=C)}}
function dg(a,b,c,d,e){var f=null;switch(b){case "input":c=Vc(a,c);d=Vc(a,d);f=[];break;case "option":c=Gf(a,c);d=Gf(a,d);f=[];break;case "select":c=A({},c,{value:void 0});d=A({},d,{value:void 0});f=[];break;case "textarea":c=Jf(a,c);d=Jf(a,d);f=[];break;default:"function"!==typeof c.onClick&&"function"===typeof d.onClick&&(a.onclick=C)}Xf(b,d,Zf);b=a=void 0;var h=null;for(a in c)if(!d.hasOwnProperty(a)&&c.hasOwnProperty(a)&&null!=c[a])if("style"===a){var g=c[a];for(b in g)g.hasOwnProperty(b)&&(h||
(h={}),h[b]="")}else"dangerouslySetInnerHTML"!==a&&"children"!==a&&"suppressContentEditableWarning"!==a&&"suppressHydrationWarning"!==a&&"autoFocus"!==a&&(ua.hasOwnProperty(a)?f||(f=[]):(f=f||[]).push(a,null));for(a in d){var k=d[a];g=null!=c?c[a]:void 0;if(d.hasOwnProperty(a)&&k!==g&&(null!=k||null!=g))if("style"===a)if(g){for(b in g)!g.hasOwnProperty(b)||k&&k.hasOwnProperty(b)||(h||(h={}),h[b]="");for(b in k)k.hasOwnProperty(b)&&g[b]!==k[b]&&(h||(h={}),h[b]=k[b])}else h||(f||(f=[]),f.push(a,h)),
h=k;else"dangerouslySetInnerHTML"===a?(k=k?k.__html:void 0,g=g?g.__html:void 0,null!=k&&g!==k&&(f=f||[]).push(a,""+k)):"children"===a?g===k||"string"!==typeof k&&"number"!==typeof k||(f=f||[]).push(a,""+k):"suppressContentEditableWarning"!==a&&"suppressHydrationWarning"!==a&&(ua.hasOwnProperty(a)?(null!=k&&$f(e,a),f||g===k||(f=[])):(f=f||[]).push(a,k))}h&&(f=f||[]).push("style",h);return f}
function eg(a,b,c,d,e){"input"===c&&"radio"===e.type&&null!=e.name&&Yc(a,e);Yf(c,d);d=Yf(c,e);for(var f=0;f<b.length;f+=2){var h=b[f],g=b[f+1];"style"===h?Vf(a,g,Zf):"dangerouslySetInnerHTML"===h?Rf(a,g):"children"===h?Sf(a,g):Uc(a,h,g,d)}switch(c){case "input":Zc(a,e);break;case "textarea":Lf(a,e);break;case "select":a._wrapperState.initialValue=void 0,b=a._wrapperState.wasMultiple,a._wrapperState.wasMultiple=!!e.multiple,c=e.value,null!=c?Hf(a,!!e.multiple,c,!1):b!==!!e.multiple&&(null!=e.defaultValue?
Hf(a,!!e.multiple,e.defaultValue,!0):Hf(a,!!e.multiple,e.multiple?[]:"",!1))}}
function fg(a,b,c,d,e){switch(b){case "iframe":case "object":W("topLoad","load",a);break;case "video":case "audio":for(var f in ge)ge.hasOwnProperty(f)&&W(f,ge[f],a);break;case "source":W("topError","error",a);break;case "img":case "image":case "link":W("topError","error",a);W("topLoad","load",a);break;case "form":W("topReset","reset",a);W("topSubmit","submit",a);break;case "details":W("topToggle","toggle",a);break;case "input":Wc(a,c);W("topInvalid","invalid",a);$f(e,"onChange");break;case "select":If(a,
c);W("topInvalid","invalid",a);$f(e,"onChange");break;case "textarea":Kf(a,c),W("topInvalid","invalid",a),$f(e,"onChange")}Xf(b,c,Zf);d=null;for(var h in c)c.hasOwnProperty(h)&&(f=c[h],"children"===h?"string"===typeof f?a.textContent!==f&&(d=["children",f]):"number"===typeof f&&a.textContent!==""+f&&(d=["children",""+f]):ua.hasOwnProperty(h)&&null!=f&&$f(e,h));switch(b){case "input":lc(a);ad(a,c);break;case "textarea":lc(a);Mf(a,c);break;case "select":case "option":break;default:"function"===typeof c.onClick&&
(a.onclick=C)}return d}function ng(a,b){return a.nodeValue!==b}
var og=Object.freeze({createElement:ag,createTextNode:bg,setInitialProperties:cg,diffProperties:dg,updateProperties:eg,diffHydratedProperties:fg,diffHydratedText:ng,warnForUnmatchedText:function(){},warnForDeletedHydratableElement:function(){},warnForDeletedHydratableText:function(){},warnForInsertedHydratedElement:function(){},warnForInsertedHydratedText:function(){},restoreControlledState:function(a,b,c){switch(b){case "input":Zc(a,c);b=c.name;if("radio"===c.type&&null!=b){for(c=a;c.parentNode;)c=
c.parentNode;c=c.querySelectorAll("input[name\x3d"+JSON.stringify(""+b)+'][type\x3d"radio"]');for(b=0;b<c.length;b++){var d=c[b];if(d!==a&&d.form===a.form){var e=Xa(d);e?void 0:D("90");mc(d);Zc(d,e)}}}break;case "textarea":Lf(a,c);break;case "select":b=c.value,null!=b&&Hf(a,!!c.multiple,b,!1)}}});Tb.injectFiberControlledHostComponent(og);var pg=null,qg=null;
function rg(a){this._expirationTime=X.computeUniqueAsyncExpiration();this._root=a;this._callbacks=this._next=null;this._hasChildren=this._didComplete=!1;this._children=null;this._defer=!0}rg.prototype.render=function(a){this._defer?void 0:D("250");this._hasChildren=!0;this._children=a;var b=this._root._internalRoot,c=this._expirationTime,d=new sg;X.updateContainerAtExpirationTime(a,b,null,c,d._onCommit);return d};
rg.prototype.then=function(a){if(this._didComplete)a();else{var b=this._callbacks;null===b&&(b=this._callbacks=[]);b.push(a)}};
rg.prototype.commit=function(){var a=this._root._internalRoot,b=a.firstBatch;this._defer&&null!==b?void 0:D("251");if(this._hasChildren){var c=this._expirationTime;if(b!==this){this._hasChildren&&(c=this._expirationTime=b._expirationTime,this.render(this._children));for(var d=null,e=b;e!==this;)d=e,e=e._next;null===d?D("251"):void 0;d._next=e._next;this._next=b;a.firstBatch=this}this._defer=!1;X.flushRoot(a,c);b=this._next;this._next=null;b=a.firstBatch=b;null!==b&&b._hasChildren&&b.render(b._children)}else this._next=
null,this._defer=!1};rg.prototype._onComplete=function(){if(!this._didComplete){this._didComplete=!0;var a=this._callbacks;if(null!==a)for(var b=0;b<a.length;b++)(0,a[b])()}};function sg(){this._callbacks=null;this._didCommit=!1;this._onCommit=this._onCommit.bind(this)}sg.prototype.then=function(a){if(this._didCommit)a();else{var b=this._callbacks;null===b&&(b=this._callbacks=[]);b.push(a)}};
sg.prototype._onCommit=function(){if(!this._didCommit){this._didCommit=!0;var a=this._callbacks;if(null!==a)for(var b=0;b<a.length;b++){var c=a[b];"function"!==typeof c?D("191",c):void 0;c()}}};function tg(a,b,c){this._internalRoot=X.createContainer(a,b,c)}tg.prototype.render=function(a,b){var c=this._internalRoot,d=new sg;b=void 0===b?null:b;null!==b&&d.then(b);X.updateContainer(a,c,null,d._onCommit);return d};
tg.prototype.unmount=function(a){var b=this._internalRoot,c=new sg;a=void 0===a?null:a;null!==a&&c.then(a);X.updateContainer(null,b,null,c._onCommit);return c};tg.prototype.legacy_renderSubtreeIntoContainer=function(a,b,c){var d=this._internalRoot,e=new sg;c=void 0===c?null:c;null!==c&&e.then(c);X.updateContainer(b,d,a,e._onCommit);return e};
tg.prototype.createBatch=function(){var a=new rg(this),b=a._expirationTime,c=this._internalRoot,d=c.firstBatch;if(null===d)c.firstBatch=a,a._next=null;else{for(c=null;null!==d&&d._expirationTime<=b;)c=d,d=d._next;a._next=d;null!==c&&(c._next=a)}return a};function ug(a){return!(!a||1!==a.nodeType&&9!==a.nodeType&&11!==a.nodeType&&(8!==a.nodeType||" react-mount-point-unstable "!==a.nodeValue))}
function vg(a,b){switch(a){case "button":case "input":case "select":case "textarea":return!!b.autoFocus}return!1}
var X=pf({getRootHostContext:function(a){var b=a.nodeType;switch(b){case 9:case 11:a=(a=a.documentElement)?a.namespaceURI:Pf(null,"");break;default:b=8===b?a.parentNode:a,a=b.namespaceURI||null,b=b.tagName,a=Pf(a,b)}return a},getChildHostContext:function(a,b){return Pf(a,b)},getPublicInstance:function(a){return a},prepareForCommit:function(){pg=Vd;var a=fa();if(ne(a)){if("selectionStart"in a)var b={start:a.selectionStart,end:a.selectionEnd};else a:{var c=window.getSelection&&window.getSelection();
if(c&&0!==c.rangeCount){b=c.anchorNode;var d=c.anchorOffset,e=c.focusNode;c=c.focusOffset;try{b.nodeType,e.nodeType}catch(B){b=null;break a}var f=0,h=-1,g=-1,k=0,v=0,l=a,p=null;b:for(;;){for(var z;;){l!==b||0!==d&&3!==l.nodeType||(h=f+d);l!==e||0!==c&&3!==l.nodeType||(g=f+c);3===l.nodeType&&(f+=l.nodeValue.length);if(null===(z=l.firstChild))break;p=l;l=z}for(;;){if(l===a)break b;p===b&&++k===d&&(h=f);p===e&&++v===c&&(g=f);if(null!==(z=l.nextSibling))break;l=p;p=l.parentNode}l=z}b=-1===h||-1===g?null:
{start:h,end:g}}else b=null}b=b||{start:0,end:0}}else b=null;qg={focusedElem:a,selectionRange:b};Wd(!1)},resetAfterCommit:function(){var a=qg,b=fa(),c=a.focusedElem,d=a.selectionRange;if(b!==c&&ja(document.documentElement,c)){if(ne(c))if(b=d.start,a=d.end,void 0===a&&(a=b),"selectionStart"in c)c.selectionStart=b,c.selectionEnd=Math.min(a,c.value.length);else if(window.getSelection){b=window.getSelection();var e=c[mb()].length;a=Math.min(d.start,e);d=void 0===d.end?a:Math.min(d.end,e);!b.extend&&a>
d&&(e=d,d=a,a=e);e=me(c,a);var f=me(c,d);if(e&&f&&(1!==b.rangeCount||b.anchorNode!==e.node||b.anchorOffset!==e.offset||b.focusNode!==f.node||b.focusOffset!==f.offset)){var h=document.createRange();h.setStart(e.node,e.offset);b.removeAllRanges();a>d?(b.addRange(h),b.extend(f.node,f.offset)):(h.setEnd(f.node,f.offset),b.addRange(h))}}b=[];for(a=c;a=a.parentNode;)1===a.nodeType&&b.push({element:a,left:a.scrollLeft,top:a.scrollTop});c.focus();for(c=0;c<b.length;c++)a=b[c],a.element.scrollLeft=a.left,
a.element.scrollTop=a.top}qg=null;Wd(pg);pg=null},createInstance:function(a,b,c,d,e){a=ag(a,b,c,d);a[F]=e;a[Ta]=b;return a},appendInitialChild:function(a,b){a.appendChild(b)},finalizeInitialChildren:function(a,b,c,d){cg(a,b,c,d);return vg(b,c)},prepareUpdate:function(a,b,c,d,e){return dg(a,b,c,d,e)},shouldSetTextContent:function(a,b){return"textarea"===a||"string"===typeof b.children||"number"===typeof b.children||"object"===typeof b.dangerouslySetInnerHTML&&null!==b.dangerouslySetInnerHTML&&"string"===
typeof b.dangerouslySetInnerHTML.__html},shouldDeprioritizeSubtree:function(a,b){return!!b.hidden},createTextInstance:function(a,b,c,d){a=bg(a,b);a[F]=d;return a},now:sf,mutation:{commitMount:function(a,b,c){vg(b,c)&&a.focus()},commitUpdate:function(a,b,c,d,e){a[Ta]=e;eg(a,b,c,d,e)},resetTextContent:function(a){Sf(a,"")},commitTextUpdate:function(a,b,c){a.nodeValue=c},appendChild:function(a,b){a.appendChild(b)},appendChildToContainer:function(a,b){8===a.nodeType?a.parentNode.insertBefore(b,a):a.appendChild(b)},
insertBefore:function(a,b,c){a.insertBefore(b,c)},insertInContainerBefore:function(a,b,c){8===a.nodeType?a.parentNode.insertBefore(b,c):a.insertBefore(b,c)},removeChild:function(a,b){a.removeChild(b)},removeChildFromContainer:function(a,b){8===a.nodeType?a.parentNode.removeChild(b):a.removeChild(b)}},hydration:{canHydrateInstance:function(a,b){return 1!==a.nodeType||b.toLowerCase()!==a.nodeName.toLowerCase()?null:a},canHydrateTextInstance:function(a,b){return""===b||3!==a.nodeType?null:a},getNextHydratableSibling:function(a){for(a=
a.nextSibling;a&&1!==a.nodeType&&3!==a.nodeType;)a=a.nextSibling;return a},getFirstHydratableChild:function(a){for(a=a.firstChild;a&&1!==a.nodeType&&3!==a.nodeType;)a=a.nextSibling;return a},hydrateInstance:function(a,b,c,d,e,f){a[F]=f;a[Ta]=c;return fg(a,b,c,e,d)},hydrateTextInstance:function(a,b,c){a[F]=c;return ng(a,b)},didNotMatchHydratedContainerTextInstance:function(){},didNotMatchHydratedTextInstance:function(){},didNotHydrateContainerInstance:function(){},didNotHydrateInstance:function(){},
didNotFindHydratableContainerInstance:function(){},didNotFindHydratableContainerTextInstance:function(){},didNotFindHydratableInstance:function(){},didNotFindHydratableTextInstance:function(){}},scheduleDeferredCallback:tf,cancelDeferredCallback:uf}),Cg=X;ac=Cg.batchedUpdates;bc=Cg.interactiveUpdates;cc=Cg.flushInteractiveUpdates;
function Dg(a,b){b||(b=a?9===a.nodeType?a.documentElement:a.firstChild:null,b=!(!b||1!==b.nodeType||!b.hasAttribute("data-reactroot")));if(!b)for(var c;c=a.lastChild;)a.removeChild(c);return new tg(a,!1,b)}
function Eg(a,b,c,d,e){ug(c)?void 0:D("200");var f=c._reactRootContainer;if(f){if("function"===typeof e){var h=e;e=function(){var a=X.getPublicRootInstance(f._internalRoot);h.call(a)}}null!=a?f.legacy_renderSubtreeIntoContainer(a,b,e):f.render(b,e)}else{f=c._reactRootContainer=Dg(c,d);if("function"===typeof e){var g=e;e=function(){var a=X.getPublicRootInstance(f._internalRoot);g.call(a)}}X.unbatchedUpdates(function(){null!=a?f.legacy_renderSubtreeIntoContainer(a,b,e):f.render(b,e)})}return X.getPublicRootInstance(f._internalRoot)}
function Fg(a,b){var c=2<arguments.length&&void 0!==arguments[2]?arguments[2]:null;ug(b)?void 0:D("200");return qf(a,b,null,c)}
var Gg={createPortal:Fg,findDOMNode:function(a){return null==a?null:1===a.nodeType?a:X.findHostInstance(a)},hydrate:function(a,b,c){return Eg(null,a,b,!0,c)},render:function(a,b,c){return Eg(null,a,b,!1,c)},unstable_renderSubtreeIntoContainer:function(a,b,c,d){null==a||void 0===a._reactInternalFiber?D("38"):void 0;return Eg(a,b,c,!1,d)},unmountComponentAtNode:function(a){ug(a)?void 0:D("40");return a._reactRootContainer?(X.unbatchedUpdates(function(){Eg(null,null,a,!1,function(){a._reactRootContainer=
null})}),!0):!1},unstable_createPortal:function(){return Fg.apply(void 0,arguments)},unstable_batchedUpdates:X.batchedUpdates,unstable_deferredUpdates:X.deferredUpdates,flushSync:X.flushSync,unstable_flushControlled:X.flushControlled,__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED:{EventPluginHub:Ra,EventPluginRegistry:Ca,EventPropagators:kb,ReactControlledComponent:$b,ReactDOMComponentTree:bb,ReactDOMEventListener:$d},unstable_createRoot:function(a,b){return new tg(a,!0,null!=b&&!0===b.hydrate)}};
X.injectIntoDevTools({findFiberByHostInstance:Ua,bundleType:0,version:"16.3.2",rendererPackageName:"react-dom"});var Hg=Object.freeze({default:Gg}),Ig=Hg&&Gg||Hg;module.exports=Ig["default"]?Ig["default"]:Ig;


/***/ }),
/* 146 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @typechecks
 */

var isNode = __webpack_require__(147);

/**
 * @param {*} object The object to check.
 * @return {boolean} Whether or not the object is a DOM text node.
 */
function isTextNode(object) {
  return isNode(object) && object.nodeType == 3;
}

module.exports = isTextNode;

/***/ }),
/* 147 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @typechecks
 */

/**
 * @param {*} object The object to check.
 * @return {boolean} Whether or not the object is a DOM node.
 */
function isNode(object) {
  var doc = object ? object.ownerDocument || object : document;
  var defaultView = doc.defaultView || window;
  return !!(object && (typeof defaultView.Node === 'function' ? object instanceof defaultView.Node : typeof object === 'object' && typeof object.nodeType === 'number' && typeof object.nodeName === 'string'));
}

module.exports = isNode;

/***/ }),
/* 148 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/** @license React v16.3.2
 * react-dom.development.js
 *
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */





if (process.env.NODE_ENV !== "production") {
  (function() {
'use strict';

var invariant = __webpack_require__(3);
var React = __webpack_require__(2);
var warning = __webpack_require__(9);
var ExecutionEnvironment = __webpack_require__(48);
var _assign = __webpack_require__(6);
var emptyFunction = __webpack_require__(4);
var checkPropTypes = __webpack_require__(17);
var getActiveElement = __webpack_require__(49);
var shallowEqual = __webpack_require__(50);
var containsNode = __webpack_require__(51);
var emptyObject = __webpack_require__(8);
var hyphenateStyleName = __webpack_require__(149);
var camelizeStyleName = __webpack_require__(151);

// Relying on the `invariant()` implementation lets us
// have preserve the format and params in the www builds.

!React ? invariant(false, 'ReactDOM was loaded before React. Make sure you load the React package before loading ReactDOM.') : void 0;

var invokeGuardedCallback = function (name, func, context, a, b, c, d, e, f) {
  this._hasCaughtError = false;
  this._caughtError = null;
  var funcArgs = Array.prototype.slice.call(arguments, 3);
  try {
    func.apply(context, funcArgs);
  } catch (error) {
    this._caughtError = error;
    this._hasCaughtError = true;
  }
};

{
  // In DEV mode, we swap out invokeGuardedCallback for a special version
  // that plays more nicely with the browser's DevTools. The idea is to preserve
  // "Pause on exceptions" behavior. Because React wraps all user-provided
  // functions in invokeGuardedCallback, and the production version of
  // invokeGuardedCallback uses a try-catch, all user exceptions are treated
  // like caught exceptions, and the DevTools won't pause unless the developer
  // takes the extra step of enabling pause on caught exceptions. This is
  // untintuitive, though, because even though React has caught the error, from
  // the developer's perspective, the error is uncaught.
  //
  // To preserve the expected "Pause on exceptions" behavior, we don't use a
  // try-catch in DEV. Instead, we synchronously dispatch a fake event to a fake
  // DOM node, and call the user-provided callback from inside an event handler
  // for that fake event. If the callback throws, the error is "captured" using
  // a global event handler. But because the error happens in a different
  // event loop context, it does not interrupt the normal program flow.
  // Effectively, this gives us try-catch behavior without actually using
  // try-catch. Neat!

  // Check that the browser supports the APIs we need to implement our special
  // DEV version of invokeGuardedCallback
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof document !== 'undefined' && typeof document.createEvent === 'function') {
    var fakeNode = document.createElement('react');

    var invokeGuardedCallbackDev = function (name, func, context, a, b, c, d, e, f) {
      // If document doesn't exist we know for sure we will crash in this method
      // when we call document.createEvent(). However this can cause confusing
      // errors: https://github.com/facebookincubator/create-react-app/issues/3482
      // So we preemptively throw with a better message instead.
      !(typeof document !== 'undefined') ? invariant(false, 'The `document` global was defined when React was initialized, but is not defined anymore. This can happen in a test environment if a component schedules an update from an asynchronous callback, but the test has already finished running. To solve this, you can either unmount the component at the end of your test (and ensure that any asynchronous operations get canceled in `componentWillUnmount`), or you can change the test itself to be asynchronous.') : void 0;
      var evt = document.createEvent('Event');

      // Keeps track of whether the user-provided callback threw an error. We
      // set this to true at the beginning, then set it to false right after
      // calling the function. If the function errors, `didError` will never be
      // set to false. This strategy works even if the browser is flaky and
      // fails to call our global error handler, because it doesn't rely on
      // the error event at all.
      var didError = true;

      // Create an event handler for our fake event. We will synchronously
      // dispatch our fake event using `dispatchEvent`. Inside the handler, we
      // call the user-provided callback.
      var funcArgs = Array.prototype.slice.call(arguments, 3);
      function callCallback() {
        // We immediately remove the callback from event listeners so that
        // nested `invokeGuardedCallback` calls do not clash. Otherwise, a
        // nested call would trigger the fake event handlers of any call higher
        // in the stack.
        fakeNode.removeEventListener(evtType, callCallback, false);
        func.apply(context, funcArgs);
        didError = false;
      }

      // Create a global error event handler. We use this to capture the value
      // that was thrown. It's possible that this error handler will fire more
      // than once; for example, if non-React code also calls `dispatchEvent`
      // and a handler for that event throws. We should be resilient to most of
      // those cases. Even if our error event handler fires more than once, the
      // last error event is always used. If the callback actually does error,
      // we know that the last error event is the correct one, because it's not
      // possible for anything else to have happened in between our callback
      // erroring and the code that follows the `dispatchEvent` call below. If
      // the callback doesn't error, but the error event was fired, we know to
      // ignore it because `didError` will be false, as described above.
      var error = void 0;
      // Use this to track whether the error event is ever called.
      var didSetError = false;
      var isCrossOriginError = false;

      function onError(event) {
        error = event.error;
        didSetError = true;
        if (error === null && event.colno === 0 && event.lineno === 0) {
          isCrossOriginError = true;
        }
      }

      // Create a fake event type.
      var evtType = 'react-' + (name ? name : 'invokeguardedcallback');

      // Attach our event handlers
      window.addEventListener('error', onError);
      fakeNode.addEventListener(evtType, callCallback, false);

      // Synchronously dispatch our fake event. If the user-provided function
      // errors, it will trigger our global error handler.
      evt.initEvent(evtType, false, false);
      fakeNode.dispatchEvent(evt);

      if (didError) {
        if (!didSetError) {
          // The callback errored, but the error event never fired.
          error = new Error('An error was thrown inside one of your components, but React ' + "doesn't know what it was. This is likely due to browser " + 'flakiness. React does its best to preserve the "Pause on ' + 'exceptions" behavior of the DevTools, which requires some ' + "DEV-mode only tricks. It's possible that these don't work in " + 'your browser. Try triggering the error in production mode, ' + 'or switching to a modern browser. If you suspect that this is ' + 'actually an issue with React, please file an issue.');
        } else if (isCrossOriginError) {
          error = new Error("A cross-origin error was thrown. React doesn't have access to " + 'the actual error object in development. ' + 'See https://fb.me/react-crossorigin-error for more information.');
        }
        this._hasCaughtError = true;
        this._caughtError = error;
      } else {
        this._hasCaughtError = false;
        this._caughtError = null;
      }

      // Remove our event listeners
      window.removeEventListener('error', onError);
    };

    invokeGuardedCallback = invokeGuardedCallbackDev;
  }
}

var invokeGuardedCallback$1 = invokeGuardedCallback;

var ReactErrorUtils = {
  // Used by Fiber to simulate a try-catch.
  _caughtError: null,
  _hasCaughtError: false,

  // Used by event system to capture/rethrow the first error.
  _rethrowError: null,
  _hasRethrowError: false,

  /**
   * Call a function while guarding against errors that happens within it.
   * Returns an error if it throws, otherwise null.
   *
   * In production, this is implemented using a try-catch. The reason we don't
   * use a try-catch directly is so that we can swap out a different
   * implementation in DEV mode.
   *
   * @param {String} name of the guard to use for logging or debugging
   * @param {Function} func The function to invoke
   * @param {*} context The context to use when calling the function
   * @param {...*} args Arguments for function
   */
  invokeGuardedCallback: function (name, func, context, a, b, c, d, e, f) {
    invokeGuardedCallback$1.apply(ReactErrorUtils, arguments);
  },

  /**
   * Same as invokeGuardedCallback, but instead of returning an error, it stores
   * it in a global so it can be rethrown by `rethrowCaughtError` later.
   * TODO: See if _caughtError and _rethrowError can be unified.
   *
   * @param {String} name of the guard to use for logging or debugging
   * @param {Function} func The function to invoke
   * @param {*} context The context to use when calling the function
   * @param {...*} args Arguments for function
   */
  invokeGuardedCallbackAndCatchFirstError: function (name, func, context, a, b, c, d, e, f) {
    ReactErrorUtils.invokeGuardedCallback.apply(this, arguments);
    if (ReactErrorUtils.hasCaughtError()) {
      var error = ReactErrorUtils.clearCaughtError();
      if (!ReactErrorUtils._hasRethrowError) {
        ReactErrorUtils._hasRethrowError = true;
        ReactErrorUtils._rethrowError = error;
      }
    }
  },

  /**
   * During execution of guarded functions we will capture the first error which
   * we will rethrow to be handled by the top level error handler.
   */
  rethrowCaughtError: function () {
    return rethrowCaughtError.apply(ReactErrorUtils, arguments);
  },

  hasCaughtError: function () {
    return ReactErrorUtils._hasCaughtError;
  },

  clearCaughtError: function () {
    if (ReactErrorUtils._hasCaughtError) {
      var error = ReactErrorUtils._caughtError;
      ReactErrorUtils._caughtError = null;
      ReactErrorUtils._hasCaughtError = false;
      return error;
    } else {
      invariant(false, 'clearCaughtError was called but no error was captured. This error is likely caused by a bug in React. Please file an issue.');
    }
  }
};

var rethrowCaughtError = function () {
  if (ReactErrorUtils._hasRethrowError) {
    var error = ReactErrorUtils._rethrowError;
    ReactErrorUtils._rethrowError = null;
    ReactErrorUtils._hasRethrowError = false;
    throw error;
  }
};

/**
 * Injectable ordering of event plugins.
 */
var eventPluginOrder = null;

/**
 * Injectable mapping from names to event plugin modules.
 */
var namesToPlugins = {};

/**
 * Recomputes the plugin list using the injected plugins and plugin ordering.
 *
 * @private
 */
function recomputePluginOrdering() {
  if (!eventPluginOrder) {
    // Wait until an `eventPluginOrder` is injected.
    return;
  }
  for (var pluginName in namesToPlugins) {
    var pluginModule = namesToPlugins[pluginName];
    var pluginIndex = eventPluginOrder.indexOf(pluginName);
    !(pluginIndex > -1) ? invariant(false, 'EventPluginRegistry: Cannot inject event plugins that do not exist in the plugin ordering, `%s`.', pluginName) : void 0;
    if (plugins[pluginIndex]) {
      continue;
    }
    !pluginModule.extractEvents ? invariant(false, 'EventPluginRegistry: Event plugins must implement an `extractEvents` method, but `%s` does not.', pluginName) : void 0;
    plugins[pluginIndex] = pluginModule;
    var publishedEvents = pluginModule.eventTypes;
    for (var eventName in publishedEvents) {
      !publishEventForPlugin(publishedEvents[eventName], pluginModule, eventName) ? invariant(false, 'EventPluginRegistry: Failed to publish event `%s` for plugin `%s`.', eventName, pluginName) : void 0;
    }
  }
}

/**
 * Publishes an event so that it can be dispatched by the supplied plugin.
 *
 * @param {object} dispatchConfig Dispatch configuration for the event.
 * @param {object} PluginModule Plugin publishing the event.
 * @return {boolean} True if the event was successfully published.
 * @private
 */
function publishEventForPlugin(dispatchConfig, pluginModule, eventName) {
  !!eventNameDispatchConfigs.hasOwnProperty(eventName) ? invariant(false, 'EventPluginHub: More than one plugin attempted to publish the same event name, `%s`.', eventName) : void 0;
  eventNameDispatchConfigs[eventName] = dispatchConfig;

  var phasedRegistrationNames = dispatchConfig.phasedRegistrationNames;
  if (phasedRegistrationNames) {
    for (var phaseName in phasedRegistrationNames) {
      if (phasedRegistrationNames.hasOwnProperty(phaseName)) {
        var phasedRegistrationName = phasedRegistrationNames[phaseName];
        publishRegistrationName(phasedRegistrationName, pluginModule, eventName);
      }
    }
    return true;
  } else if (dispatchConfig.registrationName) {
    publishRegistrationName(dispatchConfig.registrationName, pluginModule, eventName);
    return true;
  }
  return false;
}

/**
 * Publishes a registration name that is used to identify dispatched events.
 *
 * @param {string} registrationName Registration name to add.
 * @param {object} PluginModule Plugin publishing the event.
 * @private
 */
function publishRegistrationName(registrationName, pluginModule, eventName) {
  !!registrationNameModules[registrationName] ? invariant(false, 'EventPluginHub: More than one plugin attempted to publish the same registration name, `%s`.', registrationName) : void 0;
  registrationNameModules[registrationName] = pluginModule;
  registrationNameDependencies[registrationName] = pluginModule.eventTypes[eventName].dependencies;

  {
    var lowerCasedName = registrationName.toLowerCase();
    possibleRegistrationNames[lowerCasedName] = registrationName;

    if (registrationName === 'onDoubleClick') {
      possibleRegistrationNames.ondblclick = registrationName;
    }
  }
}

/**
 * Registers plugins so that they can extract and dispatch events.
 *
 * @see {EventPluginHub}
 */

/**
 * Ordered list of injected plugins.
 */
var plugins = [];

/**
 * Mapping from event name to dispatch config
 */
var eventNameDispatchConfigs = {};

/**
 * Mapping from registration name to plugin module
 */
var registrationNameModules = {};

/**
 * Mapping from registration name to event name
 */
var registrationNameDependencies = {};

/**
 * Mapping from lowercase registration names to the properly cased version,
 * used to warn in the case of missing event handlers. Available
 * only in true.
 * @type {Object}
 */
var possibleRegistrationNames = {};
// Trust the developer to only use possibleRegistrationNames in true

/**
 * Injects an ordering of plugins (by plugin name). This allows the ordering
 * to be decoupled from injection of the actual plugins so that ordering is
 * always deterministic regardless of packaging, on-the-fly injection, etc.
 *
 * @param {array} InjectedEventPluginOrder
 * @internal
 * @see {EventPluginHub.injection.injectEventPluginOrder}
 */
function injectEventPluginOrder(injectedEventPluginOrder) {
  !!eventPluginOrder ? invariant(false, 'EventPluginRegistry: Cannot inject event plugin ordering more than once. You are likely trying to load more than one copy of React.') : void 0;
  // Clone the ordering so it cannot be dynamically mutated.
  eventPluginOrder = Array.prototype.slice.call(injectedEventPluginOrder);
  recomputePluginOrdering();
}

/**
 * Injects plugins to be used by `EventPluginHub`. The plugin names must be
 * in the ordering injected by `injectEventPluginOrder`.
 *
 * Plugins can be injected as part of page initialization or on-the-fly.
 *
 * @param {object} injectedNamesToPlugins Map from names to plugin modules.
 * @internal
 * @see {EventPluginHub.injection.injectEventPluginsByName}
 */
function injectEventPluginsByName(injectedNamesToPlugins) {
  var isOrderingDirty = false;
  for (var pluginName in injectedNamesToPlugins) {
    if (!injectedNamesToPlugins.hasOwnProperty(pluginName)) {
      continue;
    }
    var pluginModule = injectedNamesToPlugins[pluginName];
    if (!namesToPlugins.hasOwnProperty(pluginName) || namesToPlugins[pluginName] !== pluginModule) {
      !!namesToPlugins[pluginName] ? invariant(false, 'EventPluginRegistry: Cannot inject two different event plugins using the same name, `%s`.', pluginName) : void 0;
      namesToPlugins[pluginName] = pluginModule;
      isOrderingDirty = true;
    }
  }
  if (isOrderingDirty) {
    recomputePluginOrdering();
  }
}

var EventPluginRegistry = Object.freeze({
	plugins: plugins,
	eventNameDispatchConfigs: eventNameDispatchConfigs,
	registrationNameModules: registrationNameModules,
	registrationNameDependencies: registrationNameDependencies,
	possibleRegistrationNames: possibleRegistrationNames,
	injectEventPluginOrder: injectEventPluginOrder,
	injectEventPluginsByName: injectEventPluginsByName
});

var getFiberCurrentPropsFromNode = null;
var getInstanceFromNode = null;
var getNodeFromInstance = null;

var injection$1 = {
  injectComponentTree: function (Injected) {
    getFiberCurrentPropsFromNode = Injected.getFiberCurrentPropsFromNode;
    getInstanceFromNode = Injected.getInstanceFromNode;
    getNodeFromInstance = Injected.getNodeFromInstance;

    {
      !(getNodeFromInstance && getInstanceFromNode) ? warning(false, 'EventPluginUtils.injection.injectComponentTree(...): Injected ' + 'module is missing getNodeFromInstance or getInstanceFromNode.') : void 0;
    }
  }
};






var validateEventDispatches = void 0;
{
  validateEventDispatches = function (event) {
    var dispatchListeners = event._dispatchListeners;
    var dispatchInstances = event._dispatchInstances;

    var listenersIsArr = Array.isArray(dispatchListeners);
    var listenersLen = listenersIsArr ? dispatchListeners.length : dispatchListeners ? 1 : 0;

    var instancesIsArr = Array.isArray(dispatchInstances);
    var instancesLen = instancesIsArr ? dispatchInstances.length : dispatchInstances ? 1 : 0;

    !(instancesIsArr === listenersIsArr && instancesLen === listenersLen) ? warning(false, 'EventPluginUtils: Invalid `event`.') : void 0;
  };
}

/**
 * Dispatch the event to the listener.
 * @param {SyntheticEvent} event SyntheticEvent to handle
 * @param {boolean} simulated If the event is simulated (changes exn behavior)
 * @param {function} listener Application-level callback
 * @param {*} inst Internal component instance
 */
function executeDispatch(event, simulated, listener, inst) {
  var type = event.type || 'unknown-event';
  event.currentTarget = getNodeFromInstance(inst);
  ReactErrorUtils.invokeGuardedCallbackAndCatchFirstError(type, listener, undefined, event);
  event.currentTarget = null;
}

/**
 * Standard/simple iteration through an event's collected dispatches.
 */
function executeDispatchesInOrder(event, simulated) {
  var dispatchListeners = event._dispatchListeners;
  var dispatchInstances = event._dispatchInstances;
  {
    validateEventDispatches(event);
  }
  if (Array.isArray(dispatchListeners)) {
    for (var i = 0; i < dispatchListeners.length; i++) {
      if (event.isPropagationStopped()) {
        break;
      }
      // Listeners and Instances are two parallel arrays that are always in sync.
      executeDispatch(event, simulated, dispatchListeners[i], dispatchInstances[i]);
    }
  } else if (dispatchListeners) {
    executeDispatch(event, simulated, dispatchListeners, dispatchInstances);
  }
  event._dispatchListeners = null;
  event._dispatchInstances = null;
}

/**
 * @see executeDispatchesInOrderStopAtTrueImpl
 */


/**
 * Execution of a "direct" dispatch - there must be at most one dispatch
 * accumulated on the event or it is considered an error. It doesn't really make
 * sense for an event with multiple dispatches (bubbled) to keep track of the
 * return values at each dispatch execution, but it does tend to make sense when
 * dealing with "direct" dispatches.
 *
 * @return {*} The return value of executing the single dispatch.
 */


/**
 * @param {SyntheticEvent} event
 * @return {boolean} True iff number of dispatches accumulated is greater than 0.
 */

/**
 * Accumulates items that must not be null or undefined into the first one. This
 * is used to conserve memory by avoiding array allocations, and thus sacrifices
 * API cleanness. Since `current` can be null before being passed in and not
 * null after this function, make sure to assign it back to `current`:
 *
 * `a = accumulateInto(a, b);`
 *
 * This API should be sparingly used. Try `accumulate` for something cleaner.
 *
 * @return {*|array<*>} An accumulation of items.
 */

function accumulateInto(current, next) {
  !(next != null) ? invariant(false, 'accumulateInto(...): Accumulated items must not be null or undefined.') : void 0;

  if (current == null) {
    return next;
  }

  // Both are not empty. Warning: Never call x.concat(y) when you are not
  // certain that x is an Array (x could be a string with concat method).
  if (Array.isArray(current)) {
    if (Array.isArray(next)) {
      current.push.apply(current, next);
      return current;
    }
    current.push(next);
    return current;
  }

  if (Array.isArray(next)) {
    // A bit too dangerous to mutate `next`.
    return [current].concat(next);
  }

  return [current, next];
}

/**
 * @param {array} arr an "accumulation" of items which is either an Array or
 * a single item. Useful when paired with the `accumulate` module. This is a
 * simple utility that allows us to reason about a collection of items, but
 * handling the case when there is exactly one item (and we do not need to
 * allocate an array).
 * @param {function} cb Callback invoked with each element or a collection.
 * @param {?} [scope] Scope used as `this` in a callback.
 */
function forEachAccumulated(arr, cb, scope) {
  if (Array.isArray(arr)) {
    arr.forEach(cb, scope);
  } else if (arr) {
    cb.call(scope, arr);
  }
}

/**
 * Internal queue of events that have accumulated their dispatches and are
 * waiting to have their dispatches executed.
 */
var eventQueue = null;

/**
 * Dispatches an event and releases it back into the pool, unless persistent.
 *
 * @param {?object} event Synthetic event to be dispatched.
 * @param {boolean} simulated If the event is simulated (changes exn behavior)
 * @private
 */
var executeDispatchesAndRelease = function (event, simulated) {
  if (event) {
    executeDispatchesInOrder(event, simulated);

    if (!event.isPersistent()) {
      event.constructor.release(event);
    }
  }
};
var executeDispatchesAndReleaseSimulated = function (e) {
  return executeDispatchesAndRelease(e, true);
};
var executeDispatchesAndReleaseTopLevel = function (e) {
  return executeDispatchesAndRelease(e, false);
};

function isInteractive(tag) {
  return tag === 'button' || tag === 'input' || tag === 'select' || tag === 'textarea';
}

function shouldPreventMouseEvent(name, type, props) {
  switch (name) {
    case 'onClick':
    case 'onClickCapture':
    case 'onDoubleClick':
    case 'onDoubleClickCapture':
    case 'onMouseDown':
    case 'onMouseDownCapture':
    case 'onMouseMove':
    case 'onMouseMoveCapture':
    case 'onMouseUp':
    case 'onMouseUpCapture':
      return !!(props.disabled && isInteractive(type));
    default:
      return false;
  }
}

/**
 * This is a unified interface for event plugins to be installed and configured.
 *
 * Event plugins can implement the following properties:
 *
 *   `extractEvents` {function(string, DOMEventTarget, string, object): *}
 *     Required. When a top-level event is fired, this method is expected to
 *     extract synthetic events that will in turn be queued and dispatched.
 *
 *   `eventTypes` {object}
 *     Optional, plugins that fire events must publish a mapping of registration
 *     names that are used to register listeners. Values of this mapping must
 *     be objects that contain `registrationName` or `phasedRegistrationNames`.
 *
 *   `executeDispatch` {function(object, function, string)}
 *     Optional, allows plugins to override how an event gets dispatched. By
 *     default, the listener is simply invoked.
 *
 * Each plugin that is injected into `EventsPluginHub` is immediately operable.
 *
 * @public
 */

/**
 * Methods for injecting dependencies.
 */
var injection = {
  /**
   * @param {array} InjectedEventPluginOrder
   * @public
   */
  injectEventPluginOrder: injectEventPluginOrder,

  /**
   * @param {object} injectedNamesToPlugins Map from names to plugin modules.
   */
  injectEventPluginsByName: injectEventPluginsByName
};

/**
 * @param {object} inst The instance, which is the source of events.
 * @param {string} registrationName Name of listener (e.g. `onClick`).
 * @return {?function} The stored callback.
 */
function getListener(inst, registrationName) {
  var listener = void 0;

  // TODO: shouldPreventMouseEvent is DOM-specific and definitely should not
  // live here; needs to be moved to a better place soon
  var stateNode = inst.stateNode;
  if (!stateNode) {
    // Work in progress (ex: onload events in incremental mode).
    return null;
  }
  var props = getFiberCurrentPropsFromNode(stateNode);
  if (!props) {
    // Work in progress.
    return null;
  }
  listener = props[registrationName];
  if (shouldPreventMouseEvent(registrationName, inst.type, props)) {
    return null;
  }
  !(!listener || typeof listener === 'function') ? invariant(false, 'Expected `%s` listener to be a function, instead got a value of `%s` type.', registrationName, typeof listener) : void 0;
  return listener;
}

/**
 * Allows registered plugins an opportunity to extract events from top-level
 * native browser events.
 *
 * @return {*} An accumulation of synthetic events.
 * @internal
 */
function extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
  var events = null;
  for (var i = 0; i < plugins.length; i++) {
    // Not every plugin in the ordering may be loaded at runtime.
    var possiblePlugin = plugins[i];
    if (possiblePlugin) {
      var extractedEvents = possiblePlugin.extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget);
      if (extractedEvents) {
        events = accumulateInto(events, extractedEvents);
      }
    }
  }
  return events;
}

function runEventsInBatch(events, simulated) {
  if (events !== null) {
    eventQueue = accumulateInto(eventQueue, events);
  }

  // Set `eventQueue` to null before processing it so that we can tell if more
  // events get enqueued while processing.
  var processingEventQueue = eventQueue;
  eventQueue = null;

  if (!processingEventQueue) {
    return;
  }

  if (simulated) {
    forEachAccumulated(processingEventQueue, executeDispatchesAndReleaseSimulated);
  } else {
    forEachAccumulated(processingEventQueue, executeDispatchesAndReleaseTopLevel);
  }
  !!eventQueue ? invariant(false, 'processEventQueue(): Additional events were enqueued while processing an event queue. Support for this has not yet been implemented.') : void 0;
  // This would be a good time to rethrow if any of the event handlers threw.
  ReactErrorUtils.rethrowCaughtError();
}

function runExtractedEventsInBatch(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
  var events = extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget);
  runEventsInBatch(events, false);
}

var EventPluginHub = Object.freeze({
	injection: injection,
	getListener: getListener,
	runEventsInBatch: runEventsInBatch,
	runExtractedEventsInBatch: runExtractedEventsInBatch
});

var IndeterminateComponent = 0; // Before we know whether it is functional or class
var FunctionalComponent = 1;
var ClassComponent = 2;
var HostRoot = 3; // Root of a host tree. Could be nested inside another node.
var HostPortal = 4; // A subtree. Could be an entry point to a different renderer.
var HostComponent = 5;
var HostText = 6;
var CallComponent = 7;
var CallHandlerPhase = 8;
var ReturnComponent = 9;
var Fragment = 10;
var Mode = 11;
var ContextConsumer = 12;
var ContextProvider = 13;
var ForwardRef = 14;

var randomKey = Math.random().toString(36).slice(2);
var internalInstanceKey = '__reactInternalInstance$' + randomKey;
var internalEventHandlersKey = '__reactEventHandlers$' + randomKey;

function precacheFiberNode$1(hostInst, node) {
  node[internalInstanceKey] = hostInst;
}

/**
 * Given a DOM node, return the closest ReactDOMComponent or
 * ReactDOMTextComponent instance ancestor.
 */
function getClosestInstanceFromNode(node) {
  if (node[internalInstanceKey]) {
    return node[internalInstanceKey];
  }

  while (!node[internalInstanceKey]) {
    if (node.parentNode) {
      node = node.parentNode;
    } else {
      // Top of the tree. This node must not be part of a React tree (or is
      // unmounted, potentially).
      return null;
    }
  }

  var inst = node[internalInstanceKey];
  if (inst.tag === HostComponent || inst.tag === HostText) {
    // In Fiber, this will always be the deepest root.
    return inst;
  }

  return null;
}

/**
 * Given a DOM node, return the ReactDOMComponent or ReactDOMTextComponent
 * instance, or null if the node was not rendered by this React.
 */
function getInstanceFromNode$1(node) {
  var inst = node[internalInstanceKey];
  if (inst) {
    if (inst.tag === HostComponent || inst.tag === HostText) {
      return inst;
    } else {
      return null;
    }
  }
  return null;
}

/**
 * Given a ReactDOMComponent or ReactDOMTextComponent, return the corresponding
 * DOM node.
 */
function getNodeFromInstance$1(inst) {
  if (inst.tag === HostComponent || inst.tag === HostText) {
    // In Fiber this, is just the state node right now. We assume it will be
    // a host component or host text.
    return inst.stateNode;
  }

  // Without this first invariant, passing a non-DOM-component triggers the next
  // invariant for a missing parent, which is super confusing.
  invariant(false, 'getNodeFromInstance: Invalid argument.');
}

function getFiberCurrentPropsFromNode$1(node) {
  return node[internalEventHandlersKey] || null;
}

function updateFiberProps$1(node, props) {
  node[internalEventHandlersKey] = props;
}

var ReactDOMComponentTree = Object.freeze({
	precacheFiberNode: precacheFiberNode$1,
	getClosestInstanceFromNode: getClosestInstanceFromNode,
	getInstanceFromNode: getInstanceFromNode$1,
	getNodeFromInstance: getNodeFromInstance$1,
	getFiberCurrentPropsFromNode: getFiberCurrentPropsFromNode$1,
	updateFiberProps: updateFiberProps$1
});

function getParent(inst) {
  do {
    inst = inst['return'];
    // TODO: If this is a HostRoot we might want to bail out.
    // That is depending on if we want nested subtrees (layers) to bubble
    // events to their parent. We could also go through parentNode on the
    // host node but that wouldn't work for React Native and doesn't let us
    // do the portal feature.
  } while (inst && inst.tag !== HostComponent);
  if (inst) {
    return inst;
  }
  return null;
}

/**
 * Return the lowest common ancestor of A and B, or null if they are in
 * different trees.
 */
function getLowestCommonAncestor(instA, instB) {
  var depthA = 0;
  for (var tempA = instA; tempA; tempA = getParent(tempA)) {
    depthA++;
  }
  var depthB = 0;
  for (var tempB = instB; tempB; tempB = getParent(tempB)) {
    depthB++;
  }

  // If A is deeper, crawl up.
  while (depthA - depthB > 0) {
    instA = getParent(instA);
    depthA--;
  }

  // If B is deeper, crawl up.
  while (depthB - depthA > 0) {
    instB = getParent(instB);
    depthB--;
  }

  // Walk in lockstep until we find a match.
  var depth = depthA;
  while (depth--) {
    if (instA === instB || instA === instB.alternate) {
      return instA;
    }
    instA = getParent(instA);
    instB = getParent(instB);
  }
  return null;
}

/**
 * Return if A is an ancestor of B.
 */


/**
 * Return the parent instance of the passed-in instance.
 */
function getParentInstance(inst) {
  return getParent(inst);
}

/**
 * Simulates the traversal of a two-phase, capture/bubble event dispatch.
 */
function traverseTwoPhase(inst, fn, arg) {
  var path = [];
  while (inst) {
    path.push(inst);
    inst = getParent(inst);
  }
  var i = void 0;
  for (i = path.length; i-- > 0;) {
    fn(path[i], 'captured', arg);
  }
  for (i = 0; i < path.length; i++) {
    fn(path[i], 'bubbled', arg);
  }
}

/**
 * Traverses the ID hierarchy and invokes the supplied `cb` on any IDs that
 * should would receive a `mouseEnter` or `mouseLeave` event.
 *
 * Does not invoke the callback on the nearest common ancestor because nothing
 * "entered" or "left" that element.
 */
function traverseEnterLeave(from, to, fn, argFrom, argTo) {
  var common = from && to ? getLowestCommonAncestor(from, to) : null;
  var pathFrom = [];
  while (true) {
    if (!from) {
      break;
    }
    if (from === common) {
      break;
    }
    var alternate = from.alternate;
    if (alternate !== null && alternate === common) {
      break;
    }
    pathFrom.push(from);
    from = getParent(from);
  }
  var pathTo = [];
  while (true) {
    if (!to) {
      break;
    }
    if (to === common) {
      break;
    }
    var _alternate = to.alternate;
    if (_alternate !== null && _alternate === common) {
      break;
    }
    pathTo.push(to);
    to = getParent(to);
  }
  for (var i = 0; i < pathFrom.length; i++) {
    fn(pathFrom[i], 'bubbled', argFrom);
  }
  for (var _i = pathTo.length; _i-- > 0;) {
    fn(pathTo[_i], 'captured', argTo);
  }
}

/**
 * Some event types have a notion of different registration names for different
 * "phases" of propagation. This finds listeners by a given phase.
 */
function listenerAtPhase(inst, event, propagationPhase) {
  var registrationName = event.dispatchConfig.phasedRegistrationNames[propagationPhase];
  return getListener(inst, registrationName);
}

/**
 * A small set of propagation patterns, each of which will accept a small amount
 * of information, and generate a set of "dispatch ready event objects" - which
 * are sets of events that have already been annotated with a set of dispatched
 * listener functions/ids. The API is designed this way to discourage these
 * propagation strategies from actually executing the dispatches, since we
 * always want to collect the entire set of dispatches before executing even a
 * single one.
 */

/**
 * Tags a `SyntheticEvent` with dispatched listeners. Creating this function
 * here, allows us to not have to bind or create functions for each event.
 * Mutating the event's members allows us to not have to create a wrapping
 * "dispatch" object that pairs the event with the listener.
 */
function accumulateDirectionalDispatches(inst, phase, event) {
  {
    !inst ? warning(false, 'Dispatching inst must not be null') : void 0;
  }
  var listener = listenerAtPhase(inst, event, phase);
  if (listener) {
    event._dispatchListeners = accumulateInto(event._dispatchListeners, listener);
    event._dispatchInstances = accumulateInto(event._dispatchInstances, inst);
  }
}

/**
 * Collect dispatches (must be entirely collected before dispatching - see unit
 * tests). Lazily allocate the array to conserve memory.  We must loop through
 * each event and perform the traversal for each one. We cannot perform a
 * single traversal for the entire collection of events because each event may
 * have a different target.
 */
function accumulateTwoPhaseDispatchesSingle(event) {
  if (event && event.dispatchConfig.phasedRegistrationNames) {
    traverseTwoPhase(event._targetInst, accumulateDirectionalDispatches, event);
  }
}

/**
 * Same as `accumulateTwoPhaseDispatchesSingle`, but skips over the targetID.
 */
function accumulateTwoPhaseDispatchesSingleSkipTarget(event) {
  if (event && event.dispatchConfig.phasedRegistrationNames) {
    var targetInst = event._targetInst;
    var parentInst = targetInst ? getParentInstance(targetInst) : null;
    traverseTwoPhase(parentInst, accumulateDirectionalDispatches, event);
  }
}

/**
 * Accumulates without regard to direction, does not look for phased
 * registration names. Same as `accumulateDirectDispatchesSingle` but without
 * requiring that the `dispatchMarker` be the same as the dispatched ID.
 */
function accumulateDispatches(inst, ignoredDirection, event) {
  if (inst && event && event.dispatchConfig.registrationName) {
    var registrationName = event.dispatchConfig.registrationName;
    var listener = getListener(inst, registrationName);
    if (listener) {
      event._dispatchListeners = accumulateInto(event._dispatchListeners, listener);
      event._dispatchInstances = accumulateInto(event._dispatchInstances, inst);
    }
  }
}

/**
 * Accumulates dispatches on an `SyntheticEvent`, but only for the
 * `dispatchMarker`.
 * @param {SyntheticEvent} event
 */
function accumulateDirectDispatchesSingle(event) {
  if (event && event.dispatchConfig.registrationName) {
    accumulateDispatches(event._targetInst, null, event);
  }
}

function accumulateTwoPhaseDispatches(events) {
  forEachAccumulated(events, accumulateTwoPhaseDispatchesSingle);
}

function accumulateTwoPhaseDispatchesSkipTarget(events) {
  forEachAccumulated(events, accumulateTwoPhaseDispatchesSingleSkipTarget);
}

function accumulateEnterLeaveDispatches(leave, enter, from, to) {
  traverseEnterLeave(from, to, accumulateDispatches, leave, enter);
}

function accumulateDirectDispatches(events) {
  forEachAccumulated(events, accumulateDirectDispatchesSingle);
}

var EventPropagators = Object.freeze({
	accumulateTwoPhaseDispatches: accumulateTwoPhaseDispatches,
	accumulateTwoPhaseDispatchesSkipTarget: accumulateTwoPhaseDispatchesSkipTarget,
	accumulateEnterLeaveDispatches: accumulateEnterLeaveDispatches,
	accumulateDirectDispatches: accumulateDirectDispatches
});

var contentKey = null;

/**
 * Gets the key used to access text content on a DOM node.
 *
 * @return {?string} Key used to access text content.
 * @internal
 */
function getTextContentAccessor() {
  if (!contentKey && ExecutionEnvironment.canUseDOM) {
    // Prefer textContent to innerText because many browsers support both but
    // SVG <text> elements don't support innerText even when <div> does.
    contentKey = 'textContent' in document.documentElement ? 'textContent' : 'innerText';
  }
  return contentKey;
}

/**
 * This helper object stores information about text content of a target node,
 * allowing comparison of content before and after a given event.
 *
 * Identify the node where selection currently begins, then observe
 * both its text content and its current position in the DOM. Since the
 * browser may natively replace the target node during composition, we can
 * use its position to find its replacement.
 *
 *
 */
var compositionState = {
  _root: null,
  _startText: null,
  _fallbackText: null
};

function initialize(nativeEventTarget) {
  compositionState._root = nativeEventTarget;
  compositionState._startText = getText();
  return true;
}

function reset() {
  compositionState._root = null;
  compositionState._startText = null;
  compositionState._fallbackText = null;
}

function getData() {
  if (compositionState._fallbackText) {
    return compositionState._fallbackText;
  }

  var start = void 0;
  var startValue = compositionState._startText;
  var startLength = startValue.length;
  var end = void 0;
  var endValue = getText();
  var endLength = endValue.length;

  for (start = 0; start < startLength; start++) {
    if (startValue[start] !== endValue[start]) {
      break;
    }
  }

  var minEnd = startLength - start;
  for (end = 1; end <= minEnd; end++) {
    if (startValue[startLength - end] !== endValue[endLength - end]) {
      break;
    }
  }

  var sliceTail = end > 1 ? 1 - end : undefined;
  compositionState._fallbackText = endValue.slice(start, sliceTail);
  return compositionState._fallbackText;
}

function getText() {
  if ('value' in compositionState._root) {
    return compositionState._root.value;
  }
  return compositionState._root[getTextContentAccessor()];
}

/* eslint valid-typeof: 0 */

var didWarnForAddedNewProperty = false;
var EVENT_POOL_SIZE = 10;

var shouldBeReleasedProperties = ['dispatchConfig', '_targetInst', 'nativeEvent', 'isDefaultPrevented', 'isPropagationStopped', '_dispatchListeners', '_dispatchInstances'];

/**
 * @interface Event
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var EventInterface = {
  type: null,
  target: null,
  // currentTarget is set when dispatching; no use in copying it here
  currentTarget: emptyFunction.thatReturnsNull,
  eventPhase: null,
  bubbles: null,
  cancelable: null,
  timeStamp: function (event) {
    return event.timeStamp || Date.now();
  },
  defaultPrevented: null,
  isTrusted: null
};

/**
 * Synthetic events are dispatched by event plugins, typically in response to a
 * top-level event delegation handler.
 *
 * These systems should generally use pooling to reduce the frequency of garbage
 * collection. The system should check `isPersistent` to determine whether the
 * event should be released into the pool after being dispatched. Users that
 * need a persisted event should invoke `persist`.
 *
 * Synthetic events (and subclasses) implement the DOM Level 3 Events API by
 * normalizing browser quirks. Subclasses do not necessarily have to implement a
 * DOM interface; custom application-specific events can also subclass this.
 *
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {*} targetInst Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @param {DOMEventTarget} nativeEventTarget Target node.
 */
function SyntheticEvent(dispatchConfig, targetInst, nativeEvent, nativeEventTarget) {
  {
    // these have a getter/setter for warnings
    delete this.nativeEvent;
    delete this.preventDefault;
    delete this.stopPropagation;
  }

  this.dispatchConfig = dispatchConfig;
  this._targetInst = targetInst;
  this.nativeEvent = nativeEvent;

  var Interface = this.constructor.Interface;
  for (var propName in Interface) {
    if (!Interface.hasOwnProperty(propName)) {
      continue;
    }
    {
      delete this[propName]; // this has a getter/setter for warnings
    }
    var normalize = Interface[propName];
    if (normalize) {
      this[propName] = normalize(nativeEvent);
    } else {
      if (propName === 'target') {
        this.target = nativeEventTarget;
      } else {
        this[propName] = nativeEvent[propName];
      }
    }
  }

  var defaultPrevented = nativeEvent.defaultPrevented != null ? nativeEvent.defaultPrevented : nativeEvent.returnValue === false;
  if (defaultPrevented) {
    this.isDefaultPrevented = emptyFunction.thatReturnsTrue;
  } else {
    this.isDefaultPrevented = emptyFunction.thatReturnsFalse;
  }
  this.isPropagationStopped = emptyFunction.thatReturnsFalse;
  return this;
}

_assign(SyntheticEvent.prototype, {
  preventDefault: function () {
    this.defaultPrevented = true;
    var event = this.nativeEvent;
    if (!event) {
      return;
    }

    if (event.preventDefault) {
      event.preventDefault();
    } else if (typeof event.returnValue !== 'unknown') {
      event.returnValue = false;
    }
    this.isDefaultPrevented = emptyFunction.thatReturnsTrue;
  },

  stopPropagation: function () {
    var event = this.nativeEvent;
    if (!event) {
      return;
    }

    if (event.stopPropagation) {
      event.stopPropagation();
    } else if (typeof event.cancelBubble !== 'unknown') {
      // The ChangeEventPlugin registers a "propertychange" event for
      // IE. This event does not support bubbling or cancelling, and
      // any references to cancelBubble throw "Member not found".  A
      // typeof check of "unknown" circumvents this issue (and is also
      // IE specific).
      event.cancelBubble = true;
    }

    this.isPropagationStopped = emptyFunction.thatReturnsTrue;
  },

  /**
   * We release all dispatched `SyntheticEvent`s after each event loop, adding
   * them back into the pool. This allows a way to hold onto a reference that
   * won't be added back into the pool.
   */
  persist: function () {
    this.isPersistent = emptyFunction.thatReturnsTrue;
  },

  /**
   * Checks if this event should be released back into the pool.
   *
   * @return {boolean} True if this should not be released, false otherwise.
   */
  isPersistent: emptyFunction.thatReturnsFalse,

  /**
   * `PooledClass` looks for `destructor` on each instance it releases.
   */
  destructor: function () {
    var Interface = this.constructor.Interface;
    for (var propName in Interface) {
      {
        Object.defineProperty(this, propName, getPooledWarningPropertyDefinition(propName, Interface[propName]));
      }
    }
    for (var i = 0; i < shouldBeReleasedProperties.length; i++) {
      this[shouldBeReleasedProperties[i]] = null;
    }
    {
      Object.defineProperty(this, 'nativeEvent', getPooledWarningPropertyDefinition('nativeEvent', null));
      Object.defineProperty(this, 'preventDefault', getPooledWarningPropertyDefinition('preventDefault', emptyFunction));
      Object.defineProperty(this, 'stopPropagation', getPooledWarningPropertyDefinition('stopPropagation', emptyFunction));
    }
  }
});

SyntheticEvent.Interface = EventInterface;

/**
 * Helper to reduce boilerplate when creating subclasses.
 */
SyntheticEvent.extend = function (Interface) {
  var Super = this;

  var E = function () {};
  E.prototype = Super.prototype;
  var prototype = new E();

  function Class() {
    return Super.apply(this, arguments);
  }
  _assign(prototype, Class.prototype);
  Class.prototype = prototype;
  Class.prototype.constructor = Class;

  Class.Interface = _assign({}, Super.Interface, Interface);
  Class.extend = Super.extend;
  addEventPoolingTo(Class);

  return Class;
};

/** Proxying after everything set on SyntheticEvent
 * to resolve Proxy issue on some WebKit browsers
 * in which some Event properties are set to undefined (GH#10010)
 */
{
  var isProxySupported = typeof Proxy === 'function' &&
  // https://github.com/facebook/react/issues/12011
  !Object.isSealed(new Proxy({}, {}));

  if (isProxySupported) {
    /*eslint-disable no-func-assign */
    SyntheticEvent = new Proxy(SyntheticEvent, {
      construct: function (target, args) {
        return this.apply(target, Object.create(target.prototype), args);
      },
      apply: function (constructor, that, args) {
        return new Proxy(constructor.apply(that, args), {
          set: function (target, prop, value) {
            if (prop !== 'isPersistent' && !target.constructor.Interface.hasOwnProperty(prop) && shouldBeReleasedProperties.indexOf(prop) === -1) {
              !(didWarnForAddedNewProperty || target.isPersistent()) ? warning(false, "This synthetic event is reused for performance reasons. If you're " + "seeing this, you're adding a new property in the synthetic event object. " + 'The property is never released. See ' + 'https://fb.me/react-event-pooling for more information.') : void 0;
              didWarnForAddedNewProperty = true;
            }
            target[prop] = value;
            return true;
          }
        });
      }
    });
    /*eslint-enable no-func-assign */
  }
}

addEventPoolingTo(SyntheticEvent);

/**
 * Helper to nullify syntheticEvent instance properties when destructing
 *
 * @param {String} propName
 * @param {?object} getVal
 * @return {object} defineProperty object
 */
function getPooledWarningPropertyDefinition(propName, getVal) {
  var isFunction = typeof getVal === 'function';
  return {
    configurable: true,
    set: set,
    get: get
  };

  function set(val) {
    var action = isFunction ? 'setting the method' : 'setting the property';
    warn(action, 'This is effectively a no-op');
    return val;
  }

  function get() {
    var action = isFunction ? 'accessing the method' : 'accessing the property';
    var result = isFunction ? 'This is a no-op function' : 'This is set to null';
    warn(action, result);
    return getVal;
  }

  function warn(action, result) {
    var warningCondition = false;
    !warningCondition ? warning(false, "This synthetic event is reused for performance reasons. If you're seeing this, " + "you're %s `%s` on a released/nullified synthetic event. %s. " + 'If you must keep the original synthetic event around, use event.persist(). ' + 'See https://fb.me/react-event-pooling for more information.', action, propName, result) : void 0;
  }
}

function getPooledEvent(dispatchConfig, targetInst, nativeEvent, nativeInst) {
  var EventConstructor = this;
  if (EventConstructor.eventPool.length) {
    var instance = EventConstructor.eventPool.pop();
    EventConstructor.call(instance, dispatchConfig, targetInst, nativeEvent, nativeInst);
    return instance;
  }
  return new EventConstructor(dispatchConfig, targetInst, nativeEvent, nativeInst);
}

function releasePooledEvent(event) {
  var EventConstructor = this;
  !(event instanceof EventConstructor) ? invariant(false, 'Trying to release an event instance  into a pool of a different type.') : void 0;
  event.destructor();
  if (EventConstructor.eventPool.length < EVENT_POOL_SIZE) {
    EventConstructor.eventPool.push(event);
  }
}

function addEventPoolingTo(EventConstructor) {
  EventConstructor.eventPool = [];
  EventConstructor.getPooled = getPooledEvent;
  EventConstructor.release = releasePooledEvent;
}

var SyntheticEvent$1 = SyntheticEvent;

/**
 * @interface Event
 * @see http://www.w3.org/TR/DOM-Level-3-Events/#events-compositionevents
 */
var SyntheticCompositionEvent = SyntheticEvent$1.extend({
  data: null
});

/**
 * @interface Event
 * @see http://www.w3.org/TR/2013/WD-DOM-Level-3-Events-20131105
 *      /#events-inputevents
 */
var SyntheticInputEvent = SyntheticEvent$1.extend({
  data: null
});

var END_KEYCODES = [9, 13, 27, 32]; // Tab, Return, Esc, Space
var START_KEYCODE = 229;

var canUseCompositionEvent = ExecutionEnvironment.canUseDOM && 'CompositionEvent' in window;

var documentMode = null;
if (ExecutionEnvironment.canUseDOM && 'documentMode' in document) {
  documentMode = document.documentMode;
}

// Webkit offers a very useful `textInput` event that can be used to
// directly represent `beforeInput`. The IE `textinput` event is not as
// useful, so we don't use it.
var canUseTextInputEvent = ExecutionEnvironment.canUseDOM && 'TextEvent' in window && !documentMode;

// In IE9+, we have access to composition events, but the data supplied
// by the native compositionend event may be incorrect. Japanese ideographic
// spaces, for instance (\u3000) are not recorded correctly.
var useFallbackCompositionData = ExecutionEnvironment.canUseDOM && (!canUseCompositionEvent || documentMode && documentMode > 8 && documentMode <= 11);

var SPACEBAR_CODE = 32;
var SPACEBAR_CHAR = String.fromCharCode(SPACEBAR_CODE);

// Events and their corresponding property names.
var eventTypes = {
  beforeInput: {
    phasedRegistrationNames: {
      bubbled: 'onBeforeInput',
      captured: 'onBeforeInputCapture'
    },
    dependencies: ['topCompositionEnd', 'topKeyPress', 'topTextInput', 'topPaste']
  },
  compositionEnd: {
    phasedRegistrationNames: {
      bubbled: 'onCompositionEnd',
      captured: 'onCompositionEndCapture'
    },
    dependencies: ['topBlur', 'topCompositionEnd', 'topKeyDown', 'topKeyPress', 'topKeyUp', 'topMouseDown']
  },
  compositionStart: {
    phasedRegistrationNames: {
      bubbled: 'onCompositionStart',
      captured: 'onCompositionStartCapture'
    },
    dependencies: ['topBlur', 'topCompositionStart', 'topKeyDown', 'topKeyPress', 'topKeyUp', 'topMouseDown']
  },
  compositionUpdate: {
    phasedRegistrationNames: {
      bubbled: 'onCompositionUpdate',
      captured: 'onCompositionUpdateCapture'
    },
    dependencies: ['topBlur', 'topCompositionUpdate', 'topKeyDown', 'topKeyPress', 'topKeyUp', 'topMouseDown']
  }
};

// Track whether we've ever handled a keypress on the space key.
var hasSpaceKeypress = false;

/**
 * Return whether a native keypress event is assumed to be a command.
 * This is required because Firefox fires `keypress` events for key commands
 * (cut, copy, select-all, etc.) even though no character is inserted.
 */
function isKeypressCommand(nativeEvent) {
  return (nativeEvent.ctrlKey || nativeEvent.altKey || nativeEvent.metaKey) &&
  // ctrlKey && altKey is equivalent to AltGr, and is not a command.
  !(nativeEvent.ctrlKey && nativeEvent.altKey);
}

/**
 * Translate native top level events into event types.
 *
 * @param {string} topLevelType
 * @return {object}
 */
function getCompositionEventType(topLevelType) {
  switch (topLevelType) {
    case 'topCompositionStart':
      return eventTypes.compositionStart;
    case 'topCompositionEnd':
      return eventTypes.compositionEnd;
    case 'topCompositionUpdate':
      return eventTypes.compositionUpdate;
  }
}

/**
 * Does our fallback best-guess model think this event signifies that
 * composition has begun?
 *
 * @param {string} topLevelType
 * @param {object} nativeEvent
 * @return {boolean}
 */
function isFallbackCompositionStart(topLevelType, nativeEvent) {
  return topLevelType === 'topKeyDown' && nativeEvent.keyCode === START_KEYCODE;
}

/**
 * Does our fallback mode think that this event is the end of composition?
 *
 * @param {string} topLevelType
 * @param {object} nativeEvent
 * @return {boolean}
 */
function isFallbackCompositionEnd(topLevelType, nativeEvent) {
  switch (topLevelType) {
    case 'topKeyUp':
      // Command keys insert or clear IME input.
      return END_KEYCODES.indexOf(nativeEvent.keyCode) !== -1;
    case 'topKeyDown':
      // Expect IME keyCode on each keydown. If we get any other
      // code we must have exited earlier.
      return nativeEvent.keyCode !== START_KEYCODE;
    case 'topKeyPress':
    case 'topMouseDown':
    case 'topBlur':
      // Events are not possible without cancelling IME.
      return true;
    default:
      return false;
  }
}

/**
 * Google Input Tools provides composition data via a CustomEvent,
 * with the `data` property populated in the `detail` object. If this
 * is available on the event object, use it. If not, this is a plain
 * composition event and we have nothing special to extract.
 *
 * @param {object} nativeEvent
 * @return {?string}
 */
function getDataFromCustomEvent(nativeEvent) {
  var detail = nativeEvent.detail;
  if (typeof detail === 'object' && 'data' in detail) {
    return detail.data;
  }
  return null;
}

// Track the current IME composition status, if any.
var isComposing = false;

/**
 * @return {?object} A SyntheticCompositionEvent.
 */
function extractCompositionEvent(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
  var eventType = void 0;
  var fallbackData = void 0;

  if (canUseCompositionEvent) {
    eventType = getCompositionEventType(topLevelType);
  } else if (!isComposing) {
    if (isFallbackCompositionStart(topLevelType, nativeEvent)) {
      eventType = eventTypes.compositionStart;
    }
  } else if (isFallbackCompositionEnd(topLevelType, nativeEvent)) {
    eventType = eventTypes.compositionEnd;
  }

  if (!eventType) {
    return null;
  }

  if (useFallbackCompositionData) {
    // The current composition is stored statically and must not be
    // overwritten while composition continues.
    if (!isComposing && eventType === eventTypes.compositionStart) {
      isComposing = initialize(nativeEventTarget);
    } else if (eventType === eventTypes.compositionEnd) {
      if (isComposing) {
        fallbackData = getData();
      }
    }
  }

  var event = SyntheticCompositionEvent.getPooled(eventType, targetInst, nativeEvent, nativeEventTarget);

  if (fallbackData) {
    // Inject data generated from fallback path into the synthetic event.
    // This matches the property of native CompositionEventInterface.
    event.data = fallbackData;
  } else {
    var customData = getDataFromCustomEvent(nativeEvent);
    if (customData !== null) {
      event.data = customData;
    }
  }

  accumulateTwoPhaseDispatches(event);
  return event;
}

/**
 * @param {TopLevelTypes} topLevelType Record from `BrowserEventConstants`.
 * @param {object} nativeEvent Native browser event.
 * @return {?string} The string corresponding to this `beforeInput` event.
 */
function getNativeBeforeInputChars(topLevelType, nativeEvent) {
  switch (topLevelType) {
    case 'topCompositionEnd':
      return getDataFromCustomEvent(nativeEvent);
    case 'topKeyPress':
      /**
       * If native `textInput` events are available, our goal is to make
       * use of them. However, there is a special case: the spacebar key.
       * In Webkit, preventing default on a spacebar `textInput` event
       * cancels character insertion, but it *also* causes the browser
       * to fall back to its default spacebar behavior of scrolling the
       * page.
       *
       * Tracking at:
       * https://code.google.com/p/chromium/issues/detail?id=355103
       *
       * To avoid this issue, use the keypress event as if no `textInput`
       * event is available.
       */
      var which = nativeEvent.which;
      if (which !== SPACEBAR_CODE) {
        return null;
      }

      hasSpaceKeypress = true;
      return SPACEBAR_CHAR;

    case 'topTextInput':
      // Record the characters to be added to the DOM.
      var chars = nativeEvent.data;

      // If it's a spacebar character, assume that we have already handled
      // it at the keypress level and bail immediately. Android Chrome
      // doesn't give us keycodes, so we need to blacklist it.
      if (chars === SPACEBAR_CHAR && hasSpaceKeypress) {
        return null;
      }

      return chars;

    default:
      // For other native event types, do nothing.
      return null;
  }
}

/**
 * For browsers that do not provide the `textInput` event, extract the
 * appropriate string to use for SyntheticInputEvent.
 *
 * @param {string} topLevelType Record from `BrowserEventConstants`.
 * @param {object} nativeEvent Native browser event.
 * @return {?string} The fallback string for this `beforeInput` event.
 */
function getFallbackBeforeInputChars(topLevelType, nativeEvent) {
  // If we are currently composing (IME) and using a fallback to do so,
  // try to extract the composed characters from the fallback object.
  // If composition event is available, we extract a string only at
  // compositionevent, otherwise extract it at fallback events.
  if (isComposing) {
    if (topLevelType === 'topCompositionEnd' || !canUseCompositionEvent && isFallbackCompositionEnd(topLevelType, nativeEvent)) {
      var chars = getData();
      reset();
      isComposing = false;
      return chars;
    }
    return null;
  }

  switch (topLevelType) {
    case 'topPaste':
      // If a paste event occurs after a keypress, throw out the input
      // chars. Paste events should not lead to BeforeInput events.
      return null;
    case 'topKeyPress':
      /**
       * As of v27, Firefox may fire keypress events even when no character
       * will be inserted. A few possibilities:
       *
       * - `which` is `0`. Arrow keys, Esc key, etc.
       *
       * - `which` is the pressed key code, but no char is available.
       *   Ex: 'AltGr + d` in Polish. There is no modified character for
       *   this key combination and no character is inserted into the
       *   document, but FF fires the keypress for char code `100` anyway.
       *   No `input` event will occur.
       *
       * - `which` is the pressed key code, but a command combination is
       *   being used. Ex: `Cmd+C`. No character is inserted, and no
       *   `input` event will occur.
       */
      if (!isKeypressCommand(nativeEvent)) {
        // IE fires the `keypress` event when a user types an emoji via
        // Touch keyboard of Windows.  In such a case, the `char` property
        // holds an emoji character like `\uD83D\uDE0A`.  Because its length
        // is 2, the property `which` does not represent an emoji correctly.
        // In such a case, we directly return the `char` property instead of
        // using `which`.
        if (nativeEvent.char && nativeEvent.char.length > 1) {
          return nativeEvent.char;
        } else if (nativeEvent.which) {
          return String.fromCharCode(nativeEvent.which);
        }
      }
      return null;
    case 'topCompositionEnd':
      return useFallbackCompositionData ? null : nativeEvent.data;
    default:
      return null;
  }
}

/**
 * Extract a SyntheticInputEvent for `beforeInput`, based on either native
 * `textInput` or fallback behavior.
 *
 * @return {?object} A SyntheticInputEvent.
 */
function extractBeforeInputEvent(topLevelType, targetInst, nativeEvent, nativeEventTarget) {
  var chars = void 0;

  if (canUseTextInputEvent) {
    chars = getNativeBeforeInputChars(topLevelType, nativeEvent);
  } else {
    chars = getFallbackBeforeInputChars(topLevelType, nativeEvent);
  }

  // If no characters are being inserted, no BeforeInput event should
  // be fired.
  if (!chars) {
    return null;
  }

  var event = SyntheticInputEvent.getPooled(eventTypes.beforeInput, targetInst, nativeEvent, nativeEventTarget);

  event.data = chars;
  accumulateTwoPhaseDispatches(event);
  return event;
}

/**
 * Create an `onBeforeInput` event to match
 * http://www.w3.org/TR/2013/WD-DOM-Level-3-Events-20131105/#events-inputevents.
 *
 * This event plugin is based on the native `textInput` event
 * available in Chrome, Safari, Opera, and IE. This event fires after
 * `onKeyPress` and `onCompositionEnd`, but before `onInput`.
 *
 * `beforeInput` is spec'd but not implemented in any browsers, and
 * the `input` event does not provide any useful information about what has
 * actually been added, contrary to the spec. Thus, `textInput` is the best
 * available event to identify the characters that have actually been inserted
 * into the target node.
 *
 * This plugin is also responsible for emitting `composition` events, thus
 * allowing us to share composition fallback code for both `beforeInput` and
 * `composition` event types.
 */
var BeforeInputEventPlugin = {
  eventTypes: eventTypes,

  extractEvents: function (topLevelType, targetInst, nativeEvent, nativeEventTarget) {
    var composition = extractCompositionEvent(topLevelType, targetInst, nativeEvent, nativeEventTarget);

    var beforeInput = extractBeforeInputEvent(topLevelType, targetInst, nativeEvent, nativeEventTarget);

    if (composition === null) {
      return beforeInput;
    }

    if (beforeInput === null) {
      return composition;
    }

    return [composition, beforeInput];
  }
};

// Use to restore controlled state after a change event has fired.

var fiberHostComponent = null;

var ReactControlledComponentInjection = {
  injectFiberControlledHostComponent: function (hostComponentImpl) {
    // The fiber implementation doesn't use dynamic dispatch so we need to
    // inject the implementation.
    fiberHostComponent = hostComponentImpl;
  }
};

var restoreTarget = null;
var restoreQueue = null;

function restoreStateOfTarget(target) {
  // We perform this translation at the end of the event loop so that we
  // always receive the correct fiber here
  var internalInstance = getInstanceFromNode(target);
  if (!internalInstance) {
    // Unmounted
    return;
  }
  !(fiberHostComponent && typeof fiberHostComponent.restoreControlledState === 'function') ? invariant(false, 'Fiber needs to be injected to handle a fiber target for controlled events. This error is likely caused by a bug in React. Please file an issue.') : void 0;
  var props = getFiberCurrentPropsFromNode(internalInstance.stateNode);
  fiberHostComponent.restoreControlledState(internalInstance.stateNode, internalInstance.type, props);
}

var injection$2 = ReactControlledComponentInjection;

function enqueueStateRestore(target) {
  if (restoreTarget) {
    if (restoreQueue) {
      restoreQueue.push(target);
    } else {
      restoreQueue = [target];
    }
  } else {
    restoreTarget = target;
  }
}

function needsStateRestore() {
  return restoreTarget !== null || restoreQueue !== null;
}

function restoreStateIfNeeded() {
  if (!restoreTarget) {
    return;
  }
  var target = restoreTarget;
  var queuedTargets = restoreQueue;
  restoreTarget = null;
  restoreQueue = null;

  restoreStateOfTarget(target);
  if (queuedTargets) {
    for (var i = 0; i < queuedTargets.length; i++) {
      restoreStateOfTarget(queuedTargets[i]);
    }
  }
}

var ReactControlledComponent = Object.freeze({
	injection: injection$2,
	enqueueStateRestore: enqueueStateRestore,
	needsStateRestore: needsStateRestore,
	restoreStateIfNeeded: restoreStateIfNeeded
});

// Used as a way to call batchedUpdates when we don't have a reference to
// the renderer. Such as when we're dispatching events or if third party
// libraries need to call batchedUpdates. Eventually, this API will go away when
// everything is batched by default. We'll then have a similar API to opt-out of
// scheduled work and instead do synchronous work.

// Defaults
var _batchedUpdates = function (fn, bookkeeping) {
  return fn(bookkeeping);
};
var _interactiveUpdates = function (fn, a, b) {
  return fn(a, b);
};
var _flushInteractiveUpdates = function () {};

var isBatching = false;
function batchedUpdates(fn, bookkeeping) {
  if (isBatching) {
    // If we are currently inside another batch, we need to wait until it
    // fully completes before restoring state.
    return fn(bookkeeping);
  }
  isBatching = true;
  try {
    return _batchedUpdates(fn, bookkeeping);
  } finally {
    // Here we wait until all updates have propagated, which is important
    // when using controlled components within layers:
    // https://github.com/facebook/react/issues/1698
    // Then we restore state of any controlled component.
    isBatching = false;
    var controlledComponentsHavePendingUpdates = needsStateRestore();
    if (controlledComponentsHavePendingUpdates) {
      // If a controlled event was fired, we may need to restore the state of
      // the DOM node back to the controlled value. This is necessary when React
      // bails out of the update without touching the DOM.
      _flushInteractiveUpdates();
      restoreStateIfNeeded();
    }
  }
}

function interactiveUpdates(fn, a, b) {
  return _interactiveUpdates(fn, a, b);
}



var injection$3 = {
  injectRenderer: function (renderer) {
    _batchedUpdates = renderer.batchedUpdates;
    _interactiveUpdates = renderer.interactiveUpdates;
    _flushInteractiveUpdates = renderer.flushInteractiveUpdates;
  }
};

/**
 * @see http://www.whatwg.org/specs/web-apps/current-work/multipage/the-input-element.html#input-type-attr-summary
 */
var supportedInputTypes = {
  color: true,
  date: true,
  datetime: true,
  'datetime-local': true,
  email: true,
  month: true,
  number: true,
  password: true,
  range: true,
  search: true,
  tel: true,
  text: true,
  time: true,
  url: true,
  week: true
};

function isTextInputElement(elem) {
  var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();

  if (nodeName === 'input') {
    return !!supportedInputTypes[elem.type];
  }

  if (nodeName === 'textarea') {
    return true;
  }

  return false;
}

/**
 * HTML nodeType values that represent the type of the node
 */

var ELEMENT_NODE = 1;
var TEXT_NODE = 3;
var COMMENT_NODE = 8;
var DOCUMENT_NODE = 9;
var DOCUMENT_FRAGMENT_NODE = 11;

/**
 * Gets the target node from a native browser event by accounting for
 * inconsistencies in browser DOM APIs.
 *
 * @param {object} nativeEvent Native browser event.
 * @return {DOMEventTarget} Target node.
 */
function getEventTarget(nativeEvent) {
  var target = nativeEvent.target || window;

  // Normalize SVG <use> element events #4963
  if (target.correspondingUseElement) {
    target = target.correspondingUseElement;
  }

  // Safari may fire events on text nodes (Node.TEXT_NODE is 3).
  // @see http://www.quirksmode.org/js/events_properties.html
  return target.nodeType === TEXT_NODE ? target.parentNode : target;
}

/**
 * Checks if an event is supported in the current execution environment.
 *
 * NOTE: This will not work correctly for non-generic events such as `change`,
 * `reset`, `load`, `error`, and `select`.
 *
 * Borrows from Modernizr.
 *
 * @param {string} eventNameSuffix Event name, e.g. "click".
 * @param {?boolean} capture Check if the capture phase is supported.
 * @return {boolean} True if the event is supported.
 * @internal
 * @license Modernizr 3.0.0pre (Custom Build) | MIT
 */
function isEventSupported(eventNameSuffix, capture) {
  if (!ExecutionEnvironment.canUseDOM || capture && !('addEventListener' in document)) {
    return false;
  }

  var eventName = 'on' + eventNameSuffix;
  var isSupported = eventName in document;

  if (!isSupported) {
    var element = document.createElement('div');
    element.setAttribute(eventName, 'return;');
    isSupported = typeof element[eventName] === 'function';
  }

  return isSupported;
}

function isCheckable(elem) {
  var type = elem.type;
  var nodeName = elem.nodeName;
  return nodeName && nodeName.toLowerCase() === 'input' && (type === 'checkbox' || type === 'radio');
}

function getTracker(node) {
  return node._valueTracker;
}

function detachTracker(node) {
  node._valueTracker = null;
}

function getValueFromNode(node) {
  var value = '';
  if (!node) {
    return value;
  }

  if (isCheckable(node)) {
    value = node.checked ? 'true' : 'false';
  } else {
    value = node.value;
  }

  return value;
}

function trackValueOnNode(node) {
  var valueField = isCheckable(node) ? 'checked' : 'value';
  var descriptor = Object.getOwnPropertyDescriptor(node.constructor.prototype, valueField);

  var currentValue = '' + node[valueField];

  // if someone has already defined a value or Safari, then bail
  // and don't track value will cause over reporting of changes,
  // but it's better then a hard failure
  // (needed for certain tests that spyOn input values and Safari)
  if (node.hasOwnProperty(valueField) || typeof descriptor.get !== 'function' || typeof descriptor.set !== 'function') {
    return;
  }

  Object.defineProperty(node, valueField, {
    configurable: true,
    get: function () {
      return descriptor.get.call(this);
    },
    set: function (value) {
      currentValue = '' + value;
      descriptor.set.call(this, value);
    }
  });
  // We could've passed this the first time
  // but it triggers a bug in IE11 and Edge 14/15.
  // Calling defineProperty() again should be equivalent.
  // https://github.com/facebook/react/issues/11768
  Object.defineProperty(node, valueField, {
    enumerable: descriptor.enumerable
  });

  var tracker = {
    getValue: function () {
      return currentValue;
    },
    setValue: function (value) {
      currentValue = '' + value;
    },
    stopTracking: function () {
      detachTracker(node);
      delete node[valueField];
    }
  };
  return tracker;
}

function track(node) {
  if (getTracker(node)) {
    return;
  }

  // TODO: Once it's just Fiber we can move this to node._wrapperState
  node._valueTracker = trackValueOnNode(node);
}

function updateValueIfChanged(node) {
  if (!node) {
    return false;
  }

  var tracker = getTracker(node);
  // if there is no tracker at this point it's unlikely
  // that trying again will succeed
  if (!tracker) {
    return true;
  }

  var lastValue = tracker.getValue();
  var nextValue = getValueFromNode(node);
  if (nextValue !== lastValue) {
    tracker.setValue(nextValue);
    return true;
  }
  return false;
}

var ReactInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

var ReactCurrentOwner = ReactInternals.ReactCurrentOwner;
var ReactDebugCurrentFrame = ReactInternals.ReactDebugCurrentFrame;

var describeComponentFrame = function (name, source, ownerName) {
  return '\n    in ' + (name || 'Unknown') + (source ? ' (at ' + source.fileName.replace(/^.*[\\\/]/, '') + ':' + source.lineNumber + ')' : ownerName ? ' (created by ' + ownerName + ')' : '');
};

// The Symbol used to tag the ReactElement-like types. If there is no native Symbol
// nor polyfill, then a plain number is used for performance.
var hasSymbol = typeof Symbol === 'function' && Symbol['for'];

var REACT_ELEMENT_TYPE = hasSymbol ? Symbol['for']('react.element') : 0xeac7;
var REACT_CALL_TYPE = hasSymbol ? Symbol['for']('react.call') : 0xeac8;
var REACT_RETURN_TYPE = hasSymbol ? Symbol['for']('react.return') : 0xeac9;
var REACT_PORTAL_TYPE = hasSymbol ? Symbol['for']('react.portal') : 0xeaca;
var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol['for']('react.fragment') : 0xeacb;
var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol['for']('react.strict_mode') : 0xeacc;
var REACT_PROVIDER_TYPE = hasSymbol ? Symbol['for']('react.provider') : 0xeacd;
var REACT_CONTEXT_TYPE = hasSymbol ? Symbol['for']('react.context') : 0xeace;
var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol['for']('react.async_mode') : 0xeacf;
var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol['for']('react.forward_ref') : 0xead0;

var MAYBE_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
var FAUX_ITERATOR_SYMBOL = '@@iterator';

function getIteratorFn(maybeIterable) {
  if (maybeIterable === null || typeof maybeIterable === 'undefined') {
    return null;
  }
  var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
  if (typeof maybeIterator === 'function') {
    return maybeIterator;
  }
  return null;
}

function getComponentName(fiber) {
  var type = fiber.type;

  if (typeof type === 'function') {
    return type.displayName || type.name;
  }
  if (typeof type === 'string') {
    return type;
  }
  switch (type) {
    case REACT_FRAGMENT_TYPE:
      return 'ReactFragment';
    case REACT_PORTAL_TYPE:
      return 'ReactPortal';
    case REACT_CALL_TYPE:
      return 'ReactCall';
    case REACT_RETURN_TYPE:
      return 'ReactReturn';
  }
  if (typeof type === 'object' && type !== null) {
    switch (type.$$typeof) {
      case REACT_FORWARD_REF_TYPE:
        var functionName = type.render.displayName || type.render.name || '';
        return functionName !== '' ? 'ForwardRef(' + functionName + ')' : 'ForwardRef';
    }
  }
  return null;
}

function describeFiber(fiber) {
  switch (fiber.tag) {
    case IndeterminateComponent:
    case FunctionalComponent:
    case ClassComponent:
    case HostComponent:
      var owner = fiber._debugOwner;
      var source = fiber._debugSource;
      var name = getComponentName(fiber);
      var ownerName = null;
      if (owner) {
        ownerName = getComponentName(owner);
      }
      return describeComponentFrame(name, source, ownerName);
    default:
      return '';
  }
}

// This function can only be called with a work-in-progress fiber and
// only during begin or complete phase. Do not call it under any other
// circumstances.
function getStackAddendumByWorkInProgressFiber(workInProgress) {
  var info = '';
  var node = workInProgress;
  do {
    info += describeFiber(node);
    // Otherwise this return pointer might point to the wrong tree:
    node = node['return'];
  } while (node);
  return info;
}

function getCurrentFiberOwnerName$1() {
  {
    var fiber = ReactDebugCurrentFiber.current;
    if (fiber === null) {
      return null;
    }
    var owner = fiber._debugOwner;
    if (owner !== null && typeof owner !== 'undefined') {
      return getComponentName(owner);
    }
  }
  return null;
}

function getCurrentFiberStackAddendum$1() {
  {
    var fiber = ReactDebugCurrentFiber.current;
    if (fiber === null) {
      return null;
    }
    // Safe because if current fiber exists, we are reconciling,
    // and it is guaranteed to be the work-in-progress version.
    return getStackAddendumByWorkInProgressFiber(fiber);
  }
  return null;
}

function resetCurrentFiber() {
  ReactDebugCurrentFrame.getCurrentStack = null;
  ReactDebugCurrentFiber.current = null;
  ReactDebugCurrentFiber.phase = null;
}

function setCurrentFiber(fiber) {
  ReactDebugCurrentFrame.getCurrentStack = getCurrentFiberStackAddendum$1;
  ReactDebugCurrentFiber.current = fiber;
  ReactDebugCurrentFiber.phase = null;
}

function setCurrentPhase(phase) {
  ReactDebugCurrentFiber.phase = phase;
}

var ReactDebugCurrentFiber = {
  current: null,
  phase: null,
  resetCurrentFiber: resetCurrentFiber,
  setCurrentFiber: setCurrentFiber,
  setCurrentPhase: setCurrentPhase,
  getCurrentFiberOwnerName: getCurrentFiberOwnerName$1,
  getCurrentFiberStackAddendum: getCurrentFiberStackAddendum$1
};

// A reserved attribute.
// It is handled by React separately and shouldn't be written to the DOM.
var RESERVED = 0;

// A simple string attribute.
// Attributes that aren't in the whitelist are presumed to have this type.
var STRING = 1;

// A string attribute that accepts booleans in React. In HTML, these are called
// "enumerated" attributes with "true" and "false" as possible values.
// When true, it should be set to a "true" string.
// When false, it should be set to a "false" string.
var BOOLEANISH_STRING = 2;

// A real boolean attribute.
// When true, it should be present (set either to an empty string or its name).
// When false, it should be omitted.
var BOOLEAN = 3;

// An attribute that can be used as a flag as well as with a value.
// When true, it should be present (set either to an empty string or its name).
// When false, it should be omitted.
// For any other value, should be present with that value.
var OVERLOADED_BOOLEAN = 4;

// An attribute that must be numeric or parse as a numeric.
// When falsy, it should be removed.
var NUMERIC = 5;

// An attribute that must be positive numeric or parse as a positive numeric.
// When falsy, it should be removed.
var POSITIVE_NUMERIC = 6;

/* eslint-disable max-len */
var ATTRIBUTE_NAME_START_CHAR = ':A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD';
/* eslint-enable max-len */
var ATTRIBUTE_NAME_CHAR = ATTRIBUTE_NAME_START_CHAR + '\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040';


var ROOT_ATTRIBUTE_NAME = 'data-reactroot';
var VALID_ATTRIBUTE_NAME_REGEX = new RegExp('^[' + ATTRIBUTE_NAME_START_CHAR + '][' + ATTRIBUTE_NAME_CHAR + ']*$');

var illegalAttributeNameCache = {};
var validatedAttributeNameCache = {};

function isAttributeNameSafe(attributeName) {
  if (validatedAttributeNameCache.hasOwnProperty(attributeName)) {
    return true;
  }
  if (illegalAttributeNameCache.hasOwnProperty(attributeName)) {
    return false;
  }
  if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) {
    validatedAttributeNameCache[attributeName] = true;
    return true;
  }
  illegalAttributeNameCache[attributeName] = true;
  {
    warning(false, 'Invalid attribute name: `%s`', attributeName);
  }
  return false;
}

function shouldIgnoreAttribute(name, propertyInfo, isCustomComponentTag) {
  if (propertyInfo !== null) {
    return propertyInfo.type === RESERVED;
  }
  if (isCustomComponentTag) {
    return false;
  }
  if (name.length > 2 && (name[0] === 'o' || name[0] === 'O') && (name[1] === 'n' || name[1] === 'N')) {
    return true;
  }
  return false;
}

function shouldRemoveAttributeWithWarning(name, value, propertyInfo, isCustomComponentTag) {
  if (propertyInfo !== null && propertyInfo.type === RESERVED) {
    return false;
  }
  switch (typeof value) {
    case 'function':
    // $FlowIssue symbol is perfectly valid here
    case 'symbol':
      // eslint-disable-line
      return true;
    case 'boolean':
      {
        if (isCustomComponentTag) {
          return false;
        }
        if (propertyInfo !== null) {
          return !propertyInfo.acceptsBooleans;
        } else {
          var prefix = name.toLowerCase().slice(0, 5);
          return prefix !== 'data-' && prefix !== 'aria-';
        }
      }
    default:
      return false;
  }
}

function shouldRemoveAttribute(name, value, propertyInfo, isCustomComponentTag) {
  if (value === null || typeof value === 'undefined') {
    return true;
  }
  if (shouldRemoveAttributeWithWarning(name, value, propertyInfo, isCustomComponentTag)) {
    return true;
  }
  if (propertyInfo !== null) {
    switch (propertyInfo.type) {
      case BOOLEAN:
        return !value;
      case OVERLOADED_BOOLEAN:
        return value === false;
      case NUMERIC:
        return isNaN(value);
      case POSITIVE_NUMERIC:
        return isNaN(value) || value < 1;
    }
  }
  return false;
}

function getPropertyInfo(name) {
  return properties.hasOwnProperty(name) ? properties[name] : null;
}

function PropertyInfoRecord(name, type, mustUseProperty, attributeName, attributeNamespace) {
  this.acceptsBooleans = type === BOOLEANISH_STRING || type === BOOLEAN || type === OVERLOADED_BOOLEAN;
  this.attributeName = attributeName;
  this.attributeNamespace = attributeNamespace;
  this.mustUseProperty = mustUseProperty;
  this.propertyName = name;
  this.type = type;
}

// When adding attributes to this list, be sure to also add them to
// the `possibleStandardNames` module to ensure casing and incorrect
// name warnings.
var properties = {};

// These props are reserved by React. They shouldn't be written to the DOM.
['children', 'dangerouslySetInnerHTML',
// TODO: This prevents the assignment of defaultValue to regular
// elements (not just inputs). Now that ReactDOMInput assigns to the
// defaultValue property -- do we need this?
'defaultValue', 'defaultChecked', 'innerHTML', 'suppressContentEditableWarning', 'suppressHydrationWarning', 'style'].forEach(function (name) {
  properties[name] = new PropertyInfoRecord(name, RESERVED, false, // mustUseProperty
  name, // attributeName
  null);
});

// A few React string attributes have a different name.
// This is a mapping from React prop names to the attribute names.
[['acceptCharset', 'accept-charset'], ['className', 'class'], ['htmlFor', 'for'], ['httpEquiv', 'http-equiv']].forEach(function (_ref) {
  var name = _ref[0],
      attributeName = _ref[1];

  properties[name] = new PropertyInfoRecord(name, STRING, false, // mustUseProperty
  attributeName, // attributeName
  null);
});

// These are "enumerated" HTML attributes that accept "true" and "false".
// In React, we let users pass `true` and `false` even though technically
// these aren't boolean attributes (they are coerced to strings).
['contentEditable', 'draggable', 'spellCheck', 'value'].forEach(function (name) {
  properties[name] = new PropertyInfoRecord(name, BOOLEANISH_STRING, false, // mustUseProperty
  name.toLowerCase(), // attributeName
  null);
});

// These are "enumerated" SVG attributes that accept "true" and "false".
// In React, we let users pass `true` and `false` even though technically
// these aren't boolean attributes (they are coerced to strings).
// Since these are SVG attributes, their attribute names are case-sensitive.
['autoReverse', 'externalResourcesRequired', 'preserveAlpha'].forEach(function (name) {
  properties[name] = new PropertyInfoRecord(name, BOOLEANISH_STRING, false, // mustUseProperty
  name, // attributeName
  null);
});

// These are HTML boolean attributes.
['allowFullScreen', 'async',
// Note: there is a special case that prevents it from being written to the DOM
// on the client side because the browsers are inconsistent. Instead we call focus().
'autoFocus', 'autoPlay', 'controls', 'default', 'defer', 'disabled', 'formNoValidate', 'hidden', 'loop', 'noModule', 'noValidate', 'open', 'playsInline', 'readOnly', 'required', 'reversed', 'scoped', 'seamless',
// Microdata
'itemScope'].forEach(function (name) {
  properties[name] = new PropertyInfoRecord(name, BOOLEAN, false, // mustUseProperty
  name.toLowerCase(), // attributeName
  null);
});

// These are the few React props that we set as DOM properties
// rather than attributes. These are all booleans.
['checked',
// Note: `option.selected` is not updated if `select.multiple` is
// disabled with `removeAttribute`. We have special logic for handling this.
'multiple', 'muted', 'selected'].forEach(function (name) {
  properties[name] = new PropertyInfoRecord(name, BOOLEAN, true, // mustUseProperty
  name.toLowerCase(), // attributeName
  null);
});

// These are HTML attributes that are "overloaded booleans": they behave like
// booleans, but can also accept a string value.
['capture', 'download'].forEach(function (name) {
  properties[name] = new PropertyInfoRecord(name, OVERLOADED_BOOLEAN, false, // mustUseProperty
  name.toLowerCase(), // attributeName
  null);
});

// These are HTML attributes that must be positive numbers.
['cols', 'rows', 'size', 'span'].forEach(function (name) {
  properties[name] = new PropertyInfoRecord(name, POSITIVE_NUMERIC, false, // mustUseProperty
  name.toLowerCase(), // attributeName
  null);
});

// These are HTML attributes that must be numbers.
['rowSpan', 'start'].forEach(function (name) {
  properties[name] = new PropertyInfoRecord(name, NUMERIC, false, // mustUseProperty
  name.toLowerCase(), // attributeName
  null);
});

var CAMELIZE = /[\-\:]([a-z])/g;
var capitalize = function (token) {
  return token[1].toUpperCase();
};

// This is a list of all SVG attributes that need special casing, namespacing,
// or boolean value assignment. Regular attributes that just accept strings
// and have the same names are omitted, just like in the HTML whitelist.
// Some of these attributes can be hard to find. This list was created by
// scrapping the MDN documentation.
['accent-height', 'alignment-baseline', 'arabic-form', 'baseline-shift', 'cap-height', 'clip-path', 'clip-rule', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'dominant-baseline', 'enable-background', 'fill-opacity', 'fill-rule', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'glyph-name', 'glyph-orientation-horizontal', 'glyph-orientation-vertical', 'horiz-adv-x', 'horiz-origin-x', 'image-rendering', 'letter-spacing', 'lighting-color', 'marker-end', 'marker-mid', 'marker-start', 'overline-position', 'overline-thickness', 'paint-order', 'panose-1', 'pointer-events', 'rendering-intent', 'shape-rendering', 'stop-color', 'stop-opacity', 'strikethrough-position', 'strikethrough-thickness', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'text-anchor', 'text-decoration', 'text-rendering', 'underline-position', 'underline-thickness', 'unicode-bidi', 'unicode-range', 'units-per-em', 'v-alphabetic', 'v-hanging', 'v-ideographic', 'v-mathematical', 'vector-effect', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'word-spacing', 'writing-mode', 'xmlns:xlink', 'x-height'].forEach(function (attributeName) {
  var name = attributeName.replace(CAMELIZE, capitalize);
  properties[name] = new PropertyInfoRecord(name, STRING, false, // mustUseProperty
  attributeName, null);
});

// String SVG attributes with the xlink namespace.
['xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type'].forEach(function (attributeName) {
  var name = attributeName.replace(CAMELIZE, capitalize);
  properties[name] = new PropertyInfoRecord(name, STRING, false, // mustUseProperty
  attributeName, 'http://www.w3.org/1999/xlink');
});

// String SVG attributes with the xml namespace.
['xml:base', 'xml:lang', 'xml:space'].forEach(function (attributeName) {
  var name = attributeName.replace(CAMELIZE, capitalize);
  properties[name] = new PropertyInfoRecord(name, STRING, false, // mustUseProperty
  attributeName, 'http://www.w3.org/XML/1998/namespace');
});

// Special case: this attribute exists both in HTML and SVG.
// Its "tabindex" attribute name is case-sensitive in SVG so we can't just use
// its React `tabIndex` name, like we do for attributes that exist only in HTML.
properties.tabIndex = new PropertyInfoRecord('tabIndex', STRING, false, // mustUseProperty
'tabindex', // attributeName
null);

/**
 * Get the value for a property on a node. Only used in DEV for SSR validation.
 * The "expected" argument is used as a hint of what the expected value is.
 * Some properties have multiple equivalent values.
 */
function getValueForProperty(node, name, expected, propertyInfo) {
  {
    if (propertyInfo.mustUseProperty) {
      var propertyName = propertyInfo.propertyName;

      return node[propertyName];
    } else {
      var attributeName = propertyInfo.attributeName;

      var stringValue = null;

      if (propertyInfo.type === OVERLOADED_BOOLEAN) {
        if (node.hasAttribute(attributeName)) {
          var value = node.getAttribute(attributeName);
          if (value === '') {
            return true;
          }
          if (shouldRemoveAttribute(name, expected, propertyInfo, false)) {
            return value;
          }
          if (value === '' + expected) {
            return expected;
          }
          return value;
        }
      } else if (node.hasAttribute(attributeName)) {
        if (shouldRemoveAttribute(name, expected, propertyInfo, false)) {
          // We had an attribute but shouldn't have had one, so read it
          // for the error message.
          return node.getAttribute(attributeName);
        }
        if (propertyInfo.type === BOOLEAN) {
          // If this was a boolean, it doesn't matter what the value is
          // the fact that we have it is the same as the expected.
          return expected;
        }
        // Even if this property uses a namespace we use getAttribute
        // because we assume its namespaced name is the same as our config.
        // To use getAttributeNS we need the local name which we don't have
        // in our config atm.
        stringValue = node.getAttribute(attributeName);
      }

      if (shouldRemoveAttribute(name, expected, propertyInfo, false)) {
        return stringValue === null ? expected : stringValue;
      } else if (stringValue === '' + expected) {
        return expected;
      } else {
        return stringValue;
      }
    }
  }
}

/**
 * Get the value for a attribute on a node. Only used in DEV for SSR validation.
 * The third argument is used as a hint of what the expected value is. Some
 * attributes have multiple equivalent values.
 */
function getValueForAttribute(node, name, expected) {
  {
    if (!isAttributeNameSafe(name)) {
      return;
    }
    if (!node.hasAttribute(name)) {
      return expected === undefined ? undefined : null;
    }
    var value = node.getAttribute(name);
    if (value === '' + expected) {
      return expected;
    }
    return value;
  }
}

/**
 * Sets the value for a property on a node.
 *
 * @param {DOMElement} node
 * @param {string} name
 * @param {*} value
 */
function setValueForProperty(node, name, value, isCustomComponentTag) {
  var propertyInfo = getPropertyInfo(name);
  if (shouldIgnoreAttribute(name, propertyInfo, isCustomComponentTag)) {
    return;
  }
  if (shouldRemoveAttribute(name, value, propertyInfo, isCustomComponentTag)) {
    value = null;
  }
  // If the prop isn't in the special list, treat it as a simple attribute.
  if (isCustomComponentTag || propertyInfo === null) {
    if (isAttributeNameSafe(name)) {
      var _attributeName = name;
      if (value === null) {
        node.removeAttribute(_attributeName);
      } else {
        node.setAttribute(_attributeName, '' + value);
      }
    }
    return;
  }
  var mustUseProperty = propertyInfo.mustUseProperty;

  if (mustUseProperty) {
    var propertyName = propertyInfo.propertyName;

    if (value === null) {
      var type = propertyInfo.type;

      node[propertyName] = type === BOOLEAN ? false : '';
    } else {
      // Contrary to `setAttribute`, object properties are properly
      // `toString`ed by IE8/9.
      node[propertyName] = value;
    }
    return;
  }
  // The rest are treated as attributes with special cases.
  var attributeName = propertyInfo.attributeName,
      attributeNamespace = propertyInfo.attributeNamespace;

  if (value === null) {
    node.removeAttribute(attributeName);
  } else {
    var _type = propertyInfo.type;

    var attributeValue = void 0;
    if (_type === BOOLEAN || _type === OVERLOADED_BOOLEAN && value === true) {
      attributeValue = '';
    } else {
      // `setAttribute` with objects becomes only `[object]` in IE8/9,
      // ('' + value) makes it output the correct toString()-value.
      attributeValue = '' + value;
    }
    if (attributeNamespace) {
      node.setAttributeNS(attributeNamespace, attributeName, attributeValue);
    } else {
      node.setAttribute(attributeName, attributeValue);
    }
  }
}

var ReactControlledValuePropTypes = {
  checkPropTypes: null
};

{
  var hasReadOnlyValue = {
    button: true,
    checkbox: true,
    image: true,
    hidden: true,
    radio: true,
    reset: true,
    submit: true
  };

  var propTypes = {
    value: function (props, propName, componentName) {
      if (!props[propName] || hasReadOnlyValue[props.type] || props.onChange || props.readOnly || props.disabled) {
        return null;
      }
      return new Error('You provided a `value` prop to a form field without an ' + '`onChange` handler. This will render a read-only field. If ' + 'the field should be mutable use `defaultValue`. Otherwise, ' + 'set either `onChange` or `readOnly`.');
    },
    checked: function (props, propName, componentName) {
      if (!props[propName] || props.onChange || props.readOnly || props.disabled) {
        return null;
      }
      return new Error('You provided a `checked` prop to a form field without an ' + '`onChange` handler. This will render a read-only field. If ' + 'the field should be mutable use `defaultChecked`. Otherwise, ' + 'set either `onChange` or `readOnly`.');
    }
  };

  /**
   * Provide a linked `value` attribute for controlled forms. You should not use
   * this outside of the ReactDOM controlled form components.
   */
  ReactControlledValuePropTypes.checkPropTypes = function (tagName, props, getStack) {
    checkPropTypes(propTypes, props, 'prop', tagName, getStack);
  };
}

// TODO: direct imports like some-package/src/* are bad. Fix me.
var getCurrentFiberOwnerName = ReactDebugCurrentFiber.getCurrentFiberOwnerName;
var getCurrentFiberStackAddendum = ReactDebugCurrentFiber.getCurrentFiberStackAddendum;

var didWarnValueDefaultValue = false;
var didWarnCheckedDefaultChecked = false;
var didWarnControlledToUncontrolled = false;
var didWarnUncontrolledToControlled = false;

function isControlled(props) {
  var usesChecked = props.type === 'checkbox' || props.type === 'radio';
  return usesChecked ? props.checked != null : props.value != null;
}

/**
 * Implements an <input> host component that allows setting these optional
 * props: `checked`, `value`, `defaultChecked`, and `defaultValue`.
 *
 * If `checked` or `value` are not supplied (or null/undefined), user actions
 * that affect the checked state or value will trigger updates to the element.
 *
 * If they are supplied (and not null/undefined), the rendered element will not
 * trigger updates to the element. Instead, the props must change in order for
 * the rendered element to be updated.
 *
 * The rendered element will be initialized as unchecked (or `defaultChecked`)
 * with an empty value (or `defaultValue`).
 *
 * See http://www.w3.org/TR/2012/WD-html5-20121025/the-input-element.html
 */

function getHostProps(element, props) {
  var node = element;
  var checked = props.checked;

  var hostProps = _assign({}, props, {
    defaultChecked: undefined,
    defaultValue: undefined,
    value: undefined,
    checked: checked != null ? checked : node._wrapperState.initialChecked
  });

  return hostProps;
}

function initWrapperState(element, props) {
  {
    ReactControlledValuePropTypes.checkPropTypes('input', props, getCurrentFiberStackAddendum);

    if (props.checked !== undefined && props.defaultChecked !== undefined && !didWarnCheckedDefaultChecked) {
      warning(false, '%s contains an input of type %s with both checked and defaultChecked props. ' + 'Input elements must be either controlled or uncontrolled ' + '(specify either the checked prop, or the defaultChecked prop, but not ' + 'both). Decide between using a controlled or uncontrolled input ' + 'element and remove one of these props. More info: ' + 'https://fb.me/react-controlled-components', getCurrentFiberOwnerName() || 'A component', props.type);
      didWarnCheckedDefaultChecked = true;
    }
    if (props.value !== undefined && props.defaultValue !== undefined && !didWarnValueDefaultValue) {
      warning(false, '%s contains an input of type %s with both value and defaultValue props. ' + 'Input elements must be either controlled or uncontrolled ' + '(specify either the value prop, or the defaultValue prop, but not ' + 'both). Decide between using a controlled or uncontrolled input ' + 'element and remove one of these props. More info: ' + 'https://fb.me/react-controlled-components', getCurrentFiberOwnerName() || 'A component', props.type);
      didWarnValueDefaultValue = true;
    }
  }

  var node = element;
  var defaultValue = props.defaultValue == null ? '' : props.defaultValue;

  node._wrapperState = {
    initialChecked: props.checked != null ? props.checked : props.defaultChecked,
    initialValue: getSafeValue(props.value != null ? props.value : defaultValue),
    controlled: isControlled(props)
  };
}

function updateChecked(element, props) {
  var node = element;
  var checked = props.checked;
  if (checked != null) {
    setValueForProperty(node, 'checked', checked, false);
  }
}

function updateWrapper(element, props) {
  var node = element;
  {
    var _controlled = isControlled(props);

    if (!node._wrapperState.controlled && _controlled && !didWarnUncontrolledToControlled) {
      warning(false, 'A component is changing an uncontrolled input of type %s to be controlled. ' + 'Input elements should not switch from uncontrolled to controlled (or vice versa). ' + 'Decide between using a controlled or uncontrolled input ' + 'element for the lifetime of the component. More info: https://fb.me/react-controlled-components%s', props.type, getCurrentFiberStackAddendum());
      didWarnUncontrolledToControlled = true;
    }
    if (node._wrapperState.controlled && !_controlled && !didWarnControlledToUncontrolled) {
      warning(false, 'A component is changing a controlled input of type %s to be uncontrolled. ' + 'Input elements should not switch from controlled to uncontrolled (or vice versa). ' + 'Decide between using a controlled or uncontrolled input ' + 'element for the lifetime of the component. More info: https://fb.me/react-controlled-components%s', props.type, getCurrentFiberStackAddendum());
      didWarnControlledToUncontrolled = true;
    }
  }

  updateChecked(element, props);

  var value = getSafeValue(props.value);

  if (value != null) {
    if (props.type === 'number') {
      if (value === 0 && node.value === '' ||
      // eslint-disable-next-line
      node.value != value) {
        node.value = '' + value;
      }
    } else if (node.value !== '' + value) {
      node.value = '' + value;
    }
  }

  if (props.hasOwnProperty('value')) {
    setDefaultValue(node, props.type, value);
  } else if (props.hasOwnProperty('defaultValue')) {
    setDefaultValue(node, props.type, getSafeValue(props.defaultValue));
  }

  if (props.checked == null && props.defaultChecked != null) {
    node.defaultChecked = !!props.defaultChecked;
  }
}

function postMountWrapper(element, props) {
  var node = element;

  if (props.hasOwnProperty('value') || props.hasOwnProperty('defaultValue')) {
    // Do not assign value if it is already set. This prevents user text input
    // from being lost during SSR hydration.
    if (node.value === '') {
      node.value = '' + node._wrapperState.initialValue;
    }

    // value must be assigned before defaultValue. This fixes an issue where the
    // visually displayed value of date inputs disappears on mobile Safari and Chrome:
    // https://github.com/facebook/react/issues/7233
    node.defaultValue = '' + node._wrapperState.initialValue;
  }

  // Normally, we'd just do `node.checked = node.checked` upon initial mount, less this bug
  // this is needed to work around a chrome bug where setting defaultChecked
  // will sometimes influence the value of checked (even after detachment).
  // Reference: https://bugs.chromium.org/p/chromium/issues/detail?id=608416
  // We need to temporarily unset name to avoid disrupting radio button groups.
  var name = node.name;
  if (name !== '') {
    node.name = '';
  }
  node.defaultChecked = !node.defaultChecked;
  node.defaultChecked = !node.defaultChecked;
  if (name !== '') {
    node.name = name;
  }
}

function restoreControlledState(element, props) {
  var node = element;
  updateWrapper(node, props);
  updateNamedCousins(node, props);
}

function updateNamedCousins(rootNode, props) {
  var name = props.name;
  if (props.type === 'radio' && name != null) {
    var queryRoot = rootNode;

    while (queryRoot.parentNode) {
      queryRoot = queryRoot.parentNode;
    }

    // If `rootNode.form` was non-null, then we could try `form.elements`,
    // but that sometimes behaves strangely in IE8. We could also try using
    // `form.getElementsByName`, but that will only return direct children
    // and won't include inputs that use the HTML5 `form=` attribute. Since
    // the input might not even be in a form. It might not even be in the
    // document. Let's just use the local `querySelectorAll` to ensure we don't
    // miss anything.
    var group = queryRoot.querySelectorAll('input[name=' + JSON.stringify('' + name) + '][type="radio"]');

    for (var i = 0; i < group.length; i++) {
      var otherNode = group[i];
      if (otherNode === rootNode || otherNode.form !== rootNode.form) {
        continue;
      }
      // This will throw if radio buttons rendered by different copies of React
      // and the same name are rendered into the same form (same as #1939).
      // That's probably okay; we don't support it just as we don't support
      // mixing React radio buttons with non-React ones.
      var otherProps = getFiberCurrentPropsFromNode$1(otherNode);
      !otherProps ? invariant(false, 'ReactDOMInput: Mixing React and non-React radio inputs with the same `name` is not supported.') : void 0;

      // We need update the tracked value on the named cousin since the value
      // was changed but the input saw no event or value set
      updateValueIfChanged(otherNode);

      // If this is a controlled radio button group, forcing the input that
      // was previously checked to update will cause it to be come re-checked
      // as appropriate.
      updateWrapper(otherNode, otherProps);
    }
  }
}

// In Chrome, assigning defaultValue to certain input types triggers input validation.
// For number inputs, the display value loses trailing decimal points. For email inputs,
// Chrome raises "The specified value <x> is not a valid email address".
//
// Here we check to see if the defaultValue has actually changed, avoiding these problems
// when the user is inputting text
//
// https://github.com/facebook/react/issues/7253
function setDefaultValue(node, type, value) {
  if (
  // Focused number inputs synchronize on blur. See ChangeEventPlugin.js
  type !== 'number' || node.ownerDocument.activeElement !== node) {
    if (value == null) {
      node.defaultValue = '' + node._wrapperState.initialValue;
    } else if (node.defaultValue !== '' + value) {
      node.defaultValue = '' + value;
    }
  }
}

function getSafeValue(value) {
  switch (typeof value) {
    case 'boolean':
    case 'number':
    case 'object':
    case 'string':
    case 'undefined':
      return value;
    default:
      // function, symbol are assigned as empty strings
      return '';
  }
}

var eventTypes$1 = {
  change: {
    phasedRegistrationNames: {
      bubbled: 'onChange',
      captured: 'onChangeCapture'
    },
    dependencies: ['topBlur', 'topChange', 'topClick', 'topFocus', 'topInput', 'topKeyDown', 'topKeyUp', 'topSelectionChange']
  }
};

function createAndAccumulateChangeEvent(inst, nativeEvent, target) {
  var event = SyntheticEvent$1.getPooled(eventTypes$1.change, inst, nativeEvent, target);
  event.type = 'change';
  // Flag this event loop as needing state restore.
  enqueueStateRestore(target);
  accumulateTwoPhaseDispatches(event);
  return event;
}
/**
 * For IE shims
 */
var activeElement = null;
var activeElementInst = null;

/**
 * SECTION: handle `change` event
 */
function shouldUseChangeEvent(elem) {
  var nodeName = elem.nodeName && elem.nodeName.toLowerCase();
  return nodeName === 'select' || nodeName === 'input' && elem.type === 'file';
}

function manualDispatchChangeEvent(nativeEvent) {
  var event = createAndAccumulateChangeEvent(activeElementInst, nativeEvent, getEventTarget(nativeEvent));

  // If change and propertychange bubbled, we'd just bind to it like all the
  // other events and have it go through ReactBrowserEventEmitter. Since it
  // doesn't, we manually listen for the events and so we have to enqueue and
  // process the abstract event manually.
  //
  // Batching is necessary here in order to ensure that all event handlers run
  // before the next rerender (including event handlers attached to ancestor
  // elements instead of directly on the input). Without this, controlled
  // components don't work properly in conjunction with event bubbling because
  // the component is rerendered and the value reverted before all the event
  // handlers can run. See https://github.com/facebook/react/issues/708.
  batchedUpdates(runEventInBatch, event);
}

function runEventInBatch(event) {
  runEventsInBatch(event, false);
}

function getInstIfValueChanged(targetInst) {
  var targetNode = getNodeFromInstance$1(targetInst);
  if (updateValueIfChanged(targetNode)) {
    return targetInst;
  }
}

function getTargetInstForChangeEvent(topLevelType, targetInst) {
  if (topLevelType === 'topChange') {
    return targetInst;
  }
}

/**
 * SECTION: handle `input` event
 */
var isInputEventSupported = false;
if (ExecutionEnvironment.canUseDOM) {
  // IE9 claims to support the input event but fails to trigger it when
  // deleting text, so we ignore its input events.
  isInputEventSupported = isEventSupported('input') && (!document.documentMode || document.documentMode > 9);
}

/**
 * (For IE <=9) Starts tracking propertychange events on the passed-in element
 * and override the value property so that we can distinguish user events from
 * value changes in JS.
 */
function startWatchingForValueChange(target, targetInst) {
  activeElement = target;
  activeElementInst = targetInst;
  activeElement.attachEvent('onpropertychange', handlePropertyChange);
}

/**
 * (For IE <=9) Removes the event listeners from the currently-tracked element,
 * if any exists.
 */
function stopWatchingForValueChange() {
  if (!activeElement) {
    return;
  }
  activeElement.detachEvent('onpropertychange', handlePropertyChange);
  activeElement = null;
  activeElementInst = null;
}

/**
 * (For IE <=9) Handles a propertychange event, sending a `change` event if
 * the value of the active element has changed.
 */
function handlePropertyChange(nativeEvent) {
  if (nativeEvent.propertyName !== 'value') {
    return;
  }
  if (getInstIfValueChanged(activeElementInst)) {
    manualDispatchChangeEvent(nativeEvent);
  }
}

function handleEventsForInputEventPolyfill(topLevelType, target, targetInst) {
  if (topLevelType === 'topFocus') {
    // In IE9, propertychange fires for most input events but is buggy and
    // doesn't fire when text is deleted, but conveniently, selectionchange
    // appears to fire in all of the remaining cases so we catch those and
    // forward the event if the value has changed
    // In either case, we don't want to call the event handler if the value
    // is changed from JS so we redefine a setter for `.value` that updates
    // our activeElementValue variable, allowing us to ignore those changes
    //
    // stopWatching() should be a noop here but we call it just in case we
    // missed a blur event somehow.
    stopWatchingForValueChange();
    startWatchingForValueChange(target, targetInst);
  } else if (topLevelType === 'topBlur') {
    stopWatchingForValueChange();
  }
}

// For IE8 and IE9.
function getTargetInstForInputEventPolyfill(topLevelType, targetInst) {
  if (topLevelType === 'topSelectionChange' || topLevelType === 'topKeyUp' || topLevelType === 'topKeyDown') {
    // On the selectionchange event, the target is just document which isn't
    // helpful for us so just check activeElement instead.
    //
    // 99% of the time, keydown and keyup aren't necessary. IE8 fails to fire
    // propertychange on the first input event after setting `value` from a
    // script and fires only keydown, keypress, keyup. Catching keyup usually
    // gets it and catching keydown lets us fire an event for the first
    // keystroke if user does a key repeat (it'll be a little delayed: right
    // before the second keystroke). Other input methods (e.g., paste) seem to
    // fire selectionchange normally.
    return getInstIfValueChanged(activeElementInst);
  }
}

/**
 * SECTION: handle `click` event
 */
function shouldUseClickEvent(elem) {
  // Use the `click` event to detect changes to checkbox and radio inputs.
  // This approach works across all browsers, whereas `change` does not fire
  // until `blur` in IE8.
  var nodeName = elem.nodeName;
  return nodeName && nodeName.toLowerCase() === 'input' && (elem.type === 'checkbox' || elem.type === 'radio');
}

function getTargetInstForClickEvent(topLevelType, targetInst) {
  if (topLevelType === 'topClick') {
    return getInstIfValueChanged(targetInst);
  }
}

function getTargetInstForInputOrChangeEvent(topLevelType, targetInst) {
  if (topLevelType === 'topInput' || topLevelType === 'topChange') {
    return getInstIfValueChanged(targetInst);
  }
}

function handleControlledInputBlur(inst, node) {
  // TODO: In IE, inst is occasionally null. Why?
  if (inst == null) {
    return;
  }

  // Fiber and ReactDOM keep wrapper state in separate places
  var state = inst._wrapperState || node._wrapperState;

  if (!state || !state.controlled || node.type !== 'number') {
    return;
  }

  // If controlled, assign the value attribute to the current value on blur
  setDefaultValue(node, 'number', node.value);
}

/**
 * This plugin creates an `onChange` event that normalizes change events
 * across form elements. This event fires at a time when it's possible to
 * change the element's value without seeing a flicker.
 *
 * Supported elements are:
 * - input (see `isTextInputElement`)
 * - textarea
 * - select
 */
var ChangeEventPlugin = {
  eventTypes: eventTypes$1,

  _isInputEventSupported: isInputEventSupported,

  extractEvents: function (topLevelType, targetInst, nativeEvent, nativeEventTarget) {
    var targetNode = targetInst ? getNodeFromInstance$1(targetInst) : window;

    var getTargetInstFunc = void 0,
        handleEventFunc = void 0;
    if (shouldUseChangeEvent(targetNode)) {
      getTargetInstFunc = getTargetInstForChangeEvent;
    } else if (isTextInputElement(targetNode)) {
      if (isInputEventSupported) {
        getTargetInstFunc = getTargetInstForInputOrChangeEvent;
      } else {
        getTargetInstFunc = getTargetInstForInputEventPolyfill;
        handleEventFunc = handleEventsForInputEventPolyfill;
      }
    } else if (shouldUseClickEvent(targetNode)) {
      getTargetInstFunc = getTargetInstForClickEvent;
    }

    if (getTargetInstFunc) {
      var inst = getTargetInstFunc(topLevelType, targetInst);
      if (inst) {
        var event = createAndAccumulateChangeEvent(inst, nativeEvent, nativeEventTarget);
        return event;
      }
    }

    if (handleEventFunc) {
      handleEventFunc(topLevelType, targetNode, targetInst);
    }

    // When blurring, set the value attribute for number inputs
    if (topLevelType === 'topBlur') {
      handleControlledInputBlur(targetInst, targetNode);
    }
  }
};

/**
 * Module that is injectable into `EventPluginHub`, that specifies a
 * deterministic ordering of `EventPlugin`s. A convenient way to reason about
 * plugins, without having to package every one of them. This is better than
 * having plugins be ordered in the same order that they are injected because
 * that ordering would be influenced by the packaging order.
 * `ResponderEventPlugin` must occur before `SimpleEventPlugin` so that
 * preventing default on events is convenient in `SimpleEventPlugin` handlers.
 */
var DOMEventPluginOrder = ['ResponderEventPlugin', 'SimpleEventPlugin', 'TapEventPlugin', 'EnterLeaveEventPlugin', 'ChangeEventPlugin', 'SelectEventPlugin', 'BeforeInputEventPlugin'];

var SyntheticUIEvent = SyntheticEvent$1.extend({
  view: null,
  detail: null
});

/**
 * Translation from modifier key to the associated property in the event.
 * @see http://www.w3.org/TR/DOM-Level-3-Events/#keys-Modifiers
 */

var modifierKeyToProp = {
  Alt: 'altKey',
  Control: 'ctrlKey',
  Meta: 'metaKey',
  Shift: 'shiftKey'
};

// IE8 does not implement getModifierState so we simply map it to the only
// modifier keys exposed by the event itself, does not support Lock-keys.
// Currently, all major browsers except Chrome seems to support Lock-keys.
function modifierStateGetter(keyArg) {
  var syntheticEvent = this;
  var nativeEvent = syntheticEvent.nativeEvent;
  if (nativeEvent.getModifierState) {
    return nativeEvent.getModifierState(keyArg);
  }
  var keyProp = modifierKeyToProp[keyArg];
  return keyProp ? !!nativeEvent[keyProp] : false;
}

function getEventModifierState(nativeEvent) {
  return modifierStateGetter;
}

/**
 * @interface MouseEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var SyntheticMouseEvent = SyntheticUIEvent.extend({
  screenX: null,
  screenY: null,
  clientX: null,
  clientY: null,
  pageX: null,
  pageY: null,
  ctrlKey: null,
  shiftKey: null,
  altKey: null,
  metaKey: null,
  getModifierState: getEventModifierState,
  button: null,
  buttons: null,
  relatedTarget: function (event) {
    return event.relatedTarget || (event.fromElement === event.srcElement ? event.toElement : event.fromElement);
  }
});

var eventTypes$2 = {
  mouseEnter: {
    registrationName: 'onMouseEnter',
    dependencies: ['topMouseOut', 'topMouseOver']
  },
  mouseLeave: {
    registrationName: 'onMouseLeave',
    dependencies: ['topMouseOut', 'topMouseOver']
  }
};

var EnterLeaveEventPlugin = {
  eventTypes: eventTypes$2,

  /**
   * For almost every interaction we care about, there will be both a top-level
   * `mouseover` and `mouseout` event that occurs. Only use `mouseout` so that
   * we do not extract duplicate events. However, moving the mouse into the
   * browser from outside will not fire a `mouseout` event. In this case, we use
   * the `mouseover` top-level event.
   */
  extractEvents: function (topLevelType, targetInst, nativeEvent, nativeEventTarget) {
    if (topLevelType === 'topMouseOver' && (nativeEvent.relatedTarget || nativeEvent.fromElement)) {
      return null;
    }
    if (topLevelType !== 'topMouseOut' && topLevelType !== 'topMouseOver') {
      // Must not be a mouse in or mouse out - ignoring.
      return null;
    }

    var win = void 0;
    if (nativeEventTarget.window === nativeEventTarget) {
      // `nativeEventTarget` is probably a window object.
      win = nativeEventTarget;
    } else {
      // TODO: Figure out why `ownerDocument` is sometimes undefined in IE8.
      var doc = nativeEventTarget.ownerDocument;
      if (doc) {
        win = doc.defaultView || doc.parentWindow;
      } else {
        win = window;
      }
    }

    var from = void 0;
    var to = void 0;
    if (topLevelType === 'topMouseOut') {
      from = targetInst;
      var related = nativeEvent.relatedTarget || nativeEvent.toElement;
      to = related ? getClosestInstanceFromNode(related) : null;
    } else {
      // Moving to a node from outside the window.
      from = null;
      to = targetInst;
    }

    if (from === to) {
      // Nothing pertains to our managed components.
      return null;
    }

    var fromNode = from == null ? win : getNodeFromInstance$1(from);
    var toNode = to == null ? win : getNodeFromInstance$1(to);

    var leave = SyntheticMouseEvent.getPooled(eventTypes$2.mouseLeave, from, nativeEvent, nativeEventTarget);
    leave.type = 'mouseleave';
    leave.target = fromNode;
    leave.relatedTarget = toNode;

    var enter = SyntheticMouseEvent.getPooled(eventTypes$2.mouseEnter, to, nativeEvent, nativeEventTarget);
    enter.type = 'mouseenter';
    enter.target = toNode;
    enter.relatedTarget = fromNode;

    accumulateEnterLeaveDispatches(leave, enter, from, to);

    return [leave, enter];
  }
};

/**
 * `ReactInstanceMap` maintains a mapping from a public facing stateful
 * instance (key) and the internal representation (value). This allows public
 * methods to accept the user facing instance as an argument and map them back
 * to internal methods.
 *
 * Note that this module is currently shared and assumed to be stateless.
 * If this becomes an actual Map, that will break.
 */

/**
 * This API should be called `delete` but we'd have to make sure to always
 * transform these to strings for IE support. When this transform is fully
 * supported we can rename it.
 */


function get(key) {
  return key._reactInternalFiber;
}

function has(key) {
  return key._reactInternalFiber !== undefined;
}

function set(key, value) {
  key._reactInternalFiber = value;
}

// Don't change these two values. They're used by React Dev Tools.
var NoEffect = /*              */0;
var PerformedWork = /*         */1;

// You can change the rest (and add more).
var Placement = /*             */2;
var Update = /*                */4;
var PlacementAndUpdate = /*    */6;
var Deletion = /*              */8;
var ContentReset = /*          */16;
var Callback = /*              */32;
var DidCapture = /*            */64;
var Ref = /*                   */128;
var ErrLog = /*                */256;
var Snapshot = /*              */2048;

// Union of all host effects
var HostEffectMask = /*        */2559;

var Incomplete = /*            */512;
var ShouldCapture = /*         */1024;

var MOUNTING = 1;
var MOUNTED = 2;
var UNMOUNTED = 3;

function isFiberMountedImpl(fiber) {
  var node = fiber;
  if (!fiber.alternate) {
    // If there is no alternate, this might be a new tree that isn't inserted
    // yet. If it is, then it will have a pending insertion effect on it.
    if ((node.effectTag & Placement) !== NoEffect) {
      return MOUNTING;
    }
    while (node['return']) {
      node = node['return'];
      if ((node.effectTag & Placement) !== NoEffect) {
        return MOUNTING;
      }
    }
  } else {
    while (node['return']) {
      node = node['return'];
    }
  }
  if (node.tag === HostRoot) {
    // TODO: Check if this was a nested HostRoot when used with
    // renderContainerIntoSubtree.
    return MOUNTED;
  }
  // If we didn't hit the root, that means that we're in an disconnected tree
  // that has been unmounted.
  return UNMOUNTED;
}

function isFiberMounted(fiber) {
  return isFiberMountedImpl(fiber) === MOUNTED;
}

function isMounted(component) {
  {
    var owner = ReactCurrentOwner.current;
    if (owner !== null && owner.tag === ClassComponent) {
      var ownerFiber = owner;
      var instance = ownerFiber.stateNode;
      !instance._warnedAboutRefsInRender ? warning(false, '%s is accessing isMounted inside its render() function. ' + 'render() should be a pure function of props and state. It should ' + 'never access something that requires stale data from the previous ' + 'render, such as refs. Move this logic to componentDidMount and ' + 'componentDidUpdate instead.', getComponentName(ownerFiber) || 'A component') : void 0;
      instance._warnedAboutRefsInRender = true;
    }
  }

  var fiber = get(component);
  if (!fiber) {
    return false;
  }
  return isFiberMountedImpl(fiber) === MOUNTED;
}

function assertIsMounted(fiber) {
  !(isFiberMountedImpl(fiber) === MOUNTED) ? invariant(false, 'Unable to find node on an unmounted component.') : void 0;
}

function findCurrentFiberUsingSlowPath(fiber) {
  var alternate = fiber.alternate;
  if (!alternate) {
    // If there is no alternate, then we only need to check if it is mounted.
    var state = isFiberMountedImpl(fiber);
    !(state !== UNMOUNTED) ? invariant(false, 'Unable to find node on an unmounted component.') : void 0;
    if (state === MOUNTING) {
      return null;
    }
    return fiber;
  }
  // If we have two possible branches, we'll walk backwards up to the root
  // to see what path the root points to. On the way we may hit one of the
  // special cases and we'll deal with them.
  var a = fiber;
  var b = alternate;
  while (true) {
    var parentA = a['return'];
    var parentB = parentA ? parentA.alternate : null;
    if (!parentA || !parentB) {
      // We're at the root.
      break;
    }

    // If both copies of the parent fiber point to the same child, we can
    // assume that the child is current. This happens when we bailout on low
    // priority: the bailed out fiber's child reuses the current child.
    if (parentA.child === parentB.child) {
      var child = parentA.child;
      while (child) {
        if (child === a) {
          // We've determined that A is the current branch.
          assertIsMounted(parentA);
          return fiber;
        }
        if (child === b) {
          // We've determined that B is the current branch.
          assertIsMounted(parentA);
          return alternate;
        }
        child = child.sibling;
      }
      // We should never have an alternate for any mounting node. So the only
      // way this could possibly happen is if this was unmounted, if at all.
      invariant(false, 'Unable to find node on an unmounted component.');
    }

    if (a['return'] !== b['return']) {
      // The return pointer of A and the return pointer of B point to different
      // fibers. We assume that return pointers never criss-cross, so A must
      // belong to the child set of A.return, and B must belong to the child
      // set of B.return.
      a = parentA;
      b = parentB;
    } else {
      // The return pointers point to the same fiber. We'll have to use the
      // default, slow path: scan the child sets of each parent alternate to see
      // which child belongs to which set.
      //
      // Search parent A's child set
      var didFindChild = false;
      var _child = parentA.child;
      while (_child) {
        if (_child === a) {
          didFindChild = true;
          a = parentA;
          b = parentB;
          break;
        }
        if (_child === b) {
          didFindChild = true;
          b = parentA;
          a = parentB;
          break;
        }
        _child = _child.sibling;
      }
      if (!didFindChild) {
        // Search parent B's child set
        _child = parentB.child;
        while (_child) {
          if (_child === a) {
            didFindChild = true;
            a = parentB;
            b = parentA;
            break;
          }
          if (_child === b) {
            didFindChild = true;
            b = parentB;
            a = parentA;
            break;
          }
          _child = _child.sibling;
        }
        !didFindChild ? invariant(false, 'Child was not found in either parent set. This indicates a bug in React related to the return pointer. Please file an issue.') : void 0;
      }
    }

    !(a.alternate === b) ? invariant(false, 'Return fibers should always be each others\' alternates. This error is likely caused by a bug in React. Please file an issue.') : void 0;
  }
  // If the root is not a host container, we're in a disconnected tree. I.e.
  // unmounted.
  !(a.tag === HostRoot) ? invariant(false, 'Unable to find node on an unmounted component.') : void 0;
  if (a.stateNode.current === a) {
    // We've determined that A is the current branch.
    return fiber;
  }
  // Otherwise B has to be current branch.
  return alternate;
}

function findCurrentHostFiber(parent) {
  var currentParent = findCurrentFiberUsingSlowPath(parent);
  if (!currentParent) {
    return null;
  }

  // Next we'll drill down this component to find the first HostComponent/Text.
  var node = currentParent;
  while (true) {
    if (node.tag === HostComponent || node.tag === HostText) {
      return node;
    } else if (node.child) {
      node.child['return'] = node;
      node = node.child;
      continue;
    }
    if (node === currentParent) {
      return null;
    }
    while (!node.sibling) {
      if (!node['return'] || node['return'] === currentParent) {
        return null;
      }
      node = node['return'];
    }
    node.sibling['return'] = node['return'];
    node = node.sibling;
  }
  // Flow needs the return null here, but ESLint complains about it.
  // eslint-disable-next-line no-unreachable
  return null;
}

function findCurrentHostFiberWithNoPortals(parent) {
  var currentParent = findCurrentFiberUsingSlowPath(parent);
  if (!currentParent) {
    return null;
  }

  // Next we'll drill down this component to find the first HostComponent/Text.
  var node = currentParent;
  while (true) {
    if (node.tag === HostComponent || node.tag === HostText) {
      return node;
    } else if (node.child && node.tag !== HostPortal) {
      node.child['return'] = node;
      node = node.child;
      continue;
    }
    if (node === currentParent) {
      return null;
    }
    while (!node.sibling) {
      if (!node['return'] || node['return'] === currentParent) {
        return null;
      }
      node = node['return'];
    }
    node.sibling['return'] = node['return'];
    node = node.sibling;
  }
  // Flow needs the return null here, but ESLint complains about it.
  // eslint-disable-next-line no-unreachable
  return null;
}

function addEventBubbleListener(element, eventType, listener) {
  element.addEventListener(eventType, listener, false);
}

function addEventCaptureListener(element, eventType, listener) {
  element.addEventListener(eventType, listener, true);
}

/**
 * @interface Event
 * @see http://www.w3.org/TR/css3-animations/#AnimationEvent-interface
 * @see https://developer.mozilla.org/en-US/docs/Web/API/AnimationEvent
 */
var SyntheticAnimationEvent = SyntheticEvent$1.extend({
  animationName: null,
  elapsedTime: null,
  pseudoElement: null
});

/**
 * @interface Event
 * @see http://www.w3.org/TR/clipboard-apis/
 */
var SyntheticClipboardEvent = SyntheticEvent$1.extend({
  clipboardData: function (event) {
    return 'clipboardData' in event ? event.clipboardData : window.clipboardData;
  }
});

/**
 * @interface FocusEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var SyntheticFocusEvent = SyntheticUIEvent.extend({
  relatedTarget: null
});

/**
 * `charCode` represents the actual "character code" and is safe to use with
 * `String.fromCharCode`. As such, only keys that correspond to printable
 * characters produce a valid `charCode`, the only exception to this is Enter.
 * The Tab-key is considered non-printable and does not have a `charCode`,
 * presumably because it does not produce a tab-character in browsers.
 *
 * @param {object} nativeEvent Native browser event.
 * @return {number} Normalized `charCode` property.
 */
function getEventCharCode(nativeEvent) {
  var charCode = void 0;
  var keyCode = nativeEvent.keyCode;

  if ('charCode' in nativeEvent) {
    charCode = nativeEvent.charCode;

    // FF does not set `charCode` for the Enter-key, check against `keyCode`.
    if (charCode === 0 && keyCode === 13) {
      charCode = 13;
    }
  } else {
    // IE8 does not implement `charCode`, but `keyCode` has the correct value.
    charCode = keyCode;
  }

  // IE and Edge (on Windows) and Chrome / Safari (on Windows and Linux)
  // report Enter as charCode 10 when ctrl is pressed.
  if (charCode === 10) {
    charCode = 13;
  }

  // Some non-printable keys are reported in `charCode`/`keyCode`, discard them.
  // Must not discard the (non-)printable Enter-key.
  if (charCode >= 32 || charCode === 13) {
    return charCode;
  }

  return 0;
}

/**
 * Normalization of deprecated HTML5 `key` values
 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent#Key_names
 */
var normalizeKey = {
  Esc: 'Escape',
  Spacebar: ' ',
  Left: 'ArrowLeft',
  Up: 'ArrowUp',
  Right: 'ArrowRight',
  Down: 'ArrowDown',
  Del: 'Delete',
  Win: 'OS',
  Menu: 'ContextMenu',
  Apps: 'ContextMenu',
  Scroll: 'ScrollLock',
  MozPrintableKey: 'Unidentified'
};

/**
 * Translation from legacy `keyCode` to HTML5 `key`
 * Only special keys supported, all others depend on keyboard layout or browser
 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent#Key_names
 */
var translateToKey = {
  '8': 'Backspace',
  '9': 'Tab',
  '12': 'Clear',
  '13': 'Enter',
  '16': 'Shift',
  '17': 'Control',
  '18': 'Alt',
  '19': 'Pause',
  '20': 'CapsLock',
  '27': 'Escape',
  '32': ' ',
  '33': 'PageUp',
  '34': 'PageDown',
  '35': 'End',
  '36': 'Home',
  '37': 'ArrowLeft',
  '38': 'ArrowUp',
  '39': 'ArrowRight',
  '40': 'ArrowDown',
  '45': 'Insert',
  '46': 'Delete',
  '112': 'F1',
  '113': 'F2',
  '114': 'F3',
  '115': 'F4',
  '116': 'F5',
  '117': 'F6',
  '118': 'F7',
  '119': 'F8',
  '120': 'F9',
  '121': 'F10',
  '122': 'F11',
  '123': 'F12',
  '144': 'NumLock',
  '145': 'ScrollLock',
  '224': 'Meta'
};

/**
 * @param {object} nativeEvent Native browser event.
 * @return {string} Normalized `key` property.
 */
function getEventKey(nativeEvent) {
  if (nativeEvent.key) {
    // Normalize inconsistent values reported by browsers due to
    // implementations of a working draft specification.

    // FireFox implements `key` but returns `MozPrintableKey` for all
    // printable characters (normalized to `Unidentified`), ignore it.
    var key = normalizeKey[nativeEvent.key] || nativeEvent.key;
    if (key !== 'Unidentified') {
      return key;
    }
  }

  // Browser does not implement `key`, polyfill as much of it as we can.
  if (nativeEvent.type === 'keypress') {
    var charCode = getEventCharCode(nativeEvent);

    // The enter-key is technically both printable and non-printable and can
    // thus be captured by `keypress`, no other non-printable key should.
    return charCode === 13 ? 'Enter' : String.fromCharCode(charCode);
  }
  if (nativeEvent.type === 'keydown' || nativeEvent.type === 'keyup') {
    // While user keyboard layout determines the actual meaning of each
    // `keyCode` value, almost all function keys have a universal value.
    return translateToKey[nativeEvent.keyCode] || 'Unidentified';
  }
  return '';
}

/**
 * @interface KeyboardEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var SyntheticKeyboardEvent = SyntheticUIEvent.extend({
  key: getEventKey,
  location: null,
  ctrlKey: null,
  shiftKey: null,
  altKey: null,
  metaKey: null,
  repeat: null,
  locale: null,
  getModifierState: getEventModifierState,
  // Legacy Interface
  charCode: function (event) {
    // `charCode` is the result of a KeyPress event and represents the value of
    // the actual printable character.

    // KeyPress is deprecated, but its replacement is not yet final and not
    // implemented in any major browser. Only KeyPress has charCode.
    if (event.type === 'keypress') {
      return getEventCharCode(event);
    }
    return 0;
  },
  keyCode: function (event) {
    // `keyCode` is the result of a KeyDown/Up event and represents the value of
    // physical keyboard key.

    // The actual meaning of the value depends on the users' keyboard layout
    // which cannot be detected. Assuming that it is a US keyboard layout
    // provides a surprisingly accurate mapping for US and European users.
    // Due to this, it is left to the user to implement at this time.
    if (event.type === 'keydown' || event.type === 'keyup') {
      return event.keyCode;
    }
    return 0;
  },
  which: function (event) {
    // `which` is an alias for either `keyCode` or `charCode` depending on the
    // type of the event.
    if (event.type === 'keypress') {
      return getEventCharCode(event);
    }
    if (event.type === 'keydown' || event.type === 'keyup') {
      return event.keyCode;
    }
    return 0;
  }
});

/**
 * @interface DragEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var SyntheticDragEvent = SyntheticMouseEvent.extend({
  dataTransfer: null
});

/**
 * @interface TouchEvent
 * @see http://www.w3.org/TR/touch-events/
 */
var SyntheticTouchEvent = SyntheticUIEvent.extend({
  touches: null,
  targetTouches: null,
  changedTouches: null,
  altKey: null,
  metaKey: null,
  ctrlKey: null,
  shiftKey: null,
  getModifierState: getEventModifierState
});

/**
 * @interface Event
 * @see http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-events-
 * @see https://developer.mozilla.org/en-US/docs/Web/API/TransitionEvent
 */
var SyntheticTransitionEvent = SyntheticEvent$1.extend({
  propertyName: null,
  elapsedTime: null,
  pseudoElement: null
});

/**
 * @interface WheelEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var SyntheticWheelEvent = SyntheticMouseEvent.extend({
  deltaX: function (event) {
    return 'deltaX' in event ? event.deltaX : // Fallback to `wheelDeltaX` for Webkit and normalize (right is positive).
    'wheelDeltaX' in event ? -event.wheelDeltaX : 0;
  },
  deltaY: function (event) {
    return 'deltaY' in event ? event.deltaY : // Fallback to `wheelDeltaY` for Webkit and normalize (down is positive).
    'wheelDeltaY' in event ? -event.wheelDeltaY : // Fallback to `wheelDelta` for IE<9 and normalize (down is positive).
    'wheelDelta' in event ? -event.wheelDelta : 0;
  },

  deltaZ: null,

  // Browsers without "deltaMode" is reporting in raw wheel delta where one
  // notch on the scroll is always +/- 120, roughly equivalent to pixels.
  // A good approximation of DOM_DELTA_LINE (1) is 5% of viewport size or
  // ~40 pixels, for DOM_DELTA_SCREEN (2) it is 87.5% of viewport size.
  deltaMode: null
});

/**
 * Turns
 * ['abort', ...]
 * into
 * eventTypes = {
 *   'abort': {
 *     phasedRegistrationNames: {
 *       bubbled: 'onAbort',
 *       captured: 'onAbortCapture',
 *     },
 *     dependencies: ['topAbort'],
 *   },
 *   ...
 * };
 * topLevelEventsToDispatchConfig = {
 *   'topAbort': { sameConfig }
 * };
 */
var interactiveEventTypeNames = ['blur', 'cancel', 'click', 'close', 'contextMenu', 'copy', 'cut', 'doubleClick', 'dragEnd', 'dragStart', 'drop', 'focus', 'input', 'invalid', 'keyDown', 'keyPress', 'keyUp', 'mouseDown', 'mouseUp', 'paste', 'pause', 'play', 'rateChange', 'reset', 'seeked', 'submit', 'touchCancel', 'touchEnd', 'touchStart', 'volumeChange'];
var nonInteractiveEventTypeNames = ['abort', 'animationEnd', 'animationIteration', 'animationStart', 'canPlay', 'canPlayThrough', 'drag', 'dragEnter', 'dragExit', 'dragLeave', 'dragOver', 'durationChange', 'emptied', 'encrypted', 'ended', 'error', 'load', 'loadedData', 'loadedMetadata', 'loadStart', 'mouseMove', 'mouseOut', 'mouseOver', 'playing', 'progress', 'scroll', 'seeking', 'stalled', 'suspend', 'timeUpdate', 'toggle', 'touchMove', 'transitionEnd', 'waiting', 'wheel'];

var eventTypes$4 = {};
var topLevelEventsToDispatchConfig = {};

function addEventTypeNameToConfig(event, isInteractive) {
  var capitalizedEvent = event[0].toUpperCase() + event.slice(1);
  var onEvent = 'on' + capitalizedEvent;
  var topEvent = 'top' + capitalizedEvent;

  var type = {
    phasedRegistrationNames: {
      bubbled: onEvent,
      captured: onEvent + 'Capture'
    },
    dependencies: [topEvent],
    isInteractive: isInteractive
  };
  eventTypes$4[event] = type;
  topLevelEventsToDispatchConfig[topEvent] = type;
}

interactiveEventTypeNames.forEach(function (eventTypeName) {
  addEventTypeNameToConfig(eventTypeName, true);
});
nonInteractiveEventTypeNames.forEach(function (eventTypeName) {
  addEventTypeNameToConfig(eventTypeName, false);
});

// Only used in DEV for exhaustiveness validation.
var knownHTMLTopLevelTypes = ['topAbort', 'topCancel', 'topCanPlay', 'topCanPlayThrough', 'topClose', 'topDurationChange', 'topEmptied', 'topEncrypted', 'topEnded', 'topError', 'topInput', 'topInvalid', 'topLoad', 'topLoadedData', 'topLoadedMetadata', 'topLoadStart', 'topPause', 'topPlay', 'topPlaying', 'topProgress', 'topRateChange', 'topReset', 'topSeeked', 'topSeeking', 'topStalled', 'topSubmit', 'topSuspend', 'topTimeUpdate', 'topToggle', 'topVolumeChange', 'topWaiting'];

var SimpleEventPlugin = {
  eventTypes: eventTypes$4,

  isInteractiveTopLevelEventType: function (topLevelType) {
    var config = topLevelEventsToDispatchConfig[topLevelType];
    return config !== undefined && config.isInteractive === true;
  },


  extractEvents: function (topLevelType, targetInst, nativeEvent, nativeEventTarget) {
    var dispatchConfig = topLevelEventsToDispatchConfig[topLevelType];
    if (!dispatchConfig) {
      return null;
    }
    var EventConstructor = void 0;
    switch (topLevelType) {
      case 'topKeyPress':
        // Firefox creates a keypress event for function keys too. This removes
        // the unwanted keypress events. Enter is however both printable and
        // non-printable. One would expect Tab to be as well (but it isn't).
        if (getEventCharCode(nativeEvent) === 0) {
          return null;
        }
      /* falls through */
      case 'topKeyDown':
      case 'topKeyUp':
        EventConstructor = SyntheticKeyboardEvent;
        break;
      case 'topBlur':
      case 'topFocus':
        EventConstructor = SyntheticFocusEvent;
        break;
      case 'topClick':
        // Firefox creates a click event on right mouse clicks. This removes the
        // unwanted click events.
        if (nativeEvent.button === 2) {
          return null;
        }
      /* falls through */
      case 'topDoubleClick':
      case 'topMouseDown':
      case 'topMouseMove':
      case 'topMouseUp':
      // TODO: Disabled elements should not respond to mouse events
      /* falls through */
      case 'topMouseOut':
      case 'topMouseOver':
      case 'topContextMenu':
        EventConstructor = SyntheticMouseEvent;
        break;
      case 'topDrag':
      case 'topDragEnd':
      case 'topDragEnter':
      case 'topDragExit':
      case 'topDragLeave':
      case 'topDragOver':
      case 'topDragStart':
      case 'topDrop':
        EventConstructor = SyntheticDragEvent;
        break;
      case 'topTouchCancel':
      case 'topTouchEnd':
      case 'topTouchMove':
      case 'topTouchStart':
        EventConstructor = SyntheticTouchEvent;
        break;
      case 'topAnimationEnd':
      case 'topAnimationIteration':
      case 'topAnimationStart':
        EventConstructor = SyntheticAnimationEvent;
        break;
      case 'topTransitionEnd':
        EventConstructor = SyntheticTransitionEvent;
        break;
      case 'topScroll':
        EventConstructor = SyntheticUIEvent;
        break;
      case 'topWheel':
        EventConstructor = SyntheticWheelEvent;
        break;
      case 'topCopy':
      case 'topCut':
      case 'topPaste':
        EventConstructor = SyntheticClipboardEvent;
        break;
      default:
        {
          if (knownHTMLTopLevelTypes.indexOf(topLevelType) === -1) {
            warning(false, 'SimpleEventPlugin: Unhandled event type, `%s`. This warning ' + 'is likely caused by a bug in React. Please file an issue.', topLevelType);
          }
        }
        // HTML Events
        // @see http://www.w3.org/TR/html5/index.html#events-0
        EventConstructor = SyntheticEvent$1;
        break;
    }
    var event = EventConstructor.getPooled(dispatchConfig, targetInst, nativeEvent, nativeEventTarget);
    accumulateTwoPhaseDispatches(event);
    return event;
  }
};

var isInteractiveTopLevelEventType = SimpleEventPlugin.isInteractiveTopLevelEventType;


var CALLBACK_BOOKKEEPING_POOL_SIZE = 10;
var callbackBookkeepingPool = [];

/**
 * Find the deepest React component completely containing the root of the
 * passed-in instance (for use when entire React trees are nested within each
 * other). If React trees are not nested, returns null.
 */
function findRootContainerNode(inst) {
  // TODO: It may be a good idea to cache this to prevent unnecessary DOM
  // traversal, but caching is difficult to do correctly without using a
  // mutation observer to listen for all DOM changes.
  while (inst['return']) {
    inst = inst['return'];
  }
  if (inst.tag !== HostRoot) {
    // This can happen if we're in a detached tree.
    return null;
  }
  return inst.stateNode.containerInfo;
}

// Used to store ancestor hierarchy in top level callback
function getTopLevelCallbackBookKeeping(topLevelType, nativeEvent, targetInst) {
  if (callbackBookkeepingPool.length) {
    var instance = callbackBookkeepingPool.pop();
    instance.topLevelType = topLevelType;
    instance.nativeEvent = nativeEvent;
    instance.targetInst = targetInst;
    return instance;
  }
  return {
    topLevelType: topLevelType,
    nativeEvent: nativeEvent,
    targetInst: targetInst,
    ancestors: []
  };
}

function releaseTopLevelCallbackBookKeeping(instance) {
  instance.topLevelType = null;
  instance.nativeEvent = null;
  instance.targetInst = null;
  instance.ancestors.length = 0;
  if (callbackBookkeepingPool.length < CALLBACK_BOOKKEEPING_POOL_SIZE) {
    callbackBookkeepingPool.push(instance);
  }
}

function handleTopLevel(bookKeeping) {
  var targetInst = bookKeeping.targetInst;

  // Loop through the hierarchy, in case there's any nested components.
  // It's important that we build the array of ancestors before calling any
  // event handlers, because event handlers can modify the DOM, leading to
  // inconsistencies with ReactMount's node cache. See #1105.
  var ancestor = targetInst;
  do {
    if (!ancestor) {
      bookKeeping.ancestors.push(ancestor);
      break;
    }
    var root = findRootContainerNode(ancestor);
    if (!root) {
      break;
    }
    bookKeeping.ancestors.push(ancestor);
    ancestor = getClosestInstanceFromNode(root);
  } while (ancestor);

  for (var i = 0; i < bookKeeping.ancestors.length; i++) {
    targetInst = bookKeeping.ancestors[i];
    runExtractedEventsInBatch(bookKeeping.topLevelType, targetInst, bookKeeping.nativeEvent, getEventTarget(bookKeeping.nativeEvent));
  }
}

// TODO: can we stop exporting these?
var _enabled = true;

function setEnabled(enabled) {
  _enabled = !!enabled;
}

function isEnabled() {
  return _enabled;
}

/**
 * Traps top-level events by using event bubbling.
 *
 * @param {string} topLevelType Record from `BrowserEventConstants`.
 * @param {string} handlerBaseName Event name (e.g. "click").
 * @param {object} element Element on which to attach listener.
 * @return {?object} An object with a remove function which will forcefully
 *                  remove the listener.
 * @internal
 */
function trapBubbledEvent(topLevelType, handlerBaseName, element) {
  if (!element) {
    return null;
  }
  var dispatch = isInteractiveTopLevelEventType(topLevelType) ? dispatchInteractiveEvent : dispatchEvent;

  addEventBubbleListener(element, handlerBaseName,
  // Check if interactive and wrap in interactiveUpdates
  dispatch.bind(null, topLevelType));
}

/**
 * Traps a top-level event by using event capturing.
 *
 * @param {string} topLevelType Record from `BrowserEventConstants`.
 * @param {string} handlerBaseName Event name (e.g. "click").
 * @param {object} element Element on which to attach listener.
 * @return {?object} An object with a remove function which will forcefully
 *                  remove the listener.
 * @internal
 */
function trapCapturedEvent(topLevelType, handlerBaseName, element) {
  if (!element) {
    return null;
  }
  var dispatch = isInteractiveTopLevelEventType(topLevelType) ? dispatchInteractiveEvent : dispatchEvent;

  addEventCaptureListener(element, handlerBaseName,
  // Check if interactive and wrap in interactiveUpdates
  dispatch.bind(null, topLevelType));
}

function dispatchInteractiveEvent(topLevelType, nativeEvent) {
  interactiveUpdates(dispatchEvent, topLevelType, nativeEvent);
}

function dispatchEvent(topLevelType, nativeEvent) {
  if (!_enabled) {
    return;
  }

  var nativeEventTarget = getEventTarget(nativeEvent);
  var targetInst = getClosestInstanceFromNode(nativeEventTarget);
  if (targetInst !== null && typeof targetInst.tag === 'number' && !isFiberMounted(targetInst)) {
    // If we get an event (ex: img onload) before committing that
    // component's mount, ignore it for now (that is, treat it as if it was an
    // event on a non-React tree). We might also consider queueing events and
    // dispatching them after the mount.
    targetInst = null;
  }

  var bookKeeping = getTopLevelCallbackBookKeeping(topLevelType, nativeEvent, targetInst);

  try {
    // Event queue being processed in the same cycle allows
    // `preventDefault`.
    batchedUpdates(handleTopLevel, bookKeeping);
  } finally {
    releaseTopLevelCallbackBookKeeping(bookKeeping);
  }
}

var ReactDOMEventListener = Object.freeze({
	get _enabled () { return _enabled; },
	setEnabled: setEnabled,
	isEnabled: isEnabled,
	trapBubbledEvent: trapBubbledEvent,
	trapCapturedEvent: trapCapturedEvent,
	dispatchEvent: dispatchEvent
});

/**
 * Generate a mapping of standard vendor prefixes using the defined style property and event name.
 *
 * @param {string} styleProp
 * @param {string} eventName
 * @returns {object}
 */
function makePrefixMap(styleProp, eventName) {
  var prefixes = {};

  prefixes[styleProp.toLowerCase()] = eventName.toLowerCase();
  prefixes['Webkit' + styleProp] = 'webkit' + eventName;
  prefixes['Moz' + styleProp] = 'moz' + eventName;
  prefixes['ms' + styleProp] = 'MS' + eventName;
  prefixes['O' + styleProp] = 'o' + eventName.toLowerCase();

  return prefixes;
}

/**
 * A list of event names to a configurable list of vendor prefixes.
 */
var vendorPrefixes = {
  animationend: makePrefixMap('Animation', 'AnimationEnd'),
  animationiteration: makePrefixMap('Animation', 'AnimationIteration'),
  animationstart: makePrefixMap('Animation', 'AnimationStart'),
  transitionend: makePrefixMap('Transition', 'TransitionEnd')
};

/**
 * Event names that have already been detected and prefixed (if applicable).
 */
var prefixedEventNames = {};

/**
 * Element to check for prefixes on.
 */
var style = {};

/**
 * Bootstrap if a DOM exists.
 */
if (ExecutionEnvironment.canUseDOM) {
  style = document.createElement('div').style;

  // On some platforms, in particular some releases of Android 4.x,
  // the un-prefixed "animation" and "transition" properties are defined on the
  // style object but the events that fire will still be prefixed, so we need
  // to check if the un-prefixed events are usable, and if not remove them from the map.
  if (!('AnimationEvent' in window)) {
    delete vendorPrefixes.animationend.animation;
    delete vendorPrefixes.animationiteration.animation;
    delete vendorPrefixes.animationstart.animation;
  }

  // Same as above
  if (!('TransitionEvent' in window)) {
    delete vendorPrefixes.transitionend.transition;
  }
}

/**
 * Attempts to determine the correct vendor prefixed event name.
 *
 * @param {string} eventName
 * @returns {string}
 */
function getVendorPrefixedEventName(eventName) {
  if (prefixedEventNames[eventName]) {
    return prefixedEventNames[eventName];
  } else if (!vendorPrefixes[eventName]) {
    return eventName;
  }

  var prefixMap = vendorPrefixes[eventName];

  for (var styleProp in prefixMap) {
    if (prefixMap.hasOwnProperty(styleProp) && styleProp in style) {
      return prefixedEventNames[eventName] = prefixMap[styleProp];
    }
  }

  return eventName;
}

/**
 * Types of raw signals from the browser caught at the top level.
 *
 * For events like 'submit' or audio/video events which don't consistently
 * bubble (which we trap at a lower node than `document`), binding
 * at `document` would cause duplicate events so we don't include them here.
 */
var topLevelTypes = {
  topAnimationEnd: getVendorPrefixedEventName('animationend'),
  topAnimationIteration: getVendorPrefixedEventName('animationiteration'),
  topAnimationStart: getVendorPrefixedEventName('animationstart'),
  topBlur: 'blur',
  topCancel: 'cancel',
  topChange: 'change',
  topClick: 'click',
  topClose: 'close',
  topCompositionEnd: 'compositionend',
  topCompositionStart: 'compositionstart',
  topCompositionUpdate: 'compositionupdate',
  topContextMenu: 'contextmenu',
  topCopy: 'copy',
  topCut: 'cut',
  topDoubleClick: 'dblclick',
  topDrag: 'drag',
  topDragEnd: 'dragend',
  topDragEnter: 'dragenter',
  topDragExit: 'dragexit',
  topDragLeave: 'dragleave',
  topDragOver: 'dragover',
  topDragStart: 'dragstart',
  topDrop: 'drop',
  topFocus: 'focus',
  topInput: 'input',
  topKeyDown: 'keydown',
  topKeyPress: 'keypress',
  topKeyUp: 'keyup',
  topLoad: 'load',
  topLoadStart: 'loadstart',
  topMouseDown: 'mousedown',
  topMouseMove: 'mousemove',
  topMouseOut: 'mouseout',
  topMouseOver: 'mouseover',
  topMouseUp: 'mouseup',
  topPaste: 'paste',
  topScroll: 'scroll',
  topSelectionChange: 'selectionchange',
  topTextInput: 'textInput',
  topToggle: 'toggle',
  topTouchCancel: 'touchcancel',
  topTouchEnd: 'touchend',
  topTouchMove: 'touchmove',
  topTouchStart: 'touchstart',
  topTransitionEnd: getVendorPrefixedEventName('transitionend'),
  topWheel: 'wheel'
};

// There are so many media events, it makes sense to just
// maintain a list of them. Note these aren't technically
// "top-level" since they don't bubble. We should come up
// with a better naming convention if we come to refactoring
// the event system.
var mediaEventTypes = {
  topAbort: 'abort',
  topCanPlay: 'canplay',
  topCanPlayThrough: 'canplaythrough',
  topDurationChange: 'durationchange',
  topEmptied: 'emptied',
  topEncrypted: 'encrypted',
  topEnded: 'ended',
  topError: 'error',
  topLoadedData: 'loadeddata',
  topLoadedMetadata: 'loadedmetadata',
  topLoadStart: 'loadstart',
  topPause: 'pause',
  topPlay: 'play',
  topPlaying: 'playing',
  topProgress: 'progress',
  topRateChange: 'ratechange',
  topSeeked: 'seeked',
  topSeeking: 'seeking',
  topStalled: 'stalled',
  topSuspend: 'suspend',
  topTimeUpdate: 'timeupdate',
  topVolumeChange: 'volumechange',
  topWaiting: 'waiting'
};

/**
 * Summary of `ReactBrowserEventEmitter` event handling:
 *
 *  - Top-level delegation is used to trap most native browser events. This
 *    may only occur in the main thread and is the responsibility of
 *    ReactDOMEventListener, which is injected and can therefore support
 *    pluggable event sources. This is the only work that occurs in the main
 *    thread.
 *
 *  - We normalize and de-duplicate events to account for browser quirks. This
 *    may be done in the worker thread.
 *
 *  - Forward these native events (with the associated top-level type used to
 *    trap it) to `EventPluginHub`, which in turn will ask plugins if they want
 *    to extract any synthetic events.
 *
 *  - The `EventPluginHub` will then process each event by annotating them with
 *    "dispatches", a sequence of listeners and IDs that care about that event.
 *
 *  - The `EventPluginHub` then dispatches the events.
 *
 * Overview of React and the event system:
 *
 * +------------+    .
 * |    DOM     |    .
 * +------------+    .
 *       |           .
 *       v           .
 * +------------+    .
 * | ReactEvent |    .
 * |  Listener  |    .
 * +------------+    .                         +-----------+
 *       |           .               +--------+|SimpleEvent|
 *       |           .               |         |Plugin     |
 * +-----|------+    .               v         +-----------+
 * |     |      |    .    +--------------+                    +------------+
 * |     +-----------.--->|EventPluginHub|                    |    Event   |
 * |            |    .    |              |     +-----------+  | Propagators|
 * | ReactEvent |    .    |              |     |TapEvent   |  |------------|
 * |  Emitter   |    .    |              |<---+|Plugin     |  |other plugin|
 * |            |    .    |              |     +-----------+  |  utilities |
 * |     +-----------.--->|              |                    +------------+
 * |     |      |    .    +--------------+
 * +-----|------+    .                ^        +-----------+
 *       |           .                |        |Enter/Leave|
 *       +           .                +-------+|Plugin     |
 * +-------------+   .                         +-----------+
 * | application |   .
 * |-------------|   .
 * |             |   .
 * |             |   .
 * +-------------+   .
 *                   .
 *    React Core     .  General Purpose Event Plugin System
 */

var alreadyListeningTo = {};
var reactTopListenersCounter = 0;

/**
 * To ensure no conflicts with other potential React instances on the page
 */
var topListenersIDKey = '_reactListenersID' + ('' + Math.random()).slice(2);

function getListeningForDocument(mountAt) {
  // In IE8, `mountAt` is a host object and doesn't have `hasOwnProperty`
  // directly.
  if (!Object.prototype.hasOwnProperty.call(mountAt, topListenersIDKey)) {
    mountAt[topListenersIDKey] = reactTopListenersCounter++;
    alreadyListeningTo[mountAt[topListenersIDKey]] = {};
  }
  return alreadyListeningTo[mountAt[topListenersIDKey]];
}

/**
 * We listen for bubbled touch events on the document object.
 *
 * Firefox v8.01 (and possibly others) exhibited strange behavior when
 * mounting `onmousemove` events at some node that was not the document
 * element. The symptoms were that if your mouse is not moving over something
 * contained within that mount point (for example on the background) the
 * top-level listeners for `onmousemove` won't be called. However, if you
 * register the `mousemove` on the document object, then it will of course
 * catch all `mousemove`s. This along with iOS quirks, justifies restricting
 * top-level listeners to the document object only, at least for these
 * movement types of events and possibly all events.
 *
 * @see http://www.quirksmode.org/blog/archives/2010/09/click_event_del.html
 *
 * Also, `keyup`/`keypress`/`keydown` do not bubble to the window on IE, but
 * they bubble to document.
 *
 * @param {string} registrationName Name of listener (e.g. `onClick`).
 * @param {object} contentDocumentHandle Document which owns the container
 */
function listenTo(registrationName, contentDocumentHandle) {
  var mountAt = contentDocumentHandle;
  var isListening = getListeningForDocument(mountAt);
  var dependencies = registrationNameDependencies[registrationName];

  for (var i = 0; i < dependencies.length; i++) {
    var dependency = dependencies[i];
    if (!(isListening.hasOwnProperty(dependency) && isListening[dependency])) {
      if (dependency === 'topScroll') {
        trapCapturedEvent('topScroll', 'scroll', mountAt);
      } else if (dependency === 'topFocus' || dependency === 'topBlur') {
        trapCapturedEvent('topFocus', 'focus', mountAt);
        trapCapturedEvent('topBlur', 'blur', mountAt);

        // to make sure blur and focus event listeners are only attached once
        isListening.topBlur = true;
        isListening.topFocus = true;
      } else if (dependency === 'topCancel') {
        if (isEventSupported('cancel', true)) {
          trapCapturedEvent('topCancel', 'cancel', mountAt);
        }
        isListening.topCancel = true;
      } else if (dependency === 'topClose') {
        if (isEventSupported('close', true)) {
          trapCapturedEvent('topClose', 'close', mountAt);
        }
        isListening.topClose = true;
      } else if (topLevelTypes.hasOwnProperty(dependency)) {
        trapBubbledEvent(dependency, topLevelTypes[dependency], mountAt);
      }

      isListening[dependency] = true;
    }
  }
}

function isListeningToAllDependencies(registrationName, mountAt) {
  var isListening = getListeningForDocument(mountAt);
  var dependencies = registrationNameDependencies[registrationName];
  for (var i = 0; i < dependencies.length; i++) {
    var dependency = dependencies[i];
    if (!(isListening.hasOwnProperty(dependency) && isListening[dependency])) {
      return false;
    }
  }
  return true;
}

/**
 * Given any node return the first leaf node without children.
 *
 * @param {DOMElement|DOMTextNode} node
 * @return {DOMElement|DOMTextNode}
 */
function getLeafNode(node) {
  while (node && node.firstChild) {
    node = node.firstChild;
  }
  return node;
}

/**
 * Get the next sibling within a container. This will walk up the
 * DOM if a node's siblings have been exhausted.
 *
 * @param {DOMElement|DOMTextNode} node
 * @return {?DOMElement|DOMTextNode}
 */
function getSiblingNode(node) {
  while (node) {
    if (node.nextSibling) {
      return node.nextSibling;
    }
    node = node.parentNode;
  }
}

/**
 * Get object describing the nodes which contain characters at offset.
 *
 * @param {DOMElement|DOMTextNode} root
 * @param {number} offset
 * @return {?object}
 */
function getNodeForCharacterOffset(root, offset) {
  var node = getLeafNode(root);
  var nodeStart = 0;
  var nodeEnd = 0;

  while (node) {
    if (node.nodeType === TEXT_NODE) {
      nodeEnd = nodeStart + node.textContent.length;

      if (nodeStart <= offset && nodeEnd >= offset) {
        return {
          node: node,
          offset: offset - nodeStart
        };
      }

      nodeStart = nodeEnd;
    }

    node = getLeafNode(getSiblingNode(node));
  }
}

/**
 * @param {DOMElement} outerNode
 * @return {?object}
 */
function getOffsets(outerNode) {
  var selection = window.getSelection && window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  var anchorNode = selection.anchorNode,
      anchorOffset = selection.anchorOffset,
      focusNode = selection.focusNode,
      focusOffset = selection.focusOffset;

  // In Firefox, anchorNode and focusNode can be "anonymous divs", e.g. the
  // up/down buttons on an <input type="number">. Anonymous divs do not seem to
  // expose properties, triggering a "Permission denied error" if any of its
  // properties are accessed. The only seemingly possible way to avoid erroring
  // is to access a property that typically works for non-anonymous divs and
  // catch any error that may otherwise arise. See
  // https://bugzilla.mozilla.org/show_bug.cgi?id=208427

  try {
    /* eslint-disable no-unused-expressions */
    anchorNode.nodeType;
    focusNode.nodeType;
    /* eslint-enable no-unused-expressions */
  } catch (e) {
    return null;
  }

  return getModernOffsetsFromPoints(outerNode, anchorNode, anchorOffset, focusNode, focusOffset);
}

/**
 * Returns {start, end} where `start` is the character/codepoint index of
 * (anchorNode, anchorOffset) within the textContent of `outerNode`, and
 * `end` is the index of (focusNode, focusOffset).
 *
 * Returns null if you pass in garbage input but we should probably just crash.
 *
 * Exported only for testing.
 */
function getModernOffsetsFromPoints(outerNode, anchorNode, anchorOffset, focusNode, focusOffset) {
  var length = 0;
  var start = -1;
  var end = -1;
  var indexWithinAnchor = 0;
  var indexWithinFocus = 0;
  var node = outerNode;
  var parentNode = null;

  outer: while (true) {
    var next = null;

    while (true) {
      if (node === anchorNode && (anchorOffset === 0 || node.nodeType === TEXT_NODE)) {
        start = length + anchorOffset;
      }
      if (node === focusNode && (focusOffset === 0 || node.nodeType === TEXT_NODE)) {
        end = length + focusOffset;
      }

      if (node.nodeType === TEXT_NODE) {
        length += node.nodeValue.length;
      }

      if ((next = node.firstChild) === null) {
        break;
      }
      // Moving from `node` to its first child `next`.
      parentNode = node;
      node = next;
    }

    while (true) {
      if (node === outerNode) {
        // If `outerNode` has children, this is always the second time visiting
        // it. If it has no children, this is still the first loop, and the only
        // valid selection is anchorNode and focusNode both equal to this node
        // and both offsets 0, in which case we will have handled above.
        break outer;
      }
      if (parentNode === anchorNode && ++indexWithinAnchor === anchorOffset) {
        start = length;
      }
      if (parentNode === focusNode && ++indexWithinFocus === focusOffset) {
        end = length;
      }
      if ((next = node.nextSibling) !== null) {
        break;
      }
      node = parentNode;
      parentNode = node.parentNode;
    }

    // Moving from `node` to its next sibling `next`.
    node = next;
  }

  if (start === -1 || end === -1) {
    // This should never happen. (Would happen if the anchor/focus nodes aren't
    // actually inside the passed-in node.)
    return null;
  }

  return {
    start: start,
    end: end
  };
}

/**
 * In modern non-IE browsers, we can support both forward and backward
 * selections.
 *
 * Note: IE10+ supports the Selection object, but it does not support
 * the `extend` method, which means that even in modern IE, it's not possible
 * to programmatically create a backward selection. Thus, for all IE
 * versions, we use the old IE API to create our selections.
 *
 * @param {DOMElement|DOMTextNode} node
 * @param {object} offsets
 */
function setOffsets(node, offsets) {
  if (!window.getSelection) {
    return;
  }

  var selection = window.getSelection();
  var length = node[getTextContentAccessor()].length;
  var start = Math.min(offsets.start, length);
  var end = offsets.end === undefined ? start : Math.min(offsets.end, length);

  // IE 11 uses modern selection, but doesn't support the extend method.
  // Flip backward selections, so we can set with a single range.
  if (!selection.extend && start > end) {
    var temp = end;
    end = start;
    start = temp;
  }

  var startMarker = getNodeForCharacterOffset(node, start);
  var endMarker = getNodeForCharacterOffset(node, end);

  if (startMarker && endMarker) {
    if (selection.rangeCount === 1 && selection.anchorNode === startMarker.node && selection.anchorOffset === startMarker.offset && selection.focusNode === endMarker.node && selection.focusOffset === endMarker.offset) {
      return;
    }
    var range = document.createRange();
    range.setStart(startMarker.node, startMarker.offset);
    selection.removeAllRanges();

    if (start > end) {
      selection.addRange(range);
      selection.extend(endMarker.node, endMarker.offset);
    } else {
      range.setEnd(endMarker.node, endMarker.offset);
      selection.addRange(range);
    }
  }
}

function isInDocument(node) {
  return containsNode(document.documentElement, node);
}

/**
 * @ReactInputSelection: React input selection module. Based on Selection.js,
 * but modified to be suitable for react and has a couple of bug fixes (doesn't
 * assume buttons have range selections allowed).
 * Input selection module for React.
 */

function hasSelectionCapabilities(elem) {
  var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
  return nodeName && (nodeName === 'input' && elem.type === 'text' || nodeName === 'textarea' || elem.contentEditable === 'true');
}

function getSelectionInformation() {
  var focusedElem = getActiveElement();
  return {
    focusedElem: focusedElem,
    selectionRange: hasSelectionCapabilities(focusedElem) ? getSelection$1(focusedElem) : null
  };
}

/**
 * @restoreSelection: If any selection information was potentially lost,
 * restore it. This is useful when performing operations that could remove dom
 * nodes and place them back in, resulting in focus being lost.
 */
function restoreSelection(priorSelectionInformation) {
  var curFocusedElem = getActiveElement();
  var priorFocusedElem = priorSelectionInformation.focusedElem;
  var priorSelectionRange = priorSelectionInformation.selectionRange;
  if (curFocusedElem !== priorFocusedElem && isInDocument(priorFocusedElem)) {
    if (hasSelectionCapabilities(priorFocusedElem)) {
      setSelection(priorFocusedElem, priorSelectionRange);
    }

    // Focusing a node can change the scroll position, which is undesirable
    var ancestors = [];
    var ancestor = priorFocusedElem;
    while (ancestor = ancestor.parentNode) {
      if (ancestor.nodeType === ELEMENT_NODE) {
        ancestors.push({
          element: ancestor,
          left: ancestor.scrollLeft,
          top: ancestor.scrollTop
        });
      }
    }

    priorFocusedElem.focus();

    for (var i = 0; i < ancestors.length; i++) {
      var info = ancestors[i];
      info.element.scrollLeft = info.left;
      info.element.scrollTop = info.top;
    }
  }
}

/**
 * @getSelection: Gets the selection bounds of a focused textarea, input or
 * contentEditable node.
 * -@input: Look up selection bounds of this input
 * -@return {start: selectionStart, end: selectionEnd}
 */
function getSelection$1(input) {
  var selection = void 0;

  if ('selectionStart' in input) {
    // Modern browser with input or textarea.
    selection = {
      start: input.selectionStart,
      end: input.selectionEnd
    };
  } else {
    // Content editable or old IE textarea.
    selection = getOffsets(input);
  }

  return selection || { start: 0, end: 0 };
}

/**
 * @setSelection: Sets the selection bounds of a textarea or input and focuses
 * the input.
 * -@input     Set selection bounds of this input or textarea
 * -@offsets   Object of same form that is returned from get*
 */
function setSelection(input, offsets) {
  var start = offsets.start,
      end = offsets.end;

  if (end === undefined) {
    end = start;
  }

  if ('selectionStart' in input) {
    input.selectionStart = start;
    input.selectionEnd = Math.min(end, input.value.length);
  } else {
    setOffsets(input, offsets);
  }
}

var skipSelectionChangeEvent = ExecutionEnvironment.canUseDOM && 'documentMode' in document && document.documentMode <= 11;

var eventTypes$3 = {
  select: {
    phasedRegistrationNames: {
      bubbled: 'onSelect',
      captured: 'onSelectCapture'
    },
    dependencies: ['topBlur', 'topContextMenu', 'topFocus', 'topKeyDown', 'topKeyUp', 'topMouseDown', 'topMouseUp', 'topSelectionChange']
  }
};

var activeElement$1 = null;
var activeElementInst$1 = null;
var lastSelection = null;
var mouseDown = false;

/**
 * Get an object which is a unique representation of the current selection.
 *
 * The return value will not be consistent across nodes or browsers, but
 * two identical selections on the same node will return identical objects.
 *
 * @param {DOMElement} node
 * @return {object}
 */
function getSelection(node) {
  if ('selectionStart' in node && hasSelectionCapabilities(node)) {
    return {
      start: node.selectionStart,
      end: node.selectionEnd
    };
  } else if (window.getSelection) {
    var selection = window.getSelection();
    return {
      anchorNode: selection.anchorNode,
      anchorOffset: selection.anchorOffset,
      focusNode: selection.focusNode,
      focusOffset: selection.focusOffset
    };
  }
}

/**
 * Poll selection to see whether it's changed.
 *
 * @param {object} nativeEvent
 * @return {?SyntheticEvent}
 */
function constructSelectEvent(nativeEvent, nativeEventTarget) {
  // Ensure we have the right element, and that the user is not dragging a
  // selection (this matches native `select` event behavior). In HTML5, select
  // fires only on input and textarea thus if there's no focused element we
  // won't dispatch.
  if (mouseDown || activeElement$1 == null || activeElement$1 !== getActiveElement()) {
    return null;
  }

  // Only fire when selection has actually changed.
  var currentSelection = getSelection(activeElement$1);
  if (!lastSelection || !shallowEqual(lastSelection, currentSelection)) {
    lastSelection = currentSelection;

    var syntheticEvent = SyntheticEvent$1.getPooled(eventTypes$3.select, activeElementInst$1, nativeEvent, nativeEventTarget);

    syntheticEvent.type = 'select';
    syntheticEvent.target = activeElement$1;

    accumulateTwoPhaseDispatches(syntheticEvent);

    return syntheticEvent;
  }

  return null;
}

/**
 * This plugin creates an `onSelect` event that normalizes select events
 * across form elements.
 *
 * Supported elements are:
 * - input (see `isTextInputElement`)
 * - textarea
 * - contentEditable
 *
 * This differs from native browser implementations in the following ways:
 * - Fires on contentEditable fields as well as inputs.
 * - Fires for collapsed selection.
 * - Fires after user input.
 */
var SelectEventPlugin = {
  eventTypes: eventTypes$3,

  extractEvents: function (topLevelType, targetInst, nativeEvent, nativeEventTarget) {
    var doc = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget.document : nativeEventTarget.nodeType === DOCUMENT_NODE ? nativeEventTarget : nativeEventTarget.ownerDocument;
    // Track whether all listeners exists for this plugin. If none exist, we do
    // not extract events. See #3639.
    if (!doc || !isListeningToAllDependencies('onSelect', doc)) {
      return null;
    }

    var targetNode = targetInst ? getNodeFromInstance$1(targetInst) : window;

    switch (topLevelType) {
      // Track the input node that has focus.
      case 'topFocus':
        if (isTextInputElement(targetNode) || targetNode.contentEditable === 'true') {
          activeElement$1 = targetNode;
          activeElementInst$1 = targetInst;
          lastSelection = null;
        }
        break;
      case 'topBlur':
        activeElement$1 = null;
        activeElementInst$1 = null;
        lastSelection = null;
        break;
      // Don't fire the event while the user is dragging. This matches the
      // semantics of the native select event.
      case 'topMouseDown':
        mouseDown = true;
        break;
      case 'topContextMenu':
      case 'topMouseUp':
        mouseDown = false;
        return constructSelectEvent(nativeEvent, nativeEventTarget);
      // Chrome and IE fire non-standard event when selection is changed (and
      // sometimes when it hasn't). IE's event fires out of order with respect
      // to key and input events on deletion, so we discard it.
      //
      // Firefox doesn't support selectionchange, so check selection status
      // after each key entry. The selection changes after keydown and before
      // keyup, but we check on keydown as well in the case of holding down a
      // key, when multiple keydown events are fired but only one keyup is.
      // This is also our approach for IE handling, for the reason above.
      case 'topSelectionChange':
        if (skipSelectionChangeEvent) {
          break;
        }
      // falls through
      case 'topKeyDown':
      case 'topKeyUp':
        return constructSelectEvent(nativeEvent, nativeEventTarget);
    }

    return null;
  }
};

/**
 * Inject modules for resolving DOM hierarchy and plugin ordering.
 */
injection.injectEventPluginOrder(DOMEventPluginOrder);
injection$1.injectComponentTree(ReactDOMComponentTree);

/**
 * Some important event plugins included by default (without having to require
 * them).
 */
injection.injectEventPluginsByName({
  SimpleEventPlugin: SimpleEventPlugin,
  EnterLeaveEventPlugin: EnterLeaveEventPlugin,
  ChangeEventPlugin: ChangeEventPlugin,
  SelectEventPlugin: SelectEventPlugin,
  BeforeInputEventPlugin: BeforeInputEventPlugin
});

// Max 31 bit integer. The max integer size in V8 for 32-bit systems.
// Math.pow(2, 30) - 1
// 0b111111111111111111111111111111
var MAX_SIGNED_31_BIT_INT = 1073741823;

// TODO: Use an opaque type once ESLint et al support the syntax


var NoWork = 0;
var Sync = 1;
var Never = MAX_SIGNED_31_BIT_INT;

var UNIT_SIZE = 10;
var MAGIC_NUMBER_OFFSET = 2;

// 1 unit of expiration time represents 10ms.
function msToExpirationTime(ms) {
  // Always add an offset so that we don't clash with the magic number for NoWork.
  return (ms / UNIT_SIZE | 0) + MAGIC_NUMBER_OFFSET;
}

function expirationTimeToMs(expirationTime) {
  return (expirationTime - MAGIC_NUMBER_OFFSET) * UNIT_SIZE;
}

function ceiling(num, precision) {
  return ((num / precision | 0) + 1) * precision;
}

function computeExpirationBucket(currentTime, expirationInMs, bucketSizeMs) {
  return ceiling(currentTime + expirationInMs / UNIT_SIZE, bucketSizeMs / UNIT_SIZE);
}

var NoContext = 0;
var AsyncMode = 1;
var StrictMode = 2;

var hasBadMapPolyfill = void 0;

{
  hasBadMapPolyfill = false;
  try {
    var nonExtensibleObject = Object.preventExtensions({});
    var testMap = new Map([[nonExtensibleObject, null]]);
    var testSet = new Set([nonExtensibleObject]);
    // This is necessary for Rollup to not consider these unused.
    // https://github.com/rollup/rollup/issues/1771
    // TODO: we can remove these if Rollup fixes the bug.
    testMap.set(0, 0);
    testSet.add(0);
  } catch (e) {
    // TODO: Consider warning about bad polyfills
    hasBadMapPolyfill = true;
  }
}

// A Fiber is work on a Component that needs to be done or was done. There can
// be more than one per component.


var debugCounter = void 0;

{
  debugCounter = 1;
}

function FiberNode(tag, pendingProps, key, mode) {
  // Instance
  this.tag = tag;
  this.key = key;
  this.type = null;
  this.stateNode = null;

  // Fiber
  this['return'] = null;
  this.child = null;
  this.sibling = null;
  this.index = 0;

  this.ref = null;

  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.updateQueue = null;
  this.memoizedState = null;

  this.mode = mode;

  // Effects
  this.effectTag = NoEffect;
  this.nextEffect = null;

  this.firstEffect = null;
  this.lastEffect = null;

  this.expirationTime = NoWork;

  this.alternate = null;

  {
    this._debugID = debugCounter++;
    this._debugSource = null;
    this._debugOwner = null;
    this._debugIsCurrentlyTiming = false;
    if (!hasBadMapPolyfill && typeof Object.preventExtensions === 'function') {
      Object.preventExtensions(this);
    }
  }
}

// This is a constructor function, rather than a POJO constructor, still
// please ensure we do the following:
// 1) Nobody should add any instance methods on this. Instance methods can be
//    more difficult to predict when they get optimized and they are almost
//    never inlined properly in static compilers.
// 2) Nobody should rely on `instanceof Fiber` for type testing. We should
//    always know when it is a fiber.
// 3) We might want to experiment with using numeric keys since they are easier
//    to optimize in a non-JIT environment.
// 4) We can easily go from a constructor to a createFiber object literal if that
//    is faster.
// 5) It should be easy to port this to a C struct and keep a C implementation
//    compatible.
var createFiber = function (tag, pendingProps, key, mode) {
  // $FlowFixMe: the shapes are exact here but Flow doesn't like constructors
  return new FiberNode(tag, pendingProps, key, mode);
};

function shouldConstruct(Component) {
  return !!(Component.prototype && Component.prototype.isReactComponent);
}

// This is used to create an alternate fiber to do work on.
function createWorkInProgress(current, pendingProps, expirationTime) {
  var workInProgress = current.alternate;
  if (workInProgress === null) {
    // We use a double buffering pooling technique because we know that we'll
    // only ever need at most two versions of a tree. We pool the "other" unused
    // node that we're free to reuse. This is lazily created to avoid allocating
    // extra objects for things that are never updated. It also allow us to
    // reclaim the extra memory if needed.
    workInProgress = createFiber(current.tag, pendingProps, current.key, current.mode);
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;

    {
      // DEV-only fields
      workInProgress._debugID = current._debugID;
      workInProgress._debugSource = current._debugSource;
      workInProgress._debugOwner = current._debugOwner;
    }

    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    workInProgress.pendingProps = pendingProps;

    // We already have an alternate.
    // Reset the effect tag.
    workInProgress.effectTag = NoEffect;

    // The effect list is no longer valid.
    workInProgress.nextEffect = null;
    workInProgress.firstEffect = null;
    workInProgress.lastEffect = null;
  }

  workInProgress.expirationTime = expirationTime;

  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;

  // These will be overridden during the parent's reconciliation
  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;
  workInProgress.ref = current.ref;

  return workInProgress;
}

function createHostRootFiber(isAsync) {
  var mode = isAsync ? AsyncMode | StrictMode : NoContext;
  return createFiber(HostRoot, null, null, mode);
}

function createFiberFromElement(element, mode, expirationTime) {
  var owner = null;
  {
    owner = element._owner;
  }

  var fiber = void 0;
  var type = element.type;
  var key = element.key;
  var pendingProps = element.props;

  var fiberTag = void 0;
  if (typeof type === 'function') {
    fiberTag = shouldConstruct(type) ? ClassComponent : IndeterminateComponent;
  } else if (typeof type === 'string') {
    fiberTag = HostComponent;
  } else {
    switch (type) {
      case REACT_FRAGMENT_TYPE:
        return createFiberFromFragment(pendingProps.children, mode, expirationTime, key);
      case REACT_ASYNC_MODE_TYPE:
        fiberTag = Mode;
        mode |= AsyncMode | StrictMode;
        break;
      case REACT_STRICT_MODE_TYPE:
        fiberTag = Mode;
        mode |= StrictMode;
        break;
      case REACT_CALL_TYPE:
        fiberTag = CallComponent;
        break;
      case REACT_RETURN_TYPE:
        fiberTag = ReturnComponent;
        break;
      default:
        {
          if (typeof type === 'object' && type !== null) {
            switch (type.$$typeof) {
              case REACT_PROVIDER_TYPE:
                fiberTag = ContextProvider;
                break;
              case REACT_CONTEXT_TYPE:
                // This is a consumer
                fiberTag = ContextConsumer;
                break;
              case REACT_FORWARD_REF_TYPE:
                fiberTag = ForwardRef;
                break;
              default:
                if (typeof type.tag === 'number') {
                  // Currently assumed to be a continuation and therefore is a
                  // fiber already.
                  // TODO: The yield system is currently broken for updates in
                  // some cases. The reified yield stores a fiber, but we don't
                  // know which fiber that is; the current or a workInProgress?
                  // When the continuation gets rendered here we don't know if we
                  // can reuse that fiber or if we need to clone it. There is
                  // probably a clever way to restructure this.
                  fiber = type;
                  fiber.pendingProps = pendingProps;
                  fiber.expirationTime = expirationTime;
                  return fiber;
                } else {
                  throwOnInvalidElementType(type, owner);
                }
                break;
            }
          } else {
            throwOnInvalidElementType(type, owner);
          }
        }
    }
  }

  fiber = createFiber(fiberTag, pendingProps, key, mode);
  fiber.type = type;
  fiber.expirationTime = expirationTime;

  {
    fiber._debugSource = element._source;
    fiber._debugOwner = element._owner;
  }

  return fiber;
}

function throwOnInvalidElementType(type, owner) {
  var info = '';
  {
    if (type === undefined || typeof type === 'object' && type !== null && Object.keys(type).length === 0) {
      info += ' You likely forgot to export your component from the file ' + "it's defined in, or you might have mixed up default and " + 'named imports.';
    }
    var ownerName = owner ? getComponentName(owner) : null;
    if (ownerName) {
      info += '\n\nCheck the render method of `' + ownerName + '`.';
    }
  }
  invariant(false, 'Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s', type == null ? type : typeof type, info);
}

function createFiberFromFragment(elements, mode, expirationTime, key) {
  var fiber = createFiber(Fragment, elements, key, mode);
  fiber.expirationTime = expirationTime;
  return fiber;
}

function createFiberFromText(content, mode, expirationTime) {
  var fiber = createFiber(HostText, content, null, mode);
  fiber.expirationTime = expirationTime;
  return fiber;
}

function createFiberFromHostInstanceForDeletion() {
  var fiber = createFiber(HostComponent, null, null, NoContext);
  fiber.type = 'DELETED';
  return fiber;
}

function createFiberFromPortal(portal, mode, expirationTime) {
  var pendingProps = portal.children !== null ? portal.children : [];
  var fiber = createFiber(HostPortal, pendingProps, portal.key, mode);
  fiber.expirationTime = expirationTime;
  fiber.stateNode = {
    containerInfo: portal.containerInfo,
    pendingChildren: null, // Used by persistent updates
    implementation: portal.implementation
  };
  return fiber;
}

// Used for stashing WIP properties to replay failed work in DEV.
function assignFiberPropertiesInDEV(target, source) {
  if (target === null) {
    // This Fiber's initial properties will always be overwritten.
    // We only use a Fiber to ensure the same hidden class so DEV isn't slow.
    target = createFiber(IndeterminateComponent, null, null, NoContext);
  }

  // This is intentionally written as a list of all properties.
  // We tried to use Object.assign() instead but this is called in
  // the hottest path, and Object.assign() was too slow:
  // https://github.com/facebook/react/issues/12502
  // This code is DEV-only so size is not a concern.

  target.tag = source.tag;
  target.key = source.key;
  target.type = source.type;
  target.stateNode = source.stateNode;
  target['return'] = source['return'];
  target.child = source.child;
  target.sibling = source.sibling;
  target.index = source.index;
  target.ref = source.ref;
  target.pendingProps = source.pendingProps;
  target.memoizedProps = source.memoizedProps;
  target.updateQueue = source.updateQueue;
  target.memoizedState = source.memoizedState;
  target.mode = source.mode;
  target.effectTag = source.effectTag;
  target.nextEffect = source.nextEffect;
  target.firstEffect = source.firstEffect;
  target.lastEffect = source.lastEffect;
  target.expirationTime = source.expirationTime;
  target.alternate = source.alternate;
  target._debugID = source._debugID;
  target._debugSource = source._debugSource;
  target._debugOwner = source._debugOwner;
  target._debugIsCurrentlyTiming = source._debugIsCurrentlyTiming;
  return target;
}

// TODO: This should be lifted into the renderer.


function createFiberRoot(containerInfo, isAsync, hydrate) {
  // Cyclic construction. This cheats the type system right now because
  // stateNode is any.
  var uninitializedFiber = createHostRootFiber(isAsync);
  var root = {
    current: uninitializedFiber,
    containerInfo: containerInfo,
    pendingChildren: null,
    pendingCommitExpirationTime: NoWork,
    finishedWork: null,
    context: null,
    pendingContext: null,
    hydrate: hydrate,
    remainingExpirationTime: NoWork,
    firstBatch: null,
    nextScheduledRoot: null
  };
  uninitializedFiber.stateNode = root;
  return root;
}

var onCommitFiberRoot = null;
var onCommitFiberUnmount = null;
var hasLoggedError = false;

function catchErrors(fn) {
  return function (arg) {
    try {
      return fn(arg);
    } catch (err) {
      if (true && !hasLoggedError) {
        hasLoggedError = true;
        warning(false, 'React DevTools encountered an error: %s', err);
      }
    }
  };
}

function injectInternals(internals) {
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined') {
    // No DevTools
    return false;
  }
  var hook = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (hook.isDisabled) {
    // This isn't a real property on the hook, but it can be set to opt out
    // of DevTools integration and associated warnings and logs.
    // https://github.com/facebook/react/issues/3877
    return true;
  }
  if (!hook.supportsFiber) {
    {
      warning(false, 'The installed version of React DevTools is too old and will not work ' + 'with the current version of React. Please update React DevTools. ' + 'https://fb.me/react-devtools');
    }
    // DevTools exists, even though it doesn't support Fiber.
    return true;
  }
  try {
    var rendererID = hook.inject(internals);
    // We have successfully injected, so now it is safe to set up hooks.
    onCommitFiberRoot = catchErrors(function (root) {
      return hook.onCommitFiberRoot(rendererID, root);
    });
    onCommitFiberUnmount = catchErrors(function (fiber) {
      return hook.onCommitFiberUnmount(rendererID, fiber);
    });
  } catch (err) {
    // Catch all errors because it is unsafe to throw during initialization.
    {
      warning(false, 'React DevTools encountered an error: %s.', err);
    }
  }
  // DevTools exists
  return true;
}

function onCommitRoot(root) {
  if (typeof onCommitFiberRoot === 'function') {
    onCommitFiberRoot(root);
  }
}

function onCommitUnmount(fiber) {
  if (typeof onCommitFiberUnmount === 'function') {
    onCommitFiberUnmount(fiber);
  }
}

/**
 * Forked from fbjs/warning:
 * https://github.com/facebook/fbjs/blob/e66ba20ad5be433eb54423f2b097d829324d9de6/packages/fbjs/src/__forks__/warning.js
 *
 * Only change is we use console.warn instead of console.error,
 * and do nothing when 'console' is not supported.
 * This really simplifies the code.
 * ---
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var lowPriorityWarning = function () {};

{
  var printWarning = function (format) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var argIndex = 0;
    var message = 'Warning: ' + format.replace(/%s/g, function () {
      return args[argIndex++];
    });
    if (typeof console !== 'undefined') {
      console.warn(message);
    }
    try {
      // --- Welcome to debugging React ---
      // This error was thrown as a convenience so that you can use this stack
      // to find the callsite that caused this warning to fire.
      throw new Error(message);
    } catch (x) {}
  };

  lowPriorityWarning = function (condition, format) {
    if (format === undefined) {
      throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
    }
    if (!condition) {
      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      printWarning.apply(undefined, [format].concat(args));
    }
  };
}

var lowPriorityWarning$1 = lowPriorityWarning;

var ReactStrictModeWarnings = {
  discardPendingWarnings: function () {},
  flushPendingDeprecationWarnings: function () {},
  flushPendingUnsafeLifecycleWarnings: function () {},
  recordDeprecationWarnings: function (fiber, instance) {},
  recordUnsafeLifecycleWarnings: function (fiber, instance) {}
};

{
  var LIFECYCLE_SUGGESTIONS = {
    UNSAFE_componentWillMount: 'componentDidMount',
    UNSAFE_componentWillReceiveProps: 'static getDerivedStateFromProps',
    UNSAFE_componentWillUpdate: 'componentDidUpdate'
  };

  var pendingComponentWillMountWarnings = [];
  var pendingComponentWillReceivePropsWarnings = [];
  var pendingComponentWillUpdateWarnings = [];
  var pendingUnsafeLifecycleWarnings = new Map();

  // Tracks components we have already warned about.
  var didWarnAboutDeprecatedLifecycles = new Set();
  var didWarnAboutUnsafeLifecycles = new Set();

  var setToSortedString = function (set) {
    var array = [];
    set.forEach(function (value) {
      array.push(value);
    });
    return array.sort().join(', ');
  };

  ReactStrictModeWarnings.discardPendingWarnings = function () {
    pendingComponentWillMountWarnings = [];
    pendingComponentWillReceivePropsWarnings = [];
    pendingComponentWillUpdateWarnings = [];
    pendingUnsafeLifecycleWarnings = new Map();
  };

  ReactStrictModeWarnings.flushPendingUnsafeLifecycleWarnings = function () {
    pendingUnsafeLifecycleWarnings.forEach(function (lifecycleWarningsMap, strictRoot) {
      var lifecyclesWarningMesages = [];

      Object.keys(lifecycleWarningsMap).forEach(function (lifecycle) {
        var lifecycleWarnings = lifecycleWarningsMap[lifecycle];
        if (lifecycleWarnings.length > 0) {
          var componentNames = new Set();
          lifecycleWarnings.forEach(function (fiber) {
            componentNames.add(getComponentName(fiber) || 'Component');
            didWarnAboutUnsafeLifecycles.add(fiber.type);
          });

          var formatted = lifecycle.replace('UNSAFE_', '');
          var suggestion = LIFECYCLE_SUGGESTIONS[lifecycle];
          var sortedComponentNames = setToSortedString(componentNames);

          lifecyclesWarningMesages.push(formatted + ': Please update the following components to use ' + (suggestion + ' instead: ' + sortedComponentNames));
        }
      });

      if (lifecyclesWarningMesages.length > 0) {
        var strictRootComponentStack = getStackAddendumByWorkInProgressFiber(strictRoot);

        warning(false, 'Unsafe lifecycle methods were found within a strict-mode tree:%s' + '\n\n%s' + '\n\nLearn more about this warning here:' + '\nhttps://fb.me/react-strict-mode-warnings', strictRootComponentStack, lifecyclesWarningMesages.join('\n\n'));
      }
    });

    pendingUnsafeLifecycleWarnings = new Map();
  };

  var getStrictRoot = function (fiber) {
    var maybeStrictRoot = null;

    while (fiber !== null) {
      if (fiber.mode & StrictMode) {
        maybeStrictRoot = fiber;
      }

      fiber = fiber['return'];
    }

    return maybeStrictRoot;
  };

  ReactStrictModeWarnings.flushPendingDeprecationWarnings = function () {
    if (pendingComponentWillMountWarnings.length > 0) {
      var uniqueNames = new Set();
      pendingComponentWillMountWarnings.forEach(function (fiber) {
        uniqueNames.add(getComponentName(fiber) || 'Component');
        didWarnAboutDeprecatedLifecycles.add(fiber.type);
      });

      var sortedNames = setToSortedString(uniqueNames);

      lowPriorityWarning$1(false, 'componentWillMount is deprecated and will be removed in the next major version. ' + 'Use componentDidMount instead. As a temporary workaround, ' + 'you can rename to UNSAFE_componentWillMount.' + '\n\nPlease update the following components: %s' + '\n\nLearn more about this warning here:' + '\nhttps://fb.me/react-async-component-lifecycle-hooks', sortedNames);

      pendingComponentWillMountWarnings = [];
    }

    if (pendingComponentWillReceivePropsWarnings.length > 0) {
      var _uniqueNames = new Set();
      pendingComponentWillReceivePropsWarnings.forEach(function (fiber) {
        _uniqueNames.add(getComponentName(fiber) || 'Component');
        didWarnAboutDeprecatedLifecycles.add(fiber.type);
      });

      var _sortedNames = setToSortedString(_uniqueNames);

      lowPriorityWarning$1(false, 'componentWillReceiveProps is deprecated and will be removed in the next major version. ' + 'Use static getDerivedStateFromProps instead.' + '\n\nPlease update the following components: %s' + '\n\nLearn more about this warning here:' + '\nhttps://fb.me/react-async-component-lifecycle-hooks', _sortedNames);

      pendingComponentWillReceivePropsWarnings = [];
    }

    if (pendingComponentWillUpdateWarnings.length > 0) {
      var _uniqueNames2 = new Set();
      pendingComponentWillUpdateWarnings.forEach(function (fiber) {
        _uniqueNames2.add(getComponentName(fiber) || 'Component');
        didWarnAboutDeprecatedLifecycles.add(fiber.type);
      });

      var _sortedNames2 = setToSortedString(_uniqueNames2);

      lowPriorityWarning$1(false, 'componentWillUpdate is deprecated and will be removed in the next major version. ' + 'Use componentDidUpdate instead. As a temporary workaround, ' + 'you can rename to UNSAFE_componentWillUpdate.' + '\n\nPlease update the following components: %s' + '\n\nLearn more about this warning here:' + '\nhttps://fb.me/react-async-component-lifecycle-hooks', _sortedNames2);

      pendingComponentWillUpdateWarnings = [];
    }
  };

  ReactStrictModeWarnings.recordDeprecationWarnings = function (fiber, instance) {
    // Dedup strategy: Warn once per component.
    if (didWarnAboutDeprecatedLifecycles.has(fiber.type)) {
      return;
    }

    // Don't warn about react-lifecycles-compat polyfilled components.
    if (typeof instance.componentWillMount === 'function' && instance.componentWillMount.__suppressDeprecationWarning !== true) {
      pendingComponentWillMountWarnings.push(fiber);
    }
    if (typeof instance.componentWillReceiveProps === 'function' && instance.componentWillReceiveProps.__suppressDeprecationWarning !== true) {
      pendingComponentWillReceivePropsWarnings.push(fiber);
    }
    if (typeof instance.componentWillUpdate === 'function' && instance.componentWillUpdate.__suppressDeprecationWarning !== true) {
      pendingComponentWillUpdateWarnings.push(fiber);
    }
  };

  ReactStrictModeWarnings.recordUnsafeLifecycleWarnings = function (fiber, instance) {
    var strictRoot = getStrictRoot(fiber);

    // Dedup strategy: Warn once per component.
    // This is difficult to track any other way since component names
    // are often vague and are likely to collide between 3rd party libraries.
    // An expand property is probably okay to use here since it's DEV-only,
    // and will only be set in the event of serious warnings.
    if (didWarnAboutUnsafeLifecycles.has(fiber.type)) {
      return;
    }

    // Don't warn about react-lifecycles-compat polyfilled components.
    // Note that it is sufficient to check for the presence of a
    // single lifecycle, componentWillMount, with the polyfill flag.
    if (typeof instance.componentWillMount === 'function' && instance.componentWillMount.__suppressDeprecationWarning === true) {
      return;
    }

    var warningsForRoot = void 0;
    if (!pendingUnsafeLifecycleWarnings.has(strictRoot)) {
      warningsForRoot = {
        UNSAFE_componentWillMount: [],
        UNSAFE_componentWillReceiveProps: [],
        UNSAFE_componentWillUpdate: []
      };

      pendingUnsafeLifecycleWarnings.set(strictRoot, warningsForRoot);
    } else {
      warningsForRoot = pendingUnsafeLifecycleWarnings.get(strictRoot);
    }

    var unsafeLifecycles = [];
    if (typeof instance.componentWillMount === 'function' || typeof instance.UNSAFE_componentWillMount === 'function') {
      unsafeLifecycles.push('UNSAFE_componentWillMount');
    }
    if (typeof instance.componentWillReceiveProps === 'function' || typeof instance.UNSAFE_componentWillReceiveProps === 'function') {
      unsafeLifecycles.push('UNSAFE_componentWillReceiveProps');
    }
    if (typeof instance.componentWillUpdate === 'function' || typeof instance.UNSAFE_componentWillUpdate === 'function') {
      unsafeLifecycles.push('UNSAFE_componentWillUpdate');
    }

    if (unsafeLifecycles.length > 0) {
      unsafeLifecycles.forEach(function (lifecycle) {
        warningsForRoot[lifecycle].push(fiber);
      });
    }
  };
}

// Exports ReactDOM.createRoot
var enableUserTimingAPI = true;

// Mutating mode (React DOM, React ART, React Native):
var enableMutatingReconciler = true;
// Experimental noop mode (currently unused):
var enableNoopReconciler = false;
// Experimental persistent mode (Fabric):
var enablePersistentReconciler = false;
// Experimental error-boundary API that can recover from errors within a single
// render phase
var enableGetDerivedStateFromCatch = false;
// Helps identify side effects in begin-phase lifecycle hooks and setState reducers:
var debugRenderPhaseSideEffects = false;

// In some cases, StrictMode should also double-render lifecycles.
// This can be confusing for tests though,
// And it can be bad for performance in production.
// This feature flag can be used to control the behavior:
var debugRenderPhaseSideEffectsForStrictMode = true;

// To preserve the "Pause on caught exceptions" behavior of the debugger, we
// replay the begin phase of a failed component inside invokeGuardedCallback.
var replayFailedUnitOfWorkWithInvokeGuardedCallback = true;

// Warn about deprecated, async-unsafe lifecycles; relates to RFC #6:
var warnAboutDeprecatedLifecycles = false;

var alwaysUseRequestIdleCallbackPolyfill = false;

// Only used in www builds.

// Prefix measurements so that it's possible to filter them.
// Longer prefixes are hard to read in DevTools.
var reactEmoji = '\u269B';
var warningEmoji = '\u26D4';
var supportsUserTiming = typeof performance !== 'undefined' && typeof performance.mark === 'function' && typeof performance.clearMarks === 'function' && typeof performance.measure === 'function' && typeof performance.clearMeasures === 'function';

// Keep track of current fiber so that we know the path to unwind on pause.
// TODO: this looks the same as nextUnitOfWork in scheduler. Can we unify them?
var currentFiber = null;
// If we're in the middle of user code, which fiber and method is it?
// Reusing `currentFiber` would be confusing for this because user code fiber
// can change during commit phase too, but we don't need to unwind it (since
// lifecycles in the commit phase don't resemble a tree).
var currentPhase = null;
var currentPhaseFiber = null;
// Did lifecycle hook schedule an update? This is often a performance problem,
// so we will keep track of it, and include it in the report.
// Track commits caused by cascading updates.
var isCommitting = false;
var hasScheduledUpdateInCurrentCommit = false;
var hasScheduledUpdateInCurrentPhase = false;
var commitCountInCurrentWorkLoop = 0;
var effectCountInCurrentCommit = 0;
var isWaitingForCallback = false;
// During commits, we only show a measurement once per method name
// to avoid stretch the commit phase with measurement overhead.
var labelsInCurrentCommit = new Set();

var formatMarkName = function (markName) {
  return reactEmoji + ' ' + markName;
};

var formatLabel = function (label, warning$$1) {
  var prefix = warning$$1 ? warningEmoji + ' ' : reactEmoji + ' ';
  var suffix = warning$$1 ? ' Warning: ' + warning$$1 : '';
  return '' + prefix + label + suffix;
};

var beginMark = function (markName) {
  performance.mark(formatMarkName(markName));
};

var clearMark = function (markName) {
  performance.clearMarks(formatMarkName(markName));
};

var endMark = function (label, markName, warning$$1) {
  var formattedMarkName = formatMarkName(markName);
  var formattedLabel = formatLabel(label, warning$$1);
  try {
    performance.measure(formattedLabel, formattedMarkName);
  } catch (err) {}
  // If previous mark was missing for some reason, this will throw.
  // This could only happen if React crashed in an unexpected place earlier.
  // Don't pile on with more errors.

  // Clear marks immediately to avoid growing buffer.
  performance.clearMarks(formattedMarkName);
  performance.clearMeasures(formattedLabel);
};

var getFiberMarkName = function (label, debugID) {
  return label + ' (#' + debugID + ')';
};

var getFiberLabel = function (componentName, isMounted, phase) {
  if (phase === null) {
    // These are composite component total time measurements.
    return componentName + ' [' + (isMounted ? 'update' : 'mount') + ']';
  } else {
    // Composite component methods.
    return componentName + '.' + phase;
  }
};

var beginFiberMark = function (fiber, phase) {
  var componentName = getComponentName(fiber) || 'Unknown';
  var debugID = fiber._debugID;
  var isMounted = fiber.alternate !== null;
  var label = getFiberLabel(componentName, isMounted, phase);

  if (isCommitting && labelsInCurrentCommit.has(label)) {
    // During the commit phase, we don't show duplicate labels because
    // there is a fixed overhead for every measurement, and we don't
    // want to stretch the commit phase beyond necessary.
    return false;
  }
  labelsInCurrentCommit.add(label);

  var markName = getFiberMarkName(label, debugID);
  beginMark(markName);
  return true;
};

var clearFiberMark = function (fiber, phase) {
  var componentName = getComponentName(fiber) || 'Unknown';
  var debugID = fiber._debugID;
  var isMounted = fiber.alternate !== null;
  var label = getFiberLabel(componentName, isMounted, phase);
  var markName = getFiberMarkName(label, debugID);
  clearMark(markName);
};

var endFiberMark = function (fiber, phase, warning$$1) {
  var componentName = getComponentName(fiber) || 'Unknown';
  var debugID = fiber._debugID;
  var isMounted = fiber.alternate !== null;
  var label = getFiberLabel(componentName, isMounted, phase);
  var markName = getFiberMarkName(label, debugID);
  endMark(label, markName, warning$$1);
};

var shouldIgnoreFiber = function (fiber) {
  // Host components should be skipped in the timeline.
  // We could check typeof fiber.type, but does this work with RN?
  switch (fiber.tag) {
    case HostRoot:
    case HostComponent:
    case HostText:
    case HostPortal:
    case CallComponent:
    case ReturnComponent:
    case Fragment:
    case ContextProvider:
    case ContextConsumer:
    case Mode:
      return true;
    default:
      return false;
  }
};

var clearPendingPhaseMeasurement = function () {
  if (currentPhase !== null && currentPhaseFiber !== null) {
    clearFiberMark(currentPhaseFiber, currentPhase);
  }
  currentPhaseFiber = null;
  currentPhase = null;
  hasScheduledUpdateInCurrentPhase = false;
};

var pauseTimers = function () {
  // Stops all currently active measurements so that they can be resumed
  // if we continue in a later deferred loop from the same unit of work.
  var fiber = currentFiber;
  while (fiber) {
    if (fiber._debugIsCurrentlyTiming) {
      endFiberMark(fiber, null, null);
    }
    fiber = fiber['return'];
  }
};

var resumeTimersRecursively = function (fiber) {
  if (fiber['return'] !== null) {
    resumeTimersRecursively(fiber['return']);
  }
  if (fiber._debugIsCurrentlyTiming) {
    beginFiberMark(fiber, null);
  }
};

var resumeTimers = function () {
  // Resumes all measurements that were active during the last deferred loop.
  if (currentFiber !== null) {
    resumeTimersRecursively(currentFiber);
  }
};

function recordEffect() {
  if (enableUserTimingAPI) {
    effectCountInCurrentCommit++;
  }
}

function recordScheduleUpdate() {
  if (enableUserTimingAPI) {
    if (isCommitting) {
      hasScheduledUpdateInCurrentCommit = true;
    }
    if (currentPhase !== null && currentPhase !== 'componentWillMount' && currentPhase !== 'componentWillReceiveProps') {
      hasScheduledUpdateInCurrentPhase = true;
    }
  }
}

function startRequestCallbackTimer() {
  if (enableUserTimingAPI) {
    if (supportsUserTiming && !isWaitingForCallback) {
      isWaitingForCallback = true;
      beginMark('(Waiting for async callback...)');
    }
  }
}

function stopRequestCallbackTimer(didExpire, expirationTime) {
  if (enableUserTimingAPI) {
    if (supportsUserTiming) {
      isWaitingForCallback = false;
      var warning$$1 = didExpire ? 'React was blocked by main thread' : null;
      endMark('(Waiting for async callback... will force flush in ' + expirationTime + ' ms)', '(Waiting for async callback...)', warning$$1);
    }
  }
}

function startWorkTimer(fiber) {
  if (enableUserTimingAPI) {
    if (!supportsUserTiming || shouldIgnoreFiber(fiber)) {
      return;
    }
    // If we pause, this is the fiber to unwind from.
    currentFiber = fiber;
    if (!beginFiberMark(fiber, null)) {
      return;
    }
    fiber._debugIsCurrentlyTiming = true;
  }
}

function cancelWorkTimer(fiber) {
  if (enableUserTimingAPI) {
    if (!supportsUserTiming || shouldIgnoreFiber(fiber)) {
      return;
    }
    // Remember we shouldn't complete measurement for this fiber.
    // Otherwise flamechart will be deep even for small updates.
    fiber._debugIsCurrentlyTiming = false;
    clearFiberMark(fiber, null);
  }
}

function stopWorkTimer(fiber) {
  if (enableUserTimingAPI) {
    if (!supportsUserTiming || shouldIgnoreFiber(fiber)) {
      return;
    }
    // If we pause, its parent is the fiber to unwind from.
    currentFiber = fiber['return'];
    if (!fiber._debugIsCurrentlyTiming) {
      return;
    }
    fiber._debugIsCurrentlyTiming = false;
    endFiberMark(fiber, null, null);
  }
}

function stopFailedWorkTimer(fiber) {
  if (enableUserTimingAPI) {
    if (!supportsUserTiming || shouldIgnoreFiber(fiber)) {
      return;
    }
    // If we pause, its parent is the fiber to unwind from.
    currentFiber = fiber['return'];
    if (!fiber._debugIsCurrentlyTiming) {
      return;
    }
    fiber._debugIsCurrentlyTiming = false;
    var warning$$1 = 'An error was thrown inside this error boundary';
    endFiberMark(fiber, null, warning$$1);
  }
}

function startPhaseTimer(fiber, phase) {
  if (enableUserTimingAPI) {
    if (!supportsUserTiming) {
      return;
    }
    clearPendingPhaseMeasurement();
    if (!beginFiberMark(fiber, phase)) {
      return;
    }
    currentPhaseFiber = fiber;
    currentPhase = phase;
  }
}

function stopPhaseTimer() {
  if (enableUserTimingAPI) {
    if (!supportsUserTiming) {
      return;
    }
    if (currentPhase !== null && currentPhaseFiber !== null) {
      var warning$$1 = hasScheduledUpdateInCurrentPhase ? 'Scheduled a cascading update' : null;
      endFiberMark(currentPhaseFiber, currentPhase, warning$$1);
    }
    currentPhase = null;
    currentPhaseFiber = null;
  }
}

function startWorkLoopTimer(nextUnitOfWork) {
  if (enableUserTimingAPI) {
    currentFiber = nextUnitOfWork;
    if (!supportsUserTiming) {
      return;
    }
    commitCountInCurrentWorkLoop = 0;
    // This is top level call.
    // Any other measurements are performed within.
    beginMark('(React Tree Reconciliation)');
    // Resume any measurements that were in progress during the last loop.
    resumeTimers();
  }
}

function stopWorkLoopTimer(interruptedBy, didCompleteRoot) {
  if (enableUserTimingAPI) {
    if (!supportsUserTiming) {
      return;
    }
    var warning$$1 = null;
    if (interruptedBy !== null) {
      if (interruptedBy.tag === HostRoot) {
        warning$$1 = 'A top-level update interrupted the previous render';
      } else {
        var componentName = getComponentName(interruptedBy) || 'Unknown';
        warning$$1 = 'An update to ' + componentName + ' interrupted the previous render';
      }
    } else if (commitCountInCurrentWorkLoop > 1) {
      warning$$1 = 'There were cascading updates';
    }
    commitCountInCurrentWorkLoop = 0;
    var label = didCompleteRoot ? '(React Tree Reconciliation: Completed Root)' : '(React Tree Reconciliation: Yielded)';
    // Pause any measurements until the next loop.
    pauseTimers();
    endMark(label, '(React Tree Reconciliation)', warning$$1);
  }
}

function startCommitTimer() {
  if (enableUserTimingAPI) {
    if (!supportsUserTiming) {
      return;
    }
    isCommitting = true;
    hasScheduledUpdateInCurrentCommit = false;
    labelsInCurrentCommit.clear();
    beginMark('(Committing Changes)');
  }
}

function stopCommitTimer() {
  if (enableUserTimingAPI) {
    if (!supportsUserTiming) {
      return;
    }

    var warning$$1 = null;
    if (hasScheduledUpdateInCurrentCommit) {
      warning$$1 = 'Lifecycle hook scheduled a cascading update';
    } else if (commitCountInCurrentWorkLoop > 0) {
      warning$$1 = 'Caused by a cascading update in earlier commit';
    }
    hasScheduledUpdateInCurrentCommit = false;
    commitCountInCurrentWorkLoop++;
    isCommitting = false;
    labelsInCurrentCommit.clear();

    endMark('(Committing Changes)', '(Committing Changes)', warning$$1);
  }
}

function startCommitSnapshotEffectsTimer() {
  if (enableUserTimingAPI) {
    if (!supportsUserTiming) {
      return;
    }
    effectCountInCurrentCommit = 0;
    beginMark('(Committing Snapshot Effects)');
  }
}

function stopCommitSnapshotEffectsTimer() {
  if (enableUserTimingAPI) {
    if (!supportsUserTiming) {
      return;
    }
    var count = effectCountInCurrentCommit;
    effectCountInCurrentCommit = 0;
    endMark('(Committing Snapshot Effects: ' + count + ' Total)', '(Committing Snapshot Effects)', null);
  }
}

function startCommitHostEffectsTimer() {
  if (enableUserTimingAPI) {
    if (!supportsUserTiming) {
      return;
    }
    effectCountInCurrentCommit = 0;
    beginMark('(Committing Host Effects)');
  }
}

function stopCommitHostEffectsTimer() {
  if (enableUserTimingAPI) {
    if (!supportsUserTiming) {
      return;
    }
    var count = effectCountInCurrentCommit;
    effectCountInCurrentCommit = 0;
    endMark('(Committing Host Effects: ' + count + ' Total)', '(Committing Host Effects)', null);
  }
}

function startCommitLifeCyclesTimer() {
  if (enableUserTimingAPI) {
    if (!supportsUserTiming) {
      return;
    }
    effectCountInCurrentCommit = 0;
    beginMark('(Calling Lifecycle Methods)');
  }
}

function stopCommitLifeCyclesTimer() {
  if (enableUserTimingAPI) {
    if (!supportsUserTiming) {
      return;
    }
    var count = effectCountInCurrentCommit;
    effectCountInCurrentCommit = 0;
    endMark('(Calling Lifecycle Methods: ' + count + ' Total)', '(Calling Lifecycle Methods)', null);
  }
}

var didWarnUpdateInsideUpdate = void 0;

{
  didWarnUpdateInsideUpdate = false;
}

// Callbacks are not validated until invocation


// Singly linked-list of updates. When an update is scheduled, it is added to
// the queue of the current fiber and the work-in-progress fiber. The two queues
// are separate but they share a persistent structure.
//
// During reconciliation, updates are removed from the work-in-progress fiber,
// but they remain on the current fiber. That ensures that if a work-in-progress
// is aborted, the aborted updates are recovered by cloning from current.
//
// The work-in-progress queue is always a subset of the current queue.
//
// When the tree is committed, the work-in-progress becomes the current.


function createUpdateQueue(baseState) {
  var queue = {
    baseState: baseState,
    expirationTime: NoWork,
    first: null,
    last: null,
    callbackList: null,
    hasForceUpdate: false,
    isInitialized: false,
    capturedValues: null
  };
  {
    queue.isProcessing = false;
  }
  return queue;
}

function insertUpdateIntoQueue(queue, update) {
  // Append the update to the end of the list.
  if (queue.last === null) {
    // Queue is empty
    queue.first = queue.last = update;
  } else {
    queue.last.next = update;
    queue.last = update;
  }
  if (queue.expirationTime === NoWork || queue.expirationTime > update.expirationTime) {
    queue.expirationTime = update.expirationTime;
  }
}

var q1 = void 0;
var q2 = void 0;
function ensureUpdateQueues(fiber) {
  q1 = q2 = null;
  // We'll have at least one and at most two distinct update queues.
  var alternateFiber = fiber.alternate;
  var queue1 = fiber.updateQueue;
  if (queue1 === null) {
    // TODO: We don't know what the base state will be until we begin work.
    // It depends on which fiber is the next current. Initialize with an empty
    // base state, then set to the memoizedState when rendering. Not super
    // happy with this approach.
    queue1 = fiber.updateQueue = createUpdateQueue(null);
  }

  var queue2 = void 0;
  if (alternateFiber !== null) {
    queue2 = alternateFiber.updateQueue;
    if (queue2 === null) {
      queue2 = alternateFiber.updateQueue = createUpdateQueue(null);
    }
  } else {
    queue2 = null;
  }
  queue2 = queue2 !== queue1 ? queue2 : null;

  // Use module variables instead of returning a tuple
  q1 = queue1;
  q2 = queue2;
}

function insertUpdateIntoFiber(fiber, update) {
  ensureUpdateQueues(fiber);
  var queue1 = q1;
  var queue2 = q2;

  // Warn if an update is scheduled from inside an updater function.
  {
    if ((queue1.isProcessing || queue2 !== null && queue2.isProcessing) && !didWarnUpdateInsideUpdate) {
      warning(false, 'An update (setState, replaceState, or forceUpdate) was scheduled ' + 'from inside an update function. Update functions should be pure, ' + 'with zero side-effects. Consider using componentDidUpdate or a ' + 'callback.');
      didWarnUpdateInsideUpdate = true;
    }
  }

  // If there's only one queue, add the update to that queue and exit.
  if (queue2 === null) {
    insertUpdateIntoQueue(queue1, update);
    return;
  }

  // If either queue is empty, we need to add to both queues.
  if (queue1.last === null || queue2.last === null) {
    insertUpdateIntoQueue(queue1, update);
    insertUpdateIntoQueue(queue2, update);
    return;
  }

  // If both lists are not empty, the last update is the same for both lists
  // because of structural sharing. So, we should only append to one of
  // the lists.
  insertUpdateIntoQueue(queue1, update);
  // But we still need to update the `last` pointer of queue2.
  queue2.last = update;
}

function getUpdateExpirationTime(fiber) {
  switch (fiber.tag) {
    case HostRoot:
    case ClassComponent:
      var updateQueue = fiber.updateQueue;
      if (updateQueue === null) {
        return NoWork;
      }
      return updateQueue.expirationTime;
    default:
      return NoWork;
  }
}

function getStateFromUpdate(update, instance, prevState, props) {
  var partialState = update.partialState;
  if (typeof partialState === 'function') {
    return partialState.call(instance, prevState, props);
  } else {
    return partialState;
  }
}

function processUpdateQueue(current, workInProgress, queue, instance, props, renderExpirationTime) {
  if (current !== null && current.updateQueue === queue) {
    // We need to create a work-in-progress queue, by cloning the current queue.
    var currentQueue = queue;
    queue = workInProgress.updateQueue = {
      baseState: currentQueue.baseState,
      expirationTime: currentQueue.expirationTime,
      first: currentQueue.first,
      last: currentQueue.last,
      isInitialized: currentQueue.isInitialized,
      capturedValues: currentQueue.capturedValues,
      // These fields are no longer valid because they were already committed.
      // Reset them.
      callbackList: null,
      hasForceUpdate: false
    };
  }

  {
    // Set this flag so we can warn if setState is called inside the update
    // function of another setState.
    queue.isProcessing = true;
  }

  // Reset the remaining expiration time. If we skip over any updates, we'll
  // increase this accordingly.
  queue.expirationTime = NoWork;

  // TODO: We don't know what the base state will be until we begin work.
  // It depends on which fiber is the next current. Initialize with an empty
  // base state, then set to the memoizedState when rendering. Not super
  // happy with this approach.
  var state = void 0;
  if (queue.isInitialized) {
    state = queue.baseState;
  } else {
    state = queue.baseState = workInProgress.memoizedState;
    queue.isInitialized = true;
  }
  var dontMutatePrevState = true;
  var update = queue.first;
  var didSkip = false;
  while (update !== null) {
    var updateExpirationTime = update.expirationTime;
    if (updateExpirationTime > renderExpirationTime) {
      // This update does not have sufficient priority. Skip it.
      var remainingExpirationTime = queue.expirationTime;
      if (remainingExpirationTime === NoWork || remainingExpirationTime > updateExpirationTime) {
        // Update the remaining expiration time.
        queue.expirationTime = updateExpirationTime;
      }
      if (!didSkip) {
        didSkip = true;
        queue.baseState = state;
      }
      // Continue to the next update.
      update = update.next;
      continue;
    }

    // This update does have sufficient priority.

    // If no previous updates were skipped, drop this update from the queue by
    // advancing the head of the list.
    if (!didSkip) {
      queue.first = update.next;
      if (queue.first === null) {
        queue.last = null;
      }
    }

    // Invoke setState callback an extra time to help detect side-effects.
    // Ignore the return value in this case.
    if (debugRenderPhaseSideEffects || debugRenderPhaseSideEffectsForStrictMode && workInProgress.mode & StrictMode) {
      getStateFromUpdate(update, instance, state, props);
    }

    // Process the update
    var _partialState = void 0;
    if (update.isReplace) {
      state = getStateFromUpdate(update, instance, state, props);
      dontMutatePrevState = true;
    } else {
      _partialState = getStateFromUpdate(update, instance, state, props);
      if (_partialState) {
        if (dontMutatePrevState) {
          // $FlowFixMe: Idk how to type this properly.
          state = _assign({}, state, _partialState);
        } else {
          state = _assign(state, _partialState);
        }
        dontMutatePrevState = false;
      }
    }
    if (update.isForced) {
      queue.hasForceUpdate = true;
    }
    if (update.callback !== null) {
      // Append to list of callbacks.
      var _callbackList = queue.callbackList;
      if (_callbackList === null) {
        _callbackList = queue.callbackList = [];
      }
      _callbackList.push(update);
    }
    if (update.capturedValue !== null) {
      var _capturedValues = queue.capturedValues;
      if (_capturedValues === null) {
        queue.capturedValues = [update.capturedValue];
      } else {
        _capturedValues.push(update.capturedValue);
      }
    }
    update = update.next;
  }

  if (queue.callbackList !== null) {
    workInProgress.effectTag |= Callback;
  } else if (queue.first === null && !queue.hasForceUpdate && queue.capturedValues === null) {
    // The queue is empty. We can reset it.
    workInProgress.updateQueue = null;
  }

  if (!didSkip) {
    didSkip = true;
    queue.baseState = state;
  }

  {
    // No longer processing.
    queue.isProcessing = false;
  }

  return state;
}

function commitCallbacks(queue, context) {
  var callbackList = queue.callbackList;
  if (callbackList === null) {
    return;
  }
  // Set the list to null to make sure they don't get called more than once.
  queue.callbackList = null;
  for (var i = 0; i < callbackList.length; i++) {
    var update = callbackList[i];
    var _callback = update.callback;
    // This update might be processed again. Clear the callback so it's only
    // called once.
    update.callback = null;
    !(typeof _callback === 'function') ? invariant(false, 'Invalid argument passed as callback. Expected a function. Instead received: %s', _callback) : void 0;
    _callback.call(context);
  }
}

var fakeInternalInstance = {};
var isArray = Array.isArray;

var didWarnAboutStateAssignmentForComponent = void 0;
var didWarnAboutUndefinedDerivedState = void 0;
var didWarnAboutUninitializedState = void 0;
var didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate = void 0;
var didWarnAboutLegacyLifecyclesAndDerivedState = void 0;
var warnOnInvalidCallback$1 = void 0;

{
  didWarnAboutStateAssignmentForComponent = new Set();
  didWarnAboutUndefinedDerivedState = new Set();
  didWarnAboutUninitializedState = new Set();
  didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate = new Set();
  didWarnAboutLegacyLifecyclesAndDerivedState = new Set();

  var didWarnOnInvalidCallback = new Set();

  warnOnInvalidCallback$1 = function (callback, callerName) {
    if (callback === null || typeof callback === 'function') {
      return;
    }
    var key = callerName + '_' + callback;
    if (!didWarnOnInvalidCallback.has(key)) {
      didWarnOnInvalidCallback.add(key);
      warning(false, '%s(...): Expected the last optional `callback` argument to be a ' + 'function. Instead received: %s.', callerName, callback);
    }
  };

  // This is so gross but it's at least non-critical and can be removed if
  // it causes problems. This is meant to give a nicer error message for
  // ReactDOM15.unstable_renderSubtreeIntoContainer(reactDOM16Component,
  // ...)) which otherwise throws a "_processChildContext is not a function"
  // exception.
  Object.defineProperty(fakeInternalInstance, '_processChildContext', {
    enumerable: false,
    value: function () {
      invariant(false, '_processChildContext is not available in React 16+. This likely means you have multiple copies of React and are attempting to nest a React 15 tree inside a React 16 tree using unstable_renderSubtreeIntoContainer, which isn\'t supported. Try to make sure you have only one copy of React (and ideally, switch to ReactDOM.createPortal).');
    }
  });
  Object.freeze(fakeInternalInstance);
}
function callGetDerivedStateFromCatch(ctor, capturedValues) {
  var resultState = {};
  for (var i = 0; i < capturedValues.length; i++) {
    var capturedValue = capturedValues[i];
    var error = capturedValue.value;
    var partialState = ctor.getDerivedStateFromCatch.call(null, error);
    if (partialState !== null && partialState !== undefined) {
      _assign(resultState, partialState);
    }
  }
  return resultState;
}

var ReactFiberClassComponent = function (legacyContext, scheduleWork, computeExpirationForFiber, memoizeProps, memoizeState) {
  var cacheContext = legacyContext.cacheContext,
      getMaskedContext = legacyContext.getMaskedContext,
      getUnmaskedContext = legacyContext.getUnmaskedContext,
      isContextConsumer = legacyContext.isContextConsumer,
      hasContextChanged = legacyContext.hasContextChanged;

  // Class component state updater

  var updater = {
    isMounted: isMounted,
    enqueueSetState: function (instance, partialState, callback) {
      var fiber = get(instance);
      callback = callback === undefined ? null : callback;
      {
        warnOnInvalidCallback$1(callback, 'setState');
      }
      var expirationTime = computeExpirationForFiber(fiber);
      var update = {
        expirationTime: expirationTime,
        partialState: partialState,
        callback: callback,
        isReplace: false,
        isForced: false,
        capturedValue: null,
        next: null
      };
      insertUpdateIntoFiber(fiber, update);
      scheduleWork(fiber, expirationTime);
    },
    enqueueReplaceState: function (instance, state, callback) {
      var fiber = get(instance);
      callback = callback === undefined ? null : callback;
      {
        warnOnInvalidCallback$1(callback, 'replaceState');
      }
      var expirationTime = computeExpirationForFiber(fiber);
      var update = {
        expirationTime: expirationTime,
        partialState: state,
        callback: callback,
        isReplace: true,
        isForced: false,
        capturedValue: null,
        next: null
      };
      insertUpdateIntoFiber(fiber, update);
      scheduleWork(fiber, expirationTime);
    },
    enqueueForceUpdate: function (instance, callback) {
      var fiber = get(instance);
      callback = callback === undefined ? null : callback;
      {
        warnOnInvalidCallback$1(callback, 'forceUpdate');
      }
      var expirationTime = computeExpirationForFiber(fiber);
      var update = {
        expirationTime: expirationTime,
        partialState: null,
        callback: callback,
        isReplace: false,
        isForced: true,
        capturedValue: null,
        next: null
      };
      insertUpdateIntoFiber(fiber, update);
      scheduleWork(fiber, expirationTime);
    }
  };

  function checkShouldComponentUpdate(workInProgress, oldProps, newProps, oldState, newState, newContext) {
    if (oldProps === null || workInProgress.updateQueue !== null && workInProgress.updateQueue.hasForceUpdate) {
      // If the workInProgress already has an Update effect, return true
      return true;
    }

    var instance = workInProgress.stateNode;
    var ctor = workInProgress.type;
    if (typeof instance.shouldComponentUpdate === 'function') {
      startPhaseTimer(workInProgress, 'shouldComponentUpdate');
      var shouldUpdate = instance.shouldComponentUpdate(newProps, newState, newContext);
      stopPhaseTimer();

      {
        !(shouldUpdate !== undefined) ? warning(false, '%s.shouldComponentUpdate(): Returned undefined instead of a ' + 'boolean value. Make sure to return true or false.', getComponentName(workInProgress) || 'Component') : void 0;
      }

      return shouldUpdate;
    }

    if (ctor.prototype && ctor.prototype.isPureReactComponent) {
      return !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState);
    }

    return true;
  }

  function checkClassInstance(workInProgress) {
    var instance = workInProgress.stateNode;
    var type = workInProgress.type;
    {
      var name = getComponentName(workInProgress) || 'Component';
      var renderPresent = instance.render;

      if (!renderPresent) {
        if (type.prototype && typeof type.prototype.render === 'function') {
          warning(false, '%s(...): No `render` method found on the returned component ' + 'instance: did you accidentally return an object from the constructor?', name);
        } else {
          warning(false, '%s(...): No `render` method found on the returned component ' + 'instance: you may have forgotten to define `render`.', name);
        }
      }

      var noGetInitialStateOnES6 = !instance.getInitialState || instance.getInitialState.isReactClassApproved || instance.state;
      !noGetInitialStateOnES6 ? warning(false, 'getInitialState was defined on %s, a plain JavaScript class. ' + 'This is only supported for classes created using React.createClass. ' + 'Did you mean to define a state property instead?', name) : void 0;
      var noGetDefaultPropsOnES6 = !instance.getDefaultProps || instance.getDefaultProps.isReactClassApproved;
      !noGetDefaultPropsOnES6 ? warning(false, 'getDefaultProps was defined on %s, a plain JavaScript class. ' + 'This is only supported for classes created using React.createClass. ' + 'Use a static property to define defaultProps instead.', name) : void 0;
      var noInstancePropTypes = !instance.propTypes;
      !noInstancePropTypes ? warning(false, 'propTypes was defined as an instance property on %s. Use a static ' + 'property to define propTypes instead.', name) : void 0;
      var noInstanceContextTypes = !instance.contextTypes;
      !noInstanceContextTypes ? warning(false, 'contextTypes was defined as an instance property on %s. Use a static ' + 'property to define contextTypes instead.', name) : void 0;
      var noComponentShouldUpdate = typeof instance.componentShouldUpdate !== 'function';
      !noComponentShouldUpdate ? warning(false, '%s has a method called ' + 'componentShouldUpdate(). Did you mean shouldComponentUpdate()? ' + 'The name is phrased as a question because the function is ' + 'expected to return a value.', name) : void 0;
      if (type.prototype && type.prototype.isPureReactComponent && typeof instance.shouldComponentUpdate !== 'undefined') {
        warning(false, '%s has a method called shouldComponentUpdate(). ' + 'shouldComponentUpdate should not be used when extending React.PureComponent. ' + 'Please extend React.Component if shouldComponentUpdate is used.', getComponentName(workInProgress) || 'A pure component');
      }
      var noComponentDidUnmount = typeof instance.componentDidUnmount !== 'function';
      !noComponentDidUnmount ? warning(false, '%s has a method called ' + 'componentDidUnmount(). But there is no such lifecycle method. ' + 'Did you mean componentWillUnmount()?', name) : void 0;
      var noComponentDidReceiveProps = typeof instance.componentDidReceiveProps !== 'function';
      !noComponentDidReceiveProps ? warning(false, '%s has a method called ' + 'componentDidReceiveProps(). But there is no such lifecycle method. ' + 'If you meant to update the state in response to changing props, ' + 'use componentWillReceiveProps(). If you meant to fetch data or ' + 'run side-effects or mutations after React has updated the UI, use componentDidUpdate().', name) : void 0;
      var noComponentWillRecieveProps = typeof instance.componentWillRecieveProps !== 'function';
      !noComponentWillRecieveProps ? warning(false, '%s has a method called ' + 'componentWillRecieveProps(). Did you mean componentWillReceiveProps()?', name) : void 0;
      var noUnsafeComponentWillRecieveProps = typeof instance.UNSAFE_componentWillRecieveProps !== 'function';
      !noUnsafeComponentWillRecieveProps ? warning(false, '%s has a method called ' + 'UNSAFE_componentWillRecieveProps(). Did you mean UNSAFE_componentWillReceiveProps()?', name) : void 0;
      var hasMutatedProps = instance.props !== workInProgress.pendingProps;
      !(instance.props === undefined || !hasMutatedProps) ? warning(false, '%s(...): When calling super() in `%s`, make sure to pass ' + "up the same props that your component's constructor was passed.", name, name) : void 0;
      var noInstanceDefaultProps = !instance.defaultProps;
      !noInstanceDefaultProps ? warning(false, 'Setting defaultProps as an instance property on %s is not supported and will be ignored.' + ' Instead, define defaultProps as a static property on %s.', name, name) : void 0;

      if (typeof instance.getSnapshotBeforeUpdate === 'function' && typeof instance.componentDidUpdate !== 'function' && !didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate.has(type)) {
        didWarnAboutGetSnapshotBeforeUpdateWithoutDidUpdate.add(type);
        warning(false, '%s: getSnapshotBeforeUpdate() should be used with componentDidUpdate(). ' + 'This component defines getSnapshotBeforeUpdate() only.', getComponentName(workInProgress));
      }

      var noInstanceGetDerivedStateFromProps = typeof instance.getDerivedStateFromProps !== 'function';
      !noInstanceGetDerivedStateFromProps ? warning(false, '%s: getDerivedStateFromProps() is defined as an instance method ' + 'and will be ignored. Instead, declare it as a static method.', name) : void 0;
      var noInstanceGetDerivedStateFromCatch = typeof instance.getDerivedStateFromCatch !== 'function';
      !noInstanceGetDerivedStateFromCatch ? warning(false, '%s: getDerivedStateFromCatch() is defined as an instance method ' + 'and will be ignored. Instead, declare it as a static method.', name) : void 0;
      var noStaticGetSnapshotBeforeUpdate = typeof type.getSnapshotBeforeUpdate !== 'function';
      !noStaticGetSnapshotBeforeUpdate ? warning(false, '%s: getSnapshotBeforeUpdate() is defined as a static method ' + 'and will be ignored. Instead, declare it as an instance method.', name) : void 0;
      var _state = instance.state;
      if (_state && (typeof _state !== 'object' || isArray(_state))) {
        warning(false, '%s.state: must be set to an object or null', name);
      }
      if (typeof instance.getChildContext === 'function') {
        !(typeof type.childContextTypes === 'object') ? warning(false, '%s.getChildContext(): childContextTypes must be defined in order to ' + 'use getChildContext().', name) : void 0;
      }
    }
  }

  function resetInputPointers(workInProgress, instance) {
    instance.props = workInProgress.memoizedProps;
    instance.state = workInProgress.memoizedState;
  }

  function adoptClassInstance(workInProgress, instance) {
    instance.updater = updater;
    workInProgress.stateNode = instance;
    // The instance needs access to the fiber so that it can schedule updates
    set(instance, workInProgress);
    {
      instance._reactInternalInstance = fakeInternalInstance;
    }
  }

  function constructClassInstance(workInProgress, props) {
    var ctor = workInProgress.type;
    var unmaskedContext = getUnmaskedContext(workInProgress);
    var needsContext = isContextConsumer(workInProgress);
    var context = needsContext ? getMaskedContext(workInProgress, unmaskedContext) : emptyObject;

    // Instantiate twice to help detect side-effects.
    if (debugRenderPhaseSideEffects || debugRenderPhaseSideEffectsForStrictMode && workInProgress.mode & StrictMode) {
      new ctor(props, context); // eslint-disable-line no-new
    }

    var instance = new ctor(props, context);
    var state = instance.state !== null && instance.state !== undefined ? instance.state : null;
    adoptClassInstance(workInProgress, instance);

    {
      if (typeof ctor.getDerivedStateFromProps === 'function' && state === null) {
        var componentName = getComponentName(workInProgress) || 'Component';
        if (!didWarnAboutUninitializedState.has(componentName)) {
          didWarnAboutUninitializedState.add(componentName);
          warning(false, '%s: Did not properly initialize state during construction. ' + 'Expected state to be an object, but it was %s.', componentName, instance.state === null ? 'null' : 'undefined');
        }
      }

      // If new component APIs are defined, "unsafe" lifecycles won't be called.
      // Warn about these lifecycles if they are present.
      // Don't warn about react-lifecycles-compat polyfilled methods though.
      if (typeof ctor.getDerivedStateFromProps === 'function' || typeof instance.getSnapshotBeforeUpdate === 'function') {
        var foundWillMountName = null;
        var foundWillReceivePropsName = null;
        var foundWillUpdateName = null;
        if (typeof instance.componentWillMount === 'function' && instance.componentWillMount.__suppressDeprecationWarning !== true) {
          foundWillMountName = 'componentWillMount';
        } else if (typeof instance.UNSAFE_componentWillMount === 'function') {
          foundWillMountName = 'UNSAFE_componentWillMount';
        }
        if (typeof instance.componentWillReceiveProps === 'function' && instance.componentWillReceiveProps.__suppressDeprecationWarning !== true) {
          foundWillReceivePropsName = 'componentWillReceiveProps';
        } else if (typeof instance.UNSAFE_componentWillReceiveProps === 'function') {
          foundWillReceivePropsName = 'UNSAFE_componentWillReceiveProps';
        }
        if (typeof instance.componentWillUpdate === 'function' && instance.componentWillUpdate.__suppressDeprecationWarning !== true) {
          foundWillUpdateName = 'componentWillUpdate';
        } else if (typeof instance.UNSAFE_componentWillUpdate === 'function') {
          foundWillUpdateName = 'UNSAFE_componentWillUpdate';
        }
        if (foundWillMountName !== null || foundWillReceivePropsName !== null || foundWillUpdateName !== null) {
          var _componentName = getComponentName(workInProgress) || 'Component';
          var newApiName = typeof ctor.getDerivedStateFromProps === 'function' ? 'getDerivedStateFromProps()' : 'getSnapshotBeforeUpdate()';
          if (!didWarnAboutLegacyLifecyclesAndDerivedState.has(_componentName)) {
            didWarnAboutLegacyLifecyclesAndDerivedState.add(_componentName);
            warning(false, 'Unsafe legacy lifecycles will not be called for components using new component APIs.\n\n' + '%s uses %s but also contains the following legacy lifecycles:%s%s%s\n\n' + 'The above lifecycles should be removed. Learn more about this warning here:\n' + 'https://fb.me/react-async-component-lifecycle-hooks', _componentName, newApiName, foundWillMountName !== null ? '\n  ' + foundWillMountName : '', foundWillReceivePropsName !== null ? '\n  ' + foundWillReceivePropsName : '', foundWillUpdateName !== null ? '\n  ' + foundWillUpdateName : '');
          }
        }
      }
    }

    workInProgress.memoizedState = state;

    var partialState = callGetDerivedStateFromProps(workInProgress, instance, props, state);

    if (partialState !== null && partialState !== undefined) {
      // Render-phase updates (like this) should not be added to the update queue,
      // So that multiple render passes do not enqueue multiple updates.
      // Instead, just synchronously merge the returned state into the instance.
      workInProgress.memoizedState = _assign({}, workInProgress.memoizedState, partialState);
    }

    // Cache unmasked context so we can avoid recreating masked context unless necessary.
    // ReactFiberContext usually updates this cache but can't for newly-created instances.
    if (needsContext) {
      cacheContext(workInProgress, unmaskedContext, context);
    }

    return instance;
  }

  function callComponentWillMount(workInProgress, instance) {
    startPhaseTimer(workInProgress, 'componentWillMount');
    var oldState = instance.state;

    if (typeof instance.componentWillMount === 'function') {
      instance.componentWillMount();
    }
    if (typeof instance.UNSAFE_componentWillMount === 'function') {
      instance.UNSAFE_componentWillMount();
    }

    stopPhaseTimer();

    if (oldState !== instance.state) {
      {
        warning(false, '%s.componentWillMount(): Assigning directly to this.state is ' + "deprecated (except inside a component's " + 'constructor). Use setState instead.', getComponentName(workInProgress) || 'Component');
      }
      updater.enqueueReplaceState(instance, instance.state, null);
    }
  }

  function callComponentWillReceiveProps(workInProgress, instance, newProps, newContext) {
    var oldState = instance.state;
    startPhaseTimer(workInProgress, 'componentWillReceiveProps');
    if (typeof instance.componentWillReceiveProps === 'function') {
      instance.componentWillReceiveProps(newProps, newContext);
    }
    if (typeof instance.UNSAFE_componentWillReceiveProps === 'function') {
      instance.UNSAFE_componentWillReceiveProps(newProps, newContext);
    }
    stopPhaseTimer();

    if (instance.state !== oldState) {
      {
        var componentName = getComponentName(workInProgress) || 'Component';
        if (!didWarnAboutStateAssignmentForComponent.has(componentName)) {
          didWarnAboutStateAssignmentForComponent.add(componentName);
          warning(false, '%s.componentWillReceiveProps(): Assigning directly to ' + "this.state is deprecated (except inside a component's " + 'constructor). Use setState instead.', componentName);
        }
      }
      updater.enqueueReplaceState(instance, instance.state, null);
    }
  }

  function callGetDerivedStateFromProps(workInProgress, instance, nextProps, prevState) {
    var type = workInProgress.type;


    if (typeof type.getDerivedStateFromProps === 'function') {
      if (debugRenderPhaseSideEffects || debugRenderPhaseSideEffectsForStrictMode && workInProgress.mode & StrictMode) {
        // Invoke method an extra time to help detect side-effects.
        type.getDerivedStateFromProps.call(null, nextProps, prevState);
      }

      var partialState = type.getDerivedStateFromProps.call(null, nextProps, prevState);

      {
        if (partialState === undefined) {
          var componentName = getComponentName(workInProgress) || 'Component';
          if (!didWarnAboutUndefinedDerivedState.has(componentName)) {
            didWarnAboutUndefinedDerivedState.add(componentName);
            warning(false, '%s.getDerivedStateFromProps(): A valid state object (or null) must be returned. ' + 'You have returned undefined.', componentName);
          }
        }
      }

      return partialState;
    }
  }

  // Invokes the mount life-cycles on a previously never rendered instance.
  function mountClassInstance(workInProgress, renderExpirationTime) {
    var ctor = workInProgress.type;
    var current = workInProgress.alternate;

    {
      checkClassInstance(workInProgress);
    }

    var instance = workInProgress.stateNode;
    var props = workInProgress.pendingProps;
    var unmaskedContext = getUnmaskedContext(workInProgress);

    instance.props = props;
    instance.state = workInProgress.memoizedState;
    instance.refs = emptyObject;
    instance.context = getMaskedContext(workInProgress, unmaskedContext);

    {
      if (workInProgress.mode & StrictMode) {
        ReactStrictModeWarnings.recordUnsafeLifecycleWarnings(workInProgress, instance);
      }

      if (warnAboutDeprecatedLifecycles) {
        ReactStrictModeWarnings.recordDeprecationWarnings(workInProgress, instance);
      }
    }

    // In order to support react-lifecycles-compat polyfilled components,
    // Unsafe lifecycles should not be invoked for components using the new APIs.
    if (typeof ctor.getDerivedStateFromProps !== 'function' && typeof instance.getSnapshotBeforeUpdate !== 'function' && (typeof instance.UNSAFE_componentWillMount === 'function' || typeof instance.componentWillMount === 'function')) {
      callComponentWillMount(workInProgress, instance);
      // If we had additional state updates during this life-cycle, let's
      // process them now.
      var updateQueue = workInProgress.updateQueue;
      if (updateQueue !== null) {
        instance.state = processUpdateQueue(current, workInProgress, updateQueue, instance, props, renderExpirationTime);
      }
    }
    if (typeof instance.componentDidMount === 'function') {
      workInProgress.effectTag |= Update;
    }
  }

  function resumeMountClassInstance(workInProgress, renderExpirationTime) {
    var ctor = workInProgress.type;
    var instance = workInProgress.stateNode;
    resetInputPointers(workInProgress, instance);

    var oldProps = workInProgress.memoizedProps;
    var newProps = workInProgress.pendingProps;
    var oldContext = instance.context;
    var newUnmaskedContext = getUnmaskedContext(workInProgress);
    var newContext = getMaskedContext(workInProgress, newUnmaskedContext);

    var hasNewLifecycles = typeof ctor.getDerivedStateFromProps === 'function' || typeof instance.getSnapshotBeforeUpdate === 'function';

    // Note: During these life-cycles, instance.props/instance.state are what
    // ever the previously attempted to render - not the "current". However,
    // during componentDidUpdate we pass the "current" props.

    // In order to support react-lifecycles-compat polyfilled components,
    // Unsafe lifecycles should not be invoked for components using the new APIs.
    if (!hasNewLifecycles && (typeof instance.UNSAFE_componentWillReceiveProps === 'function' || typeof instance.componentWillReceiveProps === 'function')) {
      if (oldProps !== newProps || oldContext !== newContext) {
        callComponentWillReceiveProps(workInProgress, instance, newProps, newContext);
      }
    }

    // Compute the next state using the memoized state and the update queue.
    var oldState = workInProgress.memoizedState;
    // TODO: Previous state can be null.
    var newState = void 0;
    var derivedStateFromCatch = void 0;
    if (workInProgress.updateQueue !== null) {
      newState = processUpdateQueue(null, workInProgress, workInProgress.updateQueue, instance, newProps, renderExpirationTime);

      var updateQueue = workInProgress.updateQueue;
      if (updateQueue !== null && updateQueue.capturedValues !== null && enableGetDerivedStateFromCatch && typeof ctor.getDerivedStateFromCatch === 'function') {
        var capturedValues = updateQueue.capturedValues;
        // Don't remove these from the update queue yet. We need them in
        // finishClassComponent. Do the reset there.
        // TODO: This is awkward. Refactor class components.
        // updateQueue.capturedValues = null;
        derivedStateFromCatch = callGetDerivedStateFromCatch(ctor, capturedValues);
      }
    } else {
      newState = oldState;
    }

    var derivedStateFromProps = void 0;
    if (oldProps !== newProps) {
      // The prevState parameter should be the partially updated state.
      // Otherwise, spreading state in return values could override updates.
      derivedStateFromProps = callGetDerivedStateFromProps(workInProgress, instance, newProps, newState);
    }

    if (derivedStateFromProps !== null && derivedStateFromProps !== undefined) {
      // Render-phase updates (like this) should not be added to the update queue,
      // So that multiple render passes do not enqueue multiple updates.
      // Instead, just synchronously merge the returned state into the instance.
      newState = newState === null || newState === undefined ? derivedStateFromProps : _assign({}, newState, derivedStateFromProps);

      // Update the base state of the update queue.
      // FIXME: This is getting ridiculous. Refactor plz!
      var _updateQueue = workInProgress.updateQueue;
      if (_updateQueue !== null) {
        _updateQueue.baseState = _assign({}, _updateQueue.baseState, derivedStateFromProps);
      }
    }
    if (derivedStateFromCatch !== null && derivedStateFromCatch !== undefined) {
      // Render-phase updates (like this) should not be added to the update queue,
      // So that multiple render passes do not enqueue multiple updates.
      // Instead, just synchronously merge the returned state into the instance.
      newState = newState === null || newState === undefined ? derivedStateFromCatch : _assign({}, newState, derivedStateFromCatch);

      // Update the base state of the update queue.
      // FIXME: This is getting ridiculous. Refactor plz!
      var _updateQueue2 = workInProgress.updateQueue;
      if (_updateQueue2 !== null) {
        _updateQueue2.baseState = _assign({}, _updateQueue2.baseState, derivedStateFromCatch);
      }
    }

    if (oldProps === newProps && oldState === newState && !hasContextChanged() && !(workInProgress.updateQueue !== null && workInProgress.updateQueue.hasForceUpdate)) {
      // If an update was already in progress, we should schedule an Update
      // effect even though we're bailing out, so that cWU/cDU are called.
      if (typeof instance.componentDidMount === 'function') {
        workInProgress.effectTag |= Update;
      }
      return false;
    }

    var shouldUpdate = checkShouldComponentUpdate(workInProgress, oldProps, newProps, oldState, newState, newContext);

    if (shouldUpdate) {
      // In order to support react-lifecycles-compat polyfilled components,
      // Unsafe lifecycles should not be invoked for components using the new APIs.
      if (!hasNewLifecycles && (typeof instance.UNSAFE_componentWillMount === 'function' || typeof instance.componentWillMount === 'function')) {
        startPhaseTimer(workInProgress, 'componentWillMount');
        if (typeof instance.componentWillMount === 'function') {
          instance.componentWillMount();
        }
        if (typeof instance.UNSAFE_componentWillMount === 'function') {
          instance.UNSAFE_componentWillMount();
        }
        stopPhaseTimer();
      }
      if (typeof instance.componentDidMount === 'function') {
        workInProgress.effectTag |= Update;
      }
    } else {
      // If an update was already in progress, we should schedule an Update
      // effect even though we're bailing out, so that cWU/cDU are called.
      if (typeof instance.componentDidMount === 'function') {
        workInProgress.effectTag |= Update;
      }

      // If shouldComponentUpdate returned false, we should still update the
      // memoized props/state to indicate that this work can be reused.
      memoizeProps(workInProgress, newProps);
      memoizeState(workInProgress, newState);
    }

    // Update the existing instance's state, props, and context pointers even
    // if shouldComponentUpdate returns false.
    instance.props = newProps;
    instance.state = newState;
    instance.context = newContext;

    return shouldUpdate;
  }

  // Invokes the update life-cycles and returns false if it shouldn't rerender.
  function updateClassInstance(current, workInProgress, renderExpirationTime) {
    var ctor = workInProgress.type;
    var instance = workInProgress.stateNode;
    resetInputPointers(workInProgress, instance);

    var oldProps = workInProgress.memoizedProps;
    var newProps = workInProgress.pendingProps;
    var oldContext = instance.context;
    var newUnmaskedContext = getUnmaskedContext(workInProgress);
    var newContext = getMaskedContext(workInProgress, newUnmaskedContext);

    var hasNewLifecycles = typeof ctor.getDerivedStateFromProps === 'function' || typeof instance.getSnapshotBeforeUpdate === 'function';

    // Note: During these life-cycles, instance.props/instance.state are what
    // ever the previously attempted to render - not the "current". However,
    // during componentDidUpdate we pass the "current" props.

    // In order to support react-lifecycles-compat polyfilled components,
    // Unsafe lifecycles should not be invoked for components using the new APIs.
    if (!hasNewLifecycles && (typeof instance.UNSAFE_componentWillReceiveProps === 'function' || typeof instance.componentWillReceiveProps === 'function')) {
      if (oldProps !== newProps || oldContext !== newContext) {
        callComponentWillReceiveProps(workInProgress, instance, newProps, newContext);
      }
    }

    // Compute the next state using the memoized state and the update queue.
    var oldState = workInProgress.memoizedState;
    // TODO: Previous state can be null.
    var newState = void 0;
    var derivedStateFromCatch = void 0;

    if (workInProgress.updateQueue !== null) {
      newState = processUpdateQueue(current, workInProgress, workInProgress.updateQueue, instance, newProps, renderExpirationTime);

      var updateQueue = workInProgress.updateQueue;
      if (updateQueue !== null && updateQueue.capturedValues !== null && enableGetDerivedStateFromCatch && typeof ctor.getDerivedStateFromCatch === 'function') {
        var capturedValues = updateQueue.capturedValues;
        // Don't remove these from the update queue yet. We need them in
        // finishClassComponent. Do the reset there.
        // TODO: This is awkward. Refactor class components.
        // updateQueue.capturedValues = null;
        derivedStateFromCatch = callGetDerivedStateFromCatch(ctor, capturedValues);
      }
    } else {
      newState = oldState;
    }

    var derivedStateFromProps = void 0;
    if (oldProps !== newProps) {
      // The prevState parameter should be the partially updated state.
      // Otherwise, spreading state in return values could override updates.
      derivedStateFromProps = callGetDerivedStateFromProps(workInProgress, instance, newProps, newState);
    }

    if (derivedStateFromProps !== null && derivedStateFromProps !== undefined) {
      // Render-phase updates (like this) should not be added to the update queue,
      // So that multiple render passes do not enqueue multiple updates.
      // Instead, just synchronously merge the returned state into the instance.
      newState = newState === null || newState === undefined ? derivedStateFromProps : _assign({}, newState, derivedStateFromProps);

      // Update the base state of the update queue.
      // FIXME: This is getting ridiculous. Refactor plz!
      var _updateQueue3 = workInProgress.updateQueue;
      if (_updateQueue3 !== null) {
        _updateQueue3.baseState = _assign({}, _updateQueue3.baseState, derivedStateFromProps);
      }
    }
    if (derivedStateFromCatch !== null && derivedStateFromCatch !== undefined) {
      // Render-phase updates (like this) should not be added to the update queue,
      // So that multiple render passes do not enqueue multiple updates.
      // Instead, just synchronously merge the returned state into the instance.
      newState = newState === null || newState === undefined ? derivedStateFromCatch : _assign({}, newState, derivedStateFromCatch);

      // Update the base state of the update queue.
      // FIXME: This is getting ridiculous. Refactor plz!
      var _updateQueue4 = workInProgress.updateQueue;
      if (_updateQueue4 !== null) {
        _updateQueue4.baseState = _assign({}, _updateQueue4.baseState, derivedStateFromCatch);
      }
    }

    if (oldProps === newProps && oldState === newState && !hasContextChanged() && !(workInProgress.updateQueue !== null && workInProgress.updateQueue.hasForceUpdate)) {
      // If an update was already in progress, we should schedule an Update
      // effect even though we're bailing out, so that cWU/cDU are called.
      if (typeof instance.componentDidUpdate === 'function') {
        if (oldProps !== current.memoizedProps || oldState !== current.memoizedState) {
          workInProgress.effectTag |= Update;
        }
      }
      if (typeof instance.getSnapshotBeforeUpdate === 'function') {
        if (oldProps !== current.memoizedProps || oldState !== current.memoizedState) {
          workInProgress.effectTag |= Snapshot;
        }
      }
      return false;
    }

    var shouldUpdate = checkShouldComponentUpdate(workInProgress, oldProps, newProps, oldState, newState, newContext);

    if (shouldUpdate) {
      // In order to support react-lifecycles-compat polyfilled components,
      // Unsafe lifecycles should not be invoked for components using the new APIs.
      if (!hasNewLifecycles && (typeof instance.UNSAFE_componentWillUpdate === 'function' || typeof instance.componentWillUpdate === 'function')) {
        startPhaseTimer(workInProgress, 'componentWillUpdate');
        if (typeof instance.componentWillUpdate === 'function') {
          instance.componentWillUpdate(newProps, newState, newContext);
        }
        if (typeof instance.UNSAFE_componentWillUpdate === 'function') {
          instance.UNSAFE_componentWillUpdate(newProps, newState, newContext);
        }
        stopPhaseTimer();
      }
      if (typeof instance.componentDidUpdate === 'function') {
        workInProgress.effectTag |= Update;
      }
      if (typeof instance.getSnapshotBeforeUpdate === 'function') {
        workInProgress.effectTag |= Snapshot;
      }
    } else {
      // If an update was already in progress, we should schedule an Update
      // effect even though we're bailing out, so that cWU/cDU are called.
      if (typeof instance.componentDidUpdate === 'function') {
        if (oldProps !== current.memoizedProps || oldState !== current.memoizedState) {
          workInProgress.effectTag |= Update;
        }
      }
      if (typeof instance.getSnapshotBeforeUpdate === 'function') {
        if (oldProps !== current.memoizedProps || oldState !== current.memoizedState) {
          workInProgress.effectTag |= Snapshot;
        }
      }

      // If shouldComponentUpdate returned false, we should still update the
      // memoized props/state to indicate that this work can be reused.
      memoizeProps(workInProgress, newProps);
      memoizeState(workInProgress, newState);
    }

    // Update the existing instance's state, props, and context pointers even
    // if shouldComponentUpdate returns false.
    instance.props = newProps;
    instance.state = newState;
    instance.context = newContext;

    return shouldUpdate;
  }

  return {
    adoptClassInstance: adoptClassInstance,
    callGetDerivedStateFromProps: callGetDerivedStateFromProps,
    constructClassInstance: constructClassInstance,
    mountClassInstance: mountClassInstance,
    resumeMountClassInstance: resumeMountClassInstance,
    updateClassInstance: updateClassInstance
  };
};

var getCurrentFiberStackAddendum$2 = ReactDebugCurrentFiber.getCurrentFiberStackAddendum;


var didWarnAboutMaps = void 0;
var didWarnAboutStringRefInStrictMode = void 0;
var ownerHasKeyUseWarning = void 0;
var ownerHasFunctionTypeWarning = void 0;
var warnForMissingKey = function (child) {};

{
  didWarnAboutMaps = false;
  didWarnAboutStringRefInStrictMode = {};

  /**
   * Warn if there's no key explicitly set on dynamic arrays of children or
   * object keys are not valid. This allows us to keep track of children between
   * updates.
   */
  ownerHasKeyUseWarning = {};
  ownerHasFunctionTypeWarning = {};

  warnForMissingKey = function (child) {
    if (child === null || typeof child !== 'object') {
      return;
    }
    if (!child._store || child._store.validated || child.key != null) {
      return;
    }
    !(typeof child._store === 'object') ? invariant(false, 'React Component in warnForMissingKey should have a _store. This error is likely caused by a bug in React. Please file an issue.') : void 0;
    child._store.validated = true;

    var currentComponentErrorInfo = 'Each child in an array or iterator should have a unique ' + '"key" prop. See https://fb.me/react-warning-keys for ' + 'more information.' + (getCurrentFiberStackAddendum$2() || '');
    if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
      return;
    }
    ownerHasKeyUseWarning[currentComponentErrorInfo] = true;

    warning(false, 'Each child in an array or iterator should have a unique ' + '"key" prop. See https://fb.me/react-warning-keys for ' + 'more information.%s', getCurrentFiberStackAddendum$2());
  };
}

var isArray$1 = Array.isArray;

function coerceRef(returnFiber, current, element) {
  var mixedRef = element.ref;
  if (mixedRef !== null && typeof mixedRef !== 'function' && typeof mixedRef !== 'object') {
    {
      if (returnFiber.mode & StrictMode) {
        var componentName = getComponentName(returnFiber) || 'Component';
        if (!didWarnAboutStringRefInStrictMode[componentName]) {
          warning(false, 'A string ref, "%s", has been found within a strict mode tree. ' + 'String refs are a source of potential bugs and should be avoided. ' + 'We recommend using createRef() instead.' + '\n%s' + '\n\nLearn more about using refs safely here:' + '\nhttps://fb.me/react-strict-mode-string-ref', mixedRef, getStackAddendumByWorkInProgressFiber(returnFiber));
          didWarnAboutStringRefInStrictMode[componentName] = true;
        }
      }
    }

    if (element._owner) {
      var owner = element._owner;
      var inst = void 0;
      if (owner) {
        var ownerFiber = owner;
        !(ownerFiber.tag === ClassComponent) ? invariant(false, 'Stateless function components cannot have refs.') : void 0;
        inst = ownerFiber.stateNode;
      }
      !inst ? invariant(false, 'Missing owner for string ref %s. This error is likely caused by a bug in React. Please file an issue.', mixedRef) : void 0;
      var stringRef = '' + mixedRef;
      // Check if previous string ref matches new string ref
      if (current !== null && current.ref !== null && current.ref._stringRef === stringRef) {
        return current.ref;
      }
      var ref = function (value) {
        var refs = inst.refs === emptyObject ? inst.refs = {} : inst.refs;
        if (value === null) {
          delete refs[stringRef];
        } else {
          refs[stringRef] = value;
        }
      };
      ref._stringRef = stringRef;
      return ref;
    } else {
      !(typeof mixedRef === 'string') ? invariant(false, 'Expected ref to be a function or a string.') : void 0;
      !element._owner ? invariant(false, 'Element ref was specified as a string (%s) but no owner was set. This could happen for one of the following reasons:\n1. You may be adding a ref to a functional component\n2. You may be adding a ref to a component that was not created inside a component\'s render method\n3. You have multiple copies of React loaded\nSee https://fb.me/react-refs-must-have-owner for more information.', mixedRef) : void 0;
    }
  }
  return mixedRef;
}

function throwOnInvalidObjectType(returnFiber, newChild) {
  if (returnFiber.type !== 'textarea') {
    var addendum = '';
    {
      addendum = ' If you meant to render a collection of children, use an array ' + 'instead.' + (getCurrentFiberStackAddendum$2() || '');
    }
    invariant(false, 'Objects are not valid as a React child (found: %s).%s', Object.prototype.toString.call(newChild) === '[object Object]' ? 'object with keys {' + Object.keys(newChild).join(', ') + '}' : newChild, addendum);
  }
}

function warnOnFunctionType() {
  var currentComponentErrorInfo = 'Functions are not valid as a React child. This may happen if ' + 'you return a Component instead of <Component /> from render. ' + 'Or maybe you meant to call this function rather than return it.' + (getCurrentFiberStackAddendum$2() || '');

  if (ownerHasFunctionTypeWarning[currentComponentErrorInfo]) {
    return;
  }
  ownerHasFunctionTypeWarning[currentComponentErrorInfo] = true;

  warning(false, 'Functions are not valid as a React child. This may happen if ' + 'you return a Component instead of <Component /> from render. ' + 'Or maybe you meant to call this function rather than return it.%s', getCurrentFiberStackAddendum$2() || '');
}

// This wrapper function exists because I expect to clone the code in each path
// to be able to optimize each path individually by branching early. This needs
// a compiler or we can do it manually. Helpers that don't need this branching
// live outside of this function.
function ChildReconciler(shouldTrackSideEffects) {
  function deleteChild(returnFiber, childToDelete) {
    if (!shouldTrackSideEffects) {
      // Noop.
      return;
    }
    // Deletions are added in reversed order so we add it to the front.
    // At this point, the return fiber's effect list is empty except for
    // deletions, so we can just append the deletion to the list. The remaining
    // effects aren't added until the complete phase. Once we implement
    // resuming, this may not be true.
    var last = returnFiber.lastEffect;
    if (last !== null) {
      last.nextEffect = childToDelete;
      returnFiber.lastEffect = childToDelete;
    } else {
      returnFiber.firstEffect = returnFiber.lastEffect = childToDelete;
    }
    childToDelete.nextEffect = null;
    childToDelete.effectTag = Deletion;
  }

  function deleteRemainingChildren(returnFiber, currentFirstChild) {
    if (!shouldTrackSideEffects) {
      // Noop.
      return null;
    }

    // TODO: For the shouldClone case, this could be micro-optimized a bit by
    // assuming that after the first child we've already added everything.
    var childToDelete = currentFirstChild;
    while (childToDelete !== null) {
      deleteChild(returnFiber, childToDelete);
      childToDelete = childToDelete.sibling;
    }
    return null;
  }

  function mapRemainingChildren(returnFiber, currentFirstChild) {
    // Add the remaining children to a temporary map so that we can find them by
    // keys quickly. Implicit (null) keys get added to this set with their index
    var existingChildren = new Map();

    var existingChild = currentFirstChild;
    while (existingChild !== null) {
      if (existingChild.key !== null) {
        existingChildren.set(existingChild.key, existingChild);
      } else {
        existingChildren.set(existingChild.index, existingChild);
      }
      existingChild = existingChild.sibling;
    }
    return existingChildren;
  }

  function useFiber(fiber, pendingProps, expirationTime) {
    // We currently set sibling to null and index to 0 here because it is easy
    // to forget to do before returning it. E.g. for the single child case.
    var clone = createWorkInProgress(fiber, pendingProps, expirationTime);
    clone.index = 0;
    clone.sibling = null;
    return clone;
  }

  function placeChild(newFiber, lastPlacedIndex, newIndex) {
    newFiber.index = newIndex;
    if (!shouldTrackSideEffects) {
      // Noop.
      return lastPlacedIndex;
    }
    var current = newFiber.alternate;
    if (current !== null) {
      var oldIndex = current.index;
      if (oldIndex < lastPlacedIndex) {
        // This is a move.
        newFiber.effectTag = Placement;
        return lastPlacedIndex;
      } else {
        // This item can stay in place.
        return oldIndex;
      }
    } else {
      // This is an insertion.
      newFiber.effectTag = Placement;
      return lastPlacedIndex;
    }
  }

  function placeSingleChild(newFiber) {
    // This is simpler for the single child case. We only need to do a
    // placement for inserting new children.
    if (shouldTrackSideEffects && newFiber.alternate === null) {
      newFiber.effectTag = Placement;
    }
    return newFiber;
  }

  function updateTextNode(returnFiber, current, textContent, expirationTime) {
    if (current === null || current.tag !== HostText) {
      // Insert
      var created = createFiberFromText(textContent, returnFiber.mode, expirationTime);
      created['return'] = returnFiber;
      return created;
    } else {
      // Update
      var existing = useFiber(current, textContent, expirationTime);
      existing['return'] = returnFiber;
      return existing;
    }
  }

  function updateElement(returnFiber, current, element, expirationTime) {
    if (current !== null && current.type === element.type) {
      // Move based on index
      var existing = useFiber(current, element.props, expirationTime);
      existing.ref = coerceRef(returnFiber, current, element);
      existing['return'] = returnFiber;
      {
        existing._debugSource = element._source;
        existing._debugOwner = element._owner;
      }
      return existing;
    } else {
      // Insert
      var created = createFiberFromElement(element, returnFiber.mode, expirationTime);
      created.ref = coerceRef(returnFiber, current, element);
      created['return'] = returnFiber;
      return created;
    }
  }

  function updatePortal(returnFiber, current, portal, expirationTime) {
    if (current === null || current.tag !== HostPortal || current.stateNode.containerInfo !== portal.containerInfo || current.stateNode.implementation !== portal.implementation) {
      // Insert
      var created = createFiberFromPortal(portal, returnFiber.mode, expirationTime);
      created['return'] = returnFiber;
      return created;
    } else {
      // Update
      var existing = useFiber(current, portal.children || [], expirationTime);
      existing['return'] = returnFiber;
      return existing;
    }
  }

  function updateFragment(returnFiber, current, fragment, expirationTime, key) {
    if (current === null || current.tag !== Fragment) {
      // Insert
      var created = createFiberFromFragment(fragment, returnFiber.mode, expirationTime, key);
      created['return'] = returnFiber;
      return created;
    } else {
      // Update
      var existing = useFiber(current, fragment, expirationTime);
      existing['return'] = returnFiber;
      return existing;
    }
  }

  function createChild(returnFiber, newChild, expirationTime) {
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      // Text nodes don't have keys. If the previous node is implicitly keyed
      // we can continue to replace it without aborting even if it is not a text
      // node.
      var created = createFiberFromText('' + newChild, returnFiber.mode, expirationTime);
      created['return'] = returnFiber;
      return created;
    }

    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          {
            var _created = createFiberFromElement(newChild, returnFiber.mode, expirationTime);
            _created.ref = coerceRef(returnFiber, null, newChild);
            _created['return'] = returnFiber;
            return _created;
          }
        case REACT_PORTAL_TYPE:
          {
            var _created2 = createFiberFromPortal(newChild, returnFiber.mode, expirationTime);
            _created2['return'] = returnFiber;
            return _created2;
          }
      }

      if (isArray$1(newChild) || getIteratorFn(newChild)) {
        var _created3 = createFiberFromFragment(newChild, returnFiber.mode, expirationTime, null);
        _created3['return'] = returnFiber;
        return _created3;
      }

      throwOnInvalidObjectType(returnFiber, newChild);
    }

    {
      if (typeof newChild === 'function') {
        warnOnFunctionType();
      }
    }

    return null;
  }

  function updateSlot(returnFiber, oldFiber, newChild, expirationTime) {
    // Update the fiber if the keys match, otherwise return null.

    var key = oldFiber !== null ? oldFiber.key : null;

    if (typeof newChild === 'string' || typeof newChild === 'number') {
      // Text nodes don't have keys. If the previous node is implicitly keyed
      // we can continue to replace it without aborting even if it is not a text
      // node.
      if (key !== null) {
        return null;
      }
      return updateTextNode(returnFiber, oldFiber, '' + newChild, expirationTime);
    }

    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          {
            if (newChild.key === key) {
              if (newChild.type === REACT_FRAGMENT_TYPE) {
                return updateFragment(returnFiber, oldFiber, newChild.props.children, expirationTime, key);
              }
              return updateElement(returnFiber, oldFiber, newChild, expirationTime);
            } else {
              return null;
            }
          }
        case REACT_PORTAL_TYPE:
          {
            if (newChild.key === key) {
              return updatePortal(returnFiber, oldFiber, newChild, expirationTime);
            } else {
              return null;
            }
          }
      }

      if (isArray$1(newChild) || getIteratorFn(newChild)) {
        if (key !== null) {
          return null;
        }

        return updateFragment(returnFiber, oldFiber, newChild, expirationTime, null);
      }

      throwOnInvalidObjectType(returnFiber, newChild);
    }

    {
      if (typeof newChild === 'function') {
        warnOnFunctionType();
      }
    }

    return null;
  }

  function updateFromMap(existingChildren, returnFiber, newIdx, newChild, expirationTime) {
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      // Text nodes don't have keys, so we neither have to check the old nor
      // new node for the key. If both are text nodes, they match.
      var matchedFiber = existingChildren.get(newIdx) || null;
      return updateTextNode(returnFiber, matchedFiber, '' + newChild, expirationTime);
    }

    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          {
            var _matchedFiber = existingChildren.get(newChild.key === null ? newIdx : newChild.key) || null;
            if (newChild.type === REACT_FRAGMENT_TYPE) {
              return updateFragment(returnFiber, _matchedFiber, newChild.props.children, expirationTime, newChild.key);
            }
            return updateElement(returnFiber, _matchedFiber, newChild, expirationTime);
          }
        case REACT_PORTAL_TYPE:
          {
            var _matchedFiber2 = existingChildren.get(newChild.key === null ? newIdx : newChild.key) || null;
            return updatePortal(returnFiber, _matchedFiber2, newChild, expirationTime);
          }
      }

      if (isArray$1(newChild) || getIteratorFn(newChild)) {
        var _matchedFiber3 = existingChildren.get(newIdx) || null;
        return updateFragment(returnFiber, _matchedFiber3, newChild, expirationTime, null);
      }

      throwOnInvalidObjectType(returnFiber, newChild);
    }

    {
      if (typeof newChild === 'function') {
        warnOnFunctionType();
      }
    }

    return null;
  }

  /**
   * Warns if there is a duplicate or missing key
   */
  function warnOnInvalidKey(child, knownKeys) {
    {
      if (typeof child !== 'object' || child === null) {
        return knownKeys;
      }
      switch (child.$$typeof) {
        case REACT_ELEMENT_TYPE:
        case REACT_PORTAL_TYPE:
          warnForMissingKey(child);
          var key = child.key;
          if (typeof key !== 'string') {
            break;
          }
          if (knownKeys === null) {
            knownKeys = new Set();
            knownKeys.add(key);
            break;
          }
          if (!knownKeys.has(key)) {
            knownKeys.add(key);
            break;
          }
          warning(false, 'Encountered two children with the same key, `%s`. ' + 'Keys should be unique so that components maintain their identity ' + 'across updates. Non-unique keys may cause children to be ' + 'duplicated and/or omitted — the behavior is unsupported and ' + 'could change in a future version.%s', key, getCurrentFiberStackAddendum$2());
          break;
        default:
          break;
      }
    }
    return knownKeys;
  }

  function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, expirationTime) {
    // This algorithm can't optimize by searching from boths ends since we
    // don't have backpointers on fibers. I'm trying to see how far we can get
    // with that model. If it ends up not being worth the tradeoffs, we can
    // add it later.

    // Even with a two ended optimization, we'd want to optimize for the case
    // where there are few changes and brute force the comparison instead of
    // going for the Map. It'd like to explore hitting that path first in
    // forward-only mode and only go for the Map once we notice that we need
    // lots of look ahead. This doesn't handle reversal as well as two ended
    // search but that's unusual. Besides, for the two ended optimization to
    // work on Iterables, we'd need to copy the whole set.

    // In this first iteration, we'll just live with hitting the bad case
    // (adding everything to a Map) in for every insert/move.

    // If you change this code, also update reconcileChildrenIterator() which
    // uses the same algorithm.

    {
      // First, validate keys.
      var knownKeys = null;
      for (var i = 0; i < newChildren.length; i++) {
        var child = newChildren[i];
        knownKeys = warnOnInvalidKey(child, knownKeys);
      }
    }

    var resultingFirstChild = null;
    var previousNewFiber = null;

    var oldFiber = currentFirstChild;
    var lastPlacedIndex = 0;
    var newIdx = 0;
    var nextOldFiber = null;
    for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
      if (oldFiber.index > newIdx) {
        nextOldFiber = oldFiber;
        oldFiber = null;
      } else {
        nextOldFiber = oldFiber.sibling;
      }
      var newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx], expirationTime);
      if (newFiber === null) {
        // TODO: This breaks on empty slots like null children. That's
        // unfortunate because it triggers the slow path all the time. We need
        // a better way to communicate whether this was a miss or null,
        // boolean, undefined, etc.
        if (oldFiber === null) {
          oldFiber = nextOldFiber;
        }
        break;
      }
      if (shouldTrackSideEffects) {
        if (oldFiber && newFiber.alternate === null) {
          // We matched the slot, but we didn't reuse the existing fiber, so we
          // need to delete the existing child.
          deleteChild(returnFiber, oldFiber);
        }
      }
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      if (previousNewFiber === null) {
        // TODO: Move out of the loop. This only happens for the first run.
        resultingFirstChild = newFiber;
      } else {
        // TODO: Defer siblings if we're not at the right index for this slot.
        // I.e. if we had null values before, then we want to defer this
        // for each null value. However, we also don't want to call updateSlot
        // with the previous one.
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
      oldFiber = nextOldFiber;
    }

    if (newIdx === newChildren.length) {
      // We've reached the end of the new children. We can delete the rest.
      deleteRemainingChildren(returnFiber, oldFiber);
      return resultingFirstChild;
    }

    if (oldFiber === null) {
      // If we don't have any more existing children we can choose a fast path
      // since the rest will all be insertions.
      for (; newIdx < newChildren.length; newIdx++) {
        var _newFiber = createChild(returnFiber, newChildren[newIdx], expirationTime);
        if (!_newFiber) {
          continue;
        }
        lastPlacedIndex = placeChild(_newFiber, lastPlacedIndex, newIdx);
        if (previousNewFiber === null) {
          // TODO: Move out of the loop. This only happens for the first run.
          resultingFirstChild = _newFiber;
        } else {
          previousNewFiber.sibling = _newFiber;
        }
        previousNewFiber = _newFiber;
      }
      return resultingFirstChild;
    }

    // Add all children to a key map for quick lookups.
    var existingChildren = mapRemainingChildren(returnFiber, oldFiber);

    // Keep scanning and use the map to restore deleted items as moves.
    for (; newIdx < newChildren.length; newIdx++) {
      var _newFiber2 = updateFromMap(existingChildren, returnFiber, newIdx, newChildren[newIdx], expirationTime);
      if (_newFiber2) {
        if (shouldTrackSideEffects) {
          if (_newFiber2.alternate !== null) {
            // The new fiber is a work in progress, but if there exists a
            // current, that means that we reused the fiber. We need to delete
            // it from the child list so that we don't add it to the deletion
            // list.
            existingChildren['delete'](_newFiber2.key === null ? newIdx : _newFiber2.key);
          }
        }
        lastPlacedIndex = placeChild(_newFiber2, lastPlacedIndex, newIdx);
        if (previousNewFiber === null) {
          resultingFirstChild = _newFiber2;
        } else {
          previousNewFiber.sibling = _newFiber2;
        }
        previousNewFiber = _newFiber2;
      }
    }

    if (shouldTrackSideEffects) {
      // Any existing children that weren't consumed above were deleted. We need
      // to add them to the deletion list.
      existingChildren.forEach(function (child) {
        return deleteChild(returnFiber, child);
      });
    }

    return resultingFirstChild;
  }

  function reconcileChildrenIterator(returnFiber, currentFirstChild, newChildrenIterable, expirationTime) {
    // This is the same implementation as reconcileChildrenArray(),
    // but using the iterator instead.

    var iteratorFn = getIteratorFn(newChildrenIterable);
    !(typeof iteratorFn === 'function') ? invariant(false, 'An object is not an iterable. This error is likely caused by a bug in React. Please file an issue.') : void 0;

    {
      // Warn about using Maps as children
      if (typeof newChildrenIterable.entries === 'function') {
        var possibleMap = newChildrenIterable;
        if (possibleMap.entries === iteratorFn) {
          !didWarnAboutMaps ? warning(false, 'Using Maps as children is unsupported and will likely yield ' + 'unexpected results. Convert it to a sequence/iterable of keyed ' + 'ReactElements instead.%s', getCurrentFiberStackAddendum$2()) : void 0;
          didWarnAboutMaps = true;
        }
      }

      // First, validate keys.
      // We'll get a different iterator later for the main pass.
      var _newChildren = iteratorFn.call(newChildrenIterable);
      if (_newChildren) {
        var knownKeys = null;
        var _step = _newChildren.next();
        for (; !_step.done; _step = _newChildren.next()) {
          var child = _step.value;
          knownKeys = warnOnInvalidKey(child, knownKeys);
        }
      }
    }

    var newChildren = iteratorFn.call(newChildrenIterable);
    !(newChildren != null) ? invariant(false, 'An iterable object provided no iterator.') : void 0;

    var resultingFirstChild = null;
    var previousNewFiber = null;

    var oldFiber = currentFirstChild;
    var lastPlacedIndex = 0;
    var newIdx = 0;
    var nextOldFiber = null;

    var step = newChildren.next();
    for (; oldFiber !== null && !step.done; newIdx++, step = newChildren.next()) {
      if (oldFiber.index > newIdx) {
        nextOldFiber = oldFiber;
        oldFiber = null;
      } else {
        nextOldFiber = oldFiber.sibling;
      }
      var newFiber = updateSlot(returnFiber, oldFiber, step.value, expirationTime);
      if (newFiber === null) {
        // TODO: This breaks on empty slots like null children. That's
        // unfortunate because it triggers the slow path all the time. We need
        // a better way to communicate whether this was a miss or null,
        // boolean, undefined, etc.
        if (!oldFiber) {
          oldFiber = nextOldFiber;
        }
        break;
      }
      if (shouldTrackSideEffects) {
        if (oldFiber && newFiber.alternate === null) {
          // We matched the slot, but we didn't reuse the existing fiber, so we
          // need to delete the existing child.
          deleteChild(returnFiber, oldFiber);
        }
      }
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      if (previousNewFiber === null) {
        // TODO: Move out of the loop. This only happens for the first run.
        resultingFirstChild = newFiber;
      } else {
        // TODO: Defer siblings if we're not at the right index for this slot.
        // I.e. if we had null values before, then we want to defer this
        // for each null value. However, we also don't want to call updateSlot
        // with the previous one.
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
      oldFiber = nextOldFiber;
    }

    if (step.done) {
      // We've reached the end of the new children. We can delete the rest.
      deleteRemainingChildren(returnFiber, oldFiber);
      return resultingFirstChild;
    }

    if (oldFiber === null) {
      // If we don't have any more existing children we can choose a fast path
      // since the rest will all be insertions.
      for (; !step.done; newIdx++, step = newChildren.next()) {
        var _newFiber3 = createChild(returnFiber, step.value, expirationTime);
        if (_newFiber3 === null) {
          continue;
        }
        lastPlacedIndex = placeChild(_newFiber3, lastPlacedIndex, newIdx);
        if (previousNewFiber === null) {
          // TODO: Move out of the loop. This only happens for the first run.
          resultingFirstChild = _newFiber3;
        } else {
          previousNewFiber.sibling = _newFiber3;
        }
        previousNewFiber = _newFiber3;
      }
      return resultingFirstChild;
    }

    // Add all children to a key map for quick lookups.
    var existingChildren = mapRemainingChildren(returnFiber, oldFiber);

    // Keep scanning and use the map to restore deleted items as moves.
    for (; !step.done; newIdx++, step = newChildren.next()) {
      var _newFiber4 = updateFromMap(existingChildren, returnFiber, newIdx, step.value, expirationTime);
      if (_newFiber4 !== null) {
        if (shouldTrackSideEffects) {
          if (_newFiber4.alternate !== null) {
            // The new fiber is a work in progress, but if there exists a
            // current, that means that we reused the fiber. We need to delete
            // it from the child list so that we don't add it to the deletion
            // list.
            existingChildren['delete'](_newFiber4.key === null ? newIdx : _newFiber4.key);
          }
        }
        lastPlacedIndex = placeChild(_newFiber4, lastPlacedIndex, newIdx);
        if (previousNewFiber === null) {
          resultingFirstChild = _newFiber4;
        } else {
          previousNewFiber.sibling = _newFiber4;
        }
        previousNewFiber = _newFiber4;
      }
    }

    if (shouldTrackSideEffects) {
      // Any existing children that weren't consumed above were deleted. We need
      // to add them to the deletion list.
      existingChildren.forEach(function (child) {
        return deleteChild(returnFiber, child);
      });
    }

    return resultingFirstChild;
  }

  function reconcileSingleTextNode(returnFiber, currentFirstChild, textContent, expirationTime) {
    // There's no need to check for keys on text nodes since we don't have a
    // way to define them.
    if (currentFirstChild !== null && currentFirstChild.tag === HostText) {
      // We already have an existing node so let's just update it and delete
      // the rest.
      deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
      var existing = useFiber(currentFirstChild, textContent, expirationTime);
      existing['return'] = returnFiber;
      return existing;
    }
    // The existing first child is not a text node so we need to create one
    // and delete the existing ones.
    deleteRemainingChildren(returnFiber, currentFirstChild);
    var created = createFiberFromText(textContent, returnFiber.mode, expirationTime);
    created['return'] = returnFiber;
    return created;
  }

  function reconcileSingleElement(returnFiber, currentFirstChild, element, expirationTime) {
    var key = element.key;
    var child = currentFirstChild;
    while (child !== null) {
      // TODO: If key === null and child.key === null, then this only applies to
      // the first item in the list.
      if (child.key === key) {
        if (child.tag === Fragment ? element.type === REACT_FRAGMENT_TYPE : child.type === element.type) {
          deleteRemainingChildren(returnFiber, child.sibling);
          var existing = useFiber(child, element.type === REACT_FRAGMENT_TYPE ? element.props.children : element.props, expirationTime);
          existing.ref = coerceRef(returnFiber, child, element);
          existing['return'] = returnFiber;
          {
            existing._debugSource = element._source;
            existing._debugOwner = element._owner;
          }
          return existing;
        } else {
          deleteRemainingChildren(returnFiber, child);
          break;
        }
      } else {
        deleteChild(returnFiber, child);
      }
      child = child.sibling;
    }

    if (element.type === REACT_FRAGMENT_TYPE) {
      var created = createFiberFromFragment(element.props.children, returnFiber.mode, expirationTime, element.key);
      created['return'] = returnFiber;
      return created;
    } else {
      var _created4 = createFiberFromElement(element, returnFiber.mode, expirationTime);
      _created4.ref = coerceRef(returnFiber, currentFirstChild, element);
      _created4['return'] = returnFiber;
      return _created4;
    }
  }

  function reconcileSinglePortal(returnFiber, currentFirstChild, portal, expirationTime) {
    var key = portal.key;
    var child = currentFirstChild;
    while (child !== null) {
      // TODO: If key === null and child.key === null, then this only applies to
      // the first item in the list.
      if (child.key === key) {
        if (child.tag === HostPortal && child.stateNode.containerInfo === portal.containerInfo && child.stateNode.implementation === portal.implementation) {
          deleteRemainingChildren(returnFiber, child.sibling);
          var existing = useFiber(child, portal.children || [], expirationTime);
          existing['return'] = returnFiber;
          return existing;
        } else {
          deleteRemainingChildren(returnFiber, child);
          break;
        }
      } else {
        deleteChild(returnFiber, child);
      }
      child = child.sibling;
    }

    var created = createFiberFromPortal(portal, returnFiber.mode, expirationTime);
    created['return'] = returnFiber;
    return created;
  }

  // This API will tag the children with the side-effect of the reconciliation
  // itself. They will be added to the side-effect list as we pass through the
  // children and the parent.
  function reconcileChildFibers(returnFiber, currentFirstChild, newChild, expirationTime) {
    // This function is not recursive.
    // If the top level item is an array, we treat it as a set of children,
    // not as a fragment. Nested arrays on the other hand will be treated as
    // fragment nodes. Recursion happens at the normal flow.

    // Handle top level unkeyed fragments as if they were arrays.
    // This leads to an ambiguity between <>{[...]}</> and <>...</>.
    // We treat the ambiguous cases above the same.
    if (typeof newChild === 'object' && newChild !== null && newChild.type === REACT_FRAGMENT_TYPE && newChild.key === null) {
      newChild = newChild.props.children;
    }

    // Handle object types
    var isObject = typeof newChild === 'object' && newChild !== null;

    if (isObject) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(reconcileSingleElement(returnFiber, currentFirstChild, newChild, expirationTime));
        case REACT_PORTAL_TYPE:
          return placeSingleChild(reconcileSinglePortal(returnFiber, currentFirstChild, newChild, expirationTime));
      }
    }

    if (typeof newChild === 'string' || typeof newChild === 'number') {
      return placeSingleChild(reconcileSingleTextNode(returnFiber, currentFirstChild, '' + newChild, expirationTime));
    }

    if (isArray$1(newChild)) {
      return reconcileChildrenArray(returnFiber, currentFirstChild, newChild, expirationTime);
    }

    if (getIteratorFn(newChild)) {
      return reconcileChildrenIterator(returnFiber, currentFirstChild, newChild, expirationTime);
    }

    if (isObject) {
      throwOnInvalidObjectType(returnFiber, newChild);
    }

    {
      if (typeof newChild === 'function') {
        warnOnFunctionType();
      }
    }
    if (typeof newChild === 'undefined') {
      // If the new child is undefined, and the return fiber is a composite
      // component, throw an error. If Fiber return types are disabled,
      // we already threw above.
      switch (returnFiber.tag) {
        case ClassComponent:
          {
            {
              var instance = returnFiber.stateNode;
              if (instance.render._isMockFunction) {
                // We allow auto-mocks to proceed as if they're returning null.
                break;
              }
            }
          }
        // Intentionally fall through to the next case, which handles both
        // functions and classes
        // eslint-disable-next-lined no-fallthrough
        case FunctionalComponent:
          {
            var Component = returnFiber.type;
            invariant(false, '%s(...): Nothing was returned from render. This usually means a return statement is missing. Or, to render nothing, return null.', Component.displayName || Component.name || 'Component');
          }
      }
    }

    // Remaining cases are all treated as empty.
    return deleteRemainingChildren(returnFiber, currentFirstChild);
  }

  return reconcileChildFibers;
}

var reconcileChildFibers = ChildReconciler(true);
var mountChildFibers = ChildReconciler(false);

function cloneChildFibers(current, workInProgress) {
  !(current === null || workInProgress.child === current.child) ? invariant(false, 'Resuming work not yet implemented.') : void 0;

  if (workInProgress.child === null) {
    return;
  }

  var currentChild = workInProgress.child;
  var newChild = createWorkInProgress(currentChild, currentChild.pendingProps, currentChild.expirationTime);
  workInProgress.child = newChild;

  newChild['return'] = workInProgress;
  while (currentChild.sibling !== null) {
    currentChild = currentChild.sibling;
    newChild = newChild.sibling = createWorkInProgress(currentChild, currentChild.pendingProps, currentChild.expirationTime);
    newChild['return'] = workInProgress;
  }
  newChild.sibling = null;
}

var didWarnAboutBadClass = void 0;
var didWarnAboutGetDerivedStateOnFunctionalComponent = void 0;
var didWarnAboutStatelessRefs = void 0;

{
  didWarnAboutBadClass = {};
  didWarnAboutGetDerivedStateOnFunctionalComponent = {};
  didWarnAboutStatelessRefs = {};
}

var ReactFiberBeginWork = function (config, hostContext, legacyContext, newContext, hydrationContext, scheduleWork, computeExpirationForFiber) {
  var shouldSetTextContent = config.shouldSetTextContent,
      shouldDeprioritizeSubtree = config.shouldDeprioritizeSubtree;
  var pushHostContext = hostContext.pushHostContext,
      pushHostContainer = hostContext.pushHostContainer;
  var pushProvider = newContext.pushProvider;
  var getMaskedContext = legacyContext.getMaskedContext,
      getUnmaskedContext = legacyContext.getUnmaskedContext,
      hasLegacyContextChanged = legacyContext.hasContextChanged,
      pushLegacyContextProvider = legacyContext.pushContextProvider,
      pushTopLevelContextObject = legacyContext.pushTopLevelContextObject,
      invalidateContextProvider = legacyContext.invalidateContextProvider;
  var enterHydrationState = hydrationContext.enterHydrationState,
      resetHydrationState = hydrationContext.resetHydrationState,
      tryToClaimNextHydratableInstance = hydrationContext.tryToClaimNextHydratableInstance;

  var _ReactFiberClassCompo = ReactFiberClassComponent(legacyContext, scheduleWork, computeExpirationForFiber, memoizeProps, memoizeState),
      adoptClassInstance = _ReactFiberClassCompo.adoptClassInstance,
      callGetDerivedStateFromProps = _ReactFiberClassCompo.callGetDerivedStateFromProps,
      constructClassInstance = _ReactFiberClassCompo.constructClassInstance,
      mountClassInstance = _ReactFiberClassCompo.mountClassInstance,
      resumeMountClassInstance = _ReactFiberClassCompo.resumeMountClassInstance,
      updateClassInstance = _ReactFiberClassCompo.updateClassInstance;

  // TODO: Remove this and use reconcileChildrenAtExpirationTime directly.


  function reconcileChildren(current, workInProgress, nextChildren) {
    reconcileChildrenAtExpirationTime(current, workInProgress, nextChildren, workInProgress.expirationTime);
  }

  function reconcileChildrenAtExpirationTime(current, workInProgress, nextChildren, renderExpirationTime) {
    if (current === null) {
      // If this is a fresh new component that hasn't been rendered yet, we
      // won't update its child set by applying minimal side-effects. Instead,
      // we will add them all to the child before it gets rendered. That means
      // we can optimize this reconciliation pass by not tracking side-effects.
      workInProgress.child = mountChildFibers(workInProgress, null, nextChildren, renderExpirationTime);
    } else {
      // If the current child is the same as the work in progress, it means that
      // we haven't yet started any work on these children. Therefore, we use
      // the clone algorithm to create a copy of all the current children.

      // If we had any progressed work already, that is invalid at this point so
      // let's throw it out.
      workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren, renderExpirationTime);
    }
  }

  function updateForwardRef(current, workInProgress) {
    var render = workInProgress.type.render;
    var nextChildren = render(workInProgress.pendingProps, workInProgress.ref);
    reconcileChildren(current, workInProgress, nextChildren);
    memoizeProps(workInProgress, nextChildren);
    return workInProgress.child;
  }

  function updateFragment(current, workInProgress) {
    var nextChildren = workInProgress.pendingProps;
    if (hasLegacyContextChanged()) {
      // Normally we can bail out on props equality but if context has changed
      // we don't do the bailout and we have to reuse existing props instead.
    } else if (workInProgress.memoizedProps === nextChildren) {
      return bailoutOnAlreadyFinishedWork(current, workInProgress);
    }
    reconcileChildren(current, workInProgress, nextChildren);
    memoizeProps(workInProgress, nextChildren);
    return workInProgress.child;
  }

  function updateMode(current, workInProgress) {
    var nextChildren = workInProgress.pendingProps.children;
    if (hasLegacyContextChanged()) {
      // Normally we can bail out on props equality but if context has changed
      // we don't do the bailout and we have to reuse existing props instead.
    } else if (nextChildren === null || workInProgress.memoizedProps === nextChildren) {
      return bailoutOnAlreadyFinishedWork(current, workInProgress);
    }
    reconcileChildren(current, workInProgress, nextChildren);
    memoizeProps(workInProgress, nextChildren);
    return workInProgress.child;
  }

  function markRef(current, workInProgress) {
    var ref = workInProgress.ref;
    if (current === null && ref !== null || current !== null && current.ref !== ref) {
      // Schedule a Ref effect
      workInProgress.effectTag |= Ref;
    }
  }

  function updateFunctionalComponent(current, workInProgress) {
    var fn = workInProgress.type;
    var nextProps = workInProgress.pendingProps;

    if (hasLegacyContextChanged()) {
      // Normally we can bail out on props equality but if context has changed
      // we don't do the bailout and we have to reuse existing props instead.
    } else {
      if (workInProgress.memoizedProps === nextProps) {
        return bailoutOnAlreadyFinishedWork(current, workInProgress);
      }
      // TODO: consider bringing fn.shouldComponentUpdate() back.
      // It used to be here.
    }

    var unmaskedContext = getUnmaskedContext(workInProgress);
    var context = getMaskedContext(workInProgress, unmaskedContext);

    var nextChildren = void 0;

    {
      ReactCurrentOwner.current = workInProgress;
      ReactDebugCurrentFiber.setCurrentPhase('render');
      nextChildren = fn(nextProps, context);
      ReactDebugCurrentFiber.setCurrentPhase(null);
    }
    // React DevTools reads this flag.
    workInProgress.effectTag |= PerformedWork;
    reconcileChildren(current, workInProgress, nextChildren);
    memoizeProps(workInProgress, nextProps);
    return workInProgress.child;
  }

  function updateClassComponent(current, workInProgress, renderExpirationTime) {
    // Push context providers early to prevent context stack mismatches.
    // During mounting we don't know the child context yet as the instance doesn't exist.
    // We will invalidate the child context in finishClassComponent() right after rendering.
    var hasContext = pushLegacyContextProvider(workInProgress);
    var shouldUpdate = void 0;
    if (current === null) {
      if (workInProgress.stateNode === null) {
        // In the initial pass we might need to construct the instance.
        constructClassInstance(workInProgress, workInProgress.pendingProps);
        mountClassInstance(workInProgress, renderExpirationTime);

        shouldUpdate = true;
      } else {
        // In a resume, we'll already have an instance we can reuse.
        shouldUpdate = resumeMountClassInstance(workInProgress, renderExpirationTime);
      }
    } else {
      shouldUpdate = updateClassInstance(current, workInProgress, renderExpirationTime);
    }

    // We processed the update queue inside updateClassInstance. It may have
    // included some errors that were dispatched during the commit phase.
    // TODO: Refactor class components so this is less awkward.
    var didCaptureError = false;
    var updateQueue = workInProgress.updateQueue;
    if (updateQueue !== null && updateQueue.capturedValues !== null) {
      shouldUpdate = true;
      didCaptureError = true;
    }
    return finishClassComponent(current, workInProgress, shouldUpdate, hasContext, didCaptureError, renderExpirationTime);
  }

  function finishClassComponent(current, workInProgress, shouldUpdate, hasContext, didCaptureError, renderExpirationTime) {
    // Refs should update even if shouldComponentUpdate returns false
    markRef(current, workInProgress);

    if (!shouldUpdate && !didCaptureError) {
      // Context providers should defer to sCU for rendering
      if (hasContext) {
        invalidateContextProvider(workInProgress, false);
      }

      return bailoutOnAlreadyFinishedWork(current, workInProgress);
    }

    var ctor = workInProgress.type;
    var instance = workInProgress.stateNode;

    // Rerender
    ReactCurrentOwner.current = workInProgress;
    var nextChildren = void 0;
    if (didCaptureError && (!enableGetDerivedStateFromCatch || typeof ctor.getDerivedStateFromCatch !== 'function')) {
      // If we captured an error, but getDerivedStateFrom catch is not defined,
      // unmount all the children. componentDidCatch will schedule an update to
      // re-render a fallback. This is temporary until we migrate everyone to
      // the new API.
      // TODO: Warn in a future release.
      nextChildren = null;
    } else {
      {
        ReactDebugCurrentFiber.setCurrentPhase('render');
        nextChildren = instance.render();
        if (debugRenderPhaseSideEffects || debugRenderPhaseSideEffectsForStrictMode && workInProgress.mode & StrictMode) {
          instance.render();
        }
        ReactDebugCurrentFiber.setCurrentPhase(null);
      }
    }

    // React DevTools reads this flag.
    workInProgress.effectTag |= PerformedWork;
    if (didCaptureError) {
      // If we're recovering from an error, reconcile twice: first to delete
      // all the existing children.
      reconcileChildrenAtExpirationTime(current, workInProgress, null, renderExpirationTime);
      workInProgress.child = null;
      // Now we can continue reconciling like normal. This has the effect of
      // remounting all children regardless of whether their their
      // identity matches.
    }
    reconcileChildrenAtExpirationTime(current, workInProgress, nextChildren, renderExpirationTime);
    // Memoize props and state using the values we just used to render.
    // TODO: Restructure so we never read values from the instance.
    memoizeState(workInProgress, instance.state);
    memoizeProps(workInProgress, instance.props);

    // The context might have changed so we need to recalculate it.
    if (hasContext) {
      invalidateContextProvider(workInProgress, true);
    }

    return workInProgress.child;
  }

  function pushHostRootContext(workInProgress) {
    var root = workInProgress.stateNode;
    if (root.pendingContext) {
      pushTopLevelContextObject(workInProgress, root.pendingContext, root.pendingContext !== root.context);
    } else if (root.context) {
      // Should always be set
      pushTopLevelContextObject(workInProgress, root.context, false);
    }
    pushHostContainer(workInProgress, root.containerInfo);
  }

  function updateHostRoot(current, workInProgress, renderExpirationTime) {
    pushHostRootContext(workInProgress);
    var updateQueue = workInProgress.updateQueue;
    if (updateQueue !== null) {
      var prevState = workInProgress.memoizedState;
      var state = processUpdateQueue(current, workInProgress, updateQueue, null, null, renderExpirationTime);
      memoizeState(workInProgress, state);
      updateQueue = workInProgress.updateQueue;

      var element = void 0;
      if (updateQueue !== null && updateQueue.capturedValues !== null) {
        // There's an uncaught error. Unmount the whole root.
        element = null;
      } else if (prevState === state) {
        // If the state is the same as before, that's a bailout because we had
        // no work that expires at this time.
        resetHydrationState();
        return bailoutOnAlreadyFinishedWork(current, workInProgress);
      } else {
        element = state.element;
      }
      var root = workInProgress.stateNode;
      if ((current === null || current.child === null) && root.hydrate && enterHydrationState(workInProgress)) {
        // If we don't have any current children this might be the first pass.
        // We always try to hydrate. If this isn't a hydration pass there won't
        // be any children to hydrate which is effectively the same thing as
        // not hydrating.

        // This is a bit of a hack. We track the host root as a placement to
        // know that we're currently in a mounting state. That way isMounted
        // works as expected. We must reset this before committing.
        // TODO: Delete this when we delete isMounted and findDOMNode.
        workInProgress.effectTag |= Placement;

        // Ensure that children mount into this root without tracking
        // side-effects. This ensures that we don't store Placement effects on
        // nodes that will be hydrated.
        workInProgress.child = mountChildFibers(workInProgress, null, element, renderExpirationTime);
      } else {
        // Otherwise reset hydration state in case we aborted and resumed another
        // root.
        resetHydrationState();
        reconcileChildren(current, workInProgress, element);
      }
      memoizeState(workInProgress, state);
      return workInProgress.child;
    }
    resetHydrationState();
    // If there is no update queue, that's a bailout because the root has no props.
    return bailoutOnAlreadyFinishedWork(current, workInProgress);
  }

  function updateHostComponent(current, workInProgress, renderExpirationTime) {
    pushHostContext(workInProgress);

    if (current === null) {
      tryToClaimNextHydratableInstance(workInProgress);
    }

    var type = workInProgress.type;
    var memoizedProps = workInProgress.memoizedProps;
    var nextProps = workInProgress.pendingProps;
    var prevProps = current !== null ? current.memoizedProps : null;

    if (hasLegacyContextChanged()) {
      // Normally we can bail out on props equality but if context has changed
      // we don't do the bailout and we have to reuse existing props instead.
    } else if (memoizedProps === nextProps) {
      var isHidden = workInProgress.mode & AsyncMode && shouldDeprioritizeSubtree(type, nextProps);
      if (isHidden) {
        // Before bailing out, make sure we've deprioritized a hidden component.
        workInProgress.expirationTime = Never;
      }
      if (!isHidden || renderExpirationTime !== Never) {
        return bailoutOnAlreadyFinishedWork(current, workInProgress);
      }
      // If we're rendering a hidden node at hidden priority, don't bailout. The
      // parent is complete, but the children may not be.
    }

    var nextChildren = nextProps.children;
    var isDirectTextChild = shouldSetTextContent(type, nextProps);

    if (isDirectTextChild) {
      // We special case a direct text child of a host node. This is a common
      // case. We won't handle it as a reified child. We will instead handle
      // this in the host environment that also have access to this prop. That
      // avoids allocating another HostText fiber and traversing it.
      nextChildren = null;
    } else if (prevProps && shouldSetTextContent(type, prevProps)) {
      // If we're switching from a direct text child to a normal child, or to
      // empty, we need to schedule the text content to be reset.
      workInProgress.effectTag |= ContentReset;
    }

    markRef(current, workInProgress);

    // Check the host config to see if the children are offscreen/hidden.
    if (renderExpirationTime !== Never && workInProgress.mode & AsyncMode && shouldDeprioritizeSubtree(type, nextProps)) {
      // Down-prioritize the children.
      workInProgress.expirationTime = Never;
      // Bailout and come back to this fiber later.
      workInProgress.memoizedProps = nextProps;
      return null;
    }

    reconcileChildren(current, workInProgress, nextChildren);
    memoizeProps(workInProgress, nextProps);
    return workInProgress.child;
  }

  function updateHostText(current, workInProgress) {
    if (current === null) {
      tryToClaimNextHydratableInstance(workInProgress);
    }
    var nextProps = workInProgress.pendingProps;
    memoizeProps(workInProgress, nextProps);
    // Nothing to do here. This is terminal. We'll do the completion step
    // immediately after.
    return null;
  }

  function mountIndeterminateComponent(current, workInProgress, renderExpirationTime) {
    !(current === null) ? invariant(false, 'An indeterminate component should never have mounted. This error is likely caused by a bug in React. Please file an issue.') : void 0;
    var fn = workInProgress.type;
    var props = workInProgress.pendingProps;
    var unmaskedContext = getUnmaskedContext(workInProgress);
    var context = getMaskedContext(workInProgress, unmaskedContext);

    var value = void 0;

    {
      if (fn.prototype && typeof fn.prototype.render === 'function') {
        var componentName = getComponentName(workInProgress) || 'Unknown';

        if (!didWarnAboutBadClass[componentName]) {
          warning(false, "The <%s /> component appears to have a render method, but doesn't extend React.Component. " + 'This is likely to cause errors. Change %s to extend React.Component instead.', componentName, componentName);
          didWarnAboutBadClass[componentName] = true;
        }
      }
      ReactCurrentOwner.current = workInProgress;
      value = fn(props, context);
    }
    // React DevTools reads this flag.
    workInProgress.effectTag |= PerformedWork;

    if (typeof value === 'object' && value !== null && typeof value.render === 'function' && value.$$typeof === undefined) {
      var Component = workInProgress.type;

      // Proceed under the assumption that this is a class instance
      workInProgress.tag = ClassComponent;

      workInProgress.memoizedState = value.state !== null && value.state !== undefined ? value.state : null;

      if (typeof Component.getDerivedStateFromProps === 'function') {
        var partialState = callGetDerivedStateFromProps(workInProgress, value, props, workInProgress.memoizedState);

        if (partialState !== null && partialState !== undefined) {
          workInProgress.memoizedState = _assign({}, workInProgress.memoizedState, partialState);
        }
      }

      // Push context providers early to prevent context stack mismatches.
      // During mounting we don't know the child context yet as the instance doesn't exist.
      // We will invalidate the child context in finishClassComponent() right after rendering.
      var hasContext = pushLegacyContextProvider(workInProgress);
      adoptClassInstance(workInProgress, value);
      mountClassInstance(workInProgress, renderExpirationTime);
      return finishClassComponent(current, workInProgress, true, hasContext, false, renderExpirationTime);
    } else {
      // Proceed under the assumption that this is a functional component
      workInProgress.tag = FunctionalComponent;
      {
        var _Component = workInProgress.type;

        if (_Component) {
          !!_Component.childContextTypes ? warning(false, '%s(...): childContextTypes cannot be defined on a functional component.', _Component.displayName || _Component.name || 'Component') : void 0;
        }
        if (workInProgress.ref !== null) {
          var info = '';
          var ownerName = ReactDebugCurrentFiber.getCurrentFiberOwnerName();
          if (ownerName) {
            info += '\n\nCheck the render method of `' + ownerName + '`.';
          }

          var warningKey = ownerName || workInProgress._debugID || '';
          var debugSource = workInProgress._debugSource;
          if (debugSource) {
            warningKey = debugSource.fileName + ':' + debugSource.lineNumber;
          }
          if (!didWarnAboutStatelessRefs[warningKey]) {
            didWarnAboutStatelessRefs[warningKey] = true;
            warning(false, 'Stateless function components cannot be given refs. ' + 'Attempts to access this ref will fail.%s%s', info, ReactDebugCurrentFiber.getCurrentFiberStackAddendum());
          }
        }

        if (typeof fn.getDerivedStateFromProps === 'function') {
          var _componentName = getComponentName(workInProgress) || 'Unknown';

          if (!didWarnAboutGetDerivedStateOnFunctionalComponent[_componentName]) {
            warning(false, '%s: Stateless functional components do not support getDerivedStateFromProps.', _componentName);
            didWarnAboutGetDerivedStateOnFunctionalComponent[_componentName] = true;
          }
        }
      }
      reconcileChildren(current, workInProgress, value);
      memoizeProps(workInProgress, props);
      return workInProgress.child;
    }
  }

  function updateCallComponent(current, workInProgress, renderExpirationTime) {
    var nextProps = workInProgress.pendingProps;
    if (hasLegacyContextChanged()) {
      // Normally we can bail out on props equality but if context has changed
      // we don't do the bailout and we have to reuse existing props instead.
    } else if (workInProgress.memoizedProps === nextProps) {
      nextProps = workInProgress.memoizedProps;
      // TODO: When bailing out, we might need to return the stateNode instead
      // of the child. To check it for work.
      // return bailoutOnAlreadyFinishedWork(current, workInProgress);
    }

    var nextChildren = nextProps.children;

    // The following is a fork of reconcileChildrenAtExpirationTime but using
    // stateNode to store the child.
    if (current === null) {
      workInProgress.stateNode = mountChildFibers(workInProgress, workInProgress.stateNode, nextChildren, renderExpirationTime);
    } else {
      workInProgress.stateNode = reconcileChildFibers(workInProgress, current.stateNode, nextChildren, renderExpirationTime);
    }

    memoizeProps(workInProgress, nextProps);
    // This doesn't take arbitrary time so we could synchronously just begin
    // eagerly do the work of workInProgress.child as an optimization.
    return workInProgress.stateNode;
  }

  function updatePortalComponent(current, workInProgress, renderExpirationTime) {
    pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
    var nextChildren = workInProgress.pendingProps;
    if (hasLegacyContextChanged()) {
      // Normally we can bail out on props equality but if context has changed
      // we don't do the bailout and we have to reuse existing props instead.
    } else if (workInProgress.memoizedProps === nextChildren) {
      return bailoutOnAlreadyFinishedWork(current, workInProgress);
    }

    if (current === null) {
      // Portals are special because we don't append the children during mount
      // but at commit. Therefore we need to track insertions which the normal
      // flow doesn't do during mount. This doesn't happen at the root because
      // the root always starts with a "current" with a null child.
      // TODO: Consider unifying this with how the root works.
      workInProgress.child = reconcileChildFibers(workInProgress, null, nextChildren, renderExpirationTime);
      memoizeProps(workInProgress, nextChildren);
    } else {
      reconcileChildren(current, workInProgress, nextChildren);
      memoizeProps(workInProgress, nextChildren);
    }
    return workInProgress.child;
  }

  function propagateContextChange(workInProgress, context, changedBits, renderExpirationTime) {
    var fiber = workInProgress.child;
    if (fiber !== null) {
      // Set the return pointer of the child to the work-in-progress fiber.
      fiber['return'] = workInProgress;
    }
    while (fiber !== null) {
      var nextFiber = void 0;
      // Visit this fiber.
      switch (fiber.tag) {
        case ContextConsumer:
          // Check if the context matches.
          var observedBits = fiber.stateNode | 0;
          if (fiber.type === context && (observedBits & changedBits) !== 0) {
            // Update the expiration time of all the ancestors, including
            // the alternates.
            var node = fiber;
            while (node !== null) {
              var alternate = node.alternate;
              if (node.expirationTime === NoWork || node.expirationTime > renderExpirationTime) {
                node.expirationTime = renderExpirationTime;
                if (alternate !== null && (alternate.expirationTime === NoWork || alternate.expirationTime > renderExpirationTime)) {
                  alternate.expirationTime = renderExpirationTime;
                }
              } else if (alternate !== null && (alternate.expirationTime === NoWork || alternate.expirationTime > renderExpirationTime)) {
                alternate.expirationTime = renderExpirationTime;
              } else {
                // Neither alternate was updated, which means the rest of the
                // ancestor path already has sufficient priority.
                break;
              }
              node = node['return'];
            }
            // Don't scan deeper than a matching consumer. When we render the
            // consumer, we'll continue scanning from that point. This way the
            // scanning work is time-sliced.
            nextFiber = null;
          } else {
            // Traverse down.
            nextFiber = fiber.child;
          }
          break;
        case ContextProvider:
          // Don't scan deeper if this is a matching provider
          nextFiber = fiber.type === workInProgress.type ? null : fiber.child;
          break;
        default:
          // Traverse down.
          nextFiber = fiber.child;
          break;
      }
      if (nextFiber !== null) {
        // Set the return pointer of the child to the work-in-progress fiber.
        nextFiber['return'] = fiber;
      } else {
        // No child. Traverse to next sibling.
        nextFiber = fiber;
        while (nextFiber !== null) {
          if (nextFiber === workInProgress) {
            // We're back to the root of this subtree. Exit.
            nextFiber = null;
            break;
          }
          var sibling = nextFiber.sibling;
          if (sibling !== null) {
            nextFiber = sibling;
            break;
          }
          // No more siblings. Traverse up.
          nextFiber = nextFiber['return'];
        }
      }
      fiber = nextFiber;
    }
  }

  function updateContextProvider(current, workInProgress, renderExpirationTime) {
    var providerType = workInProgress.type;
    var context = providerType._context;

    var newProps = workInProgress.pendingProps;
    var oldProps = workInProgress.memoizedProps;

    if (hasLegacyContextChanged()) {
      // Normally we can bail out on props equality but if context has changed
      // we don't do the bailout and we have to reuse existing props instead.
    } else if (oldProps === newProps) {
      workInProgress.stateNode = 0;
      pushProvider(workInProgress);
      return bailoutOnAlreadyFinishedWork(current, workInProgress);
    }

    var newValue = newProps.value;
    workInProgress.memoizedProps = newProps;

    var changedBits = void 0;
    if (oldProps === null) {
      // Initial render
      changedBits = MAX_SIGNED_31_BIT_INT;
    } else {
      if (oldProps.value === newProps.value) {
        // No change. Bailout early if children are the same.
        if (oldProps.children === newProps.children) {
          workInProgress.stateNode = 0;
          pushProvider(workInProgress);
          return bailoutOnAlreadyFinishedWork(current, workInProgress);
        }
        changedBits = 0;
      } else {
        var oldValue = oldProps.value;
        // Use Object.is to compare the new context value to the old value.
        // Inlined Object.is polyfill.
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
        if (oldValue === newValue && (oldValue !== 0 || 1 / oldValue === 1 / newValue) || oldValue !== oldValue && newValue !== newValue // eslint-disable-line no-self-compare
        ) {
            // No change. Bailout early if children are the same.
            if (oldProps.children === newProps.children) {
              workInProgress.stateNode = 0;
              pushProvider(workInProgress);
              return bailoutOnAlreadyFinishedWork(current, workInProgress);
            }
            changedBits = 0;
          } else {
          changedBits = typeof context._calculateChangedBits === 'function' ? context._calculateChangedBits(oldValue, newValue) : MAX_SIGNED_31_BIT_INT;
          {
            !((changedBits & MAX_SIGNED_31_BIT_INT) === changedBits) ? warning(false, 'calculateChangedBits: Expected the return value to be a ' + '31-bit integer. Instead received: %s', changedBits) : void 0;
          }
          changedBits |= 0;

          if (changedBits === 0) {
            // No change. Bailout early if children are the same.
            if (oldProps.children === newProps.children) {
              workInProgress.stateNode = 0;
              pushProvider(workInProgress);
              return bailoutOnAlreadyFinishedWork(current, workInProgress);
            }
          } else {
            propagateContextChange(workInProgress, context, changedBits, renderExpirationTime);
          }
        }
      }
    }

    workInProgress.stateNode = changedBits;
    pushProvider(workInProgress);

    var newChildren = newProps.children;
    reconcileChildren(current, workInProgress, newChildren);
    return workInProgress.child;
  }

  function updateContextConsumer(current, workInProgress, renderExpirationTime) {
    var context = workInProgress.type;
    var newProps = workInProgress.pendingProps;
    var oldProps = workInProgress.memoizedProps;

    var newValue = context._currentValue;
    var changedBits = context._changedBits;

    if (hasLegacyContextChanged()) {
      // Normally we can bail out on props equality but if context has changed
      // we don't do the bailout and we have to reuse existing props instead.
    } else if (changedBits === 0 && oldProps === newProps) {
      return bailoutOnAlreadyFinishedWork(current, workInProgress);
    }
    workInProgress.memoizedProps = newProps;

    var observedBits = newProps.unstable_observedBits;
    if (observedBits === undefined || observedBits === null) {
      // Subscribe to all changes by default
      observedBits = MAX_SIGNED_31_BIT_INT;
    }
    // Store the observedBits on the fiber's stateNode for quick access.
    workInProgress.stateNode = observedBits;

    if ((changedBits & observedBits) !== 0) {
      // Context change propagation stops at matching consumers, for time-
      // slicing. Continue the propagation here.
      propagateContextChange(workInProgress, context, changedBits, renderExpirationTime);
    } else if (oldProps === newProps) {
      // Skip over a memoized parent with a bitmask bailout even
      // if we began working on it because of a deeper matching child.
      return bailoutOnAlreadyFinishedWork(current, workInProgress);
    }
    // There is no bailout on `children` equality because we expect people
    // to often pass a bound method as a child, but it may reference
    // `this.state` or `this.props` (and thus needs to re-render on `setState`).

    var render = newProps.children;

    {
      !(typeof render === 'function') ? warning(false, 'A context consumer was rendered with multiple children, or a child ' + "that isn't a function. A context consumer expects a single child " + 'that is a function. If you did pass a function, make sure there ' + 'is no trailing or leading whitespace around it.') : void 0;
    }

    var newChildren = render(newValue);
    reconcileChildren(current, workInProgress, newChildren);
    return workInProgress.child;
  }

  /*
  function reuseChildrenEffects(returnFiber : Fiber, firstChild : Fiber) {
    let child = firstChild;
    do {
      // Ensure that the first and last effect of the parent corresponds
      // to the children's first and last effect.
      if (!returnFiber.firstEffect) {
        returnFiber.firstEffect = child.firstEffect;
      }
      if (child.lastEffect) {
        if (returnFiber.lastEffect) {
          returnFiber.lastEffect.nextEffect = child.firstEffect;
        }
        returnFiber.lastEffect = child.lastEffect;
      }
    } while (child = child.sibling);
  }
  */

  function bailoutOnAlreadyFinishedWork(current, workInProgress) {
    cancelWorkTimer(workInProgress);

    // TODO: We should ideally be able to bail out early if the children have no
    // more work to do. However, since we don't have a separation of this
    // Fiber's priority and its children yet - we don't know without doing lots
    // of the same work we do anyway. Once we have that separation we can just
    // bail out here if the children has no more work at this priority level.
    // if (workInProgress.priorityOfChildren <= priorityLevel) {
    //   // If there are side-effects in these children that have not yet been
    //   // committed we need to ensure that they get properly transferred up.
    //   if (current && current.child !== workInProgress.child) {
    //     reuseChildrenEffects(workInProgress, child);
    //   }
    //   return null;
    // }

    cloneChildFibers(current, workInProgress);
    return workInProgress.child;
  }

  function bailoutOnLowPriority(current, workInProgress) {
    cancelWorkTimer(workInProgress);

    // TODO: Handle HostComponent tags here as well and call pushHostContext()?
    // See PR 8590 discussion for context
    switch (workInProgress.tag) {
      case HostRoot:
        pushHostRootContext(workInProgress);
        break;
      case ClassComponent:
        pushLegacyContextProvider(workInProgress);
        break;
      case HostPortal:
        pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
        break;
      case ContextProvider:
        pushProvider(workInProgress);
        break;
    }
    // TODO: What if this is currently in progress?
    // How can that happen? How is this not being cloned?
    return null;
  }

  // TODO: Delete memoizeProps/State and move to reconcile/bailout instead
  function memoizeProps(workInProgress, nextProps) {
    workInProgress.memoizedProps = nextProps;
  }

  function memoizeState(workInProgress, nextState) {
    workInProgress.memoizedState = nextState;
    // Don't reset the updateQueue, in case there are pending updates. Resetting
    // is handled by processUpdateQueue.
  }

  function beginWork(current, workInProgress, renderExpirationTime) {
    if (workInProgress.expirationTime === NoWork || workInProgress.expirationTime > renderExpirationTime) {
      return bailoutOnLowPriority(current, workInProgress);
    }

    switch (workInProgress.tag) {
      case IndeterminateComponent:
        return mountIndeterminateComponent(current, workInProgress, renderExpirationTime);
      case FunctionalComponent:
        return updateFunctionalComponent(current, workInProgress);
      case ClassComponent:
        return updateClassComponent(current, workInProgress, renderExpirationTime);
      case HostRoot:
        return updateHostRoot(current, workInProgress, renderExpirationTime);
      case HostComponent:
        return updateHostComponent(current, workInProgress, renderExpirationTime);
      case HostText:
        return updateHostText(current, workInProgress);
      case CallHandlerPhase:
        // This is a restart. Reset the tag to the initial phase.
        workInProgress.tag = CallComponent;
      // Intentionally fall through since this is now the same.
      case CallComponent:
        return updateCallComponent(current, workInProgress, renderExpirationTime);
      case ReturnComponent:
        // A return component is just a placeholder, we can just run through the
        // next one immediately.
        return null;
      case HostPortal:
        return updatePortalComponent(current, workInProgress, renderExpirationTime);
      case ForwardRef:
        return updateForwardRef(current, workInProgress);
      case Fragment:
        return updateFragment(current, workInProgress);
      case Mode:
        return updateMode(current, workInProgress);
      case ContextProvider:
        return updateContextProvider(current, workInProgress, renderExpirationTime);
      case ContextConsumer:
        return updateContextConsumer(current, workInProgress, renderExpirationTime);
      default:
        invariant(false, 'Unknown unit of work tag. This error is likely caused by a bug in React. Please file an issue.');
    }
  }

  return {
    beginWork: beginWork
  };
};

var ReactFiberCompleteWork = function (config, hostContext, legacyContext, newContext, hydrationContext) {
  var createInstance = config.createInstance,
      createTextInstance = config.createTextInstance,
      appendInitialChild = config.appendInitialChild,
      finalizeInitialChildren = config.finalizeInitialChildren,
      prepareUpdate = config.prepareUpdate,
      mutation = config.mutation,
      persistence = config.persistence;
  var getRootHostContainer = hostContext.getRootHostContainer,
      popHostContext = hostContext.popHostContext,
      getHostContext = hostContext.getHostContext,
      popHostContainer = hostContext.popHostContainer;
  var popLegacyContextProvider = legacyContext.popContextProvider,
      popTopLevelLegacyContextObject = legacyContext.popTopLevelContextObject;
  var popProvider = newContext.popProvider;
  var prepareToHydrateHostInstance = hydrationContext.prepareToHydrateHostInstance,
      prepareToHydrateHostTextInstance = hydrationContext.prepareToHydrateHostTextInstance,
      popHydrationState = hydrationContext.popHydrationState;


  function markUpdate(workInProgress) {
    // Tag the fiber with an update effect. This turns a Placement into
    // a PlacementAndUpdate.
    workInProgress.effectTag |= Update;
  }

  function markRef(workInProgress) {
    workInProgress.effectTag |= Ref;
  }

  function appendAllReturns(returns, workInProgress) {
    var node = workInProgress.stateNode;
    if (node) {
      node['return'] = workInProgress;
    }
    while (node !== null) {
      if (node.tag === HostComponent || node.tag === HostText || node.tag === HostPortal) {
        invariant(false, 'A call cannot have host component children.');
      } else if (node.tag === ReturnComponent) {
        returns.push(node.pendingProps.value);
      } else if (node.child !== null) {
        node.child['return'] = node;
        node = node.child;
        continue;
      }
      while (node.sibling === null) {
        if (node['return'] === null || node['return'] === workInProgress) {
          return;
        }
        node = node['return'];
      }
      node.sibling['return'] = node['return'];
      node = node.sibling;
    }
  }

  function moveCallToHandlerPhase(current, workInProgress, renderExpirationTime) {
    var props = workInProgress.memoizedProps;
    !props ? invariant(false, 'Should be resolved by now. This error is likely caused by a bug in React. Please file an issue.') : void 0;

    // First step of the call has completed. Now we need to do the second.
    // TODO: It would be nice to have a multi stage call represented by a
    // single component, or at least tail call optimize nested ones. Currently
    // that requires additional fields that we don't want to add to the fiber.
    // So this requires nested handlers.
    // Note: This doesn't mutate the alternate node. I don't think it needs to
    // since this stage is reset for every pass.
    workInProgress.tag = CallHandlerPhase;

    // Build up the returns.
    // TODO: Compare this to a generator or opaque helpers like Children.
    var returns = [];
    appendAllReturns(returns, workInProgress);
    var fn = props.handler;
    var childProps = props.props;
    var nextChildren = fn(childProps, returns);

    var currentFirstChild = current !== null ? current.child : null;
    workInProgress.child = reconcileChildFibers(workInProgress, currentFirstChild, nextChildren, renderExpirationTime);
    return workInProgress.child;
  }

  function appendAllChildren(parent, workInProgress) {
    // We only have the top Fiber that was created but we need recurse down its
    // children to find all the terminal nodes.
    var node = workInProgress.child;
    while (node !== null) {
      if (node.tag === HostComponent || node.tag === HostText) {
        appendInitialChild(parent, node.stateNode);
      } else if (node.tag === HostPortal) {
        // If we have a portal child, then we don't want to traverse
        // down its children. Instead, we'll get insertions from each child in
        // the portal directly.
      } else if (node.child !== null) {
        node.child['return'] = node;
        node = node.child;
        continue;
      }
      if (node === workInProgress) {
        return;
      }
      while (node.sibling === null) {
        if (node['return'] === null || node['return'] === workInProgress) {
          return;
        }
        node = node['return'];
      }
      node.sibling['return'] = node['return'];
      node = node.sibling;
    }
  }

  var updateHostContainer = void 0;
  var updateHostComponent = void 0;
  var updateHostText = void 0;
  if (mutation) {
    if (enableMutatingReconciler) {
      // Mutation mode
      updateHostContainer = function (workInProgress) {
        // Noop
      };
      updateHostComponent = function (current, workInProgress, updatePayload, type, oldProps, newProps, rootContainerInstance, currentHostContext) {
        // TODO: Type this specific to this type of component.
        workInProgress.updateQueue = updatePayload;
        // If the update payload indicates that there is a change or if there
        // is a new ref we mark this as an update. All the work is done in commitWork.
        if (updatePayload) {
          markUpdate(workInProgress);
        }
      };
      updateHostText = function (current, workInProgress, oldText, newText) {
        // If the text differs, mark it as an update. All the work in done in commitWork.
        if (oldText !== newText) {
          markUpdate(workInProgress);
        }
      };
    } else {
      invariant(false, 'Mutating reconciler is disabled.');
    }
  } else if (persistence) {
    if (enablePersistentReconciler) {
      // Persistent host tree mode
      var cloneInstance = persistence.cloneInstance,
          createContainerChildSet = persistence.createContainerChildSet,
          appendChildToContainerChildSet = persistence.appendChildToContainerChildSet,
          finalizeContainerChildren = persistence.finalizeContainerChildren;

      // An unfortunate fork of appendAllChildren because we have two different parent types.

      var appendAllChildrenToContainer = function (containerChildSet, workInProgress) {
        // We only have the top Fiber that was created but we need recurse down its
        // children to find all the terminal nodes.
        var node = workInProgress.child;
        while (node !== null) {
          if (node.tag === HostComponent || node.tag === HostText) {
            appendChildToContainerChildSet(containerChildSet, node.stateNode);
          } else if (node.tag === HostPortal) {
            // If we have a portal child, then we don't want to traverse
            // down its children. Instead, we'll get insertions from each child in
            // the portal directly.
          } else if (node.child !== null) {
            node.child['return'] = node;
            node = node.child;
            continue;
          }
          if (node === workInProgress) {
            return;
          }
          while (node.sibling === null) {
            if (node['return'] === null || node['return'] === workInProgress) {
              return;
            }
            node = node['return'];
          }
          node.sibling['return'] = node['return'];
          node = node.sibling;
        }
      };
      updateHostContainer = function (workInProgress) {
        var portalOrRoot = workInProgress.stateNode;
        var childrenUnchanged = workInProgress.firstEffect === null;
        if (childrenUnchanged) {
          // No changes, just reuse the existing instance.
        } else {
          var container = portalOrRoot.containerInfo;
          var newChildSet = createContainerChildSet(container);
          // If children might have changed, we have to add them all to the set.
          appendAllChildrenToContainer(newChildSet, workInProgress);
          portalOrRoot.pendingChildren = newChildSet;
          // Schedule an update on the container to swap out the container.
          markUpdate(workInProgress);
          finalizeContainerChildren(container, newChildSet);
        }
      };
      updateHostComponent = function (current, workInProgress, updatePayload, type, oldProps, newProps, rootContainerInstance, currentHostContext) {
        // If there are no effects associated with this node, then none of our children had any updates.
        // This guarantees that we can reuse all of them.
        var childrenUnchanged = workInProgress.firstEffect === null;
        var currentInstance = current.stateNode;
        if (childrenUnchanged && updatePayload === null) {
          // No changes, just reuse the existing instance.
          // Note that this might release a previous clone.
          workInProgress.stateNode = currentInstance;
        } else {
          var recyclableInstance = workInProgress.stateNode;
          var newInstance = cloneInstance(currentInstance, updatePayload, type, oldProps, newProps, workInProgress, childrenUnchanged, recyclableInstance);
          if (finalizeInitialChildren(newInstance, type, newProps, rootContainerInstance, currentHostContext)) {
            markUpdate(workInProgress);
          }
          workInProgress.stateNode = newInstance;
          if (childrenUnchanged) {
            // If there are no other effects in this tree, we need to flag this node as having one.
            // Even though we're not going to use it for anything.
            // Otherwise parents won't know that there are new children to propagate upwards.
            markUpdate(workInProgress);
          } else {
            // If children might have changed, we have to add them all to the set.
            appendAllChildren(newInstance, workInProgress);
          }
        }
      };
      updateHostText = function (current, workInProgress, oldText, newText) {
        if (oldText !== newText) {
          // If the text content differs, we'll create a new text instance for it.
          var rootContainerInstance = getRootHostContainer();
          var currentHostContext = getHostContext();
          workInProgress.stateNode = createTextInstance(newText, rootContainerInstance, currentHostContext, workInProgress);
          // We'll have to mark it as having an effect, even though we won't use the effect for anything.
          // This lets the parents know that at least one of their children has changed.
          markUpdate(workInProgress);
        }
      };
    } else {
      invariant(false, 'Persistent reconciler is disabled.');
    }
  } else {
    if (enableNoopReconciler) {
      // No host operations
      updateHostContainer = function (workInProgress) {
        // Noop
      };
      updateHostComponent = function (current, workInProgress, updatePayload, type, oldProps, newProps, rootContainerInstance, currentHostContext) {
        // Noop
      };
      updateHostText = function (current, workInProgress, oldText, newText) {
        // Noop
      };
    } else {
      invariant(false, 'Noop reconciler is disabled.');
    }
  }

  function completeWork(current, workInProgress, renderExpirationTime) {
    var newProps = workInProgress.pendingProps;
    switch (workInProgress.tag) {
      case FunctionalComponent:
        return null;
      case ClassComponent:
        {
          // We are leaving this subtree, so pop context if any.
          popLegacyContextProvider(workInProgress);

          // If this component caught an error, schedule an error log effect.
          var instance = workInProgress.stateNode;
          var updateQueue = workInProgress.updateQueue;
          if (updateQueue !== null && updateQueue.capturedValues !== null) {
            workInProgress.effectTag &= ~DidCapture;
            if (typeof instance.componentDidCatch === 'function') {
              workInProgress.effectTag |= ErrLog;
            } else {
              // Normally we clear this in the commit phase, but since we did not
              // schedule an effect, we need to reset it here.
              updateQueue.capturedValues = null;
            }
          }
          return null;
        }
      case HostRoot:
        {
          popHostContainer(workInProgress);
          popTopLevelLegacyContextObject(workInProgress);
          var fiberRoot = workInProgress.stateNode;
          if (fiberRoot.pendingContext) {
            fiberRoot.context = fiberRoot.pendingContext;
            fiberRoot.pendingContext = null;
          }
          if (current === null || current.child === null) {
            // If we hydrated, pop so that we can delete any remaining children
            // that weren't hydrated.
            popHydrationState(workInProgress);
            // This resets the hacky state to fix isMounted before committing.
            // TODO: Delete this when we delete isMounted and findDOMNode.
            workInProgress.effectTag &= ~Placement;
          }
          updateHostContainer(workInProgress);

          var _updateQueue = workInProgress.updateQueue;
          if (_updateQueue !== null && _updateQueue.capturedValues !== null) {
            workInProgress.effectTag |= ErrLog;
          }
          return null;
        }
      case HostComponent:
        {
          popHostContext(workInProgress);
          var rootContainerInstance = getRootHostContainer();
          var type = workInProgress.type;
          if (current !== null && workInProgress.stateNode != null) {
            // If we have an alternate, that means this is an update and we need to
            // schedule a side-effect to do the updates.
            var oldProps = current.memoizedProps;
            // If we get updated because one of our children updated, we don't
            // have newProps so we'll have to reuse them.
            // TODO: Split the update API as separate for the props vs. children.
            // Even better would be if children weren't special cased at all tho.
            var _instance = workInProgress.stateNode;
            var currentHostContext = getHostContext();
            // TODO: Experiencing an error where oldProps is null. Suggests a host
            // component is hitting the resume path. Figure out why. Possibly
            // related to `hidden`.
            var updatePayload = prepareUpdate(_instance, type, oldProps, newProps, rootContainerInstance, currentHostContext);

            updateHostComponent(current, workInProgress, updatePayload, type, oldProps, newProps, rootContainerInstance, currentHostContext);

            if (current.ref !== workInProgress.ref) {
              markRef(workInProgress);
            }
          } else {
            if (!newProps) {
              !(workInProgress.stateNode !== null) ? invariant(false, 'We must have new props for new mounts. This error is likely caused by a bug in React. Please file an issue.') : void 0;
              // This can happen when we abort work.
              return null;
            }

            var _currentHostContext = getHostContext();
            // TODO: Move createInstance to beginWork and keep it on a context
            // "stack" as the parent. Then append children as we go in beginWork
            // or completeWork depending on we want to add then top->down or
            // bottom->up. Top->down is faster in IE11.
            var wasHydrated = popHydrationState(workInProgress);
            if (wasHydrated) {
              // TODO: Move this and createInstance step into the beginPhase
              // to consolidate.
              if (prepareToHydrateHostInstance(workInProgress, rootContainerInstance, _currentHostContext)) {
                // If changes to the hydrated node needs to be applied at the
                // commit-phase we mark this as such.
                markUpdate(workInProgress);
              }
            } else {
              var _instance2 = createInstance(type, newProps, rootContainerInstance, _currentHostContext, workInProgress);

              appendAllChildren(_instance2, workInProgress);

              // Certain renderers require commit-time effects for initial mount.
              // (eg DOM renderer supports auto-focus for certain elements).
              // Make sure such renderers get scheduled for later work.
              if (finalizeInitialChildren(_instance2, type, newProps, rootContainerInstance, _currentHostContext)) {
                markUpdate(workInProgress);
              }
              workInProgress.stateNode = _instance2;
            }

            if (workInProgress.ref !== null) {
              // If there is a ref on a host node we need to schedule a callback
              markRef(workInProgress);
            }
          }
          return null;
        }
      case HostText:
        {
          var newText = newProps;
          if (current && workInProgress.stateNode != null) {
            var oldText = current.memoizedProps;
            // If we have an alternate, that means this is an update and we need
            // to schedule a side-effect to do the updates.
            updateHostText(current, workInProgress, oldText, newText);
          } else {
            if (typeof newText !== 'string') {
              !(workInProgress.stateNode !== null) ? invariant(false, 'We must have new props for new mounts. This error is likely caused by a bug in React. Please file an issue.') : void 0;
              // This can happen when we abort work.
              return null;
            }
            var _rootContainerInstance = getRootHostContainer();
            var _currentHostContext2 = getHostContext();
            var _wasHydrated = popHydrationState(workInProgress);
            if (_wasHydrated) {
              if (prepareToHydrateHostTextInstance(workInProgress)) {
                markUpdate(workInProgress);
              }
            } else {
              workInProgress.stateNode = createTextInstance(newText, _rootContainerInstance, _currentHostContext2, workInProgress);
            }
          }
          return null;
        }
      case CallComponent:
        return moveCallToHandlerPhase(current, workInProgress, renderExpirationTime);
      case CallHandlerPhase:
        // Reset the tag to now be a first phase call.
        workInProgress.tag = CallComponent;
        return null;
      case ReturnComponent:
        // Does nothing.
        return null;
      case ForwardRef:
        return null;
      case Fragment:
        return null;
      case Mode:
        return null;
      case HostPortal:
        popHostContainer(workInProgress);
        updateHostContainer(workInProgress);
        return null;
      case ContextProvider:
        // Pop provider fiber
        popProvider(workInProgress);
        return null;
      case ContextConsumer:
        return null;
      // Error cases
      case IndeterminateComponent:
        invariant(false, 'An indeterminate component should have become determinate before completing. This error is likely caused by a bug in React. Please file an issue.');
      // eslint-disable-next-line no-fallthrough
      default:
        invariant(false, 'Unknown unit of work tag. This error is likely caused by a bug in React. Please file an issue.');
    }
  }

  return {
    completeWork: completeWork
  };
};

function createCapturedValue(value, source) {
  // If the value is an error, call this function immediately after it is thrown
  // so the stack is accurate.
  return {
    value: value,
    source: source,
    stack: getStackAddendumByWorkInProgressFiber(source)
  };
}

var ReactFiberUnwindWork = function (hostContext, legacyContext, newContext, scheduleWork, isAlreadyFailedLegacyErrorBoundary) {
  var popHostContainer = hostContext.popHostContainer,
      popHostContext = hostContext.popHostContext;
  var popLegacyContextProvider = legacyContext.popContextProvider,
      popTopLevelLegacyContextObject = legacyContext.popTopLevelContextObject;
  var popProvider = newContext.popProvider;


  function throwException(returnFiber, sourceFiber, rawValue) {
    // The source fiber did not complete.
    sourceFiber.effectTag |= Incomplete;
    // Its effect list is no longer valid.
    sourceFiber.firstEffect = sourceFiber.lastEffect = null;

    var value = createCapturedValue(rawValue, sourceFiber);

    var workInProgress = returnFiber;
    do {
      switch (workInProgress.tag) {
        case HostRoot:
          {
            // Uncaught error
            var errorInfo = value;
            ensureUpdateQueues(workInProgress);
            var updateQueue = workInProgress.updateQueue;
            updateQueue.capturedValues = [errorInfo];
            workInProgress.effectTag |= ShouldCapture;
            return;
          }
        case ClassComponent:
          // Capture and retry
          var ctor = workInProgress.type;
          var _instance = workInProgress.stateNode;
          if ((workInProgress.effectTag & DidCapture) === NoEffect && (typeof ctor.getDerivedStateFromCatch === 'function' && enableGetDerivedStateFromCatch || _instance !== null && typeof _instance.componentDidCatch === 'function' && !isAlreadyFailedLegacyErrorBoundary(_instance))) {
            ensureUpdateQueues(workInProgress);
            var _updateQueue = workInProgress.updateQueue;
            var capturedValues = _updateQueue.capturedValues;
            if (capturedValues === null) {
              _updateQueue.capturedValues = [value];
            } else {
              capturedValues.push(value);
            }
            workInProgress.effectTag |= ShouldCapture;
            return;
          }
          break;
        default:
          break;
      }
      workInProgress = workInProgress['return'];
    } while (workInProgress !== null);
  }

  function unwindWork(workInProgress) {
    switch (workInProgress.tag) {
      case ClassComponent:
        {
          popLegacyContextProvider(workInProgress);
          var effectTag = workInProgress.effectTag;
          if (effectTag & ShouldCapture) {
            workInProgress.effectTag = effectTag & ~ShouldCapture | DidCapture;
            return workInProgress;
          }
          return null;
        }
      case HostRoot:
        {
          popHostContainer(workInProgress);
          popTopLevelLegacyContextObject(workInProgress);
          var _effectTag = workInProgress.effectTag;
          if (_effectTag & ShouldCapture) {
            workInProgress.effectTag = _effectTag & ~ShouldCapture | DidCapture;
            return workInProgress;
          }
          return null;
        }
      case HostComponent:
        {
          popHostContext(workInProgress);
          return null;
        }
      case HostPortal:
        popHostContainer(workInProgress);
        return null;
      case ContextProvider:
        popProvider(workInProgress);
        return null;
      default:
        return null;
    }
  }

  function unwindInterruptedWork(interruptedWork) {
    switch (interruptedWork.tag) {
      case ClassComponent:
        {
          popLegacyContextProvider(interruptedWork);
          break;
        }
      case HostRoot:
        {
          popHostContainer(interruptedWork);
          popTopLevelLegacyContextObject(interruptedWork);
          break;
        }
      case HostComponent:
        {
          popHostContext(interruptedWork);
          break;
        }
      case HostPortal:
        popHostContainer(interruptedWork);
        break;
      case ContextProvider:
        popProvider(interruptedWork);
        break;
      default:
        break;
    }
  }

  return {
    throwException: throwException,
    unwindWork: unwindWork,
    unwindInterruptedWork: unwindInterruptedWork
  };
};

// This module is forked in different environments.
// By default, return `true` to log errors to the console.
// Forks can return `false` if this isn't desirable.
function showErrorDialog(capturedError) {
  return true;
}

function logCapturedError(capturedError) {
  var logError = showErrorDialog(capturedError);

  // Allow injected showErrorDialog() to prevent default console.error logging.
  // This enables renderers like ReactNative to better manage redbox behavior.
  if (logError === false) {
    return;
  }

  var error = capturedError.error;
  var suppressLogging = error && error.suppressReactErrorLogging;
  if (suppressLogging) {
    return;
  }

  {
    var componentName = capturedError.componentName,
        componentStack = capturedError.componentStack,
        errorBoundaryName = capturedError.errorBoundaryName,
        errorBoundaryFound = capturedError.errorBoundaryFound,
        willRetry = capturedError.willRetry;


    var componentNameMessage = componentName ? 'The above error occurred in the <' + componentName + '> component:' : 'The above error occurred in one of your React components:';

    var errorBoundaryMessage = void 0;
    // errorBoundaryFound check is sufficient; errorBoundaryName check is to satisfy Flow.
    if (errorBoundaryFound && errorBoundaryName) {
      if (willRetry) {
        errorBoundaryMessage = 'React will try to recreate this component tree from scratch ' + ('using the error boundary you provided, ' + errorBoundaryName + '.');
      } else {
        errorBoundaryMessage = 'This error was initially handled by the error boundary ' + errorBoundaryName + '.\n' + 'Recreating the tree from scratch failed so React will unmount the tree.';
      }
    } else {
      errorBoundaryMessage = 'Consider adding an error boundary to your tree to customize error handling behavior.\n' + 'Visit https://fb.me/react-error-boundaries to learn more about error boundaries.';
    }
    var combinedMessage = '' + componentNameMessage + componentStack + '\n\n' + ('' + errorBoundaryMessage);

    // In development, we provide our own message with just the component stack.
    // We don't include the original error message and JS stack because the browser
    // has already printed it. Even if the application swallows the error, it is still
    // displayed by the browser thanks to the DEV-only fake event trick in ReactErrorUtils.
    console.error(combinedMessage);
  }
}

var invokeGuardedCallback$3 = ReactErrorUtils.invokeGuardedCallback;
var hasCaughtError$1 = ReactErrorUtils.hasCaughtError;
var clearCaughtError$1 = ReactErrorUtils.clearCaughtError;


var didWarnAboutUndefinedSnapshotBeforeUpdate = null;
{
  didWarnAboutUndefinedSnapshotBeforeUpdate = new Set();
}

function logError(boundary, errorInfo) {
  var source = errorInfo.source;
  var stack = errorInfo.stack;
  if (stack === null) {
    stack = getStackAddendumByWorkInProgressFiber(source);
  }

  var capturedError = {
    componentName: source !== null ? getComponentName(source) : null,
    componentStack: stack !== null ? stack : '',
    error: errorInfo.value,
    errorBoundary: null,
    errorBoundaryName: null,
    errorBoundaryFound: false,
    willRetry: false
  };

  if (boundary !== null && boundary.tag === ClassComponent) {
    capturedError.errorBoundary = boundary.stateNode;
    capturedError.errorBoundaryName = getComponentName(boundary);
    capturedError.errorBoundaryFound = true;
    capturedError.willRetry = true;
  }

  try {
    logCapturedError(capturedError);
  } catch (e) {
    // Prevent cycle if logCapturedError() throws.
    // A cycle may still occur if logCapturedError renders a component that throws.
    var suppressLogging = e && e.suppressReactErrorLogging;
    if (!suppressLogging) {
      console.error(e);
    }
  }
}

var ReactFiberCommitWork = function (config, captureError, scheduleWork, computeExpirationForFiber, markLegacyErrorBoundaryAsFailed, recalculateCurrentTime) {
  var getPublicInstance = config.getPublicInstance,
      mutation = config.mutation,
      persistence = config.persistence;


  var callComponentWillUnmountWithTimer = function (current, instance) {
    startPhaseTimer(current, 'componentWillUnmount');
    instance.props = current.memoizedProps;
    instance.state = current.memoizedState;
    instance.componentWillUnmount();
    stopPhaseTimer();
  };

  // Capture errors so they don't interrupt unmounting.
  function safelyCallComponentWillUnmount(current, instance) {
    {
      invokeGuardedCallback$3(null, callComponentWillUnmountWithTimer, null, current, instance);
      if (hasCaughtError$1()) {
        var unmountError = clearCaughtError$1();
        captureError(current, unmountError);
      }
    }
  }

  function safelyDetachRef(current) {
    var ref = current.ref;
    if (ref !== null) {
      if (typeof ref === 'function') {
        {
          invokeGuardedCallback$3(null, ref, null, null);
          if (hasCaughtError$1()) {
            var refError = clearCaughtError$1();
            captureError(current, refError);
          }
        }
      } else {
        ref.current = null;
      }
    }
  }

  function commitBeforeMutationLifeCycles(current, finishedWork) {
    switch (finishedWork.tag) {
      case ClassComponent:
        {
          if (finishedWork.effectTag & Snapshot) {
            if (current !== null) {
              var prevProps = current.memoizedProps;
              var prevState = current.memoizedState;
              startPhaseTimer(finishedWork, 'getSnapshotBeforeUpdate');
              var _instance = finishedWork.stateNode;
              _instance.props = finishedWork.memoizedProps;
              _instance.state = finishedWork.memoizedState;
              var snapshot = _instance.getSnapshotBeforeUpdate(prevProps, prevState);
              {
                var didWarnSet = didWarnAboutUndefinedSnapshotBeforeUpdate;
                if (snapshot === undefined && !didWarnSet.has(finishedWork.type)) {
                  didWarnSet.add(finishedWork.type);
                  warning(false, '%s.getSnapshotBeforeUpdate(): A snapshot value (or null) ' + 'must be returned. You have returned undefined.', getComponentName(finishedWork));
                }
              }
              _instance.__reactInternalSnapshotBeforeUpdate = snapshot;
              stopPhaseTimer();
            }
          }
          return;
        }
      case HostRoot:
      case HostComponent:
      case HostText:
      case HostPortal:
        // Nothing to do for these component types
        return;
      default:
        {
          invariant(false, 'This unit of work tag should not have side-effects. This error is likely caused by a bug in React. Please file an issue.');
        }
    }
  }

  function commitLifeCycles(finishedRoot, current, finishedWork, currentTime, committedExpirationTime) {
    switch (finishedWork.tag) {
      case ClassComponent:
        {
          var _instance2 = finishedWork.stateNode;
          if (finishedWork.effectTag & Update) {
            if (current === null) {
              startPhaseTimer(finishedWork, 'componentDidMount');
              _instance2.props = finishedWork.memoizedProps;
              _instance2.state = finishedWork.memoizedState;
              _instance2.componentDidMount();
              stopPhaseTimer();
            } else {
              var prevProps = current.memoizedProps;
              var prevState = current.memoizedState;
              startPhaseTimer(finishedWork, 'componentDidUpdate');
              _instance2.props = finishedWork.memoizedProps;
              _instance2.state = finishedWork.memoizedState;
              _instance2.componentDidUpdate(prevProps, prevState, _instance2.__reactInternalSnapshotBeforeUpdate);
              stopPhaseTimer();
            }
          }
          var updateQueue = finishedWork.updateQueue;
          if (updateQueue !== null) {
            commitCallbacks(updateQueue, _instance2);
          }
          return;
        }
      case HostRoot:
        {
          var _updateQueue = finishedWork.updateQueue;
          if (_updateQueue !== null) {
            var _instance3 = null;
            if (finishedWork.child !== null) {
              switch (finishedWork.child.tag) {
                case HostComponent:
                  _instance3 = getPublicInstance(finishedWork.child.stateNode);
                  break;
                case ClassComponent:
                  _instance3 = finishedWork.child.stateNode;
                  break;
              }
            }
            commitCallbacks(_updateQueue, _instance3);
          }
          return;
        }
      case HostComponent:
        {
          var _instance4 = finishedWork.stateNode;

          // Renderers may schedule work to be done after host components are mounted
          // (eg DOM renderer may schedule auto-focus for inputs and form controls).
          // These effects should only be committed when components are first mounted,
          // aka when there is no current/alternate.
          if (current === null && finishedWork.effectTag & Update) {
            var type = finishedWork.type;
            var props = finishedWork.memoizedProps;
            commitMount(_instance4, type, props, finishedWork);
          }

          return;
        }
      case HostText:
        {
          // We have no life-cycles associated with text.
          return;
        }
      case HostPortal:
        {
          // We have no life-cycles associated with portals.
          return;
        }
      default:
        {
          invariant(false, 'This unit of work tag should not have side-effects. This error is likely caused by a bug in React. Please file an issue.');
        }
    }
  }

  function commitErrorLogging(finishedWork, onUncaughtError) {
    switch (finishedWork.tag) {
      case ClassComponent:
        {
          var ctor = finishedWork.type;
          var _instance5 = finishedWork.stateNode;
          var updateQueue = finishedWork.updateQueue;
          !(updateQueue !== null && updateQueue.capturedValues !== null) ? invariant(false, 'An error logging effect should not have been scheduled if no errors were captured. This error is likely caused by a bug in React. Please file an issue.') : void 0;
          var capturedErrors = updateQueue.capturedValues;
          updateQueue.capturedValues = null;

          if (typeof ctor.getDerivedStateFromCatch !== 'function') {
            // To preserve the preexisting retry behavior of error boundaries,
            // we keep track of which ones already failed during this batch.
            // This gets reset before we yield back to the browser.
            // TODO: Warn in strict mode if getDerivedStateFromCatch is
            // not defined.
            markLegacyErrorBoundaryAsFailed(_instance5);
          }

          _instance5.props = finishedWork.memoizedProps;
          _instance5.state = finishedWork.memoizedState;
          for (var i = 0; i < capturedErrors.length; i++) {
            var errorInfo = capturedErrors[i];
            var _error = errorInfo.value;
            var stack = errorInfo.stack;
            logError(finishedWork, errorInfo);
            _instance5.componentDidCatch(_error, {
              componentStack: stack !== null ? stack : ''
            });
          }
        }
        break;
      case HostRoot:
        {
          var _updateQueue2 = finishedWork.updateQueue;
          !(_updateQueue2 !== null && _updateQueue2.capturedValues !== null) ? invariant(false, 'An error logging effect should not have been scheduled if no errors were captured. This error is likely caused by a bug in React. Please file an issue.') : void 0;
          var _capturedErrors = _updateQueue2.capturedValues;
          _updateQueue2.capturedValues = null;
          for (var _i = 0; _i < _capturedErrors.length; _i++) {
            var _errorInfo = _capturedErrors[_i];
            logError(finishedWork, _errorInfo);
            onUncaughtError(_errorInfo.value);
          }
          break;
        }
      default:
        invariant(false, 'This unit of work tag cannot capture errors.  This error is likely caused by a bug in React. Please file an issue.');
    }
  }

  function commitAttachRef(finishedWork) {
    var ref = finishedWork.ref;
    if (ref !== null) {
      var _instance6 = finishedWork.stateNode;
      var instanceToUse = void 0;
      switch (finishedWork.tag) {
        case HostComponent:
          instanceToUse = getPublicInstance(_instance6);
          break;
        default:
          instanceToUse = _instance6;
      }
      if (typeof ref === 'function') {
        ref(instanceToUse);
      } else {
        {
          if (!ref.hasOwnProperty('current')) {
            warning(false, 'Unexpected ref object provided for %s. ' + 'Use either a ref-setter function or React.createRef().%s', getComponentName(finishedWork), getStackAddendumByWorkInProgressFiber(finishedWork));
          }
        }

        ref.current = instanceToUse;
      }
    }
  }

  function commitDetachRef(current) {
    var currentRef = current.ref;
    if (currentRef !== null) {
      if (typeof currentRef === 'function') {
        currentRef(null);
      } else {
        currentRef.current = null;
      }
    }
  }

  // User-originating errors (lifecycles and refs) should not interrupt
  // deletion, so don't let them throw. Host-originating errors should
  // interrupt deletion, so it's okay
  function commitUnmount(current) {
    if (typeof onCommitUnmount === 'function') {
      onCommitUnmount(current);
    }

    switch (current.tag) {
      case ClassComponent:
        {
          safelyDetachRef(current);
          var _instance7 = current.stateNode;
          if (typeof _instance7.componentWillUnmount === 'function') {
            safelyCallComponentWillUnmount(current, _instance7);
          }
          return;
        }
      case HostComponent:
        {
          safelyDetachRef(current);
          return;
        }
      case CallComponent:
        {
          commitNestedUnmounts(current.stateNode);
          return;
        }
      case HostPortal:
        {
          // TODO: this is recursive.
          // We are also not using this parent because
          // the portal will get pushed immediately.
          if (enableMutatingReconciler && mutation) {
            unmountHostComponents(current);
          } else if (enablePersistentReconciler && persistence) {
            emptyPortalContainer(current);
          }
          return;
        }
    }
  }

  function commitNestedUnmounts(root) {
    // While we're inside a removed host node we don't want to call
    // removeChild on the inner nodes because they're removed by the top
    // call anyway. We also want to call componentWillUnmount on all
    // composites before this host node is removed from the tree. Therefore
    var node = root;
    while (true) {
      commitUnmount(node);
      // Visit children because they may contain more composite or host nodes.
      // Skip portals because commitUnmount() currently visits them recursively.
      if (node.child !== null && (
      // If we use mutation we drill down into portals using commitUnmount above.
      // If we don't use mutation we drill down into portals here instead.
      !mutation || node.tag !== HostPortal)) {
        node.child['return'] = node;
        node = node.child;
        continue;
      }
      if (node === root) {
        return;
      }
      while (node.sibling === null) {
        if (node['return'] === null || node['return'] === root) {
          return;
        }
        node = node['return'];
      }
      node.sibling['return'] = node['return'];
      node = node.sibling;
    }
  }

  function detachFiber(current) {
    // Cut off the return pointers to disconnect it from the tree. Ideally, we
    // should clear the child pointer of the parent alternate to let this
    // get GC:ed but we don't know which for sure which parent is the current
    // one so we'll settle for GC:ing the subtree of this child. This child
    // itself will be GC:ed when the parent updates the next time.
    current['return'] = null;
    current.child = null;
    if (current.alternate) {
      current.alternate.child = null;
      current.alternate['return'] = null;
    }
  }

  var emptyPortalContainer = void 0;

  if (!mutation) {
    var commitContainer = void 0;
    if (persistence) {
      var replaceContainerChildren = persistence.replaceContainerChildren,
          createContainerChildSet = persistence.createContainerChildSet;

      emptyPortalContainer = function (current) {
        var portal = current.stateNode;
        var containerInfo = portal.containerInfo;

        var emptyChildSet = createContainerChildSet(containerInfo);
        replaceContainerChildren(containerInfo, emptyChildSet);
      };
      commitContainer = function (finishedWork) {
        switch (finishedWork.tag) {
          case ClassComponent:
            {
              return;
            }
          case HostComponent:
            {
              return;
            }
          case HostText:
            {
              return;
            }
          case HostRoot:
          case HostPortal:
            {
              var portalOrRoot = finishedWork.stateNode;
              var containerInfo = portalOrRoot.containerInfo,
                  _pendingChildren = portalOrRoot.pendingChildren;

              replaceContainerChildren(containerInfo, _pendingChildren);
              return;
            }
          default:
            {
              invariant(false, 'This unit of work tag should not have side-effects. This error is likely caused by a bug in React. Please file an issue.');
            }
        }
      };
    } else {
      commitContainer = function (finishedWork) {
        // Noop
      };
    }
    if (enablePersistentReconciler || enableNoopReconciler) {
      return {
        commitResetTextContent: function (finishedWork) {},
        commitPlacement: function (finishedWork) {},
        commitDeletion: function (current) {
          // Detach refs and call componentWillUnmount() on the whole subtree.
          commitNestedUnmounts(current);
          detachFiber(current);
        },
        commitWork: function (current, finishedWork) {
          commitContainer(finishedWork);
        },

        commitLifeCycles: commitLifeCycles,
        commitBeforeMutationLifeCycles: commitBeforeMutationLifeCycles,
        commitErrorLogging: commitErrorLogging,
        commitAttachRef: commitAttachRef,
        commitDetachRef: commitDetachRef
      };
    } else if (persistence) {
      invariant(false, 'Persistent reconciler is disabled.');
    } else {
      invariant(false, 'Noop reconciler is disabled.');
    }
  }
  var commitMount = mutation.commitMount,
      commitUpdate = mutation.commitUpdate,
      resetTextContent = mutation.resetTextContent,
      commitTextUpdate = mutation.commitTextUpdate,
      appendChild = mutation.appendChild,
      appendChildToContainer = mutation.appendChildToContainer,
      insertBefore = mutation.insertBefore,
      insertInContainerBefore = mutation.insertInContainerBefore,
      removeChild = mutation.removeChild,
      removeChildFromContainer = mutation.removeChildFromContainer;


  function getHostParentFiber(fiber) {
    var parent = fiber['return'];
    while (parent !== null) {
      if (isHostParent(parent)) {
        return parent;
      }
      parent = parent['return'];
    }
    invariant(false, 'Expected to find a host parent. This error is likely caused by a bug in React. Please file an issue.');
  }

  function isHostParent(fiber) {
    return fiber.tag === HostComponent || fiber.tag === HostRoot || fiber.tag === HostPortal;
  }

  function getHostSibling(fiber) {
    // We're going to search forward into the tree until we find a sibling host
    // node. Unfortunately, if multiple insertions are done in a row we have to
    // search past them. This leads to exponential search for the next sibling.
    var node = fiber;
    siblings: while (true) {
      // If we didn't find anything, let's try the next sibling.
      while (node.sibling === null) {
        if (node['return'] === null || isHostParent(node['return'])) {
          // If we pop out of the root or hit the parent the fiber we are the
          // last sibling.
          return null;
        }
        node = node['return'];
      }
      node.sibling['return'] = node['return'];
      node = node.sibling;
      while (node.tag !== HostComponent && node.tag !== HostText) {
        // If it is not host node and, we might have a host node inside it.
        // Try to search down until we find one.
        if (node.effectTag & Placement) {
          // If we don't have a child, try the siblings instead.
          continue siblings;
        }
        // If we don't have a child, try the siblings instead.
        // We also skip portals because they are not part of this host tree.
        if (node.child === null || node.tag === HostPortal) {
          continue siblings;
        } else {
          node.child['return'] = node;
          node = node.child;
        }
      }
      // Check if this host node is stable or about to be placed.
      if (!(node.effectTag & Placement)) {
        // Found it!
        return node.stateNode;
      }
    }
  }

  function commitPlacement(finishedWork) {
    // Recursively insert all host nodes into the parent.
    var parentFiber = getHostParentFiber(finishedWork);
    var parent = void 0;
    var isContainer = void 0;
    switch (parentFiber.tag) {
      case HostComponent:
        parent = parentFiber.stateNode;
        isContainer = false;
        break;
      case HostRoot:
        parent = parentFiber.stateNode.containerInfo;
        isContainer = true;
        break;
      case HostPortal:
        parent = parentFiber.stateNode.containerInfo;
        isContainer = true;
        break;
      default:
        invariant(false, 'Invalid host parent fiber. This error is likely caused by a bug in React. Please file an issue.');
    }
    if (parentFiber.effectTag & ContentReset) {
      // Reset the text content of the parent before doing any insertions
      resetTextContent(parent);
      // Clear ContentReset from the effect tag
      parentFiber.effectTag &= ~ContentReset;
    }

    var before = getHostSibling(finishedWork);
    // We only have the top Fiber that was inserted but we need recurse down its
    // children to find all the terminal nodes.
    var node = finishedWork;
    while (true) {
      if (node.tag === HostComponent || node.tag === HostText) {
        if (before) {
          if (isContainer) {
            insertInContainerBefore(parent, node.stateNode, before);
          } else {
            insertBefore(parent, node.stateNode, before);
          }
        } else {
          if (isContainer) {
            appendChildToContainer(parent, node.stateNode);
          } else {
            appendChild(parent, node.stateNode);
          }
        }
      } else if (node.tag === HostPortal) {
        // If the insertion itself is a portal, then we don't want to traverse
        // down its children. Instead, we'll get insertions from each child in
        // the portal directly.
      } else if (node.child !== null) {
        node.child['return'] = node;
        node = node.child;
        continue;
      }
      if (node === finishedWork) {
        return;
      }
      while (node.sibling === null) {
        if (node['return'] === null || node['return'] === finishedWork) {
          return;
        }
        node = node['return'];
      }
      node.sibling['return'] = node['return'];
      node = node.sibling;
    }
  }

  function unmountHostComponents(current) {
    // We only have the top Fiber that was inserted but we need recurse down its
    var node = current;

    // Each iteration, currentParent is populated with node's host parent if not
    // currentParentIsValid.
    var currentParentIsValid = false;
    var currentParent = void 0;
    var currentParentIsContainer = void 0;

    while (true) {
      if (!currentParentIsValid) {
        var parent = node['return'];
        findParent: while (true) {
          !(parent !== null) ? invariant(false, 'Expected to find a host parent. This error is likely caused by a bug in React. Please file an issue.') : void 0;
          switch (parent.tag) {
            case HostComponent:
              currentParent = parent.stateNode;
              currentParentIsContainer = false;
              break findParent;
            case HostRoot:
              currentParent = parent.stateNode.containerInfo;
              currentParentIsContainer = true;
              break findParent;
            case HostPortal:
              currentParent = parent.stateNode.containerInfo;
              currentParentIsContainer = true;
              break findParent;
          }
          parent = parent['return'];
        }
        currentParentIsValid = true;
      }

      if (node.tag === HostComponent || node.tag === HostText) {
        commitNestedUnmounts(node);
        // After all the children have unmounted, it is now safe to remove the
        // node from the tree.
        if (currentParentIsContainer) {
          removeChildFromContainer(currentParent, node.stateNode);
        } else {
          removeChild(currentParent, node.stateNode);
        }
        // Don't visit children because we already visited them.
      } else if (node.tag === HostPortal) {
        // When we go into a portal, it becomes the parent to remove from.
        // We will reassign it back when we pop the portal on the way up.
        currentParent = node.stateNode.containerInfo;
        // Visit children because portals might contain host components.
        if (node.child !== null) {
          node.child['return'] = node;
          node = node.child;
          continue;
        }
      } else {
        commitUnmount(node);
        // Visit children because we may find more host components below.
        if (node.child !== null) {
          node.child['return'] = node;
          node = node.child;
          continue;
        }
      }
      if (node === current) {
        return;
      }
      while (node.sibling === null) {
        if (node['return'] === null || node['return'] === current) {
          return;
        }
        node = node['return'];
        if (node.tag === HostPortal) {
          // When we go out of the portal, we need to restore the parent.
          // Since we don't keep a stack of them, we will search for it.
          currentParentIsValid = false;
        }
      }
      node.sibling['return'] = node['return'];
      node = node.sibling;
    }
  }

  function commitDeletion(current) {
    // Recursively delete all host nodes from the parent.
    // Detach refs and call componentWillUnmount() on the whole subtree.
    unmountHostComponents(current);
    detachFiber(current);
  }

  function commitWork(current, finishedWork) {
    switch (finishedWork.tag) {
      case ClassComponent:
        {
          return;
        }
      case HostComponent:
        {
          var _instance8 = finishedWork.stateNode;
          if (_instance8 != null) {
            // Commit the work prepared earlier.
            var newProps = finishedWork.memoizedProps;
            // For hydration we reuse the update path but we treat the oldProps
            // as the newProps. The updatePayload will contain the real change in
            // this case.
            var oldProps = current !== null ? current.memoizedProps : newProps;
            var type = finishedWork.type;
            // TODO: Type the updateQueue to be specific to host components.
            var updatePayload = finishedWork.updateQueue;
            finishedWork.updateQueue = null;
            if (updatePayload !== null) {
              commitUpdate(_instance8, updatePayload, type, oldProps, newProps, finishedWork);
            }
          }
          return;
        }
      case HostText:
        {
          !(finishedWork.stateNode !== null) ? invariant(false, 'This should have a text node initialized. This error is likely caused by a bug in React. Please file an issue.') : void 0;
          var textInstance = finishedWork.stateNode;
          var newText = finishedWork.memoizedProps;
          // For hydration we reuse the update path but we treat the oldProps
          // as the newProps. The updatePayload will contain the real change in
          // this case.
          var oldText = current !== null ? current.memoizedProps : newText;
          commitTextUpdate(textInstance, oldText, newText);
          return;
        }
      case HostRoot:
        {
          return;
        }
      default:
        {
          invariant(false, 'This unit of work tag should not have side-effects. This error is likely caused by a bug in React. Please file an issue.');
        }
    }
  }

  function commitResetTextContent(current) {
    resetTextContent(current.stateNode);
  }

  if (enableMutatingReconciler) {
    return {
      commitBeforeMutationLifeCycles: commitBeforeMutationLifeCycles,
      commitResetTextContent: commitResetTextContent,
      commitPlacement: commitPlacement,
      commitDeletion: commitDeletion,
      commitWork: commitWork,
      commitLifeCycles: commitLifeCycles,
      commitErrorLogging: commitErrorLogging,
      commitAttachRef: commitAttachRef,
      commitDetachRef: commitDetachRef
    };
  } else {
    invariant(false, 'Mutating reconciler is disabled.');
  }
};

var NO_CONTEXT = {};

var ReactFiberHostContext = function (config, stack) {
  var getChildHostContext = config.getChildHostContext,
      getRootHostContext = config.getRootHostContext;
  var createCursor = stack.createCursor,
      push = stack.push,
      pop = stack.pop;


  var contextStackCursor = createCursor(NO_CONTEXT);
  var contextFiberStackCursor = createCursor(NO_CONTEXT);
  var rootInstanceStackCursor = createCursor(NO_CONTEXT);

  function requiredContext(c) {
    !(c !== NO_CONTEXT) ? invariant(false, 'Expected host context to exist. This error is likely caused by a bug in React. Please file an issue.') : void 0;
    return c;
  }

  function getRootHostContainer() {
    var rootInstance = requiredContext(rootInstanceStackCursor.current);
    return rootInstance;
  }

  function pushHostContainer(fiber, nextRootInstance) {
    // Push current root instance onto the stack;
    // This allows us to reset root when portals are popped.
    push(rootInstanceStackCursor, nextRootInstance, fiber);
    // Track the context and the Fiber that provided it.
    // This enables us to pop only Fibers that provide unique contexts.
    push(contextFiberStackCursor, fiber, fiber);

    // Finally, we need to push the host context to the stack.
    // However, we can't just call getRootHostContext() and push it because
    // we'd have a different number of entries on the stack depending on
    // whether getRootHostContext() throws somewhere in renderer code or not.
    // So we push an empty value first. This lets us safely unwind on errors.
    push(contextStackCursor, NO_CONTEXT, fiber);
    var nextRootContext = getRootHostContext(nextRootInstance);
    // Now that we know this function doesn't throw, replace it.
    pop(contextStackCursor, fiber);
    push(contextStackCursor, nextRootContext, fiber);
  }

  function popHostContainer(fiber) {
    pop(contextStackCursor, fiber);
    pop(contextFiberStackCursor, fiber);
    pop(rootInstanceStackCursor, fiber);
  }

  function getHostContext() {
    var context = requiredContext(contextStackCursor.current);
    return context;
  }

  function pushHostContext(fiber) {
    var rootInstance = requiredContext(rootInstanceStackCursor.current);
    var context = requiredContext(contextStackCursor.current);
    var nextContext = getChildHostContext(context, fiber.type, rootInstance);

    // Don't push this Fiber's context unless it's unique.
    if (context === nextContext) {
      return;
    }

    // Track the context and the Fiber that provided it.
    // This enables us to pop only Fibers that provide unique contexts.
    push(contextFiberStackCursor, fiber, fiber);
    push(contextStackCursor, nextContext, fiber);
  }

  function popHostContext(fiber) {
    // Do not pop unless this Fiber provided the current context.
    // pushHostContext() only pushes Fibers that provide unique contexts.
    if (contextFiberStackCursor.current !== fiber) {
      return;
    }

    pop(contextStackCursor, fiber);
    pop(contextFiberStackCursor, fiber);
  }

  return {
    getHostContext: getHostContext,
    getRootHostContainer: getRootHostContainer,
    popHostContainer: popHostContainer,
    popHostContext: popHostContext,
    pushHostContainer: pushHostContainer,
    pushHostContext: pushHostContext
  };
};

var ReactFiberHydrationContext = function (config) {
  var shouldSetTextContent = config.shouldSetTextContent,
      hydration = config.hydration;

  // If this doesn't have hydration mode.

  if (!hydration) {
    return {
      enterHydrationState: function () {
        return false;
      },
      resetHydrationState: function () {},
      tryToClaimNextHydratableInstance: function () {},
      prepareToHydrateHostInstance: function () {
        invariant(false, 'Expected prepareToHydrateHostInstance() to never be called. This error is likely caused by a bug in React. Please file an issue.');
      },
      prepareToHydrateHostTextInstance: function () {
        invariant(false, 'Expected prepareToHydrateHostTextInstance() to never be called. This error is likely caused by a bug in React. Please file an issue.');
      },
      popHydrationState: function (fiber) {
        return false;
      }
    };
  }

  var canHydrateInstance = hydration.canHydrateInstance,
      canHydrateTextInstance = hydration.canHydrateTextInstance,
      getNextHydratableSibling = hydration.getNextHydratableSibling,
      getFirstHydratableChild = hydration.getFirstHydratableChild,
      hydrateInstance = hydration.hydrateInstance,
      hydrateTextInstance = hydration.hydrateTextInstance,
      didNotMatchHydratedContainerTextInstance = hydration.didNotMatchHydratedContainerTextInstance,
      didNotMatchHydratedTextInstance = hydration.didNotMatchHydratedTextInstance,
      didNotHydrateContainerInstance = hydration.didNotHydrateContainerInstance,
      didNotHydrateInstance = hydration.didNotHydrateInstance,
      didNotFindHydratableContainerInstance = hydration.didNotFindHydratableContainerInstance,
      didNotFindHydratableContainerTextInstance = hydration.didNotFindHydratableContainerTextInstance,
      didNotFindHydratableInstance = hydration.didNotFindHydratableInstance,
      didNotFindHydratableTextInstance = hydration.didNotFindHydratableTextInstance;

  // The deepest Fiber on the stack involved in a hydration context.
  // This may have been an insertion or a hydration.

  var hydrationParentFiber = null;
  var nextHydratableInstance = null;
  var isHydrating = false;

  function enterHydrationState(fiber) {
    var parentInstance = fiber.stateNode.containerInfo;
    nextHydratableInstance = getFirstHydratableChild(parentInstance);
    hydrationParentFiber = fiber;
    isHydrating = true;
    return true;
  }

  function deleteHydratableInstance(returnFiber, instance) {
    {
      switch (returnFiber.tag) {
        case HostRoot:
          didNotHydrateContainerInstance(returnFiber.stateNode.containerInfo, instance);
          break;
        case HostComponent:
          didNotHydrateInstance(returnFiber.type, returnFiber.memoizedProps, returnFiber.stateNode, instance);
          break;
      }
    }

    var childToDelete = createFiberFromHostInstanceForDeletion();
    childToDelete.stateNode = instance;
    childToDelete['return'] = returnFiber;
    childToDelete.effectTag = Deletion;

    // This might seem like it belongs on progressedFirstDeletion. However,
    // these children are not part of the reconciliation list of children.
    // Even if we abort and rereconcile the children, that will try to hydrate
    // again and the nodes are still in the host tree so these will be
    // recreated.
    if (returnFiber.lastEffect !== null) {
      returnFiber.lastEffect.nextEffect = childToDelete;
      returnFiber.lastEffect = childToDelete;
    } else {
      returnFiber.firstEffect = returnFiber.lastEffect = childToDelete;
    }
  }

  function insertNonHydratedInstance(returnFiber, fiber) {
    fiber.effectTag |= Placement;
    {
      switch (returnFiber.tag) {
        case HostRoot:
          {
            var parentContainer = returnFiber.stateNode.containerInfo;
            switch (fiber.tag) {
              case HostComponent:
                var type = fiber.type;
                var props = fiber.pendingProps;
                didNotFindHydratableContainerInstance(parentContainer, type, props);
                break;
              case HostText:
                var text = fiber.pendingProps;
                didNotFindHydratableContainerTextInstance(parentContainer, text);
                break;
            }
            break;
          }
        case HostComponent:
          {
            var parentType = returnFiber.type;
            var parentProps = returnFiber.memoizedProps;
            var parentInstance = returnFiber.stateNode;
            switch (fiber.tag) {
              case HostComponent:
                var _type = fiber.type;
                var _props = fiber.pendingProps;
                didNotFindHydratableInstance(parentType, parentProps, parentInstance, _type, _props);
                break;
              case HostText:
                var _text = fiber.pendingProps;
                didNotFindHydratableTextInstance(parentType, parentProps, parentInstance, _text);
                break;
            }
            break;
          }
        default:
          return;
      }
    }
  }

  function tryHydrate(fiber, nextInstance) {
    switch (fiber.tag) {
      case HostComponent:
        {
          var type = fiber.type;
          var props = fiber.pendingProps;
          var instance = canHydrateInstance(nextInstance, type, props);
          if (instance !== null) {
            fiber.stateNode = instance;
            return true;
          }
          return false;
        }
      case HostText:
        {
          var text = fiber.pendingProps;
          var textInstance = canHydrateTextInstance(nextInstance, text);
          if (textInstance !== null) {
            fiber.stateNode = textInstance;
            return true;
          }
          return false;
        }
      default:
        return false;
    }
  }

  function tryToClaimNextHydratableInstance(fiber) {
    if (!isHydrating) {
      return;
    }
    var nextInstance = nextHydratableInstance;
    if (!nextInstance) {
      // Nothing to hydrate. Make it an insertion.
      insertNonHydratedInstance(hydrationParentFiber, fiber);
      isHydrating = false;
      hydrationParentFiber = fiber;
      return;
    }
    if (!tryHydrate(fiber, nextInstance)) {
      // If we can't hydrate this instance let's try the next one.
      // We use this as a heuristic. It's based on intuition and not data so it
      // might be flawed or unnecessary.
      nextInstance = getNextHydratableSibling(nextInstance);
      if (!nextInstance || !tryHydrate(fiber, nextInstance)) {
        // Nothing to hydrate. Make it an insertion.
        insertNonHydratedInstance(hydrationParentFiber, fiber);
        isHydrating = false;
        hydrationParentFiber = fiber;
        return;
      }
      // We matched the next one, we'll now assume that the first one was
      // superfluous and we'll delete it. Since we can't eagerly delete it
      // we'll have to schedule a deletion. To do that, this node needs a dummy
      // fiber associated with it.
      deleteHydratableInstance(hydrationParentFiber, nextHydratableInstance);
    }
    hydrationParentFiber = fiber;
    nextHydratableInstance = getFirstHydratableChild(nextInstance);
  }

  function prepareToHydrateHostInstance(fiber, rootContainerInstance, hostContext) {
    var instance = fiber.stateNode;
    var updatePayload = hydrateInstance(instance, fiber.type, fiber.memoizedProps, rootContainerInstance, hostContext, fiber);
    // TODO: Type this specific to this type of component.
    fiber.updateQueue = updatePayload;
    // If the update payload indicates that there is a change or if there
    // is a new ref we mark this as an update.
    if (updatePayload !== null) {
      return true;
    }
    return false;
  }

  function prepareToHydrateHostTextInstance(fiber) {
    var textInstance = fiber.stateNode;
    var textContent = fiber.memoizedProps;
    var shouldUpdate = hydrateTextInstance(textInstance, textContent, fiber);
    {
      if (shouldUpdate) {
        // We assume that prepareToHydrateHostTextInstance is called in a context where the
        // hydration parent is the parent host component of this host text.
        var returnFiber = hydrationParentFiber;
        if (returnFiber !== null) {
          switch (returnFiber.tag) {
            case HostRoot:
              {
                var parentContainer = returnFiber.stateNode.containerInfo;
                didNotMatchHydratedContainerTextInstance(parentContainer, textInstance, textContent);
                break;
              }
            case HostComponent:
              {
                var parentType = returnFiber.type;
                var parentProps = returnFiber.memoizedProps;
                var parentInstance = returnFiber.stateNode;
                didNotMatchHydratedTextInstance(parentType, parentProps, parentInstance, textInstance, textContent);
                break;
              }
          }
        }
      }
    }
    return shouldUpdate;
  }

  function popToNextHostParent(fiber) {
    var parent = fiber['return'];
    while (parent !== null && parent.tag !== HostComponent && parent.tag !== HostRoot) {
      parent = parent['return'];
    }
    hydrationParentFiber = parent;
  }

  function popHydrationState(fiber) {
    if (fiber !== hydrationParentFiber) {
      // We're deeper than the current hydration context, inside an inserted
      // tree.
      return false;
    }
    if (!isHydrating) {
      // If we're not currently hydrating but we're in a hydration context, then
      // we were an insertion and now need to pop up reenter hydration of our
      // siblings.
      popToNextHostParent(fiber);
      isHydrating = true;
      return false;
    }

    var type = fiber.type;

    // If we have any remaining hydratable nodes, we need to delete them now.
    // We only do this deeper than head and body since they tend to have random
    // other nodes in them. We also ignore components with pure text content in
    // side of them.
    // TODO: Better heuristic.
    if (fiber.tag !== HostComponent || type !== 'head' && type !== 'body' && !shouldSetTextContent(type, fiber.memoizedProps)) {
      var nextInstance = nextHydratableInstance;
      while (nextInstance) {
        deleteHydratableInstance(fiber, nextInstance);
        nextInstance = getNextHydratableSibling(nextInstance);
      }
    }

    popToNextHostParent(fiber);
    nextHydratableInstance = hydrationParentFiber ? getNextHydratableSibling(fiber.stateNode) : null;
    return true;
  }

  function resetHydrationState() {
    hydrationParentFiber = null;
    nextHydratableInstance = null;
    isHydrating = false;
  }

  return {
    enterHydrationState: enterHydrationState,
    resetHydrationState: resetHydrationState,
    tryToClaimNextHydratableInstance: tryToClaimNextHydratableInstance,
    prepareToHydrateHostInstance: prepareToHydrateHostInstance,
    prepareToHydrateHostTextInstance: prepareToHydrateHostTextInstance,
    popHydrationState: popHydrationState
  };
};

// This lets us hook into Fiber to debug what it's doing.
// See https://github.com/facebook/react/pull/8033.
// This is not part of the public API, not even for React DevTools.
// You may only inject a debugTool if you work on React Fiber itself.
var ReactFiberInstrumentation = {
  debugTool: null
};

var ReactFiberInstrumentation_1 = ReactFiberInstrumentation;

var warnedAboutMissingGetChildContext = void 0;

{
  warnedAboutMissingGetChildContext = {};
}

var ReactFiberLegacyContext = function (stack) {
  var createCursor = stack.createCursor,
      push = stack.push,
      pop = stack.pop;

  // A cursor to the current merged context object on the stack.

  var contextStackCursor = createCursor(emptyObject);
  // A cursor to a boolean indicating whether the context has changed.
  var didPerformWorkStackCursor = createCursor(false);
  // Keep track of the previous context object that was on the stack.
  // We use this to get access to the parent context after we have already
  // pushed the next context provider, and now need to merge their contexts.
  var previousContext = emptyObject;

  function getUnmaskedContext(workInProgress) {
    var hasOwnContext = isContextProvider(workInProgress);
    if (hasOwnContext) {
      // If the fiber is a context provider itself, when we read its context
      // we have already pushed its own child context on the stack. A context
      // provider should not "see" its own child context. Therefore we read the
      // previous (parent) context instead for a context provider.
      return previousContext;
    }
    return contextStackCursor.current;
  }

  function cacheContext(workInProgress, unmaskedContext, maskedContext) {
    var instance = workInProgress.stateNode;
    instance.__reactInternalMemoizedUnmaskedChildContext = unmaskedContext;
    instance.__reactInternalMemoizedMaskedChildContext = maskedContext;
  }

  function getMaskedContext(workInProgress, unmaskedContext) {
    var type = workInProgress.type;
    var contextTypes = type.contextTypes;
    if (!contextTypes) {
      return emptyObject;
    }

    // Avoid recreating masked context unless unmasked context has changed.
    // Failing to do this will result in unnecessary calls to componentWillReceiveProps.
    // This may trigger infinite loops if componentWillReceiveProps calls setState.
    var instance = workInProgress.stateNode;
    if (instance && instance.__reactInternalMemoizedUnmaskedChildContext === unmaskedContext) {
      return instance.__reactInternalMemoizedMaskedChildContext;
    }

    var context = {};
    for (var key in contextTypes) {
      context[key] = unmaskedContext[key];
    }

    {
      var name = getComponentName(workInProgress) || 'Unknown';
      checkPropTypes(contextTypes, context, 'context', name, ReactDebugCurrentFiber.getCurrentFiberStackAddendum);
    }

    // Cache unmasked context so we can avoid recreating masked context unless necessary.
    // Context is created before the class component is instantiated so check for instance.
    if (instance) {
      cacheContext(workInProgress, unmaskedContext, context);
    }

    return context;
  }

  function hasContextChanged() {
    return didPerformWorkStackCursor.current;
  }

  function isContextConsumer(fiber) {
    return fiber.tag === ClassComponent && fiber.type.contextTypes != null;
  }

  function isContextProvider(fiber) {
    return fiber.tag === ClassComponent && fiber.type.childContextTypes != null;
  }

  function popContextProvider(fiber) {
    if (!isContextProvider(fiber)) {
      return;
    }

    pop(didPerformWorkStackCursor, fiber);
    pop(contextStackCursor, fiber);
  }

  function popTopLevelContextObject(fiber) {
    pop(didPerformWorkStackCursor, fiber);
    pop(contextStackCursor, fiber);
  }

  function pushTopLevelContextObject(fiber, context, didChange) {
    !(contextStackCursor.cursor == null) ? invariant(false, 'Unexpected context found on stack. This error is likely caused by a bug in React. Please file an issue.') : void 0;

    push(contextStackCursor, context, fiber);
    push(didPerformWorkStackCursor, didChange, fiber);
  }

  function processChildContext(fiber, parentContext) {
    var instance = fiber.stateNode;
    var childContextTypes = fiber.type.childContextTypes;

    // TODO (bvaughn) Replace this behavior with an invariant() in the future.
    // It has only been added in Fiber to match the (unintentional) behavior in Stack.
    if (typeof instance.getChildContext !== 'function') {
      {
        var componentName = getComponentName(fiber) || 'Unknown';

        if (!warnedAboutMissingGetChildContext[componentName]) {
          warnedAboutMissingGetChildContext[componentName] = true;
          warning(false, '%s.childContextTypes is specified but there is no getChildContext() method ' + 'on the instance. You can either define getChildContext() on %s or remove ' + 'childContextTypes from it.', componentName, componentName);
        }
      }
      return parentContext;
    }

    var childContext = void 0;
    {
      ReactDebugCurrentFiber.setCurrentPhase('getChildContext');
    }
    startPhaseTimer(fiber, 'getChildContext');
    childContext = instance.getChildContext();
    stopPhaseTimer();
    {
      ReactDebugCurrentFiber.setCurrentPhase(null);
    }
    for (var contextKey in childContext) {
      !(contextKey in childContextTypes) ? invariant(false, '%s.getChildContext(): key "%s" is not defined in childContextTypes.', getComponentName(fiber) || 'Unknown', contextKey) : void 0;
    }
    {
      var name = getComponentName(fiber) || 'Unknown';
      checkPropTypes(childContextTypes, childContext, 'child context', name,
      // In practice, there is one case in which we won't get a stack. It's when
      // somebody calls unstable_renderSubtreeIntoContainer() and we process
      // context from the parent component instance. The stack will be missing
      // because it's outside of the reconciliation, and so the pointer has not
      // been set. This is rare and doesn't matter. We'll also remove that API.
      ReactDebugCurrentFiber.getCurrentFiberStackAddendum);
    }

    return _assign({}, parentContext, childContext);
  }

  function pushContextProvider(workInProgress) {
    if (!isContextProvider(workInProgress)) {
      return false;
    }

    var instance = workInProgress.stateNode;
    // We push the context as early as possible to ensure stack integrity.
    // If the instance does not exist yet, we will push null at first,
    // and replace it on the stack later when invalidating the context.
    var memoizedMergedChildContext = instance && instance.__reactInternalMemoizedMergedChildContext || emptyObject;

    // Remember the parent context so we can merge with it later.
    // Inherit the parent's did-perform-work value to avoid inadvertently blocking updates.
    previousContext = contextStackCursor.current;
    push(contextStackCursor, memoizedMergedChildContext, workInProgress);
    push(didPerformWorkStackCursor, didPerformWorkStackCursor.current, workInProgress);

    return true;
  }

  function invalidateContextProvider(workInProgress, didChange) {
    var instance = workInProgress.stateNode;
    !instance ? invariant(false, 'Expected to have an instance by this point. This error is likely caused by a bug in React. Please file an issue.') : void 0;

    if (didChange) {
      // Merge parent and own context.
      // Skip this if we're not updating due to sCU.
      // This avoids unnecessarily recomputing memoized values.
      var mergedContext = processChildContext(workInProgress, previousContext);
      instance.__reactInternalMemoizedMergedChildContext = mergedContext;

      // Replace the old (or empty) context with the new one.
      // It is important to unwind the context in the reverse order.
      pop(didPerformWorkStackCursor, workInProgress);
      pop(contextStackCursor, workInProgress);
      // Now push the new context and mark that it has changed.
      push(contextStackCursor, mergedContext, workInProgress);
      push(didPerformWorkStackCursor, didChange, workInProgress);
    } else {
      pop(didPerformWorkStackCursor, workInProgress);
      push(didPerformWorkStackCursor, didChange, workInProgress);
    }
  }

  function findCurrentUnmaskedContext(fiber) {
    // Currently this is only used with renderSubtreeIntoContainer; not sure if it
    // makes sense elsewhere
    !(isFiberMounted(fiber) && fiber.tag === ClassComponent) ? invariant(false, 'Expected subtree parent to be a mounted class component. This error is likely caused by a bug in React. Please file an issue.') : void 0;

    var node = fiber;
    while (node.tag !== HostRoot) {
      if (isContextProvider(node)) {
        return node.stateNode.__reactInternalMemoizedMergedChildContext;
      }
      var parent = node['return'];
      !parent ? invariant(false, 'Found unexpected detached subtree parent. This error is likely caused by a bug in React. Please file an issue.') : void 0;
      node = parent;
    }
    return node.stateNode.context;
  }

  return {
    getUnmaskedContext: getUnmaskedContext,
    cacheContext: cacheContext,
    getMaskedContext: getMaskedContext,
    hasContextChanged: hasContextChanged,
    isContextConsumer: isContextConsumer,
    isContextProvider: isContextProvider,
    popContextProvider: popContextProvider,
    popTopLevelContextObject: popTopLevelContextObject,
    pushTopLevelContextObject: pushTopLevelContextObject,
    processChildContext: processChildContext,
    pushContextProvider: pushContextProvider,
    invalidateContextProvider: invalidateContextProvider,
    findCurrentUnmaskedContext: findCurrentUnmaskedContext
  };
};

var ReactFiberNewContext = function (stack) {
  var createCursor = stack.createCursor,
      push = stack.push,
      pop = stack.pop;


  var providerCursor = createCursor(null);
  var valueCursor = createCursor(null);
  var changedBitsCursor = createCursor(0);

  var rendererSigil = void 0;
  {
    // Use this to detect multiple renderers using the same context
    rendererSigil = {};
  }

  function pushProvider(providerFiber) {
    var context = providerFiber.type._context;

    push(changedBitsCursor, context._changedBits, providerFiber);
    push(valueCursor, context._currentValue, providerFiber);
    push(providerCursor, providerFiber, providerFiber);

    context._currentValue = providerFiber.pendingProps.value;
    context._changedBits = providerFiber.stateNode;

    {
      !(context._currentRenderer === null || context._currentRenderer === rendererSigil) ? warning(false, 'Detected multiple renderers concurrently rendering the ' + 'same context provider. This is currently unsupported.') : void 0;
      context._currentRenderer = rendererSigil;
    }
  }

  function popProvider(providerFiber) {
    var changedBits = changedBitsCursor.current;
    var currentValue = valueCursor.current;

    pop(providerCursor, providerFiber);
    pop(valueCursor, providerFiber);
    pop(changedBitsCursor, providerFiber);

    var context = providerFiber.type._context;
    context._currentValue = currentValue;
    context._changedBits = changedBits;
  }

  return {
    pushProvider: pushProvider,
    popProvider: popProvider
  };
};

var ReactFiberStack = function () {
  var valueStack = [];

  var fiberStack = void 0;

  {
    fiberStack = [];
  }

  var index = -1;

  function createCursor(defaultValue) {
    return {
      current: defaultValue
    };
  }

  function isEmpty() {
    return index === -1;
  }

  function pop(cursor, fiber) {
    if (index < 0) {
      {
        warning(false, 'Unexpected pop.');
      }
      return;
    }

    {
      if (fiber !== fiberStack[index]) {
        warning(false, 'Unexpected Fiber popped.');
      }
    }

    cursor.current = valueStack[index];

    valueStack[index] = null;

    {
      fiberStack[index] = null;
    }

    index--;
  }

  function push(cursor, value, fiber) {
    index++;

    valueStack[index] = cursor.current;

    {
      fiberStack[index] = fiber;
    }

    cursor.current = value;
  }

  function checkThatStackIsEmpty() {
    {
      if (index !== -1) {
        warning(false, 'Expected an empty stack. Something was not reset properly.');
      }
    }
  }

  function resetStackAfterFatalErrorInDev() {
    {
      index = -1;
      valueStack.length = 0;
      fiberStack.length = 0;
    }
  }

  return {
    createCursor: createCursor,
    isEmpty: isEmpty,
    pop: pop,
    push: push,
    checkThatStackIsEmpty: checkThatStackIsEmpty,
    resetStackAfterFatalErrorInDev: resetStackAfterFatalErrorInDev
  };
};

var invokeGuardedCallback$2 = ReactErrorUtils.invokeGuardedCallback;
var hasCaughtError = ReactErrorUtils.hasCaughtError;
var clearCaughtError = ReactErrorUtils.clearCaughtError;


var didWarnAboutStateTransition = void 0;
var didWarnSetStateChildContext = void 0;
var warnAboutUpdateOnUnmounted = void 0;
var warnAboutInvalidUpdates = void 0;

{
  didWarnAboutStateTransition = false;
  didWarnSetStateChildContext = false;
  var didWarnStateUpdateForUnmountedComponent = {};

  warnAboutUpdateOnUnmounted = function (fiber) {
    // We show the whole stack but dedupe on the top component's name because
    // the problematic code almost always lies inside that component.
    var componentName = getComponentName(fiber) || 'ReactClass';
    if (didWarnStateUpdateForUnmountedComponent[componentName]) {
      return;
    }
    warning(false, "Can't call setState (or forceUpdate) on an unmounted component. This " + 'is a no-op, but it indicates a memory leak in your application. To ' + 'fix, cancel all subscriptions and asynchronous tasks in the ' + 'componentWillUnmount method.%s', getStackAddendumByWorkInProgressFiber(fiber));
    didWarnStateUpdateForUnmountedComponent[componentName] = true;
  };

  warnAboutInvalidUpdates = function (instance) {
    switch (ReactDebugCurrentFiber.phase) {
      case 'getChildContext':
        if (didWarnSetStateChildContext) {
          return;
        }
        warning(false, 'setState(...): Cannot call setState() inside getChildContext()');
        didWarnSetStateChildContext = true;
        break;
      case 'render':
        if (didWarnAboutStateTransition) {
          return;
        }
        warning(false, 'Cannot update during an existing state transition (such as within ' + "`render` or another component's constructor). Render methods should " + 'be a pure function of props and state; constructor side-effects are ' + 'an anti-pattern, but can be moved to `componentWillMount`.');
        didWarnAboutStateTransition = true;
        break;
    }
  };
}

var ReactFiberScheduler = function (config) {
  var stack = ReactFiberStack();
  var hostContext = ReactFiberHostContext(config, stack);
  var legacyContext = ReactFiberLegacyContext(stack);
  var newContext = ReactFiberNewContext(stack);
  var popHostContext = hostContext.popHostContext,
      popHostContainer = hostContext.popHostContainer;
  var popTopLevelLegacyContextObject = legacyContext.popTopLevelContextObject,
      popLegacyContextProvider = legacyContext.popContextProvider;
  var popProvider = newContext.popProvider;

  var hydrationContext = ReactFiberHydrationContext(config);

  var _ReactFiberBeginWork = ReactFiberBeginWork(config, hostContext, legacyContext, newContext, hydrationContext, scheduleWork, computeExpirationForFiber),
      beginWork = _ReactFiberBeginWork.beginWork;

  var _ReactFiberCompleteWo = ReactFiberCompleteWork(config, hostContext, legacyContext, newContext, hydrationContext),
      completeWork = _ReactFiberCompleteWo.completeWork;

  var _ReactFiberUnwindWork = ReactFiberUnwindWork(hostContext, legacyContext, newContext, scheduleWork, isAlreadyFailedLegacyErrorBoundary),
      throwException = _ReactFiberUnwindWork.throwException,
      unwindWork = _ReactFiberUnwindWork.unwindWork,
      unwindInterruptedWork = _ReactFiberUnwindWork.unwindInterruptedWork;

  var _ReactFiberCommitWork = ReactFiberCommitWork(config, onCommitPhaseError, scheduleWork, computeExpirationForFiber, markLegacyErrorBoundaryAsFailed, recalculateCurrentTime),
      commitBeforeMutationLifeCycles = _ReactFiberCommitWork.commitBeforeMutationLifeCycles,
      commitResetTextContent = _ReactFiberCommitWork.commitResetTextContent,
      commitPlacement = _ReactFiberCommitWork.commitPlacement,
      commitDeletion = _ReactFiberCommitWork.commitDeletion,
      commitWork = _ReactFiberCommitWork.commitWork,
      commitLifeCycles = _ReactFiberCommitWork.commitLifeCycles,
      commitErrorLogging = _ReactFiberCommitWork.commitErrorLogging,
      commitAttachRef = _ReactFiberCommitWork.commitAttachRef,
      commitDetachRef = _ReactFiberCommitWork.commitDetachRef;

  var now = config.now,
      scheduleDeferredCallback = config.scheduleDeferredCallback,
      cancelDeferredCallback = config.cancelDeferredCallback,
      prepareForCommit = config.prepareForCommit,
      resetAfterCommit = config.resetAfterCommit;

  // Represents the current time in ms.

  var originalStartTimeMs = now();
  var mostRecentCurrentTime = msToExpirationTime(0);
  var mostRecentCurrentTimeMs = originalStartTimeMs;

  // Used to ensure computeUniqueAsyncExpiration is monotonically increases.
  var lastUniqueAsyncExpiration = 0;

  // Represents the expiration time that incoming updates should use. (If this
  // is NoWork, use the default strategy: async updates in async mode, sync
  // updates in sync mode.)
  var expirationContext = NoWork;

  var isWorking = false;

  // The next work in progress fiber that we're currently working on.
  var nextUnitOfWork = null;
  var nextRoot = null;
  // The time at which we're currently rendering work.
  var nextRenderExpirationTime = NoWork;

  // The next fiber with an effect that we're currently committing.
  var nextEffect = null;

  var isCommitting = false;

  var isRootReadyForCommit = false;

  var legacyErrorBoundariesThatAlreadyFailed = null;

  // Used for performance tracking.
  var interruptedBy = null;

  var stashedWorkInProgressProperties = void 0;
  var replayUnitOfWork = void 0;
  var isReplayingFailedUnitOfWork = void 0;
  var originalReplayError = void 0;
  var rethrowOriginalError = void 0;
  if (true && replayFailedUnitOfWorkWithInvokeGuardedCallback) {
    stashedWorkInProgressProperties = null;
    isReplayingFailedUnitOfWork = false;
    originalReplayError = null;
    replayUnitOfWork = function (failedUnitOfWork, error, isAsync) {
      // Restore the original state of the work-in-progress
      assignFiberPropertiesInDEV(failedUnitOfWork, stashedWorkInProgressProperties);
      switch (failedUnitOfWork.tag) {
        case HostRoot:
          popHostContainer(failedUnitOfWork);
          popTopLevelLegacyContextObject(failedUnitOfWork);
          break;
        case HostComponent:
          popHostContext(failedUnitOfWork);
          break;
        case ClassComponent:
          popLegacyContextProvider(failedUnitOfWork);
          break;
        case HostPortal:
          popHostContainer(failedUnitOfWork);
          break;
        case ContextProvider:
          popProvider(failedUnitOfWork);
          break;
      }
      // Replay the begin phase.
      isReplayingFailedUnitOfWork = true;
      originalReplayError = error;
      invokeGuardedCallback$2(null, workLoop, null, isAsync);
      isReplayingFailedUnitOfWork = false;
      originalReplayError = null;
      if (hasCaughtError()) {
        clearCaughtError();
      } else {
        // If the begin phase did not fail the second time, set this pointer
        // back to the original value.
        nextUnitOfWork = failedUnitOfWork;
      }
    };
    rethrowOriginalError = function () {
      throw originalReplayError;
    };
  }

  function resetStack() {
    if (nextUnitOfWork !== null) {
      var interruptedWork = nextUnitOfWork['return'];
      while (interruptedWork !== null) {
        unwindInterruptedWork(interruptedWork);
        interruptedWork = interruptedWork['return'];
      }
    }

    {
      ReactStrictModeWarnings.discardPendingWarnings();
      stack.checkThatStackIsEmpty();
    }

    nextRoot = null;
    nextRenderExpirationTime = NoWork;
    nextUnitOfWork = null;

    isRootReadyForCommit = false;
  }

  function commitAllHostEffects() {
    while (nextEffect !== null) {
      {
        ReactDebugCurrentFiber.setCurrentFiber(nextEffect);
      }
      recordEffect();

      var effectTag = nextEffect.effectTag;

      if (effectTag & ContentReset) {
        commitResetTextContent(nextEffect);
      }

      if (effectTag & Ref) {
        var current = nextEffect.alternate;
        if (current !== null) {
          commitDetachRef(current);
        }
      }

      // The following switch statement is only concerned about placement,
      // updates, and deletions. To avoid needing to add a case for every
      // possible bitmap value, we remove the secondary effects from the
      // effect tag and switch on that value.
      var primaryEffectTag = effectTag & (Placement | Update | Deletion);
      switch (primaryEffectTag) {
        case Placement:
          {
            commitPlacement(nextEffect);
            // Clear the "placement" from effect tag so that we know that this is inserted, before
            // any life-cycles like componentDidMount gets called.
            // TODO: findDOMNode doesn't rely on this any more but isMounted
            // does and isMounted is deprecated anyway so we should be able
            // to kill this.
            nextEffect.effectTag &= ~Placement;
            break;
          }
        case PlacementAndUpdate:
          {
            // Placement
            commitPlacement(nextEffect);
            // Clear the "placement" from effect tag so that we know that this is inserted, before
            // any life-cycles like componentDidMount gets called.
            nextEffect.effectTag &= ~Placement;

            // Update
            var _current = nextEffect.alternate;
            commitWork(_current, nextEffect);
            break;
          }
        case Update:
          {
            var _current2 = nextEffect.alternate;
            commitWork(_current2, nextEffect);
            break;
          }
        case Deletion:
          {
            commitDeletion(nextEffect);
            break;
          }
      }
      nextEffect = nextEffect.nextEffect;
    }

    {
      ReactDebugCurrentFiber.resetCurrentFiber();
    }
  }

  function commitBeforeMutationLifecycles() {
    while (nextEffect !== null) {
      var effectTag = nextEffect.effectTag;

      if (effectTag & Snapshot) {
        recordEffect();
        var current = nextEffect.alternate;
        commitBeforeMutationLifeCycles(current, nextEffect);
      }

      // Don't cleanup effects yet;
      // This will be done by commitAllLifeCycles()
      nextEffect = nextEffect.nextEffect;
    }
  }

  function commitAllLifeCycles(finishedRoot, currentTime, committedExpirationTime) {
    {
      ReactStrictModeWarnings.flushPendingUnsafeLifecycleWarnings();

      if (warnAboutDeprecatedLifecycles) {
        ReactStrictModeWarnings.flushPendingDeprecationWarnings();
      }
    }
    while (nextEffect !== null) {
      var effectTag = nextEffect.effectTag;

      if (effectTag & (Update | Callback)) {
        recordEffect();
        var current = nextEffect.alternate;
        commitLifeCycles(finishedRoot, current, nextEffect, currentTime, committedExpirationTime);
      }

      if (effectTag & ErrLog) {
        commitErrorLogging(nextEffect, onUncaughtError);
      }

      if (effectTag & Ref) {
        recordEffect();
        commitAttachRef(nextEffect);
      }

      var next = nextEffect.nextEffect;
      // Ensure that we clean these up so that we don't accidentally keep them.
      // I'm not actually sure this matters because we can't reset firstEffect
      // and lastEffect since they're on every node, not just the effectful
      // ones. So we have to clean everything as we reuse nodes anyway.
      nextEffect.nextEffect = null;
      // Ensure that we reset the effectTag here so that we can rely on effect
      // tags to reason about the current life-cycle.
      nextEffect = next;
    }
  }

  function isAlreadyFailedLegacyErrorBoundary(instance) {
    return legacyErrorBoundariesThatAlreadyFailed !== null && legacyErrorBoundariesThatAlreadyFailed.has(instance);
  }

  function markLegacyErrorBoundaryAsFailed(instance) {
    if (legacyErrorBoundariesThatAlreadyFailed === null) {
      legacyErrorBoundariesThatAlreadyFailed = new Set([instance]);
    } else {
      legacyErrorBoundariesThatAlreadyFailed.add(instance);
    }
  }

  function commitRoot(finishedWork) {
    isWorking = true;
    isCommitting = true;
    startCommitTimer();

    var root = finishedWork.stateNode;
    !(root.current !== finishedWork) ? invariant(false, 'Cannot commit the same tree as before. This is probably a bug related to the return field. This error is likely caused by a bug in React. Please file an issue.') : void 0;
    var committedExpirationTime = root.pendingCommitExpirationTime;
    !(committedExpirationTime !== NoWork) ? invariant(false, 'Cannot commit an incomplete root. This error is likely caused by a bug in React. Please file an issue.') : void 0;
    root.pendingCommitExpirationTime = NoWork;

    var currentTime = recalculateCurrentTime();

    // Reset this to null before calling lifecycles
    ReactCurrentOwner.current = null;

    var firstEffect = void 0;
    if (finishedWork.effectTag > PerformedWork) {
      // A fiber's effect list consists only of its children, not itself. So if
      // the root has an effect, we need to add it to the end of the list. The
      // resulting list is the set that would belong to the root's parent, if
      // it had one; that is, all the effects in the tree including the root.
      if (finishedWork.lastEffect !== null) {
        finishedWork.lastEffect.nextEffect = finishedWork;
        firstEffect = finishedWork.firstEffect;
      } else {
        firstEffect = finishedWork;
      }
    } else {
      // There is no effect on the root.
      firstEffect = finishedWork.firstEffect;
    }

    prepareForCommit(root.containerInfo);

    // Invoke instances of getSnapshotBeforeUpdate before mutation.
    nextEffect = firstEffect;
    startCommitSnapshotEffectsTimer();
    while (nextEffect !== null) {
      var didError = false;
      var error = void 0;
      {
        invokeGuardedCallback$2(null, commitBeforeMutationLifecycles, null);
        if (hasCaughtError()) {
          didError = true;
          error = clearCaughtError();
        }
      }
      if (didError) {
        !(nextEffect !== null) ? invariant(false, 'Should have next effect. This error is likely caused by a bug in React. Please file an issue.') : void 0;
        onCommitPhaseError(nextEffect, error);
        // Clean-up
        if (nextEffect !== null) {
          nextEffect = nextEffect.nextEffect;
        }
      }
    }
    stopCommitSnapshotEffectsTimer();

    // Commit all the side-effects within a tree. We'll do this in two passes.
    // The first pass performs all the host insertions, updates, deletions and
    // ref unmounts.
    nextEffect = firstEffect;
    startCommitHostEffectsTimer();
    while (nextEffect !== null) {
      var _didError = false;
      var _error = void 0;
      {
        invokeGuardedCallback$2(null, commitAllHostEffects, null);
        if (hasCaughtError()) {
          _didError = true;
          _error = clearCaughtError();
        }
      }
      if (_didError) {
        !(nextEffect !== null) ? invariant(false, 'Should have next effect. This error is likely caused by a bug in React. Please file an issue.') : void 0;
        onCommitPhaseError(nextEffect, _error);
        // Clean-up
        if (nextEffect !== null) {
          nextEffect = nextEffect.nextEffect;
        }
      }
    }
    stopCommitHostEffectsTimer();

    resetAfterCommit(root.containerInfo);

    // The work-in-progress tree is now the current tree. This must come after
    // the first pass of the commit phase, so that the previous tree is still
    // current during componentWillUnmount, but before the second pass, so that
    // the finished work is current during componentDidMount/Update.
    root.current = finishedWork;

    // In the second pass we'll perform all life-cycles and ref callbacks.
    // Life-cycles happen as a separate pass so that all placements, updates,
    // and deletions in the entire tree have already been invoked.
    // This pass also triggers any renderer-specific initial effects.
    nextEffect = firstEffect;
    startCommitLifeCyclesTimer();
    while (nextEffect !== null) {
      var _didError2 = false;
      var _error2 = void 0;
      {
        invokeGuardedCallback$2(null, commitAllLifeCycles, null, root, currentTime, committedExpirationTime);
        if (hasCaughtError()) {
          _didError2 = true;
          _error2 = clearCaughtError();
        }
      }
      if (_didError2) {
        !(nextEffect !== null) ? invariant(false, 'Should have next effect. This error is likely caused by a bug in React. Please file an issue.') : void 0;
        onCommitPhaseError(nextEffect, _error2);
        if (nextEffect !== null) {
          nextEffect = nextEffect.nextEffect;
        }
      }
    }

    isCommitting = false;
    isWorking = false;
    stopCommitLifeCyclesTimer();
    stopCommitTimer();
    if (typeof onCommitRoot === 'function') {
      onCommitRoot(finishedWork.stateNode);
    }
    if (true && ReactFiberInstrumentation_1.debugTool) {
      ReactFiberInstrumentation_1.debugTool.onCommitWork(finishedWork);
    }

    var remainingTime = root.current.expirationTime;
    if (remainingTime === NoWork) {
      // If there's no remaining work, we can clear the set of already failed
      // error boundaries.
      legacyErrorBoundariesThatAlreadyFailed = null;
    }
    return remainingTime;
  }

  function resetExpirationTime(workInProgress, renderTime) {
    if (renderTime !== Never && workInProgress.expirationTime === Never) {
      // The children of this component are hidden. Don't bubble their
      // expiration times.
      return;
    }

    // Check for pending updates.
    var newExpirationTime = getUpdateExpirationTime(workInProgress);

    // TODO: Calls need to visit stateNode

    // Bubble up the earliest expiration time.
    var child = workInProgress.child;
    while (child !== null) {
      if (child.expirationTime !== NoWork && (newExpirationTime === NoWork || newExpirationTime > child.expirationTime)) {
        newExpirationTime = child.expirationTime;
      }
      child = child.sibling;
    }
    workInProgress.expirationTime = newExpirationTime;
  }

  function completeUnitOfWork(workInProgress) {
    // Attempt to complete the current unit of work, then move to the
    // next sibling. If there are no more siblings, return to the
    // parent fiber.
    while (true) {
      // The current, flushed, state of this fiber is the alternate.
      // Ideally nothing should rely on this, but relying on it here
      // means that we don't need an additional field on the work in
      // progress.
      var current = workInProgress.alternate;
      {
        ReactDebugCurrentFiber.setCurrentFiber(workInProgress);
      }

      var returnFiber = workInProgress['return'];
      var siblingFiber = workInProgress.sibling;

      if ((workInProgress.effectTag & Incomplete) === NoEffect) {
        // This fiber completed.
        var next = completeWork(current, workInProgress, nextRenderExpirationTime);
        stopWorkTimer(workInProgress);
        resetExpirationTime(workInProgress, nextRenderExpirationTime);
        {
          ReactDebugCurrentFiber.resetCurrentFiber();
        }

        if (next !== null) {
          stopWorkTimer(workInProgress);
          if (true && ReactFiberInstrumentation_1.debugTool) {
            ReactFiberInstrumentation_1.debugTool.onCompleteWork(workInProgress);
          }
          // If completing this work spawned new work, do that next. We'll come
          // back here again.
          return next;
        }

        if (returnFiber !== null &&
        // Do not append effects to parents if a sibling failed to complete
        (returnFiber.effectTag & Incomplete) === NoEffect) {
          // Append all the effects of the subtree and this fiber onto the effect
          // list of the parent. The completion order of the children affects the
          // side-effect order.
          if (returnFiber.firstEffect === null) {
            returnFiber.firstEffect = workInProgress.firstEffect;
          }
          if (workInProgress.lastEffect !== null) {
            if (returnFiber.lastEffect !== null) {
              returnFiber.lastEffect.nextEffect = workInProgress.firstEffect;
            }
            returnFiber.lastEffect = workInProgress.lastEffect;
          }

          // If this fiber had side-effects, we append it AFTER the children's
          // side-effects. We can perform certain side-effects earlier if
          // needed, by doing multiple passes over the effect list. We don't want
          // to schedule our own side-effect on our own list because if end up
          // reusing children we'll schedule this effect onto itself since we're
          // at the end.
          var effectTag = workInProgress.effectTag;
          // Skip both NoWork and PerformedWork tags when creating the effect list.
          // PerformedWork effect is read by React DevTools but shouldn't be committed.
          if (effectTag > PerformedWork) {
            if (returnFiber.lastEffect !== null) {
              returnFiber.lastEffect.nextEffect = workInProgress;
            } else {
              returnFiber.firstEffect = workInProgress;
            }
            returnFiber.lastEffect = workInProgress;
          }
        }

        if (true && ReactFiberInstrumentation_1.debugTool) {
          ReactFiberInstrumentation_1.debugTool.onCompleteWork(workInProgress);
        }

        if (siblingFiber !== null) {
          // If there is more work to do in this returnFiber, do that next.
          return siblingFiber;
        } else if (returnFiber !== null) {
          // If there's no more work in this returnFiber. Complete the returnFiber.
          workInProgress = returnFiber;
          continue;
        } else {
          // We've reached the root.
          isRootReadyForCommit = true;
          return null;
        }
      } else {
        // This fiber did not complete because something threw. Pop values off
        // the stack without entering the complete phase. If this is a boundary,
        // capture values if possible.
        var _next = unwindWork(workInProgress);
        // Because this fiber did not complete, don't reset its expiration time.
        if (workInProgress.effectTag & DidCapture) {
          // Restarting an error boundary
          stopFailedWorkTimer(workInProgress);
        } else {
          stopWorkTimer(workInProgress);
        }

        {
          ReactDebugCurrentFiber.resetCurrentFiber();
        }

        if (_next !== null) {
          stopWorkTimer(workInProgress);
          if (true && ReactFiberInstrumentation_1.debugTool) {
            ReactFiberInstrumentation_1.debugTool.onCompleteWork(workInProgress);
          }
          // If completing this work spawned new work, do that next. We'll come
          // back here again.
          // Since we're restarting, remove anything that is not a host effect
          // from the effect tag.
          _next.effectTag &= HostEffectMask;
          return _next;
        }

        if (returnFiber !== null) {
          // Mark the parent fiber as incomplete and clear its effect list.
          returnFiber.firstEffect = returnFiber.lastEffect = null;
          returnFiber.effectTag |= Incomplete;
        }

        if (true && ReactFiberInstrumentation_1.debugTool) {
          ReactFiberInstrumentation_1.debugTool.onCompleteWork(workInProgress);
        }

        if (siblingFiber !== null) {
          // If there is more work to do in this returnFiber, do that next.
          return siblingFiber;
        } else if (returnFiber !== null) {
          // If there's no more work in this returnFiber. Complete the returnFiber.
          workInProgress = returnFiber;
          continue;
        } else {
          return null;
        }
      }
    }

    // Without this explicit null return Flow complains of invalid return type
    // TODO Remove the above while(true) loop
    // eslint-disable-next-line no-unreachable
    return null;
  }

  function performUnitOfWork(workInProgress) {
    // The current, flushed, state of this fiber is the alternate.
    // Ideally nothing should rely on this, but relying on it here
    // means that we don't need an additional field on the work in
    // progress.
    var current = workInProgress.alternate;

    // See if beginning this work spawns more work.
    startWorkTimer(workInProgress);
    {
      ReactDebugCurrentFiber.setCurrentFiber(workInProgress);
    }

    if (true && replayFailedUnitOfWorkWithInvokeGuardedCallback) {
      stashedWorkInProgressProperties = assignFiberPropertiesInDEV(stashedWorkInProgressProperties, workInProgress);
    }
    var next = beginWork(current, workInProgress, nextRenderExpirationTime);
    {
      ReactDebugCurrentFiber.resetCurrentFiber();
      if (isReplayingFailedUnitOfWork) {
        // Currently replaying a failed unit of work. This should be unreachable,
        // because the render phase is meant to be idempotent, and it should
        // have thrown again. Since it didn't, rethrow the original error, so
        // React's internal stack is not misaligned.
        rethrowOriginalError();
      }
    }
    if (true && ReactFiberInstrumentation_1.debugTool) {
      ReactFiberInstrumentation_1.debugTool.onBeginWork(workInProgress);
    }

    if (next === null) {
      // If this doesn't spawn new work, complete the current work.
      next = completeUnitOfWork(workInProgress);
    }

    ReactCurrentOwner.current = null;

    return next;
  }

  function workLoop(isAsync) {
    if (!isAsync) {
      // Flush all expired work.
      while (nextUnitOfWork !== null) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
      }
    } else {
      // Flush asynchronous work until the deadline runs out of time.
      while (nextUnitOfWork !== null && !shouldYield()) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
      }
    }
  }

  function renderRoot(root, expirationTime, isAsync) {
    !!isWorking ? invariant(false, 'renderRoot was called recursively. This error is likely caused by a bug in React. Please file an issue.') : void 0;
    isWorking = true;

    // Check if we're starting from a fresh stack, or if we're resuming from
    // previously yielded work.
    if (expirationTime !== nextRenderExpirationTime || root !== nextRoot || nextUnitOfWork === null) {
      // Reset the stack and start working from the root.
      resetStack();
      nextRoot = root;
      nextRenderExpirationTime = expirationTime;
      nextUnitOfWork = createWorkInProgress(nextRoot.current, null, nextRenderExpirationTime);
      root.pendingCommitExpirationTime = NoWork;
    }

    var didFatal = false;

    startWorkLoopTimer(nextUnitOfWork);

    do {
      try {
        workLoop(isAsync);
      } catch (thrownValue) {
        if (nextUnitOfWork === null) {
          // This is a fatal error.
          didFatal = true;
          onUncaughtError(thrownValue);
          break;
        }

        if (true && replayFailedUnitOfWorkWithInvokeGuardedCallback) {
          var failedUnitOfWork = nextUnitOfWork;
          replayUnitOfWork(failedUnitOfWork, thrownValue, isAsync);
        }

        var sourceFiber = nextUnitOfWork;
        var returnFiber = sourceFiber['return'];
        if (returnFiber === null) {
          // This is the root. The root could capture its own errors. However,
          // we don't know if it errors before or after we pushed the host
          // context. This information is needed to avoid a stack mismatch.
          // Because we're not sure, treat this as a fatal error. We could track
          // which phase it fails in, but doesn't seem worth it. At least
          // for now.
          didFatal = true;
          onUncaughtError(thrownValue);
          break;
        }
        throwException(returnFiber, sourceFiber, thrownValue);
        nextUnitOfWork = completeUnitOfWork(sourceFiber);
      }
      break;
    } while (true);

    // We're done performing work. Time to clean up.
    var didCompleteRoot = false;
    isWorking = false;

    // Yield back to main thread.
    if (didFatal) {
      stopWorkLoopTimer(interruptedBy, didCompleteRoot);
      interruptedBy = null;
      // There was a fatal error.
      {
        stack.resetStackAfterFatalErrorInDev();
      }
      return null;
    } else if (nextUnitOfWork === null) {
      // We reached the root.
      if (isRootReadyForCommit) {
        didCompleteRoot = true;
        stopWorkLoopTimer(interruptedBy, didCompleteRoot);
        interruptedBy = null;
        // The root successfully completed. It's ready for commit.
        root.pendingCommitExpirationTime = expirationTime;
        var finishedWork = root.current.alternate;
        return finishedWork;
      } else {
        // The root did not complete.
        stopWorkLoopTimer(interruptedBy, didCompleteRoot);
        interruptedBy = null;
        invariant(false, 'Expired work should have completed. This error is likely caused by a bug in React. Please file an issue.');
      }
    } else {
      stopWorkLoopTimer(interruptedBy, didCompleteRoot);
      interruptedBy = null;
      // There's more work to do, but we ran out of time. Yield back to
      // the renderer.
      return null;
    }
  }

  function scheduleCapture(sourceFiber, boundaryFiber, value, expirationTime) {
    // TODO: We only support dispatching errors.
    var capturedValue = createCapturedValue(value, sourceFiber);
    var update = {
      expirationTime: expirationTime,
      partialState: null,
      callback: null,
      isReplace: false,
      isForced: false,
      capturedValue: capturedValue,
      next: null
    };
    insertUpdateIntoFiber(boundaryFiber, update);
    scheduleWork(boundaryFiber, expirationTime);
  }

  function dispatch(sourceFiber, value, expirationTime) {
    !(!isWorking || isCommitting) ? invariant(false, 'dispatch: Cannot dispatch during the render phase.') : void 0;

    // TODO: Handle arrays

    var fiber = sourceFiber['return'];
    while (fiber !== null) {
      switch (fiber.tag) {
        case ClassComponent:
          var ctor = fiber.type;
          var instance = fiber.stateNode;
          if (typeof ctor.getDerivedStateFromCatch === 'function' || typeof instance.componentDidCatch === 'function' && !isAlreadyFailedLegacyErrorBoundary(instance)) {
            scheduleCapture(sourceFiber, fiber, value, expirationTime);
            return;
          }
          break;
        // TODO: Handle async boundaries
        case HostRoot:
          scheduleCapture(sourceFiber, fiber, value, expirationTime);
          return;
      }
      fiber = fiber['return'];
    }

    if (sourceFiber.tag === HostRoot) {
      // Error was thrown at the root. There is no parent, so the root
      // itself should capture it.
      scheduleCapture(sourceFiber, sourceFiber, value, expirationTime);
    }
  }

  function onCommitPhaseError(fiber, error) {
    return dispatch(fiber, error, Sync);
  }

  function computeAsyncExpiration(currentTime) {
    // Given the current clock time, returns an expiration time. We use rounding
    // to batch like updates together.
    // Should complete within ~1000ms. 1200ms max.
    var expirationMs = 5000;
    var bucketSizeMs = 250;
    return computeExpirationBucket(currentTime, expirationMs, bucketSizeMs);
  }

  function computeInteractiveExpiration(currentTime) {
    var expirationMs = void 0;
    // We intentionally set a higher expiration time for interactive updates in
    // dev than in production.
    // If the main thread is being blocked so long that you hit the expiration,
    // it's a problem that could be solved with better scheduling.
    // People will be more likely to notice this and fix it with the long
    // expiration time in development.
    // In production we opt for better UX at the risk of masking scheduling
    // problems, by expiring fast.
    {
      // Should complete within ~500ms. 600ms max.
      expirationMs = 500;
    }
    var bucketSizeMs = 100;
    return computeExpirationBucket(currentTime, expirationMs, bucketSizeMs);
  }

  // Creates a unique async expiration time.
  function computeUniqueAsyncExpiration() {
    var currentTime = recalculateCurrentTime();
    var result = computeAsyncExpiration(currentTime);
    if (result <= lastUniqueAsyncExpiration) {
      // Since we assume the current time monotonically increases, we only hit
      // this branch when computeUniqueAsyncExpiration is fired multiple times
      // within a 200ms window (or whatever the async bucket size is).
      result = lastUniqueAsyncExpiration + 1;
    }
    lastUniqueAsyncExpiration = result;
    return lastUniqueAsyncExpiration;
  }

  function computeExpirationForFiber(fiber) {
    var expirationTime = void 0;
    if (expirationContext !== NoWork) {
      // An explicit expiration context was set;
      expirationTime = expirationContext;
    } else if (isWorking) {
      if (isCommitting) {
        // Updates that occur during the commit phase should have sync priority
        // by default.
        expirationTime = Sync;
      } else {
        // Updates during the render phase should expire at the same time as
        // the work that is being rendered.
        expirationTime = nextRenderExpirationTime;
      }
    } else {
      // No explicit expiration context was set, and we're not currently
      // performing work. Calculate a new expiration time.
      if (fiber.mode & AsyncMode) {
        if (isBatchingInteractiveUpdates) {
          // This is an interactive update
          var currentTime = recalculateCurrentTime();
          expirationTime = computeInteractiveExpiration(currentTime);
        } else {
          // This is an async update
          var _currentTime = recalculateCurrentTime();
          expirationTime = computeAsyncExpiration(_currentTime);
        }
      } else {
        // This is a sync update
        expirationTime = Sync;
      }
    }
    if (isBatchingInteractiveUpdates) {
      // This is an interactive update. Keep track of the lowest pending
      // interactive expiration time. This allows us to synchronously flush
      // all interactive updates when needed.
      if (lowestPendingInteractiveExpirationTime === NoWork || expirationTime > lowestPendingInteractiveExpirationTime) {
        lowestPendingInteractiveExpirationTime = expirationTime;
      }
    }
    return expirationTime;
  }

  function scheduleWork(fiber, expirationTime) {
    return scheduleWorkImpl(fiber, expirationTime, false);
  }

  function scheduleWorkImpl(fiber, expirationTime, isErrorRecovery) {
    recordScheduleUpdate();

    {
      if (!isErrorRecovery && fiber.tag === ClassComponent) {
        var instance = fiber.stateNode;
        warnAboutInvalidUpdates(instance);
      }
    }

    var node = fiber;
    while (node !== null) {
      // Walk the parent path to the root and update each node's
      // expiration time.
      if (node.expirationTime === NoWork || node.expirationTime > expirationTime) {
        node.expirationTime = expirationTime;
      }
      if (node.alternate !== null) {
        if (node.alternate.expirationTime === NoWork || node.alternate.expirationTime > expirationTime) {
          node.alternate.expirationTime = expirationTime;
        }
      }
      if (node['return'] === null) {
        if (node.tag === HostRoot) {
          var root = node.stateNode;
          if (!isWorking && nextRenderExpirationTime !== NoWork && expirationTime < nextRenderExpirationTime) {
            // This is an interruption. (Used for performance tracking.)
            interruptedBy = fiber;
            resetStack();
          }
          if (
          // If we're in the render phase, we don't need to schedule this root
          // for an update, because we'll do it before we exit...
          !isWorking || isCommitting ||
          // ...unless this is a different root than the one we're rendering.
          nextRoot !== root) {
            // Add this root to the root schedule.
            requestWork(root, expirationTime);
          }
          if (nestedUpdateCount > NESTED_UPDATE_LIMIT) {
            invariant(false, 'Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.');
          }
        } else {
          {
            if (!isErrorRecovery && fiber.tag === ClassComponent) {
              warnAboutUpdateOnUnmounted(fiber);
            }
          }
          return;
        }
      }
      node = node['return'];
    }
  }

  function recalculateCurrentTime() {
    // Subtract initial time so it fits inside 32bits
    mostRecentCurrentTimeMs = now() - originalStartTimeMs;
    mostRecentCurrentTime = msToExpirationTime(mostRecentCurrentTimeMs);
    return mostRecentCurrentTime;
  }

  function deferredUpdates(fn) {
    var previousExpirationContext = expirationContext;
    var currentTime = recalculateCurrentTime();
    expirationContext = computeAsyncExpiration(currentTime);
    try {
      return fn();
    } finally {
      expirationContext = previousExpirationContext;
    }
  }
  function syncUpdates(fn, a, b, c, d) {
    var previousExpirationContext = expirationContext;
    expirationContext = Sync;
    try {
      return fn(a, b, c, d);
    } finally {
      expirationContext = previousExpirationContext;
    }
  }

  // TODO: Everything below this is written as if it has been lifted to the
  // renderers. I'll do this in a follow-up.

  // Linked-list of roots
  var firstScheduledRoot = null;
  var lastScheduledRoot = null;

  var callbackExpirationTime = NoWork;
  var callbackID = -1;
  var isRendering = false;
  var nextFlushedRoot = null;
  var nextFlushedExpirationTime = NoWork;
  var lowestPendingInteractiveExpirationTime = NoWork;
  var deadlineDidExpire = false;
  var hasUnhandledError = false;
  var unhandledError = null;
  var deadline = null;

  var isBatchingUpdates = false;
  var isUnbatchingUpdates = false;
  var isBatchingInteractiveUpdates = false;

  var completedBatches = null;

  // Use these to prevent an infinite loop of nested updates
  var NESTED_UPDATE_LIMIT = 1000;
  var nestedUpdateCount = 0;

  var timeHeuristicForUnitOfWork = 1;

  function scheduleCallbackWithExpiration(expirationTime) {
    if (callbackExpirationTime !== NoWork) {
      // A callback is already scheduled. Check its expiration time (timeout).
      if (expirationTime > callbackExpirationTime) {
        // Existing callback has sufficient timeout. Exit.
        return;
      } else {
        // Existing callback has insufficient timeout. Cancel and schedule a
        // new one.
        cancelDeferredCallback(callbackID);
      }
      // The request callback timer is already running. Don't start a new one.
    } else {
      startRequestCallbackTimer();
    }

    // Compute a timeout for the given expiration time.
    var currentMs = now() - originalStartTimeMs;
    var expirationMs = expirationTimeToMs(expirationTime);
    var timeout = expirationMs - currentMs;

    callbackExpirationTime = expirationTime;
    callbackID = scheduleDeferredCallback(performAsyncWork, { timeout: timeout });
  }

  // requestWork is called by the scheduler whenever a root receives an update.
  // It's up to the renderer to call renderRoot at some point in the future.
  function requestWork(root, expirationTime) {
    addRootToSchedule(root, expirationTime);

    if (isRendering) {
      // Prevent reentrancy. Remaining work will be scheduled at the end of
      // the currently rendering batch.
      return;
    }

    if (isBatchingUpdates) {
      // Flush work at the end of the batch.
      if (isUnbatchingUpdates) {
        // ...unless we're inside unbatchedUpdates, in which case we should
        // flush it now.
        nextFlushedRoot = root;
        nextFlushedExpirationTime = Sync;
        performWorkOnRoot(root, Sync, false);
      }
      return;
    }

    // TODO: Get rid of Sync and use current time?
    if (expirationTime === Sync) {
      performSyncWork();
    } else {
      scheduleCallbackWithExpiration(expirationTime);
    }
  }

  function addRootToSchedule(root, expirationTime) {
    // Add the root to the schedule.
    // Check if this root is already part of the schedule.
    if (root.nextScheduledRoot === null) {
      // This root is not already scheduled. Add it.
      root.remainingExpirationTime = expirationTime;
      if (lastScheduledRoot === null) {
        firstScheduledRoot = lastScheduledRoot = root;
        root.nextScheduledRoot = root;
      } else {
        lastScheduledRoot.nextScheduledRoot = root;
        lastScheduledRoot = root;
        lastScheduledRoot.nextScheduledRoot = firstScheduledRoot;
      }
    } else {
      // This root is already scheduled, but its priority may have increased.
      var remainingExpirationTime = root.remainingExpirationTime;
      if (remainingExpirationTime === NoWork || expirationTime < remainingExpirationTime) {
        // Update the priority.
        root.remainingExpirationTime = expirationTime;
      }
    }
  }

  function findHighestPriorityRoot() {
    var highestPriorityWork = NoWork;
    var highestPriorityRoot = null;
    if (lastScheduledRoot !== null) {
      var previousScheduledRoot = lastScheduledRoot;
      var root = firstScheduledRoot;
      while (root !== null) {
        var remainingExpirationTime = root.remainingExpirationTime;
        if (remainingExpirationTime === NoWork) {
          // This root no longer has work. Remove it from the scheduler.

          // TODO: This check is redudant, but Flow is confused by the branch
          // below where we set lastScheduledRoot to null, even though we break
          // from the loop right after.
          !(previousScheduledRoot !== null && lastScheduledRoot !== null) ? invariant(false, 'Should have a previous and last root. This error is likely caused by a bug in React. Please file an issue.') : void 0;
          if (root === root.nextScheduledRoot) {
            // This is the only root in the list.
            root.nextScheduledRoot = null;
            firstScheduledRoot = lastScheduledRoot = null;
            break;
          } else if (root === firstScheduledRoot) {
            // This is the first root in the list.
            var next = root.nextScheduledRoot;
            firstScheduledRoot = next;
            lastScheduledRoot.nextScheduledRoot = next;
            root.nextScheduledRoot = null;
          } else if (root === lastScheduledRoot) {
            // This is the last root in the list.
            lastScheduledRoot = previousScheduledRoot;
            lastScheduledRoot.nextScheduledRoot = firstScheduledRoot;
            root.nextScheduledRoot = null;
            break;
          } else {
            previousScheduledRoot.nextScheduledRoot = root.nextScheduledRoot;
            root.nextScheduledRoot = null;
          }
          root = previousScheduledRoot.nextScheduledRoot;
        } else {
          if (highestPriorityWork === NoWork || remainingExpirationTime < highestPriorityWork) {
            // Update the priority, if it's higher
            highestPriorityWork = remainingExpirationTime;
            highestPriorityRoot = root;
          }
          if (root === lastScheduledRoot) {
            break;
          }
          previousScheduledRoot = root;
          root = root.nextScheduledRoot;
        }
      }
    }

    // If the next root is the same as the previous root, this is a nested
    // update. To prevent an infinite loop, increment the nested update count.
    var previousFlushedRoot = nextFlushedRoot;
    if (previousFlushedRoot !== null && previousFlushedRoot === highestPriorityRoot && highestPriorityWork === Sync) {
      nestedUpdateCount++;
    } else {
      // Reset whenever we switch roots.
      nestedUpdateCount = 0;
    }
    nextFlushedRoot = highestPriorityRoot;
    nextFlushedExpirationTime = highestPriorityWork;
  }

  function performAsyncWork(dl) {
    performWork(NoWork, true, dl);
  }

  function performSyncWork() {
    performWork(Sync, false, null);
  }

  function performWork(minExpirationTime, isAsync, dl) {
    deadline = dl;

    // Keep working on roots until there's no more work, or until the we reach
    // the deadline.
    findHighestPriorityRoot();

    if (enableUserTimingAPI && deadline !== null) {
      var didExpire = nextFlushedExpirationTime < recalculateCurrentTime();
      var timeout = expirationTimeToMs(nextFlushedExpirationTime);
      stopRequestCallbackTimer(didExpire, timeout);
    }

    if (isAsync) {
      while (nextFlushedRoot !== null && nextFlushedExpirationTime !== NoWork && (minExpirationTime === NoWork || minExpirationTime >= nextFlushedExpirationTime) && (!deadlineDidExpire || recalculateCurrentTime() >= nextFlushedExpirationTime)) {
        performWorkOnRoot(nextFlushedRoot, nextFlushedExpirationTime, !deadlineDidExpire);
        findHighestPriorityRoot();
      }
    } else {
      while (nextFlushedRoot !== null && nextFlushedExpirationTime !== NoWork && (minExpirationTime === NoWork || minExpirationTime >= nextFlushedExpirationTime)) {
        performWorkOnRoot(nextFlushedRoot, nextFlushedExpirationTime, false);
        findHighestPriorityRoot();
      }
    }

    // We're done flushing work. Either we ran out of time in this callback,
    // or there's no more work left with sufficient priority.

    // If we're inside a callback, set this to false since we just completed it.
    if (deadline !== null) {
      callbackExpirationTime = NoWork;
      callbackID = -1;
    }
    // If there's work left over, schedule a new callback.
    if (nextFlushedExpirationTime !== NoWork) {
      scheduleCallbackWithExpiration(nextFlushedExpirationTime);
    }

    // Clean-up.
    deadline = null;
    deadlineDidExpire = false;

    finishRendering();
  }

  function flushRoot(root, expirationTime) {
    !!isRendering ? invariant(false, 'work.commit(): Cannot commit while already rendering. This likely means you attempted to commit from inside a lifecycle method.') : void 0;
    // Perform work on root as if the given expiration time is the current time.
    // This has the effect of synchronously flushing all work up to and
    // including the given time.
    nextFlushedRoot = root;
    nextFlushedExpirationTime = expirationTime;
    performWorkOnRoot(root, expirationTime, false);
    // Flush any sync work that was scheduled by lifecycles
    performSyncWork();
    finishRendering();
  }

  function finishRendering() {
    nestedUpdateCount = 0;

    if (completedBatches !== null) {
      var batches = completedBatches;
      completedBatches = null;
      for (var i = 0; i < batches.length; i++) {
        var batch = batches[i];
        try {
          batch._onComplete();
        } catch (error) {
          if (!hasUnhandledError) {
            hasUnhandledError = true;
            unhandledError = error;
          }
        }
      }
    }

    if (hasUnhandledError) {
      var error = unhandledError;
      unhandledError = null;
      hasUnhandledError = false;
      throw error;
    }
  }

  function performWorkOnRoot(root, expirationTime, isAsync) {
    !!isRendering ? invariant(false, 'performWorkOnRoot was called recursively. This error is likely caused by a bug in React. Please file an issue.') : void 0;

    isRendering = true;

    // Check if this is async work or sync/expired work.
    if (!isAsync) {
      // Flush sync work.
      var finishedWork = root.finishedWork;
      if (finishedWork !== null) {
        // This root is already complete. We can commit it.
        completeRoot(root, finishedWork, expirationTime);
      } else {
        root.finishedWork = null;
        finishedWork = renderRoot(root, expirationTime, false);
        if (finishedWork !== null) {
          // We've completed the root. Commit it.
          completeRoot(root, finishedWork, expirationTime);
        }
      }
    } else {
      // Flush async work.
      var _finishedWork = root.finishedWork;
      if (_finishedWork !== null) {
        // This root is already complete. We can commit it.
        completeRoot(root, _finishedWork, expirationTime);
      } else {
        root.finishedWork = null;
        _finishedWork = renderRoot(root, expirationTime, true);
        if (_finishedWork !== null) {
          // We've completed the root. Check the deadline one more time
          // before committing.
          if (!shouldYield()) {
            // Still time left. Commit the root.
            completeRoot(root, _finishedWork, expirationTime);
          } else {
            // There's no time left. Mark this root as complete. We'll come
            // back and commit it later.
            root.finishedWork = _finishedWork;
          }
        }
      }
    }

    isRendering = false;
  }

  function completeRoot(root, finishedWork, expirationTime) {
    // Check if there's a batch that matches this expiration time.
    var firstBatch = root.firstBatch;
    if (firstBatch !== null && firstBatch._expirationTime <= expirationTime) {
      if (completedBatches === null) {
        completedBatches = [firstBatch];
      } else {
        completedBatches.push(firstBatch);
      }
      if (firstBatch._defer) {
        // This root is blocked from committing by a batch. Unschedule it until
        // we receive another update.
        root.finishedWork = finishedWork;
        root.remainingExpirationTime = NoWork;
        return;
      }
    }

    // Commit the root.
    root.finishedWork = null;
    root.remainingExpirationTime = commitRoot(finishedWork);
  }

  // When working on async work, the reconciler asks the renderer if it should
  // yield execution. For DOM, we implement this with requestIdleCallback.
  function shouldYield() {
    if (deadline === null) {
      return false;
    }
    if (deadline.timeRemaining() > timeHeuristicForUnitOfWork) {
      // Disregard deadline.didTimeout. Only expired work should be flushed
      // during a timeout. This path is only hit for non-expired work.
      return false;
    }
    deadlineDidExpire = true;
    return true;
  }

  function onUncaughtError(error) {
    !(nextFlushedRoot !== null) ? invariant(false, 'Should be working on a root. This error is likely caused by a bug in React. Please file an issue.') : void 0;
    // Unschedule this root so we don't work on it again until there's
    // another update.
    nextFlushedRoot.remainingExpirationTime = NoWork;
    if (!hasUnhandledError) {
      hasUnhandledError = true;
      unhandledError = error;
    }
  }

  // TODO: Batching should be implemented at the renderer level, not inside
  // the reconciler.
  function batchedUpdates(fn, a) {
    var previousIsBatchingUpdates = isBatchingUpdates;
    isBatchingUpdates = true;
    try {
      return fn(a);
    } finally {
      isBatchingUpdates = previousIsBatchingUpdates;
      if (!isBatchingUpdates && !isRendering) {
        performSyncWork();
      }
    }
  }

  // TODO: Batching should be implemented at the renderer level, not inside
  // the reconciler.
  function unbatchedUpdates(fn, a) {
    if (isBatchingUpdates && !isUnbatchingUpdates) {
      isUnbatchingUpdates = true;
      try {
        return fn(a);
      } finally {
        isUnbatchingUpdates = false;
      }
    }
    return fn(a);
  }

  // TODO: Batching should be implemented at the renderer level, not within
  // the reconciler.
  function flushSync(fn, a) {
    !!isRendering ? invariant(false, 'flushSync was called from inside a lifecycle method. It cannot be called when React is already rendering.') : void 0;
    var previousIsBatchingUpdates = isBatchingUpdates;
    isBatchingUpdates = true;
    try {
      return syncUpdates(fn, a);
    } finally {
      isBatchingUpdates = previousIsBatchingUpdates;
      performSyncWork();
    }
  }

  function interactiveUpdates(fn, a, b) {
    if (isBatchingInteractiveUpdates) {
      return fn(a, b);
    }
    // If there are any pending interactive updates, synchronously flush them.
    // This needs to happen before we read any handlers, because the effect of
    // the previous event may influence which handlers are called during
    // this event.
    if (!isBatchingUpdates && !isRendering && lowestPendingInteractiveExpirationTime !== NoWork) {
      // Synchronously flush pending interactive updates.
      performWork(lowestPendingInteractiveExpirationTime, false, null);
      lowestPendingInteractiveExpirationTime = NoWork;
    }
    var previousIsBatchingInteractiveUpdates = isBatchingInteractiveUpdates;
    var previousIsBatchingUpdates = isBatchingUpdates;
    isBatchingInteractiveUpdates = true;
    isBatchingUpdates = true;
    try {
      return fn(a, b);
    } finally {
      isBatchingInteractiveUpdates = previousIsBatchingInteractiveUpdates;
      isBatchingUpdates = previousIsBatchingUpdates;
      if (!isBatchingUpdates && !isRendering) {
        performSyncWork();
      }
    }
  }

  function flushInteractiveUpdates() {
    if (!isRendering && lowestPendingInteractiveExpirationTime !== NoWork) {
      // Synchronously flush pending interactive updates.
      performWork(lowestPendingInteractiveExpirationTime, false, null);
      lowestPendingInteractiveExpirationTime = NoWork;
    }
  }

  function flushControlled(fn) {
    var previousIsBatchingUpdates = isBatchingUpdates;
    isBatchingUpdates = true;
    try {
      syncUpdates(fn);
    } finally {
      isBatchingUpdates = previousIsBatchingUpdates;
      if (!isBatchingUpdates && !isRendering) {
        performWork(Sync, false, null);
      }
    }
  }

  return {
    recalculateCurrentTime: recalculateCurrentTime,
    computeExpirationForFiber: computeExpirationForFiber,
    scheduleWork: scheduleWork,
    requestWork: requestWork,
    flushRoot: flushRoot,
    batchedUpdates: batchedUpdates,
    unbatchedUpdates: unbatchedUpdates,
    flushSync: flushSync,
    flushControlled: flushControlled,
    deferredUpdates: deferredUpdates,
    syncUpdates: syncUpdates,
    interactiveUpdates: interactiveUpdates,
    flushInteractiveUpdates: flushInteractiveUpdates,
    computeUniqueAsyncExpiration: computeUniqueAsyncExpiration,
    legacyContext: legacyContext
  };
};

var didWarnAboutNestedUpdates = void 0;

{
  didWarnAboutNestedUpdates = false;
}

// 0 is PROD, 1 is DEV.
// Might add PROFILE later.


var ReactFiberReconciler$1 = function (config) {
  var getPublicInstance = config.getPublicInstance;

  var _ReactFiberScheduler = ReactFiberScheduler(config),
      computeUniqueAsyncExpiration = _ReactFiberScheduler.computeUniqueAsyncExpiration,
      recalculateCurrentTime = _ReactFiberScheduler.recalculateCurrentTime,
      computeExpirationForFiber = _ReactFiberScheduler.computeExpirationForFiber,
      scheduleWork = _ReactFiberScheduler.scheduleWork,
      requestWork = _ReactFiberScheduler.requestWork,
      flushRoot = _ReactFiberScheduler.flushRoot,
      batchedUpdates = _ReactFiberScheduler.batchedUpdates,
      unbatchedUpdates = _ReactFiberScheduler.unbatchedUpdates,
      flushSync = _ReactFiberScheduler.flushSync,
      flushControlled = _ReactFiberScheduler.flushControlled,
      deferredUpdates = _ReactFiberScheduler.deferredUpdates,
      syncUpdates = _ReactFiberScheduler.syncUpdates,
      interactiveUpdates = _ReactFiberScheduler.interactiveUpdates,
      flushInteractiveUpdates = _ReactFiberScheduler.flushInteractiveUpdates,
      legacyContext = _ReactFiberScheduler.legacyContext;

  var findCurrentUnmaskedContext = legacyContext.findCurrentUnmaskedContext,
      isContextProvider = legacyContext.isContextProvider,
      processChildContext = legacyContext.processChildContext;


  function getContextForSubtree(parentComponent) {
    if (!parentComponent) {
      return emptyObject;
    }

    var fiber = get(parentComponent);
    var parentContext = findCurrentUnmaskedContext(fiber);
    return isContextProvider(fiber) ? processChildContext(fiber, parentContext) : parentContext;
  }

  function scheduleRootUpdate(current, element, currentTime, expirationTime, callback) {
    {
      if (ReactDebugCurrentFiber.phase === 'render' && ReactDebugCurrentFiber.current !== null && !didWarnAboutNestedUpdates) {
        didWarnAboutNestedUpdates = true;
        warning(false, 'Render methods should be a pure function of props and state; ' + 'triggering nested component updates from render is not allowed. ' + 'If necessary, trigger nested updates in componentDidUpdate.\n\n' + 'Check the render method of %s.', getComponentName(ReactDebugCurrentFiber.current) || 'Unknown');
      }
    }

    callback = callback === undefined ? null : callback;
    {
      !(callback === null || typeof callback === 'function') ? warning(false, 'render(...): Expected the last optional `callback` argument to be a ' + 'function. Instead received: %s.', callback) : void 0;
    }

    var update = {
      expirationTime: expirationTime,
      partialState: { element: element },
      callback: callback,
      isReplace: false,
      isForced: false,
      capturedValue: null,
      next: null
    };
    insertUpdateIntoFiber(current, update);
    scheduleWork(current, expirationTime);

    return expirationTime;
  }

  function updateContainerAtExpirationTime(element, container, parentComponent, currentTime, expirationTime, callback) {
    // TODO: If this is a nested container, this won't be the root.
    var current = container.current;

    {
      if (ReactFiberInstrumentation_1.debugTool) {
        if (current.alternate === null) {
          ReactFiberInstrumentation_1.debugTool.onMountContainer(container);
        } else if (element === null) {
          ReactFiberInstrumentation_1.debugTool.onUnmountContainer(container);
        } else {
          ReactFiberInstrumentation_1.debugTool.onUpdateContainer(container);
        }
      }
    }

    var context = getContextForSubtree(parentComponent);
    if (container.context === null) {
      container.context = context;
    } else {
      container.pendingContext = context;
    }

    return scheduleRootUpdate(current, element, currentTime, expirationTime, callback);
  }

  function findHostInstance(component) {
    var fiber = get(component);
    if (fiber === undefined) {
      if (typeof component.render === 'function') {
        invariant(false, 'Unable to find node on an unmounted component.');
      } else {
        invariant(false, 'Argument appears to not be a ReactComponent. Keys: %s', Object.keys(component));
      }
    }
    var hostFiber = findCurrentHostFiber(fiber);
    if (hostFiber === null) {
      return null;
    }
    return hostFiber.stateNode;
  }

  return {
    createContainer: function (containerInfo, isAsync, hydrate) {
      return createFiberRoot(containerInfo, isAsync, hydrate);
    },
    updateContainer: function (element, container, parentComponent, callback) {
      var current = container.current;
      var currentTime = recalculateCurrentTime();
      var expirationTime = computeExpirationForFiber(current);
      return updateContainerAtExpirationTime(element, container, parentComponent, currentTime, expirationTime, callback);
    },
    updateContainerAtExpirationTime: function (element, container, parentComponent, expirationTime, callback) {
      var currentTime = recalculateCurrentTime();
      return updateContainerAtExpirationTime(element, container, parentComponent, currentTime, expirationTime, callback);
    },


    flushRoot: flushRoot,

    requestWork: requestWork,

    computeUniqueAsyncExpiration: computeUniqueAsyncExpiration,

    batchedUpdates: batchedUpdates,

    unbatchedUpdates: unbatchedUpdates,

    deferredUpdates: deferredUpdates,

    syncUpdates: syncUpdates,

    interactiveUpdates: interactiveUpdates,

    flushInteractiveUpdates: flushInteractiveUpdates,

    flushControlled: flushControlled,

    flushSync: flushSync,

    getPublicRootInstance: function (container) {
      var containerFiber = container.current;
      if (!containerFiber.child) {
        return null;
      }
      switch (containerFiber.child.tag) {
        case HostComponent:
          return getPublicInstance(containerFiber.child.stateNode);
        default:
          return containerFiber.child.stateNode;
      }
    },


    findHostInstance: findHostInstance,

    findHostInstanceWithNoPortals: function (fiber) {
      var hostFiber = findCurrentHostFiberWithNoPortals(fiber);
      if (hostFiber === null) {
        return null;
      }
      return hostFiber.stateNode;
    },
    injectIntoDevTools: function (devToolsConfig) {
      var findFiberByHostInstance = devToolsConfig.findFiberByHostInstance;

      return injectInternals(_assign({}, devToolsConfig, {
        findHostInstanceByFiber: function (fiber) {
          var hostFiber = findCurrentHostFiber(fiber);
          if (hostFiber === null) {
            return null;
          }
          return hostFiber.stateNode;
        },
        findFiberByHostInstance: function (instance) {
          if (!findFiberByHostInstance) {
            // Might not be implemented by the renderer.
            return null;
          }
          return findFiberByHostInstance(instance);
        }
      }));
    }
  };
};

var ReactFiberReconciler$2 = Object.freeze({
	default: ReactFiberReconciler$1
});

var ReactFiberReconciler$3 = ( ReactFiberReconciler$2 && ReactFiberReconciler$1 ) || ReactFiberReconciler$2;

// TODO: bundle Flow types with the package.



// TODO: decide on the top-level export form.
// This is hacky but makes it work with both Rollup and Jest.
var reactReconciler = ReactFiberReconciler$3['default'] ? ReactFiberReconciler$3['default'] : ReactFiberReconciler$3;

function createPortal$1(children, containerInfo,
// TODO: figure out the API for cross-renderer implementation.
implementation) {
  var key = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

  return {
    // This tag allow us to uniquely identify this as a React Portal
    $$typeof: REACT_PORTAL_TYPE,
    key: key == null ? null : '' + key,
    children: children,
    containerInfo: containerInfo,
    implementation: implementation
  };
}

// TODO: this is special because it gets imported during build.

var ReactVersion = '16.3.2';

// a requestAnimationFrame, storing the time for the start of the frame, then
// scheduling a postMessage which gets scheduled after paint. Within the
// postMessage handler do as much work as possible until time + frame rate.
// By separating the idle call into a separate event tick we ensure that
// layout, paint and other browser work is counted against the available time.
// The frame rate is dynamically adjusted.

{
  if (ExecutionEnvironment.canUseDOM && typeof requestAnimationFrame !== 'function') {
    warning(false, 'React depends on requestAnimationFrame. Make sure that you load a ' + 'polyfill in older browsers. https://fb.me/react-polyfills');
  }
}

var hasNativePerformanceNow = typeof performance === 'object' && typeof performance.now === 'function';

var now = void 0;
if (hasNativePerformanceNow) {
  now = function () {
    return performance.now();
  };
} else {
  now = function () {
    return Date.now();
  };
}

// TODO: There's no way to cancel, because Fiber doesn't atm.
var rIC = void 0;
var cIC = void 0;

if (!ExecutionEnvironment.canUseDOM) {
  rIC = function (frameCallback) {
    return setTimeout(function () {
      frameCallback({
        timeRemaining: function () {
          return Infinity;
        },

        didTimeout: false
      });
    });
  };
  cIC = function (timeoutID) {
    clearTimeout(timeoutID);
  };
} else if (alwaysUseRequestIdleCallbackPolyfill || typeof requestIdleCallback !== 'function' || typeof cancelIdleCallback !== 'function') {
  // Polyfill requestIdleCallback and cancelIdleCallback

  var scheduledRICCallback = null;
  var isIdleScheduled = false;
  var timeoutTime = -1;

  var isAnimationFrameScheduled = false;

  var frameDeadline = 0;
  // We start out assuming that we run at 30fps but then the heuristic tracking
  // will adjust this value to a faster fps if we get more frequent animation
  // frames.
  var previousFrameTime = 33;
  var activeFrameTime = 33;

  var frameDeadlineObject = void 0;
  if (hasNativePerformanceNow) {
    frameDeadlineObject = {
      didTimeout: false,
      timeRemaining: function () {
        // We assume that if we have a performance timer that the rAF callback
        // gets a performance timer value. Not sure if this is always true.
        var remaining = frameDeadline - performance.now();
        return remaining > 0 ? remaining : 0;
      }
    };
  } else {
    frameDeadlineObject = {
      didTimeout: false,
      timeRemaining: function () {
        // Fallback to Date.now()
        var remaining = frameDeadline - Date.now();
        return remaining > 0 ? remaining : 0;
      }
    };
  }

  // We use the postMessage trick to defer idle work until after the repaint.
  var messageKey = '__reactIdleCallback$' + Math.random().toString(36).slice(2);
  var idleTick = function (event) {
    if (event.source !== window || event.data !== messageKey) {
      return;
    }

    isIdleScheduled = false;

    var currentTime = now();
    if (frameDeadline - currentTime <= 0) {
      // There's no time left in this idle period. Check if the callback has
      // a timeout and whether it's been exceeded.
      if (timeoutTime !== -1 && timeoutTime <= currentTime) {
        // Exceeded the timeout. Invoke the callback even though there's no
        // time left.
        frameDeadlineObject.didTimeout = true;
      } else {
        // No timeout.
        if (!isAnimationFrameScheduled) {
          // Schedule another animation callback so we retry later.
          isAnimationFrameScheduled = true;
          requestAnimationFrame(animationTick);
        }
        // Exit without invoking the callback.
        return;
      }
    } else {
      // There's still time left in this idle period.
      frameDeadlineObject.didTimeout = false;
    }

    timeoutTime = -1;
    var callback = scheduledRICCallback;
    scheduledRICCallback = null;
    if (callback !== null) {
      callback(frameDeadlineObject);
    }
  };
  // Assumes that we have addEventListener in this environment. Might need
  // something better for old IE.
  window.addEventListener('message', idleTick, false);

  var animationTick = function (rafTime) {
    isAnimationFrameScheduled = false;
    var nextFrameTime = rafTime - frameDeadline + activeFrameTime;
    if (nextFrameTime < activeFrameTime && previousFrameTime < activeFrameTime) {
      if (nextFrameTime < 8) {
        // Defensive coding. We don't support higher frame rates than 120hz.
        // If we get lower than that, it is probably a bug.
        nextFrameTime = 8;
      }
      // If one frame goes long, then the next one can be short to catch up.
      // If two frames are short in a row, then that's an indication that we
      // actually have a higher frame rate than what we're currently optimizing.
      // We adjust our heuristic dynamically accordingly. For example, if we're
      // running on 120hz display or 90hz VR display.
      // Take the max of the two in case one of them was an anomaly due to
      // missed frame deadlines.
      activeFrameTime = nextFrameTime < previousFrameTime ? previousFrameTime : nextFrameTime;
    } else {
      previousFrameTime = nextFrameTime;
    }
    frameDeadline = rafTime + activeFrameTime;
    if (!isIdleScheduled) {
      isIdleScheduled = true;
      window.postMessage(messageKey, '*');
    }
  };

  rIC = function (callback, options) {
    // This assumes that we only schedule one callback at a time because that's
    // how Fiber uses it.
    scheduledRICCallback = callback;
    if (options != null && typeof options.timeout === 'number') {
      timeoutTime = now() + options.timeout;
    }
    if (!isAnimationFrameScheduled) {
      // If rAF didn't already schedule one, we need to schedule a frame.
      // TODO: If this rAF doesn't materialize because the browser throttles, we
      // might want to still have setTimeout trigger rIC as a backup to ensure
      // that we keep performing work.
      isAnimationFrameScheduled = true;
      requestAnimationFrame(animationTick);
    }
    return 0;
  };

  cIC = function () {
    scheduledRICCallback = null;
    isIdleScheduled = false;
    timeoutTime = -1;
  };
} else {
  rIC = window.requestIdleCallback;
  cIC = window.cancelIdleCallback;
}

var didWarnSelectedSetOnOption = false;

function flattenChildren(children) {
  var content = '';

  // Flatten children and warn if they aren't strings or numbers;
  // invalid types are ignored.
  // We can silently skip them because invalid DOM nesting warning
  // catches these cases in Fiber.
  React.Children.forEach(children, function (child) {
    if (child == null) {
      return;
    }
    if (typeof child === 'string' || typeof child === 'number') {
      content += child;
    }
  });

  return content;
}

/**
 * Implements an <option> host component that warns when `selected` is set.
 */

function validateProps(element, props) {
  // TODO (yungsters): Remove support for `selected` in <option>.
  {
    if (props.selected != null && !didWarnSelectedSetOnOption) {
      warning(false, 'Use the `defaultValue` or `value` props on <select> instead of ' + 'setting `selected` on <option>.');
      didWarnSelectedSetOnOption = true;
    }
  }
}

function postMountWrapper$1(element, props) {
  // value="" should make a value attribute (#6219)
  if (props.value != null) {
    element.setAttribute('value', props.value);
  }
}

function getHostProps$1(element, props) {
  var hostProps = _assign({ children: undefined }, props);
  var content = flattenChildren(props.children);

  if (content) {
    hostProps.children = content;
  }

  return hostProps;
}

// TODO: direct imports like some-package/src/* are bad. Fix me.
var getCurrentFiberOwnerName$3 = ReactDebugCurrentFiber.getCurrentFiberOwnerName;
var getCurrentFiberStackAddendum$4 = ReactDebugCurrentFiber.getCurrentFiberStackAddendum;


var didWarnValueDefaultValue$1 = void 0;

{
  didWarnValueDefaultValue$1 = false;
}

function getDeclarationErrorAddendum() {
  var ownerName = getCurrentFiberOwnerName$3();
  if (ownerName) {
    return '\n\nCheck the render method of `' + ownerName + '`.';
  }
  return '';
}

var valuePropNames = ['value', 'defaultValue'];

/**
 * Validation function for `value` and `defaultValue`.
 */
function checkSelectPropTypes(props) {
  ReactControlledValuePropTypes.checkPropTypes('select', props, getCurrentFiberStackAddendum$4);

  for (var i = 0; i < valuePropNames.length; i++) {
    var propName = valuePropNames[i];
    if (props[propName] == null) {
      continue;
    }
    var isArray = Array.isArray(props[propName]);
    if (props.multiple && !isArray) {
      warning(false, 'The `%s` prop supplied to <select> must be an array if ' + '`multiple` is true.%s', propName, getDeclarationErrorAddendum());
    } else if (!props.multiple && isArray) {
      warning(false, 'The `%s` prop supplied to <select> must be a scalar ' + 'value if `multiple` is false.%s', propName, getDeclarationErrorAddendum());
    }
  }
}

function updateOptions(node, multiple, propValue, setDefaultSelected) {
  var options = node.options;

  if (multiple) {
    var selectedValues = propValue;
    var selectedValue = {};
    for (var i = 0; i < selectedValues.length; i++) {
      // Prefix to avoid chaos with special keys.
      selectedValue['$' + selectedValues[i]] = true;
    }
    for (var _i = 0; _i < options.length; _i++) {
      var selected = selectedValue.hasOwnProperty('$' + options[_i].value);
      if (options[_i].selected !== selected) {
        options[_i].selected = selected;
      }
      if (selected && setDefaultSelected) {
        options[_i].defaultSelected = true;
      }
    }
  } else {
    // Do not set `select.value` as exact behavior isn't consistent across all
    // browsers for all cases.
    var _selectedValue = '' + propValue;
    var defaultSelected = null;
    for (var _i2 = 0; _i2 < options.length; _i2++) {
      if (options[_i2].value === _selectedValue) {
        options[_i2].selected = true;
        if (setDefaultSelected) {
          options[_i2].defaultSelected = true;
        }
        return;
      }
      if (defaultSelected === null && !options[_i2].disabled) {
        defaultSelected = options[_i2];
      }
    }
    if (defaultSelected !== null) {
      defaultSelected.selected = true;
    }
  }
}

/**
 * Implements a <select> host component that allows optionally setting the
 * props `value` and `defaultValue`. If `multiple` is false, the prop must be a
 * stringable. If `multiple` is true, the prop must be an array of stringables.
 *
 * If `value` is not supplied (or null/undefined), user actions that change the
 * selected option will trigger updates to the rendered options.
 *
 * If it is supplied (and not null/undefined), the rendered options will not
 * update in response to user actions. Instead, the `value` prop must change in
 * order for the rendered options to update.
 *
 * If `defaultValue` is provided, any options with the supplied values will be
 * selected.
 */

function getHostProps$2(element, props) {
  return _assign({}, props, {
    value: undefined
  });
}

function initWrapperState$1(element, props) {
  var node = element;
  {
    checkSelectPropTypes(props);
  }

  var value = props.value;
  node._wrapperState = {
    initialValue: value != null ? value : props.defaultValue,
    wasMultiple: !!props.multiple
  };

  {
    if (props.value !== undefined && props.defaultValue !== undefined && !didWarnValueDefaultValue$1) {
      warning(false, 'Select elements must be either controlled or uncontrolled ' + '(specify either the value prop, or the defaultValue prop, but not ' + 'both). Decide between using a controlled or uncontrolled select ' + 'element and remove one of these props. More info: ' + 'https://fb.me/react-controlled-components');
      didWarnValueDefaultValue$1 = true;
    }
  }
}

function postMountWrapper$2(element, props) {
  var node = element;
  node.multiple = !!props.multiple;
  var value = props.value;
  if (value != null) {
    updateOptions(node, !!props.multiple, value, false);
  } else if (props.defaultValue != null) {
    updateOptions(node, !!props.multiple, props.defaultValue, true);
  }
}

function postUpdateWrapper(element, props) {
  var node = element;
  // After the initial mount, we control selected-ness manually so don't pass
  // this value down
  node._wrapperState.initialValue = undefined;

  var wasMultiple = node._wrapperState.wasMultiple;
  node._wrapperState.wasMultiple = !!props.multiple;

  var value = props.value;
  if (value != null) {
    updateOptions(node, !!props.multiple, value, false);
  } else if (wasMultiple !== !!props.multiple) {
    // For simplicity, reapply `defaultValue` if `multiple` is toggled.
    if (props.defaultValue != null) {
      updateOptions(node, !!props.multiple, props.defaultValue, true);
    } else {
      // Revert the select back to its default unselected state.
      updateOptions(node, !!props.multiple, props.multiple ? [] : '', false);
    }
  }
}

function restoreControlledState$2(element, props) {
  var node = element;
  var value = props.value;

  if (value != null) {
    updateOptions(node, !!props.multiple, value, false);
  }
}

// TODO: direct imports like some-package/src/* are bad. Fix me.
var getCurrentFiberStackAddendum$5 = ReactDebugCurrentFiber.getCurrentFiberStackAddendum;

var didWarnValDefaultVal = false;

/**
 * Implements a <textarea> host component that allows setting `value`, and
 * `defaultValue`. This differs from the traditional DOM API because value is
 * usually set as PCDATA children.
 *
 * If `value` is not supplied (or null/undefined), user actions that affect the
 * value will trigger updates to the element.
 *
 * If `value` is supplied (and not null/undefined), the rendered element will
 * not trigger updates to the element. Instead, the `value` prop must change in
 * order for the rendered element to be updated.
 *
 * The rendered element will be initialized with an empty value, the prop
 * `defaultValue` if specified, or the children content (deprecated).
 */

function getHostProps$3(element, props) {
  var node = element;
  !(props.dangerouslySetInnerHTML == null) ? invariant(false, '`dangerouslySetInnerHTML` does not make sense on <textarea>.') : void 0;

  // Always set children to the same thing. In IE9, the selection range will
  // get reset if `textContent` is mutated.  We could add a check in setTextContent
  // to only set the value if/when the value differs from the node value (which would
  // completely solve this IE9 bug), but Sebastian+Sophie seemed to like this
  // solution. The value can be a boolean or object so that's why it's forced
  // to be a string.
  var hostProps = _assign({}, props, {
    value: undefined,
    defaultValue: undefined,
    children: '' + node._wrapperState.initialValue
  });

  return hostProps;
}

function initWrapperState$2(element, props) {
  var node = element;
  {
    ReactControlledValuePropTypes.checkPropTypes('textarea', props, getCurrentFiberStackAddendum$5);
    if (props.value !== undefined && props.defaultValue !== undefined && !didWarnValDefaultVal) {
      warning(false, 'Textarea elements must be either controlled or uncontrolled ' + '(specify either the value prop, or the defaultValue prop, but not ' + 'both). Decide between using a controlled or uncontrolled textarea ' + 'and remove one of these props. More info: ' + 'https://fb.me/react-controlled-components');
      didWarnValDefaultVal = true;
    }
  }

  var initialValue = props.value;

  // Only bother fetching default value if we're going to use it
  if (initialValue == null) {
    var defaultValue = props.defaultValue;
    // TODO (yungsters): Remove support for children content in <textarea>.
    var children = props.children;
    if (children != null) {
      {
        warning(false, 'Use the `defaultValue` or `value` props instead of setting ' + 'children on <textarea>.');
      }
      !(defaultValue == null) ? invariant(false, 'If you supply `defaultValue` on a <textarea>, do not pass children.') : void 0;
      if (Array.isArray(children)) {
        !(children.length <= 1) ? invariant(false, '<textarea> can only have at most one child.') : void 0;
        children = children[0];
      }

      defaultValue = '' + children;
    }
    if (defaultValue == null) {
      defaultValue = '';
    }
    initialValue = defaultValue;
  }

  node._wrapperState = {
    initialValue: '' + initialValue
  };
}

function updateWrapper$1(element, props) {
  var node = element;
  var value = props.value;
  if (value != null) {
    // Cast `value` to a string to ensure the value is set correctly. While
    // browsers typically do this as necessary, jsdom doesn't.
    var newValue = '' + value;

    // To avoid side effects (such as losing text selection), only set value if changed
    if (newValue !== node.value) {
      node.value = newValue;
    }
    if (props.defaultValue == null) {
      node.defaultValue = newValue;
    }
  }
  if (props.defaultValue != null) {
    node.defaultValue = props.defaultValue;
  }
}

function postMountWrapper$3(element, props) {
  var node = element;
  // This is in postMount because we need access to the DOM node, which is not
  // available until after the component has mounted.
  var textContent = node.textContent;

  // Only set node.value if textContent is equal to the expected
  // initial value. In IE10/IE11 there is a bug where the placeholder attribute
  // will populate textContent as well.
  // https://developer.microsoft.com/microsoft-edge/platform/issues/101525/
  if (textContent === node._wrapperState.initialValue) {
    node.value = textContent;
  }
}

function restoreControlledState$3(element, props) {
  // DOM component is still mounted; update
  updateWrapper$1(element, props);
}

var HTML_NAMESPACE$1 = 'http://www.w3.org/1999/xhtml';
var MATH_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';
var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

var Namespaces = {
  html: HTML_NAMESPACE$1,
  mathml: MATH_NAMESPACE,
  svg: SVG_NAMESPACE
};

// Assumes there is no parent namespace.
function getIntrinsicNamespace(type) {
  switch (type) {
    case 'svg':
      return SVG_NAMESPACE;
    case 'math':
      return MATH_NAMESPACE;
    default:
      return HTML_NAMESPACE$1;
  }
}

function getChildNamespace(parentNamespace, type) {
  if (parentNamespace == null || parentNamespace === HTML_NAMESPACE$1) {
    // No (or default) parent namespace: potential entry point.
    return getIntrinsicNamespace(type);
  }
  if (parentNamespace === SVG_NAMESPACE && type === 'foreignObject') {
    // We're leaving SVG.
    return HTML_NAMESPACE$1;
  }
  // By default, pass namespace below.
  return parentNamespace;
}

/* globals MSApp */

/**
 * Create a function which has 'unsafe' privileges (required by windows8 apps)
 */
var createMicrosoftUnsafeLocalFunction = function (func) {
  if (typeof MSApp !== 'undefined' && MSApp.execUnsafeLocalFunction) {
    return function (arg0, arg1, arg2, arg3) {
      MSApp.execUnsafeLocalFunction(function () {
        return func(arg0, arg1, arg2, arg3);
      });
    };
  } else {
    return func;
  }
};

// SVG temp container for IE lacking innerHTML
var reusableSVGContainer = void 0;

/**
 * Set the innerHTML property of a node
 *
 * @param {DOMElement} node
 * @param {string} html
 * @internal
 */
var setInnerHTML = createMicrosoftUnsafeLocalFunction(function (node, html) {
  // IE does not have innerHTML for SVG nodes, so instead we inject the
  // new markup in a temp node and then move the child nodes across into
  // the target node

  if (node.namespaceURI === Namespaces.svg && !('innerHTML' in node)) {
    reusableSVGContainer = reusableSVGContainer || document.createElement('div');
    reusableSVGContainer.innerHTML = '<svg>' + html + '</svg>';
    var svgNode = reusableSVGContainer.firstChild;
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
    while (svgNode.firstChild) {
      node.appendChild(svgNode.firstChild);
    }
  } else {
    node.innerHTML = html;
  }
});

/**
 * Set the textContent property of a node. For text updates, it's faster
 * to set the `nodeValue` of the Text node directly instead of using
 * `.textContent` which will remove the existing node and create a new one.
 *
 * @param {DOMElement} node
 * @param {string} text
 * @internal
 */
var setTextContent = function (node, text) {
  if (text) {
    var firstChild = node.firstChild;

    if (firstChild && firstChild === node.lastChild && firstChild.nodeType === TEXT_NODE) {
      firstChild.nodeValue = text;
      return;
    }
  }
  node.textContent = text;
};

/**
 * CSS properties which accept numbers but are not in units of "px".
 */
var isUnitlessNumber = {
  animationIterationCount: true,
  borderImageOutset: true,
  borderImageSlice: true,
  borderImageWidth: true,
  boxFlex: true,
  boxFlexGroup: true,
  boxOrdinalGroup: true,
  columnCount: true,
  columns: true,
  flex: true,
  flexGrow: true,
  flexPositive: true,
  flexShrink: true,
  flexNegative: true,
  flexOrder: true,
  gridRow: true,
  gridRowEnd: true,
  gridRowSpan: true,
  gridRowStart: true,
  gridColumn: true,
  gridColumnEnd: true,
  gridColumnSpan: true,
  gridColumnStart: true,
  fontWeight: true,
  lineClamp: true,
  lineHeight: true,
  opacity: true,
  order: true,
  orphans: true,
  tabSize: true,
  widows: true,
  zIndex: true,
  zoom: true,

  // SVG-related properties
  fillOpacity: true,
  floodOpacity: true,
  stopOpacity: true,
  strokeDasharray: true,
  strokeDashoffset: true,
  strokeMiterlimit: true,
  strokeOpacity: true,
  strokeWidth: true
};

/**
 * @param {string} prefix vendor-specific prefix, eg: Webkit
 * @param {string} key style name, eg: transitionDuration
 * @return {string} style name prefixed with `prefix`, properly camelCased, eg:
 * WebkitTransitionDuration
 */
function prefixKey(prefix, key) {
  return prefix + key.charAt(0).toUpperCase() + key.substring(1);
}

/**
 * Support style names that may come passed in prefixed by adding permutations
 * of vendor prefixes.
 */
var prefixes = ['Webkit', 'ms', 'Moz', 'O'];

// Using Object.keys here, or else the vanilla for-in loop makes IE8 go into an
// infinite loop, because it iterates over the newly added props too.
Object.keys(isUnitlessNumber).forEach(function (prop) {
  prefixes.forEach(function (prefix) {
    isUnitlessNumber[prefixKey(prefix, prop)] = isUnitlessNumber[prop];
  });
});

/**
 * Convert a value into the proper css writable value. The style name `name`
 * should be logical (no hyphens), as specified
 * in `CSSProperty.isUnitlessNumber`.
 *
 * @param {string} name CSS property name such as `topMargin`.
 * @param {*} value CSS property value such as `10px`.
 * @return {string} Normalized style value with dimensions applied.
 */
function dangerousStyleValue(name, value, isCustomProperty) {
  // Note that we've removed escapeTextForBrowser() calls here since the
  // whole string will be escaped when the attribute is injected into
  // the markup. If you provide unsafe user data here they can inject
  // arbitrary CSS which may be problematic (I couldn't repro this):
  // https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
  // http://www.thespanner.co.uk/2007/11/26/ultimate-xss-css-injection/
  // This is not an XSS hole but instead a potential CSS injection issue
  // which has lead to a greater discussion about how we're going to
  // trust URLs moving forward. See #2115901

  var isEmpty = value == null || typeof value === 'boolean' || value === '';
  if (isEmpty) {
    return '';
  }

  if (!isCustomProperty && typeof value === 'number' && value !== 0 && !(isUnitlessNumber.hasOwnProperty(name) && isUnitlessNumber[name])) {
    return value + 'px'; // Presumes implicit 'px' suffix for unitless numbers
  }

  return ('' + value).trim();
}

var warnValidStyle = emptyFunction;

{
  // 'msTransform' is correct, but the other prefixes should be capitalized
  var badVendoredStyleNamePattern = /^(?:webkit|moz|o)[A-Z]/;

  // style values shouldn't contain a semicolon
  var badStyleValueWithSemicolonPattern = /;\s*$/;

  var warnedStyleNames = {};
  var warnedStyleValues = {};
  var warnedForNaNValue = false;
  var warnedForInfinityValue = false;

  var warnHyphenatedStyleName = function (name, getStack) {
    if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
      return;
    }

    warnedStyleNames[name] = true;
    warning(false, 'Unsupported style property %s. Did you mean %s?%s', name, camelizeStyleName(name), getStack());
  };

  var warnBadVendoredStyleName = function (name, getStack) {
    if (warnedStyleNames.hasOwnProperty(name) && warnedStyleNames[name]) {
      return;
    }

    warnedStyleNames[name] = true;
    warning(false, 'Unsupported vendor-prefixed style property %s. Did you mean %s?%s', name, name.charAt(0).toUpperCase() + name.slice(1), getStack());
  };

  var warnStyleValueWithSemicolon = function (name, value, getStack) {
    if (warnedStyleValues.hasOwnProperty(value) && warnedStyleValues[value]) {
      return;
    }

    warnedStyleValues[value] = true;
    warning(false, "Style property values shouldn't contain a semicolon. " + 'Try "%s: %s" instead.%s', name, value.replace(badStyleValueWithSemicolonPattern, ''), getStack());
  };

  var warnStyleValueIsNaN = function (name, value, getStack) {
    if (warnedForNaNValue) {
      return;
    }

    warnedForNaNValue = true;
    warning(false, '`NaN` is an invalid value for the `%s` css style property.%s', name, getStack());
  };

  var warnStyleValueIsInfinity = function (name, value, getStack) {
    if (warnedForInfinityValue) {
      return;
    }

    warnedForInfinityValue = true;
    warning(false, '`Infinity` is an invalid value for the `%s` css style property.%s', name, getStack());
  };

  warnValidStyle = function (name, value, getStack) {
    if (name.indexOf('-') > -1) {
      warnHyphenatedStyleName(name, getStack);
    } else if (badVendoredStyleNamePattern.test(name)) {
      warnBadVendoredStyleName(name, getStack);
    } else if (badStyleValueWithSemicolonPattern.test(value)) {
      warnStyleValueWithSemicolon(name, value, getStack);
    }

    if (typeof value === 'number') {
      if (isNaN(value)) {
        warnStyleValueIsNaN(name, value, getStack);
      } else if (!isFinite(value)) {
        warnStyleValueIsInfinity(name, value, getStack);
      }
    }
  };
}

var warnValidStyle$1 = warnValidStyle;

/**
 * Operations for dealing with CSS properties.
 */

/**
 * This creates a string that is expected to be equivalent to the style
 * attribute generated by server-side rendering. It by-passes warnings and
 * security checks so it's not safe to use this value for anything other than
 * comparison. It is only used in DEV for SSR validation.
 */
function createDangerousStringForStyles(styles) {
  {
    var serialized = '';
    var delimiter = '';
    for (var styleName in styles) {
      if (!styles.hasOwnProperty(styleName)) {
        continue;
      }
      var styleValue = styles[styleName];
      if (styleValue != null) {
        var isCustomProperty = styleName.indexOf('--') === 0;
        serialized += delimiter + hyphenateStyleName(styleName) + ':';
        serialized += dangerousStyleValue(styleName, styleValue, isCustomProperty);

        delimiter = ';';
      }
    }
    return serialized || null;
  }
}

/**
 * Sets the value for multiple styles on a node.  If a value is specified as
 * '' (empty string), the corresponding style property will be unset.
 *
 * @param {DOMElement} node
 * @param {object} styles
 */
function setValueForStyles(node, styles, getStack) {
  var style = node.style;
  for (var styleName in styles) {
    if (!styles.hasOwnProperty(styleName)) {
      continue;
    }
    var isCustomProperty = styleName.indexOf('--') === 0;
    {
      if (!isCustomProperty) {
        warnValidStyle$1(styleName, styles[styleName], getStack);
      }
    }
    var styleValue = dangerousStyleValue(styleName, styles[styleName], isCustomProperty);
    if (styleName === 'float') {
      styleName = 'cssFloat';
    }
    if (isCustomProperty) {
      style.setProperty(styleName, styleValue);
    } else {
      style[styleName] = styleValue;
    }
  }
}

// For HTML, certain tags should omit their close tag. We keep a whitelist for
// those special-case tags.

var omittedCloseTags = {
  area: true,
  base: true,
  br: true,
  col: true,
  embed: true,
  hr: true,
  img: true,
  input: true,
  keygen: true,
  link: true,
  meta: true,
  param: true,
  source: true,
  track: true,
  wbr: true
};

// For HTML, certain tags cannot have children. This has the same purpose as
// `omittedCloseTags` except that `menuitem` should still have its closing tag.

var voidElementTags = _assign({
  menuitem: true
}, omittedCloseTags);

var HTML$1 = '__html';

function assertValidProps(tag, props, getStack) {
  if (!props) {
    return;
  }
  // Note the use of `==` which checks for null or undefined.
  if (voidElementTags[tag]) {
    !(props.children == null && props.dangerouslySetInnerHTML == null) ? invariant(false, '%s is a void element tag and must neither have `children` nor use `dangerouslySetInnerHTML`.%s', tag, getStack()) : void 0;
  }
  if (props.dangerouslySetInnerHTML != null) {
    !(props.children == null) ? invariant(false, 'Can only set one of `children` or `props.dangerouslySetInnerHTML`.') : void 0;
    !(typeof props.dangerouslySetInnerHTML === 'object' && HTML$1 in props.dangerouslySetInnerHTML) ? invariant(false, '`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://fb.me/react-invariant-dangerously-set-inner-html for more information.') : void 0;
  }
  {
    !(props.suppressContentEditableWarning || !props.contentEditable || props.children == null) ? warning(false, 'A component is `contentEditable` and contains `children` managed by ' + 'React. It is now your responsibility to guarantee that none of ' + 'those nodes are unexpectedly modified or duplicated. This is ' + 'probably not intentional.%s', getStack()) : void 0;
  }
  !(props.style == null || typeof props.style === 'object') ? invariant(false, 'The `style` prop expects a mapping from style properties to values, not a string. For example, style={{marginRight: spacing + \'em\'}} when using JSX.%s', getStack()) : void 0;
}

function isCustomComponent(tagName, props) {
  if (tagName.indexOf('-') === -1) {
    return typeof props.is === 'string';
  }
  switch (tagName) {
    // These are reserved SVG and MathML elements.
    // We don't mind this whitelist too much because we expect it to never grow.
    // The alternative is to track the namespace in a few places which is convoluted.
    // https://w3c.github.io/webcomponents/spec/custom/#custom-elements-core-concepts
    case 'annotation-xml':
    case 'color-profile':
    case 'font-face':
    case 'font-face-src':
    case 'font-face-uri':
    case 'font-face-format':
    case 'font-face-name':
    case 'missing-glyph':
      return false;
    default:
      return true;
  }
}

// When adding attributes to the HTML or SVG whitelist, be sure to
// also add them to this module to ensure casing and incorrect name
// warnings.
var possibleStandardNames = {
  // HTML
  accept: 'accept',
  acceptcharset: 'acceptCharset',
  'accept-charset': 'acceptCharset',
  accesskey: 'accessKey',
  action: 'action',
  allowfullscreen: 'allowFullScreen',
  alt: 'alt',
  as: 'as',
  async: 'async',
  autocapitalize: 'autoCapitalize',
  autocomplete: 'autoComplete',
  autocorrect: 'autoCorrect',
  autofocus: 'autoFocus',
  autoplay: 'autoPlay',
  autosave: 'autoSave',
  capture: 'capture',
  cellpadding: 'cellPadding',
  cellspacing: 'cellSpacing',
  challenge: 'challenge',
  charset: 'charSet',
  checked: 'checked',
  children: 'children',
  cite: 'cite',
  'class': 'className',
  classid: 'classID',
  classname: 'className',
  cols: 'cols',
  colspan: 'colSpan',
  content: 'content',
  contenteditable: 'contentEditable',
  contextmenu: 'contextMenu',
  controls: 'controls',
  controlslist: 'controlsList',
  coords: 'coords',
  crossorigin: 'crossOrigin',
  dangerouslysetinnerhtml: 'dangerouslySetInnerHTML',
  data: 'data',
  datetime: 'dateTime',
  'default': 'default',
  defaultchecked: 'defaultChecked',
  defaultvalue: 'defaultValue',
  defer: 'defer',
  dir: 'dir',
  disabled: 'disabled',
  download: 'download',
  draggable: 'draggable',
  enctype: 'encType',
  'for': 'htmlFor',
  form: 'form',
  formmethod: 'formMethod',
  formaction: 'formAction',
  formenctype: 'formEncType',
  formnovalidate: 'formNoValidate',
  formtarget: 'formTarget',
  frameborder: 'frameBorder',
  headers: 'headers',
  height: 'height',
  hidden: 'hidden',
  high: 'high',
  href: 'href',
  hreflang: 'hrefLang',
  htmlfor: 'htmlFor',
  httpequiv: 'httpEquiv',
  'http-equiv': 'httpEquiv',
  icon: 'icon',
  id: 'id',
  innerhtml: 'innerHTML',
  inputmode: 'inputMode',
  integrity: 'integrity',
  is: 'is',
  itemid: 'itemID',
  itemprop: 'itemProp',
  itemref: 'itemRef',
  itemscope: 'itemScope',
  itemtype: 'itemType',
  keyparams: 'keyParams',
  keytype: 'keyType',
  kind: 'kind',
  label: 'label',
  lang: 'lang',
  list: 'list',
  loop: 'loop',
  low: 'low',
  manifest: 'manifest',
  marginwidth: 'marginWidth',
  marginheight: 'marginHeight',
  max: 'max',
  maxlength: 'maxLength',
  media: 'media',
  mediagroup: 'mediaGroup',
  method: 'method',
  min: 'min',
  minlength: 'minLength',
  multiple: 'multiple',
  muted: 'muted',
  name: 'name',
  nomodule: 'noModule',
  nonce: 'nonce',
  novalidate: 'noValidate',
  open: 'open',
  optimum: 'optimum',
  pattern: 'pattern',
  placeholder: 'placeholder',
  playsinline: 'playsInline',
  poster: 'poster',
  preload: 'preload',
  profile: 'profile',
  radiogroup: 'radioGroup',
  readonly: 'readOnly',
  referrerpolicy: 'referrerPolicy',
  rel: 'rel',
  required: 'required',
  reversed: 'reversed',
  role: 'role',
  rows: 'rows',
  rowspan: 'rowSpan',
  sandbox: 'sandbox',
  scope: 'scope',
  scoped: 'scoped',
  scrolling: 'scrolling',
  seamless: 'seamless',
  selected: 'selected',
  shape: 'shape',
  size: 'size',
  sizes: 'sizes',
  span: 'span',
  spellcheck: 'spellCheck',
  src: 'src',
  srcdoc: 'srcDoc',
  srclang: 'srcLang',
  srcset: 'srcSet',
  start: 'start',
  step: 'step',
  style: 'style',
  summary: 'summary',
  tabindex: 'tabIndex',
  target: 'target',
  title: 'title',
  type: 'type',
  usemap: 'useMap',
  value: 'value',
  width: 'width',
  wmode: 'wmode',
  wrap: 'wrap',

  // SVG
  about: 'about',
  accentheight: 'accentHeight',
  'accent-height': 'accentHeight',
  accumulate: 'accumulate',
  additive: 'additive',
  alignmentbaseline: 'alignmentBaseline',
  'alignment-baseline': 'alignmentBaseline',
  allowreorder: 'allowReorder',
  alphabetic: 'alphabetic',
  amplitude: 'amplitude',
  arabicform: 'arabicForm',
  'arabic-form': 'arabicForm',
  ascent: 'ascent',
  attributename: 'attributeName',
  attributetype: 'attributeType',
  autoreverse: 'autoReverse',
  azimuth: 'azimuth',
  basefrequency: 'baseFrequency',
  baselineshift: 'baselineShift',
  'baseline-shift': 'baselineShift',
  baseprofile: 'baseProfile',
  bbox: 'bbox',
  begin: 'begin',
  bias: 'bias',
  by: 'by',
  calcmode: 'calcMode',
  capheight: 'capHeight',
  'cap-height': 'capHeight',
  clip: 'clip',
  clippath: 'clipPath',
  'clip-path': 'clipPath',
  clippathunits: 'clipPathUnits',
  cliprule: 'clipRule',
  'clip-rule': 'clipRule',
  color: 'color',
  colorinterpolation: 'colorInterpolation',
  'color-interpolation': 'colorInterpolation',
  colorinterpolationfilters: 'colorInterpolationFilters',
  'color-interpolation-filters': 'colorInterpolationFilters',
  colorprofile: 'colorProfile',
  'color-profile': 'colorProfile',
  colorrendering: 'colorRendering',
  'color-rendering': 'colorRendering',
  contentscripttype: 'contentScriptType',
  contentstyletype: 'contentStyleType',
  cursor: 'cursor',
  cx: 'cx',
  cy: 'cy',
  d: 'd',
  datatype: 'datatype',
  decelerate: 'decelerate',
  descent: 'descent',
  diffuseconstant: 'diffuseConstant',
  direction: 'direction',
  display: 'display',
  divisor: 'divisor',
  dominantbaseline: 'dominantBaseline',
  'dominant-baseline': 'dominantBaseline',
  dur: 'dur',
  dx: 'dx',
  dy: 'dy',
  edgemode: 'edgeMode',
  elevation: 'elevation',
  enablebackground: 'enableBackground',
  'enable-background': 'enableBackground',
  end: 'end',
  exponent: 'exponent',
  externalresourcesrequired: 'externalResourcesRequired',
  fill: 'fill',
  fillopacity: 'fillOpacity',
  'fill-opacity': 'fillOpacity',
  fillrule: 'fillRule',
  'fill-rule': 'fillRule',
  filter: 'filter',
  filterres: 'filterRes',
  filterunits: 'filterUnits',
  floodopacity: 'floodOpacity',
  'flood-opacity': 'floodOpacity',
  floodcolor: 'floodColor',
  'flood-color': 'floodColor',
  focusable: 'focusable',
  fontfamily: 'fontFamily',
  'font-family': 'fontFamily',
  fontsize: 'fontSize',
  'font-size': 'fontSize',
  fontsizeadjust: 'fontSizeAdjust',
  'font-size-adjust': 'fontSizeAdjust',
  fontstretch: 'fontStretch',
  'font-stretch': 'fontStretch',
  fontstyle: 'fontStyle',
  'font-style': 'fontStyle',
  fontvariant: 'fontVariant',
  'font-variant': 'fontVariant',
  fontweight: 'fontWeight',
  'font-weight': 'fontWeight',
  format: 'format',
  from: 'from',
  fx: 'fx',
  fy: 'fy',
  g1: 'g1',
  g2: 'g2',
  glyphname: 'glyphName',
  'glyph-name': 'glyphName',
  glyphorientationhorizontal: 'glyphOrientationHorizontal',
  'glyph-orientation-horizontal': 'glyphOrientationHorizontal',
  glyphorientationvertical: 'glyphOrientationVertical',
  'glyph-orientation-vertical': 'glyphOrientationVertical',
  glyphref: 'glyphRef',
  gradienttransform: 'gradientTransform',
  gradientunits: 'gradientUnits',
  hanging: 'hanging',
  horizadvx: 'horizAdvX',
  'horiz-adv-x': 'horizAdvX',
  horizoriginx: 'horizOriginX',
  'horiz-origin-x': 'horizOriginX',
  ideographic: 'ideographic',
  imagerendering: 'imageRendering',
  'image-rendering': 'imageRendering',
  in2: 'in2',
  'in': 'in',
  inlist: 'inlist',
  intercept: 'intercept',
  k1: 'k1',
  k2: 'k2',
  k3: 'k3',
  k4: 'k4',
  k: 'k',
  kernelmatrix: 'kernelMatrix',
  kernelunitlength: 'kernelUnitLength',
  kerning: 'kerning',
  keypoints: 'keyPoints',
  keysplines: 'keySplines',
  keytimes: 'keyTimes',
  lengthadjust: 'lengthAdjust',
  letterspacing: 'letterSpacing',
  'letter-spacing': 'letterSpacing',
  lightingcolor: 'lightingColor',
  'lighting-color': 'lightingColor',
  limitingconeangle: 'limitingConeAngle',
  local: 'local',
  markerend: 'markerEnd',
  'marker-end': 'markerEnd',
  markerheight: 'markerHeight',
  markermid: 'markerMid',
  'marker-mid': 'markerMid',
  markerstart: 'markerStart',
  'marker-start': 'markerStart',
  markerunits: 'markerUnits',
  markerwidth: 'markerWidth',
  mask: 'mask',
  maskcontentunits: 'maskContentUnits',
  maskunits: 'maskUnits',
  mathematical: 'mathematical',
  mode: 'mode',
  numoctaves: 'numOctaves',
  offset: 'offset',
  opacity: 'opacity',
  operator: 'operator',
  order: 'order',
  orient: 'orient',
  orientation: 'orientation',
  origin: 'origin',
  overflow: 'overflow',
  overlineposition: 'overlinePosition',
  'overline-position': 'overlinePosition',
  overlinethickness: 'overlineThickness',
  'overline-thickness': 'overlineThickness',
  paintorder: 'paintOrder',
  'paint-order': 'paintOrder',
  panose1: 'panose1',
  'panose-1': 'panose1',
  pathlength: 'pathLength',
  patterncontentunits: 'patternContentUnits',
  patterntransform: 'patternTransform',
  patternunits: 'patternUnits',
  pointerevents: 'pointerEvents',
  'pointer-events': 'pointerEvents',
  points: 'points',
  pointsatx: 'pointsAtX',
  pointsaty: 'pointsAtY',
  pointsatz: 'pointsAtZ',
  prefix: 'prefix',
  preservealpha: 'preserveAlpha',
  preserveaspectratio: 'preserveAspectRatio',
  primitiveunits: 'primitiveUnits',
  property: 'property',
  r: 'r',
  radius: 'radius',
  refx: 'refX',
  refy: 'refY',
  renderingintent: 'renderingIntent',
  'rendering-intent': 'renderingIntent',
  repeatcount: 'repeatCount',
  repeatdur: 'repeatDur',
  requiredextensions: 'requiredExtensions',
  requiredfeatures: 'requiredFeatures',
  resource: 'resource',
  restart: 'restart',
  result: 'result',
  results: 'results',
  rotate: 'rotate',
  rx: 'rx',
  ry: 'ry',
  scale: 'scale',
  security: 'security',
  seed: 'seed',
  shaperendering: 'shapeRendering',
  'shape-rendering': 'shapeRendering',
  slope: 'slope',
  spacing: 'spacing',
  specularconstant: 'specularConstant',
  specularexponent: 'specularExponent',
  speed: 'speed',
  spreadmethod: 'spreadMethod',
  startoffset: 'startOffset',
  stddeviation: 'stdDeviation',
  stemh: 'stemh',
  stemv: 'stemv',
  stitchtiles: 'stitchTiles',
  stopcolor: 'stopColor',
  'stop-color': 'stopColor',
  stopopacity: 'stopOpacity',
  'stop-opacity': 'stopOpacity',
  strikethroughposition: 'strikethroughPosition',
  'strikethrough-position': 'strikethroughPosition',
  strikethroughthickness: 'strikethroughThickness',
  'strikethrough-thickness': 'strikethroughThickness',
  string: 'string',
  stroke: 'stroke',
  strokedasharray: 'strokeDasharray',
  'stroke-dasharray': 'strokeDasharray',
  strokedashoffset: 'strokeDashoffset',
  'stroke-dashoffset': 'strokeDashoffset',
  strokelinecap: 'strokeLinecap',
  'stroke-linecap': 'strokeLinecap',
  strokelinejoin: 'strokeLinejoin',
  'stroke-linejoin': 'strokeLinejoin',
  strokemiterlimit: 'strokeMiterlimit',
  'stroke-miterlimit': 'strokeMiterlimit',
  strokewidth: 'strokeWidth',
  'stroke-width': 'strokeWidth',
  strokeopacity: 'strokeOpacity',
  'stroke-opacity': 'strokeOpacity',
  suppresscontenteditablewarning: 'suppressContentEditableWarning',
  suppresshydrationwarning: 'suppressHydrationWarning',
  surfacescale: 'surfaceScale',
  systemlanguage: 'systemLanguage',
  tablevalues: 'tableValues',
  targetx: 'targetX',
  targety: 'targetY',
  textanchor: 'textAnchor',
  'text-anchor': 'textAnchor',
  textdecoration: 'textDecoration',
  'text-decoration': 'textDecoration',
  textlength: 'textLength',
  textrendering: 'textRendering',
  'text-rendering': 'textRendering',
  to: 'to',
  transform: 'transform',
  'typeof': 'typeof',
  u1: 'u1',
  u2: 'u2',
  underlineposition: 'underlinePosition',
  'underline-position': 'underlinePosition',
  underlinethickness: 'underlineThickness',
  'underline-thickness': 'underlineThickness',
  unicode: 'unicode',
  unicodebidi: 'unicodeBidi',
  'unicode-bidi': 'unicodeBidi',
  unicoderange: 'unicodeRange',
  'unicode-range': 'unicodeRange',
  unitsperem: 'unitsPerEm',
  'units-per-em': 'unitsPerEm',
  unselectable: 'unselectable',
  valphabetic: 'vAlphabetic',
  'v-alphabetic': 'vAlphabetic',
  values: 'values',
  vectoreffect: 'vectorEffect',
  'vector-effect': 'vectorEffect',
  version: 'version',
  vertadvy: 'vertAdvY',
  'vert-adv-y': 'vertAdvY',
  vertoriginx: 'vertOriginX',
  'vert-origin-x': 'vertOriginX',
  vertoriginy: 'vertOriginY',
  'vert-origin-y': 'vertOriginY',
  vhanging: 'vHanging',
  'v-hanging': 'vHanging',
  videographic: 'vIdeographic',
  'v-ideographic': 'vIdeographic',
  viewbox: 'viewBox',
  viewtarget: 'viewTarget',
  visibility: 'visibility',
  vmathematical: 'vMathematical',
  'v-mathematical': 'vMathematical',
  vocab: 'vocab',
  widths: 'widths',
  wordspacing: 'wordSpacing',
  'word-spacing': 'wordSpacing',
  writingmode: 'writingMode',
  'writing-mode': 'writingMode',
  x1: 'x1',
  x2: 'x2',
  x: 'x',
  xchannelselector: 'xChannelSelector',
  xheight: 'xHeight',
  'x-height': 'xHeight',
  xlinkactuate: 'xlinkActuate',
  'xlink:actuate': 'xlinkActuate',
  xlinkarcrole: 'xlinkArcrole',
  'xlink:arcrole': 'xlinkArcrole',
  xlinkhref: 'xlinkHref',
  'xlink:href': 'xlinkHref',
  xlinkrole: 'xlinkRole',
  'xlink:role': 'xlinkRole',
  xlinkshow: 'xlinkShow',
  'xlink:show': 'xlinkShow',
  xlinktitle: 'xlinkTitle',
  'xlink:title': 'xlinkTitle',
  xlinktype: 'xlinkType',
  'xlink:type': 'xlinkType',
  xmlbase: 'xmlBase',
  'xml:base': 'xmlBase',
  xmllang: 'xmlLang',
  'xml:lang': 'xmlLang',
  xmlns: 'xmlns',
  'xml:space': 'xmlSpace',
  xmlnsxlink: 'xmlnsXlink',
  'xmlns:xlink': 'xmlnsXlink',
  xmlspace: 'xmlSpace',
  y1: 'y1',
  y2: 'y2',
  y: 'y',
  ychannelselector: 'yChannelSelector',
  z: 'z',
  zoomandpan: 'zoomAndPan'
};

var ariaProperties = {
  'aria-current': 0, // state
  'aria-details': 0,
  'aria-disabled': 0, // state
  'aria-hidden': 0, // state
  'aria-invalid': 0, // state
  'aria-keyshortcuts': 0,
  'aria-label': 0,
  'aria-roledescription': 0,
  // Widget Attributes
  'aria-autocomplete': 0,
  'aria-checked': 0,
  'aria-expanded': 0,
  'aria-haspopup': 0,
  'aria-level': 0,
  'aria-modal': 0,
  'aria-multiline': 0,
  'aria-multiselectable': 0,
  'aria-orientation': 0,
  'aria-placeholder': 0,
  'aria-pressed': 0,
  'aria-readonly': 0,
  'aria-required': 0,
  'aria-selected': 0,
  'aria-sort': 0,
  'aria-valuemax': 0,
  'aria-valuemin': 0,
  'aria-valuenow': 0,
  'aria-valuetext': 0,
  // Live Region Attributes
  'aria-atomic': 0,
  'aria-busy': 0,
  'aria-live': 0,
  'aria-relevant': 0,
  // Drag-and-Drop Attributes
  'aria-dropeffect': 0,
  'aria-grabbed': 0,
  // Relationship Attributes
  'aria-activedescendant': 0,
  'aria-colcount': 0,
  'aria-colindex': 0,
  'aria-colspan': 0,
  'aria-controls': 0,
  'aria-describedby': 0,
  'aria-errormessage': 0,
  'aria-flowto': 0,
  'aria-labelledby': 0,
  'aria-owns': 0,
  'aria-posinset': 0,
  'aria-rowcount': 0,
  'aria-rowindex': 0,
  'aria-rowspan': 0,
  'aria-setsize': 0
};

var warnedProperties = {};
var rARIA = new RegExp('^(aria)-[' + ATTRIBUTE_NAME_CHAR + ']*$');
var rARIACamel = new RegExp('^(aria)[A-Z][' + ATTRIBUTE_NAME_CHAR + ']*$');

var hasOwnProperty = Object.prototype.hasOwnProperty;

function getStackAddendum() {
  var stack = ReactDebugCurrentFrame.getStackAddendum();
  return stack != null ? stack : '';
}

function validateProperty(tagName, name) {
  if (hasOwnProperty.call(warnedProperties, name) && warnedProperties[name]) {
    return true;
  }

  if (rARIACamel.test(name)) {
    var ariaName = 'aria-' + name.slice(4).toLowerCase();
    var correctName = ariaProperties.hasOwnProperty(ariaName) ? ariaName : null;

    // If this is an aria-* attribute, but is not listed in the known DOM
    // DOM properties, then it is an invalid aria-* attribute.
    if (correctName == null) {
      warning(false, 'Invalid ARIA attribute `%s`. ARIA attributes follow the pattern aria-* and must be lowercase.%s', name, getStackAddendum());
      warnedProperties[name] = true;
      return true;
    }
    // aria-* attributes should be lowercase; suggest the lowercase version.
    if (name !== correctName) {
      warning(false, 'Invalid ARIA attribute `%s`. Did you mean `%s`?%s', name, correctName, getStackAddendum());
      warnedProperties[name] = true;
      return true;
    }
  }

  if (rARIA.test(name)) {
    var lowerCasedName = name.toLowerCase();
    var standardName = ariaProperties.hasOwnProperty(lowerCasedName) ? lowerCasedName : null;

    // If this is an aria-* attribute, but is not listed in the known DOM
    // DOM properties, then it is an invalid aria-* attribute.
    if (standardName == null) {
      warnedProperties[name] = true;
      return false;
    }
    // aria-* attributes should be lowercase; suggest the lowercase version.
    if (name !== standardName) {
      warning(false, 'Unknown ARIA attribute `%s`. Did you mean `%s`?%s', name, standardName, getStackAddendum());
      warnedProperties[name] = true;
      return true;
    }
  }

  return true;
}

function warnInvalidARIAProps(type, props) {
  var invalidProps = [];

  for (var key in props) {
    var isValid = validateProperty(type, key);
    if (!isValid) {
      invalidProps.push(key);
    }
  }

  var unknownPropString = invalidProps.map(function (prop) {
    return '`' + prop + '`';
  }).join(', ');

  if (invalidProps.length === 1) {
    warning(false, 'Invalid aria prop %s on <%s> tag. ' + 'For details, see https://fb.me/invalid-aria-prop%s', unknownPropString, type, getStackAddendum());
  } else if (invalidProps.length > 1) {
    warning(false, 'Invalid aria props %s on <%s> tag. ' + 'For details, see https://fb.me/invalid-aria-prop%s', unknownPropString, type, getStackAddendum());
  }
}

function validateProperties(type, props) {
  if (isCustomComponent(type, props)) {
    return;
  }
  warnInvalidARIAProps(type, props);
}

var didWarnValueNull = false;

function getStackAddendum$1() {
  var stack = ReactDebugCurrentFrame.getStackAddendum();
  return stack != null ? stack : '';
}

function validateProperties$1(type, props) {
  if (type !== 'input' && type !== 'textarea' && type !== 'select') {
    return;
  }

  if (props != null && props.value === null && !didWarnValueNull) {
    didWarnValueNull = true;
    if (type === 'select' && props.multiple) {
      warning(false, '`value` prop on `%s` should not be null. ' + 'Consider using an empty array when `multiple` is set to `true` ' + 'to clear the component or `undefined` for uncontrolled components.%s', type, getStackAddendum$1());
    } else {
      warning(false, '`value` prop on `%s` should not be null. ' + 'Consider using an empty string to clear the component or `undefined` ' + 'for uncontrolled components.%s', type, getStackAddendum$1());
    }
  }
}

function getStackAddendum$2() {
  var stack = ReactDebugCurrentFrame.getStackAddendum();
  return stack != null ? stack : '';
}

var validateProperty$1 = function () {};

{
  var warnedProperties$1 = {};
  var _hasOwnProperty = Object.prototype.hasOwnProperty;
  var EVENT_NAME_REGEX = /^on./;
  var INVALID_EVENT_NAME_REGEX = /^on[^A-Z]/;
  var rARIA$1 = new RegExp('^(aria)-[' + ATTRIBUTE_NAME_CHAR + ']*$');
  var rARIACamel$1 = new RegExp('^(aria)[A-Z][' + ATTRIBUTE_NAME_CHAR + ']*$');

  validateProperty$1 = function (tagName, name, value, canUseEventSystem) {
    if (_hasOwnProperty.call(warnedProperties$1, name) && warnedProperties$1[name]) {
      return true;
    }

    var lowerCasedName = name.toLowerCase();
    if (lowerCasedName === 'onfocusin' || lowerCasedName === 'onfocusout') {
      warning(false, 'React uses onFocus and onBlur instead of onFocusIn and onFocusOut. ' + 'All React events are normalized to bubble, so onFocusIn and onFocusOut ' + 'are not needed/supported by React.');
      warnedProperties$1[name] = true;
      return true;
    }

    // We can't rely on the event system being injected on the server.
    if (canUseEventSystem) {
      if (registrationNameModules.hasOwnProperty(name)) {
        return true;
      }
      var registrationName = possibleRegistrationNames.hasOwnProperty(lowerCasedName) ? possibleRegistrationNames[lowerCasedName] : null;
      if (registrationName != null) {
        warning(false, 'Invalid event handler property `%s`. Did you mean `%s`?%s', name, registrationName, getStackAddendum$2());
        warnedProperties$1[name] = true;
        return true;
      }
      if (EVENT_NAME_REGEX.test(name)) {
        warning(false, 'Unknown event handler property `%s`. It will be ignored.%s', name, getStackAddendum$2());
        warnedProperties$1[name] = true;
        return true;
      }
    } else if (EVENT_NAME_REGEX.test(name)) {
      // If no event plugins have been injected, we are in a server environment.
      // So we can't tell if the event name is correct for sure, but we can filter
      // out known bad ones like `onclick`. We can't suggest a specific replacement though.
      if (INVALID_EVENT_NAME_REGEX.test(name)) {
        warning(false, 'Invalid event handler property `%s`. ' + 'React events use the camelCase naming convention, for example `onClick`.%s', name, getStackAddendum$2());
      }
      warnedProperties$1[name] = true;
      return true;
    }

    // Let the ARIA attribute hook validate ARIA attributes
    if (rARIA$1.test(name) || rARIACamel$1.test(name)) {
      return true;
    }

    if (lowerCasedName === 'innerhtml') {
      warning(false, 'Directly setting property `innerHTML` is not permitted. ' + 'For more information, lookup documentation on `dangerouslySetInnerHTML`.');
      warnedProperties$1[name] = true;
      return true;
    }

    if (lowerCasedName === 'aria') {
      warning(false, 'The `aria` attribute is reserved for future use in React. ' + 'Pass individual `aria-` attributes instead.');
      warnedProperties$1[name] = true;
      return true;
    }

    if (lowerCasedName === 'is' && value !== null && value !== undefined && typeof value !== 'string') {
      warning(false, 'Received a `%s` for a string attribute `is`. If this is expected, cast ' + 'the value to a string.%s', typeof value, getStackAddendum$2());
      warnedProperties$1[name] = true;
      return true;
    }

    if (typeof value === 'number' && isNaN(value)) {
      warning(false, 'Received NaN for the `%s` attribute. If this is expected, cast ' + 'the value to a string.%s', name, getStackAddendum$2());
      warnedProperties$1[name] = true;
      return true;
    }

    var propertyInfo = getPropertyInfo(name);
    var isReserved = propertyInfo !== null && propertyInfo.type === RESERVED;

    // Known attributes should match the casing specified in the property config.
    if (possibleStandardNames.hasOwnProperty(lowerCasedName)) {
      var standardName = possibleStandardNames[lowerCasedName];
      if (standardName !== name) {
        warning(false, 'Invalid DOM property `%s`. Did you mean `%s`?%s', name, standardName, getStackAddendum$2());
        warnedProperties$1[name] = true;
        return true;
      }
    } else if (!isReserved && name !== lowerCasedName) {
      // Unknown attributes should have lowercase casing since that's how they
      // will be cased anyway with server rendering.
      warning(false, 'React does not recognize the `%s` prop on a DOM element. If you ' + 'intentionally want it to appear in the DOM as a custom ' + 'attribute, spell it as lowercase `%s` instead. ' + 'If you accidentally passed it from a parent component, remove ' + 'it from the DOM element.%s', name, lowerCasedName, getStackAddendum$2());
      warnedProperties$1[name] = true;
      return true;
    }

    if (typeof value === 'boolean' && shouldRemoveAttributeWithWarning(name, value, propertyInfo, false)) {
      if (value) {
        warning(false, 'Received `%s` for a non-boolean attribute `%s`.\n\n' + 'If you want to write it to the DOM, pass a string instead: ' + '%s="%s" or %s={value.toString()}.%s', value, name, name, value, name, getStackAddendum$2());
      } else {
        warning(false, 'Received `%s` for a non-boolean attribute `%s`.\n\n' + 'If you want to write it to the DOM, pass a string instead: ' + '%s="%s" or %s={value.toString()}.\n\n' + 'If you used to conditionally omit it with %s={condition && value}, ' + 'pass %s={condition ? value : undefined} instead.%s', value, name, name, value, name, name, name, getStackAddendum$2());
      }
      warnedProperties$1[name] = true;
      return true;
    }

    // Now that we've validated casing, do not validate
    // data types for reserved props
    if (isReserved) {
      return true;
    }

    // Warn when a known attribute is a bad type
    if (shouldRemoveAttributeWithWarning(name, value, propertyInfo, false)) {
      warnedProperties$1[name] = true;
      return false;
    }

    return true;
  };
}

var warnUnknownProperties = function (type, props, canUseEventSystem) {
  var unknownProps = [];
  for (var key in props) {
    var isValid = validateProperty$1(type, key, props[key], canUseEventSystem);
    if (!isValid) {
      unknownProps.push(key);
    }
  }

  var unknownPropString = unknownProps.map(function (prop) {
    return '`' + prop + '`';
  }).join(', ');
  if (unknownProps.length === 1) {
    warning(false, 'Invalid value for prop %s on <%s> tag. Either remove it from the element, ' + 'or pass a string or number value to keep it in the DOM. ' + 'For details, see https://fb.me/react-attribute-behavior%s', unknownPropString, type, getStackAddendum$2());
  } else if (unknownProps.length > 1) {
    warning(false, 'Invalid values for props %s on <%s> tag. Either remove them from the element, ' + 'or pass a string or number value to keep them in the DOM. ' + 'For details, see https://fb.me/react-attribute-behavior%s', unknownPropString, type, getStackAddendum$2());
  }
};

function validateProperties$2(type, props, canUseEventSystem) {
  if (isCustomComponent(type, props)) {
    return;
  }
  warnUnknownProperties(type, props, canUseEventSystem);
}

// TODO: direct imports like some-package/src/* are bad. Fix me.
var getCurrentFiberOwnerName$2 = ReactDebugCurrentFiber.getCurrentFiberOwnerName;
var getCurrentFiberStackAddendum$3 = ReactDebugCurrentFiber.getCurrentFiberStackAddendum;

var didWarnInvalidHydration = false;
var didWarnShadyDOM = false;

var DANGEROUSLY_SET_INNER_HTML = 'dangerouslySetInnerHTML';
var SUPPRESS_CONTENT_EDITABLE_WARNING = 'suppressContentEditableWarning';
var SUPPRESS_HYDRATION_WARNING$1 = 'suppressHydrationWarning';
var AUTOFOCUS = 'autoFocus';
var CHILDREN = 'children';
var STYLE = 'style';
var HTML = '__html';

var HTML_NAMESPACE = Namespaces.html;


var getStack = emptyFunction.thatReturns('');

var warnedUnknownTags = void 0;
var suppressHydrationWarning = void 0;

var validatePropertiesInDevelopment = void 0;
var warnForTextDifference = void 0;
var warnForPropDifference = void 0;
var warnForExtraAttributes = void 0;
var warnForInvalidEventListener = void 0;

var normalizeMarkupForTextOrAttribute = void 0;
var normalizeHTML = void 0;

{
  getStack = getCurrentFiberStackAddendum$3;

  warnedUnknownTags = {
    // Chrome is the only major browser not shipping <time>. But as of July
    // 2017 it intends to ship it due to widespread usage. We intentionally
    // *don't* warn for <time> even if it's unrecognized by Chrome because
    // it soon will be, and many apps have been using it anyway.
    time: true,
    // There are working polyfills for <dialog>. Let people use it.
    dialog: true
  };

  validatePropertiesInDevelopment = function (type, props) {
    validateProperties(type, props);
    validateProperties$1(type, props);
    validateProperties$2(type, props, /* canUseEventSystem */true);
  };

  // HTML parsing normalizes CR and CRLF to LF.
  // It also can turn \u0000 into \uFFFD inside attributes.
  // https://www.w3.org/TR/html5/single-page.html#preprocessing-the-input-stream
  // If we have a mismatch, it might be caused by that.
  // We will still patch up in this case but not fire the warning.
  var NORMALIZE_NEWLINES_REGEX = /\r\n?/g;
  var NORMALIZE_NULL_AND_REPLACEMENT_REGEX = /\u0000|\uFFFD/g;

  normalizeMarkupForTextOrAttribute = function (markup) {
    var markupString = typeof markup === 'string' ? markup : '' + markup;
    return markupString.replace(NORMALIZE_NEWLINES_REGEX, '\n').replace(NORMALIZE_NULL_AND_REPLACEMENT_REGEX, '');
  };

  warnForTextDifference = function (serverText, clientText) {
    if (didWarnInvalidHydration) {
      return;
    }
    var normalizedClientText = normalizeMarkupForTextOrAttribute(clientText);
    var normalizedServerText = normalizeMarkupForTextOrAttribute(serverText);
    if (normalizedServerText === normalizedClientText) {
      return;
    }
    didWarnInvalidHydration = true;
    warning(false, 'Text content did not match. Server: "%s" Client: "%s"', normalizedServerText, normalizedClientText);
  };

  warnForPropDifference = function (propName, serverValue, clientValue) {
    if (didWarnInvalidHydration) {
      return;
    }
    var normalizedClientValue = normalizeMarkupForTextOrAttribute(clientValue);
    var normalizedServerValue = normalizeMarkupForTextOrAttribute(serverValue);
    if (normalizedServerValue === normalizedClientValue) {
      return;
    }
    didWarnInvalidHydration = true;
    warning(false, 'Prop `%s` did not match. Server: %s Client: %s', propName, JSON.stringify(normalizedServerValue), JSON.stringify(normalizedClientValue));
  };

  warnForExtraAttributes = function (attributeNames) {
    if (didWarnInvalidHydration) {
      return;
    }
    didWarnInvalidHydration = true;
    var names = [];
    attributeNames.forEach(function (name) {
      names.push(name);
    });
    warning(false, 'Extra attributes from the server: %s', names);
  };

  warnForInvalidEventListener = function (registrationName, listener) {
    if (listener === false) {
      warning(false, 'Expected `%s` listener to be a function, instead got `false`.\n\n' + 'If you used to conditionally omit it with %s={condition && value}, ' + 'pass %s={condition ? value : undefined} instead.%s', registrationName, registrationName, registrationName, getCurrentFiberStackAddendum$3());
    } else {
      warning(false, 'Expected `%s` listener to be a function, instead got a value of `%s` type.%s', registrationName, typeof listener, getCurrentFiberStackAddendum$3());
    }
  };

  // Parse the HTML and read it back to normalize the HTML string so that it
  // can be used for comparison.
  normalizeHTML = function (parent, html) {
    // We could have created a separate document here to avoid
    // re-initializing custom elements if they exist. But this breaks
    // how <noscript> is being handled. So we use the same document.
    // See the discussion in https://github.com/facebook/react/pull/11157.
    var testElement = parent.namespaceURI === HTML_NAMESPACE ? parent.ownerDocument.createElement(parent.tagName) : parent.ownerDocument.createElementNS(parent.namespaceURI, parent.tagName);
    testElement.innerHTML = html;
    return testElement.innerHTML;
  };
}

function ensureListeningTo(rootContainerElement, registrationName) {
  var isDocumentOrFragment = rootContainerElement.nodeType === DOCUMENT_NODE || rootContainerElement.nodeType === DOCUMENT_FRAGMENT_NODE;
  var doc = isDocumentOrFragment ? rootContainerElement : rootContainerElement.ownerDocument;
  listenTo(registrationName, doc);
}

function getOwnerDocumentFromRootContainer(rootContainerElement) {
  return rootContainerElement.nodeType === DOCUMENT_NODE ? rootContainerElement : rootContainerElement.ownerDocument;
}

function trapClickOnNonInteractiveElement(node) {
  // Mobile Safari does not fire properly bubble click events on
  // non-interactive elements, which means delegated click listeners do not
  // fire. The workaround for this bug involves attaching an empty click
  // listener on the target node.
  // http://www.quirksmode.org/blog/archives/2010/09/click_event_del.html
  // Just set it using the onclick property so that we don't have to manage any
  // bookkeeping for it. Not sure if we need to clear it when the listener is
  // removed.
  // TODO: Only do this for the relevant Safaris maybe?
  node.onclick = emptyFunction;
}

function setInitialDOMProperties(tag, domElement, rootContainerElement, nextProps, isCustomComponentTag) {
  for (var propKey in nextProps) {
    if (!nextProps.hasOwnProperty(propKey)) {
      continue;
    }
    var nextProp = nextProps[propKey];
    if (propKey === STYLE) {
      {
        if (nextProp) {
          // Freeze the next style object so that we can assume it won't be
          // mutated. We have already warned for this in the past.
          Object.freeze(nextProp);
        }
      }
      // Relies on `updateStylesByID` not mutating `styleUpdates`.
      setValueForStyles(domElement, nextProp, getStack);
    } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
      var nextHtml = nextProp ? nextProp[HTML] : undefined;
      if (nextHtml != null) {
        setInnerHTML(domElement, nextHtml);
      }
    } else if (propKey === CHILDREN) {
      if (typeof nextProp === 'string') {
        // Avoid setting initial textContent when the text is empty. In IE11 setting
        // textContent on a <textarea> will cause the placeholder to not
        // show within the <textarea> until it has been focused and blurred again.
        // https://github.com/facebook/react/issues/6731#issuecomment-254874553
        var canSetTextContent = tag !== 'textarea' || nextProp !== '';
        if (canSetTextContent) {
          setTextContent(domElement, nextProp);
        }
      } else if (typeof nextProp === 'number') {
        setTextContent(domElement, '' + nextProp);
      }
    } else if (propKey === SUPPRESS_CONTENT_EDITABLE_WARNING || propKey === SUPPRESS_HYDRATION_WARNING$1) {
      // Noop
    } else if (propKey === AUTOFOCUS) {
      // We polyfill it separately on the client during commit.
      // We blacklist it here rather than in the property list because we emit it in SSR.
    } else if (registrationNameModules.hasOwnProperty(propKey)) {
      if (nextProp != null) {
        if (true && typeof nextProp !== 'function') {
          warnForInvalidEventListener(propKey, nextProp);
        }
        ensureListeningTo(rootContainerElement, propKey);
      }
    } else if (nextProp != null) {
      setValueForProperty(domElement, propKey, nextProp, isCustomComponentTag);
    }
  }
}

function updateDOMProperties(domElement, updatePayload, wasCustomComponentTag, isCustomComponentTag) {
  // TODO: Handle wasCustomComponentTag
  for (var i = 0; i < updatePayload.length; i += 2) {
    var propKey = updatePayload[i];
    var propValue = updatePayload[i + 1];
    if (propKey === STYLE) {
      setValueForStyles(domElement, propValue, getStack);
    } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
      setInnerHTML(domElement, propValue);
    } else if (propKey === CHILDREN) {
      setTextContent(domElement, propValue);
    } else {
      setValueForProperty(domElement, propKey, propValue, isCustomComponentTag);
    }
  }
}

function createElement$1(type, props, rootContainerElement, parentNamespace) {
  var isCustomComponentTag = void 0;

  // We create tags in the namespace of their parent container, except HTML
  // tags get no namespace.
  var ownerDocument = getOwnerDocumentFromRootContainer(rootContainerElement);
  var domElement = void 0;
  var namespaceURI = parentNamespace;
  if (namespaceURI === HTML_NAMESPACE) {
    namespaceURI = getIntrinsicNamespace(type);
  }
  if (namespaceURI === HTML_NAMESPACE) {
    {
      isCustomComponentTag = isCustomComponent(type, props);
      // Should this check be gated by parent namespace? Not sure we want to
      // allow <SVG> or <mATH>.
      !(isCustomComponentTag || type === type.toLowerCase()) ? warning(false, '<%s /> is using incorrect casing. ' + 'Use PascalCase for React components, ' + 'or lowercase for HTML elements.', type) : void 0;
    }

    if (type === 'script') {
      // Create the script via .innerHTML so its "parser-inserted" flag is
      // set to true and it does not execute
      var div = ownerDocument.createElement('div');
      div.innerHTML = '<script><' + '/script>'; // eslint-disable-line
      // This is guaranteed to yield a script element.
      var firstChild = div.firstChild;
      domElement = div.removeChild(firstChild);
    } else if (typeof props.is === 'string') {
      // $FlowIssue `createElement` should be updated for Web Components
      domElement = ownerDocument.createElement(type, { is: props.is });
    } else {
      // Separate else branch instead of using `props.is || undefined` above because of a Firefox bug.
      // See discussion in https://github.com/facebook/react/pull/6896
      // and discussion in https://bugzilla.mozilla.org/show_bug.cgi?id=1276240
      domElement = ownerDocument.createElement(type);
    }
  } else {
    domElement = ownerDocument.createElementNS(namespaceURI, type);
  }

  {
    if (namespaceURI === HTML_NAMESPACE) {
      if (!isCustomComponentTag && Object.prototype.toString.call(domElement) === '[object HTMLUnknownElement]' && !Object.prototype.hasOwnProperty.call(warnedUnknownTags, type)) {
        warnedUnknownTags[type] = true;
        warning(false, 'The tag <%s> is unrecognized in this browser. ' + 'If you meant to render a React component, start its name with ' + 'an uppercase letter.', type);
      }
    }
  }

  return domElement;
}

function createTextNode$1(text, rootContainerElement) {
  return getOwnerDocumentFromRootContainer(rootContainerElement).createTextNode(text);
}

function setInitialProperties$1(domElement, tag, rawProps, rootContainerElement) {
  var isCustomComponentTag = isCustomComponent(tag, rawProps);
  {
    validatePropertiesInDevelopment(tag, rawProps);
    if (isCustomComponentTag && !didWarnShadyDOM && domElement.shadyRoot) {
      warning(false, '%s is using shady DOM. Using shady DOM with React can ' + 'cause things to break subtly.', getCurrentFiberOwnerName$2() || 'A component');
      didWarnShadyDOM = true;
    }
  }

  // TODO: Make sure that we check isMounted before firing any of these events.
  var props = void 0;
  switch (tag) {
    case 'iframe':
    case 'object':
      trapBubbledEvent('topLoad', 'load', domElement);
      props = rawProps;
      break;
    case 'video':
    case 'audio':
      // Create listener for each media event
      for (var event in mediaEventTypes) {
        if (mediaEventTypes.hasOwnProperty(event)) {
          trapBubbledEvent(event, mediaEventTypes[event], domElement);
        }
      }
      props = rawProps;
      break;
    case 'source':
      trapBubbledEvent('topError', 'error', domElement);
      props = rawProps;
      break;
    case 'img':
    case 'image':
    case 'link':
      trapBubbledEvent('topError', 'error', domElement);
      trapBubbledEvent('topLoad', 'load', domElement);
      props = rawProps;
      break;
    case 'form':
      trapBubbledEvent('topReset', 'reset', domElement);
      trapBubbledEvent('topSubmit', 'submit', domElement);
      props = rawProps;
      break;
    case 'details':
      trapBubbledEvent('topToggle', 'toggle', domElement);
      props = rawProps;
      break;
    case 'input':
      initWrapperState(domElement, rawProps);
      props = getHostProps(domElement, rawProps);
      trapBubbledEvent('topInvalid', 'invalid', domElement);
      // For controlled components we always need to ensure we're listening
      // to onChange. Even if there is no listener.
      ensureListeningTo(rootContainerElement, 'onChange');
      break;
    case 'option':
      validateProps(domElement, rawProps);
      props = getHostProps$1(domElement, rawProps);
      break;
    case 'select':
      initWrapperState$1(domElement, rawProps);
      props = getHostProps$2(domElement, rawProps);
      trapBubbledEvent('topInvalid', 'invalid', domElement);
      // For controlled components we always need to ensure we're listening
      // to onChange. Even if there is no listener.
      ensureListeningTo(rootContainerElement, 'onChange');
      break;
    case 'textarea':
      initWrapperState$2(domElement, rawProps);
      props = getHostProps$3(domElement, rawProps);
      trapBubbledEvent('topInvalid', 'invalid', domElement);
      // For controlled components we always need to ensure we're listening
      // to onChange. Even if there is no listener.
      ensureListeningTo(rootContainerElement, 'onChange');
      break;
    default:
      props = rawProps;
  }

  assertValidProps(tag, props, getStack);

  setInitialDOMProperties(tag, domElement, rootContainerElement, props, isCustomComponentTag);

  switch (tag) {
    case 'input':
      // TODO: Make sure we check if this is still unmounted or do any clean
      // up necessary since we never stop tracking anymore.
      track(domElement);
      postMountWrapper(domElement, rawProps);
      break;
    case 'textarea':
      // TODO: Make sure we check if this is still unmounted or do any clean
      // up necessary since we never stop tracking anymore.
      track(domElement);
      postMountWrapper$3(domElement, rawProps);
      break;
    case 'option':
      postMountWrapper$1(domElement, rawProps);
      break;
    case 'select':
      postMountWrapper$2(domElement, rawProps);
      break;
    default:
      if (typeof props.onClick === 'function') {
        // TODO: This cast may not be sound for SVG, MathML or custom elements.
        trapClickOnNonInteractiveElement(domElement);
      }
      break;
  }
}

// Calculate the diff between the two objects.
function diffProperties$1(domElement, tag, lastRawProps, nextRawProps, rootContainerElement) {
  {
    validatePropertiesInDevelopment(tag, nextRawProps);
  }

  var updatePayload = null;

  var lastProps = void 0;
  var nextProps = void 0;
  switch (tag) {
    case 'input':
      lastProps = getHostProps(domElement, lastRawProps);
      nextProps = getHostProps(domElement, nextRawProps);
      updatePayload = [];
      break;
    case 'option':
      lastProps = getHostProps$1(domElement, lastRawProps);
      nextProps = getHostProps$1(domElement, nextRawProps);
      updatePayload = [];
      break;
    case 'select':
      lastProps = getHostProps$2(domElement, lastRawProps);
      nextProps = getHostProps$2(domElement, nextRawProps);
      updatePayload = [];
      break;
    case 'textarea':
      lastProps = getHostProps$3(domElement, lastRawProps);
      nextProps = getHostProps$3(domElement, nextRawProps);
      updatePayload = [];
      break;
    default:
      lastProps = lastRawProps;
      nextProps = nextRawProps;
      if (typeof lastProps.onClick !== 'function' && typeof nextProps.onClick === 'function') {
        // TODO: This cast may not be sound for SVG, MathML or custom elements.
        trapClickOnNonInteractiveElement(domElement);
      }
      break;
  }

  assertValidProps(tag, nextProps, getStack);

  var propKey = void 0;
  var styleName = void 0;
  var styleUpdates = null;
  for (propKey in lastProps) {
    if (nextProps.hasOwnProperty(propKey) || !lastProps.hasOwnProperty(propKey) || lastProps[propKey] == null) {
      continue;
    }
    if (propKey === STYLE) {
      var lastStyle = lastProps[propKey];
      for (styleName in lastStyle) {
        if (lastStyle.hasOwnProperty(styleName)) {
          if (!styleUpdates) {
            styleUpdates = {};
          }
          styleUpdates[styleName] = '';
        }
      }
    } else if (propKey === DANGEROUSLY_SET_INNER_HTML || propKey === CHILDREN) {
      // Noop. This is handled by the clear text mechanism.
    } else if (propKey === SUPPRESS_CONTENT_EDITABLE_WARNING || propKey === SUPPRESS_HYDRATION_WARNING$1) {
      // Noop
    } else if (propKey === AUTOFOCUS) {
      // Noop. It doesn't work on updates anyway.
    } else if (registrationNameModules.hasOwnProperty(propKey)) {
      // This is a special case. If any listener updates we need to ensure
      // that the "current" fiber pointer gets updated so we need a commit
      // to update this element.
      if (!updatePayload) {
        updatePayload = [];
      }
    } else {
      // For all other deleted properties we add it to the queue. We use
      // the whitelist in the commit phase instead.
      (updatePayload = updatePayload || []).push(propKey, null);
    }
  }
  for (propKey in nextProps) {
    var nextProp = nextProps[propKey];
    var lastProp = lastProps != null ? lastProps[propKey] : undefined;
    if (!nextProps.hasOwnProperty(propKey) || nextProp === lastProp || nextProp == null && lastProp == null) {
      continue;
    }
    if (propKey === STYLE) {
      {
        if (nextProp) {
          // Freeze the next style object so that we can assume it won't be
          // mutated. We have already warned for this in the past.
          Object.freeze(nextProp);
        }
      }
      if (lastProp) {
        // Unset styles on `lastProp` but not on `nextProp`.
        for (styleName in lastProp) {
          if (lastProp.hasOwnProperty(styleName) && (!nextProp || !nextProp.hasOwnProperty(styleName))) {
            if (!styleUpdates) {
              styleUpdates = {};
            }
            styleUpdates[styleName] = '';
          }
        }
        // Update styles that changed since `lastProp`.
        for (styleName in nextProp) {
          if (nextProp.hasOwnProperty(styleName) && lastProp[styleName] !== nextProp[styleName]) {
            if (!styleUpdates) {
              styleUpdates = {};
            }
            styleUpdates[styleName] = nextProp[styleName];
          }
        }
      } else {
        // Relies on `updateStylesByID` not mutating `styleUpdates`.
        if (!styleUpdates) {
          if (!updatePayload) {
            updatePayload = [];
          }
          updatePayload.push(propKey, styleUpdates);
        }
        styleUpdates = nextProp;
      }
    } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
      var nextHtml = nextProp ? nextProp[HTML] : undefined;
      var lastHtml = lastProp ? lastProp[HTML] : undefined;
      if (nextHtml != null) {
        if (lastHtml !== nextHtml) {
          (updatePayload = updatePayload || []).push(propKey, '' + nextHtml);
        }
      } else {
        // TODO: It might be too late to clear this if we have children
        // inserted already.
      }
    } else if (propKey === CHILDREN) {
      if (lastProp !== nextProp && (typeof nextProp === 'string' || typeof nextProp === 'number')) {
        (updatePayload = updatePayload || []).push(propKey, '' + nextProp);
      }
    } else if (propKey === SUPPRESS_CONTENT_EDITABLE_WARNING || propKey === SUPPRESS_HYDRATION_WARNING$1) {
      // Noop
    } else if (registrationNameModules.hasOwnProperty(propKey)) {
      if (nextProp != null) {
        // We eagerly listen to this even though we haven't committed yet.
        if (true && typeof nextProp !== 'function') {
          warnForInvalidEventListener(propKey, nextProp);
        }
        ensureListeningTo(rootContainerElement, propKey);
      }
      if (!updatePayload && lastProp !== nextProp) {
        // This is a special case. If any listener updates we need to ensure
        // that the "current" props pointer gets updated so we need a commit
        // to update this element.
        updatePayload = [];
      }
    } else {
      // For any other property we always add it to the queue and then we
      // filter it out using the whitelist during the commit.
      (updatePayload = updatePayload || []).push(propKey, nextProp);
    }
  }
  if (styleUpdates) {
    (updatePayload = updatePayload || []).push(STYLE, styleUpdates);
  }
  return updatePayload;
}

// Apply the diff.
function updateProperties$1(domElement, updatePayload, tag, lastRawProps, nextRawProps) {
  // Update checked *before* name.
  // In the middle of an update, it is possible to have multiple checked.
  // When a checked radio tries to change name, browser makes another radio's checked false.
  if (tag === 'input' && nextRawProps.type === 'radio' && nextRawProps.name != null) {
    updateChecked(domElement, nextRawProps);
  }

  var wasCustomComponentTag = isCustomComponent(tag, lastRawProps);
  var isCustomComponentTag = isCustomComponent(tag, nextRawProps);
  // Apply the diff.
  updateDOMProperties(domElement, updatePayload, wasCustomComponentTag, isCustomComponentTag);

  // TODO: Ensure that an update gets scheduled if any of the special props
  // changed.
  switch (tag) {
    case 'input':
      // Update the wrapper around inputs *after* updating props. This has to
      // happen after `updateDOMProperties`. Otherwise HTML5 input validations
      // raise warnings and prevent the new value from being assigned.
      updateWrapper(domElement, nextRawProps);
      break;
    case 'textarea':
      updateWrapper$1(domElement, nextRawProps);
      break;
    case 'select':
      // <select> value update needs to occur after <option> children
      // reconciliation
      postUpdateWrapper(domElement, nextRawProps);
      break;
  }
}

function getPossibleStandardName(propName) {
  {
    var lowerCasedName = propName.toLowerCase();
    if (!possibleStandardNames.hasOwnProperty(lowerCasedName)) {
      return null;
    }
    return possibleStandardNames[lowerCasedName] || null;
  }
  return null;
}

function diffHydratedProperties$1(domElement, tag, rawProps, parentNamespace, rootContainerElement) {
  var isCustomComponentTag = void 0;
  var extraAttributeNames = void 0;

  {
    suppressHydrationWarning = rawProps[SUPPRESS_HYDRATION_WARNING$1] === true;
    isCustomComponentTag = isCustomComponent(tag, rawProps);
    validatePropertiesInDevelopment(tag, rawProps);
    if (isCustomComponentTag && !didWarnShadyDOM && domElement.shadyRoot) {
      warning(false, '%s is using shady DOM. Using shady DOM with React can ' + 'cause things to break subtly.', getCurrentFiberOwnerName$2() || 'A component');
      didWarnShadyDOM = true;
    }
  }

  // TODO: Make sure that we check isMounted before firing any of these events.
  switch (tag) {
    case 'iframe':
    case 'object':
      trapBubbledEvent('topLoad', 'load', domElement);
      break;
    case 'video':
    case 'audio':
      // Create listener for each media event
      for (var event in mediaEventTypes) {
        if (mediaEventTypes.hasOwnProperty(event)) {
          trapBubbledEvent(event, mediaEventTypes[event], domElement);
        }
      }
      break;
    case 'source':
      trapBubbledEvent('topError', 'error', domElement);
      break;
    case 'img':
    case 'image':
    case 'link':
      trapBubbledEvent('topError', 'error', domElement);
      trapBubbledEvent('topLoad', 'load', domElement);
      break;
    case 'form':
      trapBubbledEvent('topReset', 'reset', domElement);
      trapBubbledEvent('topSubmit', 'submit', domElement);
      break;
    case 'details':
      trapBubbledEvent('topToggle', 'toggle', domElement);
      break;
    case 'input':
      initWrapperState(domElement, rawProps);
      trapBubbledEvent('topInvalid', 'invalid', domElement);
      // For controlled components we always need to ensure we're listening
      // to onChange. Even if there is no listener.
      ensureListeningTo(rootContainerElement, 'onChange');
      break;
    case 'option':
      validateProps(domElement, rawProps);
      break;
    case 'select':
      initWrapperState$1(domElement, rawProps);
      trapBubbledEvent('topInvalid', 'invalid', domElement);
      // For controlled components we always need to ensure we're listening
      // to onChange. Even if there is no listener.
      ensureListeningTo(rootContainerElement, 'onChange');
      break;
    case 'textarea':
      initWrapperState$2(domElement, rawProps);
      trapBubbledEvent('topInvalid', 'invalid', domElement);
      // For controlled components we always need to ensure we're listening
      // to onChange. Even if there is no listener.
      ensureListeningTo(rootContainerElement, 'onChange');
      break;
  }

  assertValidProps(tag, rawProps, getStack);

  {
    extraAttributeNames = new Set();
    var attributes = domElement.attributes;
    for (var i = 0; i < attributes.length; i++) {
      var name = attributes[i].name.toLowerCase();
      switch (name) {
        // Built-in SSR attribute is whitelisted
        case 'data-reactroot':
          break;
        // Controlled attributes are not validated
        // TODO: Only ignore them on controlled tags.
        case 'value':
          break;
        case 'checked':
          break;
        case 'selected':
          break;
        default:
          // Intentionally use the original name.
          // See discussion in https://github.com/facebook/react/pull/10676.
          extraAttributeNames.add(attributes[i].name);
      }
    }
  }

  var updatePayload = null;
  for (var propKey in rawProps) {
    if (!rawProps.hasOwnProperty(propKey)) {
      continue;
    }
    var nextProp = rawProps[propKey];
    if (propKey === CHILDREN) {
      // For text content children we compare against textContent. This
      // might match additional HTML that is hidden when we read it using
      // textContent. E.g. "foo" will match "f<span>oo</span>" but that still
      // satisfies our requirement. Our requirement is not to produce perfect
      // HTML and attributes. Ideally we should preserve structure but it's
      // ok not to if the visible content is still enough to indicate what
      // even listeners these nodes might be wired up to.
      // TODO: Warn if there is more than a single textNode as a child.
      // TODO: Should we use domElement.firstChild.nodeValue to compare?
      if (typeof nextProp === 'string') {
        if (domElement.textContent !== nextProp) {
          if (true && !suppressHydrationWarning) {
            warnForTextDifference(domElement.textContent, nextProp);
          }
          updatePayload = [CHILDREN, nextProp];
        }
      } else if (typeof nextProp === 'number') {
        if (domElement.textContent !== '' + nextProp) {
          if (true && !suppressHydrationWarning) {
            warnForTextDifference(domElement.textContent, nextProp);
          }
          updatePayload = [CHILDREN, '' + nextProp];
        }
      }
    } else if (registrationNameModules.hasOwnProperty(propKey)) {
      if (nextProp != null) {
        if (true && typeof nextProp !== 'function') {
          warnForInvalidEventListener(propKey, nextProp);
        }
        ensureListeningTo(rootContainerElement, propKey);
      }
    } else if (true &&
    // Convince Flow we've calculated it (it's DEV-only in this method.)
    typeof isCustomComponentTag === 'boolean') {
      // Validate that the properties correspond to their expected values.
      var serverValue = void 0;
      var propertyInfo = getPropertyInfo(propKey);
      if (suppressHydrationWarning) {
        // Don't bother comparing. We're ignoring all these warnings.
      } else if (propKey === SUPPRESS_CONTENT_EDITABLE_WARNING || propKey === SUPPRESS_HYDRATION_WARNING$1 ||
      // Controlled attributes are not validated
      // TODO: Only ignore them on controlled tags.
      propKey === 'value' || propKey === 'checked' || propKey === 'selected') {
        // Noop
      } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
        var rawHtml = nextProp ? nextProp[HTML] || '' : '';
        var serverHTML = domElement.innerHTML;
        var expectedHTML = normalizeHTML(domElement, rawHtml);
        if (expectedHTML !== serverHTML) {
          warnForPropDifference(propKey, serverHTML, expectedHTML);
        }
      } else if (propKey === STYLE) {
        // $FlowFixMe - Should be inferred as not undefined.
        extraAttributeNames['delete'](propKey);
        var expectedStyle = createDangerousStringForStyles(nextProp);
        serverValue = domElement.getAttribute('style');
        if (expectedStyle !== serverValue) {
          warnForPropDifference(propKey, serverValue, expectedStyle);
        }
      } else if (isCustomComponentTag) {
        // $FlowFixMe - Should be inferred as not undefined.
        extraAttributeNames['delete'](propKey.toLowerCase());
        serverValue = getValueForAttribute(domElement, propKey, nextProp);

        if (nextProp !== serverValue) {
          warnForPropDifference(propKey, serverValue, nextProp);
        }
      } else if (!shouldIgnoreAttribute(propKey, propertyInfo, isCustomComponentTag) && !shouldRemoveAttribute(propKey, nextProp, propertyInfo, isCustomComponentTag)) {
        var isMismatchDueToBadCasing = false;
        if (propertyInfo !== null) {
          // $FlowFixMe - Should be inferred as not undefined.
          extraAttributeNames['delete'](propertyInfo.attributeName);
          serverValue = getValueForProperty(domElement, propKey, nextProp, propertyInfo);
        } else {
          var ownNamespace = parentNamespace;
          if (ownNamespace === HTML_NAMESPACE) {
            ownNamespace = getIntrinsicNamespace(tag);
          }
          if (ownNamespace === HTML_NAMESPACE) {
            // $FlowFixMe - Should be inferred as not undefined.
            extraAttributeNames['delete'](propKey.toLowerCase());
          } else {
            var standardName = getPossibleStandardName(propKey);
            if (standardName !== null && standardName !== propKey) {
              // If an SVG prop is supplied with bad casing, it will
              // be successfully parsed from HTML, but will produce a mismatch
              // (and would be incorrectly rendered on the client).
              // However, we already warn about bad casing elsewhere.
              // So we'll skip the misleading extra mismatch warning in this case.
              isMismatchDueToBadCasing = true;
              // $FlowFixMe - Should be inferred as not undefined.
              extraAttributeNames['delete'](standardName);
            }
            // $FlowFixMe - Should be inferred as not undefined.
            extraAttributeNames['delete'](propKey);
          }
          serverValue = getValueForAttribute(domElement, propKey, nextProp);
        }

        if (nextProp !== serverValue && !isMismatchDueToBadCasing) {
          warnForPropDifference(propKey, serverValue, nextProp);
        }
      }
    }
  }

  {
    // $FlowFixMe - Should be inferred as not undefined.
    if (extraAttributeNames.size > 0 && !suppressHydrationWarning) {
      // $FlowFixMe - Should be inferred as not undefined.
      warnForExtraAttributes(extraAttributeNames);
    }
  }

  switch (tag) {
    case 'input':
      // TODO: Make sure we check if this is still unmounted or do any clean
      // up necessary since we never stop tracking anymore.
      track(domElement);
      postMountWrapper(domElement, rawProps);
      break;
    case 'textarea':
      // TODO: Make sure we check if this is still unmounted or do any clean
      // up necessary since we never stop tracking anymore.
      track(domElement);
      postMountWrapper$3(domElement, rawProps);
      break;
    case 'select':
    case 'option':
      // For input and textarea we current always set the value property at
      // post mount to force it to diverge from attributes. However, for
      // option and select we don't quite do the same thing and select
      // is not resilient to the DOM state changing so we don't do that here.
      // TODO: Consider not doing this for input and textarea.
      break;
    default:
      if (typeof rawProps.onClick === 'function') {
        // TODO: This cast may not be sound for SVG, MathML or custom elements.
        trapClickOnNonInteractiveElement(domElement);
      }
      break;
  }

  return updatePayload;
}

function diffHydratedText$1(textNode, text) {
  var isDifferent = textNode.nodeValue !== text;
  return isDifferent;
}

function warnForUnmatchedText$1(textNode, text) {
  {
    warnForTextDifference(textNode.nodeValue, text);
  }
}

function warnForDeletedHydratableElement$1(parentNode, child) {
  {
    if (didWarnInvalidHydration) {
      return;
    }
    didWarnInvalidHydration = true;
    warning(false, 'Did not expect server HTML to contain a <%s> in <%s>.', child.nodeName.toLowerCase(), parentNode.nodeName.toLowerCase());
  }
}

function warnForDeletedHydratableText$1(parentNode, child) {
  {
    if (didWarnInvalidHydration) {
      return;
    }
    didWarnInvalidHydration = true;
    warning(false, 'Did not expect server HTML to contain the text node "%s" in <%s>.', child.nodeValue, parentNode.nodeName.toLowerCase());
  }
}

function warnForInsertedHydratedElement$1(parentNode, tag, props) {
  {
    if (didWarnInvalidHydration) {
      return;
    }
    didWarnInvalidHydration = true;
    warning(false, 'Expected server HTML to contain a matching <%s> in <%s>.', tag, parentNode.nodeName.toLowerCase());
  }
}

function warnForInsertedHydratedText$1(parentNode, text) {
  {
    if (text === '') {
      // We expect to insert empty text nodes since they're not represented in
      // the HTML.
      // TODO: Remove this special case if we can just avoid inserting empty
      // text nodes.
      return;
    }
    if (didWarnInvalidHydration) {
      return;
    }
    didWarnInvalidHydration = true;
    warning(false, 'Expected server HTML to contain a matching text node for "%s" in <%s>.', text, parentNode.nodeName.toLowerCase());
  }
}

function restoreControlledState$1(domElement, tag, props) {
  switch (tag) {
    case 'input':
      restoreControlledState(domElement, props);
      return;
    case 'textarea':
      restoreControlledState$3(domElement, props);
      return;
    case 'select':
      restoreControlledState$2(domElement, props);
      return;
  }
}

var ReactDOMFiberComponent = Object.freeze({
	createElement: createElement$1,
	createTextNode: createTextNode$1,
	setInitialProperties: setInitialProperties$1,
	diffProperties: diffProperties$1,
	updateProperties: updateProperties$1,
	diffHydratedProperties: diffHydratedProperties$1,
	diffHydratedText: diffHydratedText$1,
	warnForUnmatchedText: warnForUnmatchedText$1,
	warnForDeletedHydratableElement: warnForDeletedHydratableElement$1,
	warnForDeletedHydratableText: warnForDeletedHydratableText$1,
	warnForInsertedHydratedElement: warnForInsertedHydratedElement$1,
	warnForInsertedHydratedText: warnForInsertedHydratedText$1,
	restoreControlledState: restoreControlledState$1
});

// TODO: direct imports like some-package/src/* are bad. Fix me.
var getCurrentFiberStackAddendum$6 = ReactDebugCurrentFiber.getCurrentFiberStackAddendum;

var validateDOMNesting = emptyFunction;

{
  // This validation code was written based on the HTML5 parsing spec:
  // https://html.spec.whatwg.org/multipage/syntax.html#has-an-element-in-scope
  //
  // Note: this does not catch all invalid nesting, nor does it try to (as it's
  // not clear what practical benefit doing so provides); instead, we warn only
  // for cases where the parser will give a parse tree differing from what React
  // intended. For example, <b><div></div></b> is invalid but we don't warn
  // because it still parses correctly; we do warn for other cases like nested
  // <p> tags where the beginning of the second element implicitly closes the
  // first, causing a confusing mess.

  // https://html.spec.whatwg.org/multipage/syntax.html#special
  var specialTags = ['address', 'applet', 'area', 'article', 'aside', 'base', 'basefont', 'bgsound', 'blockquote', 'body', 'br', 'button', 'caption', 'center', 'col', 'colgroup', 'dd', 'details', 'dir', 'div', 'dl', 'dt', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'frame', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'iframe', 'img', 'input', 'isindex', 'li', 'link', 'listing', 'main', 'marquee', 'menu', 'menuitem', 'meta', 'nav', 'noembed', 'noframes', 'noscript', 'object', 'ol', 'p', 'param', 'plaintext', 'pre', 'script', 'section', 'select', 'source', 'style', 'summary', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'title', 'tr', 'track', 'ul', 'wbr', 'xmp'];

  // https://html.spec.whatwg.org/multipage/syntax.html#has-an-element-in-scope
  var inScopeTags = ['applet', 'caption', 'html', 'table', 'td', 'th', 'marquee', 'object', 'template',

  // https://html.spec.whatwg.org/multipage/syntax.html#html-integration-point
  // TODO: Distinguish by namespace here -- for <title>, including it here
  // errs on the side of fewer warnings
  'foreignObject', 'desc', 'title'];

  // https://html.spec.whatwg.org/multipage/syntax.html#has-an-element-in-button-scope
  var buttonScopeTags = inScopeTags.concat(['button']);

  // https://html.spec.whatwg.org/multipage/syntax.html#generate-implied-end-tags
  var impliedEndTags = ['dd', 'dt', 'li', 'option', 'optgroup', 'p', 'rp', 'rt'];

  var emptyAncestorInfo = {
    current: null,

    formTag: null,
    aTagInScope: null,
    buttonTagInScope: null,
    nobrTagInScope: null,
    pTagInButtonScope: null,

    listItemTagAutoclosing: null,
    dlItemTagAutoclosing: null
  };

  var updatedAncestorInfo$1 = function (oldInfo, tag, instance) {
    var ancestorInfo = _assign({}, oldInfo || emptyAncestorInfo);
    var info = { tag: tag, instance: instance };

    if (inScopeTags.indexOf(tag) !== -1) {
      ancestorInfo.aTagInScope = null;
      ancestorInfo.buttonTagInScope = null;
      ancestorInfo.nobrTagInScope = null;
    }
    if (buttonScopeTags.indexOf(tag) !== -1) {
      ancestorInfo.pTagInButtonScope = null;
    }

    // See rules for 'li', 'dd', 'dt' start tags in
    // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inbody
    if (specialTags.indexOf(tag) !== -1 && tag !== 'address' && tag !== 'div' && tag !== 'p') {
      ancestorInfo.listItemTagAutoclosing = null;
      ancestorInfo.dlItemTagAutoclosing = null;
    }

    ancestorInfo.current = info;

    if (tag === 'form') {
      ancestorInfo.formTag = info;
    }
    if (tag === 'a') {
      ancestorInfo.aTagInScope = info;
    }
    if (tag === 'button') {
      ancestorInfo.buttonTagInScope = info;
    }
    if (tag === 'nobr') {
      ancestorInfo.nobrTagInScope = info;
    }
    if (tag === 'p') {
      ancestorInfo.pTagInButtonScope = info;
    }
    if (tag === 'li') {
      ancestorInfo.listItemTagAutoclosing = info;
    }
    if (tag === 'dd' || tag === 'dt') {
      ancestorInfo.dlItemTagAutoclosing = info;
    }

    return ancestorInfo;
  };

  /**
   * Returns whether
   */
  var isTagValidWithParent = function (tag, parentTag) {
    // First, let's check if we're in an unusual parsing mode...
    switch (parentTag) {
      // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inselect
      case 'select':
        return tag === 'option' || tag === 'optgroup' || tag === '#text';
      case 'optgroup':
        return tag === 'option' || tag === '#text';
      // Strictly speaking, seeing an <option> doesn't mean we're in a <select>
      // but
      case 'option':
        return tag === '#text';
      // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intd
      // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-incaption
      // No special behavior since these rules fall back to "in body" mode for
      // all except special table nodes which cause bad parsing behavior anyway.

      // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intr
      case 'tr':
        return tag === 'th' || tag === 'td' || tag === 'style' || tag === 'script' || tag === 'template';
      // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intbody
      case 'tbody':
      case 'thead':
      case 'tfoot':
        return tag === 'tr' || tag === 'style' || tag === 'script' || tag === 'template';
      // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-incolgroup
      case 'colgroup':
        return tag === 'col' || tag === 'template';
      // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intable
      case 'table':
        return tag === 'caption' || tag === 'colgroup' || tag === 'tbody' || tag === 'tfoot' || tag === 'thead' || tag === 'style' || tag === 'script' || tag === 'template';
      // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inhead
      case 'head':
        return tag === 'base' || tag === 'basefont' || tag === 'bgsound' || tag === 'link' || tag === 'meta' || tag === 'title' || tag === 'noscript' || tag === 'noframes' || tag === 'style' || tag === 'script' || tag === 'template';
      // https://html.spec.whatwg.org/multipage/semantics.html#the-html-element
      case 'html':
        return tag === 'head' || tag === 'body';
      case '#document':
        return tag === 'html';
    }

    // Probably in the "in body" parsing mode, so we outlaw only tag combos
    // where the parsing rules cause implicit opens or closes to be added.
    // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inbody
    switch (tag) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return parentTag !== 'h1' && parentTag !== 'h2' && parentTag !== 'h3' && parentTag !== 'h4' && parentTag !== 'h5' && parentTag !== 'h6';

      case 'rp':
      case 'rt':
        return impliedEndTags.indexOf(parentTag) === -1;

      case 'body':
      case 'caption':
      case 'col':
      case 'colgroup':
      case 'frame':
      case 'head':
      case 'html':
      case 'tbody':
      case 'td':
      case 'tfoot':
      case 'th':
      case 'thead':
      case 'tr':
        // These tags are only valid with a few parents that have special child
        // parsing rules -- if we're down here, then none of those matched and
        // so we allow it only if we don't know what the parent is, as all other
        // cases are invalid.
        return parentTag == null;
    }

    return true;
  };

  /**
   * Returns whether
   */
  var findInvalidAncestorForTag = function (tag, ancestorInfo) {
    switch (tag) {
      case 'address':
      case 'article':
      case 'aside':
      case 'blockquote':
      case 'center':
      case 'details':
      case 'dialog':
      case 'dir':
      case 'div':
      case 'dl':
      case 'fieldset':
      case 'figcaption':
      case 'figure':
      case 'footer':
      case 'header':
      case 'hgroup':
      case 'main':
      case 'menu':
      case 'nav':
      case 'ol':
      case 'p':
      case 'section':
      case 'summary':
      case 'ul':
      case 'pre':
      case 'listing':
      case 'table':
      case 'hr':
      case 'xmp':
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return ancestorInfo.pTagInButtonScope;

      case 'form':
        return ancestorInfo.formTag || ancestorInfo.pTagInButtonScope;

      case 'li':
        return ancestorInfo.listItemTagAutoclosing;

      case 'dd':
      case 'dt':
        return ancestorInfo.dlItemTagAutoclosing;

      case 'button':
        return ancestorInfo.buttonTagInScope;

      case 'a':
        // Spec says something about storing a list of markers, but it sounds
        // equivalent to this check.
        return ancestorInfo.aTagInScope;

      case 'nobr':
        return ancestorInfo.nobrTagInScope;
    }

    return null;
  };

  var didWarn = {};

  validateDOMNesting = function (childTag, childText, ancestorInfo) {
    ancestorInfo = ancestorInfo || emptyAncestorInfo;
    var parentInfo = ancestorInfo.current;
    var parentTag = parentInfo && parentInfo.tag;

    if (childText != null) {
      !(childTag == null) ? warning(false, 'validateDOMNesting: when childText is passed, childTag should be null') : void 0;
      childTag = '#text';
    }

    var invalidParent = isTagValidWithParent(childTag, parentTag) ? null : parentInfo;
    var invalidAncestor = invalidParent ? null : findInvalidAncestorForTag(childTag, ancestorInfo);
    var invalidParentOrAncestor = invalidParent || invalidAncestor;
    if (!invalidParentOrAncestor) {
      return;
    }

    var ancestorTag = invalidParentOrAncestor.tag;
    var addendum = getCurrentFiberStackAddendum$6();

    var warnKey = !!invalidParent + '|' + childTag + '|' + ancestorTag + '|' + addendum;
    if (didWarn[warnKey]) {
      return;
    }
    didWarn[warnKey] = true;

    var tagDisplayName = childTag;
    var whitespaceInfo = '';
    if (childTag === '#text') {
      if (/\S/.test(childText)) {
        tagDisplayName = 'Text nodes';
      } else {
        tagDisplayName = 'Whitespace text nodes';
        whitespaceInfo = " Make sure you don't have any extra whitespace between tags on " + 'each line of your source code.';
      }
    } else {
      tagDisplayName = '<' + childTag + '>';
    }

    if (invalidParent) {
      var info = '';
      if (ancestorTag === 'table' && childTag === 'tr') {
        info += ' Add a <tbody> to your code to match the DOM tree generated by ' + 'the browser.';
      }
      warning(false, 'validateDOMNesting(...): %s cannot appear as a child of <%s>.%s%s%s', tagDisplayName, ancestorTag, whitespaceInfo, info, addendum);
    } else {
      warning(false, 'validateDOMNesting(...): %s cannot appear as a descendant of ' + '<%s>.%s', tagDisplayName, ancestorTag, addendum);
    }
  };

  // TODO: turn this into a named export
  validateDOMNesting.updatedAncestorInfo = updatedAncestorInfo$1;
}

var validateDOMNesting$1 = validateDOMNesting;

// TODO: This type is shared between the reconciler and ReactDOM, but will
// eventually be lifted out to the renderer.

// TODO: direct imports like some-package/src/* are bad. Fix me.
var createElement = createElement$1;
var createTextNode = createTextNode$1;
var setInitialProperties = setInitialProperties$1;
var diffProperties = diffProperties$1;
var updateProperties = updateProperties$1;
var diffHydratedProperties = diffHydratedProperties$1;
var diffHydratedText = diffHydratedText$1;
var warnForUnmatchedText = warnForUnmatchedText$1;
var warnForDeletedHydratableElement = warnForDeletedHydratableElement$1;
var warnForDeletedHydratableText = warnForDeletedHydratableText$1;
var warnForInsertedHydratedElement = warnForInsertedHydratedElement$1;
var warnForInsertedHydratedText = warnForInsertedHydratedText$1;
var updatedAncestorInfo = validateDOMNesting$1.updatedAncestorInfo;
var precacheFiberNode = precacheFiberNode$1;
var updateFiberProps = updateFiberProps$1;


var SUPPRESS_HYDRATION_WARNING = void 0;
var topLevelUpdateWarnings = void 0;
var warnOnInvalidCallback = void 0;
var didWarnAboutUnstableCreatePortal = false;

{
  SUPPRESS_HYDRATION_WARNING = 'suppressHydrationWarning';
  if (typeof Map !== 'function' || Map.prototype == null || typeof Map.prototype.forEach !== 'function' || typeof Set !== 'function' || Set.prototype == null || typeof Set.prototype.clear !== 'function' || typeof Set.prototype.forEach !== 'function') {
    warning(false, 'React depends on Map and Set built-in types. Make sure that you load a ' + 'polyfill in older browsers. https://fb.me/react-polyfills');
  }

  topLevelUpdateWarnings = function (container) {
    if (container._reactRootContainer && container.nodeType !== COMMENT_NODE) {
      var hostInstance = DOMRenderer.findHostInstanceWithNoPortals(container._reactRootContainer._internalRoot.current);
      if (hostInstance) {
        !(hostInstance.parentNode === container) ? warning(false, 'render(...): It looks like the React-rendered content of this ' + 'container was removed without using React. This is not ' + 'supported and will cause errors. Instead, call ' + 'ReactDOM.unmountComponentAtNode to empty a container.') : void 0;
      }
    }

    var isRootRenderedBySomeReact = !!container._reactRootContainer;
    var rootEl = getReactRootElementInContainer(container);
    var hasNonRootReactChild = !!(rootEl && getInstanceFromNode$1(rootEl));

    !(!hasNonRootReactChild || isRootRenderedBySomeReact) ? warning(false, 'render(...): Replacing React-rendered children with a new root ' + 'component. If you intended to update the children of this node, ' + 'you should instead have the existing children update their state ' + 'and render the new components instead of calling ReactDOM.render.') : void 0;

    !(container.nodeType !== ELEMENT_NODE || !container.tagName || container.tagName.toUpperCase() !== 'BODY') ? warning(false, 'render(): Rendering components directly into document.body is ' + 'discouraged, since its children are often manipulated by third-party ' + 'scripts and browser extensions. This may lead to subtle ' + 'reconciliation issues. Try rendering into a container element created ' + 'for your app.') : void 0;
  };

  warnOnInvalidCallback = function (callback, callerName) {
    !(callback === null || typeof callback === 'function') ? warning(false, '%s(...): Expected the last optional `callback` argument to be a ' + 'function. Instead received: %s.', callerName, callback) : void 0;
  };
}

injection$2.injectFiberControlledHostComponent(ReactDOMFiberComponent);

var eventsEnabled = null;
var selectionInformation = null;

function ReactBatch(root) {
  var expirationTime = DOMRenderer.computeUniqueAsyncExpiration();
  this._expirationTime = expirationTime;
  this._root = root;
  this._next = null;
  this._callbacks = null;
  this._didComplete = false;
  this._hasChildren = false;
  this._children = null;
  this._defer = true;
}
ReactBatch.prototype.render = function (children) {
  !this._defer ? invariant(false, 'batch.render: Cannot render a batch that already committed.') : void 0;
  this._hasChildren = true;
  this._children = children;
  var internalRoot = this._root._internalRoot;
  var expirationTime = this._expirationTime;
  var work = new ReactWork();
  DOMRenderer.updateContainerAtExpirationTime(children, internalRoot, null, expirationTime, work._onCommit);
  return work;
};
ReactBatch.prototype.then = function (onComplete) {
  if (this._didComplete) {
    onComplete();
    return;
  }
  var callbacks = this._callbacks;
  if (callbacks === null) {
    callbacks = this._callbacks = [];
  }
  callbacks.push(onComplete);
};
ReactBatch.prototype.commit = function () {
  var internalRoot = this._root._internalRoot;
  var firstBatch = internalRoot.firstBatch;
  !(this._defer && firstBatch !== null) ? invariant(false, 'batch.commit: Cannot commit a batch multiple times.') : void 0;

  if (!this._hasChildren) {
    // This batch is empty. Return.
    this._next = null;
    this._defer = false;
    return;
  }

  var expirationTime = this._expirationTime;

  // Ensure this is the first batch in the list.
  if (firstBatch !== this) {
    // This batch is not the earliest batch. We need to move it to the front.
    // Update its expiration time to be the expiration time of the earliest
    // batch, so that we can flush it without flushing the other batches.
    if (this._hasChildren) {
      expirationTime = this._expirationTime = firstBatch._expirationTime;
      // Rendering this batch again ensures its children will be the final state
      // when we flush (updates are processed in insertion order: last
      // update wins).
      // TODO: This forces a restart. Should we print a warning?
      this.render(this._children);
    }

    // Remove the batch from the list.
    var previous = null;
    var batch = firstBatch;
    while (batch !== this) {
      previous = batch;
      batch = batch._next;
    }
    !(previous !== null) ? invariant(false, 'batch.commit: Cannot commit a batch multiple times.') : void 0;
    previous._next = batch._next;

    // Add it to the front.
    this._next = firstBatch;
    firstBatch = internalRoot.firstBatch = this;
  }

  // Synchronously flush all the work up to this batch's expiration time.
  this._defer = false;
  DOMRenderer.flushRoot(internalRoot, expirationTime);

  // Pop the batch from the list.
  var next = this._next;
  this._next = null;
  firstBatch = internalRoot.firstBatch = next;

  // Append the next earliest batch's children to the update queue.
  if (firstBatch !== null && firstBatch._hasChildren) {
    firstBatch.render(firstBatch._children);
  }
};
ReactBatch.prototype._onComplete = function () {
  if (this._didComplete) {
    return;
  }
  this._didComplete = true;
  var callbacks = this._callbacks;
  if (callbacks === null) {
    return;
  }
  // TODO: Error handling.
  for (var i = 0; i < callbacks.length; i++) {
    var _callback = callbacks[i];
    _callback();
  }
};

function ReactWork() {
  this._callbacks = null;
  this._didCommit = false;
  // TODO: Avoid need to bind by replacing callbacks in the update queue with
  // list of Work objects.
  this._onCommit = this._onCommit.bind(this);
}
ReactWork.prototype.then = function (onCommit) {
  if (this._didCommit) {
    onCommit();
    return;
  }
  var callbacks = this._callbacks;
  if (callbacks === null) {
    callbacks = this._callbacks = [];
  }
  callbacks.push(onCommit);
};
ReactWork.prototype._onCommit = function () {
  if (this._didCommit) {
    return;
  }
  this._didCommit = true;
  var callbacks = this._callbacks;
  if (callbacks === null) {
    return;
  }
  // TODO: Error handling.
  for (var i = 0; i < callbacks.length; i++) {
    var _callback2 = callbacks[i];
    !(typeof _callback2 === 'function') ? invariant(false, 'Invalid argument passed as callback. Expected a function. Instead received: %s', _callback2) : void 0;
    _callback2();
  }
};

function ReactRoot(container, isAsync, hydrate) {
  var root = DOMRenderer.createContainer(container, isAsync, hydrate);
  this._internalRoot = root;
}
ReactRoot.prototype.render = function (children, callback) {
  var root = this._internalRoot;
  var work = new ReactWork();
  callback = callback === undefined ? null : callback;
  {
    warnOnInvalidCallback(callback, 'render');
  }
  if (callback !== null) {
    work.then(callback);
  }
  DOMRenderer.updateContainer(children, root, null, work._onCommit);
  return work;
};
ReactRoot.prototype.unmount = function (callback) {
  var root = this._internalRoot;
  var work = new ReactWork();
  callback = callback === undefined ? null : callback;
  {
    warnOnInvalidCallback(callback, 'render');
  }
  if (callback !== null) {
    work.then(callback);
  }
  DOMRenderer.updateContainer(null, root, null, work._onCommit);
  return work;
};
ReactRoot.prototype.legacy_renderSubtreeIntoContainer = function (parentComponent, children, callback) {
  var root = this._internalRoot;
  var work = new ReactWork();
  callback = callback === undefined ? null : callback;
  {
    warnOnInvalidCallback(callback, 'render');
  }
  if (callback !== null) {
    work.then(callback);
  }
  DOMRenderer.updateContainer(children, root, parentComponent, work._onCommit);
  return work;
};
ReactRoot.prototype.createBatch = function () {
  var batch = new ReactBatch(this);
  var expirationTime = batch._expirationTime;

  var internalRoot = this._internalRoot;
  var firstBatch = internalRoot.firstBatch;
  if (firstBatch === null) {
    internalRoot.firstBatch = batch;
    batch._next = null;
  } else {
    // Insert sorted by expiration time then insertion order
    var insertAfter = null;
    var insertBefore = firstBatch;
    while (insertBefore !== null && insertBefore._expirationTime <= expirationTime) {
      insertAfter = insertBefore;
      insertBefore = insertBefore._next;
    }
    batch._next = insertBefore;
    if (insertAfter !== null) {
      insertAfter._next = batch;
    }
  }

  return batch;
};

/**
 * True if the supplied DOM node is a valid node element.
 *
 * @param {?DOMElement} node The candidate DOM node.
 * @return {boolean} True if the DOM is a valid DOM node.
 * @internal
 */
function isValidContainer(node) {
  return !!(node && (node.nodeType === ELEMENT_NODE || node.nodeType === DOCUMENT_NODE || node.nodeType === DOCUMENT_FRAGMENT_NODE || node.nodeType === COMMENT_NODE && node.nodeValue === ' react-mount-point-unstable '));
}

function getReactRootElementInContainer(container) {
  if (!container) {
    return null;
  }

  if (container.nodeType === DOCUMENT_NODE) {
    return container.documentElement;
  } else {
    return container.firstChild;
  }
}

function shouldHydrateDueToLegacyHeuristic(container) {
  var rootElement = getReactRootElementInContainer(container);
  return !!(rootElement && rootElement.nodeType === ELEMENT_NODE && rootElement.hasAttribute(ROOT_ATTRIBUTE_NAME));
}

function shouldAutoFocusHostComponent(type, props) {
  switch (type) {
    case 'button':
    case 'input':
    case 'select':
    case 'textarea':
      return !!props.autoFocus;
  }
  return false;
}

var DOMRenderer = reactReconciler({
  getRootHostContext: function (rootContainerInstance) {
    var type = void 0;
    var namespace = void 0;
    var nodeType = rootContainerInstance.nodeType;
    switch (nodeType) {
      case DOCUMENT_NODE:
      case DOCUMENT_FRAGMENT_NODE:
        {
          type = nodeType === DOCUMENT_NODE ? '#document' : '#fragment';
          var root = rootContainerInstance.documentElement;
          namespace = root ? root.namespaceURI : getChildNamespace(null, '');
          break;
        }
      default:
        {
          var container = nodeType === COMMENT_NODE ? rootContainerInstance.parentNode : rootContainerInstance;
          var ownNamespace = container.namespaceURI || null;
          type = container.tagName;
          namespace = getChildNamespace(ownNamespace, type);
          break;
        }
    }
    {
      var validatedTag = type.toLowerCase();
      var _ancestorInfo = updatedAncestorInfo(null, validatedTag, null);
      return { namespace: namespace, ancestorInfo: _ancestorInfo };
    }
    return namespace;
  },
  getChildHostContext: function (parentHostContext, type) {
    {
      var parentHostContextDev = parentHostContext;
      var _namespace = getChildNamespace(parentHostContextDev.namespace, type);
      var _ancestorInfo2 = updatedAncestorInfo(parentHostContextDev.ancestorInfo, type, null);
      return { namespace: _namespace, ancestorInfo: _ancestorInfo2 };
    }
    var parentNamespace = parentHostContext;
    return getChildNamespace(parentNamespace, type);
  },
  getPublicInstance: function (instance) {
    return instance;
  },
  prepareForCommit: function () {
    eventsEnabled = isEnabled();
    selectionInformation = getSelectionInformation();
    setEnabled(false);
  },
  resetAfterCommit: function () {
    restoreSelection(selectionInformation);
    selectionInformation = null;
    setEnabled(eventsEnabled);
    eventsEnabled = null;
  },
  createInstance: function (type, props, rootContainerInstance, hostContext, internalInstanceHandle) {
    var parentNamespace = void 0;
    {
      // TODO: take namespace into account when validating.
      var hostContextDev = hostContext;
      validateDOMNesting$1(type, null, hostContextDev.ancestorInfo);
      if (typeof props.children === 'string' || typeof props.children === 'number') {
        var string = '' + props.children;
        var ownAncestorInfo = updatedAncestorInfo(hostContextDev.ancestorInfo, type, null);
        validateDOMNesting$1(null, string, ownAncestorInfo);
      }
      parentNamespace = hostContextDev.namespace;
    }
    var domElement = createElement(type, props, rootContainerInstance, parentNamespace);
    precacheFiberNode(internalInstanceHandle, domElement);
    updateFiberProps(domElement, props);
    return domElement;
  },
  appendInitialChild: function (parentInstance, child) {
    parentInstance.appendChild(child);
  },
  finalizeInitialChildren: function (domElement, type, props, rootContainerInstance) {
    setInitialProperties(domElement, type, props, rootContainerInstance);
    return shouldAutoFocusHostComponent(type, props);
  },
  prepareUpdate: function (domElement, type, oldProps, newProps, rootContainerInstance, hostContext) {
    {
      var hostContextDev = hostContext;
      if (typeof newProps.children !== typeof oldProps.children && (typeof newProps.children === 'string' || typeof newProps.children === 'number')) {
        var string = '' + newProps.children;
        var ownAncestorInfo = updatedAncestorInfo(hostContextDev.ancestorInfo, type, null);
        validateDOMNesting$1(null, string, ownAncestorInfo);
      }
    }
    return diffProperties(domElement, type, oldProps, newProps, rootContainerInstance);
  },
  shouldSetTextContent: function (type, props) {
    return type === 'textarea' || typeof props.children === 'string' || typeof props.children === 'number' || typeof props.dangerouslySetInnerHTML === 'object' && props.dangerouslySetInnerHTML !== null && typeof props.dangerouslySetInnerHTML.__html === 'string';
  },
  shouldDeprioritizeSubtree: function (type, props) {
    return !!props.hidden;
  },
  createTextInstance: function (text, rootContainerInstance, hostContext, internalInstanceHandle) {
    {
      var hostContextDev = hostContext;
      validateDOMNesting$1(null, text, hostContextDev.ancestorInfo);
    }
    var textNode = createTextNode(text, rootContainerInstance);
    precacheFiberNode(internalInstanceHandle, textNode);
    return textNode;
  },


  now: now,

  mutation: {
    commitMount: function (domElement, type, newProps, internalInstanceHandle) {
      // Despite the naming that might imply otherwise, this method only
      // fires if there is an `Update` effect scheduled during mounting.
      // This happens if `finalizeInitialChildren` returns `true` (which it
      // does to implement the `autoFocus` attribute on the client). But
      // there are also other cases when this might happen (such as patching
      // up text content during hydration mismatch). So we'll check this again.
      if (shouldAutoFocusHostComponent(type, newProps)) {
        domElement.focus();
      }
    },
    commitUpdate: function (domElement, updatePayload, type, oldProps, newProps, internalInstanceHandle) {
      // Update the props handle so that we know which props are the ones with
      // with current event handlers.
      updateFiberProps(domElement, newProps);
      // Apply the diff to the DOM node.
      updateProperties(domElement, updatePayload, type, oldProps, newProps);
    },
    resetTextContent: function (domElement) {
      setTextContent(domElement, '');
    },
    commitTextUpdate: function (textInstance, oldText, newText) {
      textInstance.nodeValue = newText;
    },
    appendChild: function (parentInstance, child) {
      parentInstance.appendChild(child);
    },
    appendChildToContainer: function (container, child) {
      if (container.nodeType === COMMENT_NODE) {
        container.parentNode.insertBefore(child, container);
      } else {
        container.appendChild(child);
      }
    },
    insertBefore: function (parentInstance, child, beforeChild) {
      parentInstance.insertBefore(child, beforeChild);
    },
    insertInContainerBefore: function (container, child, beforeChild) {
      if (container.nodeType === COMMENT_NODE) {
        container.parentNode.insertBefore(child, beforeChild);
      } else {
        container.insertBefore(child, beforeChild);
      }
    },
    removeChild: function (parentInstance, child) {
      parentInstance.removeChild(child);
    },
    removeChildFromContainer: function (container, child) {
      if (container.nodeType === COMMENT_NODE) {
        container.parentNode.removeChild(child);
      } else {
        container.removeChild(child);
      }
    }
  },

  hydration: {
    canHydrateInstance: function (instance, type, props) {
      if (instance.nodeType !== ELEMENT_NODE || type.toLowerCase() !== instance.nodeName.toLowerCase()) {
        return null;
      }
      // This has now been refined to an element node.
      return instance;
    },
    canHydrateTextInstance: function (instance, text) {
      if (text === '' || instance.nodeType !== TEXT_NODE) {
        // Empty strings are not parsed by HTML so there won't be a correct match here.
        return null;
      }
      // This has now been refined to a text node.
      return instance;
    },
    getNextHydratableSibling: function (instance) {
      var node = instance.nextSibling;
      // Skip non-hydratable nodes.
      while (node && node.nodeType !== ELEMENT_NODE && node.nodeType !== TEXT_NODE) {
        node = node.nextSibling;
      }
      return node;
    },
    getFirstHydratableChild: function (parentInstance) {
      var next = parentInstance.firstChild;
      // Skip non-hydratable nodes.
      while (next && next.nodeType !== ELEMENT_NODE && next.nodeType !== TEXT_NODE) {
        next = next.nextSibling;
      }
      return next;
    },
    hydrateInstance: function (instance, type, props, rootContainerInstance, hostContext, internalInstanceHandle) {
      precacheFiberNode(internalInstanceHandle, instance);
      // TODO: Possibly defer this until the commit phase where all the events
      // get attached.
      updateFiberProps(instance, props);
      var parentNamespace = void 0;
      {
        var hostContextDev = hostContext;
        parentNamespace = hostContextDev.namespace;
      }
      return diffHydratedProperties(instance, type, props, parentNamespace, rootContainerInstance);
    },
    hydrateTextInstance: function (textInstance, text, internalInstanceHandle) {
      precacheFiberNode(internalInstanceHandle, textInstance);
      return diffHydratedText(textInstance, text);
    },
    didNotMatchHydratedContainerTextInstance: function (parentContainer, textInstance, text) {
      {
        warnForUnmatchedText(textInstance, text);
      }
    },
    didNotMatchHydratedTextInstance: function (parentType, parentProps, parentInstance, textInstance, text) {
      if (true && parentProps[SUPPRESS_HYDRATION_WARNING] !== true) {
        warnForUnmatchedText(textInstance, text);
      }
    },
    didNotHydrateContainerInstance: function (parentContainer, instance) {
      {
        if (instance.nodeType === 1) {
          warnForDeletedHydratableElement(parentContainer, instance);
        } else {
          warnForDeletedHydratableText(parentContainer, instance);
        }
      }
    },
    didNotHydrateInstance: function (parentType, parentProps, parentInstance, instance) {
      if (true && parentProps[SUPPRESS_HYDRATION_WARNING] !== true) {
        if (instance.nodeType === 1) {
          warnForDeletedHydratableElement(parentInstance, instance);
        } else {
          warnForDeletedHydratableText(parentInstance, instance);
        }
      }
    },
    didNotFindHydratableContainerInstance: function (parentContainer, type, props) {
      {
        warnForInsertedHydratedElement(parentContainer, type, props);
      }
    },
    didNotFindHydratableContainerTextInstance: function (parentContainer, text) {
      {
        warnForInsertedHydratedText(parentContainer, text);
      }
    },
    didNotFindHydratableInstance: function (parentType, parentProps, parentInstance, type, props) {
      if (true && parentProps[SUPPRESS_HYDRATION_WARNING] !== true) {
        warnForInsertedHydratedElement(parentInstance, type, props);
      }
    },
    didNotFindHydratableTextInstance: function (parentType, parentProps, parentInstance, text) {
      if (true && parentProps[SUPPRESS_HYDRATION_WARNING] !== true) {
        warnForInsertedHydratedText(parentInstance, text);
      }
    }
  },

  scheduleDeferredCallback: rIC,
  cancelDeferredCallback: cIC
});

injection$3.injectRenderer(DOMRenderer);

var warnedAboutHydrateAPI = false;

function legacyCreateRootFromDOMContainer(container, forceHydrate) {
  var shouldHydrate = forceHydrate || shouldHydrateDueToLegacyHeuristic(container);
  // First clear any existing content.
  if (!shouldHydrate) {
    var warned = false;
    var rootSibling = void 0;
    while (rootSibling = container.lastChild) {
      {
        if (!warned && rootSibling.nodeType === ELEMENT_NODE && rootSibling.hasAttribute(ROOT_ATTRIBUTE_NAME)) {
          warned = true;
          warning(false, 'render(): Target node has markup rendered by React, but there ' + 'are unrelated nodes as well. This is most commonly caused by ' + 'white-space inserted around server-rendered markup.');
        }
      }
      container.removeChild(rootSibling);
    }
  }
  {
    if (shouldHydrate && !forceHydrate && !warnedAboutHydrateAPI) {
      warnedAboutHydrateAPI = true;
      lowPriorityWarning$1(false, 'render(): Calling ReactDOM.render() to hydrate server-rendered markup ' + 'will stop working in React v17. Replace the ReactDOM.render() call ' + 'with ReactDOM.hydrate() if you want React to attach to the server HTML.');
    }
  }
  // Legacy roots are not async by default.
  var isAsync = false;
  return new ReactRoot(container, isAsync, shouldHydrate);
}

function legacyRenderSubtreeIntoContainer(parentComponent, children, container, forceHydrate, callback) {
  // TODO: Ensure all entry points contain this check
  !isValidContainer(container) ? invariant(false, 'Target container is not a DOM element.') : void 0;

  {
    topLevelUpdateWarnings(container);
  }

  // TODO: Without `any` type, Flow says "Property cannot be accessed on any
  // member of intersection type." Whyyyyyy.
  var root = container._reactRootContainer;
  if (!root) {
    // Initial mount
    root = container._reactRootContainer = legacyCreateRootFromDOMContainer(container, forceHydrate);
    if (typeof callback === 'function') {
      var originalCallback = callback;
      callback = function () {
        var instance = DOMRenderer.getPublicRootInstance(root._internalRoot);
        originalCallback.call(instance);
      };
    }
    // Initial mount should not be batched.
    DOMRenderer.unbatchedUpdates(function () {
      if (parentComponent != null) {
        root.legacy_renderSubtreeIntoContainer(parentComponent, children, callback);
      } else {
        root.render(children, callback);
      }
    });
  } else {
    if (typeof callback === 'function') {
      var _originalCallback = callback;
      callback = function () {
        var instance = DOMRenderer.getPublicRootInstance(root._internalRoot);
        _originalCallback.call(instance);
      };
    }
    // Update
    if (parentComponent != null) {
      root.legacy_renderSubtreeIntoContainer(parentComponent, children, callback);
    } else {
      root.render(children, callback);
    }
  }
  return DOMRenderer.getPublicRootInstance(root._internalRoot);
}

function createPortal(children, container) {
  var key = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  !isValidContainer(container) ? invariant(false, 'Target container is not a DOM element.') : void 0;
  // TODO: pass ReactDOM portal implementation as third argument
  return createPortal$1(children, container, null, key);
}

var ReactDOM = {
  createPortal: createPortal,

  findDOMNode: function (componentOrElement) {
    {
      var owner = ReactCurrentOwner.current;
      if (owner !== null && owner.stateNode !== null) {
        var warnedAboutRefsInRender = owner.stateNode._warnedAboutRefsInRender;
        !warnedAboutRefsInRender ? warning(false, '%s is accessing findDOMNode inside its render(). ' + 'render() should be a pure function of props and state. It should ' + 'never access something that requires stale data from the previous ' + 'render, such as refs. Move this logic to componentDidMount and ' + 'componentDidUpdate instead.', getComponentName(owner) || 'A component') : void 0;
        owner.stateNode._warnedAboutRefsInRender = true;
      }
    }
    if (componentOrElement == null) {
      return null;
    }
    if (componentOrElement.nodeType === ELEMENT_NODE) {
      return componentOrElement;
    }

    return DOMRenderer.findHostInstance(componentOrElement);
  },
  hydrate: function (element, container, callback) {
    // TODO: throw or warn if we couldn't hydrate?
    return legacyRenderSubtreeIntoContainer(null, element, container, true, callback);
  },
  render: function (element, container, callback) {
    return legacyRenderSubtreeIntoContainer(null, element, container, false, callback);
  },
  unstable_renderSubtreeIntoContainer: function (parentComponent, element, containerNode, callback) {
    !(parentComponent != null && has(parentComponent)) ? invariant(false, 'parentComponent must be a valid React Component') : void 0;
    return legacyRenderSubtreeIntoContainer(parentComponent, element, containerNode, false, callback);
  },
  unmountComponentAtNode: function (container) {
    !isValidContainer(container) ? invariant(false, 'unmountComponentAtNode(...): Target container is not a DOM element.') : void 0;

    if (container._reactRootContainer) {
      {
        var rootEl = getReactRootElementInContainer(container);
        var renderedByDifferentReact = rootEl && !getInstanceFromNode$1(rootEl);
        !!renderedByDifferentReact ? warning(false, "unmountComponentAtNode(): The node you're attempting to unmount " + 'was rendered by another copy of React.') : void 0;
      }

      // Unmount should not be batched.
      DOMRenderer.unbatchedUpdates(function () {
        legacyRenderSubtreeIntoContainer(null, null, container, false, function () {
          container._reactRootContainer = null;
        });
      });
      // If you call unmountComponentAtNode twice in quick succession, you'll
      // get `true` twice. That's probably fine?
      return true;
    } else {
      {
        var _rootEl = getReactRootElementInContainer(container);
        var hasNonRootReactChild = !!(_rootEl && getInstanceFromNode$1(_rootEl));

        // Check if the container itself is a React root node.
        var isContainerReactRoot = container.nodeType === 1 && isValidContainer(container.parentNode) && !!container.parentNode._reactRootContainer;

        !!hasNonRootReactChild ? warning(false, "unmountComponentAtNode(): The node you're attempting to unmount " + 'was rendered by React and is not a top-level container. %s', isContainerReactRoot ? 'You may have accidentally passed in a React root node instead ' + 'of its container.' : 'Instead, have the parent component update its state and ' + 'rerender in order to remove this component.') : void 0;
      }

      return false;
    }
  },


  // Temporary alias since we already shipped React 16 RC with it.
  // TODO: remove in React 17.
  unstable_createPortal: function () {
    if (!didWarnAboutUnstableCreatePortal) {
      didWarnAboutUnstableCreatePortal = true;
      lowPriorityWarning$1(false, 'The ReactDOM.unstable_createPortal() alias has been deprecated, ' + 'and will be removed in React 17+. Update your code to use ' + 'ReactDOM.createPortal() instead. It has the exact same API, ' + 'but without the "unstable_" prefix.');
    }
    return createPortal.apply(undefined, arguments);
  },


  unstable_batchedUpdates: DOMRenderer.batchedUpdates,

  unstable_deferredUpdates: DOMRenderer.deferredUpdates,

  flushSync: DOMRenderer.flushSync,

  unstable_flushControlled: DOMRenderer.flushControlled,

  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
    // For TapEventPlugin which is popular in open source
    EventPluginHub: EventPluginHub,
    // Used by test-utils
    EventPluginRegistry: EventPluginRegistry,
    EventPropagators: EventPropagators,
    ReactControlledComponent: ReactControlledComponent,
    ReactDOMComponentTree: ReactDOMComponentTree,
    ReactDOMEventListener: ReactDOMEventListener
  }
};

ReactDOM.unstable_createRoot = function createRoot(container, options) {
  var hydrate = options != null && options.hydrate === true;
  return new ReactRoot(container, true, hydrate);
};

var foundDevTools = DOMRenderer.injectIntoDevTools({
  findFiberByHostInstance: getClosestInstanceFromNode,
  bundleType: 1,
  version: ReactVersion,
  rendererPackageName: 'react-dom'
});

{
  if (!foundDevTools && ExecutionEnvironment.canUseDOM && window.top === window.self) {
    // If we're in Chrome or Firefox, provide a download link if not installed.
    if (navigator.userAgent.indexOf('Chrome') > -1 && navigator.userAgent.indexOf('Edge') === -1 || navigator.userAgent.indexOf('Firefox') > -1) {
      var protocol = window.location.protocol;
      // Don't warn in exotic cases like chrome-extension://.
      if (/^(https?|file):$/.test(protocol)) {
        console.info('%cDownload the React DevTools ' + 'for a better development experience: ' + 'https://fb.me/react-devtools' + (protocol === 'file:' ? '\nYou might need to use a local HTTP server (instead of file://): ' + 'https://fb.me/react-devtools-faq' : ''), 'font-weight:bold');
      }
    }
  }
}



var ReactDOM$2 = Object.freeze({
	default: ReactDOM
});

var ReactDOM$3 = ( ReactDOM$2 && ReactDOM ) || ReactDOM$2;

// TODO: decide on the top-level export form.
// This is hacky but makes it work with both Rollup and Jest.
var reactDom = ReactDOM$3['default'] ? ReactDOM$3['default'] : ReactDOM$3;

module.exports = reactDom;
  })();
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 149 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @typechecks
 */



var hyphenate = __webpack_require__(150);

var msPattern = /^ms-/;

/**
 * Hyphenates a camelcased CSS property name, for example:
 *
 *   > hyphenateStyleName('backgroundColor')
 *   < "background-color"
 *   > hyphenateStyleName('MozTransition')
 *   < "-moz-transition"
 *   > hyphenateStyleName('msTransition')
 *   < "-ms-transition"
 *
 * As Modernizr suggests (http://modernizr.com/docs/#prefixed), an `ms` prefix
 * is converted to `-ms-`.
 *
 * @param {string} string
 * @return {string}
 */
function hyphenateStyleName(string) {
  return hyphenate(string).replace(msPattern, '-ms-');
}

module.exports = hyphenateStyleName;

/***/ }),
/* 150 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @typechecks
 */

var _uppercasePattern = /([A-Z])/g;

/**
 * Hyphenates a camelcased string, for example:
 *
 *   > hyphenate('backgroundColor')
 *   < "background-color"
 *
 * For CSS style names, use `hyphenateStyleName` instead which works properly
 * with all vendor prefixes, including `ms`.
 *
 * @param {string} string
 * @return {string}
 */
function hyphenate(string) {
  return string.replace(_uppercasePattern, '-$1').toLowerCase();
}

module.exports = hyphenate;

/***/ }),
/* 151 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @typechecks
 */



var camelize = __webpack_require__(152);

var msPattern = /^-ms-/;

/**
 * Camelcases a hyphenated CSS property name, for example:
 *
 *   > camelizeStyleName('background-color')
 *   < "backgroundColor"
 *   > camelizeStyleName('-moz-transition')
 *   < "MozTransition"
 *   > camelizeStyleName('-ms-transition')
 *   < "msTransition"
 *
 * As Andi Smith suggests
 * (http://www.andismith.com/blog/2012/02/modernizr-prefixed/), an `-ms` prefix
 * is converted to lowercase `ms`.
 *
 * @param {string} string
 * @return {string}
 */
function camelizeStyleName(string) {
  return camelize(string.replace(msPattern, 'ms-'));
}

module.exports = camelizeStyleName;

/***/ }),
/* 152 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @typechecks
 */

var _hyphenPattern = /-(.)/g;

/**
 * Camelcases a hyphenated string, for example:
 *
 *   > camelize('background-color')
 *   < "backgroundColor"
 *
 * @param {string} string
 * @return {string}
 */
function camelize(string) {
  return string.replace(_hyphenPattern, function (_, character) {
    return character.toUpperCase();
  });
}

module.exports = camelize;

/***/ })
/******/ ]);
//# sourceMappingURL=demo.bundle.js.map