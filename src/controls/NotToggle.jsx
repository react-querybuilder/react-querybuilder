import PropTypes from 'prop-types';
import React from 'react';

const NotToggle = ({ className, handleOnChange, title, checked }) => {
  return (
    <label className={className} title={title}>
      <input
        type="checkbox"
        onChange={(e) => handleOnChange(e.target.checked)}
        checked={!!checked}
      />
      Not
    </label>
  );
};

NotToggle.displayName = 'NotToggle';

NotToggle.propTypes = {
  className: PropTypes.string,
  handleOnChange: PropTypes.func,
  title: PropTypes.string,
  checked: PropTypes.bool
};

export default NotToggle;
