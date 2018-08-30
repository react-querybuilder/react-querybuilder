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
// --- Helpers
function findTranslationProp(fieldName, prop, translations) {
    if (translations == null)
        return fieldName;
    if (translations[fieldName] != null) {
        return translations[fieldName][prop];
    }
    return fieldName;
}
var RuleGroupComponent = /** @class */ (function (_super) {
    __extends(RuleGroupComponent, _super);
    function RuleGroupComponent() {
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
    Object.defineProperty(RuleGroupComponent, "defaultProps", {
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
    RuleGroupComponent.prototype.render = function () {
        var _this = this;
        var _a = this.props, combinator = _a.combinator, rules = _a.rules, translations = _a.translations, _b = _a.schema, combinators = _b.combinators, controls = _b.controls, onRuleRemove = _b.onRuleRemove, isRuleGroup = _b.isRuleGroup, getLevel = _b.getLevel, classNames = _b.classNames;
        var level = getLevel(this.props.id);
        return (React.createElement("div", { className: "ruleGroup " + classNames.ruleGroup },
            React.createElement(controls.combinatorSelector, {
                options: combinators,
                value: combinator,
                title: findTranslationProp('combinators', 'title', translations),
                className: "ruleGroup-combinators " + classNames.combinators,
                handleOnChange: this.onCombinatorChange,
                rules: rules,
                level: level,
            }),
            React.createElement(controls.addRuleAction, {
                label: findTranslationProp('addRule', 'label', translations),
                title: findTranslationProp('addRule', 'title', translations),
                className: "ruleGroup-addRule " + classNames.addRule,
                handleOnClick: this.addRule,
                rules: rules,
                level: level,
            }),
            React.createElement(controls.addGroupAction, {
                label: findTranslationProp('addGroup', 'label', translations),
                title: findTranslationProp('addGroup', 'title', translations),
                className: "ruleGroup-addGroup " + classNames.addGroup,
                handleOnClick: this.addGroup,
                rules: rules,
                level: level,
            }),
            this.hasParentGroup()
                ? React.createElement(controls.removeGroupAction, {
                    label: findTranslationProp('removeGroup', 'label', translations),
                    title: findTranslationProp('removeGroup', 'title', translations),
                    className: "ruleGroup-remove " + classNames.removeGroup,
                    handleOnClick: this.removeGroup,
                    rules: rules,
                    level: level,
                })
                : null,
            rules.map(function (r) {
                return isRuleGroup(r) ? (React.createElement(RuleGroupComponent, { key: r.id, id: r.id, schema: _this.props.schema, parentId: _this.props.id, combinator: r.combinator, translations: _this.props.translations, rules: r.rules })) : (React.createElement(Rule_1.default, { key: r.id, id: r.id, field: r.field, value: r.value, operator: r.operator, schema: _this.props.schema, parentId: _this.props.id, translations: _this.props.translations, onRuleRemove: onRuleRemove }));
            })));
    };
    RuleGroupComponent.prototype.hasParentGroup = function () {
        return this.props.parentId;
    };
    return RuleGroupComponent;
}(React.Component));
exports.default = RuleGroupComponent;
//# sourceMappingURL=index.js.map