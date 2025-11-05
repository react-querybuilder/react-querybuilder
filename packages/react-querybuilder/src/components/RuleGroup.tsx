import type {
  ActionElementEventHandler,
  Classnames,
  Path,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleGroupTypeIC,
  ValidationResult,
  ValueChangeEventHandler,
} from '@react-querybuilder/core';
import {
  clsx,
  getFirstOption,
  getOption,
  getParentPath,
  getValidationClassNames,
  isRuleGroup,
  isRuleGroupType,
  pathsAreEqual,
  standardClassnames,
  TestID,
} from '@react-querybuilder/core';
import type { MouseEvent } from 'react';
import * as React from 'react';
import { Fragment, useCallback, useMemo } from 'react';
import {
  useDeprecatedProps,
  usePathsMemo,
  useReactDndWarning,
  useStopEventPropagation,
} from '../hooks';
import type { RuleGroupProps, ShiftActionsProps } from '../types';

/**
 * Default component to display {@link RuleGroupType} and {@link RuleGroupTypeIC}
 * objects. This is actually a small wrapper around {@link RuleGroupHeaderComponents}
 * and {@link RuleGroupBodyComponents}.
 *
 * @group Components
 */
export const RuleGroup: React.MemoExoticComponent<(props: RuleGroupProps) => React.JSX.Element> =
  React.memo(function RuleGroup(props: RuleGroupProps) {
    const rg = useRuleGroup(props);

    const {
      schema: {
        controls: {
          ruleGroupBodyElements: RuleGroupBodyElements,
          ruleGroupHeaderElements: RuleGroupHeaderElements,
        },
      },
    } = rg;

    const addRule = useStopEventPropagation(rg.addRule);
    const addGroup = useStopEventPropagation(rg.addGroup);
    const cloneGroup = useStopEventPropagation(rg.cloneGroup);
    const toggleLockGroup = useStopEventPropagation(rg.toggleLockGroup);
    const toggleMuteGroup = useStopEventPropagation(rg.toggleMuteGroup);
    const removeGroup = useStopEventPropagation(rg.removeGroup);
    const shiftGroupUp = useStopEventPropagation(rg.shiftGroupUp);
    const shiftGroupDown = useStopEventPropagation(rg.shiftGroupDown);

    const actions = useMemo(
      () => ({
        addRule,
        addGroup,
        cloneGroup,
        toggleLockGroup,
        toggleMuteGroup,
        removeGroup,
        shiftGroupUp,
        shiftGroupDown,
      }),
      [
        addRule,
        addGroup,
        cloneGroup,
        toggleLockGroup,
        toggleMuteGroup,
        removeGroup,
        shiftGroupUp,
        shiftGroupDown,
      ]
    );

    return (
      <div
        ref={rg.previewRef}
        title={rg.accessibleDescription}
        className={rg.outerClassName}
        data-testid={TestID.ruleGroup}
        data-dragmonitorid={rg.dragMonitorId}
        data-dropmonitorid={rg.dropMonitorId}
        data-rule-group-id={rg.id}
        data-level={rg.path.length}
        data-path={JSON.stringify(rg.path)}>
        <div ref={rg.dropRef} className={rg.classNames.header}>
          <RuleGroupHeaderElements {...rg} {...actions} />
        </div>
        <div className={rg.classNames.body}>
          <RuleGroupBodyElements {...rg} {...actions} />
        </div>
      </div>
    );
  });

/**
 * Renders a `React.Fragment` containing an array of form controls for managing
 * a {@link RuleGroupType} or {@link RuleGroupTypeIC}.
 *
 * @group Components
 */
export const RuleGroupHeaderComponents: React.MemoExoticComponent<
  (rg: UseRuleGroup) => React.JSX.Element
