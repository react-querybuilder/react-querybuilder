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

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

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

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 17);
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


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _uniqueId = __webpack_require__(15);

var _uniqueId2 = _interopRequireDefault(_uniqueId);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _RuleGroup = __webpack_require__(3);

var _RuleGroup2 = _interopRequireDefault(_RuleGroup);

var _index = __webpack_require__(7);

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
                fields: [],
                operators: QueryBuilder.defaultOperators,
                combinators: QueryBuilder.defaultCombinators,
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
                query: _react2.default.PropTypes.object,
                fields: _react2.default.PropTypes.array.isRequired,
                operators: _react2.default.PropTypes.array,
                combinators: _react2.default.PropTypes.array,
                controlElements: _react2.default.PropTypes.shape({
                    addGroupAction: _react2.default.PropTypes.func,
                    removeGroupAction: _react2.default.PropTypes.func,
                    addRuleAction: _react2.default.PropTypes.func,
                    removeRuleAction: _react2.default.PropTypes.func,
                    combinatorSelector: _react2.default.PropTypes.func,
                    fieldSelector: _react2.default.PropTypes.func,
                    operatorSelector: _react2.default.PropTypes.func,
                    valueEditor: _react2.default.PropTypes.func
                }),
                getOperators: _react2.default.PropTypes.func,
                onQueryChange: _react2.default.PropTypes.func,
                controlClassnames: _react2.default.PropTypes.object
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


            return _react2.default.createElement(
                'div',
                { className: 'queryBuilder ' + schema.classNames.queryBuilder },
                _react2.default.createElement(_RuleGroup2.default, {
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
                fields = _state$schema.fields,
                operators = _state$schema.operators;


            return {
                id: (0, _uniqueId2.default)('r-'),
                field: fields[0].name,
                value: '',
                operator: operators[0].name
            };
        }
    }, {
        key: 'createRuleGroup',
        value: function createRuleGroup() {
            return {
                id: (0, _uniqueId2.default)('g-'),
                rules: [],
                combinator: this.props.combinators[0].name
            };
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
                var combinator = node.combinator,
                    rules = node.rules;

                query = {
                    combinator: combinator,
                    rules: rules.map(function (r) {
                        return _this3._constructQuery(r, {});
                    })
                };
            } else {
                var field = node.field,
                    operator = node.operator,
                    value = node.value;

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
                fieldSelector: _index.ValueSelector,
                operatorSelector: _index.ValueSelector,
                valueEditor: _index.ValueEditor
            };
        }
    }]);

    return QueryBuilder;
}(_react2.default.Component);

