import type { RuleGroupProcessor, RuleGroupType } from '../../types';
import { convertFromIC } from '../convertQuery';
import { isRuleGroup } from '../isRuleGroup';
import { isRuleOrGroupValid } from '../isRuleOrGroupValid';
import { getOption } from '../optGroupUtils';
import { defaultRuleProcessorTanStackDB } from './defaultRuleProcessorTanStackDB';
import type {
  TanStackDbWhereCallback,
  TanStackDbWhereCallbackReturnType,
  TsDbOperators,
} from './tanStackDbTypes.ts';
import { tanStackDbFallbackExpression } from './tanStackDbTypes.ts';

/**
 * Default rule group processor used by {@link formatQuery} for the "tanstack_db" format.
 * Returns a `WhereCallback` suitable for TanStack DB's `.where()` method.
 *
 * @example
 * const where = formatQuery(query, { format: 'tanstack_db', context: { tanstackDb: tsdb } });
 * const results = useLiveQuery(q => q.from({ todo: todosCollection }).where(where));
 *
 * @group Export
 */
export const defaultRuleGroupProcessorTanStackDB: RuleGroupProcessor<TanStackDbWhereCallback> =
  (ruleGroup, options) => refs => {
    const {
      fields,
      getParseNumberBoolean,
      placeholderFieldName,
      placeholderOperatorName,
      placeholderValueName,
      validateRule,
      validationMap,
      context = {},
    } = options;

    const ops = context.tanStackDbOperators;

    if (!ops) return tanStackDbFallbackExpression;

    const { and, not, or } = ops as TsDbOperators;

    // Determine ref resolution order
    const sourcePriority: string[] =
      (Array.isArray(context.sourcePriority) ? context.sourcePriority : null) ??
      Object.keys(refs);

    /* v8 ignore next -- @preserve */
    if (sourcePriority.length === 0) return tanStackDbFallbackExpression;

    const ruleProcessor = defaultRuleProcessorTanStackDB;

    const processRuleGroup = (rg: RuleGroupType): TanStackDbWhereCallbackReturnType | undefined => {
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

      const processedRules: TanStackDbWhereCallbackReturnType[] = rg.rules
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
            context: { ...context, _tanstackDbRefs: refs, _tanstackDbSourcePriority: sourcePriority },
          });
        })
        .filter(Boolean);

      if (processedRules.length === 0) {
        return tanStackDbFallbackExpression;
      }

      // Single expression: no wrapper needed
      const ruleGroupExpr =
        processedRules.length === 1
          ? processedRules[0]
          : rg.combinator === 'or'
            ? or(...(processedRules as Parameters<typeof or>))
            : and(...(processedRules as Parameters<typeof and>));

      return rg.not ? not(ruleGroupExpr) : ruleGroupExpr;
    };

    return processRuleGroup(convertFromIC(ruleGroup)) ?? tanStackDbFallbackExpression;
  };
