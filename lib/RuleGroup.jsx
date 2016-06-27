import React from 'react';
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
        const {combinator, rules, schema: {combinators, onRuleRemove, isRuleGroup, classNames}} = this.props;
        return (
            <div className={`ruleGroup ${classNames.ruleGroup}`}>
                <select className={`ruleGroup-combinators ${classNames.combinators}`}
                        value={combinator}
                        onChange={event=>this.onCombinatorChange(event.target.value)}>
                        {
                            combinators.map(c=> {
                                return (<option key={c.name} value={c.name}>{c.label}</option>);
                            })
                        }
                </select>

                <button className={`ruleGroup-addRule ${classNames.addRule}`}
                        onClick={event=>this.addRule(event)}>
                    +Rule
                </button>
                <button className={`ruleGroup-addGroup ${classNames.addGroup}`}
                        onClick={event=>this.addGroup(event)}>
                    +Group
                </button>
                 {
                     (this.props.parentId)
                         ? <button className={`ruleGroup-remove ${classNames.removeGroup}`}
                                   onClick={event=>this.removeGroup(event, this.props.id)}>x</button>
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

    addRule(event) {
        event.preventDefault();
        event.stopPropagation();

        const {createRule, onRuleAdd} = this.props.schema;

        const newRule = createRule();
        onRuleAdd(newRule, this.props.id)
    }

    addGroup(event) {
        event.preventDefault();
        event.stopPropagation();

        const {createRuleGroup, onGroupAdd} = this.props.schema;
        const newGroup = createRuleGroup();
        onGroupAdd(newGroup, this.props.id)
    }

    removeGroup(event, groupId) {
        event.preventDefault();
        event.stopPropagation();

        this.props.schema.onGroupRemove(groupId, this.props.parentId);
    }


}
