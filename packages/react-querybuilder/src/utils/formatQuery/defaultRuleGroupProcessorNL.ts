import type {
  NLTranslationKey,
  RuleGroupProcessor,
  RuleGroupTypeAny,
} from '../../types/index.noReact';
import { convertFromIC } from '../convertQuery';
import { isRuleGroup, isRuleGroupType, isRuleGroupTypeIC } from '../isRuleGroup';
import { isRuleOrGroupValid } from '../isRuleOrGroupValid';
import { lc } from '../misc';
import { getOption } from '../optGroupUtils';
import { getNLTranslataion } from './utils';

/**
 * Rule group processor used by {@link formatQuery} for "natural_language" format.
 *
 * @group Export
 */
export const defaultRuleGroupProcessorNL: RuleGroupProcessor<string> = (ruleGroup, options) => {
  const {
    fields,
    fallbackExpression,
    getParseNumberBoolean,
    placeholderFieldName,
    placeholderOperatorName,
    placeholderValueName,
    ruleProcessor,
    translations,
    validateRule,
    validationMap,
  } = options;

  const processRuleGroup = (rg: RuleGroupTypeAny, outermostOrLonelyInGroup?: boolean): string => {
    if (!isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next */ ''])) {
      // TODO: test for the last case and remove "ignore" comment
      return outermostOrLonelyInGroup ? fallbackExpression : /* istanbul ignore next */ '';
    }

    const rg2 =
      isRuleGroupTypeIC(rg) && rg.rules.some(r => typeof r === 'string' && lc(r) === 'xor')
        ? convertFromIC(rg)
        : rg;

    const processedRules = rg2.rules.map(rule => {
      // Independent combinators
      if (typeof rule === 'string') {
        return `, ${translations[rule as NLTranslationKey] ?? rule} `;
      }

      // Groups
      if (isRuleGroup(rule)) {
        return processRuleGroup(
          rule,
          rg2.rules.length === 1 &&
            !(rg2.not || /^xor$/i.test(rg2.combinator ?? /* istanbul ignore next */ ''))
        );
      }

      // Basic rule validation
      const [validationResult, fieldValidator] = validateRule(rule);
      if (
        !isRuleOrGroupValid(rule, validationResult, fieldValidator) ||
        rule.field === placeholderFieldName ||
        rule.operator === placeholderOperatorName ||
        /* istanbul ignore next */
        (placeholderValueName !== undefined && rule.value === placeholderValueName)
      ) {
        return '';
      }

      const escapeQuotes = (rule.valueSource ?? 'value') === 'value';

      const fieldData = getOption(fields, rule.field);

      return ruleProcessor(rule, {
        ...options,
        parseNumbers: getParseNumberBoolean(fieldData?.inputType),
        escapeQuotes,
        fieldData,
      });
    });

    if (processedRules.length === 0) {
      return fallbackExpression;
    }

    const isXOR = lc(rg2.combinator ?? '') === 'xor';
    const combinator = isXOR ? rg2.combinator!.slice(1) : rg2.combinator;
    const mustWrap = rg2.not || !outermostOrLonelyInGroup || (isXOR && processedRules.length > 1);

    const [prefixTL, suffixTL] = (['groupPrefix', 'groupSuffix'] as const).map(key =>
      rg2.not
        ? isXOR
          ? getNLTranslataion(key, translations, ['not', 'xor'])
          : getNLTranslataion(key, translations, ['not'])
        : isXOR
          ? getNLTranslataion(key, translations, ['xor'])
          : getNLTranslataion(key, translations)
    );

    const prefix = mustWrap ? `${prefixTL} (`.trim() : '';
    const suffix = mustWrap ? `) ${suffixTL}`.trim() : '';

    return `${prefix}${processedRules
      .filter(Boolean)
      .join(
        isRuleGroupType(rg2)
          ? `, ${translations[combinator as NLTranslationKey] ?? combinator} `
          : ''
      )}${suffix}`;
  };

  return processRuleGroup(ruleGroup, true);
};
