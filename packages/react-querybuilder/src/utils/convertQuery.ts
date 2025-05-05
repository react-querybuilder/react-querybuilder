import { produce } from 'immer';
import type {
  RuleGroupArray,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleGroupTypeIC,
  RuleType,
} from '../types/index.noReact';
import { isRuleGroup, isRuleGroupType, isRuleGroupTypeIC } from './isRuleGroup';

const combinatorLevels = ['or', 'xor', 'and'] as const;

const isSameString = (a: unknown, b: string) => typeof a === 'string' && a.toLowerCase() === b;

const generateRuleGroupICWithConsistentCombinators = (
  rg: RuleGroupTypeIC,
  baseCombinatorLevel: number = 0
): RuleGroupTypeIC => {
  const baseCombinator = combinatorLevels[baseCombinatorLevel];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!rg.rules.includes(baseCombinator as any)) {
    // No instances of this combinator, so group based on the next
    // combinator level if at least two levels remain
    return baseCombinatorLevel < combinatorLevels.length - 2
      ? generateRuleGroupICWithConsistentCombinators(rg, baseCombinatorLevel + 1)
      : rg;
  }

  return produce(rg, draft => {
    let cursor = 0;

    // Group all chains of combinators in the rule array that are not the base combinator
    while (cursor < draft.rules.length - 2) {
      if (isSameString(draft.rules[cursor + 1], baseCombinator)) {
        cursor += 2;
        continue;
      }

      const nextBaseCombinatorIndex = draft.rules.findIndex(
        (r, i) => i > cursor && typeof r === 'string' && r.toLowerCase() === baseCombinator
      );

      if (nextBaseCombinatorIndex === -1) {
        // No more instances of this combinator, so group all remaining rules and exit the loop
        draft.rules.splice(
          cursor,
          draft.rules.length,
          generateRuleGroupICWithConsistentCombinators(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { rules: draft.rules.slice(cursor) as any },
            baseCombinatorLevel + 1
          )
        );
        break;
      } else {
        // Group all rules between the current cursor and the next instance of the base combinator
        draft.rules.splice(
          cursor,
          nextBaseCombinatorIndex - cursor,
          generateRuleGroupICWithConsistentCombinators(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { rules: draft.rules.slice(cursor, nextBaseCombinatorIndex) as any },
            baseCombinatorLevel + 1
          )
        );
      }
    }
  });
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
  const rulesAsMixedList = processedRG.rules.map(r =>
    typeof r === 'string' || !isRuleGroup(r) ? r : convertFromIC(r)
  );
  const combinator = rulesAsMixedList.length < 2 ? 'and' : (rulesAsMixedList[1] as string);
  const rules = rulesAsMixedList.filter(r => typeof r !== 'string') as RuleGroupArray;
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
  for (const [idx, r] of rg.rules.entries()) {
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
