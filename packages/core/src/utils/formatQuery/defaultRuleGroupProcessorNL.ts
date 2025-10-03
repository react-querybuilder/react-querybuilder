import type { NLTranslationKey, RuleGroupProcessor, RuleGroupTypeAny } from '../../types';
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
    // Skip muted groups
    if (rg.muted) {
      return '';
    }

    if (!isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next */ ''])) {
      // TODO: test for the last case and remove "ignore" comment
      return outermostOrLonelyInGroup ? fallbackExpression : /* istanbul ignore next */ '';
    }

    const rg2 =
      isRuleGroupTypeIC(rg) && rg.rules.some(r => typeof r === 'string' && lc(r) === 'xor')
        ? convertFromIC(rg)
        : rg;

    const processedRules: string[] = [];
    let lastValidRuleIndex = -1;

    for (let i = 0; i < rg2.rules.length; i++) {
      const rule = rg2.rules[i];

      // Skip combinators for now, we'll handle them when we hit the next valid rule
      if (typeof rule === 'string') {
        continue;
      }

      // Skip muted rules/groups
      if (rule.muted) {
        continue;
      }

      let processedRule: string | undefined;

      // Groups
      if (isRuleGroup(rule)) {
        const unmutedRuleCount = rg2.rules.filter(r => typeof r !== 'string' && !r.muted).length;
        const result = processRuleGroup(
          rule,
          unmutedRuleCount === 1 &&
            !(rg2.not || /^xor$/i.test(rg2.combinator ?? /* istanbul ignore next */ ''))
        );
        if (result) {
          processedRule = result;
        }
      } else {
        // Basic rule validation
        const [validationResult, fieldValidator] = validateRule(rule);
        if (
          !isRuleOrGroupValid(rule, validationResult, fieldValidator) ||
          rule.field === placeholderFieldName ||
          rule.operator === placeholderOperatorName ||
          /* istanbul ignore next */
          (placeholderValueName !== undefined && rule.value === placeholderValueName)
        ) {
          continue;
        }

        const escapeQuotes = (rule.valueSource ?? 'value') === 'value';
        const fieldData = getOption(fields, rule.field);

        const result = ruleProcessor(rule, {
          ...options,
          parseNumbers: getParseNumberBoolean(fieldData?.inputType),
          escapeQuotes,
          fieldData,
        });

        if (result) {
          processedRule = result;
        }
      }

      if (processedRule) {
        // If this is not the first valid rule and we're in IC format, find the combinator
        if (lastValidRuleIndex >= 0 && !isRuleGroupType(rg2)) {
          // Find the combinator that immediately precedes this valid rule
          let combinator: string | undefined;
          for (let j = i - 1; j >= 0; j--) {
            const item = rg2.rules[j];
            if (typeof item === 'string') {
              combinator = `, ${translations[item as NLTranslationKey] ?? item} `;
              break;
            }
            // Skip muted rules
            if (item.muted) {
              continue;
            }
            // If we hit a non-muted rule, stop looking
            break;
          }
          if (combinator) {
            processedRules.push(combinator);
          }
        }

        processedRules.push(processedRule);
        lastValidRuleIndex = i;
      }
    }

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
