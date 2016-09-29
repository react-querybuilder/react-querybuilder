import React from 'react';

export default class ValueSelector extends React.Component {
  static get propTypes() {
    return {
      value: React.PropTypes.string,
      options: React.PropTypes.array.isRequired,
      className: React.PropTypes.string,
      handleOnChange: React.PropTypes.func
    }
  }

  constructor(props) {
    super(props);
  }

  render() {
    const {value, options, className, handleOnChange, children} = this.props;

    return (children ?
      React.cloneElement(children,
        {
          value: value,
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
              value={this.props.value}
              onChange={e=>this.props.handleOnChange(e.target.value)}>
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
}
