import type {
  FieldDatatypeCategory,
  FlexibleOptionList,
  FullField,
  QueryValidator,
  RuleGroupTypeAny,
  RuleType,
  RuleValidator,
  ValidationMap,
  ValidationResult,
} from '../types';
import { toArray } from './arrayUtils';
import type { InferOperatorsOptions } from './inferOperators';
import { getDatatypeOperatorWhitelist, isOperatorAllowed } from './inferOperators';
import { isRuleGroup } from './isRuleGroup';
import { getOption, toFullOption } from './optGroupUtils';

/**
 * Options for {@link datatypeRuleValidator}.
 */
export type DatatypeValidatorOptions = Pick<
  InferOperatorsOptions,
  'map' | 'datatypeMap' | 'dropUnknownOperators'
> & {
  /** Also check rule values against the datatype category. Default `false`. */
  checkValues?: boolean;
};

/**
 * Options for {@link datatypeOperatorValidator}.
 */
export interface DatatypeOperatorValidatorOptions extends DatatypeValidatorOptions {
  fields: FlexibleOptionList<FullField>;
}

/**
 * Reason codes reported by {@link datatypeOperatorValidator}/{@link datatypeRuleValidator}.
 */
export type DatatypeValidationReason =
  | { code: 'datatype-operator-mismatch'; datatype: unknown; operator: string }
  | { code: 'datatype-value-mismatch'; datatype: unknown; operator: string; value: unknown };

const multiValueOps = new Set(['between', 'notBetween', 'in', 'notIn']);
const timeRegex = /^([01]?\d|2[0-3]):[0-5]\d(:[0-5]\d(\.\d+)?)?$/;

const isValidForCategory = (v: unknown, cat: FieldDatatypeCategory): boolean => {
  switch (cat) {
    case 'number':
      return (
        typeof v === 'bigint' ||
        (typeof v === 'number' && Number.isFinite(v)) ||
        (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)))
      );
    case 'bigint':
      if (typeof v === 'bigint') return true;
      if (typeof v === 'number') return Number.isInteger(v);
      return typeof v === 'string' && /^\s*[+-]?\d+\s*$/.test(v);
    case 'boolean':
      return typeof v === 'boolean' || (typeof v === 'string' && /^(true|false)$/i.test(v));
    case 'date':
    case 'datetime':
      return (
        (v instanceof Date && !Number.isNaN(v.getTime())) ||
        (typeof v === 'number' && Number.isFinite(v)) ||
        (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Date.parse(v)))
      );
    case 'time':
      return (
        (v instanceof Date && !Number.isNaN(v.getTime())) ||
        (typeof v === 'string' && timeRegex.test(v.trim()))
      );
    default:
      return true;
  }
};

/**
 * Creates a rule validator that checks the rule's operator (and optionally value) against
 * the datatype category of the given field. See {@link inferOperators}.
 *
 * @group Validation
 */
export const datatypeRuleValidator =
  (fieldData: FullField, opts: DatatypeValidatorOptions = {}): RuleValidator =>
  (rule: RuleType): boolean | ValidationResult => {
    const { categories, whitelist } = getDatatypeOperatorWhitelist(fieldData, opts);
    if (!categories) return true;
    const datatype = fieldData.datatype ?? categories.join('|');
    const reasons: DatatypeValidationReason[] = [];
    const { operator } = rule;

    if (!isOperatorAllowed(operator, whitelist, opts.dropUnknownOperators)) {
      reasons.push({ code: 'datatype-operator-mismatch', datatype, operator });
    } else if (
      opts.checkValues &&
      rule.valueSource !== 'field' &&
      rule.valueSource !== 'parameter' &&
      operator !== 'null' &&
      operator !== 'notNull'
    ) {
      const values: unknown[] = multiValueOps.has(operator)
        ? Array.isArray(rule.value)
          ? rule.value
          : toArray(rule.value)
        : [rule.value];
      const valid =
        values.length > 0 && values.every(v => categories.some(c => isValidForCategory(v, c)));
      if (!valid) {
        reasons.push({ code: 'datatype-value-mismatch', datatype, operator, value: rule.value });
      }
    }

    return reasons.length > 0 ? { valid: false, reasons } : true;
  };

/**
 * Creates a query validator that checks each rule's operator (and optionally value) against
 * the datatype category of its field. Rules with unknown fields are skipped. Compatible with
 * the `validator` prop of `QueryBuilder` and the `validator` option of `formatQuery`.
 *
 * @group Validation
 */
export const datatypeOperatorValidator =
  ({ fields, ...opts }: DatatypeOperatorValidatorOptions): QueryValidator =>
  (query: RuleGroupTypeAny): ValidationMap => {
    const result: ValidationMap = {};
    const walk = (rg: RuleGroupTypeAny) => {
      for (const r of rg.rules) {
        if (typeof r === 'string') continue;
        if (isRuleGroup(r)) {
          walk(r);
          continue;
        }
        const fd = getOption(fields as FullField[], r.field);
        if (!fd || !r.id) continue;
        result[r.id] = datatypeRuleValidator(toFullOption(fd), opts)(r);
      }
    };
    walk(query);
    return result;
  };
