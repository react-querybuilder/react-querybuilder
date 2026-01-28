import type {
  RuleGroupArray,
  RuleGroupICArray,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleGroupTypeIC,
  RuleType,
} from '../types';
import { isRuleGroup, isRuleGroupType, isRuleGroupTypeIC } from './isRuleGroup';
import { lc } from './misc';

const combinatorLevels = ['or', 'xor', 'and'] as const;

const isSameString = (a: unknown, b: string) => lc(a) === b;

const generateRuleGroupICWithConsistentCombinators = (
  rg: RuleGroupTypeIC,
  baseCombinatorLevel: number = 0
): RuleGroupTypeIC => {
  const baseCombinator = combinatorLevels[baseCombinatorLevel];

  // oxlint-disable-next-line typescript/no-explicit-any
  if (!rg.rules.includes(baseCombinator as any)) {
    // No instances of this combinator, so group based on the next
    // combinator level if at least two levels remain
    return baseCombinatorLevel < combinatorLevels.length - 2
      ? generateRuleGroupICWithConsistentCombinators(rg, baseCombinatorLevel + 1)
      : rg;
  }

  const newRules = [...rg.rules] as RuleGroupICArray;
  let cursor = 0;

  // Group all chains of combinators in the rule array that are not the base combinator
  while (cursor < newRules.length - 2) {
    if (isSameString(newRules[cursor + 1], baseCombinator)) {
      cursor += 2;
      continue;
    }

    let nextBaseCombinatorIndex = -1;
    for (let i = cursor + 2; i < newRules.length; i++) {
      if (typeof newRules[i] === 'string' && lc(newRules[i]) === baseCombinator) {
        nextBaseCombinatorIndex = i;
        break;
      }
    }

    if (nextBaseCombinatorIndex === -1) {
      // No more instances of this combinator, so group all remaining rules and exit the loop
      newRules.splice(
        cursor,
        newRules.length,
        generateRuleGroupICWithConsistentCombinators(
          // oxlint-disable-next-line typescript/no-explicit-any
          { rules: newRules.slice(cursor) as any },
          baseCombinatorLevel + 1
        )
      );
      break;
    } else {
      // Group all rules between the current cursor and the next instance of the base combinator
      newRules.splice(
        cursor,
        nextBaseCombinatorIndex - cursor,
        generateRuleGroupICWithConsistentCombinators(
          // oxlint-disable-next-line typescript/no-explicit-any
          { rules: newRules.slice(cursor, nextBaseCombinatorIndex) as any },
          baseCombinatorLevel + 1
        )
      );
    }
  }

  return { ...rg, rules: newRules };
};

/**
 * Converts a {@link RuleGroupTypeIC} to {@link RuleGroupType}.
 *
 * This function is idempotent: {@link RuleGroupType} queries will be
 * returned as-is.
 *
 * @group Query Tools
 */
export const convertFromIC = <RG extends RuleGroupType = RuleGroupType>(
  rg: RuleGroupTypeAny
): RG => {
  if (isRuleGroupType(rg)) {
    return rg as RG;
  }
  const processedRG = generateRuleGroupICWithConsistentCombinators(rg);
  const rules: RuleGroupArray = [];
  let combinator = 'and';
  for (const [idx, r] of processedRG.rules.entries()) {
    if (typeof r === 'string') {
      if (idx === 1) combinator = r;
    } else {
      rules.push(isRuleGroup(r) ? convertFromIC(r) : r);
    }
  }
  return { ...processedRG, combinator, rules } as RG;
};

/**
 * Converts a {@link RuleGroupType} to {@link RuleGroupTypeIC}.
 *
 * This function is idempotent: {@link RuleGroupTypeIC} queries will be
 * returned as-is.
 *
 * @group Query Tools
 */
export const convertToIC = <RGIC extends RuleGroupTypeIC = RuleGroupTypeIC>(
  rg: RuleGroupTypeAny
): RGIC => {
  if (isRuleGroupTypeIC(rg)) {
    return rg as RGIC;
  }
  const { combinator, ...queryWithoutCombinator } = rg;
  const rules: (RuleGroupTypeIC | RuleType | string)[] = [];
  const { length } = rg.rules;
  for (let idx = 0; idx < length; idx++) {
    const r = rg.rules[idx];
    if (isRuleGroup(r)) {
      rules.push(convertToIC(r));
    } else {
      rules.push(r);
    }
    if (combinator && idx < length - 1) {
      rules.push(combinator);
    }
  }
  return { ...queryWithoutCombinator, rules } as RGIC;
};

/**
 * Converts a {@link RuleGroupType} to {@link RuleGroupTypeIC}. For a more explicit
 * operation, use {@link convertToIC}.
 *
 * @group Query Tools
 */
function convertQuery(query: RuleGroupType): RuleGroupTypeIC;
/**
 * Converts a {@link RuleGroupTypeIC} to {@link RuleGroupType}. For a more explicit
 * operation, use {@link convertFromIC}.
 *
 * @group Query Tools
 */
function convertQuery(query: RuleGroupTypeIC): RuleGroupType;
function convertQuery(query: RuleGroupType | RuleGroupTypeIC): RuleGroupType | RuleGroupTypeIC {
  return isRuleGroupTypeIC(query) ? convertFromIC(query) : convertToIC(query);
}

export { convertQuery };
