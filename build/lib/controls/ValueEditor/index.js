"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var ValueEditor = function (props) {
    _this.displayName = 'ValueEditor';
    var operator = props.operator, value = props.value, handleOnChange = props.handleOnChange, title = props.title;
    if (operator === 'null' || operator === 'notNull') {
        return null;
    }
    return (React.createElement("input", { type: "text", value: value, title: title, onChange: function (e) { return handleOnChange(e.target.value); } }));
};
exports.default = ValueEditor;
//# sourceMappingURL=index.js.map