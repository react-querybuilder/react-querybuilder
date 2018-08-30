"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
function ActionElement(props) {
    var label = props.label, className = props.className, handleOnClick = props.handleOnClick, title = props.title;
    return (React.createElement("button", { className: className, title: title, onClick: function (e) { return handleOnClick(e); } }, label));
}
ActionElement['displayName'] = 'ActionElement';
exports.default = ActionElement;
//# sourceMappingURL=index.js.map