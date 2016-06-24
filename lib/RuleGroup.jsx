import Rule from './Rule';

export default class RuleGroup extends React.Component {
    static get defaultProps() {
        return {
            id: null,
            parentId: null,
            rules: [],
            combinator: 'and',
            schema: {},
        };
    }

    render() {
        const {combinator, rules, schema: {combinators, onRuleRemove, isRuleGroup}} = this.props;
        return (
            <div className="QueryBuilder-ruleGroup">
                <select className="RuleGroup-combinators"
                        value={combinator}
                        onChange={event=>this.onCombinatorChange(event.target.value)}>
                        {
                            combinators.map(c=> {
                                return (<option key={c.name} value={c.name}>{c.label}</option>);
                            })
                        }
                </select>

                <button className="RuleGroup-addRule"
                        onClick={()=>this.addRule()}>
                    +Rule
                </button>
                <button className="RuleGroup-addGroup"
                        onClick={()=>this.addGroup()}>
                    +Group
                </button>
                 {
                     (this.props.parentId)
                         ? <button className="RuleGroup-remove"
                                   onClick={()=>this.removeGroup(this.props.id)}>x</button>
                         : null
                 }
                 {
                     rules.map(r=> {
                         return (
                             isRuleGroup(r)
                                 ? <RuleGroup key={r.id}
                                              id={r.id}
                                              schema={this.props.schema}
                                              parentId={this.props.id}
                                              combinator={r.combinator}
                                              rules={r.rules}/>
                                 : <Rule key={r.id}
                                         id={r.id}
                                         field={r.field}
                                         value={r.value}
                                         operator={r.operator}
                                         schema={this.props.schema}
                                         parentId={this.props.id}
                                         onRuleRemove={onRuleRemove}/>
                         );
                     })
                 }
            </div>
        );
    }

    onCombinatorChange(value) {
        const {onPropChange} = this.props.schema;

        onPropChange('combinator', value, this.props.id);
    }

    addRule() {
        const {createRule, onRuleAdd} = this.props.schema;

        const newRule = createRule();
        onRuleAdd(newRule, this.props.id)
    }

    addGroup() {
        const {createRuleGroup, onGroupAdd} = this.props.schema;
        const newGroup = createRuleGroup();
        onGroupAdd(newGroup, this.props.id)
    }

    removeGroup(groupId) {
        this.props.schema.onGroupRemove(groupId, this.props.parentId);
    }


}
