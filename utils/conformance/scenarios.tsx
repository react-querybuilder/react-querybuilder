/**
 * The props axis of the conformance fixtures.
 *
 * The query shapes come from `utils/testing/queryFixtures`, which is already the single source of
 * truth for the mutation-conformance tests. This module supplies the orthogonal axis: the prop
 * combinations that actually change the rendered class surface. It is deliberately *curated*
 * rather than combinatorial — the cartesian product of the boolean display props produces a huge,
 * high-churn fixture file whose extra entries exercise no additional branch.
 */

import * as React from 'react';
import type {
  FullCombinator,
  FullField,
  FullOperator,
  QueryBuilderProps,
  RuleGroupTypeAny,
  Field,
  Option,
} from '../../packages/react-querybuilder/src/index';
import type { QueryFixtureName } from '../testing/queryFixtures';

/**
 * Fields covering every `field` name used by the fixture corpus (`f1`..`f9`), so the field
 * selector renders real options instead of the empty-fields placeholder.
 */
export const fields: { name: string; label: string }[] = Array.from({ length: 9 }, (_, i) => ({
  name: `f${i + 1}`,
  label: `Field ${i + 1}`,
}));

/** Option lists for the multi-value fields. Stable `name`/`label` pairs keep the fixture legible. */
const mvValues: Option[] = [
  { name: 's1', label: 'S1' },
  { name: 's2', label: 'S2' },
  { name: 's3', label: 'S3' },
];

/**
 * Fields for the `multiValue` scenario. Prefixed `mv` so `f1`..`f9` — and therefore every
 * pre-existing case — stay untouched.
 */
export const multiValueFields: Field[] = [
  { name: 'mvText', label: 'MV Text' },
  { name: 'mvNum', label: 'MV Number', inputType: 'number' },
  { name: 'mvSelect', label: 'MV Select', valueEditorType: 'select', values: mvValues },
  { name: 'mvMulti', label: 'MV Multiselect', valueEditorType: 'multiselect', values: mvValues },
  { name: 'mvRadio', label: 'MV Radio', valueEditorType: 'radio', values: mvValues },
];

/** Every non-IC fixture. IC fixtures render a materially different tree, so they are separated. */
const standardQueries: QueryFixtureName[] = [
  'empty',
  'singleRule',
  'flat',
  'nested',
  'withDisabled',
  'withoutDisabled',
  'rootDisabled',
];

const icQueries: QueryFixtureName[] = ['ic', 'icNested'];

const allQueries: QueryFixtureName[] = [...standardQueries, ...icQueries];

/**
 * A `validator` that invalidates two well-known nodes. The fixture corpus assigns `id`s equal to
 * the stringified initial path (see `pathsAsIDs`), so these keys are stable and legible.
 */
const validator = () => ({
  '[0]': false,
  '[1]': { valid: false, reasons: ['conformance'] },
});

/**
 * A non-default accessible description generator. Without this, every
 * `expectedAccessibleDescriptions` entry would be a pure function of the path and the fixture
 * would assert nothing a port could plausibly get wrong.
 */
const accessibleDescriptionGenerator = ({ path }: { path: number[] }) =>
  path.length === 0 ? 'Root' : `Group ${path.join('.')}`;

/**
 * Scenario props are intentionally loose: the point is to vary props freely, not to type-check
 * them. `QueryBuilderProps` is generic over four parameters that would otherwise have to be
 * threaded through every scenario for no benefit.
 */
type AnyProps = Partial<
  QueryBuilderProps<RuleGroupTypeAny, FullField, FullOperator, FullCombinator>
> &
  Record<string, unknown>;

/** One prop scenario, optionally pinned to its own query rather than the shared corpus. */
export interface Scenario {
  name: string;
  /** Short description, carried into the fixture file so consumers know what a failure means. */
  description: string;
  props: AnyProps;
  /** Named fixtures from the shared corpus. Mutually exclusive with {@link Scenario.query}. */
  queries?: QueryFixtureName[];
  /** An inline query, for scenarios the shared corpus does not cover. */
  query?: unknown;
}

/**
 * A separator for bound-pair editors. React Query Builder emits no separator of its own — the slot
 * is empty by default (`ValueEditor.tsx`, `separator = null`) — so the fixture supplies one, the
 * same way `customized` supplies `controlClassnames`. The class is deliberately custom-named: it
 * is a fixture artifact, not part of the core class surface.
 */
const getValueEditorSeparator = (_field: string, operator: string) =>
  operator === 'between' || operator === 'notBetween'
    ? React.createElement('span', { className: 'custom-separator' }, 'and')
    : null;