> = React.memo(function RuleGroupHeaderComponents(rg: UseRuleGroup) {
  const {
    schema: {
      controls: {
        shiftActions: ShiftActionsControlElement,
        dragHandle: DragHandleControlElement,
        combinatorSelector: CombinatorSelectorControlElement,
        notToggle: NotToggleControlElement,
        addRuleAction: AddRuleActionControlElement,
        addGroupAction: AddGroupActionControlElement,
        cloneGroupAction: CloneGroupActionControlElement,
        lockGroupAction: LockGroupActionControlElement,
        muteGroupAction: MuteGroupActionControlElement,
        removeGroupAction: RemoveGroupActionControlElement,
      },
    },
  } = rg;

  const commonSubcomponentProps = useMemo(
    () => ({
      level: rg.path.length,
      path: rg.path,
      disabled: rg.disabled,
      context: rg.context,
      validation: rg.validationResult,
      schema: rg.schema,
    }),
    [rg.path, rg.disabled, rg.context, rg.validationResult, rg.schema]
  );

  const shiftTitles = useMemo(
    (): ShiftActionsProps['titles'] =>
      rg.schema.showShiftActions
        ? {
            shiftUp: rg.translations.shiftActionUp.title,
            shiftDown: rg.translations.shiftActionDown.title,
          }
        : undefined,
    [rg.schema.showShiftActions, rg.translations]
  );
  const shiftLabels = useMemo(
    (): ShiftActionsProps['labels'] =>
      rg.schema.showShiftActions
        ? {
            shiftUp: rg.translations.shiftActionUp.label,
            shiftDown: rg.translations.shiftActionDown.label,
          }
        : undefined,
    [rg.schema.showShiftActions, rg.translations]
  );

  return (
    <Fragment>
      {rg.schema.showShiftActions && rg.path.length > 0 && (
        <ShiftActionsControlElement
          key={TestID.shiftActions}
          {...commonSubcomponentProps}
          testID={TestID.shiftActions}
          titles={shiftTitles}
          labels={shiftLabels}
          className={rg.classNames.shiftActions}
          shiftUp={rg.shiftGroupUp}
          shiftDown={rg.shiftGroupDown}
          shiftUpDisabled={rg.shiftUpDisabled}
          shiftDownDisabled={rg.shiftDownDisabled}
          ruleOrGroup={rg.ruleGroup}
        />
      )}
      {rg.path.length > 0 && rg.schema.enableDragAndDrop && (
        <DragHandleControlElement
          key={TestID.dragHandle}
          {...commonSubcomponentProps}
          testID={TestID.dragHandle}
          ref={rg.dragRef}
          title={rg.translations.dragHandle.title}
          label={rg.translations.dragHandle.label}
          className={rg.classNames.dragHandle}
          ruleOrGroup={rg.ruleGroup}
        />
      )}
      {!rg.schema.showCombinatorsBetweenRules && !rg.schema.independentCombinators && (
        <CombinatorSelectorControlElement
          key={TestID.combinators}
          {...commonSubcomponentProps}
          testID={TestID.combinators}
          options={rg.schema.combinators}
          value={rg.combinator}
          title={rg.translations.combinators.title}
          className={rg.classNames.combinators}
          handleOnChange={rg.onCombinatorChange}
          rules={rg.ruleGroup.rules}
          ruleGroup={rg.ruleGroup}
        />
      )}
      {rg.schema.showNotToggle && (
        <NotToggleControlElement
          key={TestID.notToggle}
          {...commonSubcomponentProps}
          testID={TestID.notToggle}
          className={rg.classNames.notToggle}
          title={rg.translations.notToggle.title}
          label={rg.translations.notToggle.label}
          checked={rg.ruleGroup.not}
          handleOnChange={rg.onNotToggleChange}
          ruleGroup={rg.ruleGroup}
        />
      )}
      <AddRuleActionControlElement
        key={TestID.addRule}
        {...commonSubcomponentProps}
        testID={TestID.addRule}
        label={rg.translations.addRule.label}
        title={rg.translations.addRule.title}
        className={rg.classNames.addRule}
        handleOnClick={rg.addRule}
        rules={rg.ruleGroup.rules}
        ruleOrGroup={rg.ruleGroup}
      />
      {rg.schema.maxLevels > rg.path.length && (
        <AddGroupActionControlElement
          key={TestID.addGroup}
          {...commonSubcomponentProps}
          testID={TestID.addGroup}
          label={rg.translations.addGroup.label}
          title={rg.translations.addGroup.title}
          className={rg.classNames.addGroup}
          handleOnClick={rg.addGroup}
          rules={rg.ruleGroup.rules}
          ruleOrGroup={rg.ruleGroup}
        />
      )}
      {rg.schema.showCloneButtons && rg.path.length > 0 && (
        <CloneGroupActionControlElement
          key={TestID.cloneGroup}
          {...commonSubcomponentProps}
          testID={TestID.cloneGroup}
          label={rg.translations.cloneRuleGroup.label}
          title={rg.translations.cloneRuleGroup.title}
          className={rg.classNames.cloneGroup}
          handleOnClick={rg.cloneGroup}
          rules={rg.ruleGroup.rules}
          ruleOrGroup={rg.ruleGroup}
        />
      )}
      {rg.schema.showLockButtons && (
        <LockGroupActionControlElement
          key={TestID.lockGroup}
          {...commonSubcomponentProps}
          testID={TestID.lockGroup}
          label={rg.translations.lockGroup.label}
          title={rg.translations.lockGroup.title}
          className={rg.classNames.lockGroup}
          handleOnClick={rg.toggleLockGroup}
          rules={rg.ruleGroup.rules}
          disabledTranslation={rg.parentDisabled ? undefined : rg.translations.lockGroupDisabled}
          ruleOrGroup={rg.ruleGroup}
        />
      )}
      {rg.schema.showMuteButtons && (
        <MuteGroupActionControlElement
          key={TestID.muteGroup}
          {...commonSubcomponentProps}
          testID={TestID.muteGroup}
          label={
            rg.ruleGroup.muted ? rg.translations.unmuteGroup.label : rg.translations.muteGroup.label
          }
          title={
            rg.ruleGroup.muted ? rg.translations.unmuteGroup.title : rg.translations.muteGroup.title
          }
          className={rg.classNames.muteGroup}
          handleOnClick={rg.toggleMuteGroup}
          rules={rg.ruleGroup.rules}
          ruleOrGroup={rg.ruleGroup}
        />
      )}
      {rg.path.length > 0 && (
        <RemoveGroupActionControlElement
          key={TestID.removeGroup}
          {...commonSubcomponentProps}
          testID={TestID.removeGroup}
          label={rg.translations.removeGroup.label}
          title={rg.translations.removeGroup.title}
          className={rg.classNames.removeGroup}
          handleOnClick={rg.removeGroup}
          rules={rg.ruleGroup.rules}
          ruleOrGroup={rg.ruleGroup}
        />
      )}
    </Fragment>
  );
});

