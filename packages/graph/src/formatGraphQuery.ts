import type {
  FullField,
  RuleGroupTypeAny,
  RuleType,
  ValidationMap,
} from '@react-querybuilder/core';
import {
  defaultPlaceholderFieldName,
  defaultPlaceholderOperatorName,
  getParseNumberMethod,
  isRuleGroup,
  parseNumber,
  toFlatOptionArray,
  toFullOptionList,
} from '@react-querybuilder/core';
import { formatCypher } from './formatCypher';
import { formatGremlin } from './formatGremlin';
import { formatSPARQL } from './formatSPARQL';
import type {
  CypherFormatOptions,
  FormatGraphQueryOptions,
  GremlinFormatOptions,
  SparqlFormatOptions,
} from './types';
import { isPatternMeta } from './types';

/**
 * Formats a query object as a graph query string in the specified format.
 *
 * This is the unified entry point for all graph query language formatters.
 * It pre-processes the query (validation, `parseNumbers`, placeholder
 * filtering) and then dispatches to the appropriate format-specific function.
 */
export const formatGraphQuery = (
  query: RuleGroupTypeAny,
  options: FormatGraphQueryOptions
): string => {
  const {
    format,
    parseNumbers,
    fields: fieldsOption,
    validator,
    fallbackExpression = '',
    placeholderFieldName = defaultPlaceholderFieldName,
    placeholderOperatorName = defaultPlaceholderOperatorName,
    preserveValueOrder = false,
  } = options;

  // ── Validation ──────────────────────────────────────────────────────────
  let validationMap: ValidationMap = {};

  if (typeof validator === 'function') {
    const validationResult = validator(query);
    if (typeof validationResult === 'boolean') {
      if (!validationResult) {
        return fallbackExpression;
      }
    } else {
      validationMap = validationResult;
    }
  }

  // Build a validator lookup from `fields`
  const uniqueFields = fieldsOption
    ? (toFlatOptionArray(toFullOptionList(fieldsOption)) as FullField[])
    : [];
  const fieldValidatorMap = new Map<string, (rule: RuleType) => boolean>();
  for (const f of uniqueFields) {
    if (typeof f.validator === 'function') {
      fieldValidatorMap.set(f.value ?? f.name, f.validator as (rule: RuleType) => boolean);
    }
  }

  // ── Pre-processing ──────────────────────────────────────────────────────
  const parseNumberMethod = getParseNumberMethod({ parseNumbers });

  const processRule = (rule: RuleType): RuleType | false => {
    const meta = rule.meta as Record<string, unknown> | undefined;

    // Skip pattern rules from pre-processing (they define graph structure)
    if (meta && isPatternMeta(meta)) {
      return rule;
    }

    // Skip placeholder rules
    if (rule.field === placeholderFieldName || rule.operator === placeholderOperatorName) {
      return false;
    }

    // Per-rule validation via validationMap
    if (rule.id && validationMap[rule.id] === false) {
      return false;
    }

    // Field-level validation
    if (fieldValidatorMap.size > 0) {
      const fieldValidator = fieldValidatorMap.get(rule.field);
      if (typeof fieldValidator === 'function' && !fieldValidator(rule)) {
        return false;
      }
    }

    // parseNumbers: convert string values to numbers
    if (parseNumberMethod) {
      let { value } = rule;
      const op = rule.operator;

      if (op === 'between' || op === 'notBetween') {
        const vals = Array.isArray(value)
          ? value
          : String(value)
              .split(',')
              .map(s => s.trim());
        let [low, high] = vals.map(v => parseNumber(v, { parseNumbers: parseNumberMethod }));
        // Sort ascending unless preserveValueOrder is set
        if (
          !preserveValueOrder &&
          typeof low === 'number' &&
          typeof high === 'number' &&
          low > high
        ) {
          [low, high] = [high, low];
        }
        value = [low, high];
      } else if (op === 'in' || op === 'notIn') {
        const items = Array.isArray(value)
          ? value
          : String(value)
              .split(',')
              .map(s => s.trim());
        value = items.map(v => parseNumber(v, { parseNumbers: parseNumberMethod }));
      } else if (op !== 'null' && op !== 'notNull') {
        value = parseNumber(value, { parseNumbers: parseNumberMethod });
      }

      return { ...rule, value };
    }

    return rule;
  };

  const processGroup = (rg: RuleGroupTypeAny): RuleGroupTypeAny => {
    const processedRules = rg.rules
      .map(r => {
        if (typeof r === 'string') return r;
        if (isRuleGroup(r)) return processGroup(r);
        return processRule(r);
      })
      .filter((r): r is Exclude<typeof r, false> => r !== false);
    return { ...rg, rules: processedRules } as RuleGroupTypeAny;
  };

  const preprocessedQuery = processGroup(query);

  // ── Dispatch ────────────────────────────────────────────────────────────
  switch (format) {
    case 'cypher': {
      const cypherOpts: CypherFormatOptions = {
        dialect: 'cypher',
        includeReturn: options.includeReturn,
        paramPrefix: options.paramPrefix,
        indent: options.indent,
      };
      return formatCypher(preprocessedQuery, cypherOpts);
    }
    case 'gql': {
      const gqlOpts: CypherFormatOptions = {
        dialect: 'gql',
        includeReturn: options.includeReturn,
        paramPrefix: options.paramPrefix,
        indent: options.indent,
      };
      return formatCypher(preprocessedQuery, gqlOpts);
    }
    case 'sparql': {
      const sparqlOpts: SparqlFormatOptions = {
        prefixes: options.prefixes,
        selectVariables: options.selectVariables,
        indent: options.indent,
      };
      return formatSPARQL(preprocessedQuery, sparqlOpts);
    }
    case 'gremlin': {
      const gremlinOpts: GremlinFormatOptions = {
        traversalSource: options.traversalSource,
        indent: options.indent,
      };
      return formatGremlin(preprocessedQuery, gremlinOpts);
    }
    default:
      return fallbackExpression;
  }
};
