import React from "react";
import PropTypes from "prop-types";

const ActionElement = props => {
  const { label, className, handleOnClick, title } = props;

  return (
    <button className={className} title={title} onClick={e => handleOnClick(e)}>
      {label}
    </button>
  );
};

ActionElement.displayName = "ActionElement";

ActionElement.propTypes = {
  label: PropTypes.string,
  className: PropTypes.string,
  handleOnClick: PropTypes.func,
  title: PropTypes.string
};

export default ActionElement;
