import React from 'react';
import PropTypes from 'prop-types';

export default class ActionElement extends React.Component {
  static get propTypes() {
    return {
      label: PropTypes.string,
      className: PropTypes.string,
      handleOnClick: PropTypes.func
    }
  }

  constructor(props) {
    super(props);
  }

  render() {
    const {label, className, handleOnClick} = this.props;

    return (
      <button className={className}
              onClick={e=>handleOnClick(e)}>
        {label}
      </button>
    );
  }
}
