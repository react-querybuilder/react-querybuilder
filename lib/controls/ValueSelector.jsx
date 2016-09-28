import React from 'react';

export default class ValueSelector extends React.Component {
  static get propTypes() {
    return {
      options: React.PropTypes.array.isRequired,
      className: React.PropTypes.string,
      handleOnChange: React.PropTypes.func
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      value: ''
    }
  }

  render() {
    const {options, className, handleOnChange, children} = this.props;

    return (children ?
      React.cloneElement(children,
        {
          options: options,
          className: className,
          handleOnChange: handleOnChange
        }
      ) : this._defaultValueSelector()
    );
  }

  _defaultValueSelector() {
    return (
      <select className={this.props.className}
              value={this.state.value}
              onChange={e=>this._handleOnChange(e.target.value)}>
        {
          this.props.options.map(option=> {
            return (
              <option key={option.name} value={option.name}>{option.label}</option>
            );
          })
        }
      </select>
    );
  }

  _handleOnChange(value) {
    this.setState({value: value});
    this.props.handleOnChange(value);
  }
}