/**
 * Renders a `React.Fragment` containing an array of either (1) {@link Rule} and
 * {@link RuleGroup}, or (2) {@link Rule}, {@link RuleGroup}, and {@link InlineCombinator}.
 *
 * @group Components
 */
export const RuleGroupBodyComponents: React.MemoExoticComponent<
  (rg: UseRuleGroup) => React.JSX.Element
> = React.memo(function RuleGroupBodyComponents(rg: UseRuleGroup) {
  const {
    schema: {
      controls: {
        combinatorSelector: CombinatorSelectorControlElement,
        inlineCombinator: InlineCombinatorControlElement,
        ruleGroup: RuleGroupControlElement,
        rule: RuleControlElement,
      },
    },
  } = rg;

  return (
    <Fragment>
      {rg.ruleGroup.rules.map((r, idx, { length: ruleArrayLength }) => {
        const thisPathMemo = rg.pathsMemo[idx];
        const thisPath = thisPathMemo.path;
        const thisPathDisabled = thisPathMemo.disabled || (typeof r !== 'string' && r.disabled);
        const shiftUpDisabled = pathsAreEqual([0], thisPath);
        const shiftDownDisabled = rg.path.length === 0 && idx === ruleArrayLength - 1;
        const key = typeof r === 'string' ? [...thisPath, r].join('-') : r.id;
        return (
          <Fragment key={key}>
            {idx > 0 &&
              !rg.schema.independentCombinators &&
              rg.schema.showCombinatorsBetweenRules && (
                <InlineCombinatorControlElement
                  key={TestID.inlineCombinator}
                  options={rg.schema.combinators}
                  value={rg.combinator}
                  title={rg.translations.combinators.title}
                  className={rg.classNames.combinators}
                  handleOnChange={rg.onCombinatorChange}
                  rules={rg.ruleGroup.rules}
                  level={rg.path.length}
                  context={rg.context}
                  validation={rg.validationResult}
                  component={CombinatorSelectorControlElement}
                  path={thisPath}
                  disabled={rg.disabled}
                  schema={rg.schema}
                  ruleGroup={rg.ruleGroup}
                />
              )}
            {typeof r === 'string' ? (
              <InlineCombinatorControlElement
                key={`${TestID.inlineCombinator}-independent`}
                options={rg.schema.combinators}
                value={r}
                title={rg.translations.combinators.title}
                className={rg.classNames.combinators}
                // oxlint-disable-next-line jsx-no-new-function-as-prop
                handleOnChange={val => rg.onIndependentCombinatorChange(val, idx)}
                rules={rg.ruleGroup.rules}
                level={rg.path.length}
                context={rg.context}
                validation={rg.validationResult}
                component={CombinatorSelectorControlElement}
                path={thisPath}
                disabled={thisPathDisabled}
                schema={rg.schema}
                ruleGroup={rg.ruleGroup}
              />
            ) : isRuleGroup(r) ? (
              <RuleGroupControlElement
                key={TestID.ruleGroup}
                id={r.id}
                schema={rg.schema}
                actions={rg.actions}
                path={thisPath}
                translations={rg.translations}
                ruleGroup={r}
                rules={r.rules}
                combinator={isRuleGroupType(r) ? r.combinator : undefined}
                not={!!r.not}
                disabled={thisPathDisabled}
                parentDisabled={rg.parentDisabled || rg.disabled}
                parentMuted={rg.parentMuted || rg.muted}
                shiftUpDisabled={shiftUpDisabled}
                shiftDownDisabled={shiftDownDisabled}
                context={rg.context}
              />
            ) : (
              <RuleControlElement
                key={TestID.rule}
                id={r.id}
                rule={r}
                field={r.field}
                operator={r.operator}
                value={r.value}
                valueSource={r.valueSource}
                schema={rg.schema}
                actions={rg.actions}
                path={thisPath}
                disabled={thisPathDisabled}
                parentDisabled={rg.parentDisabled || rg.disabled}
                parentMuted={rg.parentMuted || rg.muted}
                translations={rg.translations}
                shiftUpDisabled={shiftUpDisabled}
                shiftDownDisabled={shiftDownDisabled}
                context={rg.context}
              />
            )}
          </Fragment>
        );
      })}
    </Fragment>
  );
});

