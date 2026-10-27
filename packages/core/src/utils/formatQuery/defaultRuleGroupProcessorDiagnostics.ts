import type {
  DiagnosticEntry,
  DiagnosticsFieldSummaryEntry,
  DiagnosticsResult,
  DiagnosticsStats,
  FullField,
  FullOperator,
  RuleGroupDiagnosticsResult,
  RuleGroupICDiagnosticsArray,
  RuleGroupICDiagnosticsResult,
  RuleGroupProcessor,
  RuleGroupTypeAny,
  RuleDiagnosticsResult,
  RuleType,
  RuleValidator,
  ValidationResult,
} from '../../types';
import { toArray } from '../arrayUtils';
import { isRuleGroup, isRuleGroupType } from '../isRuleGroup';
import { isRuleOrGroupValid, isValidationResult } from '../isRuleOrGroupValid';
import { lc, numericRegex } from '../misc';
import { toFlatOptionArray, toFullOptionList } from '../optGroupUtils';
import type { FormatCapabilities } from './formatCapabilities';
import { formatCapabilities, getUnsupportedRuleFeature } from './formatCapabilities';
import { negateRule } from './negation';
import { isRegexRuleInvalid } from './utils';

const numericInputTypes = new Set(['number', 'range', 'bigint']);
const betweenOps = new Set(['between', 'notbetween']);
const inOps = new Set(['in', 'notin']);
const listOperators = new Set([...betweenOps, ...inOps]);

/** Rule value as list: arrays as-is, comma-split strings for list operators, else single. */
const getValueList = (rule: RuleType): unknown[] =>
  Array.isArray(rule.value) ||
  (typeof rule.value === 'string' && listOperators.has(rule.operator.toLowerCase()))
    ? toArray(rule.value)
    : [rule.value];

/** Referenced field names in a `valueSource: "field"` rule not defined in config. */
const getUndefinedValueFields = (rule: RuleType, fieldsByName: Map<string, FullField>) =>
  rule.valueSource === 'field'
    ? toArray(rule.value).filter(f => typeof f !== 'string' || !fieldsByName.has(f))
    : [];

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/;
const monthRegex = /^\d{4}-\d{2}$/;
const weekRegex = /^\d{4}-W\d{2}$/;
const colorRegex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidDateComponents = (y: number, m: number, d: number): boolean => {
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
};

const isValidTimeComponents = (s: string): boolean => {
  const parts = s.split(':');
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  const sec = parts[2] ? Number.parseFloat(parts[2]) : 0;
  return h >= 0 && h <= 23 && m >= 0 && m <= 59 && sec >= 0 && sec < 60;
};

/**
 * Checks whether a value is compatible with the given {@link FullField.inputType}.
 * Returns a diagnostic code string if there is a mismatch, or `undefined` if OK.
 */
