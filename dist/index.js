module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmory imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmory exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		Object.defineProperty(exports, name, {
/******/ 			configurable: false,
/******/ 			enumerable: true,
/******/ 			get: getter
/******/ 		});
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

module.exports = require("react");

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(React) {/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash_uniqueId__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash_uniqueId___default = __WEBPACK_IMPORTED_MODULE_0_lodash_uniqueId__ && __WEBPACK_IMPORTED_MODULE_0_lodash_uniqueId__.__esModule ? function() { return __WEBPACK_IMPORTED_MODULE_0_lodash_uniqueId__['default'] } : function() { return __WEBPACK_IMPORTED_MODULE_0_lodash_uniqueId__; };
/* harmony import */ __webpack_require__.d(__WEBPACK_IMPORTED_MODULE_0_lodash_uniqueId___default, 'a', __WEBPACK_IMPORTED_MODULE_0_lodash_uniqueId___default);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__RuleGroup__ = __webpack_require__(3);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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
                fields: [],
                operators: QueryBuilder.defaultOperators,
                combinators: QueryBuilder.defaultCombinators,
                getEditor: null,
                getOperators: null,
                onQueryChange: null
            };
        }
    }, {
        key: 'propTypes',
        get: function get() {
            return {
                query: React.PropTypes.object,
                fields: React.PropTypes.array.isRequired,
                operators: React.PropTypes.array,
                combinators: React.PropTypes.array,
                getEditor: React.PropTypes.func,
                getOperators: React.PropTypes.func,
                onQueryChange: React.PropTypes.func
            };
        }
    }]);

    function QueryBuilder() {
        var _Object$getPrototypeO;

        _classCallCheck(this, QueryBuilder);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        var _this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(QueryBuilder)).call.apply(_Object$getPrototypeO, [this].concat(args)));

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

            var _props = this.props;
            var fields = _props.fields;
            var operators = _props.operators;
            var combinators = _props.combinators;


            this.setState({
                root: this.getInitialQuery(),
                schema: {
                    fields: fields,
                    operators: operators,
                    combinators: combinators,
                    createRule: this.createRule.bind(this),
                    createRuleGroup: this.createRuleGroup.bind(this),
                    onRuleAdd: this._notifyQueryChange.bind(this, this.onRuleAdd),
                    onGroupAdd: this._notifyQueryChange.bind(this, this.onGroupAdd),
                    onRuleRemove: this._notifyQueryChange.bind(this, this.onRuleRemove),
                    onGroupRemove: this._notifyQueryChange.bind(this, this.onGroupRemove),
                    onPropChange: this._notifyQueryChange.bind(this, this.onPropChange),
                    isRuleGroup: this.isRuleGroup.bind(this),
                    getEditor: function getEditor() {
                        return _this2.prepareEditor.apply(_this2, arguments);
                    },
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
            var _state = this.state;
            var _state$root = _state.root;
            var id = _state$root.id;
            var rules = _state$root.rules;
            var combinator = _state$root.combinator;
            var schema = _state.schema;


            return React.createElement(__WEBPACK_IMPORTED_MODULE_1__RuleGroup__["a" /* default */], { rules: rules,
                combinator: combinator,
                schema: schema,
                id: id,
                parentId: null });
        }
    }, {
        key: 'isRuleGroup',
        value: function isRuleGroup(rule) {
            return !!(rule.combinator && rule.rules);
        }
    }, {
        key: 'createRule',
        value: function createRule() {
            var _state$schema = this.state.schema;
            var fields = _state$schema.fields;
            var operators = _state$schema.operators;


            return {
                id: __WEBPACK_IMPORTED_MODULE_0_lodash_uniqueId___default()('r-'),
                field: fields[0].name,
                value: '',
                operator: operators[0].name
            };
        }
    }, {
        key: 'createRuleGroup',
        value: function createRuleGroup() {
            return {
                id: __WEBPACK_IMPORTED_MODULE_0_lodash_uniqueId___default()('g-'),
                rules: [],
                combinator: this.props.combinators[0].name
            };
        }
    }, {
        key: 'prepareEditor',
        value: function prepareEditor(config) {
            var value = config.value;
            var operator = config.operator;
            var _onChange = config.onChange;


            var editor = this.props.getEditor && this.props.getEditor(config);
            if (editor) {
                return editor;
            }

            if (operator === 'null' || operator === 'notNull') {
                return null;
            }

            return React.createElement('input', { type: 'text',
                value: value,
                onChange: function onChange(event) {
                    return _onChange(event.target.value);
                } });
        }
    }, {
        key: 'getOperators',
        value: function getOperators(field) {
            if (this.props.getOperators) {
                var ops = this.props.getOperators(field);
                if (ops) {
                    return ops;
                }
            }

            return QueryBuilder.defaultOperators;
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
                var query = this._constructQuery(this.state.root);
                onQueryChange(query);
            }
        }
    }, {
        key: '_constructQuery',
        value: function _constructQuery(node) {
            var _this3 = this;

            var query = void 0;
            var isRuleGroup = this.state.schema.isRuleGroup;


            if (isRuleGroup(node)) {
                var combinator = node.combinator;
                var rules = node.rules;

                query = {
                    combinator: combinator,
                    rules: rules.map(function (r) {
                        return _this3._constructQuery(r, {});
                    })
                };
            } else {
                var field = node.field;
                var operator = node.operator;
                var value = node.value;

                query = { field: field, operator: operator, value: value };
            }

            return query;
        }
    }], [{
        key: 'defaultOperators',
        get: function get() {

            return [{ name: 'null', label: 'Is Null' }, { name: 'notNull', label: 'Is Not Null' }, { name: 'in', label: 'In' }, { name: 'notIn', label: 'Not In' }, { name: '=', label: '=' }, { name: '!=', label: '!=' }, { name: '<', label: '<' }, { name: '>', label: '>' }, { name: '<=', label: '<=' }, { name: '>=', label: '>=' }];
        }
    }, {
        key: 'defaultCombinators',
        get: function get() {

            return [{ name: 'and', label: 'AND' }, { name: 'or', label: 'OR' }];
        }
    }]);

    return QueryBuilder;
}(React.Component);

