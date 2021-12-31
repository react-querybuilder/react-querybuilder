import { ValidationMap } from '../validation';
import { RuleGroupTypeAny } from './ruleGroups';

export type QueryValidator = (query: RuleGroupTypeAny) => boolean | ValidationMap;

export * from '../validation';
