import { clsx } from 'clsx';
import { useCallback, useMemo } from 'react';
import { standardClassnames } from '../defaults';
import { useDeprecatedProps, useReactDndWarning } from '../hooks';
import type { RuleGroupProps, RuleGroupTypeAny } from '../types';
import {
  getFirstOption,
  getOption,
  getParentPath,
  getValidationClassNames,
  pathsAreEqual,
} from '../utils';

/**
 * Prepares all values and methods used by the {@link RuleGroup} component.
 */
export const useRuleGroup = (props: RuleGroupProps) => {
  const {
    id,
    path,
    ruleGroup: ruleGroupProp,
    schema,
    actions: { onGroupAdd, onGroupRemove, onPropChange, onRuleAdd, moveRule },
    disabled: disabledProp,
    parentDisabled,
    combinator: combinatorProp,
    rules: rulesProp,
    not: notProp,
    // Drag-and-drop
    dragMonitorId = '',
    dropMonitorId = '',
    previewRef = null,
    dragRef = null,
    dropRef = null,
    isDragging = false,
    isOver = false,
  } = props;

  const {
    classNames: classNamesProp,
    combinators,
    createRule,
    createRuleGroup,
    independentCombinators,
    validationMap,
    enableDragAndDrop,
    getRuleGroupClassname,
  } = schema;

  useDeprecatedProps('ruleGroup', !!ruleGroupProp);

  useReactDndWarning(
    enableDragAndDrop,
    !!(dragMonitorId || dropMonitorId || previewRef || dragRef || dropRef)
  );

  const disabled = !!parentDisabled || !!disabledProp;

  const combinator = useMemo(
    () =>
      ruleGroupProp && 'combinator' in ruleGroupProp
        ? ruleGroupProp.combinator
        : !ruleGroupProp
        ? combinatorProp ?? getFirstOption(combinators)!
        : getFirstOption(combinators)!,
    [combinatorProp, combinators, ruleGroupProp]
  );

  const ruleGroup = useMemo(
    () =>
      ruleGroupProp
        ? { ...ruleGroupProp, ...(!independentCombinators ? { combinator } : {}) }
        : ({ rules: rulesProp, not: notProp } as RuleGroupTypeAny),
    [combinator, independentCombinators, notProp, ruleGroupProp, rulesProp]
  );

  const classNames = useMemo(
    () => ({
      header: clsx(standardClassnames.header, classNamesProp.header, {
        [standardClassnames.dndOver]: isOver,
      }),
      dragHandle: clsx(standardClassnames.dragHandle, classNamesProp.dragHandle),
      combinators: clsx(standardClassnames.combinators, classNamesProp.combinators),
      notToggle: clsx(standardClassnames.notToggle, classNamesProp.notToggle),
      addRule: clsx(standardClassnames.addRule, classNamesProp.addRule),
      addGroup: clsx(standardClassnames.addGroup, classNamesProp.addGroup),
      cloneGroup: clsx(standardClassnames.cloneGroup, classNamesProp.cloneGroup),
      lockGroup: clsx(standardClassnames.lockGroup, classNamesProp.lockGroup),
      removeGroup: clsx(standardClassnames.removeGroup, classNamesProp.removeGroup),
      body: clsx(standardClassnames.body, classNamesProp.body),
    }),
    [
      classNamesProp.addGroup,
      classNamesProp.addRule,
      classNamesProp.body,
      classNamesProp.cloneGroup,
      classNamesProp.combinators,
      classNamesProp.dragHandle,
      classNamesProp.header,
      classNamesProp.lockGroup,
      classNamesProp.notToggle,
      classNamesProp.removeGroup,
      isOver,
    ]
  );

  const onCombinatorChange = useCallback(
    (value: any, _context?: any) => {
      if (!disabled) {
        onPropChange('combinator', value, path);
      }
    },
    [disabled, onPropChange, path]
  );

  const onIndependentCombinatorChange = useCallback(
    (value: any, index: number, _context?: any) => {
      if (!disabled) {
        onPropChange('combinator', value, path.concat([index]));
      }
    },
    [disabled, onPropChange, path]
  );

  const onNotToggleChange = useCallback(
    (checked: boolean, _context?: any) => {
      if (!disabled) {
        onPropChange('not', checked, path);
      }
    },
    [disabled, onPropChange, path]
  );

  const addRule = useCallback(
    (_event?: any, context?: any) => {
      if (!disabled) {
        const newRule = createRule();
        onRuleAdd(newRule, path, context);
      }
    },
    [createRule, disabled, onRuleAdd, path]
  );

  const addGroup = useCallback(
    (_event?: any, context?: any) => {
      if (!disabled) {
        const newGroup = createRuleGroup();
        onGroupAdd(newGroup, path, context);
      }
    },
    [createRuleGroup, disabled, onGroupAdd, path]
  );

  const cloneGroup = useCallback(
    (_event?: any, _context?: any) => {
      if (!disabled) {
        const newPath = [...getParentPath(path), path[path.length - 1] + 1];
        moveRule(path, newPath, true);
      }
    },
    [disabled, moveRule, path]
  );

  const toggleLockGroup = useCallback(
    (_event?: any, _context?: any) => {
      onPropChange('disabled', !disabled, path);
    },
    [disabled, onPropChange, path]
  );

  const removeGroup = useCallback(
    (_event?: any, _context?: any) => {
      if (!disabled) {
        onGroupRemove(path);
      }
    },
    [disabled, onGroupRemove, path]
  );

  const validationResult = useMemo(
    () => validationMap[id ?? /* istanbul ignore next */ ''],
    [id, validationMap]
  );
  const validationClassName = useMemo(
    () => getValidationClassNames(validationResult),
    [validationResult]
  );
  const combinatorBasedClassName = useMemo(
    () => (independentCombinators ? null : getOption(combinators, combinator)?.className ?? ''),
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
        standardClassnames.ruleGroup,
        classNamesProp.ruleGroup,
        {
          [standardClassnames.disabled]: disabled,
          [standardClassnames.dndDragging]: isDragging,
        },
        validationClassName
      ),
    [
      classNamesProp.ruleGroup,
      combinatorBasedClassName,
      disabled,
      ruleGroupClassname,
      isDragging,
      validationClassName,
    ]
  );

  // Memoize the path info so every render doesn't generate a new array
  const pathsMemo = useMemo(() => {
    const paths: { path: number[]; disabled: boolean }[] = [];
    for (let i = 0; i < ruleGroup.rules.length; i++) {
      const thisPath = [...path, i];
      paths[i] = {
        path: thisPath,
        disabled: disabled || schema.disabledPaths.some(p => pathsAreEqual(thisPath, p)),
      };
    }
    return paths;
  }, [disabled, path, ruleGroup.rules.length, schema.disabledPaths]);

  return {
    addGroup,
    addRule,
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
    toggleLockGroup,
    validationClassName,
    validationResult,
  };
};
