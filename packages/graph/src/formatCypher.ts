import type { RuleGroupType, RuleGroupTypeAny, RuleType } from '@react-querybuilder/core';
import { bigIntJsonStringifyReplacer, isRuleGroup } from '@react-querybuilder/core';
import type { CypherFormatOptions } from './types';
import { isPatternMeta } from './types';
import { buildCypherMatchPatterns, extractFilterElements, extractPatternRules } from './utils';

/**
 * Formats a `RuleGroupType` (with graph `meta` on rules) as a complete Cypher query string.
 *
 * Pattern rules (`meta.graphRole === 'pattern'`) produce the `MATCH` clause.
 * Filter rules (`meta.graphRole === 'filter'` or no `meta`) produce the `WHERE` clause.
 * Nested sub-groups produce parenthesized boolean expressions in `WHERE`.
 */
export const formatCypher = (
  query: RuleGroupTypeAny,
  { includeReturn = true }: CypherFormatOptions = {}
): string => {
  const patternRules = extractPatternRules(query);
  const filterElements = extractFilterElements(query);

  const lines: string[] = [];

  // MATCH clause
  if (patternRules.length > 0) {
    const { required, optional } = buildCypherMatchPatterns(patternRules);

    for (const pattern of required) {
      lines.push(`MATCH ${pattern}`);
    }
    for (const pattern of optional) {
      lines.push(`OPTIONAL MATCH ${pattern}`);
    }
  }

  // WHERE clause
  const filterGroup: RuleGroupType = {
    combinator: (query as RuleGroupType).combinator ?? 'and',
    not: query.not,
    rules: filterElements as RuleGroupType['rules'],
  };
  const whereClause = formatCypherWhereClause(filterGroup);
  if (whereClause) {
    lines.push(`WHERE ${whereClause}`);
  }

  // RETURN clause
  if (includeReturn) {
    const aliases = collectBoundAliases(patternRules);
    if (aliases.length > 0) {
      lines.push(`RETURN ${aliases.join(', ')}`);
    }
  }

  return lines.join('\n');
};

/**
 * Formats a `RuleGroupType` as a GQL query string.
 * GQL is ~95% compatible with Cypher; this applies the minor syntax differences.
 */
export const formatGQL = (query: RuleGroupTypeAny, options: CypherFormatOptions = {}): string =>
  formatCypher(query, { ...options, dialect: 'gql' });

/**
 * Formats just the WHERE clause portion from a rule group.
 * Useful when you only need filter conditions without the MATCH/RETURN structure.
 */
export const formatCypherWhereClause = (rg: RuleGroupTypeAny): string => {
  const parts: string[] = [];

  for (const r of rg.rules) {
    if (typeof r === 'string') continue;
    if (isRuleGroup(r)) {
      const nested = formatCypherWhereClause(r);
      if (nested) parts.push(`(${nested})`);
    } else {
      const meta = r.meta as Record<string, unknown> | undefined;
      if (meta && isPatternMeta(meta)) continue;
      const formatted = formatCypherRule(r);
      if (formatted) parts.push(formatted);
    }
  }

  if (parts.length === 0) return '';

  const combinator = (rg as RuleGroupType).combinator ?? 'and';
  const joined = parts.join(` ${combinator.toUpperCase()} `);
  return rg.not ? `NOT (${joined})` : joined;
};

/** Formats a single rule as a Cypher WHERE condition. */
const formatCypherRule = (rule: RuleType): string => {
  const { field, operator, value } = rule;
  const v = formatCypherValue(value);

  switch (operator) {
    case '=':
      return `${field} = ${v}`;
    case '!=':
    case '<>':
      return `${field} <> ${v}`;
    case '<':
      return `${field} < ${v}`;
    case '>':
      return `${field} > ${v}`;
    case '<=':
      return `${field} <= ${v}`;
    case '>=':
      return `${field} >= ${v}`;
    case 'contains':
      return `${field} CONTAINS ${v}`;
    case 'doesNotContain':
      return `NOT ${field} CONTAINS ${v}`;
    case 'beginsWith':
      return `${field} STARTS WITH ${v}`;
    case 'doesNotBeginWith':
      return `NOT ${field} STARTS WITH ${v}`;
    case 'endsWith':
      return `${field} ENDS WITH ${v}`;
    case 'doesNotEndWith':
      return `NOT ${field} ENDS WITH ${v}`;
    case 'null':
      return `${field} IS NULL`;
    case 'notNull':
      return `${field} IS NOT NULL`;
    case 'in':
      return `${field} IN ${formatCypherList(value)}`;
    case 'notIn':
      return `NOT ${field} IN ${formatCypherList(value)}`;
    case 'between':
      return formatCypherBetween(field, value, false);
    case 'notBetween':
      return formatCypherBetween(field, value, true);
    default:
      return `${field} ${operator} ${v}`;
  }
};

const formatCypherValue = (value: unknown): string => {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number') return String(value);
  if (typeof value === 'bigint') return JSON.stringify(value, bigIntJsonStringifyReplacer);
  const s = typeof value === 'string' ? value : (JSON.stringify(value) ?? '');
  return `'${s.replace(/'/g, "\\'")}'`;
};

const formatCypherList = (value: unknown): string => {
  const items = Array.isArray(value)
    ? value
    : String(value)
        .split(',')
        .map(s => s.trim());
  return `[${items.map(formatCypherValue).join(', ')}]`;
};

const formatCypherBetween = (field: string, value: unknown, negate: boolean): string => {
  const values = Array.isArray(value)
    ? value
    : String(value)
        .split(',')
        .map(s => s.trim());
  const [low, high] = values;
  const expr = `${formatCypherValue(low)} <= ${field} AND ${field} <= ${formatCypherValue(high)}`;
  return negate ? `NOT (${expr})` : expr;
};

/** Collects all unique node aliases from pattern rules. */
const collectBoundAliases = (patternRules: RuleType[]): string[] => {
  const aliases = new Set<string>();
  for (const rule of patternRules) {
    const meta = rule.meta as Record<string, unknown> | undefined;
    if (meta && 'nodeAlias' in meta) {
      aliases.add(meta.nodeAlias as string);
    }
    if (meta && 'targetAlias' in meta) {
      aliases.add(meta.targetAlias as string);
    }
  }
  return [...aliases];
};
