import React from 'react';
import Rule from './Rule';

const RuleGroup = (props) => {
  const hasParentGroup = () => {
    return props.parentId;
  };

  const onCombinatorChange = (value) => {
    const { onPropChange } = props.schema;

    onPropChange('combinator', value, props.id);
  };

  const addRule = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const { createRule, onRuleAdd } = props.schema;

    const newRule = createRule();
    onRuleAdd(newRule, props.id);
  };

  const addGroup = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const { createRuleGroup, onGroupAdd } = props.schema;
    const newGroup = createRuleGroup();
    onGroupAdd(newGroup, props.id);
  };

  const removeGroup = (event) => {
    event.preventDefault();
    event.stopPropagation();

    props.schema.onGroupRemove(props.id, props.parentId);
  };

  const {
    combinator,
    rules,
    translations,
    schema: { combinators, controls, onRuleRemove, isRuleGroup, getLevel, classNames }
  } = props;

  const level = getLevel(props.id);

  return (
    <div className={`ruleGroup ${classNames.ruleGroup}`}>
      {React.createElement(controls.combinatorSelector, {
        options: combinators,
        value: combinator,
        title: translations.combinators.title,
        className: `ruleGroup-combinators ${classNames.combinators}`,
        handleOnChange: onCombinatorChange,
        rules,
        level
      })}
      {React.createElement(controls.addRuleAction, {
        label: translations.addRule.label,
        title: translations.addRule.title,
        className: `ruleGroup-addRule ${classNames.addRule}`,
        handleOnClick: addRule,
        rules,
        level
      })}
      {React.createElement(controls.addGroupAction, {
        label: translations.addGroup.label,
        title: translations.addGroup.title,
        className: `ruleGroup-addGroup ${classNames.addGroup}`,
        handleOnClick: addGroup,
        rules,
        level
      })}
      {hasParentGroup()
        ? React.createElement(controls.removeGroupAction, {
            label: translations.removeGroup.label,
            title: translations.removeGroup.title,
            className: `ruleGroup-remove ${classNames.removeGroup}`,
            handleOnClick: removeGroup,
            rules,
            level
          })
        : null}
      {rules.map((r) =>
        isRuleGroup(r) ? (
          <RuleGroup
            key={r.id}
            id={r.id}
            schema={props.schema}
            parentId={props.id}
            combinator={r.combinator}
            translations={props.translations}
            rules={r.rules}
          />
        ) : (
          <Rule
            key={r.id}
            id={r.id}
            field={r.field}
            value={r.value}
            operator={r.operator}
            schema={props.schema}
            parentId={props.id}
            translations={props.translations}
            onRuleRemove={onRuleRemove}
          />
        )
      )}
    </div>
  );
};

RuleGroup.defaultProps = {
  id: null,
  parentId: null,
  rules: [],
  combinator: 'and',
  schema: {}
};

RuleGroup.displayName = 'RuleGroup';

export default RuleGroup;
