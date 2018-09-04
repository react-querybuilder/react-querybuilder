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
var RuleComponent = /** @class */ (function (_super) {
    __extends(RuleComponent, _super);
    function RuleComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onFieldChanged = function (value) {
            _this.onElementChanged('field', value);
        };
        _this.onOperatorChanged = function (value) {
            _this.onElementChanged('operator', value);
        };
        _this.onValueChanged = function (value) {
            _this.onElementChanged('value', value);
        };
        _this.onElementChanged = function (property, value) {
            var _a = _this.props, id = _a.id, onPropChange = _a.schema.onPropChange;
            onPropChange(property, value, id);
        };
        _this.removeRule = function (event) {
            event.preventDefault();
            event.stopPropagation();
            _this.props.schema.onRuleRemove(_this.props.id, _this.props.parentId);
        };
        return _this;
    }
    Object.defineProperty(RuleComponent, "defaultProps", {
        get: function () {
            return {
                id: null,
                parentId: null,
                field: undefined,
                operator: undefined,
                value: undefined,
                schema: {},
            };
        },
        enumerable: true,
        configurable: true
    });
    RuleComponent.prototype.render = function () {
        var _a = this.props, field = _a.field, operator = _a.operator, value = _a.value, translations = _a.translations, _b = _a.schema, fields = _b.fields, controls = _b.controls, getOperators = _b.getOperators, getLevel = _b.getLevel, classNames = _b.classNames;
        var level = getLevel(this.props.id);
        // --- Handle conditional Translations Prop
        var validField = typeof field === 'string' ? field : 'Field';
        var fieldTitle = translations == null || translations.fields == null
            ? 'Fields'
            : translations.fields.title;
        var operatorsTitle = translations == null || translations.operators == null
            ? 'Operators'
            : translations.operators.title;
        var valueTitle = translations == null || translations.value == null
            ? 'Value'
            : translations.value.title;
        var removeRuleLabel = translations == null || translations.removeRule == null
            ? 'Remove Rule'
            : translations.removeRule.label;
        var removeRuleTitle = translations == null || translations.removeRule == null
            ? 'Remove Rule'
            : translations.removeRule.title;
        return (React.createElement("div", { className: "rule " + classNames.rule },
            React.createElement(controls.fieldSelector, {
                level: level,
                options: fields,
                title: fieldTitle,
                value: field,
                className: "rule-fields " + classNames.fields,
                handleOnChange: this.onFieldChanged,
            }),
            React.createElement(controls.operatorSelector, {
                field: field,
                level: level,
                title: operatorsTitle,
                options: getOperators(validField),
                value: operator,
                className: "rule-operators " + classNames.operators,
                handleOnChange: this.onOperatorChanged,
            }),
            React.createElement(controls.valueEditor, {
                field: field,
                level: level,
                operator: operator,
                value: value,
                title: valueTitle,
                className: "rule-value " + classNames.value,
                handleOnChange: this.onValueChanged,
            }),
            React.createElement(controls.removeRuleAction, {
                level: level,
                label: removeRuleLabel,
                title: removeRuleTitle,
                className: "rule-remove " + classNames.removeRule,
                handleOnClick: this.removeRule,
            })));
    };
    return RuleComponent;
}(React.Component));
exports.default = RuleComponent;
//# sourceMappingURL=index.js.map