const checkValueTypeMismatch = (value: unknown, inputType: string): string | undefined => {
  if (value === null || value === undefined || value === '') return undefined;

  if (numericInputTypes.has(inputType)) {
    const v = typeof value === 'string' ? value.trim() : value;
    if (typeof v === 'number' || typeof v === 'bigint') return undefined;
    if (typeof v === 'string' && numericRegex.test(v)) return undefined;
    return 'VALUE_TYPE_MISMATCH';
  }

  if (inputType === 'date') {
    if (typeof value !== 'string') return 'VALUE_TYPE_MISMATCH';
    const v = value.trim();
    if (!dateRegex.test(v)) return 'VALUE_TYPE_MISMATCH';
    const [y, m, d] = v.split('-').map(Number);
    return isValidDateComponents(y, m, d) ? undefined : 'VALUE_TYPE_MISMATCH';
  }

  if (inputType === 'datetime-local') {
    if (typeof value !== 'string') return 'VALUE_TYPE_MISMATCH';
    // Strip optional timezone suffix (Z, ±hh:mm, ±hhmm, ±hh)
    const base = value.trim().replace(/(Z|[+-]\d{2}:?\d{2}|[+-]\d{2})$/, '');
    const tIndex = base.indexOf('T');
    if (tIndex === -1) return 'VALUE_TYPE_MISMATCH';
    const datePart = base.slice(0, tIndex);
    const timePart = base.slice(tIndex + 1);
    if (!dateRegex.test(datePart) || !timeRegex.test(timePart)) return 'VALUE_TYPE_MISMATCH';
    const [y, m, d] = datePart.split('-').map(Number);
    if (!isValidDateComponents(y, m, d)) return 'VALUE_TYPE_MISMATCH';
    return isValidTimeComponents(timePart) ? undefined : 'VALUE_TYPE_MISMATCH';
  }

  if (inputType === 'time') {
    if (typeof value !== 'string') return 'VALUE_TYPE_MISMATCH';
    const v = value.trim();
    if (!timeRegex.test(v)) return 'VALUE_TYPE_MISMATCH';
    return isValidTimeComponents(v) ? undefined : 'VALUE_TYPE_MISMATCH';
  }

  if (inputType === 'month') {
    if (typeof value !== 'string') return 'VALUE_TYPE_MISMATCH';
    const v = value.trim();
    if (!monthRegex.test(v)) return 'VALUE_TYPE_MISMATCH';
    const m = Number(v.slice(5));
    return m >= 1 && m <= 12 ? undefined : 'VALUE_TYPE_MISMATCH';
  }

  if (inputType === 'week') {
    if (typeof value !== 'string') return 'VALUE_TYPE_MISMATCH';
    const v = value.trim();
    if (!weekRegex.test(v)) return 'VALUE_TYPE_MISMATCH';
    const w = Number(v.slice(6));
    return w >= 1 && w <= 53 ? undefined : 'VALUE_TYPE_MISMATCH';
  }

  if (inputType === 'color') {
    if (typeof value !== 'string') return 'VALUE_TYPE_MISMATCH';
    return colorRegex.test(value.trim()) ? undefined : 'VALUE_TYPE_MISMATCH';
  }

  if (inputType === 'url') {
    if (typeof value !== 'string') return 'VALUE_TYPE_MISMATCH';
    try {
      void new URL(value.trim());
      return undefined;
    } catch {
      return 'VALUE_TYPE_MISMATCH';
    }
  }

  if (inputType === 'email') {
    if (typeof value !== 'string') return 'VALUE_TYPE_MISMATCH';
    return emailRegex.test(value.trim()) ? undefined : 'VALUE_TYPE_MISMATCH';
  }

  return undefined;
};

/**
 * Rule group processor used by {@link formatQuery} for "diagnostics" format.
 *
 * Produces a {@link DiagnosticsResult} containing an annotated copy of the query
 * tree (`query`) with `valid`, `reasons`, `path`, and `level` properties on every
 * rule and group; a flat `diagnostics` array; aggregate `stats`; and a per-field
 * `fieldSummary`.
 *
 * @group Export
 */