/* oxlint-disable typescript/no-explicit-any */
export interface UseRuleGroup extends RuleGroupProps {
  addGroup: ActionElementEventHandler;
  addRule: ActionElementEventHandler;
  accessibleDescription: string;
  muted?: boolean;
  classNames: Pick<
    { [k in keyof Classnames]: string },
    | 'header'
    | 'shiftActions'
    | 'dragHandle'
    | 'combinators'
    | 'notToggle'
    | 'addRule'
    | 'addGroup'
    | 'cloneGroup'
    | 'lockGroup'
    | 'muteGroup'
    | 'removeGroup'
    | 'body'
  >;
  cloneGroup: ActionElementEventHandler;
  onCombinatorChange: ValueChangeEventHandler;
  onGroupAdd: (group: RuleGroupTypeAny, parentPath: Path, context?: any) => void;
  onIndependentCombinatorChange: (value: any, index: number, context?: any) => void;
  onNotToggleChange: (checked: boolean, context?: any) => void;
  outerClassName: string;
  pathsMemo: { path: Path; disabled: boolean }[];
  removeGroup: ActionElementEventHandler;
  ruleGroup: RuleGroupType | RuleGroupTypeIC;
  shiftGroupDown: (event?: MouseEvent, context?: any) => void;
  shiftGroupUp: (event?: MouseEvent, context?: any) => void;
  toggleLockGroup: ActionElementEventHandler;
  toggleMuteGroup: ActionElementEventHandler;
  validationClassName: string;
  validationResult: boolean | ValidationResult;
}
/* oxlint-enable typescript/no-explicit-any */

