import type {
  RuleGroupArray,
  RuleGroupICArray,
  RuleGroupType,
  RuleGroupTypeIC,
  RuleType,
} from '../types/index.noReact';
import { isRuleGroup, isRuleGroupType, isRuleGroupTypeIC } from './isRuleGroup';

const processRuleOrStringOrRuleGroupIC = (r: string | RuleType | RuleGroupTypeIC) =>
  isRuleGroup(r) ? generateRuleGroupICWithConsistentCombinators(r) : r;

const generateRuleGroupICWithConsistentCombinators = (rg: RuleGroupTypeIC): RuleGroupTypeIC => {
  const returnArray: RuleGroupICArray = [];
  const push = (r: string | RuleType | RuleGroupTypeIC) =>
    returnArray.push(processRuleOrStringOrRuleGroupIC(r) as RuleType | RuleGroupTypeIC);
  let startIndex = 0;
  for (let i = 0; i < rg.rules.length; i += 2) {
    if (rg.rules.length === 1) {
      push(rg.rules[0]);
    } else if (rg.rules[i + 1] === 'and') {
      startIndex = i;
      let j = 1;
      while (rg.rules[startIndex + j] === 'and') {
        i += 2;
        j += 2;
      }
      returnArray.push({
        // @ts-expect-error Too complicated to keep track of odd/even indexes in TS
        rules: rg.rules.slice(startIndex, i + 1).map(processRuleOrStringOrRuleGroupIC),
      });
      i -= 2;
    } else if (rg.rules[i + 1] === 'or') {
      if (i === 0 || i === rg.rules.length - 3) {
        if (i === 0 || rg.rules[i - 1] === 'or') {
          push(rg.rules[i]);
        }
        push(rg.rules[i + 1]);
        if (i === rg.rules.length - 3) {
          push(rg.rules[i + 2]);
        }
      } else {
        if (rg.rules[i - 1] === 'and') {
          push(rg.rules[i + 1]);
        } else {
          push(rg.rules[i]);
          push(rg.rules[i + 1]);
        }
      }
    }
  }
  if (
    // @ts-expect-error TS still thinks returnArray has length 0
    returnArray.length === 1 &&
    typeof returnArray[0] === 'object' &&
    isRuleGroup(returnArray[0])
  ) {
    // @ts-expect-error TS still thinks returnArray has length 0
    return { ...rg, ...returnArray[0] };
  }
  return { ...rg, rules: returnArray };
};

/**
 * Converts a {@link RuleGroupTypeIC} to {@link RuleGroupType}.
 *
 * This function is idempotent: {@link RuleGroupType} queries will be
 * returned as-is.
 */
export const convertFromIC = <RG extends RuleGroupType = RuleGroupType>(
  rg: RuleGroupTypeIC
): RG => {
  if (isRuleGroupType(rg)) {
    return rg;
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
 */
export const convertToIC = <RGIC extends RuleGroupTypeIC = RuleGroupTypeIC>(
  rg: RuleGroupType
): RGIC => {
  if (isRuleGroupTypeIC(rg)) {
    return rg;
  }
  const { combinator, ...queryWithoutCombinator } = rg;
  const rules: (RuleGroupTypeIC | RuleType | string)[] = [];
  const { length } = rg.rules;
  rg.rules.forEach((r, idx) => {
    if (isRuleGroup(r)) {
      rules.push(convertToIC(r));
    } else {
      rules.push(r);
    }
    if (combinator && idx < length - 1) {
      rules.push(combinator);
    }
  });
  return { ...queryWithoutCombinator, rules } as RGIC;
};

/**
 * Converts a {@link RuleGroupType} to {@link RuleGroupTypeIC}. For a more explicit
 * operation, use {@link convertToIC}.
 */
function convertQuery(query: RuleGroupType): RuleGroupTypeIC;
/**
 * Converts a {@link RuleGroupTypeIC} to {@link RuleGroupType}. For a more explicit
 * operation, use {@link convertFromIC}.
 */
function convertQuery(query: RuleGroupTypeIC): RuleGroupType;
function convertQuery(query: RuleGroupType | RuleGroupTypeIC): RuleGroupType | RuleGroupTypeIC {
  return isRuleGroupTypeIC(query) ? convertFromIC(query) : convertToIC(query);
}

export { convertQuery };
