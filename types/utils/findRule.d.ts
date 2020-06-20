import { RuleGroupType, RuleType } from '../types';
declare const findRule: (id: string, parent: RuleGroupType) => RuleGroupType | RuleType | undefined;
export default findRule;