/* harmony default export */ exports["a"] = QueryBuilder;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(React) {var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Rule = function (_React$Component) {
    _inherits(Rule, _React$Component);

    function Rule() {
        _classCallCheck(this, Rule);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Rule).apply(this, arguments));
    }

    _createClass(Rule, [{
        key: "render",
        value: function render() {
            var _this2 = this;

            var _props = this.props;
            var field = _props.field;
            var operator = _props.operator;
            var value = _props.value;
            var _props$schema = _props.schema;
            var fields = _props$schema.fields;
            var operators = _props$schema.operators;
            var getEditor = _props$schema.getEditor;
            var getOperators = _props$schema.getOperators;


            return React.createElement(
                "div",
                { className: "QueryBuilder-rule" },
                React.createElement(
                    "select",
                    { className: "Rule-fields",
                        value: field,
                        onChange: function onChange(event) {
                            return _this2.onValueChanged('field', event.target.value);
                        } },
                    fields.map(function (field) {
                        return React.createElement(
                            "option",
                            { key: field.name, value: field.name },
                            field.label
                        );
                    })
                ),
                React.createElement(
                    "select",
                    { className: "Rule-operators",
                        value: operator,
                        onChange: function onChange(event) {
                            return _this2.onValueChanged('operator', event.target.value);
                        } },
                    getOperators(field).map(function (op) {
                        return React.createElement(
                            "option",
                            { value: op.name, key: op.name },
                            op.label
                        );
                    })
                ),
                getEditor({
                    field: field,
                    value: value,
                    operator: operator,
                    onChange: function onChange(value) {
                        return _this2.onValueChanged('value', value);
                    }
                }),
                React.createElement(
                    "button",
                    { className: "Rule-remove",
                        onClick: function onClick(event) {
                            return _this2.removeRule(event);
                        } },
                    "x"
                )
            );
        }
    }, {
        key: "onValueChanged",
        value: function onValueChanged(field, value) {
            var _props2 = this.props;
            var id = _props2.id;
            var onPropChange = _props2.schema.onPropChange;


            onPropChange(field, value, id);
        }
    }, {
        key: "removeRule",
        value: function removeRule(event) {
            event.preventDefault();
            event.stopPropagation();

            this.props.schema.onRuleRemove(this.props.id, this.props.parentId);
        }
    }], [{
        key: "defaultProps",
        get: function get() {
            return {
                id: null,
                parentId: null,
                field: null,
                operator: null,
                value: null,
                schema: null
            };
        }
    }]);

    return Rule;
}(React.Component);

/* harmony default export */ exports["a"] = Rule;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(React) {/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Rule__ = __webpack_require__(2);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }



