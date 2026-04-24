import type {
  FullField,
  RuleGroupType,
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
import { defaultRuleGroupProcessorCypher, defaultRuleProcessorCypher } from './formatCypher';
import {
  buildGremlinPatternSteps,
  defaultRuleGroupProcessorGremlin,
  defaultRuleProcessorGremlin,
} from './formatGremlin';
import { defaultRuleGroupProcessorSPARQL, defaultRuleProcessorSPARQL } from './formatSPARQL';
import type {
  FormatGraphQueryOptions,
  GraphQueryFormat,
  GraphRuleGroupProcessor,
  GraphRuleProcessor,
  SparqlPatternMeta,
} from './types';
import { isPatternMeta } from './types';
import {
  buildCypherMatchPatterns,
  extractFilterElements,
  extractPatternRules,
  groupBySubject,
} from './utils';

// ── Default Processor Maps ──────────────────────────────────────────────────

const defaultRuleProcessors: Record<GraphQueryFormat, GraphRuleProcessor> = {
  cypher: defaultRuleProcessorCypher,
  gql: defaultRuleProcessorCypher,
  sparql: defaultRuleProcessorSPARQL,
  gremlin: defaultRuleProcessorGremlin,
};

const defaultRuleGroupProcessors: Record<GraphQueryFormat, GraphRuleGroupProcessor> = {
  cypher: defaultRuleGroupProcessorCypher,
  gql: defaultRuleGroupProcessorCypher,
  sparql: defaultRuleGroupProcessorSPARQL,
  gremlin: defaultRuleGroupProcessorGremlin,
};

/**
 * Formats a query object as a graph query string in the specified format.
 *
 * This is the unified entry point for all graph query language formatters.
 * It pre-processes the query (validation, `parseNumbers`, placeholder
 * filtering), resolves processors, and then assembles the format-specific output.
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

  // ── Resolve processors ──────────────────────────────────────────────────
  const ruleProcessor = options.ruleProcessor ?? defaultRuleProcessors[format];
  const ruleGroupProcessor = options.ruleGroupProcessor ?? defaultRuleGroupProcessors[format];
  const processorOptions = { ruleProcessor, ruleGroupProcessor };

  // ── Assemble output ─────────────────────────────────────────────────────
  switch (format) {
    case 'cypher':
    case 'gql': {
      const patternRules = extractPatternRules(preprocessedQuery);
      const filterElements = extractFilterElements(preprocessedQuery);

      const lines: string[] = [];

      // MATCH clause
      if (patternRules.length > 0) {
        const { required, optional } = buildCypherMatchPatterns(patternRules);
        for (const pattern of required) lines.push(`MATCH ${pattern}`);
        for (const pattern of optional) lines.push(`OPTIONAL MATCH ${pattern}`);
      }

      // WHERE clause via processor
      const filterGroup: RuleGroupType = {
        combinator: (preprocessedQuery as RuleGroupType).combinator ?? 'and',
        not: preprocessedQuery.not,
        rules: filterElements as RuleGroupType['rules'],
      };
      const whereClause = ruleGroupProcessor(filterGroup, processorOptions);
      if (whereClause) lines.push(`WHERE ${whereClause}`);

      // RETURN clause
      if (options.includeReturn !== false) {
        const aliases = collectBoundAliases(patternRules);
        if (aliases.length > 0) lines.push(`RETURN ${aliases.join(', ')}`);
      }

      return lines.join('\n');
    }

    case 'sparql': {
      const { prefixes = {}, selectVariables, indent = '  ' } = options;
      const patternRules = extractPatternRules(preprocessedQuery);
      const filterElements = extractFilterElements(preprocessedQuery);

      const lines: string[] = [];

      // PREFIX declarations
      for (const [prefix, uri] of Object.entries(prefixes)) {
        lines.push(`PREFIX ${prefix}: <${uri}>`);
      }

      // SELECT
      const boundVars = selectVariables ?? collectSparqlVariables(patternRules);
      if (lines.length > 0) lines.push('');
      lines.push(`SELECT ${boundVars.join(' ')}`);
      lines.push('WHERE {');

      // Triple patterns
      const grouped = groupBySubject(patternRules);
      const optionalTriples: string[] = [];
      const requiredTriples: string[] = [];
      for (const [subject, rules] of grouped) {
        for (const rule of rules) {
          const meta = rule.meta as SparqlPatternMeta;
          const triple = `${indent}${subject} ${rule.field} ${String(rule.value)} .`;
          if (meta.optional) {
            optionalTriples.push(triple);
          } else {
            requiredTriples.push(triple);
          }
        }
      }
      lines.push(...requiredTriples);
      if (optionalTriples.length > 0) {
        lines.push(`${indent}OPTIONAL {`);
        for (const triple of optionalTriples) lines.push(`${indent}${triple}`);
        lines.push(`${indent}}`);
      }

      // FILTER clause via processor
      const filterGroup: RuleGroupType = {
        combinator: (preprocessedQuery as RuleGroupType).combinator ?? 'and',
        not: preprocessedQuery.not,
        rules: filterElements as RuleGroupType['rules'],
      };
      const filterExpr = ruleGroupProcessor(filterGroup, processorOptions);
      if (filterExpr) lines.push(`${indent}FILTER (${filterExpr})`);

      lines.push('}');
      return lines.join('\n');
    }

    case 'gremlin': {
      const { traversalSource = 'g' } = options;

      const parts: string[] = [`${traversalSource}.V()`];
      const patternSteps = buildGremlinPatternSteps(preprocessedQuery);
      const filterSteps = ruleGroupProcessor(preprocessedQuery, processorOptions);

      parts.push(...patternSteps);
      if (filterSteps) parts.push(filterSteps);

      return parts.join('');
    }

    default:
      return fallbackExpression;
  }
};

// ── Private helpers (shared by assembly logic) ────────────────────────────

/** Collects all unique node aliases from pattern rules. */
const collectBoundAliases = (patternRules: RuleType[]): string[] => {
  const aliases = new Set<string>();
  for (const rule of patternRules) {
    const meta = rule.meta as Record<string, unknown> | undefined;
    if (meta && 'nodeAlias' in meta) aliases.add(meta.nodeAlias as string);
    if (meta && 'targetAlias' in meta) aliases.add(meta.targetAlias as string);
  }
  return [...aliases];
};

/** Collects all SPARQL variables (starting with `?`) from pattern rules. */
const collectSparqlVariables = (patternRules: RuleType[]): string[] => {
  const vars = new Set<string>();
  for (const rule of patternRules) {
    const meta = rule.meta as Record<string, unknown> | undefined;
    if (meta && 'subject' in meta) {
      const subject = String(meta.subject);
      if (subject.startsWith('?')) vars.add(subject);
    }
    const val = String(rule.value);
    if (val.startsWith('?')) vars.add(val);
  }
  return [...vars];
};
