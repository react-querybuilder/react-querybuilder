import type { RuleGroupTypeAny, RuleType } from '@react-querybuilder/ts/src/index.noReact';
import produce from 'immer';

const remapProperties = (
  obj: Record<string, any>,
  propertyMap: Record<string, string>,
  deleteRemappedProperties: boolean
) =>
  produce(obj, draft => {
    for (const [k, v] of Object.entries(propertyMap)) {
      draft[v] = draft[k];
      if (deleteRemappedProperties) {
        delete draft[k];
      }
    }
  });

interface QueryTransformerOptions {
  /**
   * When a rule is encountered in the hierarchy, it will be replaced
   * with the result of this function.
   */
  ruleProcessor?: (rule: RuleType) => any;
  /**
   * When a group is encountered in the hierarchy, it will be replaced
   * with the result of this function.
   */
  ruleGroupProcessor?: (ruleGroup: RuleGroupTypeAny) => any;
  /**
   * For each rule and group in the hierarchy, any properties matching a key
   * in this object will be copied to a property with the corresponding value
   * as its name.
   *
   * @example
   *   transformQuery(
   *     { rules: [] },
   *     { propertyMap: { rules: 'newRules' } }
   *   )
   *   // Returns: { rules: [], newRules: [] }
   */
  propertyMap?: Record<string, string>;
  /**
   * Any combinator values (including independent combinators) will be translated
   * from the key in this object to the value.
   *
   * @example
   *   transformQuery(
   *     { combinator: 'and', rules: [] },
   *     { combinatorMap: { and: 'AND' } }
   *   )
   *   // Returns: { combinator: 'AND', rules: [] }
   */
  combinatorMap?: Record<string, string>;
  /**
   * Any operator values will be translated from the key in this object to the value.
   *
   * @example
   *   transformQuery(
   *     { combinator: 'and', rules: [{ field: 'name', operator: '=', value: 'Steve Vai' }] },
   *     { operatorMap: { '=': 'is' } }
   *   )
   *   // Returns:
   *   // {
   *   //   combinator: 'and',
   *   //   rules: [{ field: 'name', operator: 'is', value: 'Steve Vai' }]
   *   // }
   */
  operatorMap?: Record<string, string>;
  /**
   * Original properties remapped according to the `propertyMap` option will be removed.
   *
   * @example
   *   transformQuery(
   *     { rules: [] },
   *     { propertyMap: { rules: 'newRules' }, deleteRemappedProperties: true }
   *   )
   *   // Returns: { newRules: [] }
   */
  deleteRemappedProperties?: boolean;
}

/**
 * A versatile utility function to recursively process a query heirarchy.
 *
 * Documentation: https://react-querybuilder.js.org/docs/api/misc#transformquery
 *
 * @param query The query to transform
 * @param options
 * @returns The transformed query
 */
export const transformQuery = (query: RuleGroupTypeAny, options: QueryTransformerOptions = {}) => {
  const {
    ruleProcessor = r => r,
    ruleGroupProcessor = rg => rg,
    propertyMap = {},
    combinatorMap = {},
    operatorMap = {},
    deleteRemappedProperties = true,
  } = options;

  const processGroup = (rg: RuleGroupTypeAny & { path: number[] }): any => ({
    ...ruleGroupProcessor(
      remapProperties(
        {
          ...rg,
          ...('combinator' in rg
            ? { combinator: combinatorMap[rg.combinator] ?? rg.combinator }
            : {}),
        },
        propertyMap,
        deleteRemappedProperties
      ) as RuleGroupTypeAny
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
        remapProperties(
          {
            ...{ ...r, path: [...rg.path, idx] },
            operator: operatorMap[r.operator] ?? r.operator,
          },
          propertyMap,
          deleteRemappedProperties
        ) as RuleType
      );
    }),
  });

  return processGroup({ ...query, path: [] });
};