var RuleGroup = function (_React$Component) {
    _inherits(RuleGroup, _React$Component);

    function RuleGroup() {
        _classCallCheck(this, RuleGroup);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(RuleGroup).apply(this, arguments));
    }

    _createClass(RuleGroup, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props;
            var combinator = _props.combinator;
            var rules = _props.rules;
            var _props$schema = _props.schema;
            var combinators = _props$schema.combinators;
            var onRuleRemove = _props$schema.onRuleRemove;
            var isRuleGroup = _props$schema.isRuleGroup;

            return React.createElement(
                'div',
                { className: 'QueryBuilder-ruleGroup' },
                React.createElement(
                    'select',
                    { className: 'RuleGroup-combinators',
                        value: combinator,
                        onChange: function onChange(event) {
                            return _this2.onCombinatorChange(event.target.value);
                        } },
                    combinators.map(function (c) {
                        return React.createElement(
                            'option',
                            { key: c.name, value: c.name },
                            c.label
                        );
                    })
                ),
                React.createElement(
                    'button',
                    { className: 'RuleGroup-addRule',
                        onClick: function onClick(event) {
                            return _this2.addRule(event);
                        } },
                    '+Rule'
                ),
                React.createElement(
                    'button',
                    { className: 'RuleGroup-addGroup',
                        onClick: function onClick(event) {
                            return _this2.addGroup(event);
                        } },
                    '+Group'
                ),
                this.props.parentId ? React.createElement(
                    'button',
                    { className: 'RuleGroup-remove',
                        onClick: function onClick(event) {
                            return _this2.removeGroup(event, _this2.props.id);
                        } },
                    'x'
                ) : null,
                rules.map(function (r) {
                    return isRuleGroup(r) ? React.createElement(RuleGroup, { key: r.id,
                        id: r.id,
                        schema: _this2.props.schema,
                        parentId: _this2.props.id,
                        combinator: r.combinator,
                        rules: r.rules }) : React.createElement(__WEBPACK_IMPORTED_MODULE_0__Rule__["a" /* default */], { key: r.id,
                        id: r.id,
                        field: r.field,
                        value: r.value,
                        operator: r.operator,
                        schema: _this2.props.schema,
                        parentId: _this2.props.id,
                        onRuleRemove: onRuleRemove });
                })
            );
        }
    }, {
        key: 'onCombinatorChange',
        value: function onCombinatorChange(value) {
            var onPropChange = this.props.schema.onPropChange;


            onPropChange('combinator', value, this.props.id);
        }
    }, {
        key: 'addRule',
        value: function addRule(event) {
            event.preventDefault();
            event.stopPropagation();

            var _props$schema2 = this.props.schema;
            var createRule = _props$schema2.createRule;
            var onRuleAdd = _props$schema2.onRuleAdd;


            var newRule = createRule();
            onRuleAdd(newRule, this.props.id);
        }
    }, {
        key: 'addGroup',
        value: function addGroup(event) {
            event.preventDefault();
            event.stopPropagation();

            var _props$schema3 = this.props.schema;
            var createRuleGroup = _props$schema3.createRuleGroup;
            var onGroupAdd = _props$schema3.onGroupAdd;

            var newGroup = createRuleGroup();
            onGroupAdd(newGroup, this.props.id);
        }
    }, {
        key: 'removeGroup',
        value: function removeGroup(event, groupId) {
            event.preventDefault();
            event.stopPropagation();

            this.props.schema.onGroupRemove(groupId, this.props.parentId);
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
}(React.Component);

/* harmony default export */ exports["a"] = RuleGroup;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__QueryBuilder__ = __webpack_require__(1);
/* harmony reexport */ if(__webpack_require__.o(__WEBPACK_IMPORTED_MODULE_0__QueryBuilder__, "a")) __webpack_require__.d(exports, "QueryBuilder", function() { return __WEBPACK_IMPORTED_MODULE_0__QueryBuilder__["a"]; });


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

var root = __webpack_require__(8);

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(5),
    isSymbol = __webpack_require__(10);

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

module.exports = baseToString;


/***/ },
/* 7 */
/***/ function(module, exports) {

/**
 * Checks if `value` is a global object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {null|Object} Returns `value` if it's a global object, else `null`.
 */
function checkGlobal(value) {
  return (value && value.Object === Object) ? value : null;
}

module.exports = checkGlobal;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var checkGlobal = __webpack_require__(7);

/** Detect free variable `global` from Node.js. */
var freeGlobal = checkGlobal(typeof global == 'object' && global);

/** Detect free variable `self`. */
var freeSelf = checkGlobal(typeof self == 'object' && self);

/** Detect `this` as the global object. */
var thisGlobal = checkGlobal(typeof this == 'object' && this);

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || thisGlobal || Function('return this')();

module.exports = root;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(13)))

/***/ },
/* 9 */
/***/ function(module, exports) {

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
  return !!value && typeof value == 'object';
}

module.exports = isObjectLike;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

var isObjectLike = __webpack_require__(9);

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

module.exports = isSymbol;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

var baseToString = __webpack_require__(6);

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

module.exports = toString;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

var toString = __webpack_require__(11);

/** Used to generate unique IDs. */
var idCounter = 0;

/**
 * Generates a unique ID. If `prefix` is given, the ID is appended to it.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {string} [prefix=''] The value to prefix the ID with.
 * @returns {string} Returns the unique ID.
 * @example
 *
 * _.uniqueId('contact_');
 * // => 'contact_104'
 *
 * _.uniqueId();
 * // => '105'
 */
function uniqueId(prefix) {
  var id = ++idCounter;
  return toString(prefix) + id;
}

module.exports = uniqueId;


/***/ },
/* 13 */
/***/ function(module, exports) {

var g;

// This works in non-strict mode
g = (function() { return this; })();

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


/***/ }
/******/ ]);