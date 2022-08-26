import { Fragment, type MouseEvent as ReactMouseEvent } from 'react';
import { defaultCombinators, standardClassnames, TestID } from './defaults';
import { getValidationClassNames } from './internal';
import { useDeprecatedProps, useReactDndWarning } from './internal/hooks';
import type { RuleGroupProps } from './types';
import { c, getParentPath, pathsAreEqual } from './utils';

export const RuleGroup = ({
  id,
  path,
  ruleGroup,
  translations,
  schema,
  actions,
  disabled: disabledProp,
  parentDisabled,
  context,
  combinator: combinatorProp,
  rules: rulesProp,
  not: notProp,
  // Drag-and-drop
  dragMonitorId = '',
  dropMonitorId = '',
  previewRef = null,
  dragRef = null,
  dropRef = null,
}: RuleGroupProps) => {
  const {
    classNames,
    combinators,
    controls: {
      dragHandle: DragHandleControlElement,
      combinatorSelector: CombinatorSelectorControlElement,
      inlineCombinator: InlineCombinatorControlElement,
      notToggle: NotToggleControlElement,
      addRuleAction: AddRuleActionControlElement,
      addGroupAction: AddGroupActionControlElement,
      cloneGroupAction: CloneGroupActionControlElement,
      lockGroupAction: LockGroupActionControlElement,
      removeGroupAction: RemoveGroupActionControlElement,
      ruleGroup: RuleGroupControlElement,
      rule: RuleControlElement,
    },
    createRule,
    createRuleGroup,
    independentCombinators,
    showCombinatorsBetweenRules,
    showNotToggle,
    showCloneButtons,
    showLockButtons,
    validationMap,
    disabledPaths,
    enableDragAndDrop,
  } = schema;
  const { onGroupAdd, onGroupRemove, onPropChange, onRuleAdd, moveRule } = actions;
  const disabled = !!parentDisabled || !!disabledProp;

  const { rules, not } = ruleGroup ? ruleGroup : { rules: rulesProp, not: notProp };
  let combinator: string = defaultCombinators[0].name;
  if (ruleGroup && 'combinator' in ruleGroup) {
    combinator = ruleGroup.combinator;
  } else if (!ruleGroup) {
    combinator = combinatorProp ?? combinator;
  }

  useDeprecatedProps('ruleGroup', !!ruleGroup);

  useReactDndWarning(
    enableDragAndDrop,
    !!(dragMonitorId || dropMonitorId || previewRef || dragRef || dropRef)
  );

  const onCombinatorChange = (value: any) => {
    if (!disabled) {
      onPropChange('combinator', value, path);
    }
  };

  const onIndependentCombinatorChange = (value: any, index: number) => {
    if (!disabled) {
      onPropChange('combinator', value, path.concat([index]));
    }
  };

  const onNotToggleChange = (checked: boolean) => {
    if (!disabled) {
      onPropChange('not', checked, path);
    }
  };

  const addRule = (event: ReactMouseEvent, context?: any) => {
    event.preventDefault();
    event.stopPropagation();

    if (!disabled) {
      const newRule = createRule();
      onRuleAdd(newRule, path, context);
    }
  };

  const addGroup = (event: ReactMouseEvent, context?: any) => {
    event.preventDefault();
    event.stopPropagation();

    if (!disabled) {
      const newGroup = createRuleGroup();
      onGroupAdd(newGroup, path, context);
    }
  };

  const cloneGroup = (event: ReactMouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!disabled) {
      const newPath = [...getParentPath(path), path[path.length - 1] + 1];
      moveRule(path, newPath, true);
    }
  };

  const toggleLockGroup = (event: ReactMouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    onPropChange('disabled', !disabled, path);
  };

  const removeGroup = (event: ReactMouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!disabled) {
      onGroupRemove(path);
    }
  };

  const level = path.length;

  const validationResult = validationMap[id ?? /* istanbul ignore next */ ''];
  const validationClassName = getValidationClassNames(validationResult);
  const outerClassName = c(
    standardClassnames.ruleGroup,
    classNames.ruleGroup,
    disabled ? standardClassnames.disabled : '',
    validationClassName
  );

  return (
    <div
      ref={previewRef}
      className={outerClassName}
      data-testid={TestID.ruleGroup}
      data-dragmonitorid={dragMonitorId}
      data-dropmonitorid={dropMonitorId}
      data-rule-group-id={id}
      data-level={level}
      data-path={JSON.stringify(path)}>
      <div ref={dropRef} className={c(standardClassnames.header, classNames.header)}>
        {level > 0 && (
          <DragHandleControlElement
            testID={TestID.dragHandle}
            ref={dragRef}
            level={level}
            path={path}
            title={translations.dragHandle.title}
            label={translations.dragHandle.label}
            className={c(standardClassnames.dragHandle, classNames.dragHandle)}
            disabled={disabled}
            context={context}
            validation={validationResult}
          />
        )}
        {!showCombinatorsBetweenRules && !independentCombinators && (
          <CombinatorSelectorControlElement
            testID={TestID.combinators}
            options={combinators}
            value={combinator}
            title={translations.combinators.title}
            className={c(standardClassnames.combinators, classNames.combinators)}
            handleOnChange={onCombinatorChange}
            rules={rules}
            level={level}
            path={path}
            disabled={disabled}
            context={context}
            validation={validationResult}
          />
        )}
        {showNotToggle && (
          <NotToggleControlElement
            testID={TestID.notToggle}
            className={c(standardClassnames.notToggle, classNames.notToggle)}
            title={translations.notToggle.title}
            label={translations.notToggle.label}
            checked={not}
            handleOnChange={onNotToggleChange}
            level={level}
            disabled={disabled}
            path={path}
            context={context}
            validation={validationResult}
          />
        )}
        <AddRuleActionControlElement
          testID={TestID.addRule}
          label={translations.addRule.label}
          title={translations.addRule.title}
          className={c(standardClassnames.addRule, classNames.addRule)}
          handleOnClick={addRule}
          rules={rules}
          level={level}
          path={path}
          disabled={disabled}
          context={context}
          validation={validationResult}
        />
        <AddGroupActionControlElement
          testID={TestID.addGroup}
          label={translations.addGroup.label}
          title={translations.addGroup.title}
          className={c(standardClassnames.addGroup, classNames.addGroup)}
          handleOnClick={addGroup}
          rules={rules}
          level={level}
          path={path}
          disabled={disabled}
          context={context}
          validation={validationResult}
        />
        {showCloneButtons && path.length >= 1 && (
          <CloneGroupActionControlElement
            testID={TestID.cloneGroup}
            label={translations.cloneRuleGroup.label}
            title={translations.cloneRuleGroup.title}
            className={c(standardClassnames.cloneGroup, classNames.cloneGroup)}
            handleOnClick={cloneGroup}
            rules={rules}
            level={level}
            path={path}
            disabled={disabled}
            context={context}
            validation={validationResult}
          />
        )}
        {showLockButtons && (
          <LockGroupActionControlElement
            testID={TestID.lockGroup}
            label={translations.lockGroup.label}
            title={translations.lockGroup.title}
            className={c(standardClassnames.lockGroup, classNames.lockGroup)}
            handleOnClick={toggleLockGroup}
            rules={rules}
            level={level}
            path={path}
            disabled={disabled}
            disabledTranslation={parentDisabled ? undefined : translations.lockGroupDisabled}
            context={context}
            validation={validationResult}
          />
        )}
        {path.length >= 1 && (
          <RemoveGroupActionControlElement
            testID={TestID.removeGroup}
            label={translations.removeGroup.label}
            title={translations.removeGroup.title}
            className={c(standardClassnames.removeGroup, classNames.removeGroup)}
            handleOnClick={removeGroup}
            rules={rules}
            level={level}
            path={path}
            disabled={disabled}
            context={context}
            validation={validationResult}
          />
        )}
      </div>
      <div className={c(standardClassnames.body, classNames.body)}>
        {rules.map((r, idx) => {
          const thisPath = [...path, idx];
          const thisPathDisabled =
            disabled ||
            (typeof r !== 'string' && r.disabled) ||
            disabledPaths.some(p => pathsAreEqual(thisPath, p));
          const key = thisPath.join('-');
          return (
            <Fragment key={key}>
              {idx > 0 && !independentCombinators && showCombinatorsBetweenRules && (
                <InlineCombinatorControlElement
                  options={combinators}
                  value={combinator}
                  title={translations.combinators.title}
                  className={c(standardClassnames.combinators, classNames.combinators)}
                  handleOnChange={onCombinatorChange}
                  rules={rules}
                  level={level}
                  context={context}
                  validation={validationResult}
                  component={CombinatorSelectorControlElement}
                  moveRule={moveRule}
                  path={thisPath}
                  disabled={thisPathDisabled}
                  independentCombinators={independentCombinators}
                />
              )}
              {typeof r === 'string' ? (
                <InlineCombinatorControlElement
                  options={combinators}
                  value={r}
                  title={translations.combinators.title}
                  className={c(standardClassnames.combinators, classNames.combinators)}
                  handleOnChange={val => onIndependentCombinatorChange(val, idx)}
                  rules={rules}
                  level={level}
                  context={context}
                  validation={validationResult}
                  component={CombinatorSelectorControlElement}
                  moveRule={moveRule}
                  path={thisPath}
                  disabled={thisPathDisabled}
                  independentCombinators={independentCombinators}
                />
              ) : 'rules' in r ? (
                <RuleGroupControlElement
                  id={r.id}
                  schema={schema}
                  actions={actions}
                  path={thisPath}
                  translations={translations}
                  ruleGroup={r}
                  rules={r.rules}
                  combinator={'combinator' in r ? r.combinator : undefined}
                  not={!!r.not}
                  disabled={thisPathDisabled}
                  parentDisabled={parentDisabled || disabled}
                  context={context}
                />
              ) : (
                <RuleControlElement
                  id={r.id!}
                  rule={r}
                  field={r.field}
                  operator={r.operator}
                  value={r.value}
                  valueSource={r.valueSource}
                  schema={schema}
                  actions={actions}
                  path={thisPath}
                  disabled={thisPathDisabled}
                  parentDisabled={parentDisabled || disabled}
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
