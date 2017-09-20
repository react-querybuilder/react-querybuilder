import React from 'react';
import PropTypes from 'prop-types';

const ActionElement = (props) => {
  const {label, className, handleOnClick} = props;

  return (
    <button className={className}
            onClick={e=>handleOnClick(e)}>
      {label}
    </button>
  );
}

ActionElement.displayName = 'ActionElement';

ActionElement.propTypes = {
  label: PropTypes.string,
  className: PropTypes.string,
  handleOnClick: PropTypes.func
};

export default ActionElement;