export const defaultRuleGroupProcessorDiagnostics: RuleGroupProcessor<DiagnosticsResult> = (
  ruleGroup,
  options
) => {
  const {
    fields: fieldsOption,
    placeholderFieldName,
    placeholderOperatorName,
    placeholderValueName,
    validateRule,
    validationMap,
    diagnosticsTargetFormat,
  } = options;

  const targetCaps = diagnosticsTargetFormat
    ? formatCapabilities[lc(diagnosticsTargetFormat)]
    : undefined;

  const diagnostics: DiagnosticEntry[] = [];
  const stats: DiagnosticsStats = {
    totalRules: 0,
    totalGroups: 0,
    validRules: 0,
    invalidRules: 0,
    validGroups: 0,
    invalidGroups: 0,
  };
  const fieldSummary: Record<string, DiagnosticsFieldSummaryEntry> = {};

  const uniqueFields = toFlatOptionArray(fieldsOption) satisfies FullField[];
  const fieldsByName = new Map<string, FullField>();
  for (const f of uniqueFields) {
    fieldsByName.set(f.name, f);
  }
  const hasFieldsConfig = fieldsByName.size > 0;

  const processRuleGroup = (
    rg: RuleGroupTypeAny,
    path: number[],
    parentNegated = false
  ): RuleGroupDiagnosticsResult | RuleGroupICDiagnosticsResult => {
    stats.totalGroups++;
    // Odd number of `not` ancestors (incl. self) => De Morgan push-down negates rules
    const negated = parentNegated !== !!rg.not;
    const level = path.length;
    const groupValidationEntry = validationMap[rg.id ?? ''];
    const groupSelfValid = isRuleOrGroupValid(rg, groupValidationEntry);

    const groupReasons = getReasons(groupValidationEntry);

    // Collect group-level diagnostics
    if (rg.muted) {
      diagnostics.push({
        id: rg.id ?? '',
        path,
        code: 'MUTED',
        message: 'Group is muted',
        source: 'muted',
      });
    } else if (!groupSelfValid && groupValidationEntry !== undefined) {
      diagnostics.push({
        id: rg.id ?? '',
        path,
        code: 'CUSTOM_VALIDATOR',
        message: groupReasons ? `Invalid: ${groupReasons.join(', ')}` : 'Group failed validation',
        source: 'query-validator',
      });
    }

    collectStructureDiagnostics(rg, path, diagnostics);

    let allChildrenValid = true;
    let ruleIndex = 0;
    const annotatedRules: (
      | RuleDiagnosticsResult
      | RuleGroupDiagnosticsResult
      | RuleGroupICDiagnosticsResult
      | string
    )[] = [];

    for (const rule of rg.rules) {
      // Independent combinators
      if (typeof rule === 'string') {
        annotatedRules.push(rule);
        ruleIndex++;
        continue;
      }

      const childPath = [...path, ruleIndex];

      // Sub-groups
      if (isRuleGroup(rule)) {
        const annotatedGroup = processRuleGroup(rule, childPath, negated);
        if (!annotatedGroup.valid) {
          allChildrenValid = false;
        }
        annotatedRules.push(annotatedGroup);
        ruleIndex++;
        continue;
      }

      // Rules
      stats.totalRules++;
      const childLevel = childPath.length;
      const [validationResult, fieldValidator] = validateRule(rule);
      const ruleValid =
        isRuleOrGroupValid(rule, validationResult, fieldValidator) &&
        rule.field !== placeholderFieldName &&
        rule.operator !== placeholderOperatorName &&
        !(placeholderValueName !== undefined && rule.value === placeholderValueName) &&
        !(hasFieldsConfig && !fieldsByName.has(rule.field)) &&
        !(hasFieldsConfig && getUndefinedValueFields(rule, fieldsByName).length > 0);

      // Collect rule-level diagnostics
      collectRuleDiagnostics(
        rule,
        childPath,
        validationResult,
        fieldValidator,
        ruleValid,
        diagnostics,
        placeholderFieldName,
        placeholderOperatorName,
        placeholderValueName,
        hasFieldsConfig,
        fieldsByName
      );

      if (targetCaps && diagnosticsTargetFormat && !rule.muted) {
        collectFormatDiagnostics(
          rule,
          childPath,
          targetCaps,
          diagnosticsTargetFormat,
          negated && !targetCaps.nativeNot,
          diagnostics
        );
        if (rule.match?.mode && isRuleGroup(rule.value)) {
          collectNestedFormatDiagnostics(
            rule.value,
            childPath,
            targetCaps,
            diagnosticsTargetFormat,
            negated,
            diagnostics
          );
        }
      }

      const fieldDef = fieldsByName.get(rule.field);
      if (fieldDef && !rule.muted) {
        collectFieldConfigDiagnostics(
          rule,
          childPath,
          fieldDef,
          diagnostics,
          placeholderOperatorName,
          placeholderValueName
        );
      }

      if (!ruleValid) {
        allChildrenValid = false;
        stats.invalidRules++;
      } else {
        stats.validRules++;
      }

      // Field summary
      const fieldName = rule.field;
      if (!fieldSummary[fieldName]) {
        fieldSummary[fieldName] = { ruleCount: 0, invalidCount: 0 };
      }
      fieldSummary[fieldName].ruleCount++;
      if (!ruleValid) {
        fieldSummary[fieldName].invalidCount++;
      }

      const ruleReasons =
        getReasons(validationResult) ?? getFieldValidatorReasons(rule, fieldValidator);

      const annotatedRule: RuleDiagnosticsResult = {
        ...rule,
        valid: ruleValid,
        ...(ruleReasons ? { reasons: ruleReasons } : null),
        path: childPath,
        level: childLevel,
      };

      annotatedRules.push(annotatedRule);
      ruleIndex++;
    }

    const groupValid = groupSelfValid && allChildrenValid;

    if (groupValid) {
      stats.validGroups++;
    } else {
      stats.invalidGroups++;
    }

    if (isRuleGroupType(rg)) {
      const result: RuleGroupDiagnosticsResult = {
        ...rg,
        valid: groupValid,
        ...(groupReasons ? { reasons: groupReasons } : null),
        path,
        level,
        rules: annotatedRules as (RuleDiagnosticsResult | RuleGroupDiagnosticsResult)[],
      };
      return result;
    }

    const result: RuleGroupICDiagnosticsResult = {
      ...rg,
      valid: groupValid,
      ...(groupReasons ? { reasons: groupReasons } : null),
      path,
      level,
      rules: annotatedRules as unknown as RuleGroupICDiagnosticsArray,
    };
    return result;
  };

  const query = processRuleGroup(ruleGroup, []);

  // Add diagnostics for fields defined in config but not referenced in the query
  if (hasFieldsConfig) {
    const referencedFields = new Set(Object.keys(fieldSummary));
    for (const [fieldName] of fieldsByName) {
      if (!referencedFields.has(fieldName)) {
        diagnostics.push({
          id: '',
          path: [],
          code: 'UNREFERENCED_FIELD',
          message: `Field "${fieldName}" is defined in the fields config but not used in the query`,
          source: 'field-check',
        });
      }
    }
  }

  return { query, diagnostics, stats, fieldSummary };
};

