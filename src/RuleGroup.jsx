import React, { Fragment } from 'react';
import Rule from './Rule';

const RuleGroup = ({ id, parentId, combinator, rules, translations, schema, not }) => {
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
    showCombinatorsBetweenRules,
    showNotToggle
  } = schema;

  const hasParentGroup = () => !!parentId;

  const onCombinatorChange = (value) => {
    onPropChange('combinator', value, id);
  };

  const onNotToggleChange = (checked) => {
    onPropChange('not', checked, id);
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
    <div className={`ruleGroup ${classNames.ruleGroup}`} data-rule-group-id={id} data-level={level}>
      <div className={`ruleGroup-header ${classNames.header}`}>
        {showCombinatorsBetweenRules ? null : (
          <controls.combinatorSelector
            options={combinators}
            value={combinator}
            title={translations.combinators.title}
            className={`ruleGroup-combinators ${classNames.combinators}`}
            handleOnChange={onCombinatorChange}
            rules={rules}
            level={level}
          />
        )}
        {!showNotToggle ? null : (
          <controls.notToggle
            className={`ruleGroup-notToggle ${classNames.notToggle}`}
            title={translations.notToggle.title}
            checked={not}
            handleOnChange={onNotToggleChange}
          />
        )}
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
      </div>
      {rules.map((r, idx) => (
        <Fragment key={r.id}>
          {idx && showCombinatorsBetweenRules ? (
            <controls.combinatorSelector
              options={combinators}
              value={combinator}
              title={translations.combinators.title}
              className={`ruleGroup-combinators betweenRules ${classNames.combinators}`}
              handleOnChange={onCombinatorChange}
              rules={rules}
              level={level}
            />
          ) : null}
          {isRuleGroup(r) ? (
            <RuleGroup
              id={r.id}
              schema={schema}
              parentId={id}
              combinator={r.combinator}
              translations={translations}
              rules={r.rules}
              not={r.not}
            />
          ) : (
            <Rule
              id={r.id}
              field={r.field}
              value={r.value}
              operator={r.operator}
              schema={schema}
              parentId={id}
              translations={translations}
            />
          )}
        </Fragment>
      ))}
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
