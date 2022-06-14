import produce from 'immer';
import type { RuleGroupTypeAny, RuleType } from '../types/index.noReact';

interface QueryTransformerOptions {
  ruleProcessor: (rule: RuleType) => any;
  ruleGroupProcessor: (ruleGroup: RuleGroupTypeAny) => any;
  propertyMap: Record<string, string>;
  combinatorMap: Record<string, string>;
  operatorMap: Record<string, string>;
  deleteRemappedProperties: boolean;
}

export const transformQuery = (
  query: RuleGroupTypeAny,
  options: Partial<QueryTransformerOptions> = {}
) => {
  const {
    ruleProcessor = r => r,
    ruleGroupProcessor = rg => rg,
    propertyMap = {},
    combinatorMap = {},
    operatorMap = {},
    deleteRemappedProperties = true,
  } = options;

  const remapProperties = (obj: Record<string, any>) =>
    produce(obj, draft => {
      for (const [k, v] of Object.entries(propertyMap)) {
        draft[v] = draft[k];
        if (deleteRemappedProperties) {
          delete draft[k];
        }
      }
    });

  const processGroup = (rg: RuleGroupTypeAny): any => ({
    ...ruleGroupProcessor(
      remapProperties({
        ...rg,
        combinator: 'combinator' in rg ? combinatorMap[rg.combinator] ?? rg.combinator : undefined,
      }) as RuleGroupTypeAny
    ),
    rules: rg.rules.map((r: any) => {
      if (typeof r === 'string') {
        // independent combinators
        return combinatorMap[r] ?? r;
      } else if ('rules' in r) {
        // sub-groups
        return processGroup(r);
      }
      // rules
      return ruleProcessor(
        remapProperties({ ...r, operator: operatorMap[r.operator] ?? r.operator }) as RuleType
      );
    }),
  });

  return processGroup(query);
};
