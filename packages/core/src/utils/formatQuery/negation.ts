import type { DefaultOperatorName, RuleGroupType, RuleType } from '../../types';
import { isRuleGroup } from '../isRuleGroup';
import { lc } from '../misc';

const negationPairs: [DefaultOperatorName, DefaultOperatorName][] = [
  ['=', '!='],
  ['<', '>='],
  ['>', '<='],
  ['in', 'notIn'],
  ['between', 'notBetween'],
  ['null', 'notNull'],
  ['contains', 'doesNotContain'],
  ['beginsWith', 'doesNotBeginWith'],
  ['endsWith', 'doesNotEndWith'],
];

const negationMap = new Map<string, DefaultOperatorName>(
  negationPairs.flatMap(([a, b]) => [
    [lc(a), b],
    [lc(b), a],
  ])
);

/**
 * Returns the logical negation of a {@link DefaultOperatorName} (case-insensitive), e.g.
 * `"="` → `"!="`, `"<"` → `">="`, `"in"` → `"notIn"`. Returns `undefined` for
 * non-default operators.
 *
 * @group Export
 */
export const negateOperator = (operator: string): DefaultOperatorName | undefined =>
  negationMap.get(lc(operator));

const negatedMatchModes: Record<string, 'some' | 'none'> = { some: 'none', none: 'some' };

/**
 * Negates a rule via {@link negateOperator}. Match modes `some`↔`none` swap; other match
 * modes and non-default operators can't be negated, so `undefined` is returned.
 *
 * @group Export
 */
export const negateRule = (rule: RuleType): RuleType | undefined => {
  if (rule.match?.mode) {
    const mode = negatedMatchModes[lc(rule.match.mode)];
    return mode ? { ...rule, match: { ...rule.match, mode } } : undefined;
  }
  const operator = negateOperator(rule.operator);
  return operator ? { ...rule, operator } : undefined;
};

/**
 * Applies De Morgan's laws to produce the logical negation of a standard rule group
 * (ignoring the group's own `not` flag): flips the combinator (`and`↔`or`), negates each
 * rule via {@link negateOperator}, and toggles `not` on each child group (processors
 * push down recursively). Rules that can't be negated are dropped. Groups with a
 * combinator other than `and`/`or` (e.g. `xor`) yield an empty group.
 *
 * Convert independent-combinator queries with `convertFromIC` first.
 *
 * Note: missing-field semantics may differ between e.g. `$ne` and `NOT($eq)` in some
 * databases.
 *
 * @group Export
 */
export const negateRuleGroup = <RG extends RuleGroupType>(rg: RG): RG => {
  const { not: _not, ...rest } = rg;
  const comb = lc(rg.combinator);
  if (comb !== 'and' && comb !== 'or') return { ...rest, rules: [] } as unknown as RG;
  const rules: RuleGroupType['rules'] = [];
  for (const r of rg.rules) {
    if (isRuleGroup(r)) {
      const { not, ...g } = r;
      rules.push(not ? g : { ...g, not: true });
    } else {
      const negated = negateRule(r);
      if (negated) rules.push(negated);
    }
  }
  return { ...rest, combinator: comb === 'and' ? 'or' : 'and', rules } as unknown as RG;
};
