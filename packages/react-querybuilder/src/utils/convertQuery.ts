import type {
  RuleGroupArray,
  RuleGroupICArray,
  RuleGroupType,
  RuleGroupTypeIC,
  RuleType,
} from '../types';
import { isRuleGroupTypeIC } from './isRuleGroup';

const processRuleOrStringOrRuleGroupIC = (r: string | RuleType | RuleGroupTypeIC) =>
  typeof r === 'object' && 'rules' in r ? generateRuleGroupICWithConsistentCombinators(r) : r;

const generateRuleGroupICWithConsistentCombinators = (rg: RuleGroupTypeIC): RuleGroupTypeIC => {
  const returnArray: RuleGroupICArray = [];
  const push = (r: any) =>
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
        // @ts-expect-error TS can't keep track of odd/even indexes here
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
    'rules' in returnArray[0]
  ) {
    // @ts-expect-error TS still thinks returnArray has length 0
    return { ...rg, ...returnArray[0] };
  }
  return { ...rg, rules: returnArray };
};

export const convertFromIC = (rg: RuleGroupTypeIC): RuleGroupType => {
  const processedRG = generateRuleGroupICWithConsistentCombinators(rg);
  const rulesAsMixedList = processedRG.rules.map(r =>
    typeof r === 'string' || !('rules' in r) ? r : convertFromIC(r)
  );
  const combinator = rulesAsMixedList.length < 2 ? 'and' : (rulesAsMixedList[1] as string);
  const rules = rulesAsMixedList.filter(r => typeof r !== 'string') as RuleGroupArray;
  return { ...processedRG, combinator, rules };
};

export const convertToIC = (rg: RuleGroupType): RuleGroupTypeIC => {
  const { combinator, ...queryWithoutCombinator } = rg;
  const rules: (RuleGroupTypeIC | RuleType | string)[] = [];
  rg.rules.forEach((r, idx, arr) => {
    if ('rules' in r) {
      rules.push(convertToIC(r));
    } else {
      rules.push(r);
    }
    if (idx < arr.length - 1) {
      rules.push(combinator);
    }
  });
  return { ...queryWithoutCombinator, rules: rules as RuleGroupICArray };
};

function convertQuery(query: RuleGroupType): RuleGroupTypeIC;
function convertQuery(query: RuleGroupTypeIC): RuleGroupType;
function convertQuery(query: RuleGroupType | RuleGroupTypeIC): RuleGroupType | RuleGroupTypeIC {
  return isRuleGroupTypeIC(query) ? convertFromIC(query) : convertToIC(query);
}

export { convertQuery };
