import uniqueId from 'uuid/v4';
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@material-ui/core';
import classNames from 'classnames'

const CombinatorSelector = (props) => {
    const { value, options, className, handleOnChange, title } = props;

    const onChangeBinder = (value) => {
        handleOnChange(value)
    }

    return (
        <div className={className}>
            <Button
                className={classNames(
                    "andButton",
                    {'toggle' : value === options[0].name}
                )}
                onClick={onChangeBinder.bind(this, options[0].name)}
            >
                AND
        </Button>
            <Button
                className={classNames(
                    "orButton",
                    {'toggle' : value === options[1].name}
                )}
                onClick={onChangeBinder.bind(this, options[1].name)}
            >
                OR
        </Button>
        </div>

    );
}

CombinatorSelector.displayName = 'CombinatorSelector';

CombinatorSelector.propTypes = {
    value: PropTypes.string,
    options: PropTypes.array.isRequired,
    className: PropTypes.string,
    handleOnChange: PropTypes.func,
    title: PropTypes.string,
};

export default CombinatorSelector;
