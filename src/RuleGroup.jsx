import React from 'react';
import Rule from './Rule';

const RuleGroup = ({ id, parentId, combinator, rules, translations, schema }) => {
  const {
    classNames,
    combinators,
    controls,
    createRule,
    createRuleGroup,
    getLevel,
    isRuleGroup,
    onGroupAdd,
    onGroupRemove,
    onPropChange,
    onRuleAdd,
    onRuleRemove,
    showCombinators
  } = schema;

  const hasParentGroup = () => !!parentId;

  const onCombinatorChange = (value) => {
    onPropChange('combinator', value, id);
  };

  const addRule = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const newRule = createRule();
    onRuleAdd(newRule, id);
  };

  const addGroup = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const newGroup = createRuleGroup();
    onGroupAdd(newGroup, id);
  };

  const removeGroup = (event) => {
    event.preventDefault();
    event.stopPropagation();

    onGroupRemove(id, parentId);
  };

  const level = getLevel(id);

  return (
    <div className={`ruleGroup ${classNames.ruleGroup}`}>
      <controls.combinatorSelector
        options={combinators}
        value={combinator}
        title={translations.combinators.title}
        className={`ruleGroup-combinators ${classNames.combinators}`}
        handleOnChange={onCombinatorChange}
        rules={rules}
        level={level}
      />
      <controls.addRuleAction
        label={translations.addRule.label}
        title={translations.addRule.title}
        className={`ruleGroup-addRule ${classNames.addRule}`}
        handleOnClick={addRule}
        rules={rules}
        level={level}
      />
      <controls.addGroupAction
        label={translations.addGroup.label}
        title={translations.addGroup.title}
        className={`ruleGroup-addGroup ${classNames.addGroup}`}
        handleOnClick={addGroup}
        rules={rules}
        level={level}
      />
      {hasParentGroup() ? (
        <controls.removeGroupAction
          label={translations.removeGroup.label}
          title={translations.removeGroup.title}
          className={`ruleGroup-remove ${classNames.removeGroup}`}
          handleOnClick={removeGroup}
          rules={rules}
          level={level}
        />
      ) : null}
      {rules.map((r, idx) =>
        isRuleGroup(r) ? (
          <>
            {idx && showCombinators ? (
              <span className="ruleGroup-combinator">{combinator}</span>
            ) : null}
            <RuleGroup
              key={r.id}
              id={r.id}
              schema={schema}
              parentId={id}
              combinator={r.combinator}
              translations={translations}
              rules={r.rules}
            />
          </>
        ) : (
          <>
            {idx && showCombinators ? (
              <span className="ruleGroup-combinator">{combinator}</span>
            ) : null}
            <Rule
              key={r.id}
              id={r.id}
              field={r.field}
              value={r.value}
              operator={r.operator}
              schema={schema}
              parentId={id}
              translations={translations}
              onRuleRemove={onRuleRemove}
            />
          </>
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