/**
 * Collects diagnostic entries for a single rule.
 */
const collectRuleDiagnostics = (
  rule: RuleType,
  path: number[],
  validationResult: boolean | ValidationResult | undefined,
  fieldValidator: RuleValidator | undefined,
  ruleValid: boolean,
  diagnostics: DiagnosticEntry[],
  placeholderFieldName: string,
  placeholderOperatorName: string,
  placeholderValueName: string | undefined,
  hasFieldsConfig: boolean,
  fieldsByName: Map<string, FullField>
): void => {
  const id = rule.id ?? '';

  if (rule.muted) {
    diagnostics.push({
      id,
      path,
      code: 'MUTED',
      message: 'Rule is muted',
      source: 'muted',
    });
  }

  if (rule.field === placeholderFieldName) {
    diagnostics.push({
      id,
      path,
      code: 'PLACEHOLDER_FIELD',
      message: 'Rule has a placeholder field',
      source: 'placeholder',
    });
  }

  if (rule.operator === placeholderOperatorName) {
    diagnostics.push({
      id,
      path,
      code: 'PLACEHOLDER_OPERATOR',
      message: 'Rule has a placeholder operator',
      source: 'placeholder',
    });
  }

  if (placeholderValueName !== undefined && rule.value === placeholderValueName) {
    diagnostics.push({
      id,
      path,
      code: 'PLACEHOLDER_VALUE',
      message: 'Rule has a placeholder value',
      source: 'placeholder',
    });
  }

  const regexInvalid = isRegexRuleInvalid(rule);
  if (regexInvalid && !rule.muted) {
    diagnostics.push({
      id,
      path,
      code: 'INVALID_VALUE',
      message: `Value "${rule.value}" is not a valid regular expression${rule.regexFlags ? ` (flags "${rule.regexFlags}")` : ''}`,
      source: 'type-check',
    });
  }

  // Custom validator diagnostics (only if not already covered by other checks)
  if (
    !rule.muted &&
    !regexInvalid &&
    rule.field !== placeholderFieldName &&
    rule.operator !== placeholderOperatorName &&
    !(placeholderValueName !== undefined && rule.value === placeholderValueName)
  ) {
    if (typeof validationResult === 'boolean' && !validationResult) {
      diagnostics.push({
        id,
        path,
        code: 'CUSTOM_VALIDATOR',
        message: 'Rule failed validation',
        source: 'query-validator',
      });
    } else if (
      typeof validationResult !== 'boolean' &&
      isValidationResult(validationResult) &&
      !validationResult.valid
    ) {
      const reasons = validationResult.reasons;
      diagnostics.push({
        id,
        path,
        code: 'CUSTOM_VALIDATOR',
        message: reasons ? `Invalid: ${reasons.join(', ')}` : 'Rule failed validation',
        source: 'query-validator',
      });
    } else if (!ruleValid && typeof fieldValidator === 'function') {
      const vr = fieldValidator(rule);
      const reasons =
        typeof vr !== 'boolean' && isValidationResult(vr) && !vr.valid ? vr.reasons : undefined;
      diagnostics.push({
        id,
        path,
        code: 'CUSTOM_VALIDATOR',
        message: reasons ? `Invalid: ${reasons.join(', ')}` : 'Rule failed field validation',
        source: 'field-validator',
      });
    }
  }

  // Undefined field check
  if (hasFieldsConfig && !fieldsByName.has(rule.field) && rule.field !== placeholderFieldName) {
    diagnostics.push({
      id,
      path,
      code: 'UNDEFINED_FIELD',
      message: `Field "${rule.field}" is not defined in the fields config`,
      source: 'field-check',
    });
  }

  // Undefined field(s) referenced as value
  if (hasFieldsConfig) {
    for (const vf of getUndefinedValueFields(rule, fieldsByName)) {
      diagnostics.push({
        id,
        path,
        code: 'UNDEFINED_FIELD',
        message: `Value field "${vf}" is not defined in the fields config`,
        source: 'field-check',
      });
    }
  }

  // Value/type mismatch check (skip field-to-field comparisons; value is a field name)
  if (hasFieldsConfig && rule.valueSource !== 'field') {
    const fieldDef = fieldsByName.get(rule.field);
    if (fieldDef?.inputType) {
      const { inputType } = fieldDef;
      const mismatchCode = getValueList(rule)
        .map(v => checkValueTypeMismatch(v, inputType))
        .find(Boolean);
      if (mismatchCode) {
        diagnostics.push({
          id,
          path,
          code: mismatchCode,
          message: `Value "${rule.value}" is not compatible with input type "${fieldDef.inputType}"`,
          source: 'type-check',
        });
      }
    }
  }
};

