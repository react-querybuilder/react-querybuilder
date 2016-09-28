import React from 'react';
import ValueEditor from './controls/ValueEditor';

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
                <select className={`rule-fields ${classNames.fields}`}
                        value={field}
                        onChange={event=>this.onValueChanged('field', event.target.value)}>
                        {
                            fields.map(field=> {
                                return (
                                    <option key={field.name} value={field.name}>{field.label}</option>
                                );
                            })
                        }
                </select>
                <select className={`rule-operators ${classNames.operators}`}
                        value={operator}
                        onChange={event=>this.onValueChanged('operator', event.target.value)}>
                        {
                            getOperators(field).map(op=> {
                                return (
                                    <option value={op.name} key={op.name}>{op.label}</option>
                                );
                            })
                        }
                </select>

                <ValueEditor field={field}
                             operator={operator}
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
