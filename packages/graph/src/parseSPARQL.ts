import type { RuleGroupType, RuleType } from '@react-querybuilder/core';
import type { SparqlFilterMeta, SparqlPatternMeta } from './types';

/**
 * Parses a SPARQL query string into a `RuleGroupType` with graph `meta` on rules.
 *
 * Handles:
 * - Triple patterns (`?s predicate ?o .`)
 * - `OPTIONAL { ... }` blocks
 * - `FILTER (...)` expressions with standard comparison operators and functions
 *
 * This is a basic parser covering common SPARQL patterns.
 * It does not handle the full SPARQL 1.1 grammar.
 */
export const parseSPARQL = (sparql: string): RuleGroupType => {
  const rules: RuleGroupType['rules'] = [];
  const trimmed = sparql.trim();

  // Extract WHERE block
  const whereMatch = trimmed.match(/WHERE\s*\{([\s\S]*)\}\s*$/i);
  if (!whereMatch) {
    return { combinator: 'and', rules: [] };
  }

  const whereBody = whereMatch[1];
  const { triples, filters } = parseWhereBody(whereBody, false);
  rules.push(...triples, ...filters);

  return { combinator: 'and', rules };
};

interface WhereBodyResult {
  triples: RuleType[];
  filters: (RuleType | RuleGroupType)[];
}

/** Parses the body of a WHERE clause. */
const parseWhereBody = (body: string, optional: boolean): WhereBodyResult => {
  const triples: RuleType[] = [];
  const filters: (RuleType | RuleGroupType)[] = [];

  let remaining = body.trim();

  // Extract OPTIONAL blocks
  const optionalRegex = /OPTIONAL\s*\{([^}]+)\}/gi;
  let optMatch: RegExpExecArray | null;
  while ((optMatch = optionalRegex.exec(remaining)) !== null) {
    const optResult = parseWhereBody(optMatch[1], true);
    triples.push(...optResult.triples);
    filters.push(...optResult.filters);
  }
  remaining = remaining.replace(optionalRegex, '');

  // Extract FILTER clauses (handles nested parentheses)
  const filterPositions: { start: number; content: string }[] = [];
  const filterStartRegex = /FILTER\s*\(/gi;
  let fMatch: RegExpExecArray | null;
  while ((fMatch = filterStartRegex.exec(remaining)) !== null) {
    const parenStart = fMatch.index + fMatch[0].length - 1;
    const parenEnd = findMatchingParen(remaining, parenStart);
    if (parenEnd > parenStart) {
      filterPositions.push({
        start: fMatch.index,
        content: remaining.slice(parenStart + 1, parenEnd),
      });
    }
  }
  for (const fp of filterPositions) {
    const filterRules = parseSparqlFilter(fp.content.trim());
    filters.push(...filterRules);
  }
  // Remove FILTER clauses from remaining
  for (const fp of filterPositions.toReversed()) {
    const parenStart = remaining.indexOf('(', fp.start);
    const parenEnd = findMatchingParen(remaining, parenStart);
    remaining = remaining.slice(0, fp.start) + remaining.slice(parenEnd + 1);
  }

  // Parse triple patterns
  const tripleRegex = /(\S+)\s+(\S+)\s+(\S+)\s*\./g;
  let tripleMatch: RegExpExecArray | null;
  while ((tripleMatch = tripleRegex.exec(remaining)) !== null) {
    const [, subject, predicate, object] = tripleMatch;
    const meta: SparqlPatternMeta = {
      graphRole: 'pattern',
      graphLang: 'sparql',
      subject,
      optional,
    };
    triples.push({
      field: predicate,
      operator: 'binds',
      value: object,
      meta,
    });
  }

  return { triples, filters };
};

/** Parses a FILTER expression into rules. */
const parseSparqlFilter = (expr: string): (RuleType | RuleGroupType)[] => {
  const rules: (RuleType | RuleGroupType)[] = [];
  const meta: SparqlFilterMeta = { graphRole: 'filter', graphLang: 'sparql' };

  // Split on && and || (simple, non-nested)
  // For nested expressions, detect parenthesized sub-expressions
  const parts = splitFilterExpression(expr);

  if (parts.operator === 'single') {
    const rule = parseSingleSparqlFilter(parts.expressions[0], meta);
    if (rule) rules.push(rule);
  } else {
    const subRules: (RuleType | RuleGroupType)[] = [];
    for (const part of parts.expressions) {
      const rule = parseSingleSparqlFilter(part.trim(), meta);
      if (rule) subRules.push(rule);
    }
    if (subRules.length === 1) {
      rules.push(subRules[0]);
    } else if (subRules.length > 1) {
      rules.push({
        combinator: parts.operator === '||' ? 'or' : 'and',
        rules: subRules,
      });
    }
  }

  return rules;
};

