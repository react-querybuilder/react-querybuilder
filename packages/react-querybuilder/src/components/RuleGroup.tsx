import * as React from 'react';
import { Fragment } from 'react';
import { TestID } from '../defaults';
import { useRuleGroup, useStopEventPropagation } from '../hooks';
import type { RuleGroupArray, RuleGroupICArray, RuleGroupProps } from '../types';
import { isRuleGroup, isRuleGroupType } from '../utils';

/**
 * Default component to display {@link RuleGroupType} and {@link RuleGroupTypeIC}
 * objects. This is actually a small wrapper around {@link RuleGroupHeaderComponents}
 * and {@link RuleGroupBodyComponents}.
 */
export const RuleGroup = React.memo((props: RuleGroupProps) => {
  const rg = { ...props, ...useRuleGroup(props) };

  rg.addRule = useStopEventPropagation(rg.addRule);
  rg.addGroup = useStopEventPropagation(rg.addGroup);
  rg.cloneGroup = useStopEventPropagation(rg.cloneGroup);
  rg.toggleLockGroup = useStopEventPropagation(rg.toggleLockGroup);
  rg.removeGroup = useStopEventPropagation(rg.removeGroup);

  return (
    <div
      ref={rg.previewRef}
      className={rg.outerClassName}
      data-testid={TestID.ruleGroup}
      data-dragmonitorid={rg.dragMonitorId}
      data-dropmonitorid={rg.dropMonitorId}
      data-rule-group-id={rg.id}
      data-level={rg.path.length}
      data-path={JSON.stringify(rg.path)}>
      <div ref={rg.dropRef} className={rg.classNames.header}>
        {/* TODO: do better than `as any` here */}
        <RuleGroupHeaderComponents {...(rg as any)} />
      </div>
      <div className={rg.classNames.body}>
        {/* TODO: do better than `as any` here */}
        <RuleGroupBodyComponents {...(rg as any)} />
      </div>
    </div>
  );
});

RuleGroup.displayName = 'RuleGroup';

/**
 * Renders a `React.Fragment` containing an array of form controls for managing
 * a {@link RuleGroupType} or {@link RuleGroupTypeIC}.
 */
export const RuleGroupHeaderComponents = React.memo(
  (rg: RuleGroupProps & ReturnType<typeof useRuleGroup>) => {
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
          removeGroupAction: RemoveGroupActionControlElement,
        },
      },
    } = rg;

    return (
      <>
        {rg.path.length > 0 && rg.schema.showShiftActions && (
          <ShiftActionsControlElement
            testID={TestID.shiftActions}
            level={rg.path.length}
            path={rg.path}
            titles={{
              shiftUp: rg.translations.shiftActionUp.title,
              shiftDown: rg.translations.shiftActionDown.title,
            }}
            labels={{
              shiftUp: rg.translations.shiftActionUp.label,
              shiftDown: rg.translations.shiftActionDown.label,
            }}
            className={rg.classNames.shiftActions}
            disabled={rg.disabled}
            context={rg.context}
            validation={rg.validationResult}
            schema={rg.schema}
            ruleOrGroup={rg.ruleGroup}
            lastInGroup={rg.lastInGroup}
          />
        )}
        {rg.path.length > 0 && rg.schema.enableDragAndDrop && (
          <DragHandleControlElement
            testID={TestID.dragHandle}
            ref={rg.dragRef}
            level={rg.path.length}
            path={rg.path}
            title={rg.translations.dragHandle.title}
            label={rg.translations.dragHandle.label}
            className={rg.classNames.dragHandle}
            disabled={rg.disabled}
            context={rg.context}
            validation={rg.validationResult}
            schema={rg.schema}
            ruleOrGroup={rg.ruleGroup}
          />
        )}
        {!rg.schema.showCombinatorsBetweenRules && !rg.schema.independentCombinators && (
          <CombinatorSelectorControlElement
            testID={TestID.combinators}
            options={rg.schema.combinators}
            value={rg.combinator}
            title={rg.translations.combinators.title}
            className={rg.classNames.combinators}
            handleOnChange={rg.onCombinatorChange}
            rules={rg.ruleGroup.rules}
            level={rg.path.length}
            path={rg.path}
            disabled={rg.disabled}
            context={rg.context}
            validation={rg.validationResult}
            schema={rg.schema}
          />
        )}
        {rg.schema.showNotToggle && (
          <NotToggleControlElement
            testID={TestID.notToggle}
            className={rg.classNames.notToggle}
            title={rg.translations.notToggle.title}
            label={rg.translations.notToggle.label}
            checked={rg.ruleGroup.not}
            handleOnChange={rg.onNotToggleChange}
            level={rg.path.length}
            disabled={rg.disabled}
            path={rg.path}
            context={rg.context}
            validation={rg.validationResult}
            schema={rg.schema}
            ruleGroup={rg.ruleGroup}
          />
        )}
        <AddRuleActionControlElement
          testID={TestID.addRule}
          label={rg.translations.addRule.label}
          title={rg.translations.addRule.title}
          className={rg.classNames.addRule}
          handleOnClick={rg.addRule}
          rules={rg.ruleGroup.rules}
          level={rg.path.length}
          path={rg.path}
          disabled={rg.disabled}
          context={rg.context}
          validation={rg.validationResult}
          ruleOrGroup={rg.ruleGroup}
          schema={rg.schema}
        />
        <AddGroupActionControlElement
          testID={TestID.addGroup}
          label={rg.translations.addGroup.label}
          title={rg.translations.addGroup.title}
          className={rg.classNames.addGroup}
          handleOnClick={rg.addGroup}
          rules={rg.ruleGroup.rules}
          level={rg.path.length}
          path={rg.path}
          disabled={rg.disabled}
          context={rg.context}
          validation={rg.validationResult}
          ruleOrGroup={rg.ruleGroup}
          schema={rg.schema}
        />
        {rg.schema.showCloneButtons && rg.path.length >= 1 && (
          <CloneGroupActionControlElement
            testID={TestID.cloneGroup}
            label={rg.translations.cloneRuleGroup.label}
            title={rg.translations.cloneRuleGroup.title}
            className={rg.classNames.cloneGroup}
            handleOnClick={rg.cloneGroup}
            rules={rg.ruleGroup.rules}
            level={rg.path.length}
            path={rg.path}
            disabled={rg.disabled}
            context={rg.context}
            validation={rg.validationResult}
            ruleOrGroup={rg.ruleGroup}
            schema={rg.schema}
          />
        )}
        {rg.schema.showLockButtons && (
          <LockGroupActionControlElement
            testID={TestID.lockGroup}
            label={rg.translations.lockGroup.label}
            title={rg.translations.lockGroup.title}
            className={rg.classNames.lockGroup}
            handleOnClick={rg.toggleLockGroup}
            rules={rg.ruleGroup.rules}
            level={rg.path.length}
            path={rg.path}
            disabled={rg.disabled}
            disabledTranslation={rg.parentDisabled ? undefined : rg.translations.lockGroupDisabled}
            context={rg.context}
            validation={rg.validationResult}
            ruleOrGroup={rg.ruleGroup}
            schema={rg.schema}
          />
        )}
        {rg.path.length > 0 && (
          <RemoveGroupActionControlElement
            testID={TestID.removeGroup}
            label={rg.translations.removeGroup.label}
            title={rg.translations.removeGroup.title}
            className={rg.classNames.removeGroup}
            handleOnClick={rg.removeGroup}
            rules={rg.ruleGroup.rules}
            level={rg.path.length}
            path={rg.path}
            disabled={rg.disabled}
            context={rg.context}
            validation={rg.validationResult}
            ruleOrGroup={rg.ruleGroup}
            schema={rg.schema}
          />
        )}
      </>
    );
  }
);

