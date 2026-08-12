import type { ControlKey } from '@react-querybuilder/core';
import { controlKeys, controlKind, controlPropKeys } from '@react-querybuilder/core';
import type { FullField } from '@react-querybuilder/core';
import type { UseRuleGroup } from '../components/RuleGroup';
import { defaultControlElements } from '../defaults';
import type {
  ActionProps,
  CombinatorSelectorProps,
  ControlElementsProp,
  DragHandleProps,
  FieldSelectorProps,
  InlineCombinatorProps,
  MatchModeEditorProps,
  NotToggleProps,
  OperatorSelectorProps,
  RuleGroupProps,
  RuleProps,
  ShiftActionsProps,
  UndoRedoActionsProps,
  ValueEditorProps,
  ValueSelectorProps,
  ValueSourceSelectorProps,
} from './props';

// #region Compile-time gates
// These are checked by `tsc` (`bun typecheck:rqb`), not at runtime. Each fails to compile if
// core's runtime data and this package's prop types disagree in either direction.

type Assert<T extends true> = T;
/** `true` when both sides have the same members; otherwise the offending names, so that the
 * compiler error names them instead of just reporting `false`. */
type SameKeys<A extends string, B extends string> = [Exclude<A, B>] extends [never]
  ? [Exclude<B, A>] extends [never]
    ? true
    : ['missing from list:', Exclude<B, A>]
  : ['not a real prop:', Exclude<A, B>];
type PropsMatch<K extends ControlKey, P> = SameKeys<
  (typeof controlPropKeys)[K][number],
  Extract<keyof P, string>
>;

type _controlKeysMatchControls = Assert<
  SameKeys<ControlKey, Extract<keyof ControlElementsProp<FullField, string>, string>>
>;

type _actionElement = Assert<PropsMatch<'actionElement', ActionProps>>;
type _addGroupAction = Assert<PropsMatch<'addGroupAction', ActionProps>>;
type _addRuleAction = Assert<PropsMatch<'addRuleAction', ActionProps>>;
type _cloneGroupAction = Assert<PropsMatch<'cloneGroupAction', ActionProps>>;
type _cloneRuleAction = Assert<PropsMatch<'cloneRuleAction', ActionProps>>;
type _combinatorSelector = Assert<PropsMatch<'combinatorSelector', CombinatorSelectorProps>>;
type _dragHandle = Assert<PropsMatch<'dragHandle', DragHandleProps>>;
type _fieldSelector = Assert<PropsMatch<'fieldSelector', FieldSelectorProps>>;
type _inlineCombinator = Assert<PropsMatch<'inlineCombinator', InlineCombinatorProps>>;
type _lockGroupAction = Assert<PropsMatch<'lockGroupAction', ActionProps>>;
type _lockRuleAction = Assert<PropsMatch<'lockRuleAction', ActionProps>>;
type _matchModeEditor = Assert<PropsMatch<'matchModeEditor', MatchModeEditorProps>>;
type _muteGroupAction = Assert<PropsMatch<'muteGroupAction', ActionProps>>;
type _muteRuleAction = Assert<PropsMatch<'muteRuleAction', ActionProps>>;
type _notToggle = Assert<PropsMatch<'notToggle', NotToggleProps>>;
type _operatorSelector = Assert<PropsMatch<'operatorSelector', OperatorSelectorProps>>;
type _removeGroupAction = Assert<PropsMatch<'removeGroupAction', ActionProps>>;
type _removeRuleAction = Assert<PropsMatch<'removeRuleAction', ActionProps>>;
type _rule = Assert<PropsMatch<'rule', RuleProps>>;
type _ruleGroup = Assert<PropsMatch<'ruleGroup', RuleGroupProps>>;
type _ruleGroupBodyElements = Assert<PropsMatch<'ruleGroupBodyElements', UseRuleGroup>>;
type _ruleGroupHeaderElements = Assert<PropsMatch<'ruleGroupHeaderElements', UseRuleGroup>>;
type _shiftActions = Assert<PropsMatch<'shiftActions', ShiftActionsProps>>;
type _undoRedoActions = Assert<PropsMatch<'undoRedoActions', UndoRedoActionsProps>>;
type _valueEditor = Assert<PropsMatch<'valueEditor', ValueEditorProps>>;
type _valueSelector = Assert<PropsMatch<'valueSelector', ValueSelectorProps>>;
type _valueSourceSelector = Assert<PropsMatch<'valueSourceSelector', ValueSourceSelectorProps>>;

// #endregion

describe('controlKeys', () => {
  it('matches defaultControlElements exactly', () => {
    expect(Object.keys(defaultControlElements).toSorted()).toEqual([...controlKeys].toSorted());
  });

  it('has no duplicates', () => {
    expect(new Set(controlKeys)).toHaveLength(controlKeys.length);
  });
});

describe('controlPropKeys', () => {
  it('has an entry for every control', () => {
    expect(Object.keys(controlPropKeys).toSorted()).toEqual([...controlKeys].toSorted());
  });

  it('has no duplicate prop names within an entry', () => {
    for (const key of controlKeys) {
      const props = controlPropKeys[key];
      // Keyed by control name so a failure names the offender.
      expect({ [key]: new Set(props).size }).toEqual({ [key]: props.length });
    }
  });
});

describe('controlKind', () => {
  it('has an entry for every control', () => {
    expect(Object.keys(controlKind).toSorted()).toEqual([...controlKeys].toSorted());
  });

  // Locks controlKind to the bulk-override rule `useMergedContext` actually implements. If that
  // rule changes, this test and `controlKind` must change together.
  it('agrees with the name-suffix rule in useMergedContext', () => {
    for (const key of controlKeys) {
      const expected =
        key !== 'actionElement' && key.endsWith('Action')
          ? 'action'
          : key !== 'valueSelector' && key.endsWith('Selector')
            ? 'selector'
            : null;
      expect({ [key]: controlKind[key] }).toEqual({ [key]: expected });
    }
  });
});
