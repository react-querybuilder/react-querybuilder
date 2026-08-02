import type { ClassValue } from 'clsx';
import { standardClassnames } from '../defaults';
import type { Classname, Classnames } from '../types';
import { clsx } from './clsx';

/** Classname keys that have both a standard class and a `controlClassnames` entry. */
type StandardClassnameKey = keyof typeof standardClassnames & keyof Classnames;

/**
 * A classname applied only when `when` returns true for the current state.
 *
 * `key` is used to look up both the standard classname and the corresponding `controlClassnames`
 * entry. Set `standardOnly` when the standard class is conditional but no custom class
 * corresponds to it.
 */
export interface ClassnameCondition<S> {
  key: StandardClassnameKey;
  when: (state: S) => boolean | undefined;
  standardOnly?: boolean;
}

/**
 * How one derived classname is composed: the `controlClassnames` keys that contribute to it (in
 * application order, after the standard classname), plus any state-dependent classes.
 */
export interface ClassnameSpec<S> {
  sources: readonly (keyof Classnames)[];
  conditions?: readonly ClassnameCondition<S>[];
}

type ClassnameSpecMap<K extends string, S> = Record<
  K,
  readonly (keyof Classnames)[] | ClassnameSpec<S>
>;

/** Keys of the `classNames` object returned for a rule. */
export type RuleClassnameKey =
  | 'shiftActions'
  | 'dragHandle'
  | 'fields'
  | 'matchMode'
  | 'matchThreshold'
  | 'operators'
  | 'valueSource'
  | 'value'
  | 'cloneRule'
  | 'lockRule'
  | 'muteRule'
  | 'removeRule'
  | 'valueListItem';

/** Keys of the `classNames` object returned for a rule group. */
export type RuleGroupClassnameKey =
  | 'header'
  | 'shiftActions'
  | 'undoRedoActions'
  | 'undoAction'
  | 'redoAction'
  | 'dragHandle'
  | 'combinators'
  | 'notToggle'
  | 'addRule'
  | 'addGroup'
  | 'cloneGroup'
  | 'lockGroup'
  | 'muteGroup'
  | 'removeGroup'
  | 'body';

/** Drag-and-drop state that can contribute conditional classnames. */
export interface DndClassNameState {
  isDragging?: boolean;
  isOver?: boolean;
  dropEffect?: 'move' | 'copy';
  groupItems?: boolean;
  dropNotAllowed?: boolean;
}

/** State that contributes conditional classnames to a rule's wrapper element. */
export interface RuleClassNameState extends DndClassNameState {
  disabled?: boolean;
  muted?: boolean;
  hasSubQuery?: boolean;
}

const ruleClassnameSources: ClassnameSpecMap<RuleClassnameKey, RuleClassNameState> = {
  shiftActions: ['shiftActions'],
  dragHandle: ['dragHandle'],
  fields: ['valueSelector', 'fields'],
  matchMode: ['valueSelector', 'matchMode'],
  matchThreshold: ['valueSelector', 'matchThreshold'],
  operators: ['valueSelector', 'operators'],
  valueSource: ['valueSelector', 'valueSource'],
  value: ['value'],
  cloneRule: ['actionElement', 'cloneRule'],
  lockRule: ['actionElement', 'lockRule'],
  muteRule: ['actionElement', 'muteRule'],
  removeRule: ['actionElement', 'removeRule'],
  valueListItem: ['valueListItem'],
};

const ruleGroupClassnameSources: ClassnameSpecMap<RuleGroupClassnameKey, DndClassNameState> = {
  header: {
    sources: ['header'],
    conditions: [
      // The standard `dndOver` class has no custom counterpart on the header element.
      { key: 'dndOver', when: s => s.isOver, standardOnly: true },
      { key: 'dndCopy', when: s => s.isOver && s.dropEffect === 'copy' },
      { key: 'dndDropNotAllowed', when: s => s.dropNotAllowed },
    ],
  },
  shiftActions: ['shiftActions'],
  undoRedoActions: ['undoRedoActions'],
  undoAction: ['actionElement', 'undoAction'],
  redoAction: ['actionElement', 'redoAction'],
  dragHandle: ['dragHandle'],
  combinators: ['valueSelector', 'combinators'],
  notToggle: ['notToggle'],
  addRule: ['actionElement', 'addRule'],
  addGroup: ['actionElement', 'addGroup'],
  cloneGroup: ['actionElement', 'cloneGroup'],
  lockGroup: ['actionElement', 'lockGroup'],
  muteGroup: ['actionElement', 'muteGroup'],
  removeGroup: ['actionElement', 'removeGroup'],
  body: ['body'],
};

