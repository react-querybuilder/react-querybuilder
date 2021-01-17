import { RuleGroupType, RuleType } from '../types';
/**
 * Generates a valid query object
 */
declare const generateValidQuery: (query: RuleGroupType | RuleType) => RuleGroupType | RuleType;
export default generateValidQuery;
