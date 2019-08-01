import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { IconButton } from '@material-ui/core';

const ActionElement = (props) => {
  const {label, className, handleOnClick, title, icon} = props;

  if(!icon)
    return (
      <Button className={className} title={title} onClick={handleOnClick}>
        {label || ''}
      </Button>
    );
  else
    return (
      <IconButton className={className} title={title} onClick={handleOnClick}>
        {icon}
      </IconButton>
    );
}

ActionElement.displayName = 'ActionElement';

ActionElement.propTypes = {
  label: PropTypes.string,
  className: PropTypes.string,
  handleOnClick: PropTypes.func,
  title: PropTypes.string,
};

export default ActionElement;
