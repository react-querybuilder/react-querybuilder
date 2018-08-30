"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ActionElement = function (props) {
    _this.displayName = 'ActionElement';
    var label = props.label, className = props.className, handleOnClick = props.handleOnClick, title = props.title;
    return (react_1.default.createElement("button", { className: className, title: title, onClick: function (e) { return handleOnClick(e); } }, label));
};
exports.default = ActionElement;
//# sourceMappingURL=index.js.map