/**
 * Prepares all values and methods used by the {@link RuleGroup} component.
 *
 * @group Hooks
 */
export const useRuleGroup = (props: RuleGroupProps): UseRuleGroup => {
  const {
    id,
    path,
    ruleGroup: ruleGroupProp,
    schema: {
      qbId,
      accessibleDescriptionGenerator,
      classNames: classNamesProp,
      combinators,
      createRule,
      createRuleGroup,
      disabledPaths,
      independentCombinators,
      validationMap,
      enableDragAndDrop,
      getRuleGroupClassname,
      suppressStandardClassnames,
    },
    actions: { onGroupAdd, onGroupRemove, onPropChange, onRuleAdd, moveRule },
    disabled: disabledProp,
    parentDisabled,
    parentMuted,
    shiftUpDisabled,
    shiftDownDisabled,
    combinator: combinatorProp,
    rules: rulesProp,
    not: notProp,
    // Drag-and-drop
    dropEffect = 'move',
    groupItems = false,
    dragMonitorId = '',
    dropMonitorId = '',
    previewRef = null,
    dragRef = null,
    dropRef = null,
    isDragging = false,
    isOver = false,
    dropNotAllowed = false,
  } = props;

  useDeprecatedProps('ruleGroup', !ruleGroupProp);

  useReactDndWarning(
    enableDragAndDrop,
    !!(dragMonitorId || dropMonitorId || previewRef || dragRef || dropRef)
  );

  const disabled = !!parentDisabled || !!disabledProp;
  const muted = !!parentMuted || !!ruleGroupProp?.muted;

  const combinator = useMemo(
    () =>
      ruleGroupProp && isRuleGroupType(ruleGroupProp)
        ? ruleGroupProp.combinator
        : ruleGroupProp
          ? getFirstOption(combinators)!
          : (combinatorProp ?? getFirstOption(combinators)!),
    [combinatorProp, combinators, ruleGroupProp]
  );

  // TODO?: Type this properly with generics
  const ruleGroup = useMemo((): RuleGroupTypeAny => {
    if (ruleGroupProp) {
      if (ruleGroupProp.combinator === combinator || independentCombinators) {
        return ruleGroupProp;
      }
      const newRG = structuredClone(ruleGroupProp);
      newRG.combinator = combinator;
      return newRG;
    }
    return { rules: rulesProp, not: notProp } as RuleGroupTypeIC;
  }, [combinator, independentCombinators, notProp, ruleGroupProp, rulesProp]);

  const classNames = useMemo(
    () => ({
      header: clsx(
        suppressStandardClassnames || standardClassnames.header,
        classNamesProp.header,
        isOver && dropEffect === 'copy' && classNamesProp.dndCopy,
        dropNotAllowed && classNamesProp.dndDropNotAllowed,
        suppressStandardClassnames || {
          [standardClassnames.dndOver]: isOver,
          [standardClassnames.dndCopy]: isOver && dropEffect === 'copy',
          [standardClassnames.dndDropNotAllowed]: dropNotAllowed,
        }
      ),
      shiftActions: clsx(
        suppressStandardClassnames || standardClassnames.shiftActions,
        classNamesProp.shiftActions
      ),
      dragHandle: clsx(
        suppressStandardClassnames || standardClassnames.dragHandle,
        classNamesProp.dragHandle
      ),
      combinators: clsx(
        suppressStandardClassnames || standardClassnames.combinators,
        classNamesProp.valueSelector,
        classNamesProp.combinators
      ),
      notToggle: clsx(
        suppressStandardClassnames || standardClassnames.notToggle,
        classNamesProp.notToggle
      ),
      addRule: clsx(
        suppressStandardClassnames || standardClassnames.addRule,
        classNamesProp.actionElement,
        classNamesProp.addRule
      ),
      addGroup: clsx(
        suppressStandardClassnames || standardClassnames.addGroup,
        classNamesProp.actionElement,
        classNamesProp.addGroup
      ),
      cloneGroup: clsx(
        suppressStandardClassnames || standardClassnames.cloneGroup,
        classNamesProp.actionElement,
        classNamesProp.cloneGroup
      ),
      lockGroup: clsx(
        suppressStandardClassnames || standardClassnames.lockGroup,
        classNamesProp.actionElement,
        classNamesProp.lockGroup
      ),
      muteGroup: clsx(
        suppressStandardClassnames || standardClassnames.muteGroup,
        classNamesProp.actionElement,
        classNamesProp.muteGroup
      ),
      removeGroup: clsx(
        suppressStandardClassnames || standardClassnames.removeGroup,
        classNamesProp.actionElement,
        classNamesProp.removeGroup
      ),
      body: clsx(suppressStandardClassnames || standardClassnames.body, classNamesProp.body),
    }),
    [
      classNamesProp.actionElement,
      classNamesProp.addGroup,
      classNamesProp.addRule,
      classNamesProp.body,
      classNamesProp.cloneGroup,
      classNamesProp.combinators,
      classNamesProp.dndCopy,
      classNamesProp.dndDropNotAllowed,
      classNamesProp.dragHandle,
      classNamesProp.header,
      classNamesProp.lockGroup,
      classNamesProp.muteGroup,
      classNamesProp.notToggle,
      classNamesProp.removeGroup,
      classNamesProp.shiftActions,
      classNamesProp.valueSelector,
      dropEffect,
      dropNotAllowed,
      isOver,
      suppressStandardClassnames,
    ]
  );

  const onCombinatorChange: ValueChangeEventHandler = useCallback(
    value => {
      if (!disabled) {
        onPropChange('combinator', value, path);
      }
    },
    [disabled, onPropChange, path]
  );

  const onIndependentCombinatorChange = useCallback(
    // oxlint-disable-next-line typescript/no-explicit-any
    (value: any, index: number, _context?: any) => {
      if (!disabled) {
        onPropChange('combinator', value, [...path, index]);
      }
    },
    [disabled, onPropChange, path]
  );

  const onNotToggleChange = useCallback(
    // oxlint-disable-next-line typescript/no-explicit-any
    (checked: boolean, _context?: any) => {
      if (!disabled) {
        onPropChange('not', checked, path);
      }
    },
    [disabled, onPropChange, path]
  );

  const addRule: ActionElementEventHandler = useCallback(
    (_e, context) => {
      if (!disabled) {
        const newRule = createRule();
        onRuleAdd(newRule, path, context);
      }
    },
    [createRule, disabled, onRuleAdd, path]
  );

  const addGroup: ActionElementEventHandler = useCallback(
    (_e, context) => {
      if (!disabled) {
        const newGroup = createRuleGroup();
        onGroupAdd(newGroup, path, context);
      }
    },
    [createRuleGroup, disabled, onGroupAdd, path]
  );

  const cloneGroup: ActionElementEventHandler = useCallback(() => {
    if (!disabled) {
      const newPath = [...getParentPath(path), path.at(-1)! + 1];
      moveRule(path, newPath, true);
    }
  }, [disabled, moveRule, path]);

  const shiftGroupUp = useCallback(
    // oxlint-disable-next-line typescript/no-explicit-any
    (event?: MouseEvent, _context?: any) => {
      if (!disabled && !shiftUpDisabled) {
        moveRule(path, 'up', event?.altKey);
      }
    },
    [disabled, moveRule, path, shiftUpDisabled]
  );

  const shiftGroupDown = useCallback(
    // oxlint-disable-next-line typescript/no-explicit-any
    (event?: MouseEvent, _context?: any) => {
      if (!disabled && !shiftDownDisabled) {
        moveRule(path, 'down', event?.altKey);
      }
    },
    [disabled, moveRule, path, shiftDownDisabled]
  );

  const toggleLockGroup: ActionElementEventHandler = useCallback(() => {
    onPropChange('disabled', !disabled, path);
  }, [disabled, onPropChange, path]);

  const toggleMuteGroup: ActionElementEventHandler = useCallback(() => {
    onPropChange('muted', !ruleGroup.muted, path);
  }, [ruleGroup.muted, onPropChange, path]);

  const removeGroup: ActionElementEventHandler = useCallback(() => {
    if (!disabled) {
      onGroupRemove(path);
    }
  }, [disabled, onGroupRemove, path]);

  const validationResult = validationMap[id ?? /* istanbul ignore next */ ''];
  const validationClassName = useMemo(
    () => getValidationClassNames(validationResult),
    [validationResult]
  );
  const combinatorBasedClassName = useMemo(
    () => (independentCombinators ? null : (getOption(combinators, combinator)?.className ?? '')),
    [combinator, combinators, independentCombinators]
  );

  const ruleGroupClassname = useMemo(
    () => getRuleGroupClassname(ruleGroup),
    [getRuleGroupClassname, ruleGroup]
  );

  const outerClassName = useMemo(
    () =>
      clsx(
        ruleGroupClassname,
        combinatorBasedClassName,
        suppressStandardClassnames || standardClassnames.ruleGroup,
        classNamesProp.ruleGroup,
        disabled && classNamesProp.disabled,
        muted && classNamesProp.muted,
        isDragging && classNamesProp.dndDragging,
        isOver && groupItems && classNamesProp.dndGroup,
        suppressStandardClassnames || {
          [standardClassnames.disabled]: disabled,
          [standardClassnames.muted]: muted,
          [standardClassnames.dndDragging]: isDragging,
          [standardClassnames.dndGroup]: isOver && groupItems,
        },
        validationClassName
      ),
    [
      classNamesProp.disabled,
      classNamesProp.muted,
      classNamesProp.dndDragging,
      classNamesProp.dndGroup,
      classNamesProp.ruleGroup,
      combinatorBasedClassName,
      disabled,
      muted,
      groupItems,
      isDragging,
      isOver,
      ruleGroupClassname,
      suppressStandardClassnames,
      validationClassName,
    ]
  );

  const pathsMemo = usePathsMemo({ disabled, disabledPaths, path, nestedArray: ruleGroup.rules });

  const accessibleDescription = useMemo(
    () => accessibleDescriptionGenerator({ path, qbId }),
    [accessibleDescriptionGenerator, path, qbId]
  );

  return {
    ...props,
    addGroup,
    addRule,
    accessibleDescription,
    classNames,
    cloneGroup,
    combinator,
    disabled,
    dragMonitorId,
    dragRef,
    dropMonitorId,
    dropRef,
    isDragging,
    isOver,
    muted,
    onCombinatorChange,
    onGroupAdd,
    onIndependentCombinatorChange,
    onNotToggleChange,
    outerClassName,
    parentDisabled,
    pathsMemo,
    previewRef,
    removeGroup,
    ruleGroup,
    shiftGroupUp,
    shiftGroupDown,
    toggleLockGroup,
    toggleMuteGroup,
    validationClassName,
    validationResult,
  };
};
