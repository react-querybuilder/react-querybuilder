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
                field: null,
                operator: null,
                value: null,
                schema: null,
            };
        },
        enumerable: true,
        configurable: true
    });
    RuleComponent.prototype.render = function () {
        var _a = this.props, field = _a.field, operator = _a.operator, value = _a.value, translations = _a.translations, _b = _a.schema, fields = _b.fields, controls = _b.controls, getOperators = _b.getOperators, getLevel = _b.getLevel, classNames = _b.classNames;
        var level = getLevel(this.props.id);
        return (React.createElement("div", { className: "rule " + classNames.rule },
            React.createElement(controls.fieldSelector, {
                options: fields,
                title: translations.fields.title,
                value: field,
                className: "rule-fields " + classNames.fields,
                handleOnChange: this.onFieldChanged,
                level: level,
            }),
            React.createElement(controls.operatorSelector, {
                field: field,
                title: translations.operators.title,
                options: getOperators(field),
                value: operator,
                className: "rule-operators " + classNames.operators,
                handleOnChange: this.onOperatorChanged,
                level: level,
            }),
            React.createElement(controls.valueEditor, {
                field: field,
                title: translations.value.title,
                operator: operator,
                value: value,
                className: "rule-value " + classNames.value,
                handleOnChange: this.onValueChanged,
                level: level,
            }),
            React.createElement(controls.removeRuleAction, {
                label: translations.removeRule.label,
                title: translations.removeRule.title,
                className: "rule-remove " + classNames.removeRule,
                handleOnClick: this.removeRule,
                level: level,
            })));
    };
    return RuleComponent;
}(React.Component));
exports.default = RuleComponent;
//# sourceMappingURL=index.js.map