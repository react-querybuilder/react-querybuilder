import type {
  DefaultOperatorName,
  DefaultRuleGroupType,
  DefaultRuleType,
  FullField,
  FullOption,
  OptionList,
  ValueSource,
  ValueSourceFlexibleOptions,
  ValueSources,
} from '../types';
import type { ParserCommonOptions } from '../types/import';
import { filterFieldsByComparator } from './filterFieldsByComparator';
import { getValueSourcesUtil } from './getValueSourcesUtil';
import { isRuleGroup } from './isRuleGroup';
import { isFlexibleOptionArray, toFlatOptionArray, toFullOption } from './optGroupUtils';

export const getFieldsArray = (
  fields?: OptionList<FullField> | Record<string, FullField>
): FullOption[] => {
  const fieldsArray = fields
    ? Array.isArray(fields)
      ? fields
      : Object.keys(fields)
          .map(fld => Object.assign({}, fields[fld], { name: fld }))
          // oxlint-disable-next-line no-array-sort
          .sort((a, b) => a.label.localeCompare(b.label))
    : [];
  return toFlatOptionArray(fieldsArray);
};

export function fieldIsValidUtil(params: {
  fieldsFlat: FullField[];
  getValueSources?: (field: string, operator: string) => ValueSources | ValueSourceFlexibleOptions;
  fieldName: string;
  operator: DefaultOperatorName;
  subordinateFieldName?: string;
}): boolean {
  const { fieldsFlat, fieldName, operator, subordinateFieldName, getValueSources } = params;

  const vsIncludes = (vs: ValueSource) => {
    const vss = getValueSourcesUtil(primaryField, operator, getValueSources);
    return isFlexibleOptionArray(vss) && vss.some(vso => vso.value === vs || vso.name === vs);
  };

  // If fields option was an empty array or undefined, then all identifiers
  // are considered valid.
  if (fieldsFlat.length === 0) return true;

  let valid = false;

  const primaryField = toFullOption(fieldsFlat.find(ff => ff.name === fieldName)!);
  if (primaryField) {
    valid = !(
      !subordinateFieldName &&
      operator !== 'notNull' &&
      operator !== 'null' &&
      !vsIncludes('value')
    );

    if (valid && !!subordinateFieldName) {
      if (vsIncludes('field') && fieldName !== subordinateFieldName) {
        const validSubordinateFields = filterFieldsByComparator(
          primaryField,
          fieldsFlat,
          operator
        ) as FullField[];
        if (!validSubordinateFields.some(vsf => vsf.name === subordinateFieldName)) {
          valid = false;
        }
      } else {
        valid = false;
      }
    }
  }

  return valid;
}

type RuleOrGroupNoIC = DefaultRuleType | DefaultRuleGroupType;

/**
 * Drops rules whose field/operator combo is invalid per `fields`/`getValueSources`, then prunes
 * groups left empty. No-op when `fields` is empty/undefined. Non-IC groups only.
 */
export const filterRulesByFields = (
  rules: RuleOrGroupNoIC[],
  options: Pick<ParserCommonOptions, 'fields' | 'getValueSources'>
): RuleOrGroupNoIC[] => {
  const fieldsFlat = getFieldsArray(options.fields) as FullField[];
  if (fieldsFlat.length === 0) return rules;
  const { getValueSources } = options;
  const walk = (rs: RuleOrGroupNoIC[]): RuleOrGroupNoIC[] =>
    rs.flatMap((r): RuleOrGroupNoIC[] => {
      if (isRuleGroup(r)) {
        const kept = walk(r.rules);
        return kept.length > 0 ? [{ ...r, rules: kept }] : [];
      }
      return fieldIsValidUtil({
        fieldName: r.field,
        fieldsFlat,
        operator: r.operator,
        getValueSources,
      })
        ? [r]
        : [];
    });
  return walk(rules);
};