/**
 * Reports rule features unsupported by the target format as `"format-check"` warnings.
 * When `negated`, the rule is checked as it would be after De Morgan push-down.
 */
const collectFormatDiagnostics = (
  rule: RuleType,
  path: number[],
  caps: FormatCapabilities,
  format: string,
  negated: boolean,
  diagnostics: DiagnosticEntry[]
): void => {
  const checked = negated ? negateRule(rule) : rule;
  const feature = checked
    ? getUnsupportedRuleFeature(checked, caps)
    : rule.match?.mode
      ? 'matchMode'
      : 'operator';
  if (!feature) return;
  const r = checked ?? rule;
  const codes = {
    matchMode: ['UNSUPPORTED_MATCH_MODE_FOR_FORMAT', `Match mode "${r.match?.mode}"`],
    valueSource: ['UNSUPPORTED_VALUE_SOURCE_FOR_FORMAT', `Value source "${r.valueSource}"`],
    operator: ['UNSUPPORTED_OPERATOR_FOR_FORMAT', `Operator "${r.operator}"`],
  } as const;
  const [code, desc] = codes[feature];
  const orig = feature === 'matchMode' ? rule.match?.mode : rule.operator;
  const note =
    !negated || feature === 'valueSource'
      ? ''
      : checked
        ? ` (negation of "${orig}")`
        : ' (cannot be negated)';
  diagnostics.push({
    id: rule.id ?? '',
    path,
    code,
    message: `${desc}${note} is not supported by format "${format}"`,
    source: 'format-check',
    severity: 'warning',
  });
};

