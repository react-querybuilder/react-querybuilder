import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';

const ActionElement = (props) => {
  const { icon, label, className, handleOnClick } = props;

  return (
    <Button className={className} onClick={(e) => handleOnClick(e)}>
      {label}
    </Button>
  );
};

ActionElement.displayName = 'ActionElement';

ActionElement.propTypes = {
  label: PropTypes.string,
  className: PropTypes.string,
  handleOnClick: PropTypes.func,
  title: PropTypes.string
};

export default ActionElement;
