"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line:import-name
var v4_1 = require("uuid/v4");
// import cloneDeep from 'lodash/cloneDeep';
var React = require("react");
var deepClone_1 = require("../lib/deepClone");
// tslint:disable-next-line:import-name
var RuleGroup_1 = require("../RuleGroup");
var controls_1 = require("../controls");
require("QueryBuilder.css");
var QueryBuilder = /** @class */ (function (_super) {
    __extends(QueryBuilder, _super);
    function QueryBuilder(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            root: {},
            schema: {},
        };
        return _this;
    }
    Object.defineProperty(QueryBuilder, "defaultProps", {
        get: function () {
            return {
                query: undefined,
                fields: [],
                operators: QueryBuilder.defaultOperators,
                combinators: QueryBuilder.defaultCombinators,
                translations: QueryBuilder.defaultTranslations,
                controlElements: undefined,
                getOperators: undefined,
                onQueryChange: function () { },
                controlClassnames: undefined,
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(QueryBuilder, "defaultTranslations", {
        get: function () {
            return {
                fields: {
                    title: 'Fields',
                },
                operators: {
                    title: 'Operators',
                },
                value: {
                    title: 'Value',
                },
                removeRule: {
                    label: 'x',
                    title: 'Remove rule',
                },
                removeGroup: {
                    label: 'x',
                    title: 'Remove group',
                },
                addRule: {
                    label: '+Rule',
                    title: 'Add rule',
                },
                addGroup: {
                    label: '+Group',
                    title: 'Add group',
                },
                combinators: {
                    title: 'Combinators',
                },
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(QueryBuilder, "defaultOperators", {
        get: function () {
            return [
                { name: 'null', label: 'Is Null' },
                { name: 'notNull', label: 'Is Not Null' },
                { name: 'in', label: 'In' },
                { name: 'notIn', label: 'Not In' },
                { name: '=', label: '=' },
                { name: '!=', label: '!=' },
                { name: '<', label: '<' },
                { name: '>', label: '>' },
                { name: '<=', label: '<=' },
                { name: '>=', label: '>=' },
            ];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(QueryBuilder, "defaultCombinators", {
        get: function () {
            return [{ name: 'and', label: 'AND' }, { name: 'or', label: 'OR' }];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(QueryBuilder, "defaultControlClassnames", {
        get: function () {
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
                removeRule: '',
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(QueryBuilder, "defaultControlElements", {
        get: function () {
            return {
                addGroupAction: controls_1.ActionElement,
                removeGroupAction: controls_1.ActionElement,
                addRuleAction: controls_1.ActionElement,
                removeRuleAction: controls_1.ActionElement,
                combinatorSelector: controls_1.ValueSelector,
                fieldSelector: controls_1.ValueSelector,
                operatorSelector: controls_1.ValueSelector,
                valueEditor: controls_1.ValueEditor,
            };
        },
        enumerable: true,
        configurable: true
    });
    QueryBuilder.prototype.componentWillMount = function () {
        var _this = this;
        var _a = this.props, fields = _a.fields, operators = _a.operators, combinators = _a.combinators, controlElements = _a.controlElements, controlClassnames = _a.controlClassnames;
        var classNames = Object.assign({}, QueryBuilder.defaultControlClassnames, controlClassnames);
        var controls = Object.assign({}, QueryBuilder.defaultControlElements, controlElements);
        this.setState({
            root: this.getInitialQuery(),
            schema: {
                classNames: classNames,
                combinators: combinators,
                controls: controls,
                fields: fields,
                operators: operators,
                createRule: this.createRule.bind(this),
                createRuleGroup: this.createRuleGroup.bind(this),
                onRuleAdd: this.notifyQueryChange.bind(this, this.onRuleAdd),
                onGroupAdd: this.notifyQueryChange.bind(this, this.onGroupAdd),
                onRuleRemove: this.notifyQueryChange.bind(this, this.onRuleRemove),
                onGroupRemove: this.notifyQueryChange.bind(this, this.onGroupRemove),
                onPropChange: this.notifyQueryChange.bind(this, this.onPropChange),
                getLevel: this.getLevel.bind(this),
                isRuleGroup: this.isRuleGroup.bind(this),
                getOperators: function (field) { return _this.getOperators(field); },
            },
        });
    };
    QueryBuilder.prototype.getInitialQuery = function () {
        return this.props.query || this.createRuleGroup();
    };
    QueryBuilder.prototype.componentDidMount = function () {
        this.notifyQueryChange(undefined);
    };
    QueryBuilder.prototype.render = function () {
        var _a = this.state, _b = _a.root, id = _b.id, rules = _b.rules, combinator = _b.combinator, schema = _a.schema;
        var translations = this.props.translations;
        return (React.createElement("div", { className: "queryBuilder " + schema.classNames.queryBuilder },
            React.createElement(RuleGroup_1.default, { translations: translations, rules: rules, combinator: combinator, schema: schema, id: id, parentId: null })));
    };
    QueryBuilder.prototype.isRuleGroup = function (rule) {
        return !!(rule.combinator && rule.rules);
    };
    QueryBuilder.prototype.createRule = function () {
        var _a = this.state.schema, fields = _a.fields, operators = _a.operators;
        return {
            id: "r-" + v4_1.default(),
            field: fields[0].name,
            value: '',
            operator: operators[0].name,
        };
    };
    QueryBuilder.prototype.createRuleGroup = function () {
        var combinator = this.props.combinators == null ? '' : this.props.combinators[0].name;
        return {
            combinator: combinator,
            id: "g-" + v4_1.default(),
            rules: [],
        };
    };
    QueryBuilder.prototype.getOperators = function (field) {
        if (this.props.getOperators) {
            var ops = this.props.getOperators(field);
            if (ops) {
                return ops;
            }
        }
        return this.props.operators;
    };
    QueryBuilder.prototype.onRuleAdd = function (rule, parentId) {
        var parent = this.findRule(parentId, this.state.root);
        parent.rules.push(rule);
        this.setState({ root: this.state.root });
    };
    QueryBuilder.prototype.onGroupAdd = function (group, parentId) {
        var parent = this.findRule(parentId, this.state.root);
        parent.rules.push(group);
        this.setState({ root: this.state.root });
    };
    QueryBuilder.prototype.onPropChange = function (prop, value, ruleId) {
        var _a;
        var rule = this.findRule(ruleId, this.state.root);
        Object.assign(rule, (_a = {}, _a[prop] = value, _a));
        this.setState({ root: this.state.root });
    };
    QueryBuilder.prototype.onRuleRemove = function (ruleId, parentId) {
        var parent = this.findRule(parentId, this.state.root);
        var index = parent.rules.findIndex(function (x) { return x.id === ruleId; });
        parent.rules.splice(index, 1);
        this.setState({ root: this.state.root });
    };
    QueryBuilder.prototype.onGroupRemove = function (groupId, parentId) {
        var parent = this.findRule(parentId, this.state.root);
        var index = parent.rules.findIndex(function (x) { return x.id === groupId; });
        parent.rules.splice(index, 1);
        this.setState({ root: this.state.root });
    };
    QueryBuilder.prototype.getLevel = function (id) {
        return this._getLevel(id, 0, this.state.root);
    };
    // tslint:disable-next-line:function-name
    QueryBuilder.prototype._getLevel = function (id, index, root) {
        var _this = this;
        var isRuleGroup = this.state.schema.isRuleGroup;
        var foundAtIndex = -1;
        if (root.id === id) {
            foundAtIndex = index;
        }
        else if (isRuleGroup(root)) {
            root.rules.forEach(function (rule) {
                if (foundAtIndex === -1) {
                    var indexForRule = index;
                    if (isRuleGroup(rule))
                        indexForRule += 1;
                    foundAtIndex = _this._getLevel(id, indexForRule, rule);
                }
            });
        }
        return foundAtIndex;
    };
    QueryBuilder.prototype.findRule = function (id, parent) {
        var isRuleGroup = this.state.schema.isRuleGroup;
        if (parent.id === id) {
            return parent;
        }
        for (var _i = 0, _a = parent.rules; _i < _a.length; _i++) {
            var rule = _a[_i];
            if (rule.id === id) {
                return rule;
            }
            if (isRuleGroup(rule)) {
                var subRule = this.findRule(id, rule);
                if (subRule) {
                    return subRule;
                }
            }
        }
    };
    QueryBuilder.prototype.notifyQueryChange = function (fn) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (fn) {
            fn.call.apply(fn, [this].concat(args));
        }
        var onQueryChange = this.props.onQueryChange;
        if (onQueryChange) {
            var query = deepClone_1.default(this.state.root);
            onQueryChange(query);
        }
    };
    return QueryBuilder;
}(React.Component));
exports.default = QueryBuilder;
//# sourceMappingURL=index.js.map