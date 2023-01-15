import { Fragment, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { pathsAreEqual, TestID, useRuleGroup } from 'react-querybuilder';
import type { RuleGroupNativeProps, RuleGroupStyles, RuleGroupStyleSheets } from './types';

const baseStyles: RuleGroupStyles = {
  ruleGroup: {
    borderWidth: 1,
    marginBottom: 10,
  },
  ruleGroupHeader: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingRight: 10,
    paddingLeft: 10,
  },
  ruleGroupBody: {
    paddingTop: 10,
    paddingRight: 10,
    paddingLeft: 10,
  },
  combinatorSelector: {
    height: 30,
    width: 50,
  },
};

export const RuleGroupNative = (props: RuleGroupNativeProps) => {
  const rg = { ...props, ...useRuleGroup(props) };

  const {
    schema: {
      controls: {
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
    },
  } = rg;

  const styles = useMemo(
    (): RuleGroupStyleSheets => ({
      ruleGroup: StyleSheet.flatten([baseStyles.ruleGroup, props.styles?.ruleGroup]),
      ruleGroupHeader: StyleSheet.flatten([
        baseStyles.ruleGroupHeader,
        props.styles?.ruleGroupHeader,
      ]),
      ruleGroupBody: StyleSheet.flatten([baseStyles.ruleGroupBody, props.styles?.ruleGroupBody]),
      combinatorSelector: StyleSheet.flatten([
        baseStyles.combinatorSelector,
        props.styles?.combinatorSelector,
      ]),
      combinatorOption: StyleSheet.flatten([
        baseStyles.combinatorOption,
        props.styles?.combinatorOption,
      ]),
      inlineCombinator: StyleSheet.flatten([
        baseStyles.inlineCombinator,
        props.styles?.inlineCombinator,
      ]),
    }),
    [props.styles]
  );

  return (
    <View style={styles.ruleGroup}>
      <View style={styles.ruleGroupHeader}>
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
          />
        )}
      </View>
      <View style={styles.ruleGroupBody}>
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
                />
              ) : 'rules' in r ? (
                <RuleGroupControlElement
                  id={r.id}
                  schema={rg.schema}
                  actions={rg.actions}
                  path={thisPath}
                  translations={rg.translations}
                  ruleGroup={r}
                  disabled={thisPathDisabled}
                  parentDisabled={rg.parentDisabled || rg.disabled}
                  context={rg.context}
                />
              ) : (
                <RuleControlElement
                  id={r.id!}
                  rule={r}
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
      </View>
    </View>
  );
};
