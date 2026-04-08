import type {
  DiagnosticEntry,
  DiagnosticsFieldSummaryEntry,
  DiagnosticsResult,
  DiagnosticsStats,
  FullField,
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
import { isRuleGroup, isRuleGroupType } from '../isRuleGroup';
import { isRuleOrGroupValid, isValidationResult } from '../isRuleOrGroupValid';
import { numericRegex } from '../misc';
import { toFlatOptionArray } from '../optGroupUtils';

const numericInputTypes = new Set(['number', 'range', 'bigint']);

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
  } = options;

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
    path: number[]
  ): RuleGroupDiagnosticsResult | RuleGroupICDiagnosticsResult => {
    stats.totalGroups++;
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
        const annotatedGroup = processRuleGroup(rule, childPath);
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
        !(placeholderValueName !== undefined && rule.value === placeholderValueName);

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

  // Custom validator diagnostics (only if not already covered by other checks)
  if (
    !rule.muted &&
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

  // Value/type mismatch check
  if (hasFieldsConfig) {
    const fieldDef = fieldsByName.get(rule.field);
    if (fieldDef?.inputType) {
      const mismatchCode = checkValueTypeMismatch(rule.value, fieldDef.inputType);
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
