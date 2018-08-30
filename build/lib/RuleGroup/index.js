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
var React = require("react");
var Rule_1 = require("../Rule");
var RuleGroup = /** @class */ (function (_super) {
    __extends(RuleGroup, _super);
    function RuleGroup() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onCombinatorChange = function (value) {
            var onPropChange = _this.props.schema.onPropChange;
            onPropChange('combinator', value, _this.props.id);
        };
        _this.addRule = function (event) {
            event.preventDefault();
            event.stopPropagation();
            var _a = _this.props.schema, createRule = _a.createRule, onRuleAdd = _a.onRuleAdd;
            var newRule = createRule();
            onRuleAdd(newRule, _this.props.id);
        };
        _this.addGroup = function (event) {
            event.preventDefault();
            event.stopPropagation();
            var _a = _this.props.schema, createRuleGroup = _a.createRuleGroup, onGroupAdd = _a.onGroupAdd;
            var newGroup = createRuleGroup();
            onGroupAdd(newGroup, _this.props.id);
        };
        _this.removeGroup = function (event) {
            event.preventDefault();
            event.stopPropagation();
            _this.props.schema.onGroupRemove(_this.props.id, _this.props.parentId);
        };
        return _this;
    }
    Object.defineProperty(RuleGroup, "defaultProps", {
        get: function () {
            return {
                id: null,
                parentId: null,
                rules: [],
                combinator: 'and',
                schema: {},
            };
        },
        enumerable: true,
        configurable: true
    });
    RuleGroup.prototype.render = function () {
        var _this = this;
        var _a = this.props, combinator = _a.combinator, rules = _a.rules, translations = _a.translations, _b = _a.schema, combinators = _b.combinators, controls = _b.controls, onRuleRemove = _b.onRuleRemove, isRuleGroup = _b.isRuleGroup, getLevel = _b.getLevel, classNames = _b.classNames;
        var level = getLevel(this.props.id);
        return (React.createElement("div", { className: "ruleGroup " + classNames.ruleGroup },
            React.createElement(controls.combinatorSelector, {
                options: combinators,
                value: combinator,
                title: translations.combinators.title,
                className: "ruleGroup-combinators " + classNames.combinators,
                handleOnChange: this.onCombinatorChange,
                rules: rules,
                level: level,
            }),
            React.createElement(controls.addRuleAction, {
                label: translations.addRule.label,
                title: translations.addRule.title,
                className: "ruleGroup-addRule " + classNames.addRule,
                handleOnClick: this.addRule,
                rules: rules,
                level: level,
            }),
            React.createElement(controls.addGroupAction, {
                label: translations.addGroup.label,
                title: translations.addGroup.title,
                className: "ruleGroup-addGroup " + classNames.addGroup,
                handleOnClick: this.addGroup,
                rules: rules,
                level: level,
            }),
            this.hasParentGroup()
                ? React.createElement(controls.removeGroupAction, {
                    label: translations.removeGroup.label,
                    title: translations.removeGroup.title,
                    className: "ruleGroup-remove " + classNames.removeGroup,
                    handleOnClick: this.removeGroup,
                    rules: rules,
                    level: level,
                })
                : null,
            rules.map(function (r) {
                return isRuleGroup(r) ? (React.createElement(RuleGroup, { key: r.id, id: r.id, schema: _this.props.schema, parentId: _this.props.id, combinator: r.combinator, translations: _this.props.translations, rules: r.rules })) : (React.createElement(Rule_1.default, { key: r.id, id: r.id, field: r.field, value: r.value, operator: r.operator, schema: _this.props.schema, parentId: _this.props.id, translations: _this.props.translations, onRuleRemove: onRuleRemove }));
            })));
    };
    RuleGroup.prototype.hasParentGroup = function () {
        return this.props.parentId;
    };
    return RuleGroup;
}(React.Component));
exports.default = RuleGroup;
//# sourceMappingURL=index.js.map