/**
 * Renders a `React.Fragment` containing an array of either (1) {@link Rule} and
 * {@link RuleGroup}, or (2) {@link Rule}, {@link RuleGroup}, and {@link InlineCombinator}.
 */
export const RuleGroupBodyComponents = React.memo(
  (rg: RuleGroupProps & ReturnType<typeof useRuleGroup>) => {
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
      <>
        {(rg.ruleGroup.rules as RuleGroupICArray | RuleGroupArray).map(
          (r, idx, { length: ruleArrayLength }) => {
            const thisPathMemo = rg.pathsMemo[idx];
            const thisPath = thisPathMemo.path;
            const thisPathDisabled = thisPathMemo.disabled || (typeof r !== 'string' && r.disabled);
            const lastInGroup = idx === ruleArrayLength - 1;
            const key = typeof r === 'string' ? [...thisPath, r].join('-') : r.id;
            return (
              <Fragment key={key}>
                {idx > 0 &&
                  !rg.schema.independentCombinators &&
                  rg.schema.showCombinatorsBetweenRules && (
                    <InlineCombinatorControlElement
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
                      independentCombinators={rg.schema.independentCombinators}
                      schema={rg.schema}
                    />
                  )}
                {typeof r === 'string' ? (
                  <InlineCombinatorControlElement
                    options={rg.schema.combinators}
                    value={r}
                    title={rg.translations.combinators.title}
                    className={rg.classNames.combinators}
                    handleOnChange={val => rg.onIndependentCombinatorChange(val, idx)}
                    rules={rg.ruleGroup.rules}
                    level={rg.path.length}
                    context={rg.context}
                    validation={rg.validationResult}
                    component={CombinatorSelectorControlElement}
                    path={thisPath}
                    disabled={thisPathDisabled}
                    independentCombinators={rg.schema.independentCombinators}
                    schema={rg.schema}
                  />
                ) : isRuleGroup(r) ? (
                  <RuleGroupControlElement
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
                    context={rg.context}
                    lastInGroup={lastInGroup}
                  />
                ) : (
                  <RuleControlElement
                    id={r.id!}
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
                    translations={rg.translations}
                    context={rg.context}
                    lastInGroup={lastInGroup}
                  />
                )}
              </Fragment>
            );
          }
        )}
      </>
    );
  }
);