/**
 * Format-check-only walk of a match-mode rule's `value` group (no stats/validity/field checks,
 * since nested fields are subfields of the parent array field).
 */
const collectNestedFormatDiagnostics = (
  rg: RuleGroupTypeAny,
  path: number[],
  caps: FormatCapabilities,
  format: string,
  parentNegated: boolean,
  diagnostics: DiagnosticEntry[]
): void => {
  if (rg.muted) return;
  const negated = parentNegated !== !!rg.not;
  for (const [i, rule] of rg.rules.entries()) {
    if (typeof rule === 'string' || rule.muted) continue;
    const childPath = [...path, i];
    if (isRuleGroup(rule)) {
      collectNestedFormatDiagnostics(rule, childPath, caps, format, negated, diagnostics);
      continue;
    }
    collectFormatDiagnostics(
      rule,
      childPath,
      caps,
      format,
      negated && !caps.nativeNot,
      diagnostics
    );
    if (rule.match?.mode && isRuleGroup(rule.value)) {
      collectNestedFormatDiagnostics(rule.value, childPath, caps, format, negated, diagnostics);
    }
  }
};

/**
 * Extracts `reasons` from a validation result, if present.
 */
const getReasons = (
  validationResult: boolean | ValidationResult | undefined
  // oxlint-disable-next-line typescript/no-explicit-any
): any[] | undefined => {
  if (
    typeof validationResult !== 'boolean' &&
    isValidationResult(validationResult) &&
    !validationResult.valid &&
    validationResult.reasons
  ) {
    return validationResult.reasons;
  }
  return undefined;
};

/**
 * Runs a field-level validator and extracts `reasons` if present.
 */
const getFieldValidatorReasons = (
  rule: RuleType,
  fieldValidator: RuleValidator | undefined
  // oxlint-disable-next-line typescript/no-explicit-any
): any[] | undefined => {
  if (typeof fieldValidator === 'function') {
    const vr = fieldValidator(rule);
    if (typeof vr !== 'boolean' && isValidationResult(vr) && !vr.valid && vr.reasons) {
      return vr.reasons;
    }
  }
  return undefined;
};

/**
 * Checks `rules` array shape: IC groups must alternate rule/group and combinator
 * strings; standard groups must not contain strings. Diagnostic-only.
 */
const collectStructureDiagnostics = (
  rg: RuleGroupTypeAny,
  path: number[],
  diagnostics: DiagnosticEntry[]
): void => {
  const id = rg.id ?? '';
  const push = (message: string) =>
    diagnostics.push({ id, path, code: 'INVALID_STRUCTURE', message, source: 'structure-check' });
  const rules = rg.rules as unknown[];

  if (isRuleGroupType(rg)) {
    const idx = rules.findIndex(r => typeof r === 'string');
    if (idx > -1) {
      push(`Group has a combinator string at index ${idx}; only rules and groups are allowed`);
    }
    return;
  }

  // IC: even indexes = rule/group, odd = combinator string, odd length (or empty)
  for (const [i, r] of rules.entries()) {
    const isStr = typeof r === 'string';
    if (i % 2 === 1 && !isStr) {
      push(`Expected a combinator string at index ${i}`);
      return;
    }
    if (i % 2 === 0 && isStr) {
      push(`Expected a rule or group at index ${i}, found combinator "${r}"`);
      return;
    }
  }
  if (rules.length % 2 === 0 && rules.length > 0) {
    push('Group ends with a combinator string');
  }
};

