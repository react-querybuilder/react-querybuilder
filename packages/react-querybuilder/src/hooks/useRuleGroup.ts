import type { MouseEvent } from 'react';
import { useCallback, useMemo } from 'react';
import { standardClassnames } from '../defaults';
import { useDeprecatedProps, useReactDndWarning } from '../hooks';
import type {
  Classnames,
  ActionElementEventHandler,
  Path,
  RuleGroupProps,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleGroupTypeIC,
  ValidationResult,
} from '../types';
import {
  getFirstOption,
  getOption,
  getParentPath,
  getValidationClassNames,
  isRuleGroupType,
  pathsAreEqual,
} from '../utils';
import { clsx } from '../utils/clsx';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type UseRuleGroup = Omit<RuleGroupProps, 'ruleGroup'> & {
  addGroup: ActionElementEventHandler;
  addRule: ActionElementEventHandler;
  accessibleDescription: string;
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
    | 'removeGroup'
    | 'body'
  >;
  cloneGroup: ActionElementEventHandler;
  onCombinatorChange: ActionElementEventHandler;
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
  validationClassName: string;
  validationResult: boolean | ValidationResult;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Prepares all values and methods used by the {@link RuleGroup} component.
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
    },
    actions: { onGroupAdd, onGroupRemove, onPropChange, onRuleAdd, moveRule },
    disabled: disabledProp,
    parentDisabled,
    shiftUpDisabled,
    shiftDownDisabled,
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

  useDeprecatedProps('ruleGroup', !ruleGroupProp);

  useReactDndWarning(
    enableDragAndDrop,
    !!(dragMonitorId || dropMonitorId || previewRef || dragRef || dropRef)
  );

  const disabled = !!parentDisabled || !!disabledProp;

  const combinator = useMemo(
    () =>
      ruleGroupProp && isRuleGroupType(ruleGroupProp)
        ? ruleGroupProp.combinator
        : !ruleGroupProp
          ? (combinatorProp ?? getFirstOption(combinators)!)
          : getFirstOption(combinators)!,
    [combinatorProp, combinators, ruleGroupProp]
  );

  // TODO: Type this properly with generics
  const ruleGroup = useMemo((): RuleGroupTypeAny => {
    if (ruleGroupProp) {
      if (ruleGroupProp.combinator === combinator || independentCombinators) {
        return ruleGroupProp;
      }
      const newRG = structuredClone(ruleGroupProp);
      newRG.combinator = combinator;
      return newRG;
    }
    return { rules: rulesProp, not: notProp } as RuleGroupTypeAny;
  }, [combinator, independentCombinators, notProp, ruleGroupProp, rulesProp]);

  const classNames = useMemo(
    () => ({
      header: clsx(standardClassnames.header, classNamesProp.header, {
        [standardClassnames.dndOver]: isOver,
      }),
      shiftActions: clsx(standardClassnames.shiftActions, classNamesProp.shiftActions),
      dragHandle: clsx(standardClassnames.dragHandle, classNamesProp.dragHandle),
      combinators: clsx(
        standardClassnames.combinators,
        classNamesProp.valueSelector,
        classNamesProp.combinators
      ),
      notToggle: clsx(standardClassnames.notToggle, classNamesProp.notToggle),
      addRule: clsx(
        standardClassnames.addRule,
        classNamesProp.actionElement,
        classNamesProp.addRule
      ),
      addGroup: clsx(
        standardClassnames.addGroup,
        classNamesProp.actionElement,
        classNamesProp.addGroup
      ),
      cloneGroup: clsx(
        standardClassnames.cloneGroup,
        classNamesProp.actionElement,
        classNamesProp.cloneGroup
      ),
      lockGroup: clsx(
        standardClassnames.lockGroup,
        classNamesProp.actionElement,
        classNamesProp.lockGroup
      ),
      removeGroup: clsx(
        standardClassnames.removeGroup,
        classNamesProp.actionElement,
        classNamesProp.removeGroup
      ),
      body: clsx(standardClassnames.body, classNamesProp.body),
    }),
    [
      classNamesProp.actionElement,
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
      classNamesProp.shiftActions,
      classNamesProp.valueSelector,
      isOver,
    ]
  );

  const onCombinatorChange: ActionElementEventHandler = useCallback(
    value => {
      if (!disabled) {
        onPropChange('combinator', value, path);
      }
    },
    [disabled, onPropChange, path]
  );

  const onIndependentCombinatorChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (value: any, index: number, _context?: any) => {
      if (!disabled) {
        onPropChange('combinator', value, path.concat([index]));
      }
    },
    [disabled, onPropChange, path]
  );

  const onNotToggleChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        const newGroup = createRuleGroup(independentCombinators);
        onGroupAdd(newGroup, path, context);
      }
    },
    [createRuleGroup, disabled, independentCombinators, onGroupAdd, path]
  );

  const cloneGroup: ActionElementEventHandler = useCallback(() => {
    if (!disabled) {
      const newPath = [...getParentPath(path), path[path.length - 1] + 1];
      moveRule(path, newPath, true);
    }
  }, [disabled, moveRule, path]);

  const shiftGroupUp = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event?: MouseEvent, _context?: any) => {
      if (!disabled && !shiftUpDisabled) {
        moveRule(path, 'up', event?.altKey);
      }
    },
    [disabled, moveRule, path, shiftUpDisabled]
  );

  const shiftGroupDown = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const removeGroup: ActionElementEventHandler = useCallback(() => {
    if (!disabled) {
      onGroupRemove(path);
    }
  }, [disabled, onGroupRemove, path]);

  const validationResult = useMemo(
    () => validationMap[id ?? /* istanbul ignore next */ ''],
    [id, validationMap]
  );
  const validationClassName = useMemo(
    () => getValidationClassNames(validationResult),
    [validationResult]
  );
  const combinatorBasedClassName = useMemo(
    () => (independentCombinators ? null : (getOption(combinators, combinator)?.className ?? '')),
    [combinator, combinators, independentCombinators]
  );

  const ruleGroupClassname = useMemo(
    () => getRuleGroupClassname(ruleGroup as RuleGroupTypeAny),
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
    const paths: { path: Path; disabled: boolean }[] = [];
    for (let i = 0; i < ruleGroup.rules.length; i++) {
      const thisPath = [...path, i];
      paths[i] = {
        path: thisPath,
        disabled: disabled || disabledPaths.some(p => pathsAreEqual(thisPath, p)),
      };
    }
    return paths;
  }, [disabled, path, ruleGroup.rules.length, disabledPaths]);

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
    validationClassName,
    validationResult,
  };
};
