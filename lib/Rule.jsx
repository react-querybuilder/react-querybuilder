import React from 'react';
import ValueEditor from './controls/ValueEditor';
import ValueSelector from './controls/ValueSelector';

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

                <ValueSelector options={fields}
                               value={field}
                               className={`rule-fields ${classNames.fields}`}
                               handleOnChange={this.onValueChanged.bind(this, 'field')}>
                    {controls.fieldSelector}
                </ValueSelector>
                <ValueSelector options={getOperators(field)}
                               value={operator}
                               className={`rule-operators ${classNames.operators}`}
                               handleOnChange={this.onValueChanged.bind(this, 'operator')}>
                    {controls.operatorSelector}
                </ValueSelector>

                <ValueEditor field={field}
                             operator={operator}
                             value={value}
                             handleOnChange={this.onValueChanged.bind(this, 'value')}>
                    {controls.valueEditor}
                </ValueEditor>

                <button className={`rule-remove ${classNames.removeRule}`}
                        onClick={event=>this.removeRule(event)}>x
                </button>
            </div>
        );
    }

    onValueChanged(field, value) {
        const {id, schema: {onPropChange}} = this.props;

        onPropChange(field, value, id);
    }

    removeRule(event) {
        event.preventDefault();
        event.stopPropagation();

        this.props.schema.onRuleRemove(this.props.id, this.props.parentId);
    }


}
