import * as React from 'react';
import { Fragment } from 'react';
import { TestID } from '../defaults';
import { useRuleGroup, useStopEventPropagation } from '../hooks';
import type { RuleGroupArray, RuleGroupICArray, RuleGroupProps } from '../types';
import { isRuleGroup, isRuleGroupType, pathsAreEqual } from '../utils';

/**
 * Default component to display {@link RuleGroupType} and {@link RuleGroupTypeIC}
 * objects. This is actually a small wrapper around {@link RuleGroupHeaderComponents}
 * and {@link RuleGroupBodyComponents}.
 */
export const RuleGroup = React.memo((props: RuleGroupProps) => {
  const rg = useRuleGroup(props);

  rg.addRule = useStopEventPropagation(rg.addRule);
  rg.addGroup = useStopEventPropagation(rg.addGroup);
  rg.cloneGroup = useStopEventPropagation(rg.cloneGroup);
  rg.toggleLockGroup = useStopEventPropagation(rg.toggleLockGroup);
  rg.removeGroup = useStopEventPropagation(rg.removeGroup);
  rg.shiftGroupUp = useStopEventPropagation(rg.shiftGroupUp);
  rg.shiftGroupDown = useStopEventPropagation(rg.shiftGroupDown);

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
        <RuleGroupHeaderComponents {...(rg as Parameters<typeof RuleGroupHeaderComponents>[0])} />
      </div>
      <div className={rg.classNames.body}>
        <RuleGroupBodyComponents {...(rg as Parameters<typeof RuleGroupBodyComponents>[0])} />
      </div>
    </div>
  );
});

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
        {rg.schema.showShiftActions && rg.path.length > 0 && (
          <ShiftActionsControlElement
            key={TestID.shiftActions}
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
            shiftUp={rg.shiftGroupUp}
            shiftDown={rg.shiftGroupDown}
            shiftUpDisabled={rg.shiftUpDisabled}
            shiftDownDisabled={rg.shiftDownDisabled}
            context={rg.context}
            validation={rg.validationResult}
            schema={rg.schema}
            ruleOrGroup={rg.ruleGroup}
          />
        )}
        {rg.path.length > 0 && rg.schema.enableDragAndDrop && (
          <DragHandleControlElement
            key={TestID.dragHandle}
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
            key={TestID.combinators}
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
            key={TestID.notToggle}
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
          key={TestID.addRule}
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
          key={TestID.addGroup}
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
            key={TestID.cloneGroup}
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
            key={TestID.lockGroup}
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
            key={TestID.removeGroup}
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
                      independentCombinators={rg.schema.independentCombinators}
                      schema={rg.schema}
                    />
                  )}
                {typeof r === 'string' ? (
                  <InlineCombinatorControlElement
                    key={`${TestID.inlineCombinator}-independent`}
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
                    shiftUpDisabled={shiftUpDisabled}
                    shiftDownDisabled={shiftDownDisabled}
                    context={rg.context}
                  />
                ) : (
                  <RuleControlElement
                    key={TestID.rule}
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
                    shiftUpDisabled={shiftUpDisabled}
                    shiftDownDisabled={shiftDownDisabled}
                    context={rg.context}
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
