import type {
  RuleGroupArray,
  RuleGroupICArray,
  RuleGroupTypeAny,
  RuleType,
} from '@react-querybuilder/ts/src/index.noReact';
import { produce } from 'immer';
import { generateID } from '../utils';

interface PrepareOptions {
  idGenerator?: () => string;
}

/**
 * Generates a valid rule
 */
export const prepareRule = (rule: RuleType, { idGenerator = generateID }: PrepareOptions = {}) =>
  produce(rule, draft => {
    if (!draft.id) {
      draft.id = idGenerator();
    }
  });

/**
 * Generates a valid rule group
 */
export const prepareRuleGroup = <RG extends RuleGroupTypeAny>(
  queryObject: RG,
  { idGenerator = generateID }: PrepareOptions = {}
): RG =>
  produce(queryObject, draft => {
    if (!draft.id) {
      draft.id = idGenerator();
    }
    draft.rules = draft.rules.map(r =>
      typeof r === 'string'
        ? r
        : 'rules' in r
        ? prepareRuleGroup(r, { idGenerator })
        : prepareRule(r, { idGenerator })
    ) as RuleGroupArray | RuleGroupICArray;
  });

/**
 * Generates a valid rule or group
 */
export const prepareRuleOrGroup = <RG extends RuleGroupTypeAny>(
  rg: RG | RuleType,
  { idGenerator = generateID }: PrepareOptions = {}
) => ('rules' in rg ? prepareRuleGroup(rg, { idGenerator }) : prepareRule(rg, { idGenerator }));
