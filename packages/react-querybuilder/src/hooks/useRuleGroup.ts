import { clsx } from 'clsx';
import { useMemo } from 'react';
import { standardClassnames } from '../defaults';
import type { RuleGroupProps, RuleGroupType, RuleGroupTypeAny } from '../types';
import {
  getFirstOption,
  getOption,
  getParentPath,
  getValidationClassNames,
  useDeprecatedProps,
  useReactDndWarning,
} from '../utils';

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

  const ruleGroup = ruleGroupProp
    ? { ...ruleGroupProp }
    : ({ rules: rulesProp, not: notProp } as RuleGroupTypeAny);

  const combinator =
    ruleGroupProp && 'combinator' in ruleGroupProp
      ? ruleGroupProp.combinator
      : !ruleGroupProp
      ? combinatorProp ?? getFirstOption(combinators)!
      : getFirstOption(combinators)!;

  if (!independentCombinators) {
    (ruleGroup as RuleGroupType).combinator = combinator;
  }

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

  const onCombinatorChange = (value: any, _context?: any) => {
    if (!disabled) {
      onPropChange('combinator', value, path);
    }
  };

  const onIndependentCombinatorChange = (value: any, index: number, _context?: any) => {
    if (!disabled) {
      onPropChange('combinator', value, path.concat([index]));
    }
  };

  const onNotToggleChange = (checked: boolean, _context?: any) => {
    if (!disabled) {
      onPropChange('not', checked, path);
    }
  };

  const addRule = (_event?: any, context?: any) => {
    if (!disabled) {
      const newRule = createRule();
      onRuleAdd(newRule, path, context);
    }
  };

  const addGroup = (_event?: any, context?: any) => {
    if (!disabled) {
      const newGroup = createRuleGroup();
      onGroupAdd(newGroup, path, context);
    }
  };

  const cloneGroup = (_event?: any, _context?: any) => {
    if (!disabled) {
      const newPath = [...getParentPath(path), path[path.length - 1] + 1];
      moveRule(path, newPath, true);
    }
  };

  const toggleLockGroup = (_event?: any, _context?: any) => {
    onPropChange('disabled', !disabled, path);
  };

  const removeGroup = (_event?: any, _context?: any) => {
    if (!disabled) {
      onGroupRemove(path);
    }
  };

  const validationResult = validationMap[id ?? /* istanbul ignore next */ ''];
  const validationClassName = getValidationClassNames(validationResult);
  const combinatorBasedClassName = useMemo(
    () => (independentCombinators ? null : getOption(combinators, combinator)?.className ?? ''),
    [combinator, combinators, independentCombinators]
  );

  const outerClassName = clsx(
    getRuleGroupClassname(ruleGroup),
    combinatorBasedClassName,
    standardClassnames.ruleGroup,
    classNamesProp.ruleGroup,
    {
      [standardClassnames.disabled]: disabled,
      [standardClassnames.dndDragging]: isDragging,
    },
    validationClassName
  );

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
    previewRef,
    removeGroup,
    ruleGroup,
    toggleLockGroup,
    validationClassName,
    validationResult,
  };
};