exports.default = QueryBuilder;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

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

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Rule.__proto__ || Object.getPrototypeOf(Rule)).call.apply(_ref, [this].concat(args))), _this), _this.onFieldChanged = function (value) {
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
                field = _props.field,
                operator = _props.operator,
                value = _props.value,
                _props$schema = _props.schema,
                fields = _props$schema.fields,
                operators = _props$schema.operators,
                controls = _props$schema.controls,
                getOperators = _props$schema.getOperators,
                classNames = _props$schema.classNames;

            return _react2.default.createElement(
                'div',
                { className: 'rule ' + classNames.rule },
                _react2.default.createElement(controls.fieldSelector, {
                    options: fields,
                    value: field,
                    className: 'rule-fields ' + classNames.fields,
                    handleOnChange: this.onFieldChanged
                }),
                _react2.default.createElement(controls.operatorSelector, {
                    options: getOperators(field),
                    value: operator,
                    className: 'rule-operators ' + classNames.operators,
                    handleOnChange: this.onOperatorChanged
                }),
                _react2.default.createElement(controls.valueEditor, {
                    field: field,
                    operator: operator,
                    value: value,
                    className: 'rule-value ' + classNames.value,
                    handleOnChange: this.onValueChanged
                }),
                _react2.default.createElement(controls.removeRuleAction, {
                    label: 'x',
                    className: 'rule-remove ' + classNames.removeRule,
                    handleOnClick: this.removeRule
                })
            );
        }
    }], [{
        key: 'defaultProps',
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
}(_react2.default.Component);

exports.default = Rule;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _Rule = __webpack_require__(2);

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
                _props$schema = _props.schema,
                combinators = _props$schema.combinators,
                controls = _props$schema.controls,
                onRuleRemove = _props$schema.onRuleRemove,
                isRuleGroup = _props$schema.isRuleGroup,
                classNames = _props$schema.classNames;

            return _react2.default.createElement(
                'div',
                { className: 'ruleGroup ' + classNames.ruleGroup },
                _react2.default.createElement(controls.combinatorSelector, {
                    options: combinators,
                    value: combinator,
                    className: 'ruleGroup-combinators ' + classNames.combinators,
                    handleOnChange: this.onCombinatorChange
                }),
                _react2.default.createElement(controls.addRuleAction, {
                    label: '+Rule',
                    className: 'ruleGroup-addRule ' + classNames.addRule,
                    handleOnClick: this.addRule
                }),
                _react2.default.createElement(controls.addGroupAction, {
                    label: '+Group',
                    className: 'ruleGroup-addGroup ' + classNames.addGroup,
                    handleOnClick: this.addGroup
                }),
                this.hasParentGroup() ? _react2.default.createElement(controls.removeGroupAction, {
                    label: 'x',
                    className: 'ruleGroup-remove ' + classNames.removeGroup,
                    handleOnClick: this.removeGroup
                }) : null,
                rules.map(function (r) {
                    return isRuleGroup(r) ? _react2.default.createElement(RuleGroup, { key: r.id,
                        id: r.id,
                        schema: _this2.props.schema,
                        parentId: _this2.props.id,
                        combinator: r.combinator,
                        rules: r.rules }) : _react2.default.createElement(_Rule2.default, { key: r.id,
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

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ActionElement = function (_React$Component) {
  _inherits(ActionElement, _React$Component);

  _createClass(ActionElement, null, [{
    key: 'propTypes',
    get: function get() {
      return {
        label: _react2.default.PropTypes.string,
        className: _react2.default.PropTypes.string,
        handleOnClick: _react2.default.PropTypes.func
      };
    }
  }]);

  function ActionElement(props) {
    _classCallCheck(this, ActionElement);

    return _possibleConstructorReturn(this, (ActionElement.__proto__ || Object.getPrototypeOf(ActionElement)).call(this, props));
  }

  _createClass(ActionElement, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          label = _props.label,
          className = _props.className,
          handleOnClick = _props.handleOnClick;


      return _react2.default.createElement(
        'button',
        { className: className,
          onClick: function onClick(e) {
            return handleOnClick(e);
          } },
        label
      );
    }
  }]);

  return ActionElement;
}(_react2.default.Component);

exports.default = ActionElement;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ValueEditor = function (_React$Component) {
  _inherits(ValueEditor, _React$Component);

  _createClass(ValueEditor, null, [{
    key: 'propTypes',
    get: function get() {
      return {
        field: _react2.default.PropTypes.string,
        operator: _react2.default.PropTypes.string,
        value: _react2.default.PropTypes.string,
        handleOnChange: _react2.default.PropTypes.func
      };
    }
  }]);

  function ValueEditor(props) {
    _classCallCheck(this, ValueEditor);

    return _possibleConstructorReturn(this, (ValueEditor.__proto__ || Object.getPrototypeOf(ValueEditor)).call(this, props));
  }

  _createClass(ValueEditor, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          field = _props.field,
          operator = _props.operator,
          value = _props.value,
          handleOnChange = _props.handleOnChange;


      if (operator === 'null' || operator === 'notNull') {
        return null;
      }

      return _react2.default.createElement('input', { type: 'text',
        value: value,
        onChange: function onChange(e) {
          return handleOnChange(e.target.value);
        } });
    }
  }]);

  return ValueEditor;
}(_react2.default.Component);

exports.default = ValueEditor;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ValueSelector = function (_React$Component) {
  _inherits(ValueSelector, _React$Component);

  function ValueSelector() {
    _classCallCheck(this, ValueSelector);

    return _possibleConstructorReturn(this, (ValueSelector.__proto__ || Object.getPrototypeOf(ValueSelector)).apply(this, arguments));
  }

  _createClass(ValueSelector, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          value = _props.value,
          options = _props.options,
          className = _props.className,
          handleOnChange = _props.handleOnChange;


      return _react2.default.createElement(
        'select',
        { className: className,
          value: value,
          onChange: function onChange(e) {
            return handleOnChange(e.target.value);
          } },
        options.map(function (option) {
          return _react2.default.createElement(
            'option',
            { key: option.name, value: option.name },
            option.label
          );
        })
      );
    }
  }], [{
    key: 'propTypes',
    get: function get() {
      return {
        value: _react2.default.PropTypes.string,
        options: _react2.default.PropTypes.array.isRequired,
        className: _react2.default.PropTypes.string,
        handleOnChange: _react2.default.PropTypes.func
      };
    }
  }]);

  return ValueSelector;
}(_react2.default.Component);

exports.default = ValueSelector;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ValueEditor = __webpack_require__(5);

Object.defineProperty(exports, 'ValueEditor', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_ValueEditor).default;
  }
});

var _ValueSelector = __webpack_require__(6);

Object.defineProperty(exports, 'ValueSelector', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_ValueSelector).default;
  }
});

var _ActionElement = __webpack_require__(4);

Object.defineProperty(exports, 'ActionElement', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_ActionElement).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

var root = __webpack_require__(11);

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(8),
    isSymbol = __webpack_require__(13);

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
/* 10 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(16)))

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

var freeGlobal = __webpack_require__(10);

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;


/***/ },
/* 12 */
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
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

var isObjectLike = __webpack_require__(12);

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
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
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
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
/* 14 */
/***/ function(module, exports, __webpack_require__) {

var baseToString = __webpack_require__(9);

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
/* 15 */
/***/ function(module, exports, __webpack_require__) {

var toString = __webpack_require__(14);

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
/* 16 */
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


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _QueryBuilder = __webpack_require__(1);

var _QueryBuilder2 = _interopRequireDefault(_QueryBuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _QueryBuilder2.default;

/***/ }
/******/ ]);