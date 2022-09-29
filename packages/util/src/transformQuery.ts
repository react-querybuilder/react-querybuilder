import type {
  RuleGroupTypeAny,
  RuleType,
} from '@react-querybuilder/ts/dist/types/src/index.noReact';
import produce from 'immer';

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

  const processGroup = (rg: RuleGroupTypeAny & { path: number[] }): any => ({
    ...ruleGroupProcessor(
      remapProperties({
        ...rg,
        ...('combinator' in rg
          ? { combinator: combinatorMap[rg.combinator] ?? rg.combinator }
          : {}),
      }) as RuleGroupTypeAny
    ),
    rules: rg.rules.map((r: any, idx) => {
      if (typeof r === 'string') {
        // independent combinators
        return combinatorMap[r] ?? r;
      } else if ('rules' in r) {
        // sub-groups
        return processGroup({ ...r, path: [...rg.path, idx] });
      }
      // rules
      return ruleProcessor(
        remapProperties({
          ...{ ...r, path: [...rg.path, idx] },
          operator: operatorMap[r.operator] ?? r.operator,
        }) as RuleType
      );
    }),
  });

  return processGroup({ ...query, path: [] });
};
