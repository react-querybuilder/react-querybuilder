import * as React from 'react';
import { Fragment } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { RuleGroupTypeIC } from '.';
import { dndTypes, standardClassnames } from './defaults';
import { RuleGroupProps, RuleGroupType } from './types';
import { c, getParentPath, getValidationClassNames, regenerateIDs } from './utils';

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
    inlineCombinators,
    onGroupAdd,
    onGroupRemove,
    onPropChange,
    onRuleAdd,
    showCombinatorsBetweenRules,
    showNotToggle,
    showCloneButtons,
    enableDragAndDrop,
    updateInlineCombinator,
    validationMap
  } = schema;

  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: dndTypes.ruleGroup,
      item: { id, path, combinator, not },
      collect: (monitor) => ({
        isDragging: monitor.isDragging() && (monitor.getItem() as any).id !== id
      })
    }),
    []
  );

  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: [dndTypes.rule, dndTypes.ruleGroup],
    collect: (monitor) => ({
      isOver: monitor.isOver()
      // canDrop: monitor.canDrop()
    })
  }));

  const attachDnDRef = (el: HTMLDivElement) => {
    if (path.length > 0) {
      dragRef(el);
    }
    dropRef(el);
  };

  const onCombinatorChange = (value: any) => {
    onPropChange('combinator', value, path);
  };

  const onInlineCombinatorChange = (value: any, index: number) => {
    updateInlineCombinator(value, path.concat([index]));
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

    let thisGroup: RuleGroupType | RuleGroupTypeIC;
    if (inlineCombinators) {
      thisGroup = {
        id,
        not,
        rules
      } as RuleGroupTypeIC;
    } else {
      thisGroup = {
        id,
        combinator,
        rules,
        not
      } as RuleGroupType;
    }
    const newGroup = regenerateIDs(thisGroup);
    const parentPath = getParentPath(path);
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
  const dndDragging = isDragging ? standardClassnames.dndDragging : '';
  const dndOver = isOver ? standardClassnames.dndOver : '';
  const outerClassName = c(
    standardClassnames.ruleGroup,
    classNames.ruleGroup,
    validationClassName,
    dndDragging,
    dndOver
  );

  return (
    <div
      ref={attachDnDRef}
      className={outerClassName}
      data-rule-group-id={id}
      data-level={level}
      data-path={JSON.stringify(path)}>
      <div className={c(standardClassnames.header, classNames.header)}>
        {enableDragAndDrop && <controls.dragHandle schema={schema} />}
        {!showCombinatorsBetweenRules && !inlineCombinators && (
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
              {idx > 0 && !inlineCombinators && showCombinatorsBetweenRules && (
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
              {typeof r === 'string' ? (
                <controls.combinatorSelector
                  options={combinators}
                  value={r}
                  title={translations.combinators.title}
                  className={c(
                    standardClassnames.combinators,
                    standardClassnames.betweenRules,
                    classNames.combinators
                  )}
                  handleOnChange={(val) => onInlineCombinatorChange(val, idx)}
                  rules={rules}
                  level={level}
                  context={context}
                  validation={validationResult}
                />
              ) : 'rules' in r ? (
                <controls.ruleGroup
                  id={r.id}
                  schema={schema}
                  path={thisPath}
                  combinator={'combinator' in r ? r.combinator : undefined}
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
