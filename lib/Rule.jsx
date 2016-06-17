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
        const {field, operator, value, schema: {fields, operators, getEditor}} = this.props;

        return (
            <div className="QueryBuilder-rule">
                <select value={field}
                        onChange={event=>this.onValueChanged('field', event.target.value)}>
                        {
                            fields.map(field=> {
                                return (
                                    <option key={field.name} value={field.name}>{field.label}</option>
                                );
                            })
                        }
                </select>
                <select value={operator}
                        onChange={event=>this.onValueChanged('operator', event.target.value)}>
                        {
                            operators.map(op=> {
                                return (
                                    <option value={op.name} key={op.name}>{op.label}</option>
                                );
                            })
                        }
                </select>

                 {
                     getEditor({
                         field,
                         value,
                         operator,
                         onChange: value=>this.onValueChanged('value', value)
                     })
                 }

                <button onClick={()=>this.removeRule()}>x</button>
            </div>
        );
    }

    onValueChanged(field, value) {
        const {id, schema: {onPropChange}} = this.props;

        onPropChange(field, value, id);
    }

    removeRule() {
        this.props.schema.onRuleRemove(this.props.id, this.props.parentId);
    }


}
