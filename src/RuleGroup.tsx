import clone from 'lodash/clone';
import * as React from 'react';
import { Fragment } from 'react';
import { standardClassnames } from './defaults';
import { RuleGroupProps, RuleGroupType } from './types';
import { c, getValidationClassNames, regenerateIDs } from './utils';

export const RuleGroup = ({
  id,
  path,
  combinator = 'and',
  rules,
  translations,
  schema,
  not,
  context
}: RuleGroupProps) => {
  const {
    classNames,
    combinators,
    controls,
    createRule,
    createRuleGroup,
    isRuleGroup,
    onGroupAdd,
    onGroupRemove,
    onPropChange,
    onRuleAdd,
    showCombinatorsBetweenRules,
    showNotToggle,
    showCloneButtons,
    validationMap
  } = schema;

  const onCombinatorChange = (value: any) => {
    onPropChange('combinator', value, path);
  };

  const onNotToggleChange = (checked: boolean) => {
    onPropChange('not', checked, path);
  };

  const addRule = (event: React.MouseEvent<Element, MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();

    const newRule = createRule();
    onRuleAdd(newRule, path);
  };

  const addGroup = (event: React.MouseEvent<Element, MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();

    const newGroup = createRuleGroup();
    onGroupAdd(newGroup, path);
  };

  const cloneGroup = (event: React.MouseEvent<Element, MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();

    const thisGroup: RuleGroupType = {
      id,
      combinator,
      rules,
      not
    };
    const newGroup = regenerateIDs(thisGroup);
    const parentPath = clone(path);
    parentPath.pop();
    onGroupAdd(newGroup, parentPath);
  };

  const removeGroup = (event: React.MouseEvent<Element, MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();

    onGroupRemove(path);
  };

  const level = path.length;

  const validationResult = validationMap[id ?? /* istanbul ignore next */ ''];
  const validationClassName = getValidationClassNames(validationResult);
  const outerClassName = c(standardClassnames.ruleGroup, classNames.ruleGroup, validationClassName);

  return (
    <div
      className={outerClassName}
      data-rule-group-id={id}
      data-level={level}
      data-path={JSON.stringify(path)}>
      <div className={c(standardClassnames.header, classNames.header)}>
        {!showCombinatorsBetweenRules && (
          <controls.combinatorSelector
            options={combinators}
            value={combinator}
            title={translations.combinators.title}
            className={c(standardClassnames.combinators, classNames.combinators)}
            handleOnChange={onCombinatorChange}
            rules={rules}
            level={level}
            context={context}
            validation={validationResult}
          />
        )}
        {showNotToggle && (
          <controls.notToggle
            className={c(standardClassnames.notToggle, classNames.notToggle)}
            title={translations.notToggle.title}
            label={translations.notToggle.label}
            checked={not}
            handleOnChange={onNotToggleChange}
            level={level}
            context={context}
            validation={validationResult}
          />
        )}
        <controls.addRuleAction
          label={translations.addRule.label}
          title={translations.addRule.title}
          className={c(standardClassnames.addRule, classNames.addRule)}
          handleOnClick={addRule}
          rules={rules}
          level={level}
          context={context}
          validation={validationResult}
        />
        <controls.addGroupAction
          label={translations.addGroup.label}
          title={translations.addGroup.title}
          className={c(standardClassnames.addGroup, classNames.addGroup)}
          handleOnClick={addGroup}
          rules={rules}
          level={level}
          context={context}
          validation={validationResult}
        />
        {showCloneButtons && path.length >= 1 && (
          <controls.cloneGroupAction
            label={translations.cloneRuleGroup.label}
            title={translations.cloneRuleGroup.title}
            className={c(standardClassnames.cloneGroup, classNames.cloneGroup)}
            handleOnClick={cloneGroup}
            rules={rules}
            level={level}
            context={context}
            validation={validationResult}
          />
        )}
        {path.length >= 1 && (
          <controls.removeGroupAction
            label={translations.removeGroup.label}
            title={translations.removeGroup.title}
            className={c(standardClassnames.removeGroup, classNames.removeGroup)}
            handleOnClick={removeGroup}
            rules={rules}
            level={level}
            context={context}
            validation={validationResult}
          />
        )}
      </div>
      <div className={c(standardClassnames.body, classNames.body)}>
        {rules.map((r, idx) => {
          const thisPath = path.concat([idx]);
          return (
            <Fragment key={thisPath.join('-')}>
              {idx > 0 && showCombinatorsBetweenRules && (
                <controls.combinatorSelector
                  options={combinators}
                  value={combinator}
                  title={translations.combinators.title}
                  className={c(
                    standardClassnames.combinators,
                    standardClassnames.betweenRules,
                    classNames.combinators
                  )}
                  handleOnChange={onCombinatorChange}
                  rules={rules}
                  level={level}
                  context={context}
                  validation={validationResult}
                />
              )}
              {isRuleGroup(r) ? (
                <controls.ruleGroup
                  id={r.id}
                  schema={schema}
                  path={thisPath}
                  combinator={r.combinator}
                  translations={translations}
                  rules={r.rules}
                  not={!!r.not}
                  context={context}
                />
              ) : (
                <controls.rule
                  id={r.id!}
                  field={r.field}
                  value={r.value}
                  operator={r.operator}
                  schema={schema}
                  path={thisPath}
                  translations={translations}
                  context={context}
                />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};

RuleGroup.displayName = 'RuleGroup';
