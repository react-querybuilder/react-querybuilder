import * as React from 'react';
import { Rule, RuleGroup, Schema, Translations } from '../types';
// tslint:disable-next-line:import-name
import RuleComponent from '../Rule';
// --- Helpers
function findTranslationProp(
  fieldName: string,
  prop: string,
  translations?: Translations,
): string {
  if (translations == null) return fieldName;

  if (translations[fieldName] != null) {
    return translations[fieldName][prop];
  }

  return fieldName;
}

// --- Component Props
interface RuleGroupProps {
  id: string | null;
  parentId: string | null;
  rules: (Rule | RuleGroup)[];
  combinator: string;
  schema: Schema;
  translations?: Translations;
}

class RuleGroupComponent extends React.Component<RuleGroupProps, {}> {
  static get defaultProps(): RuleGroupProps {
    return {
      id: null,
      parentId: null,
      rules: [],
      combinator: 'and',
      schema: {} as Schema, // This is baaaad. Fix.
    };
  }

  render(): JSX.Element {
    const {
      combinator,
      rules,
      translations,
      schema: { combinators, controls, isRuleGroup, getLevel, classNames },
    } = this.props;
    const level = getLevel(this.props.id);
    return (
      <div className={`ruleGroup ${classNames.ruleGroup}`}>
        {React.createElement(controls.combinatorSelector, {
          rules,
          level,
          options: combinators,
          value: combinator,
          title: findTranslationProp('combinators', 'title', translations),
          className: `ruleGroup-combinators ${classNames.combinators}`,
          handleOnChange: this.onCombinatorChange,
        })}
        {React.createElement(controls.addRuleAction, {
          rules,
          level,
          label: findTranslationProp('addRule', 'label', translations),
          title: findTranslationProp('addRule', 'title', translations),
          className: `ruleGroup-addRule ${classNames.addRule}`,
          handleOnClick: this.addRule,
        })}
        {React.createElement(controls.addGroupAction, {
          rules,
          level,
          label: findTranslationProp('addGroup', 'label', translations),
          title: findTranslationProp('addGroup', 'title', translations),
          className: `ruleGroup-addGroup ${classNames.addGroup}`,
          handleOnClick: this.addGroup,
        })}
        {this.hasParentGroup()
          ? React.createElement(controls.removeGroupAction, {
            rules,
            level,
            label: findTranslationProp('removeGroup', 'label', translations),
            title: findTranslationProp('removeGroup', 'title', translations),
            className: `ruleGroup-remove ${classNames.removeGroup}`,
            handleOnClick: this.removeGroup,
          })
          : null}
        {rules.map((r) => {
          return isRuleGroup(r) ? (
            <RuleGroupComponent
              key={r.id}
              id={r.id}
              schema={this.props.schema}
              parentId={this.props.id}
              combinator={r.combinator}
              translations={this.props.translations}
              rules={r.rules}
            />
          ) : (
            <RuleComponent
              key={r.id}
              id={r.id}
              field={r.field}
              value={r.value}
              operator={r.operator}
              schema={this.props.schema}
              parentId={this.props.id}
              translations={this.props.translations}
            />
          );
        })}
      </div>
    );
  }

  hasParentGroup(): boolean {
    return !!this.props.parentId;
  }

  onCombinatorChange = (value: any): void => {
    const { onPropChange } = this.props.schema;

    onPropChange('combinator', value, this.props.id);
  }

  addRule = (event: Event): void => {
    event.preventDefault();
    event.stopPropagation();

    const { createRule, onRuleAdd } = this.props.schema;

    const newRule = createRule();
    onRuleAdd(newRule, this.props.id);
  }

  addGroup = (event: Event): void => {
    event.preventDefault();
    event.stopPropagation();

    const { createRuleGroup, onGroupAdd } = this.props.schema;
    const newGroup = createRuleGroup();
    onGroupAdd(newGroup, this.props.id);
  }

  removeGroup = (event: Event): void => {
    event.preventDefault();
    event.stopPropagation();

    this.props.schema.onGroupRemove(this.props.id, this.props.parentId);
  }
}

export default RuleGroupComponent;
