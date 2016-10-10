import React from 'react';

export default class ActionElement extends React.Component {
  static get propTypes() {
    return {
      label: React.PropTypes.string,
      className: React.PropTypes.string,
      handleOnClick: React.PropTypes.func
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
