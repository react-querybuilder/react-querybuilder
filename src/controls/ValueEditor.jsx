import React from 'react';
import PropTypes from 'prop-types';
import setHours from "date-fns";
import setMinutes from "date-fns";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

const ValueEditor = ({
  operator,
  value,
  handleOnChange,
  title,
  className,
  type,
  inputType,
  values
}) => {
  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  switch (type) {
    case 'select':
      return (
        <select
          className={className}
          title={title}
          onChange={(e) => handleOnChange(e.target.value)}
          value={value}>
          {values.map((v) => (
            <option key={v.name} value={v.name}>
              {v.label}
            </option>
          ))}
        </select>
      );

    case 'datetime':
      return (
          <DatePicker
              selected={setHours(setMinutes(new Date(), 30), 16)}
              onChange={(e) => handleOnChange(e)}
              showTimeSelect
              className={className}
              timeFormat="HH:mm"
              injectTimes={[
                setHours(setMinutes(new Date(), 1), 0),
                setHours(setMinutes(new Date(), 59), 23)
              ]}
              dateFormat="MMMM d, yyyy h:mm aa"
              value={value}
          />
      );

    case 'checkbox':
      return (
        <input
          type="checkbox"
          className={className}
          title={title}
          onChange={(e) => handleOnChange(e.target.checked)}
          checked={!!value}
        />
      );

    case 'radio':
      return (
        <span className={className} title={title}>
          {values.map((v) => (
            <label key={v.name}>
              <input
                type="radio"
                value={v.name}
                checked={value === v.name}
                onChange={(e) => handleOnChange(e.target.value)}
              />
              {v.label}
            </label>
          ))}
        </span>
      );

    default:
      return (
        <input
          type={inputType || 'text'}
          value={value}
          title={title}
          className={className}
          onChange={(e) => handleOnChange(e.target.value)}
        />
      );
  }
};

ValueEditor.displayName = 'ValueEditor';

ValueEditor.propTypes = {
  field: PropTypes.string,
  operator: PropTypes.string,
  value: PropTypes.any,
  handleOnChange: PropTypes.func,
  title: PropTypes.string,
  className: PropTypes.string,
  type: PropTypes.oneOf(['select', 'checkbox', 'radio', 'text', 'datetime']),
  inputType: PropTypes.string,
  values: PropTypes.arrayOf(PropTypes.object)
};

export default ValueEditor;