interface SplitResult {
  expressions: string[];
  operator: '&&' | '||' | 'single';
}

/** Splits a filter expression on top-level && or || operators. */
const splitFilterExpression = (expr: string): SplitResult => {
  const trimmed = expr.trim();

  // Handle outer parentheses
  if (trimmed.startsWith('(') && findMatchingParen(trimmed, 0) === trimmed.length - 1) {
    return splitFilterExpression(trimmed.slice(1, -1));
  }

  let depth = 0;
  const parts: string[] = [];
  let current = '';
  let operator: '&&' | '||' | 'single' = 'single';

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;

    if (depth === 0 && (trimmed.slice(i, i + 2) === '&&' || trimmed.slice(i, i + 2) === '||')) {
      const op = trimmed.slice(i, i + 2) as '&&' | '||';
      if (operator === 'single') operator = op;
      parts.push(current.trim());
      current = '';
      i += 1; // skip second char
      continue;
    }
    current += ch;
  }

  if (current.trim()) parts.push(current.trim());

  return { expressions: parts, operator };
};

/** Finds the matching closing parenthesis. */
const findMatchingParen = (str: string, openPos: number): number => {
  let depth = 0;
  for (let i = openPos; i < str.length; i++) {
    if (str[i] === '(') depth++;
    else if (str[i] === ')') depth--;
    if (depth === 0) return i;
  }
  return -1;
};

/** Parses a single SPARQL filter expression. */
const parseSingleSparqlFilter = (
  expr: string,
  meta: SparqlFilterMeta
): RuleType | RuleGroupType | null => {
  const trimmed = expr.trim();

  // Handle negation: !(expr)
  if (trimmed.startsWith('!')) {
    const inner = trimmed.slice(1).trim();
    const innerResult = parseSingleSparqlFilter(
      inner.startsWith('(') ? inner.slice(1, -1) : inner,
      meta
    );
    if (!innerResult) return null;
    if ('combinator' in innerResult) {
      return { ...innerResult, not: true };
    }
    // Negate the operator
    return negateRule(innerResult);
  }

  // Handle parenthesized sub-expression
  if (trimmed.startsWith('(') && findMatchingParen(trimmed, 0) === trimmed.length - 1) {
    const subRules = parseSparqlFilter(trimmed.slice(1, -1));
    if (subRules.length === 1) return subRules[0];
    return { combinator: 'and', rules: subRules };
  }

  // CONTAINS(?field, "value")
  const containsMatch = trimmed.match(/^CONTAINS\((\?\w+),\s*"([^"]*)"\)$/i);
  if (containsMatch) {
    return { field: containsMatch[1], operator: 'contains', value: containsMatch[2], meta };
  }

  // STRSTARTS(?field, "value")
  const startsMatch = trimmed.match(/^STRSTARTS\((\?\w+),\s*"([^"]*)"\)$/i);
  if (startsMatch) {
    return { field: startsMatch[1], operator: 'beginsWith', value: startsMatch[2], meta };
  }

  // STRENDS(?field, "value")
  const endsMatch = trimmed.match(/^STRENDS\((\?\w+),\s*"([^"]*)"\)$/i);
  if (endsMatch) {
    return { field: endsMatch[1], operator: 'endsWith', value: endsMatch[2], meta };
  }

  // BOUND(?field) / !BOUND(?field) — negation handled above
  const boundMatch = trimmed.match(/^BOUND\((\?\w+)\)$/i);
  if (boundMatch) {
    return { field: boundMatch[1], operator: 'notNull', value: null, meta };
  }

  // Comparison: ?field op value
  const compMatch = trimmed.match(/^(\?\w+)\s*(=|!=|<>|<=|>=|<|>)\s*(.+)$/);
  if (compMatch) {
    const [, field, op, rawValue] = compMatch;
    const operator = op === '<>' ? '!=' : op;
    return { field, operator, value: parseSparqlLiteral(rawValue.trim()), meta };
  }

  return null;
};

/** Negates a rule by converting its operator. */
const negateRule = (rule: RuleType): RuleType => {
  const negMap: Record<string, string> = {
    contains: 'doesNotContain',
    beginsWith: 'doesNotBeginWith',
    endsWith: 'doesNotEndWith',
    notNull: 'null',
    null: 'notNull',
    '=': '!=',
    '!=': '=',
    '<': '>=',
    '>': '<=',
    '<=': '>',
    '>=': '<',
  };
  return { ...rule, operator: negMap[rule.operator] ?? rule.operator };
};

/** Parses a SPARQL literal value. */
const parseSparqlLiteral = (raw: string): unknown => {
  if (raw.startsWith('"') && raw.endsWith('"')) {
    return raw.slice(1, -1).replace(/\\"/g, '"');
  }
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  const num = Number(raw);
  if (!Number.isNaN(num)) return num;
  return raw;
};
