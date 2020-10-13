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
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./dist/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./dist/index.js":
/*!***********************!*\
  !*** ./dist/index.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

module.exports = function (e) {
  var t = {};

  function n(r) {
    if (t[r]) return t[r].exports;
    var o = t[r] = {
      i: r,
      l: !1,
      exports: {}
    };
    return e[r].call(o.exports, o, o.exports, n), o.l = !0, o.exports;
  }

  return n.m = e, n.c = t, n.d = function (e, t, r) {
    n.o(e, t) || Object.defineProperty(e, t, {
      enumerable: !0,
      get: r
    });
  }, n.r = function (e) {
    "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
      value: "Module"
    }), Object.defineProperty(e, "__esModule", {
      value: !0
    });
  }, n.t = function (e, t) {
    if (1 & t && (e = n(e)), 8 & t) return e;
    if (4 & t && "object" == _typeof(e) && e && e.__esModule) return e;
    var r = Object.create(null);
    if (n.r(r), Object.defineProperty(r, "default", {
      enumerable: !0,
      value: e
    }), 2 & t && "string" != typeof e) for (var o in e) {
      n.d(r, o, function (t) {
        return e[t];
      }.bind(null, o));
    }
    return r;
  }, n.n = function (e) {
    var t = e && e.__esModule ? function () {
      return e["default"];
    } : function () {
      return e;
    };
    return n.d(t, "a", t), t;
  }, n.o = function (e, t) {
    return Object.prototype.hasOwnProperty.call(e, t);
  }, n.p = "", n(n.s = 115);
}([function (e, t, n) {
  e.exports = n(113)();
}, function (e, t) {
  e.exports = __webpack_require__(/*! react */ "./node_modules/react/index.js");
}, function (e, t, n) {
  var r = n(26),
      o = "object" == (typeof self === "undefined" ? "undefined" : _typeof(self)) && self && self.Object === Object && self,
      a = r || o || Function("return this")();
  e.exports = a;
}, function (e, t, n) {
  var r = n(54),
      o = n(60);

  e.exports = function (e, t) {
    var n = o(e, t);
    return r(n) ? n : void 0;
  };
}, function (e, t, n) {
  for (var r = self.crypto || self.msCrypto, o = "-_", a = 36; a--;) {
    o += a.toString(36);
  }

  for (a = 36; a-- - 10;) {
    o += a.toString(36).toUpperCase();
  }

  e.exports = function (e) {
    var t = "",
        n = r.getRandomValues(new Uint8Array(e || 21));

    for (a = e || 21; a--;) {
      t += o[63 & n[a]];
    }

    return t;
  };
}, function (e, t) {
  e.exports = function (e) {
    var t = _typeof(e);

    return null != e && ("object" == t || "function" == t);
  };
}, function (e, t) {
  e.exports = function (e) {
    return null != e && "object" == _typeof(e);
  };
}, function (e, t, n) {
  var r = n(44),
      o = n(45),
      a = n(46),
      c = n(47),
      u = n(48);

  function i(e) {
    var t = -1,
        n = null == e ? 0 : e.length;

    for (this.clear(); ++t < n;) {
      var r = e[t];
      this.set(r[0], r[1]);
    }
  }

  i.prototype.clear = r, i.prototype["delete"] = o, i.prototype.get = a, i.prototype.has = c, i.prototype.set = u, e.exports = i;
}, function (e, t, n) {
  var r = n(24);

  e.exports = function (e, t) {
    for (var n = e.length; n--;) {
      if (r(e[n][0], t)) return n;
    }

    return -1;
  };
}, function (e, t, n) {
  var r = n(14),
      o = n(56),
      a = n(57),
      c = r ? r.toStringTag : void 0;

  e.exports = function (e) {
    return null == e ? void 0 === e ? "[object Undefined]" : "[object Null]" : c && c in Object(e) ? o(e) : a(e);
  };
}, function (e, t, n) {
  var r = n(3)(Object, "create");
  e.exports = r;
}, function (e, t, n) {
  var r = n(70);

  e.exports = function (e, t) {
    var n = e.__data__;
    return r(t) ? n["string" == typeof t ? "string" : "hash"] : n.map;
  };
}, function (e, t, n) {
  var r = n(28),
      o = n(29);

  e.exports = function (e, t, n, a) {
    var c = !n;
    n || (n = {});

    for (var u = -1, i = t.length; ++u < i;) {
      var l = t[u],
          s = a ? a(n[l], e[l], l, n, e) : void 0;
      void 0 === s && (s = e[l]), c ? o(n, l, s) : r(n, l, s);
    }

    return n;
  };
}, function (e, t, n) {
  var r = n(3)(n(2), "Map");
  e.exports = r;
}, function (e, t, n) {
  var r = n(2).Symbol;
  e.exports = r;
}, function (e, t, n) {
  var r = n(30),
      o = n(84),
      a = n(34);

  e.exports = function (e) {
    return a(e) ? r(e) : o(e);
  };
}, function (e, t) {
  var n = Array.isArray;
  e.exports = n;
}, function (e, t) {
  e.exports = function (e) {
    return e.webpackPolyfill || (e.deprecate = function () {}, e.paths = [], e.children || (e.children = []), Object.defineProperty(e, "loaded", {
      enumerable: !0,
      get: function get() {
        return e.l;
      }
    }), Object.defineProperty(e, "id", {
      enumerable: !0,
      get: function get() {
        return e.i;
      }
    }), e.webpackPolyfill = 1), e;
  };
}, function (e, t) {
  e.exports = function (e) {
    return function (t) {
      return e(t);
    };
  };
}, function (e, t, n) {
  (function (e) {
    var r = n(26),
        o = t && !t.nodeType && t,
        a = o && "object" == _typeof(e) && e && !e.nodeType && e,
        c = a && a.exports === o && r.process,
        u = function () {
      try {
        var e = a && a.require && a.require("util").types;

        return e || c && c.binding && c.binding("util");
      } catch (e) {}
    }();

    e.exports = u;
  }).call(this, n(17)(e));
}, function (e, t) {
  var n = Object.prototype;

  e.exports = function (e) {
    var t = e && e.constructor;
    return e === ("function" == typeof t && t.prototype || n);
  };
}, function (e, t, n) {
  var r = n(92),
      o = n(36),
      a = Object.prototype.propertyIsEnumerable,
      c = Object.getOwnPropertySymbols,
      u = c ? function (e) {
    return null == e ? [] : (e = Object(e), r(c(e), function (t) {
      return a.call(e, t);
    }));
  } : o;
  e.exports = u;
}, function (e, t, n) {
  var r = n(96),
      o = n(13),
      a = n(97),
      c = n(98),
      u = n(99),
      i = n(9),
      l = n(27),
      s = l(r),
      f = l(o),
      p = l(a),
      b = l(c),
      v = l(u),
      d = i;
  (r && "[object DataView]" != d(new r(new ArrayBuffer(1))) || o && "[object Map]" != d(new o()) || a && "[object Promise]" != d(a.resolve()) || c && "[object Set]" != d(new c()) || u && "[object WeakMap]" != d(new u())) && (d = function d(e) {
    var t = i(e),
        n = "[object Object]" == t ? e.constructor : void 0,
        r = n ? l(n) : "";
    if (r) switch (r) {
      case s:
        return "[object DataView]";

      case f:
        return "[object Map]";

      case p:
        return "[object Promise]";

      case b:
        return "[object Set]";

      case v:
        return "[object WeakMap]";
    }
    return t;
  }), e.exports = d;
}, function (e, t, n) {
  var r = n(102);

  e.exports = function (e) {
    var t = new e.constructor(e.byteLength);
    return new r(t).set(new r(e)), t;
  };
}, function (e, t) {
  e.exports = function (e, t) {
    return e === t || e != e && t != t;
  };
}, function (e, t, n) {
  var r = n(9),
      o = n(5);

  e.exports = function (e) {
    if (!o(e)) return !1;
    var t = r(e);
    return "[object Function]" == t || "[object GeneratorFunction]" == t || "[object AsyncFunction]" == t || "[object Proxy]" == t;
  };
}, function (e, t, n) {
  (function (t) {
    var n = "object" == _typeof(t) && t && t.Object === Object && t;
    e.exports = n;
  }).call(this, n(55));
}, function (e, t) {
  var n = Function.prototype.toString;

  e.exports = function (e) {
    if (null != e) {
      try {
        return n.call(e);
      } catch (e) {}

      try {
        return e + "";
      } catch (e) {}
    }

    return "";
  };
}, function (e, t, n) {
  var r = n(29),
      o = n(24),
      a = Object.prototype.hasOwnProperty;

  e.exports = function (e, t, n) {
    var c = e[t];
    a.call(e, t) && o(c, n) && (void 0 !== n || t in e) || r(e, t, n);
  };
}, function (e, t, n) {
  var r = n(75);

  e.exports = function (e, t, n) {
    "__proto__" == t && r ? r(e, t, {
      configurable: !0,
      enumerable: !0,
      value: n,
      writable: !0
    }) : e[t] = n;
  };
}, function (e, t, n) {
  var r = n(77),
      o = n(78),
      a = n(16),
      c = n(31),
      u = n(81),
      i = n(82),
      l = Object.prototype.hasOwnProperty;

  e.exports = function (e, t) {
    var n = a(e),
        s = !n && o(e),
        f = !n && !s && c(e),
        p = !n && !s && !f && i(e),
        b = n || s || f || p,
        v = b ? r(e.length, String) : [],
        d = v.length;

    for (var y in e) {
      !t && !l.call(e, y) || b && ("length" == y || f && ("offset" == y || "parent" == y) || p && ("buffer" == y || "byteLength" == y || "byteOffset" == y) || u(y, d)) || v.push(y);
    }

    return v;
  };
}, function (e, t, n) {
  (function (e) {
    var r = n(2),
        o = n(80),
        a = t && !t.nodeType && t,
        c = a && "object" == _typeof(e) && e && !e.nodeType && e,
        u = c && c.exports === a ? r.Buffer : void 0,
        i = (u ? u.isBuffer : void 0) || o;
    e.exports = i;
  }).call(this, n(17)(e));
}, function (e, t) {
  e.exports = function (e) {
    return "number" == typeof e && e > -1 && e % 1 == 0 && e <= 9007199254740991;
  };
}, function (e, t) {
  e.exports = function (e, t) {
    return function (n) {
      return e(t(n));
    };
  };
}, function (e, t, n) {
  var r = n(25),
      o = n(32);

  e.exports = function (e) {
    return null != e && o(e.length) && !r(e);
  };
}, function (e, t, n) {
  var r = n(30),
      o = n(87),
      a = n(34);

  e.exports = function (e) {
    return a(e) ? r(e, !0) : o(e);
  };
}, function (e, t) {
  e.exports = function () {
    return [];
  };
}, function (e, t, n) {
  var r = n(38),
      o = n(39),
      a = n(21),
      c = n(36),
      u = Object.getOwnPropertySymbols ? function (e) {
    for (var t = []; e;) {
      r(t, a(e)), e = o(e);
    }

    return t;
  } : c;
  e.exports = u;
}, function (e, t) {
  e.exports = function (e, t) {
    for (var n = -1, r = t.length, o = e.length; ++n < r;) {
      e[o + n] = t[n];
    }

    return e;
  };
}, function (e, t, n) {
  var r = n(33)(Object.getPrototypeOf, Object);
  e.exports = r;
}, function (e, t, n) {
  var r = n(38),
      o = n(16);

  e.exports = function (e, t, n) {
    var a = t(e);
    return o(e) ? a : r(a, n(e));
  };
}, function (e, t, n) {
  var r = n(42);

  e.exports = function (e) {
    return r(e, 5);
  };
}, function (e, t, n) {
  var r = n(43),
      o = n(74),
      a = n(28),
      c = n(76),
      u = n(86),
      i = n(89),
      l = n(90),
      s = n(91),
      f = n(93),
      p = n(94),
      b = n(95),
      v = n(22),
      d = n(100),
      y = n(101),
      h = n(107),
      m = n(16),
      g = n(31),
      j = n(109),
      x = n(5),
      O = n(111),
      w = n(15),
      _ = {};
  _["[object Arguments]"] = _["[object Array]"] = _["[object ArrayBuffer]"] = _["[object DataView]"] = _["[object Boolean]"] = _["[object Date]"] = _["[object Float32Array]"] = _["[object Float64Array]"] = _["[object Int8Array]"] = _["[object Int16Array]"] = _["[object Int32Array]"] = _["[object Map]"] = _["[object Number]"] = _["[object Object]"] = _["[object RegExp]"] = _["[object Set]"] = _["[object String]"] = _["[object Symbol]"] = _["[object Uint8Array]"] = _["[object Uint8ClampedArray]"] = _["[object Uint16Array]"] = _["[object Uint32Array]"] = !0, _["[object Error]"] = _["[object Function]"] = _["[object WeakMap]"] = !1, e.exports = function e(t, n, A, E, C, P) {
    var N,
        T = 1 & n,
        S = 2 & n,
        R = 4 & n;
    if (A && (N = C ? A(t, E, C, P) : A(t)), void 0 !== N) return N;
    if (!x(t)) return t;
    var G = m(t);

    if (G) {
      if (N = d(t), !T) return l(t, N);
    } else {
      var k = v(t),
          I = "[object Function]" == k || "[object GeneratorFunction]" == k;
      if (g(t)) return i(t, T);

      if ("[object Object]" == k || "[object Arguments]" == k || I && !C) {
        if (N = S || I ? {} : h(t), !T) return S ? f(t, u(N, t)) : s(t, c(N, t));
      } else {
        if (!_[k]) return C ? t : {};
        N = y(t, k, T);
      }
    }

    P || (P = new r());
    var D = P.get(t);
    if (D) return D;
    P.set(t, N), O(t) ? t.forEach(function (r) {
      N.add(e(r, n, A, r, t, P));
    }) : j(t) && t.forEach(function (r, o) {
      N.set(o, e(r, n, A, o, t, P));
    });
    var V = R ? S ? b : p : S ? keysIn : w,
        B = G ? void 0 : V(t);
    return o(B || t, function (r, o) {
      B && (r = t[o = r]), a(N, o, e(r, n, A, o, t, P));
    }), N;
  };
}, function (e, t, n) {
  var r = n(7),
      o = n(49),
      a = n(50),
      c = n(51),
      u = n(52),
      i = n(53);

  function l(e) {
    var t = this.__data__ = new r(e);
    this.size = t.size;
  }

  l.prototype.clear = o, l.prototype["delete"] = a, l.prototype.get = c, l.prototype.has = u, l.prototype.set = i, e.exports = l;
}, function (e, t) {
  e.exports = function () {
    this.__data__ = [], this.size = 0;
  };
}, function (e, t, n) {
  var r = n(8),
      o = Array.prototype.splice;

  e.exports = function (e) {
    var t = this.__data__,
        n = r(t, e);
    return !(n < 0) && (n == t.length - 1 ? t.pop() : o.call(t, n, 1), --this.size, !0);
  };
}, function (e, t, n) {
  var r = n(8);

  e.exports = function (e) {
    var t = this.__data__,
        n = r(t, e);
    return n < 0 ? void 0 : t[n][1];
  };
}, function (e, t, n) {
  var r = n(8);

  e.exports = function (e) {
    return r(this.__data__, e) > -1;
  };
}, function (e, t, n) {
  var r = n(8);

  e.exports = function (e, t) {
    var n = this.__data__,
        o = r(n, e);
    return o < 0 ? (++this.size, n.push([e, t])) : n[o][1] = t, this;
  };
}, function (e, t, n) {
  var r = n(7);

  e.exports = function () {
    this.__data__ = new r(), this.size = 0;
  };
}, function (e, t) {
  e.exports = function (e) {
    var t = this.__data__,
        n = t["delete"](e);
    return this.size = t.size, n;
  };
}, function (e, t) {
  e.exports = function (e) {
    return this.__data__.get(e);
  };
}, function (e, t) {
  e.exports = function (e) {
    return this.__data__.has(e);
  };
}, function (e, t, n) {
  var r = n(7),
      o = n(13),
      a = n(61);

  e.exports = function (e, t) {
    var n = this.__data__;

    if (n instanceof r) {
      var c = n.__data__;
      if (!o || c.length < 199) return c.push([e, t]), this.size = ++n.size, this;
      n = this.__data__ = new a(c);
    }

    return n.set(e, t), this.size = n.size, this;
  };
}, function (e, t, n) {
  var r = n(25),
      o = n(58),
      a = n(5),
      c = n(27),
      u = /^\[object .+?Constructor\]$/,
      i = Function.prototype,
      l = Object.prototype,
      s = i.toString,
      f = l.hasOwnProperty,
      p = RegExp("^" + s.call(f).replace(/[\\^$.*+?()[\]{}|]/g, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");

  e.exports = function (e) {
    return !(!a(e) || o(e)) && (r(e) ? p : u).test(c(e));
  };
}, function (e, t) {
  var n;

  n = function () {
    return this;
  }();

  try {
    n = n || new Function("return this")();
  } catch (e) {
    "object" == (typeof window === "undefined" ? "undefined" : _typeof(window)) && (n = window);
  }

  e.exports = n;
}, function (e, t, n) {
  var r = n(14),
      o = Object.prototype,
      a = o.hasOwnProperty,
      c = o.toString,
      u = r ? r.toStringTag : void 0;

  e.exports = function (e) {
    var t = a.call(e, u),
        n = e[u];

    try {
      e[u] = void 0;
      var r = !0;
    } catch (e) {}

    var o = c.call(e);
    return r && (t ? e[u] = n : delete e[u]), o;
  };
}, function (e, t) {
  var n = Object.prototype.toString;

  e.exports = function (e) {
    return n.call(e);
  };
}, function (e, t, n) {
  var r,
      o = n(59),
      a = (r = /[^.]+$/.exec(o && o.keys && o.keys.IE_PROTO || "")) ? "Symbol(src)_1." + r : "";

  e.exports = function (e) {
    return !!a && a in e;
  };
}, function (e, t, n) {
  var r = n(2)["__core-js_shared__"];
  e.exports = r;
}, function (e, t) {
  e.exports = function (e, t) {
    return null == e ? void 0 : e[t];
  };
}, function (e, t, n) {
  var r = n(62),
      o = n(69),
      a = n(71),
      c = n(72),
      u = n(73);

  function i(e) {
    var t = -1,
        n = null == e ? 0 : e.length;

    for (this.clear(); ++t < n;) {
      var r = e[t];
      this.set(r[0], r[1]);
    }
  }

  i.prototype.clear = r, i.prototype["delete"] = o, i.prototype.get = a, i.prototype.has = c, i.prototype.set = u, e.exports = i;
}, function (e, t, n) {
  var r = n(63),
      o = n(7),
      a = n(13);

  e.exports = function () {
    this.size = 0, this.__data__ = {
      hash: new r(),
      map: new (a || o)(),
      string: new r()
    };
  };
}, function (e, t, n) {
  var r = n(64),
      o = n(65),
      a = n(66),
      c = n(67),
      u = n(68);

  function i(e) {
    var t = -1,
        n = null == e ? 0 : e.length;

    for (this.clear(); ++t < n;) {
      var r = e[t];
      this.set(r[0], r[1]);
    }
  }

  i.prototype.clear = r, i.prototype["delete"] = o, i.prototype.get = a, i.prototype.has = c, i.prototype.set = u, e.exports = i;
}, function (e, t, n) {
  var r = n(10);

  e.exports = function () {
    this.__data__ = r ? r(null) : {}, this.size = 0;
  };
}, function (e, t) {
  e.exports = function (e) {
    var t = this.has(e) && delete this.__data__[e];
    return this.size -= t ? 1 : 0, t;
  };
}, function (e, t, n) {
  var r = n(10),
      o = Object.prototype.hasOwnProperty;

  e.exports = function (e) {
    var t = this.__data__;

    if (r) {
      var n = t[e];
      return "__lodash_hash_undefined__" === n ? void 0 : n;
    }

    return o.call(t, e) ? t[e] : void 0;
  };
}, function (e, t, n) {
  var r = n(10),
      o = Object.prototype.hasOwnProperty;

  e.exports = function (e) {
    var t = this.__data__;
    return r ? void 0 !== t[e] : o.call(t, e);
  };
}, function (e, t, n) {
  var r = n(10);

  e.exports = function (e, t) {
    var n = this.__data__;
    return this.size += this.has(e) ? 0 : 1, n[e] = r && void 0 === t ? "__lodash_hash_undefined__" : t, this;
  };
}, function (e, t, n) {
  var r = n(11);

  e.exports = function (e) {
    var t = r(this, e)["delete"](e);
    return this.size -= t ? 1 : 0, t;
  };
}, function (e, t) {
  e.exports = function (e) {
    var t = _typeof(e);

    return "string" == t || "number" == t || "symbol" == t || "boolean" == t ? "__proto__" !== e : null === e;
  };
}, function (e, t, n) {
  var r = n(11);

  e.exports = function (e) {
    return r(this, e).get(e);
  };
}, function (e, t, n) {
  var r = n(11);

  e.exports = function (e) {
    return r(this, e).has(e);
  };
}, function (e, t, n) {
  var r = n(11);

  e.exports = function (e, t) {
    var n = r(this, e),
        o = n.size;
    return n.set(e, t), this.size += n.size == o ? 0 : 1, this;
  };
}, function (e, t) {
  e.exports = function (e, t) {
    for (var n = -1, r = null == e ? 0 : e.length; ++n < r && !1 !== t(e[n], n, e);) {
      ;
    }

    return e;
  };
}, function (e, t, n) {
  var r = n(3),
      o = function () {
    try {
      var e = r(Object, "defineProperty");
      return e({}, "", {}), e;
    } catch (e) {}
  }();

  e.exports = o;
}, function (e, t, n) {
  var r = n(12),
      o = n(15);

  e.exports = function (e, t) {
    return e && r(t, o(t), e);
  };
}, function (e, t) {
  e.exports = function (e, t) {
    for (var n = -1, r = Array(e); ++n < e;) {
      r[n] = t(n);
    }

    return r;
  };
}, function (e, t, n) {
  var r = n(79),
      o = n(6),
      a = Object.prototype,
      c = a.hasOwnProperty,
      u = a.propertyIsEnumerable,
      i = r(function () {
    return arguments;
  }()) ? r : function (e) {
    return o(e) && c.call(e, "callee") && !u.call(e, "callee");
  };
  e.exports = i;
}, function (e, t, n) {
  var r = n(9),
      o = n(6);

  e.exports = function (e) {
    return o(e) && "[object Arguments]" == r(e);
  };
}, function (e, t) {
  e.exports = function () {
    return !1;
  };
}, function (e, t) {
  var n = /^(?:0|[1-9]\d*)$/;

  e.exports = function (e, t) {
    var r = _typeof(e);

    return !!(t = null == t ? 9007199254740991 : t) && ("number" == r || "symbol" != r && n.test(e)) && e > -1 && e % 1 == 0 && e < t;
  };
}, function (e, t, n) {
  var r = n(83),
      o = n(18),
      a = n(19),
      c = a && a.isTypedArray,
      u = c ? o(c) : r;
  e.exports = u;
}, function (e, t, n) {
  var r = n(9),
      o = n(32),
      a = n(6),
      c = {};
  c["[object Float32Array]"] = c["[object Float64Array]"] = c["[object Int8Array]"] = c["[object Int16Array]"] = c["[object Int32Array]"] = c["[object Uint8Array]"] = c["[object Uint8ClampedArray]"] = c["[object Uint16Array]"] = c["[object Uint32Array]"] = !0, c["[object Arguments]"] = c["[object Array]"] = c["[object ArrayBuffer]"] = c["[object Boolean]"] = c["[object DataView]"] = c["[object Date]"] = c["[object Error]"] = c["[object Function]"] = c["[object Map]"] = c["[object Number]"] = c["[object Object]"] = c["[object RegExp]"] = c["[object Set]"] = c["[object String]"] = c["[object WeakMap]"] = !1, e.exports = function (e) {
    return a(e) && o(e.length) && !!c[r(e)];
  };
}, function (e, t, n) {
  var r = n(20),
      o = n(85),
      a = Object.prototype.hasOwnProperty;

  e.exports = function (e) {
    if (!r(e)) return o(e);
    var t = [];

    for (var n in Object(e)) {
      a.call(e, n) && "constructor" != n && t.push(n);
    }

    return t;
  };
}, function (e, t, n) {
  var r = n(33)(Object.keys, Object);
  e.exports = r;
}, function (e, t, n) {
  var r = n(12),
      o = n(35);

  e.exports = function (e, t) {
    return e && r(t, o(t), e);
  };
}, function (e, t, n) {
  var r = n(5),
      o = n(20),
      a = n(88),
      c = Object.prototype.hasOwnProperty;

  e.exports = function (e) {
    if (!r(e)) return a(e);
    var t = o(e),
        n = [];

    for (var u in e) {
      ("constructor" != u || !t && c.call(e, u)) && n.push(u);
    }

    return n;
  };
}, function (e, t) {
  e.exports = function (e) {
    var t = [];
    if (null != e) for (var n in Object(e)) {
      t.push(n);
    }
    return t;
  };
}, function (e, t, n) {
  (function (e) {
    var r = n(2),
        o = t && !t.nodeType && t,
        a = o && "object" == _typeof(e) && e && !e.nodeType && e,
        c = a && a.exports === o ? r.Buffer : void 0,
        u = c ? c.allocUnsafe : void 0;

    e.exports = function (e, t) {
      if (t) return e.slice();
      var n = e.length,
          r = u ? u(n) : new e.constructor(n);
      return e.copy(r), r;
    };
  }).call(this, n(17)(e));
}, function (e, t) {
  e.exports = function (e, t) {
    var n = -1,
        r = e.length;

    for (t || (t = Array(r)); ++n < r;) {
      t[n] = e[n];
    }

    return t;
  };
}, function (e, t, n) {
  var r = n(12),
      o = n(21);

  e.exports = function (e, t) {
    return r(e, o(e), t);
  };
}, function (e, t) {
  e.exports = function (e, t) {
    for (var n = -1, r = null == e ? 0 : e.length, o = 0, a = []; ++n < r;) {
      var c = e[n];
      t(c, n, e) && (a[o++] = c);
    }

    return a;
  };
}, function (e, t, n) {
  var r = n(12),
      o = n(37);

  e.exports = function (e, t) {
    return r(e, o(e), t);
  };
}, function (e, t, n) {
  var r = n(40),
      o = n(21),
      a = n(15);

  e.exports = function (e) {
    return r(e, a, o);
  };
}, function (e, t, n) {
  var r = n(40),
      o = n(37),
      a = n(35);

  e.exports = function (e) {
    return r(e, a, o);
  };
}, function (e, t, n) {
  var r = n(3)(n(2), "DataView");
  e.exports = r;
}, function (e, t, n) {
  var r = n(3)(n(2), "Promise");
  e.exports = r;
}, function (e, t, n) {
  var r = n(3)(n(2), "Set");
  e.exports = r;
}, function (e, t, n) {
  var r = n(3)(n(2), "WeakMap");
  e.exports = r;
}, function (e, t) {
  var n = Object.prototype.hasOwnProperty;

  e.exports = function (e) {
    var t = e.length,
        r = new e.constructor(t);
    return t && "string" == typeof e[0] && n.call(e, "index") && (r.index = e.index, r.input = e.input), r;
  };
}, function (e, t, n) {
  var r = n(23),
      o = n(103),
      a = n(104),
      c = n(105),
      u = n(106);

  e.exports = function (e, t, n) {
    var i = e.constructor;

    switch (t) {
      case "[object ArrayBuffer]":
        return r(e);

      case "[object Boolean]":
      case "[object Date]":
        return new i(+e);

      case "[object DataView]":
        return o(e, n);

      case "[object Float32Array]":
      case "[object Float64Array]":
      case "[object Int8Array]":
      case "[object Int16Array]":
      case "[object Int32Array]":
      case "[object Uint8Array]":
      case "[object Uint8ClampedArray]":
      case "[object Uint16Array]":
      case "[object Uint32Array]":
        return u(e, n);

      case "[object Map]":
        return new i();

      case "[object Number]":
      case "[object String]":
        return new i(e);

      case "[object RegExp]":
        return a(e);

      case "[object Set]":
        return new i();

      case "[object Symbol]":
        return c(e);
    }
  };
}, function (e, t, n) {
  var r = n(2).Uint8Array;
  e.exports = r;
}, function (e, t, n) {
  var r = n(23);

  e.exports = function (e, t) {
    var n = t ? r(e.buffer) : e.buffer;
    return new e.constructor(n, e.byteOffset, e.byteLength);
  };
}, function (e, t) {
  var n = /\w*$/;

  e.exports = function (e) {
    var t = new e.constructor(e.source, n.exec(e));
    return t.lastIndex = e.lastIndex, t;
  };
}, function (e, t, n) {
  var r = n(14),
      o = r ? r.prototype : void 0,
      a = o ? o.valueOf : void 0;

  e.exports = function (e) {
    return a ? Object(a.call(e)) : {};
  };
}, function (e, t, n) {
  var r = n(23);

  e.exports = function (e, t) {
    var n = t ? r(e.buffer) : e.buffer;
    return new e.constructor(n, e.byteOffset, e.length);
  };
}, function (e, t, n) {
  var r = n(108),
      o = n(39),
      a = n(20);

  e.exports = function (e) {
    return "function" != typeof e.constructor || a(e) ? {} : r(o(e));
  };
}, function (e, t, n) {
  var r = n(5),
      o = Object.create,
      a = function () {
    function e() {}

    return function (t) {
      if (!r(t)) return {};
      if (o) return o(t);
      e.prototype = t;
      var n = new e();
      return e.prototype = void 0, n;
    };
  }();

  e.exports = a;
}, function (e, t, n) {
  var r = n(110),
      o = n(18),
      a = n(19),
      c = a && a.isMap,
      u = c ? o(c) : r;
  e.exports = u;
}, function (e, t, n) {
  var r = n(22),
      o = n(6);

  e.exports = function (e) {
    return o(e) && "[object Map]" == r(e);
  };
}, function (e, t, n) {
  var r = n(112),
      o = n(18),
      a = n(19),
      c = a && a.isSet,
      u = c ? o(c) : r;
  e.exports = u;
}, function (e, t, n) {
  var r = n(22),
      o = n(6);

  e.exports = function (e) {
    return o(e) && "[object Set]" == r(e);
  };
}, function (e, t, n) {
  "use strict";

  var r = n(114);

  function o() {}

  function a() {}

  a.resetWarningCache = o, e.exports = function () {
    function e(e, t, n, o, a, c) {
      if (c !== r) {
        var u = new Error("Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types");
        throw u.name = "Invariant Violation", u;
      }
    }

    function t() {
      return e;
    }

    e.isRequired = e;
    var n = {
      array: e,
      bool: e,
      func: e,
      number: e,
      object: e,
      string: e,
      symbol: e,
      any: e,
      arrayOf: t,
      element: e,
      elementType: e,
      instanceOf: t,
      node: e,
      objectOf: t,
      oneOf: t,
      oneOfType: t,
      shape: t,
      exact: t,
      checkPropTypes: a,
      resetWarningCache: o
    };
    return n.PropTypes = n, n;
  };
}, function (e, t, n) {
  "use strict";

  e.exports = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
}, function (e, t, n) {
  "use strict";

  n.r(t);

  var r = n(41),
      o = n.n(r),
      a = n(0),
      c = n.n(a),
      u = n(1),
      i = n.n(u),
      l = n(4),
      s = n.n(l),
      f = function f(e) {
    var t = e.operator,
        n = e.value,
        r = e.handleOnChange,
        o = e.title,
        a = e.className,
        c = e.type,
        u = e.inputType,
        l = e.values;
    if ("null" === t || "notNull" === t) return null;

    switch (c) {
      case "select":
        return i.a.createElement("select", {
          className: a,
          title: o,
          onChange: function onChange(e) {
            return r(e.target.value);
          },
          value: n
        }, l.map(function (e) {
          return i.a.createElement("option", {
            key: e.name,
            value: e.name
          }, e.label);
        }));

      case "checkbox":
        return i.a.createElement("input", {
          type: "checkbox",
          className: a,
          title: o,
          onChange: function onChange(e) {
            return r(e.target.checked);
          },
          checked: !!n
        });

      case "radio":
        return i.a.createElement("span", {
          className: a,
          title: o
        }, l.map(function (e) {
          return i.a.createElement("label", {
            key: e.name
          }, i.a.createElement("input", {
            type: "radio",
            value: e.name,
            checked: n === e.name,
            onChange: function onChange(e) {
              return r(e.target.value);
            }
          }), e.label);
        }));

      default:
        return i.a.createElement("input", {
          type: u || "text",
          value: n,
          title: o,
          className: a,
          onChange: function onChange(e) {
            return r(e.target.value);
          }
        });
    }
  };

  f.displayName = "ValueEditor", f.propTypes = {
    field: c.a.string,
    operator: c.a.string,
    value: c.a.any,
    handleOnChange: c.a.func,
    title: c.a.string,
    className: c.a.string,
    type: c.a.oneOf(["select", "checkbox", "radio", "text"]),
    inputType: c.a.string,
    values: c.a.arrayOf(c.a.object)
  };

  var p = f,
      b = function b(e) {
    var t = e.className,
        n = e.handleOnChange,
        r = e.options,
        o = e.title,
        a = e.value;
    return i.a.createElement("select", {
      className: t,
      value: a,
      title: o,
      onChange: function onChange(e) {
        return n(e.target.value);
      }
    }, r.map(function (e) {
      var t = e.id ? "key-".concat(e.id) : "key-".concat(e.name);
      return i.a.createElement("option", {
        key: t,
        value: e.name
      }, e.label);
    }));
  };

  b.displayName = "ValueSelector", b.propTypes = {
    value: c.a.string,
    options: c.a.array.isRequired,
    className: c.a.string,
    handleOnChange: c.a.func,
    title: c.a.string
  };

  var v = b,
      d = function d(e) {
    var t = e.className,
        n = e.handleOnClick,
        r = e.label,
        o = e.title;
    return i.a.createElement("button", {
      className: t,
      title: o,
      onClick: function onClick(e) {
        return n(e);
      }
    }, r);
  };

  d.displayName = "ActionElement", d.propTypes = {
    label: c.a.string,
    className: c.a.string,
    handleOnClick: c.a.func,
    title: c.a.string
  };

  var y = d,
      h = function h(e) {
    var t = e.className,
        n = e.handleOnChange,
        r = e.title,
        o = e.checked;
    return i.a.createElement("label", {
      className: t,
      title: r
    }, i.a.createElement("input", {
      type: "checkbox",
      onChange: function onChange(e) {
        return n(e.target.checked);
      },
      checked: !!o
    }), "Not");
  };

  h.displayName = "NotToggle", h.propTypes = {
    className: c.a.string,
    handleOnChange: c.a.func,
    title: c.a.string,
    checked: c.a.bool
  };

  var m = h,
      g = function g(e) {
    var t = e.id,
        n = e.parentId,
        r = e.field,
        o = e.operator,
        a = e.value,
        c = e.translations,
        u = e.schema,
        l = u.classNames,
        s = u.controls,
        f = u.fields,
        p = u.getInputType,
        b = u.getLevel,
        v = u.getOperators,
        d = u.getValueEditorType,
        y = u.getValues,
        h = u.onPropChange,
        m = u.onRuleRemove,
        g = function g(e, n) {
      h(e, n, t);
    },
        j = f.find(function (e) {
      return e.name === r;
    }) || null,
        x = b(t);

    return i.a.createElement("div", {
      className: "rule ".concat(l.rule),
      "data-rule-id": t,
      "data-level": x
    }, i.a.createElement(s.fieldSelector, {
      options: f,
      title: c.fields.title,
      value: r,
      operator: o,
      className: "rule-fields ".concat(l.fields),
      handleOnChange: function handleOnChange(e) {
        g("field", e);
      },
      level: x
    }), i.a.createElement(s.operatorSelector, {
      field: r,
      fieldData: j,
      title: c.operators.title,
      options: v(r),
      value: o,
      className: "rule-operators ".concat(l.operators),
      handleOnChange: function handleOnChange(e) {
        g("operator", e);
      },
      level: x
    }), i.a.createElement(s.valueEditor, {
      field: r,
      fieldData: j,
      title: c.value.title,
      operator: o,
      value: a,
      type: d(r, o),
      inputType: p(r, o),
      values: y(r, o),
      className: "rule-value ".concat(l.value),
      handleOnChange: function handleOnChange(e) {
        g("value", e);
      },
      level: x
    }), i.a.createElement(s.removeRuleAction, {
      label: c.removeRule.label,
      title: c.removeRule.title,
      className: "rule-remove ".concat(l.removeRule),
      handleOnClick: function handleOnClick(e) {
        e.preventDefault(), e.stopPropagation(), m(t, n);
      },
      level: x
    }));
  };

  g.defaultProps = {
    id: null,
    parentId: null,
    field: null,
    operator: null,
    value: null,
    schema: null
  }, g.displayName = "Rule";

  var j = g,
      x = function e(t) {
    var n = t.id,
        r = t.parentId,
        o = t.combinator,
        a = t.rules,
        c = t.translations,
        l = t.schema,
        s = t.not,
        f = l.classNames,
        p = l.combinators,
        b = l.controls,
        v = l.createRule,
        d = l.createRuleGroup,
        y = l.getLevel,
        h = l.isRuleGroup,
        m = l.onGroupAdd,
        g = l.onGroupWrap,
        x = l.onGroupRemove,
        O = l.onPropChange,
        w = l.onRuleAdd,
        _ = l.showCombinatorsBetweenRules,
        A = l.showNotToggle,
        E = function E(e) {
      O("combinator", e, n);
    },
        C = y(n);

    return i.a.createElement("div", {
      className: "ruleGroup ".concat(f.ruleGroup),
      "data-rule-group-id": n,
      "data-level": C
    }, i.a.createElement("div", {
      className: "ruleGroup-header ".concat(f.header)
    }, _ ? null : i.a.createElement(b.combinatorSelector, {
      options: p,
      value: o,
      title: c.combinators.title,
      className: "ruleGroup-combinators ".concat(f.combinators),
      handleOnChange: E,
      rules: a,
      level: C
    }), A ? i.a.createElement(b.notToggle, {
      className: "ruleGroup-notToggle ".concat(f.notToggle),
      title: c.notToggle.title,
      checked: s,
      handleOnChange: function handleOnChange(e) {
        O("not", e, n);
      }
    }) : null, i.a.createElement(b.addRuleAction, {
      label: c.addRule.label,
      title: c.addRule.title,
      className: "ruleGroup-addRule ".concat(f.addRule),
      handleOnClick: function handleOnClick(e) {
        e.preventDefault(), e.stopPropagation();
        var t = v();
        w(t, n);
      },
      rules: a,
      level: C
    }), i.a.createElement(b.addGroupAction, {
      label: c.addGroup.label,
      title: c.addGroup.title,
      className: "ruleGroup-addGroup ".concat(f.addGroup),
      handleOnClick: function handleOnClick(e) {
        e.preventDefault(), e.stopPropagation();
        var t = d();
        m(t, n);
      },
      rules: a,
      level: C
    }), i.a.createElement(b.wrapGroupAction, {
      label: c.wrapGroup.label,
      title: c.wrapGroup.title,
      className: "ruleGroup-wrapGroup ".concat(f.wrapGroup),
      handleOnClick: function handleOnClick(e) {
        e.preventDefault(), e.stopPropagation();
        var t = d();
        g(t, n);
      },
      rules: a,
      level: C
    }), r ? i.a.createElement(b.removeGroupAction, {
      label: c.removeGroup.label,
      title: c.removeGroup.title,
      className: "ruleGroup-remove ".concat(f.removeGroup),
      handleOnClick: function handleOnClick(e) {
        e.preventDefault(), e.stopPropagation(), x(n, r);
      },
      rules: a,
      level: C
    }) : null), a.map(function (t, r) {
      return i.a.createElement(u.Fragment, {
        key: t.id
      }, r && _ ? i.a.createElement(b.combinatorSelector, {
        options: p,
        value: o,
        title: c.combinators.title,
        className: "ruleGroup-combinators betweenRules ".concat(f.combinators),
        handleOnChange: E,
        rules: a,
        level: C
      }) : null, h(t) ? i.a.createElement(e, {
        id: t.id,
        schema: l,
        parentId: n,
        combinator: t.combinator,
        translations: c,
        rules: t.rules,
        not: t.not
      }) : i.a.createElement(j, {
        id: t.id,
        field: t.field,
        value: t.value,
        operator: t.operator,
        schema: l,
        parentId: n,
        translations: c
      }));
    }));
  };

  x.defaultProps = {
    id: null,
    parentId: null,
    rules: [],
    combinator: "and",
    schema: {}
  }, x.displayName = "RuleGroup";

  var O = x,
      w = function e(t, n) {
    if (n.id === t) return n;
    var r = !0,
        o = !1,
        a = void 0;

    try {
      for (var c, u = n.rules[Symbol.iterator](); !(r = (c = u.next()).done); r = !0) {
        var i = c.value;
        if (i.id === t) return i;

        if (N(i)) {
          var l = e(t, i);
          if (l) return l;
        }
      }
    } catch (e) {
      o = !0, a = e;
    } finally {
      try {
        r || null == u["return"] || u["return"]();
      } finally {
        if (o) throw a;
      }
    }
  },
      _ = function _(e, t, n) {
    if ("json" === t.toLowerCase()) return JSON.stringify(e, null, 2);

    if ("sql" === t.toLowerCase()) {
      var r = n || function (e, t, n) {
        var r = '"'.concat(n, '"');
        return "null" === t.toLowerCase() || "notnull" === t.toLowerCase() ? r = "" : "in" === t.toLowerCase() || "notin" === t.toLowerCase() ? r = "(".concat(n.split(",").map(function (e) {
          return '"'.concat(e.trim(), '"');
        }).join(", "), ")") : "contains" === t.toLowerCase() || "doesnotcontain" === t.toLowerCase() ? r = '"%'.concat(n, '%"') : "beginswith" === t.toLowerCase() || "doesnotbeginwith" === t.toLowerCase() ? r = '"'.concat(n, '%"') : "endswith" === t.toLowerCase() || "doesnotendwith" === t.toLowerCase() ? r = '"%'.concat(n, '"') : "boolean" == typeof n && (r = "".concat(n).toUpperCase()), r;
      };

      return function e(t) {
        var n = t.rules.map(function (t) {
          return N(t) ? e(t) : function (e) {
            var t = r(e.field, e.operator, e.value),
                n = e.operator;

            switch (e.operator.toLowerCase()) {
              case "null":
                n = "is null";
                break;

              case "notnull":
                n = "is not null";
                break;

              case "notin":
                n = "not in";
                break;

              case "contains":
              case "beginswith":
              case "endswith":
                n = "like";
                break;

              case "doesnotcontain":
              case "doesnotbeginwith":
              case "doesnotendwith":
                n = "not like";
            }

            return "".concat(e.field, " ").concat(n, " ").concat(t).trim();
          }(t);
        });
        return "".concat(t.not ? "NOT " : "", "(").concat(n.join(" ".concat(t.combinator, " ")), ")");
      }(e);
    }

    return "";
  };

  function A(e, t) {
    var n = Object.keys(e);

    if (Object.getOwnPropertySymbols) {
      var r = Object.getOwnPropertySymbols(e);
      t && (r = r.filter(function (t) {
        return Object.getOwnPropertyDescriptor(e, t).enumerable;
      })), n.push.apply(n, r);
    }

    return n;
  }

  function E(e, t, n) {
    return t in e ? Object.defineProperty(e, t, {
      value: n,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }) : e[t] = n, e;
  }

  var C = function e(t) {
    return N(t) ? {
      id: t.id || "g-".concat(s()()),
      rules: t.rules.map(function (t) {
        return e(t);
      }),
      combinator: t.combinator,
      not: !!t.not
    } : function (e) {
      for (var t = 1; t < arguments.length; t++) {
        var n = null != arguments[t] ? arguments[t] : {};
        t % 2 ? A(Object(n), !0).forEach(function (t) {
          E(e, t, n[t]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : A(Object(n)).forEach(function (t) {
          Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
        });
      }

      return e;
    }({
      id: t.id || "r-".concat(s()())
    }, t);
  },
      P = function e(t, n, r) {
    var o = -1;
    return r.id === t ? o = n : N(r) && r.rules.forEach(function (r) {
      if (-1 === o) {
        var a = n;
        N(r) && a++, o = e(t, a, r);
      }
    }), o;
  },
      N = function N(e) {
    return !(!e.combinator || !e.rules);
  };

  function T(e, t) {
    return function (e) {
      if (Array.isArray(e)) return e;
    }(e) || function (e, t) {
      if (!(Symbol.iterator in Object(e) || "[object Arguments]" === Object.prototype.toString.call(e))) return;
      var n = [],
          r = !0,
          o = !1,
          a = void 0;

      try {
        for (var c, u = e[Symbol.iterator](); !(r = (c = u.next()).done) && (n.push(c.value), !t || n.length !== t); r = !0) {
          ;
        }
      } catch (e) {
        o = !0, a = e;
      } finally {
        try {
          r || null == u["return"] || u["return"]();
        } finally {
          if (o) throw a;
        }
      }

      return n;
    }(e, t) || function () {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }();
  }

  function S(e) {
    return function (e) {
      if (Array.isArray(e)) {
        for (var t = 0, n = new Array(e.length); t < e.length; t++) {
          n[t] = e[t];
        }

        return n;
      }
    }(e) || function (e) {
      if (Symbol.iterator in Object(e) || "[object Arguments]" === Object.prototype.toString.call(e)) return Array.from(e);
    }(e) || function () {
      throw new TypeError("Invalid attempt to spread non-iterable instance");
    }();
  }

  function R(e, t) {
    var n = Object.keys(e);

    if (Object.getOwnPropertySymbols) {
      var r = Object.getOwnPropertySymbols(e);
      t && (r = r.filter(function (t) {
        return Object.getOwnPropertyDescriptor(e, t).enumerable;
      })), n.push.apply(n, r);
    }

    return n;
  }

  function G(e) {
    for (var t = 1; t < arguments.length; t++) {
      var n = null != arguments[t] ? arguments[t] : {};
      t % 2 ? R(Object(n), !0).forEach(function (t) {
        k(e, t, n[t]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : R(Object(n)).forEach(function (t) {
        Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
      });
    }

    return e;
  }

  function k(e, t, n) {
    return t in e ? Object.defineProperty(e, t, {
      value: n,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }) : e[t] = n, e;
  }

  var I = {
    fields: {
      title: "Fields"
    },
    operators: {
      title: "Operators"
    },
    value: {
      title: "Value"
    },
    removeRule: {
      label: "x",
      title: "Remove rule"
    },
    removeGroup: {
      label: "x",
      title: "Remove group"
    },
    addRule: {
      label: "+Rule",
      title: "Add rule"
    },
    addGroup: {
      label: "+Group",
      title: "Add group"
    },
    wrapGroup: {
      label: "(Group)",
      title: "Wrap with group"
    },
    combinators: {
      title: "Combinators"
    },
    notToggle: {
      title: "Invert this group"
    }
  },
      D = {
    queryBuilder: "",
    ruleGroup: "",
    header: "",
    combinators: "",
    addRule: "",
    addGroup: "",
    removeGroup: "",
    notToggle: "",
    wrapGroup: "",
    rule: "",
    fields: "",
    operators: "",
    value: "",
    removeRule: ""
  },
      V = {
    addGroupAction: y,
    wrapGroupAction: y,
    removeGroupAction: y,
    addRuleAction: y,
    removeRuleAction: y,
    combinatorSelector: v,
    fieldSelector: v,
    operatorSelector: v,
    valueEditor: p,
    notToggle: m
  },
      B = function B(e) {
    var t = function t() {
      var t = e.query;
      return t && C(t) || n();
    },
        n = function n() {
      return {
        id: "g-".concat(s()()),
        rules: [],
        combinator: e.combinators[0].name,
        not: !1
      };
    },
        r = function r(t, n) {
      if (e.getValueEditorType) {
        var r = e.getValueEditorType(t, n);
        if (r) return r;
      }

      return "text";
    },
        a = function a(t, n) {
      if (e.getValues) {
        var r = e.getValues(t, n);
        if (r) return r;
      }

      return [];
    },
        c = function c(t) {
      if (e.getOperators) {
        var n = e.getOperators(t);
        if (n) return n;
      }

      return e.operators;
    },
        l = function l(e) {
      var t = "",
          n = a(e.field, e.operator);
      n.length ? t = n[0].name : "checkbox" === r(e.field, e.operator) && (t = !1);
      return t;
    },
        f = function f(t) {
      var n = e.onQueryChange;
      n && n(o()(t));
    },
        p = T(Object(u.useState)(t()), 2),
        b = p[0],
        v = p[1],
        d = {
      fields: e.fields,
      combinators: e.combinators,
      classNames: G({}, D, {}, e.controlClassnames),
      createRule: function createRule() {
        var t = e.fields[0].name;
        return {
          id: "r-".concat(s()()),
          field: t,
          value: "",
          operator: c(t)[0].name
        };
      },
      createRuleGroup: n,
      onRuleAdd: function onRuleAdd(e, t) {
        var n = G({}, b);
        w(t, n).rules.unshift(G({}, e, {
          value: l(e)
        })), v(n), f(n);
      },
      onGroupAdd: function onGroupAdd(e, t) {
        var n = G({}, b);
        w(t, n).rules.unshift(e), v(n), f(n);
      },
      onGroupWrap: function onGroupWrap(e, t) {
        var n = G({}, b),
            r = w(t, n);
        e.rules = S(r.rules), r.rules.length = 0, r.rules.push(e), v(n), f(n);
      },
      onRuleRemove: function onRuleRemove(e, t) {
        var n = G({}, b),
            r = w(t, n),
            o = r.rules.findIndex(function (t) {
          return t.id === e;
        });
        r.rules.splice(o, 1), v(n), f(n);
      },
      onGroupRemove: function onGroupRemove(e, t) {
        var n = G({}, b),
            r = w(t, n),
            o = r.rules.findIndex(function (t) {
          return t.id === e;
        });
        r.rules.splice(o, 1), v(n), f(n);
      },
      onPropChange: function onPropChange(e, t, n) {
        var r = G({}, b),
            o = w(n, r);
        Object.assign(o, k({}, e, t)), "field" === e && Object.assign(o, {
          operator: c(o.field)[0].name,
          value: l(o)
        }), v(r), f(r);
      },
      getLevel: function getLevel(e) {
        return P(e, 0, b);
      },
      isRuleGroup: N,
      controls: G({}, V, {}, e.controlElements),
      getOperators: c,
      getValueEditorType: r,
      getInputType: function getInputType(t, n) {
        if (e.getInputType) {
          var r = e.getInputType(t, n);
          if (r) return r;
        }

        return "text";
      },
      getValues: a,
      showCombinatorsBetweenRules: e.showCombinatorsBetweenRules,
      showNotToggle: e.showNotToggle
    };

    return Object(u.useEffect)(function () {
      v(C(e.query || t()));
    }, [e.query]), Object(u.useEffect)(function () {
      f(b);
    }, []), i.a.createElement("div", {
      className: "queryBuilder ".concat(d.classNames.queryBuilder)
    }, i.a.createElement(O, {
      translations: G({}, I, {}, e.translations),
      rules: b.rules,
      combinator: b.combinator,
      schema: d,
      id: b.id,
      parentId: null,
      not: b.not
    }));
  };

  B.defaultProps = {
    query: null,
    fields: [],
    operators: [{
      name: "null",
      label: "is null"
    }, {
      name: "notNull",
      label: "is not null"
    }, {
      name: "in",
      label: "in"
    }, {
      name: "notIn",
      label: "not in"
    }, {
      name: "=",
      label: "="
    }, {
      name: "!=",
      label: "!="
    }, {
      name: "<",
      label: "<"
    }, {
      name: ">",
      label: ">"
    }, {
      name: "<=",
      label: "<="
    }, {
      name: ">=",
      label: ">="
    }, {
      name: "contains",
      label: "contains"
    }, {
      name: "beginsWith",
      label: "begins with"
    }, {
      name: "endsWith",
      label: "ends with"
    }, {
      name: "doesNotContain",
      label: "does not contain"
    }, {
      name: "doesNotBeginWith",
      label: "does not begin with"
    }, {
      name: "doesNotEndWith",
      label: "does not end with"
    }],
    combinators: [{
      name: "and",
      label: "AND"
    }, {
      name: "or",
      label: "OR"
    }],
    translations: I,
    controlElements: null,
    getOperators: null,
    getValueEditorType: null,
    getInputType: null,
    getValues: null,
    onQueryChange: null,
    controlClassnames: null,
    showCombinatorsBetweenRules: !1,
    showNotToggle: !1
  }, B.propTypes = {
    query: c.a.object,
    fields: c.a.array.isRequired,
    operators: c.a.arrayOf(c.a.shape({
      name: c.a.string,
      label: c.a.string
    })),
    combinators: c.a.arrayOf(c.a.shape({
      name: c.a.string,
      label: c.a.string
    })),
    controlElements: c.a.shape({
      addGroupAction: c.a.func,
      wrapGroupAction: c.a.func,
      removeGroupAction: c.a.func,
      addRuleAction: c.a.func,
      removeRuleAction: c.a.func,
      combinatorSelector: c.a.func,
      fieldSelector: c.a.func,
      operatorSelector: c.a.func,
      valueEditor: c.a.func,
      notToggle: c.a.func
    }),
    getOperators: c.a.func,
    getValueEditorType: c.a.func,
    getInputType: c.a.func,
    getValues: c.a.func,
    onQueryChange: c.a.func,
    controlClassnames: c.a.object,
    translations: c.a.object,
    showCombinatorsBetweenRules: c.a.bool,
    showNotToggle: c.a.bool
  }, B.displayName = "QueryBuilder";
  var L = B;
  n.d(t, "formatQuery", function () {
    return _;
  });
  t["default"] = L;
}]);

/***/ }),

/***/ "./node_modules/object-assign/index.js":
/*!*********************************************!*\
  !*** ./node_modules/object-assign/index.js ***!
  \*********************************************/
/*! no static exports found */
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

/***/ "./node_modules/prop-types/checkPropTypes.js":
/*!***************************************************!*\
  !*** ./node_modules/prop-types/checkPropTypes.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



var printWarning = function() {};

if (true) {
  var ReactPropTypesSecret = __webpack_require__(/*! ./lib/ReactPropTypesSecret */ "./node_modules/prop-types/lib/ReactPropTypesSecret.js");
  var loggedTypeFailures = {};
  var has = Function.call.bind(Object.prototype.hasOwnProperty);

  printWarning = function(text) {
    var message = 'Warning: ' + text;
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
  if (true) {
    for (var typeSpecName in typeSpecs) {
      if (has(typeSpecs, typeSpecName)) {
        var error;
        // Prop type validation may throw. In case they do, we don't want to
        // fail the render phase where it didn't fail before. So we log it.
        // After these have been cleaned up, we'll let them throw.
        try {
          // This is intentionally an invariant that gets caught. It's the same
          // behavior as without this statement except with a better message.
          if (typeof typeSpecs[typeSpecName] !== 'function') {
            var err = Error(
              (componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' +
              'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.'
            );
            err.name = 'Invariant Violation';
            throw err;
          }
          error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
        } catch (ex) {
          error = ex;
        }
        if (error && !(error instanceof Error)) {
          printWarning(
            (componentName || 'React class') + ': type specification of ' +
            location + ' `' + typeSpecName + '` is invalid; the type checker ' +
            'function must return `null` or an `Error` but returned a ' + typeof error + '. ' +
            'You may have forgotten to pass an argument to the type checker ' +
            'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' +
            'shape all require an argument).'
          );
        }
        if (error instanceof Error && !(error.message in loggedTypeFailures)) {
          // Only monitor this failure once because there tends to be a lot of the
          // same error.
          loggedTypeFailures[error.message] = true;

          var stack = getStack ? getStack() : '';

          printWarning(
            'Failed ' + location + ' type: ' + error.message + (stack != null ? stack : '')
          );
        }
      }
    }
  }
}

/**
 * Resets warning cache when testing.
 *
 * @private
 */
checkPropTypes.resetWarningCache = function() {
  if (true) {
    loggedTypeFailures = {};
  }
}

module.exports = checkPropTypes;


/***/ }),

/***/ "./node_modules/prop-types/lib/ReactPropTypesSecret.js":
/*!*************************************************************!*\
  !*** ./node_modules/prop-types/lib/ReactPropTypesSecret.js ***!
  \*************************************************************/
/*! no static exports found */
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

/***/ "./node_modules/react/cjs/react.development.js":
/*!*****************************************************!*\
  !*** ./node_modules/react/cjs/react.development.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/** @license React v16.13.1
 * react.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */





if (true) {
  (function() {
'use strict';

var _assign = __webpack_require__(/*! object-assign */ "./node_modules/object-assign/index.js");
var checkPropTypes = __webpack_require__(/*! prop-types/checkPropTypes */ "./node_modules/prop-types/checkPropTypes.js");

var ReactVersion = '16.13.1';

// The Symbol used to tag the ReactElement-like types. If there is no native Symbol
// nor polyfill, then a plain number is used for performance.
var hasSymbol = typeof Symbol === 'function' && Symbol.for;
var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7;
var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for('react.portal') : 0xeaca;
var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for('react.fragment') : 0xeacb;
var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for('react.strict_mode') : 0xeacc;
var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for('react.profiler') : 0xead2;
var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for('react.provider') : 0xeacd;
var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for('react.context') : 0xeace; // TODO: We don't use AsyncMode or ConcurrentMode anymore. They were temporary
var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for('react.concurrent_mode') : 0xeacf;
var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;
var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for('react.suspense') : 0xead1;
var REACT_SUSPENSE_LIST_TYPE = hasSymbol ? Symbol.for('react.suspense_list') : 0xead8;
var REACT_MEMO_TYPE = hasSymbol ? Symbol.for('react.memo') : 0xead3;
var REACT_LAZY_TYPE = hasSymbol ? Symbol.for('react.lazy') : 0xead4;
var REACT_BLOCK_TYPE = hasSymbol ? Symbol.for('react.block') : 0xead9;
var REACT_FUNDAMENTAL_TYPE = hasSymbol ? Symbol.for('react.fundamental') : 0xead5;
var REACT_RESPONDER_TYPE = hasSymbol ? Symbol.for('react.responder') : 0xead6;
var REACT_SCOPE_TYPE = hasSymbol ? Symbol.for('react.scope') : 0xead7;
var MAYBE_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
var FAUX_ITERATOR_SYMBOL = '@@iterator';
function getIteratorFn(maybeIterable) {
  if (maybeIterable === null || typeof maybeIterable !== 'object') {
    return null;
  }

  var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];

  if (typeof maybeIterator === 'function') {
    return maybeIterator;
  }

  return null;
}

/**
 * Keeps track of the current dispatcher.
 */
var ReactCurrentDispatcher = {
  /**
   * @internal
   * @type {ReactComponent}
   */
  current: null
};

/**
 * Keeps track of the current batch's configuration such as how long an update
 * should suspend for if it needs to.
 */
var ReactCurrentBatchConfig = {
  suspense: null
};

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

var BEFORE_SLASH_RE = /^(.*)[\\\/]/;
function describeComponentFrame (name, source, ownerName) {
  var sourceInfo = '';

  if (source) {
    var path = source.fileName;
    var fileName = path.replace(BEFORE_SLASH_RE, '');

    {
      // In DEV, include code for a common special case:
      // prefer "folder/index.js" instead of just "index.js".
      if (/^index\./.test(fileName)) {
        var match = path.match(BEFORE_SLASH_RE);

        if (match) {
          var pathBeforeSlash = match[1];

          if (pathBeforeSlash) {
            var folderName = pathBeforeSlash.replace(BEFORE_SLASH_RE, '');
            fileName = folderName + '/' + fileName;
          }
        }
      }
    }

    sourceInfo = ' (at ' + fileName + ':' + source.lineNumber + ')';
  } else if (ownerName) {
    sourceInfo = ' (created by ' + ownerName + ')';
  }

  return '\n    in ' + (name || 'Unknown') + sourceInfo;
}

var Resolved = 1;
function refineResolvedLazyComponent(lazyComponent) {
  return lazyComponent._status === Resolved ? lazyComponent._result : null;
}

function getWrappedName(outerType, innerType, wrapperName) {
  var functionName = innerType.displayName || innerType.name || '';
  return outerType.displayName || (functionName !== '' ? wrapperName + "(" + functionName + ")" : wrapperName);
}

function getComponentName(type) {
  if (type == null) {
    // Host root, text node or just invalid type.
    return null;
  }

  {
    if (typeof type.tag === 'number') {
      error('Received an unexpected object in getComponentName(). ' + 'This is likely a bug in React. Please file an issue.');
    }
  }

  if (typeof type === 'function') {
    return type.displayName || type.name || null;
  }

  if (typeof type === 'string') {
    return type;
  }

  switch (type) {
    case REACT_FRAGMENT_TYPE:
      return 'Fragment';

    case REACT_PORTAL_TYPE:
      return 'Portal';

    case REACT_PROFILER_TYPE:
      return "Profiler";

    case REACT_STRICT_MODE_TYPE:
      return 'StrictMode';

    case REACT_SUSPENSE_TYPE:
      return 'Suspense';

    case REACT_SUSPENSE_LIST_TYPE:
      return 'SuspenseList';
  }

  if (typeof type === 'object') {
    switch (type.$$typeof) {
      case REACT_CONTEXT_TYPE:
        return 'Context.Consumer';

      case REACT_PROVIDER_TYPE:
        return 'Context.Provider';

      case REACT_FORWARD_REF_TYPE:
        return getWrappedName(type, type.render, 'ForwardRef');

      case REACT_MEMO_TYPE:
        return getComponentName(type.type);

      case REACT_BLOCK_TYPE:
        return getComponentName(type.render);

      case REACT_LAZY_TYPE:
        {
          var thenable = type;
          var resolvedThenable = refineResolvedLazyComponent(thenable);

          if (resolvedThenable) {
            return getComponentName(resolvedThenable);
          }

          break;
        }
    }
  }

  return null;
}

var ReactDebugCurrentFrame = {};
var currentlyValidatingElement = null;
function setCurrentlyValidatingElement(element) {
  {
    currentlyValidatingElement = element;
  }
}

{
  // Stack implementation injected by the current renderer.
  ReactDebugCurrentFrame.getCurrentStack = null;

  ReactDebugCurrentFrame.getStackAddendum = function () {
    var stack = ''; // Add an extra top frame while an element is being validated

    if (currentlyValidatingElement) {
      var name = getComponentName(currentlyValidatingElement.type);
      var owner = currentlyValidatingElement._owner;
      stack += describeComponentFrame(name, currentlyValidatingElement._source, owner && getComponentName(owner.type));
    } // Delegate to the injected renderer-specific implementation


    var impl = ReactDebugCurrentFrame.getCurrentStack;

    if (impl) {
      stack += impl() || '';
    }

    return stack;
  };
}

/**
 * Used by act() to track whether you're inside an act() scope.
 */
var IsSomeRendererActing = {
  current: false
};

var ReactSharedInternals = {
  ReactCurrentDispatcher: ReactCurrentDispatcher,
  ReactCurrentBatchConfig: ReactCurrentBatchConfig,
  ReactCurrentOwner: ReactCurrentOwner,
  IsSomeRendererActing: IsSomeRendererActing,
  // Used by renderers to avoid bundling object-assign twice in UMD bundles:
  assign: _assign
};

{
  _assign(ReactSharedInternals, {
    // These should not be included in production.
    ReactDebugCurrentFrame: ReactDebugCurrentFrame,
    // Shim for React DOM 16.0.0 which still destructured (but not used) this.
    // TODO: remove in React 17.0.
    ReactComponentTreeHook: {}
  });
}

// by calls to these methods by a Babel plugin.
//
// In PROD (or in packages without access to React internals),
// they are left as they are instead.

function warn(format) {
  {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    printWarning('warn', format, args);
  }
}
function error(format) {
  {
    for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    printWarning('error', format, args);
  }
}

function printWarning(level, format, args) {
  // When changing this logic, you might want to also
  // update consoleWithStackDev.www.js as well.
  {
    var hasExistingStack = args.length > 0 && typeof args[args.length - 1] === 'string' && args[args.length - 1].indexOf('\n    in') === 0;

    if (!hasExistingStack) {
      var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
      var stack = ReactDebugCurrentFrame.getStackAddendum();

      if (stack !== '') {
        format += '%s';
        args = args.concat([stack]);
      }
    }

    var argsWithFormat = args.map(function (item) {
      return '' + item;
    }); // Careful: RN currently depends on this prefix

    argsWithFormat.unshift('Warning: ' + format); // We intentionally don't use spread (or .apply) directly because it
    // breaks IE9: https://github.com/facebook/react/issues/13610
    // eslint-disable-next-line react-internal/no-production-logging

    Function.prototype.apply.call(console[level], console, argsWithFormat);

    try {
      // --- Welcome to debugging React ---
      // This error was thrown as a convenience so that you can use this stack
      // to find the callsite that caused this warning to fire.
      var argIndex = 0;
      var message = 'Warning: ' + format.replace(/%s/g, function () {
        return args[argIndex++];
      });
      throw new Error(message);
    } catch (x) {}
  }
}

var didWarnStateUpdateForUnmountedComponent = {};

function warnNoop(publicInstance, callerName) {
  {
    var _constructor = publicInstance.constructor;
    var componentName = _constructor && (_constructor.displayName || _constructor.name) || 'ReactClass';
    var warningKey = componentName + "." + callerName;

    if (didWarnStateUpdateForUnmountedComponent[warningKey]) {
      return;
    }

    error("Can't call %s on a component that is not yet mounted. " + 'This is a no-op, but it might indicate a bug in your application. ' + 'Instead, assign to `this.state` directly or define a `state = {};` ' + 'class property with the desired state in the %s component.', callerName, componentName);

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

var emptyObject = {};

{
  Object.freeze(emptyObject);
}
/**
 * Base class helpers for the updating state of a component.
 */


function Component(props, context, updater) {
  this.props = props;
  this.context = context; // If a component has string refs, we will assign a different object later.

  this.refs = emptyObject; // We initialize the default updater but the real one gets injected by the
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
  if (!(typeof partialState === 'object' || typeof partialState === 'function' || partialState == null)) {
    {
      throw Error( "setState(...): takes an object of state variables to update or a function which returns an object of state variables." );
    }
  }

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
        warn('%s(...) is deprecated in plain JavaScript React classes. %s', info[0], info[1]);

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
  this.context = context; // If a component has string refs, we will assign a different object later.

  this.refs = emptyObject;
  this.updater = updater || ReactNoopUpdateQueue;
}

var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
pureComponentPrototype.constructor = PureComponent; // Avoid an extra prototype jump for these methods.

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

var hasOwnProperty = Object.prototype.hasOwnProperty;
var RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true
};
var specialPropKeyWarningShown, specialPropRefWarningShown, didWarnAboutStringRefs;

{
  didWarnAboutStringRefs = {};
}

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
    {
      if (!specialPropKeyWarningShown) {
        specialPropKeyWarningShown = true;

        error('%s: `key` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://fb.me/react-special-props)', displayName);
      }
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
    {
      if (!specialPropRefWarningShown) {
        specialPropRefWarningShown = true;

        error('%s: `ref` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://fb.me/react-special-props)', displayName);
      }
    }
  };

  warnAboutAccessingRef.isReactWarning = true;
  Object.defineProperty(props, 'ref', {
    get: warnAboutAccessingRef,
    configurable: true
  });
}

function warnIfStringRefCannotBeAutoConverted(config) {
  {
    if (typeof config.ref === 'string' && ReactCurrentOwner.current && config.__self && ReactCurrentOwner.current.stateNode !== config.__self) {
      var componentName = getComponentName(ReactCurrentOwner.current.type);

      if (!didWarnAboutStringRefs[componentName]) {
        error('Component "%s" contains the string ref "%s". ' + 'Support for string refs will be removed in a future major release. ' + 'This case cannot be automatically converted to an arrow function. ' + 'We ask you to manually fix this case by using useRef() or createRef() instead. ' + 'Learn more about using refs safely here: ' + 'https://fb.me/react-strict-mode-string-ref', getComponentName(ReactCurrentOwner.current.type), config.ref);

        didWarnAboutStringRefs[componentName] = true;
      }
    }
  }
}
/**
 * Factory method to create a new React element. This no longer adheres to
 * the class pattern, so do not use new to call it. Also, instanceof check
 * will not work. Instead test $$typeof field against Symbol.for('react.element') to check
 * if something is a React Element.
 *
 * @param {*} type
 * @param {*} props
 * @param {*} key
 * @param {string|object} ref
 * @param {*} owner
 * @param {*} self A *temporary* helper to detect places where `this` is
 * different from the `owner` when React.createElement is called, so that we
 * can warn. We want to get rid of owner and replace string `ref`s with arrow
 * functions, and as long as `this` and owner are the same, there will be no
 * change in behavior.
 * @param {*} source An annotation object (added by a transpiler or otherwise)
 * indicating filename, line number, and/or other information.
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
    element._store = {}; // To make comparing ReactElements easier for testing purposes, we make
    // the validation flag non-enumerable (where possible, which should
    // include every environment we run tests in), so the test framework
    // ignores it.

    Object.defineProperty(element._store, 'validated', {
      configurable: false,
      enumerable: false,
      writable: true,
      value: false
    }); // self and source are DEV only properties.

    Object.defineProperty(element, '_self', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: self
    }); // Two elements created in two different places should be considered
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
  var propName; // Reserved names are extracted

  var props = {};
  var key = null;
  var ref = null;
  var self = null;
  var source = null;

  if (config != null) {
    if (hasValidRef(config)) {
      ref = config.ref;

      {
        warnIfStringRefCannotBeAutoConverted(config);
      }
    }

    if (hasValidKey(config)) {
      key = '' + config.key;
    }

    self = config.__self === undefined ? null : config.__self;
    source = config.__source === undefined ? null : config.__source; // Remaining properties are added to a new props object

    for (propName in config) {
      if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
        props[propName] = config[propName];
      }
    }
  } // Children can be more than one argument, and those are transferred onto
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
  } // Resolve default props


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
      var displayName = typeof type === 'function' ? type.displayName || type.name || 'Unknown' : type;

      if (key) {
        defineKeyPropWarningGetter(props, displayName);
      }

      if (ref) {
        defineRefPropWarningGetter(props, displayName);
      }
    }
  }

  return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
}
function cloneAndReplaceKey(oldElement, newKey) {
  var newElement = ReactElement(oldElement.type, newKey, oldElement.ref, oldElement._self, oldElement._source, oldElement._owner, oldElement.props);
  return newElement;
}
/**
 * Clone and return a new ReactElement using element as the starting point.
 * See https://reactjs.org/docs/react-api.html#cloneelement
 */

function cloneElement(element, config, children) {
  if (!!(element === null || element === undefined)) {
    {
      throw Error( "React.cloneElement(...): The argument must be a React element, but you passed " + element + "." );
    }
  }

  var propName; // Original props are copied

  var props = _assign({}, element.props); // Reserved names are extracted


  var key = element.key;
  var ref = element.ref; // Self is preserved since the owner is preserved.

  var self = element._self; // Source is preserved since cloneElement is unlikely to be targeted by a
  // transpiler, and the original source is probably a better indicator of the
  // true owner.

  var source = element._source; // Owner will be preserved, unless ref is overridden

  var owner = element._owner;

  if (config != null) {
    if (hasValidRef(config)) {
      // Silently steal the ref from the parent.
      ref = config.ref;
      owner = ReactCurrentOwner.current;
    }

    if (hasValidKey(config)) {
      key = '' + config.key;
    } // Remaining properties override existing props


    var defaultProps;

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
  } // Children can be more than one argument, and those are transferred onto
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
 * @return {boolean} True if `object` is a ReactElement.
 * @final
 */

function isValidElement(object) {
  return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
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
    callback(traverseContext, children, // If it's the only child, treat the name as if it was wrapped in an array
    // so that it's consistent if the number of children grows.
    nameSoFar === '' ? SEPARATOR + getComponentKey(children, 0) : nameSoFar);
    return 1;
  }

  var child;
  var nextName;
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
          if (!didWarnAboutMaps) {
            warn('Using Maps as children is deprecated and will be removed in ' + 'a future major release. Consider converting children to ' + 'an array of keyed ReactElements instead.');
          }

          didWarnAboutMaps = true;
        }
      }

      var iterator = iteratorFn.call(children);
      var step;
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

      {
        {
          throw Error( "Objects are not valid as a React child (found: " + (childrenString === '[object Object]' ? 'object with keys {' + Object.keys(children).join(', ') + '}' : childrenString) + ")." + addendum );
        }
      }
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
  } // Implicit key determined by the index in the set


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
 * See https://reactjs.org/docs/react-api.html#reactchildrenforeach
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
    mapIntoWithKeyPrefixInternal(mappedChild, result, childKey, function (c) {
      return c;
    });
  } else if (mappedChild != null) {
    if (isValidElement(mappedChild)) {
      mappedChild = cloneAndReplaceKey(mappedChild, // Keep both the (mapped) and old keys if they differ, just as
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
 * See https://reactjs.org/docs/react-api.html#reactchildrenmap
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
 * See https://reactjs.org/docs/react-api.html#reactchildrencount
 *
 * @param {?*} children Children tree container.
 * @return {number} The number of children.
 */


function countChildren(children) {
  return traverseAllChildren(children, function () {
    return null;
  }, null);
}
/**
 * Flatten a children object (typically specified as `props.children`) and
 * return an array with appropriately re-keyed children.
 *
 * See https://reactjs.org/docs/react-api.html#reactchildrentoarray
 */


function toArray(children) {
  var result = [];
  mapIntoWithKeyPrefixInternal(children, result, null, function (child) {
    return child;
  });
  return result;
}
/**
 * Returns the first child in a collection of children and verifies that there
 * is only one child in the collection.
 *
 * See https://reactjs.org/docs/react-api.html#reactchildrenonly
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
  if (!isValidElement(children)) {
    {
      throw Error( "React.Children.only expected to receive a single React element child." );
    }
  }

  return children;
}

function createContext(defaultValue, calculateChangedBits) {
  if (calculateChangedBits === undefined) {
    calculateChangedBits = null;
  } else {
    {
      if (calculateChangedBits !== null && typeof calculateChangedBits !== 'function') {
        error('createContext: Expected the optional second argument to be a ' + 'function. Instead received: %s', calculateChangedBits);
      }
    }
  }

  var context = {
    $$typeof: REACT_CONTEXT_TYPE,
    _calculateChangedBits: calculateChangedBits,
    // As a workaround to support multiple concurrent renderers, we categorize
    // some renderers as primary and others as secondary. We only expect
    // there to be two concurrent renderers at most: React Native (primary) and
    // Fabric (secondary); React DOM (primary) and React ART (secondary).
    // Secondary renderers store their context values on separate fields.
    _currentValue: defaultValue,
    _currentValue2: defaultValue,
    // Used to track how many concurrent renderers this context currently
    // supports within in a single renderer. Such as parallel server rendering.
    _threadCount: 0,
    // These are circular
    Provider: null,
    Consumer: null
  };
  context.Provider = {
    $$typeof: REACT_PROVIDER_TYPE,
    _context: context
  };
  var hasWarnedAboutUsingNestedContextConsumers = false;
  var hasWarnedAboutUsingConsumerProvider = false;

  {
    // A separate object, but proxies back to the original context object for
    // backwards compatibility. It has a different $$typeof, so we can properly
    // warn for the incorrect usage of Context as a Consumer.
    var Consumer = {
      $$typeof: REACT_CONTEXT_TYPE,
      _context: context,
      _calculateChangedBits: context._calculateChangedBits
    }; // $FlowFixMe: Flow complains about not setting a value, which is intentional here

    Object.defineProperties(Consumer, {
      Provider: {
        get: function () {
          if (!hasWarnedAboutUsingConsumerProvider) {
            hasWarnedAboutUsingConsumerProvider = true;

            error('Rendering <Context.Consumer.Provider> is not supported and will be removed in ' + 'a future major release. Did you mean to render <Context.Provider> instead?');
          }

          return context.Provider;
        },
        set: function (_Provider) {
          context.Provider = _Provider;
        }
      },
      _currentValue: {
        get: function () {
          return context._currentValue;
        },
        set: function (_currentValue) {
          context._currentValue = _currentValue;
        }
      },
      _currentValue2: {
        get: function () {
          return context._currentValue2;
        },
        set: function (_currentValue2) {
          context._currentValue2 = _currentValue2;
        }
      },
      _threadCount: {
        get: function () {
          return context._threadCount;
        },
        set: function (_threadCount) {
          context._threadCount = _threadCount;
        }
      },
      Consumer: {
        get: function () {
          if (!hasWarnedAboutUsingNestedContextConsumers) {
            hasWarnedAboutUsingNestedContextConsumers = true;

            error('Rendering <Context.Consumer.Consumer> is not supported and will be removed in ' + 'a future major release. Did you mean to render <Context.Consumer> instead?');
          }

          return context.Consumer;
        }
      }
    }); // $FlowFixMe: Flow complains about missing properties because it doesn't understand defineProperty

    context.Consumer = Consumer;
  }

  {
    context._currentRenderer = null;
    context._currentRenderer2 = null;
  }

  return context;
}

function lazy(ctor) {
  var lazyType = {
    $$typeof: REACT_LAZY_TYPE,
    _ctor: ctor,
    // React uses these fields to store the result.
    _status: -1,
    _result: null
  };

  {
    // In production, this would just set it on the object.
    var defaultProps;
    var propTypes;
    Object.defineProperties(lazyType, {
      defaultProps: {
        configurable: true,
        get: function () {
          return defaultProps;
        },
        set: function (newDefaultProps) {
          error('React.lazy(...): It is not supported to assign `defaultProps` to ' + 'a lazy component import. Either specify them where the component ' + 'is defined, or create a wrapping component around it.');

          defaultProps = newDefaultProps; // Match production behavior more closely:

          Object.defineProperty(lazyType, 'defaultProps', {
            enumerable: true
          });
        }
      },
      propTypes: {
        configurable: true,
        get: function () {
          return propTypes;
        },
        set: function (newPropTypes) {
          error('React.lazy(...): It is not supported to assign `propTypes` to ' + 'a lazy component import. Either specify them where the component ' + 'is defined, or create a wrapping component around it.');

          propTypes = newPropTypes; // Match production behavior more closely:

          Object.defineProperty(lazyType, 'propTypes', {
            enumerable: true
          });
        }
      }
    });
  }

  return lazyType;
}

function forwardRef(render) {
  {
    if (render != null && render.$$typeof === REACT_MEMO_TYPE) {
      error('forwardRef requires a render function but received a `memo` ' + 'component. Instead of forwardRef(memo(...)), use ' + 'memo(forwardRef(...)).');
    } else if (typeof render !== 'function') {
      error('forwardRef requires a render function but was given %s.', render === null ? 'null' : typeof render);
    } else {
      if (render.length !== 0 && render.length !== 2) {
        error('forwardRef render functions accept exactly two parameters: props and ref. %s', render.length === 1 ? 'Did you forget to use the ref parameter?' : 'Any additional parameter will be undefined.');
      }
    }

    if (render != null) {
      if (render.defaultProps != null || render.propTypes != null) {
        error('forwardRef render functions do not support propTypes or defaultProps. ' + 'Did you accidentally pass a React component?');
      }
    }
  }

  return {
    $$typeof: REACT_FORWARD_REF_TYPE,
    render: render
  };
}

function isValidElementType(type) {
  return typeof type === 'string' || typeof type === 'function' || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
  type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === 'object' && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE || type.$$typeof === REACT_BLOCK_TYPE);
}

function memo(type, compare) {
  {
    if (!isValidElementType(type)) {
      error('memo: The first argument must be a component. Instead ' + 'received: %s', type === null ? 'null' : typeof type);
    }
  }

  return {
    $$typeof: REACT_MEMO_TYPE,
    type: type,
    compare: compare === undefined ? null : compare
  };
}

function resolveDispatcher() {
  var dispatcher = ReactCurrentDispatcher.current;

  if (!(dispatcher !== null)) {
    {
      throw Error( "Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://fb.me/react-invalid-hook-call for tips about how to debug and fix this problem." );
    }
  }

  return dispatcher;
}

function useContext(Context, unstable_observedBits) {
  var dispatcher = resolveDispatcher();

  {
    if (unstable_observedBits !== undefined) {
      error('useContext() second argument is reserved for future ' + 'use in React. Passing it is not supported. ' + 'You passed: %s.%s', unstable_observedBits, typeof unstable_observedBits === 'number' && Array.isArray(arguments[2]) ? '\n\nDid you call array.map(useContext)? ' + 'Calling Hooks inside a loop is not supported. ' + 'Learn more at https://fb.me/rules-of-hooks' : '');
    } // TODO: add a more generic warning for invalid values.


    if (Context._context !== undefined) {
      var realContext = Context._context; // Don't deduplicate because this legitimately causes bugs
      // and nobody should be using this in existing code.

      if (realContext.Consumer === Context) {
        error('Calling useContext(Context.Consumer) is not supported, may cause bugs, and will be ' + 'removed in a future major release. Did you mean to call useContext(Context) instead?');
      } else if (realContext.Provider === Context) {
        error('Calling useContext(Context.Provider) is not supported. ' + 'Did you mean to call useContext(Context) instead?');
      }
    }
  }

  return dispatcher.useContext(Context, unstable_observedBits);
}
function useState(initialState) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
}
function useReducer(reducer, initialArg, init) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useReducer(reducer, initialArg, init);
}
function useRef(initialValue) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useRef(initialValue);
}
function useEffect(create, deps) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useEffect(create, deps);
}
function useLayoutEffect(create, deps) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useLayoutEffect(create, deps);
}
function useCallback(callback, deps) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useCallback(callback, deps);
}
function useMemo(create, deps) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useMemo(create, deps);
}
function useImperativeHandle(ref, create, deps) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useImperativeHandle(ref, create, deps);
}
function useDebugValue(value, formatterFn) {
  {
    var dispatcher = resolveDispatcher();
    return dispatcher.useDebugValue(value, formatterFn);
  }
}

var propTypesMisspellWarningShown;

{
  propTypesMisspellWarningShown = false;
}

function getDeclarationErrorAddendum() {
  if (ReactCurrentOwner.current) {
    var name = getComponentName(ReactCurrentOwner.current.type);

    if (name) {
      return '\n\nCheck the render method of `' + name + '`.';
    }
  }

  return '';
}

function getSourceInfoErrorAddendum(source) {
  if (source !== undefined) {
    var fileName = source.fileName.replace(/^.*[\\\/]/, '');
    var lineNumber = source.lineNumber;
    return '\n\nCheck your code at ' + fileName + ':' + lineNumber + '.';
  }

  return '';
}

function getSourceInfoErrorAddendumForProps(elementProps) {
  if (elementProps !== null && elementProps !== undefined) {
    return getSourceInfoErrorAddendum(elementProps.__source);
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
      info = "\n\nCheck the top-level render call using <" + parentName + ">.";
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

  ownerHasKeyUseWarning[currentComponentErrorInfo] = true; // Usually the current owner is the offender, but if it accepts children as a
  // property, it may be the creator of the child that's responsible for
  // assigning it a key.

  var childOwner = '';

  if (element && element._owner && element._owner !== ReactCurrentOwner.current) {
    // Give the component that originally created this child.
    childOwner = " It was passed a child from " + getComponentName(element._owner.type) + ".";
  }

  setCurrentlyValidatingElement(element);

  {
    error('Each child in a list should have a unique "key" prop.' + '%s%s See https://fb.me/react-warning-keys for more information.', currentComponentErrorInfo, childOwner);
  }

  setCurrentlyValidatingElement(null);
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
        var step;

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
  {
    var type = element.type;

    if (type === null || type === undefined || typeof type === 'string') {
      return;
    }

    var name = getComponentName(type);
    var propTypes;

    if (typeof type === 'function') {
      propTypes = type.propTypes;
    } else if (typeof type === 'object' && (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
    // Inner props are checked in the reconciler.
    type.$$typeof === REACT_MEMO_TYPE)) {
      propTypes = type.propTypes;
    } else {
      return;
    }

    if (propTypes) {
      setCurrentlyValidatingElement(element);
      checkPropTypes(propTypes, element.props, 'prop', name, ReactDebugCurrentFrame.getStackAddendum);
      setCurrentlyValidatingElement(null);
    } else if (type.PropTypes !== undefined && !propTypesMisspellWarningShown) {
      propTypesMisspellWarningShown = true;

      error('Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?', name || 'Unknown');
    }

    if (typeof type.getDefaultProps === 'function' && !type.getDefaultProps.isReactClassApproved) {
      error('getDefaultProps is only used on classic React.createClass ' + 'definitions. Use a static property named `defaultProps` instead.');
    }
  }
}
/**
 * Given a fragment, validate that it can only be provided with fragment props
 * @param {ReactElement} fragment
 */


function validateFragmentProps(fragment) {
  {
    setCurrentlyValidatingElement(fragment);
    var keys = Object.keys(fragment.props);

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];

      if (key !== 'children' && key !== 'key') {
        error('Invalid prop `%s` supplied to `React.Fragment`. ' + 'React.Fragment can only have `key` and `children` props.', key);

        break;
      }
    }

    if (fragment.ref !== null) {
      error('Invalid attribute `ref` supplied to `React.Fragment`.');
    }

    setCurrentlyValidatingElement(null);
  }
}
function createElementWithValidation(type, props, children) {
  var validType = isValidElementType(type); // We warn in this case but don't throw. We expect the element creation to
  // succeed and there will likely be errors in render.

  if (!validType) {
    var info = '';

    if (type === undefined || typeof type === 'object' && type !== null && Object.keys(type).length === 0) {
      info += ' You likely forgot to export your component from the file ' + "it's defined in, or you might have mixed up default and named imports.";
    }

    var sourceInfo = getSourceInfoErrorAddendumForProps(props);

    if (sourceInfo) {
      info += sourceInfo;
    } else {
      info += getDeclarationErrorAddendum();
    }

    var typeString;

    if (type === null) {
      typeString = 'null';
    } else if (Array.isArray(type)) {
      typeString = 'array';
    } else if (type !== undefined && type.$$typeof === REACT_ELEMENT_TYPE) {
      typeString = "<" + (getComponentName(type.type) || 'Unknown') + " />";
      info = ' Did you accidentally export a JSX literal instead of a component?';
    } else {
      typeString = typeof type;
    }

    {
      error('React.createElement: type is invalid -- expected a string (for ' + 'built-in components) or a class/function (for composite ' + 'components) but got: %s.%s', typeString, info);
    }
  }

  var element = createElement.apply(this, arguments); // The result can be nullish if a mock or a custom function is used.
  // TODO: Drop this when these are no longer allowed as the type argument.

  if (element == null) {
    return element;
  } // Skip key warning if the type isn't valid since our key validation logic
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
var didWarnAboutDeprecatedCreateFactory = false;
function createFactoryWithValidation(type) {
  var validatedFactory = createElementWithValidation.bind(null, type);
  validatedFactory.type = type;

  {
    if (!didWarnAboutDeprecatedCreateFactory) {
      didWarnAboutDeprecatedCreateFactory = true;

      warn('React.createFactory() is deprecated and will be removed in ' + 'a future major release. Consider using JSX ' + 'or use React.createElement() directly instead.');
    } // Legacy hook: remove it


    Object.defineProperty(validatedFactory, 'type', {
      enumerable: false,
      get: function () {
        warn('Factory.type is deprecated. Access the class directly ' + 'before passing it to createFactory.');

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

{

  try {
    var frozenObject = Object.freeze({});
    var testMap = new Map([[frozenObject, null]]);
    var testSet = new Set([frozenObject]); // This is necessary for Rollup to not consider these unused.
    // https://github.com/rollup/rollup/issues/1771
    // TODO: we can remove these if Rollup fixes the bug.

    testMap.set(0, 0);
    testSet.add(0);
  } catch (e) {
  }
}

var createElement$1 =  createElementWithValidation ;
var cloneElement$1 =  cloneElementWithValidation ;
var createFactory =  createFactoryWithValidation ;
var Children = {
  map: mapChildren,
  forEach: forEachChildren,
  count: countChildren,
  toArray: toArray,
  only: onlyChild
};

exports.Children = Children;
exports.Component = Component;
exports.Fragment = REACT_FRAGMENT_TYPE;
exports.Profiler = REACT_PROFILER_TYPE;
exports.PureComponent = PureComponent;
exports.StrictMode = REACT_STRICT_MODE_TYPE;
exports.Suspense = REACT_SUSPENSE_TYPE;
exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ReactSharedInternals;
exports.cloneElement = cloneElement$1;
exports.createContext = createContext;
exports.createElement = createElement$1;
exports.createFactory = createFactory;
exports.createRef = createRef;
exports.forwardRef = forwardRef;
exports.isValidElement = isValidElement;
exports.lazy = lazy;
exports.memo = memo;
exports.useCallback = useCallback;
exports.useContext = useContext;
exports.useDebugValue = useDebugValue;
exports.useEffect = useEffect;
exports.useImperativeHandle = useImperativeHandle;
exports.useLayoutEffect = useLayoutEffect;
exports.useMemo = useMemo;
exports.useReducer = useReducer;
exports.useRef = useRef;
exports.useState = useState;
exports.version = ReactVersion;
  })();
}


/***/ }),

/***/ "./node_modules/react/index.js":
/*!*************************************!*\
  !*** ./node_modules/react/index.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


if (false) {} else {
  module.exports = __webpack_require__(/*! ./cjs/react.development.js */ "./node_modules/react/cjs/react.development.js");
}


/***/ })

/******/ });
//# sourceMappingURL=main.bundle.js.map