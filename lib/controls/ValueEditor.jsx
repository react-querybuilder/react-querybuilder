import React from 'react';

export default class ValueEditor extends React.Component {
  static get propTypes() {
    return {
      field: React.PropTypes.string,
      operator: React.PropTypes.string,
      handleOnChange: React.PropTypes.func
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      value: ''
    }
  }

  render() {
    const {field, operator, children, handleOnChange} = this.props;

    if (operator === 'null' || operator === 'notNull') {
      return null;
    }

    return (children ?
      React.cloneElement(children, {
        field: field,
        operator: operator,
        handleOnChange: handleOnChange
      }) : this._defaultValueEditor()
    );

  }

  _defaultValueEditor() {
    return (
      <input type="text"
             value={this.state.value}
             onChange={e=>this._handleOnChange(e.target.value)} />
    );
  }

  _handleOnChange(value) {
    this.setState({value: value});
    this.props.handleOnChange(value);
  }
}
