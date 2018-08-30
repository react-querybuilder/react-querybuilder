"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var ValueSelector = function (props) {
    _this.displayName = 'ValueSelector';
    var value = props.value, options = props.options, className = props.className, handleOnChange = props.handleOnChange, title = props.title;
    return (React.createElement("select", { className: className, value: value, title: title, onChange: function (e) { return handleOnChange(e.target.value); } }, options.map(function (option) {
        return (React.createElement("option", { key: option.id || option.name, value: option.name }, option.label));
    })));
};
exports.default = ValueSelector;
//# sourceMappingURL=index.js.map