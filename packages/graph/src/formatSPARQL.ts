import type { RuleGroupType, RuleGroupTypeAny, RuleType } from '@react-querybuilder/core';
import { isRuleGroup } from '@react-querybuilder/core';
import type { SparqlFormatOptions, SparqlPatternMeta } from './types';
import { isPatternMeta } from './types';
import { extractFilterElements, extractPatternRules, groupBySubject } from './utils';

/**
 * Formats a `RuleGroupType` (with graph `meta` on rules) as a SPARQL query string.
 *
 * Pattern rules (`meta.graphRole === 'pattern'`) produce triple patterns.
 * Filter rules produce `FILTER` expressions.
 */
export const formatSPARQL = (
  query: RuleGroupTypeAny,
  options: SparqlFormatOptions = {}
): string => {
  const { prefixes = {}, selectVariables, indent = '  ' } = options;

  const patternRules = extractPatternRules(query);
  const filterElements = extractFilterElements(query);

  const lines: string[] = [];

  // PREFIX declarations
  for (const [prefix, uri] of Object.entries(prefixes)) {
    lines.push(`PREFIX ${prefix}: <${uri}>`);
  }

  // Collect bound variables for SELECT
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
      const predicate = rule.field;
      const object = String(rule.value);
      const triple = `${indent}${subject} ${predicate} ${object} .`;

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
    for (const triple of optionalTriples) {
      lines.push(`${indent}${triple}`);
    }
    lines.push(`${indent}}`);
  }

  // FILTER clause
  const filterGroup: RuleGroupType = {
    combinator: (query as RuleGroupType).combinator ?? 'and',
    not: query.not,
    rules: filterElements as RuleGroupType['rules'],
  };
  const filterExpr = formatSparqlFilter(filterGroup);
  if (filterExpr) {
    lines.push(`${indent}FILTER (${filterExpr})`);
  }

  lines.push('}');

  return lines.join('\n');
};

/** Formats a rule group as a SPARQL FILTER expression. */
const formatSparqlFilter = (rg: RuleGroupTypeAny): string => {
  const parts: string[] = [];

  for (const r of rg.rules) {
    if (typeof r === 'string') continue;
    if (isRuleGroup(r)) {
      const nested = formatSparqlFilter(r);
      if (nested) parts.push(`(${nested})`);
    } else {
      const meta = r.meta as Record<string, unknown> | undefined;
      if (meta && isPatternMeta(meta)) continue;
      const formatted = formatSparqlRule(r);
      if (formatted) parts.push(formatted);
    }
  }

  if (parts.length === 0) return '';

  const combinator = (rg as RuleGroupType).combinator ?? 'and';
  const op = combinator === 'or' ? ' || ' : ' && ';
  const joined = parts.join(op);
  return rg.not ? `!(${joined})` : joined;
};

/** Formats a single rule as a SPARQL FILTER expression. */
const formatSparqlRule = (rule: RuleType): string => {
  const { field, operator, value } = rule;
  const v = formatSparqlValue(value);

  switch (operator) {
    case '=':
      return `${field} = ${v}`;
    case '!=':
    case '<>':
      return `${field} != ${v}`;
    case '<':
      return `${field} < ${v}`;
    case '>':
      return `${field} > ${v}`;
    case '<=':
      return `${field} <= ${v}`;
    case '>=':
      return `${field} >= ${v}`;
    case 'contains':
      return `CONTAINS(${field}, ${v})`;
    case 'doesNotContain':
      return `!CONTAINS(${field}, ${v})`;
    case 'beginsWith':
      return `STRSTARTS(${field}, ${v})`;
    case 'doesNotBeginWith':
      return `!STRSTARTS(${field}, ${v})`;
    case 'endsWith':
      return `STRENDS(${field}, ${v})`;
    case 'doesNotEndWith':
      return `!STRENDS(${field}, ${v})`;
    case 'null':
      return `!BOUND(${field})`;
    case 'notNull':
      return `BOUND(${field})`;
    case 'in': {
      const items = Array.isArray(value)
        ? value
        : String(value)
            .split(',')
            .map(s => s.trim());
      return items.map(item => `${field} = ${formatSparqlValue(item)}`).join(' || ');
    }
    case 'notIn': {
      const items = Array.isArray(value)
        ? value
        : String(value)
            .split(',')
            .map(s => s.trim());
      return items.map(item => `${field} != ${formatSparqlValue(item)}`).join(' && ');
    }
    case 'between': {
      const vals = Array.isArray(value)
        ? value
        : String(value)
            .split(',')
            .map(s => s.trim());
      return `${field} >= ${formatSparqlValue(vals[0])} && ${field} <= ${formatSparqlValue(vals[1])}`;
    }
    case 'notBetween': {
      const vals = Array.isArray(value)
        ? value
        : String(value)
            .split(',')
            .map(s => s.trim());
      return `(${field} < ${formatSparqlValue(vals[0])} || ${field} > ${formatSparqlValue(vals[1])})`;
    }
    default:
      return `${field} ${operator} ${v}`;
  }
};

const formatSparqlValue = (value: unknown): string => {
  if (value === null || value === undefined) return '""';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return `"${value}"^^xsd:boolean`;
  const s = typeof value === 'string' ? value : (JSON.stringify(value) ?? '');
  // Don't quote variable references or URIs
  if (s.startsWith('?') || s.startsWith('<') || s.includes(':')) return s;
  return `"${s.replace(/"/g, '\\"')}"`;
};

/** Collects all variables (starting with `?`) from pattern rules. */
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
