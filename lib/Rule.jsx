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
        const {field, operator, value, schema: {fields, operators}} = this.props;

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
                <input type="text"
                       value={value}
                       onChange={event=>this.onValueChanged('value', event.target.value)}/>

                <button onClick={()=>this.removeRule()}>x</button>
            </div>
        );
    }

    onValueChanged(field, value) {
    }

    removeRule() {
        this.props.schema.onRuleRemove(this.props.id, this.props.parentId);
    }


}
