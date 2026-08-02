import type {
  FullCombinator,
  FullField,
  FullOptionList,
  MatchModeOptions,
  RuleGroupTypeAny,
  RuleType,
  ValueSourceFullOptions,
} from '../types';
import { generateID } from './generateID';
import { getFirstOption, getOption } from './optGroupUtils';

/**
 * Everything {@link createRule} needs to produce a new rule. Each member corresponds to the
 * `QueryBuilder` prop (or `useQueryBuilderSetup` output) of the same name.
 */
export interface CreateRuleOptions<F extends FullField = FullField> {
  fields: FullOptionList<F>;
  getDefaultField?: string | ((fieldsData: FullOptionList<F>) => string);
  /** Produces the default operator for a field, i.e. `resolveDefaultOperator` already bound. */
  getRuleDefaultOperator: (field: string) => string;
  /** Produces the value sources for a field/operator pair. */
  getValueSources: (
    field: string,
    operator: string,
    misc: { fieldData: F }
  ) => ValueSourceFullOptions;
  /** Produces the match modes for a field. */
  getMatchModes: (field: string, misc: { fieldData: F }) => MatchModeOptions;
  /** Produces the default `value` for an otherwise-complete rule. */
  getRuleDefaultValue: (rule: RuleType) => unknown;
  idGenerator?: () => string;
}

/**
 * Creates a rule from the given configuration, applying the same precedence as the
 * `QueryBuilder` component. The `value` is computed in a second pass, once `field`, `operator`,
 * and `valueSource` are known, since the default value depends on all three.
 *
 * @group Query Tools
 */
export const createRule = <F extends FullField = FullField>({
  fields,
  getDefaultField,
  getRuleDefaultOperator,
  getValueSources,
  getMatchModes,
  getRuleDefaultValue,
  idGenerator = generateID,
}: CreateRuleOptions<F>): RuleType => {
  let field = getFirstOption(fields) ?? '';

  if (getDefaultField) {
    if (typeof getDefaultField === 'function') {
      const defaultField = getDefaultField(fields);
      // A falsy return leaves the first option in place, rather than producing an empty field.
      if (defaultField) field = defaultField;
    } else {
      field = getDefaultField;
    }
  }

  const fieldData = getOption(fields, field) as F;
  const operator = getRuleDefaultOperator(field);
  const valueSource = getFirstOption(getValueSources(field, operator, { fieldData })) ?? 'value';
  const matchMode = getFirstOption(getMatchModes(field, { fieldData }));

  const newRule: RuleType = {
    id: idGenerator(),
    field,
    operator,
    valueSource,
    value: '',
    ...(matchMode ? { match: { mode: matchMode, threshold: 1 } } : null),
  };

  return { ...newRule, value: getRuleDefaultValue(newRule) };
};

/**
 * Everything {@link createRuleGroup} needs to produce a new group.
 */
export interface CreateRuleGroupOptions<C extends FullCombinator = FullCombinator> {
  combinators: FullOptionList<C>;
  /** When `true`, the new group contains one new rule. */
  addRuleToNewGroups?: boolean;
  /** Produces that rule, i.e. {@link createRule} already bound. */
  createRule: () => RuleType;
  idGenerator?: () => string;
}

/**
 * Creates a group from the given configuration. Pass `true` for `independentCombinators` to omit
 * the `combinator` property.
 *
 * The group's own `id` is generated _before_ any contained rule's, matching the order the
 * `QueryBuilder` component has always used. This is observable when `idGenerator` is
 * deterministic, as it often is in tests.
 *
 * @group Query Tools
 */
export const createRuleGroup = <C extends FullCombinator = FullCombinator>(
  {
    combinators,
    addRuleToNewGroups,
    createRule: createRuleMain,
    idGenerator = generateID,
  }: CreateRuleGroupOptions<C>,
  independentCombinators?: boolean
): RuleGroupTypeAny => {
  // Evaluation order matters: the group's `id` comes first.
  const id = idGenerator();
  const rules = addRuleToNewGroups ? [createRuleMain()] : [];

  if (independentCombinators) {
    return { id, rules, not: false } as RuleGroupTypeAny;
  }

  return {
    id,
    rules,
    combinator: getFirstOption(combinators) ?? '',
    not: false,
  } as RuleGroupTypeAny;
};
