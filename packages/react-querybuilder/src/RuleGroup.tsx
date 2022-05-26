import { Fragment, MouseEvent as ReactMouseEvent, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { DNDType, standardClassnames, TestID } from './defaults';
import { InlineCombinator } from './InlineCombinator';
import { c, getValidationClassNames } from './internal';
import type { DraggedItem, RuleGroupProps } from './types';
import { getParentPath, isAncestor, pathsAreEqual } from './utils';

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
}: RuleGroupProps) => {
  const {
    classNames,
    combinators,
    controls: {
      dragHandle: DragHandleControlElement,
      combinatorSelector: CombinatorSelectorControlElement,
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
  } = schema;
  const { onGroupAdd, onGroupRemove, onPropChange, onRuleAdd, moveRule } = actions;
  const disabled = !!parentDisabled || !!disabledProp;
  const { rules, not } = ruleGroup;
  let combinator = 'and';
  if ('combinator' in ruleGroup) {
    combinator = ruleGroup.combinator;
  }

  const previewRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLSpanElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [{ isDragging, dragMonitorId }, drag, preview] = useDrag(
    () => ({
      type: DNDType.ruleGroup,
      item: (): DraggedItem => ({ path }),
      canDrag: !disabled,
      collect: monitor => ({
        isDragging: !disabled && monitor.isDragging(),
        dragMonitorId: monitor.getHandlerId(),
      }),
    }),
    [disabled, path]
  );
  const [{ isOver, dropMonitorId }, drop] = useDrop(
    () => ({
      accept: [DNDType.rule, DNDType.ruleGroup],
      canDrop: (item: DraggedItem) => {
        if (disabled) return false;
        const parentItemPath = getParentPath(item.path);
        const itemIndex = item.path[item.path.length - 1];
        // Don't allow drop if 1) item is ancestor of drop target,
        // 2) item is first child and is dropped on its own group header,
        // or 3) the group is dropped on itself
        return !(
          isAncestor(item.path, path) ||
          (pathsAreEqual(path, parentItemPath) && itemIndex === 0) ||
          pathsAreEqual(path, item.path)
        );
      },
      collect: monitor => ({
        isOver: monitor.canDrop() && monitor.isOver(),
        dropMonitorId: monitor.getHandlerId(),
      }),
      drop: (item: DraggedItem, _monitor) => !disabled && moveRule(item.path, [...path, 0]),
    }),
    [disabled, moveRule, path]
  );
  if (path.length > 0) {
    drag(dragRef);
    preview(previewRef);
  }
  drop(dropRef);

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

  const addRule = (event: ReactMouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!disabled) {
      const newRule = createRule();
      onRuleAdd(newRule, path);
    }
  };

  const addGroup = (event: ReactMouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!disabled) {
      const newGroup = createRuleGroup();
      onGroupAdd(newGroup, path);
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
  const dndDragging = isDragging ? standardClassnames.dndDragging : '';
  const dndOver = isOver ? standardClassnames.dndOver : '';
  const outerClassName = c(
    standardClassnames.ruleGroup,
    classNames.ruleGroup,
    disabled ? standardClassnames.disabled : '',
    validationClassName,
    dndDragging
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
      <div ref={dropRef} className={c(standardClassnames.header, classNames.header, dndOver)}>
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
                <InlineCombinator
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
                <InlineCombinator
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