export const scenarios: Scenario[] = [
  {
    name: 'default',
    description: 'Default props. The baseline class surface every port must reproduce first.',
    props: { fields },
    queries: allQueries,
  },
  {
    name: 'allControls',
    description:
      'Every optional control turned on: not-toggle, clone, lock, shift, and mute buttons.',
    props: {
      fields,
      showNotToggle: true,
      showCloneButtons: true,
      showLockButtons: true,
      showShiftActions: true,
      showMuteButtons: true,
    },
    queries: allQueries,
  },
  {
    name: 'combinatorsBetweenRules',
    description:
      'Standard (non-IC) queries rendered with combinators between rules, which switches the ' +
      'group body to the inline-combinator layout.',
    props: { fields, showCombinatorsBetweenRules: true },
    queries: standardQueries,
  },
  {
    name: 'validation',
    description:
      'A validator that invalidates two nodes, producing the `queryBuilder-invalid` classes.',
    props: { fields, validator },
    queries: standardQueries,
  },
  {
    name: 'disabled',
    description:
      'The whole builder disabled via the `disabled` prop, as distinct from the per-node ' +
      '`disabled` flags the `withDisabled` fixture carries.',
    props: { fields, disabled: true, showLockButtons: true },
    queries: standardQueries,
  },
  {
    name: 'customized',
    description:
      'A non-default accessible description generator plus custom control classnames, so the ' +
      'a11y and classname fixtures assert something beyond the identity function.',
    props: {
      fields,
      accessibleDescriptionGenerator,
      controlClassnames: {
        queryBuilder: 'custom-qb',
        ruleGroup: 'custom-group',
        rule: 'custom-rule',
      },
    },
    queries: allQueries,
  },
  {
    name: 'matchModes',
    description:
      'Subquery rules with match modes. Not in the shared corpus because it requires a field ' +
      'with `subproperties`; included because the port plan lists match modes as v1 scope.',
    props: {
      fields: [
        {
          name: 'sub',
          label: 'Sub',
          matchModes: true,
          subproperties: [
            { name: 's1', label: 'S1' },
            { name: 's2', label: 'S2' },
          ],
        },
      ],
    },
    query: {
      id: '[]',
      combinator: 'and',
      rules: [
        {
          id: '[0]',
          field: 'sub',
          operator: '=',
          value: { id: '[0,0]', combinator: 'and', rules: [] },
          match: { mode: 'all' },
        },
        {
          id: '[1]',
          field: 'sub',
          operator: '=',
          value: {
            id: '[1,0]',
            combinator: 'or',
            rules: [{ id: '[1,0,0]', field: 's1', operator: '=', value: 'x' }],
          },
          match: { mode: 'atLeast', threshold: 2 },
        },
      ],
    },
  },
  {
    name: 'multiValue',
    description:
      'Multi-value editor layouts: `between`/`notBetween` bound pairs (text, number, select), ' +
      '`in` multiselect, and a radio group. Rules [6] and [7] are the only rules in the entire ' +
      'fixture set for which `getValueEditorReset` returns `reset: true` — their values ' +
      'deliberately mismatch their operators. Do not "fix" them. `getValueEditorSeparator` ' +
      'supplies a `custom-separator` span for the bound pairs; RQB emits no separator by default.',
    props: {
      fields: multiValueFields,
      parseNumbers: true,
      listsAsArrays: true,
      getValueEditorSeparator,
    },
    // Rules [6] and [7] are the ONLY rules in the entire fixture set for which
    // `getValueEditorReset` returns `reset: true`. They exist so `classnames-post-flush.json`
    // pins the value-editor reset effect rather than merely restating the static surface.
    // Do not "fix" their values to match their operators.
    query: {
      id: '[]',
      combinator: 'and',
      rules: [
        { id: '[0]', field: 'mvText', operator: 'between', value: 'a,b' },
        { id: '[1]', field: 'mvText', operator: 'notBetween', value: ['a', 'b'] },
        { id: '[2]', field: 'mvNum', operator: 'between', value: '10,20' },
        { id: '[3]', field: 'mvSelect', operator: 'between', value: 's1,s2' },
        { id: '[4]', field: 'mvMulti', operator: 'in', value: ['s1', 's2'] },
        { id: '[5]', field: 'mvRadio', operator: '=', value: 's1' },
        { id: '[6]', field: 'mvText', operator: '=', value: ['a', 'b'] },
        { id: '[7]', field: 'mvNum', operator: '=', value: '10,20' },
      ],
    },
  },
];
