import * as React from 'react';
import { Fragment } from 'react';
import { TestID } from '../defaults';
import { useEventMethods, useRuleGroup } from '../hooks';
import type { RuleGroupProps } from '../types';
import { pathsAreEqual } from '../utils';

export const RuleGroup = (props: RuleGroupProps) => {
  const rg = { ...props, ...useRuleGroup(props) };

  const { addRule, addGroup, cloneGroup, toggleLockGroup, removeGroup } = rg;
  const eventMethods = useEventMethods({
    addRule,
    addGroup,
    cloneGroup,
    toggleLockGroup,
    removeGroup,
  });

  const subComponentProps = { ...rg, ...eventMethods };

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
        <RuleGroupHeaderComponents {...subComponentProps} />
      </div>
      <div className={rg.classNames.body}>
        <RuleGroupBodyComponents {...subComponentProps} />
      </div>
    </div>
  );
};

RuleGroup.displayName = 'RuleGroup';

export const RuleGroupHeaderComponents = (rg: RuleGroupProps & ReturnType<typeof useRuleGroup>) => {
  const {
    schema: {
      controls: {
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
      {rg.path.length > 0 && (
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
      {rg.path.length >= 1 && (
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
};

export const RuleGroupBodyComponents = (rg: RuleGroupProps & ReturnType<typeof useRuleGroup>) => {
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
      {rg.ruleGroup.rules.map((r, idx) => {
        const thisPath = [...rg.path, idx];
        const thisPathDisabled =
          rg.disabled ||
          (typeof r !== 'string' && r.disabled) ||
          rg.schema.disabledPaths.some(p => pathsAreEqual(thisPath, p));
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
            ) : 'rules' in r ? (
              <RuleGroupControlElement
                id={r.id}
                schema={rg.schema}
                actions={rg.actions}
                path={thisPath}
                translations={rg.translations}
                ruleGroup={r}
                rules={r.rules}
                combinator={'combinator' in r ? r.combinator : undefined}
                not={!!r.not}
                disabled={thisPathDisabled}
                parentDisabled={rg.parentDisabled || rg.disabled}
                context={rg.context}
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
              />
            )}
          </Fragment>
        );
      })}
    </>
  );
};
