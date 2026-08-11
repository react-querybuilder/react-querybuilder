import type { Column, Operators, SQL, Table } from 'drizzle-orm';
import type { RuleGroupProcessor, RuleGroupType } from '../../types';
import { convertFromIC } from '../convertQuery';
import { isRuleGroup } from '../isRuleGroup';
import { isRuleOrGroupValid } from '../isRuleOrGroupValid';
import { getOption } from '../optGroupUtils';

/**
 * Minimal structural shape of Drizzle's `Operators` object. Declared locally so the public type
 * surface of this package never references `drizzle-orm`, which is an optional peer dependency.
 * (Referencing it would force consumers to install it to typecheck without `skipLibCheck`.)
 *
 * @group Export
 */
export interface DrizzleOperatorsLike {
  // oxlint-disable-next-line typescript/no-explicit-any
  and: (...conditions: any[]) => any;
  // oxlint-disable-next-line typescript/no-explicit-any
  or: (...conditions: any[]) => any;
  // oxlint-disable-next-line typescript/no-explicit-any
  not: (...conditions: any[]) => any;
}

/**
 * Return type of {@link defaultRuleGroupProcessorDrizzle}—the function assignable to the `where`
 * property in the Drizzle relational queries API. The Drizzle `SQL` result type is inferred from
 * the caller's own operators object, so it stays exact without importing `drizzle-orm` here.
 *
 * @group Export
 */
export type DrizzleWhereCallback = <Ops extends DrizzleOperatorsLike>(
  columns: object,
  drizzleOperators: Ops
) => ReturnType<Ops['and']>;

/**
 * Default rule group processor used by {@link formatQuery} for the "drizzle" format. The returned
 * function can be assigned to the `where` property in the Drizzle relational queries API.
 *
 * @example
 * const where = formatQuery(query, 'drizzle');
 * const results = db.query.users.findMany({ where });
 *
 * @returns Function that takes a Drizzle table config and an object of Drizzle operators.
 *
 * @group Export
 */
export const defaultRuleGroupProcessorDrizzle: RuleGroupProcessor<DrizzleWhereCallback> = (
  ruleGroup,
  options,
  _meta
) =>
  ((columns: Table | Record<string, Column>, drizzleOperators: Operators) => {
    const {
      fields,
      getParseNumberBoolean,
      placeholderFieldName,
      placeholderOperatorName,
      placeholderValueName,
      validateRule,
      validationMap,
      ruleProcessor,
    } = options;

    if (!columns || !drizzleOperators) return undefined;

    const { and, not, or } = drizzleOperators;

    const processRuleGroup = (rg: RuleGroupType, _outermost?: boolean): SQL | undefined => {
      if (
        !isRuleOrGroupValid(
          rg,
          validationMap[
            rg.id ?? /* v8 ignore start -- @preserve */ '' /* v8 ignore stop -- @preserve */
          ]
        )
      ) {
        return undefined;
      }

      const processedRules = rg.rules
        .map(rule => {
          if (isRuleGroup(rule)) {
            return processRuleGroup(rule);
          }
          const [validationResult, fieldValidator] = validateRule(rule);
          if (
            !isRuleOrGroupValid(rule, validationResult, fieldValidator) ||
            rule.field === placeholderFieldName ||
            rule.operator === placeholderOperatorName ||
            /* v8 ignore next -- @preserve */
            (placeholderValueName !== undefined && rule.value === placeholderValueName)
          ) {
            return undefined;
          }
          const fieldData = getOption(fields, rule.field);
          return ruleProcessor(rule, {
            ...options,
            parseNumbers: getParseNumberBoolean(fieldData?.inputType),
            fieldData,
            context: { ...options.context, columns, drizzleOperators },
          });
        })
        .filter(Boolean);

      if (processedRules.length === 0) {
        return undefined;
      }

      const ruleGroupSQL: SQL | undefined =
        rg.combinator === 'or' ? or(...processedRules)! : and(...processedRules)!;

      return rg.not ? not(ruleGroupSQL) : ruleGroupSQL;
    };

    return processRuleGroup(convertFromIC(ruleGroup), true);
  }) as DrizzleWhereCallback;