/**
 * Checks a rule against its field definition: operator membership (only when
 * `field.operators` is defined), list arity for `between`/`in` operators, `values`
 * membership for select-like editors, and boolean values for checkbox/switch editors.
 * Diagnostic-only.
 */
const collectFieldConfigDiagnostics = (
  rule: RuleType,
  path: number[],
  fieldDef: FullField,
  diagnostics: DiagnosticEntry[],
  placeholderOperatorName: string,
  placeholderValueName: string | undefined
): void => {
  const id = rule.id ?? '';
  const op = lc(rule.operator);

  const fieldOps = fieldDef.operators
    ? toFlatOptionArray(toFullOptionList<FullOperator>(fieldDef.operators as unknown[]))
    : undefined;
  const opDef = fieldOps?.find(o => o.name === rule.operator);

  // Operator valid for field
  if (fieldOps && !opDef && rule.operator !== placeholderOperatorName) {
    diagnostics.push({
      id,
      path,
      code: 'INVALID_OPERATOR',
      message: `Operator "${rule.operator}" is not valid for field "${rule.field}"`,
      source: 'field-check',
    });
  }

  if (
    op === 'null' ||
    op === 'notnull' ||
    opDef?.arity === 'unary' ||
    (typeof opDef?.arity === 'number' && opDef.arity < 2) ||
    (placeholderValueName !== undefined && rule.value === placeholderValueName)
  ) {
    return;
  }

  // List arity
  const isBetween = betweenOps.has(op);
  if (isBetween || inOps.has(op)) {
    const count = toArray(rule.value).length;
    if (isBetween ? count !== 2 : count === 0) {
      diagnostics.push({
        id,
        path,
        code: 'INVALID_VALUE_ARITY',
        message: isBetween
          ? `Operator "${rule.operator}" requires exactly 2 values; found ${count}`
          : `Operator "${rule.operator}" requires at least 1 value`,
        source: 'type-check',
      });
    }
  }

  if (rule.valueSource === 'field') return;

  const vet =
    typeof fieldDef.valueEditorType === 'function'
      ? fieldDef.valueEditorType(rule.operator)
      : fieldDef.valueEditorType;

  // Boolean editors
  if (vet === 'checkbox' || vet === 'switch') {
    const v = rule.value;
    if (typeof v !== 'boolean' && !(typeof v === 'string' && /^(true|false)$/i.test(v.trim()))) {
      diagnostics.push({
        id,
        path,
        code: 'VALUE_TYPE_MISMATCH',
        message: `Value "${v}" is not a boolean (valueEditorType "${vet}")`,
        source: 'type-check',
      });
    }
    return;
  }

  // `values` membership (mirrors getQueryJsonSchema: any editor but text/textarea)
  if (fieldDef.values && vet !== 'text' && vet !== 'textarea') {
    const allowed = new Set(
      toFlatOptionArray(toFullOptionList(fieldDef.values as unknown[])).map(v => `${v.name}`)
    );
    if (allowed.size === 0) return;
    const list =
      vet === 'multiselect' && typeof rule.value === 'string'
        ? toArray(rule.value)
        : getValueList(rule);
    const invalid = list.filter(
      v => v !== null && v !== undefined && v !== '' && !allowed.has(`${v}`)
    );
    if (invalid.length > 0) {
      diagnostics.push({
        id,
        path,
        code: 'VALUE_NOT_IN_OPTIONS',
        message: `Value(s) ${invalid.map(v => `"${v}"`).join(', ')} not in the "values" list for field "${rule.field}"`,
        source: 'type-check',
      });
    }
  }
};