/** Conditional classes applied to a rule's wrapper element. */
const ruleOuterConditions: readonly ClassnameCondition<RuleClassNameState>[] = [
  { key: 'disabled', when: s => s.disabled },
  { key: 'muted', when: s => s.muted },
  { key: 'dndDragging', when: s => s.isDragging },
  { key: 'dndOver', when: s => s.isOver },
  { key: 'dndCopy', when: s => s.isOver && s.dropEffect === 'copy' },
  { key: 'dndGroup', when: s => s.isOver && s.groupItems },
  { key: 'dndDropNotAllowed', when: s => s.dropNotAllowed },
  { key: 'hasSubQuery', when: s => s.hasSubQuery },
];

/** Options common to every classname derivation. */
export interface DeriveClassNamesOptions {
  /** The merged `controlClassnames` for the query builder. */
  classNames: Partial<Classnames>;
  /** When `true`, standard (`rule`, `ruleGroup-*`, etc.) classnames are omitted. */
  suppressStandardClassnames?: boolean;
}

/**
 * Expands conditions into `clsx` arguments: every custom class first (in declaration order),
 * then a single object of standard classes.
 */
const conditionArgs = <S>(
  conditions: readonly ClassnameCondition<S>[],
  state: S,
  { classNames, suppressStandardClassnames }: DeriveClassNamesOptions
): ClassValue[] => {
  const evaluated = conditions.map(condition => [condition, !!condition.when(state)] as const);

  return [
    ...evaluated
      .filter(([condition]) => !condition.standardOnly)
      .map(([condition, active]) => active && classNames[condition.key]),
    suppressStandardClassnames ||
      Object.fromEntries(
        evaluated.map(([condition, active]) => [standardClassnames[condition.key], active])
      ),
  ];
};

const deriveFromSpecs = <K extends string, S>(
  specs: ClassnameSpecMap<K, S>,
  state: S,
  options: DeriveClassNamesOptions
): Record<K, string> => {
  const result = {} as Record<K, string>;

  for (const [key, spec] of Object.entries(specs) as [
    K,
    readonly (keyof Classnames)[] | ClassnameSpec<S>,
  ][]) {
    const { sources, conditions }: ClassnameSpec<S> = Array.isArray(spec)
      ? { sources: spec }
      : (spec as ClassnameSpec<S>);

    result[key] = clsx(
      options.suppressStandardClassnames ||
        standardClassnames[key as keyof typeof standardClassnames],
      ...sources.map(source => options.classNames[source]),
      ...(conditions ? conditionArgs(conditions, state, options) : [])
    );
  }

  return result;
};

/**
 * Classnames for each element rendered by a rule. This is the framework-agnostic core of the
 * `classNames` object returned by the `useRule` hook.
 *
 * @group Query Tools
 */
export const deriveRuleClassNames = (
  options: DeriveClassNamesOptions
): Record<RuleClassnameKey, string> => deriveFromSpecs(ruleClassnameSources, {}, options);

/**
 * Classnames for each element rendered by a rule group, including its conditionally-classed
 * `header`. This is the framework-agnostic core of the `classNames` object returned by the
 * `useRuleGroup` hook.
 *
 * @group Query Tools
 */
export const deriveRuleGroupClassNames = (
  options: DeriveClassNamesOptions & DndClassNameState
): Record<RuleGroupClassnameKey, string> =>
  deriveFromSpecs(ruleGroupClassnameSources, options, options);

/** Inputs to {@link deriveRuleOuterClassName}. */
export interface RuleOuterClassNameOptions extends DeriveClassNamesOptions, RuleClassNameState {
  /** Classnames contributed by the rule itself, its field, and its operator, applied first. */
  leadingClassNames?: Classname[];
  /** Appended last, as produced by `getValidationClassNames`. */
  validationClassName?: Classname;
}

/**
 * The outer (wrapper) classname for a rule, including every conditional state class.
 *
 * @group Query Tools
 */
export const deriveRuleOuterClassName = (options: RuleOuterClassNameOptions): string => {
  const {
    classNames,
    suppressStandardClassnames,
    leadingClassNames = [],
    validationClassName,
  } = options;

  return clsx(
    ...leadingClassNames,
    suppressStandardClassnames || standardClassnames.rule,
    classNames.rule,
    ...conditionArgs(ruleOuterConditions, options, options),
    validationClassName
  );
};
