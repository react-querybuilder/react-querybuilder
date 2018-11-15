import '../src/query-builder.scss';
import QueryBuilder from '../src/index';
import ReactDOM from "react-dom";
import React from 'react';

class RootView extends React.Component {
  constructor(props) {
    super(props);
    this.controlElements = {
        /*
         * addRuleAction: {},
         * combinatorSelector: {},
         * fieldSelector: {},
         * operatorSelector: {},
         * removeGroupAction: {},
         * removeRuleAction: {
         * },
         */
        removeGroupAction: this.removeEditor({ type: 'group' }),
        removeRuleAction: this.removeEditor({ type: 'rule' }),
        valueEditor: this.customValueEditor()
      }
    this.state = {
      fields: [
        { name: 'firstName', label: 'First Name' },
        { name: 'lastName', label: 'Last Name' },
        { name: 'age', label: 'Age' },
        { name: 'address', label: 'Address' },
        { name: 'phone', label: 'Phone' },
        { name: 'email', label: 'Email' },
        { name: 'twitter', label: 'Twitter' },
        { name: 'isDev', label: 'Is a Developer?', value: false }
      ],
      query: {
        combinator: 'and',
        id: 'g-e4af2c13-a801-46dc-8e0c-bef3fde396be',
        rules: [
          {
            customRules: {
              isOldValue: false
            },
            field: 'firstName',
            id: 'r-8b2f0dbf-47a7-422c-bf26-aa4f281ee1ee',
            operator: 'null',
            value: 'firstName'
          }
        ]
      }
    };
  }

   isRuleGroup(rule) {
    return !!(rule.combinator && rule.rules);
  }

   findRule(id, parent) {
    if (parent.id === id) {
      return parent;
    }
    if (parent.rules) {
      for (const rule of parent.rules) {
        if (rule.id === id) {
          return rule;
        } else if (this.isRuleGroup(rule)) {
          const subRule = this.findRule(id, rule);
          if (subRule) {
            return subRule;
          }
        }
      }
    }
  }

   logQuery = (query) => {
    this.setState({ query });
  }

   onOldValueSelect = (
    event,
    rule
  ) => {
    event.persist();
    const targetRule  = this.findRule(rule.id, this.state.query);
    Object.assign(targetRule.customRules, {isOldValue: event.target.checked});
    this.setState({});
  }

   customValueEditor() {
    return (props) => {      
      return (
        <span>
          <select
            value={props.value}
            onChange={e => props.handleOnChange(e.target.value)}
            className="rule-fields"
            title="Fields"
          >
            <option value="">Select</option>
            <option value="firstName">First Name</option>
            <option value="lastName">Last Name</option>
            <option value="age">Age</option>
            <option value="address">Address</option>
            <option value="phone">Phone</option>
            <option value="email">Email</option>
            <option value="twitter">Twitter</option>
            <option value="isDev">Is a Developer?</option>
          </select>
          <input
            value={props.value}
            type="text"
            onChange={e => props.handleOnChange(e.target.value)}
          />
          <div className="checkbox">
            <label style={{ fontSize: '1em' }}>
              <input
                type="checkbox"
                checked={props.customRules ? true === props.customRules.isOldValue : false}
                onChange={(event) =>
                  this.onOldValueSelect(event, props)
                }
              />
              Is Oldvalue
            </label>
          </div>
        </span>
      );
    };
  }

   removeEditor(editorProps) {
    return (props) => {
      return (
        <span
          className={`${props.className} fa fa-trash cursor-pointer`}
          title={`Delete ${editorProps.type}!`}
          onClick={props.handleOnClick}
        />
      );
    };
  }

   render() {
    return (
      <div>
        <QueryBuilder
          fields={this.state.fields}
          controlElements={this.controlElements}
          customRules={{
            isOldValue: false
          }}
          controlClassnames={{
            addGroup: 'rule-btn',
            addRule: 'rule-btn',
            combinators: 'rule-combinator',
            fields: '',
            operators: '',
            queryBuilder: '',
            removeGroup: 'pl-10',
            removeRule: 'pl-10',
            rule: 'rule',
            ruleGroup: 'rule-group',
            value: ''
          }}
          translations={{
            addGroup: {
              label: '+ Group',
              title: 'Add group'
            },
            addRule: {
              label: '+ Rule',
              title: 'Add rule'
            },
            combinators: {
              title: 'combinators'
            },
            fields: {
              title: 'fields'
            },
            operators: {
              title: 'operators'
            },
            removeGroup: {
              label: '',
              title: 'removeGroup'
            },
            removeRule: {
              label: '',
              title: 'removeRule'
            },
            value: {
              title: 'value'
            }
          }}
          query={this.state.query}
          onQueryChange={this.logQuery}
        />
        <div className="shrink query-log scroll">
          <h4>Query</h4>
          <pre>{JSON.stringify(this.state.query, null, 2)}</pre>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<RootView />, document.querySelector('.container'));

