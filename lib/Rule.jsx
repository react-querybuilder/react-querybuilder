import React from 'react';

export default class Rule extends React.Component {
    static get defaultProps() {
        return {
            id: null,
            parentId: null,
            field: null,
            operator: null,
            value: null,
            schema: null
        };
    }

    render() {
        const {field, operator, value, schema: {fields, operators, controls, getOperators, classNames}} = this.props;
        return (
            <div className={`rule ${classNames.rule}`}>
                {
                    React.createElement(controls.fieldSelector,
                        {
                            options: fields,
                            value: field,
                            className: `rule-fields ${classNames.fields}`,
                            handleOnChange: this.onFieldChanged
                        }
                    )
                }
                {
                    React.createElement(controls.operatorSelector,
                        {
                            options: getOperators(field),
                            value: operator,
                            className: `rule-operators ${classNames.operators}`,
                            handleOnChange: this.onOperatorChanged
                        }
                    )
                }
                {
                    React.createElement(controls.valueEditor,
                        {
                            field: field,
                            operator: operator,
                            value: value,
                            handleOnChange: this.onValueChanged
                        }
                    )
                }
                {
                    React.createElement(controls.removeRuleAction,
                    {
                        label: 'x',
                        className: `rule-remove ${classNames.removeRule}`,
                        handleOnClick: this.removeRule
                    })
                }
            </div>
        );
    }

    onFieldChanged = (value) => {
        this.onElementChanged('field', value);
    }

    onOperatorChanged = (value) => {
        this.onElementChanged('operator', value);
    }

    onValueChanged = (value) => {
        this.onElementChanged('value', value);
    }

    onElementChanged = (property, value) => {
        const {id, schema: {onPropChange}} = this.props;

        onPropChange(property, value, id);
    }

    removeRule = (event) => {
        event.preventDefault();
        event.stopPropagation();

        this.props.schema.onRuleRemove(this.props.id, this.props.parentId);
    }


}
