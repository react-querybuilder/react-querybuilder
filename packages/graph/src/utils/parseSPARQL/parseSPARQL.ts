import type { RuleGroupType, RuleType } from '@react-querybuilder/core';
import { Parser as SparqlParser } from '@traqula/parser-sparql-1-2';
import type { SparqlFilterMeta, SparqlPatternMeta } from '../../types';

// Reuse a single parser instance (Chevrotain-backed; creating parsers is expensive)
let parserInstance: SparqlParser | undefined;
const getParser = (): SparqlParser => {
  if (!parserInstance) {
    parserInstance = new SparqlParser();
  }
  return parserInstance;
};

/**
 * Parses a SPARQL query string into a `RuleGroupType` with graph `meta` on rules.
 *
 * Uses `@traqula/parser-sparql-1-2` for full SPARQL 1.1/1.2 grammar support.
 *
 * Handles:
 * - Triple patterns (`?s predicate ?o .`)
 * - `OPTIONAL { ... }` blocks
 * - `FILTER (...)` expressions with standard comparison operators and functions
 */
export const parseSPARQL = (sparql: string): RuleGroupType => {
  const trimmed = sparql.trim();
  if (!trimmed) return { combinator: 'and', rules: [] };

  const prepared = ensurePrefixes(trimmed);

  let ast: unknown;
  try {
    ast = getParser().parse(prepared);
  } catch {
    return { combinator: 'and', rules: [] };
  }

  const typed = ast as TraqulaQuery;
  if (!typed || typed.type !== 'query' || !typed.where) {
    return { combinator: 'and', rules: [] };
  }

  const rules: RuleGroupType['rules'] = [];
  visitPatterns(typed.where.patterns ?? [], false, rules);
  return { combinator: 'and', rules };
};

/**
 * Ensures all prefixed names in a SPARQL query have corresponding PREFIX
 * declarations. Undeclared prefixes get stub declarations so the parser
 * accepts them without requiring callers to provide full URIs.
 */
const ensurePrefixes = (sparql: string): string => {
  // Collect already-declared prefixes
  const declaredPrefixes = new Set<string>();
  const prefixDeclRegex = /PREFIX\s+(\w*):/gi;
  let m: RegExpExecArray | null;
  while ((m = prefixDeclRegex.exec(sparql)) !== null) {
    declaredPrefixes.add(m[1].toLowerCase());
  }

  // Find all prefixed names used in the query body (prefix:localName)
  const usedPrefixes = new Set<string>();
  const prefixUsageRegex = /\b(\w+):\w+/g;
  while ((m = prefixUsageRegex.exec(sparql)) !== null) {
    const prefix = m[1];
    // Skip things that look like protocols (http, https, urn, etc.)
    if (/^https?$/i.test(prefix) || /^urn$/i.test(prefix)) continue;
    // Skip if inside an IRI (<...>)
    const before = sparql.slice(0, m.index);
    const lastOpen = before.lastIndexOf('<');
    const lastClose = before.lastIndexOf('>');
    if (lastOpen > lastClose) continue;
    if (!declaredPrefixes.has(prefix.toLowerCase())) {
      usedPrefixes.add(prefix);
    }
  }

  if (usedPrefixes.size === 0) return sparql;

  // Prepend stub PREFIX declarations
  const stubs = [...usedPrefixes].map(p => `PREFIX ${p}: <urn:rqb:prefix:${p}:>`).join('\n');
  return stubs + '\n' + sparql;
};

// ─── Traqula AST Type Subset ─────────────────────────────────────────────────
// Minimal type descriptions for the Traqula nodes we walk.
// These are local to avoid coupling to Traqula's internal types.

interface TraqulaQuery {
  type: 'query';
  subType: string;
  where?: TraqulaPatternGroup;
  [key: string]: unknown;
}

interface TraqulaPatternGroup {
  type: 'pattern';
  subType: 'group';
  patterns: TraqulaPattern[];
}

type TraqulaPattern =
  | TraqulaBgp
  | TraqulaOptional
  | TraqulaFilter
  | TraqulaPatternGroup
  | TraqulaUnion
  | { type: 'pattern'; subType: string; [key: string]: unknown }
  | TraqulaQuery; // SubSelect

interface TraqulaBgp {
  type: 'pattern';
  subType: 'bgp';
  triples: TraqulaTriple[];
}

interface TraqulaOptional {
  type: 'pattern';
  subType: 'optional';
  patterns: TraqulaPattern[];
}

interface TraqulaFilter {
  type: 'pattern';
  subType: 'filter';
  expression: TraqulaExpression;
}

interface TraqulaUnion {
  type: 'pattern';
  subType: 'union';
  patterns: TraqulaPatternGroup[];
}

interface TraqulaTriple {
  type: 'triple';
  subject: TraqulaTerm;
  predicate: TraqulaTerm;
  object: TraqulaTerm;
}

interface TraqulaTerm {
  type: 'term' | 'path' | 'wildcard';
  subType?: string;
  value?: string;
  prefix?: string;
  langOrIri?: unknown;
  [key: string]: unknown;
}

interface TraqulaExpression {
  type: 'expression' | 'term';
  subType: string;
  operator?: string;
  args?: (TraqulaExpression | TraqulaTerm)[];
  value?: string;
  prefix?: string;
  langOrIri?: unknown;
  [key: string]: unknown;
}

// ─── AST Walker ──────────────────────────────────────────────────────────────

const filterMeta: SparqlFilterMeta = { graphRole: 'filter', graphLang: 'sparql' };

/** Serializes a Traqula term into a user-facing string. */
const termToString = (term: TraqulaTerm): string => {
  if (term.type === 'term') {
    switch (term.subType) {
      case 'variable':
        return `?${term.value}`;
      case 'namedNode':
        if (term.prefix !== undefined && term.prefix !== '') {
          return `${term.prefix}:${term.value}`;
        }
        return term.value ?? '';
      case 'literal':
        return term.value ?? '';
      case 'blankNode':
        return `_:${(term as { label?: string }).label ?? ''}`;
      default:
        return term.value ?? '';
    }
  }
  return '';
};

/** Extracts a literal JS value from a Traqula term. */
const termToLiteralValue = (term: TraqulaTerm | TraqulaExpression): unknown => {
  if (term.type === 'term' && term.subType === 'literal') {
    const raw = term.value ?? '';
    // Check for typed literals (numeric, boolean)
    if (term.langOrIri && typeof term.langOrIri === 'object') {
      const iri = term.langOrIri as TraqulaTerm;
      const datatype = iri.value ?? '';
      if (
        datatype.endsWith('#integer') ||
        datatype.endsWith('#decimal') ||
        datatype.endsWith('#double') ||
        datatype.endsWith('#float')
      ) {
        return Number(raw);
      }
      if (datatype.endsWith('#boolean')) {
        return raw === 'true';
      }
    }
    // Try numeric
    const num = Number(raw);
    if (raw !== '' && !Number.isNaN(num)) return num;
    return raw;
  }
  if (term.type === 'term' && term.subType === 'variable') {
    return `?${term.value}`;
  }
  if (term.type === 'term' && term.subType === 'namedNode') {
    return termToString(term as TraqulaTerm);
  }
  return term.value ?? '';
};

/** Walks a list of Traqula patterns, appending rules to `out`. */
const visitPatterns = (
  patterns: TraqulaPattern[],
  optional: boolean,
  out: RuleGroupType['rules']
): void => {
  for (const p of patterns) {
    if (p.type === 'pattern') {
      switch (p.subType) {
        case 'bgp':
          visitBgp(p as TraqulaBgp, optional, out);
          break;
        case 'optional':
          visitPatterns((p as TraqulaOptional).patterns, true, out);
          break;
        case 'filter':
          visitFilter((p as TraqulaFilter).expression, out);
          break;
        case 'group':
          visitPatterns((p as TraqulaPatternGroup).patterns, optional, out);
          break;
        case 'union': {
          const union = p as TraqulaUnion;
          const subRules: (RuleType | RuleGroupType)[] = [];
          for (const branch of union.patterns) {
            const branchRules: RuleGroupType['rules'] = [];
            visitPatterns(branch.patterns, optional, branchRules);
            if (branchRules.length === 1) {
              subRules.push(branchRules[0]);
            } else if (branchRules.length > 1) {
              subRules.push({ combinator: 'and', rules: branchRules });
            }
          }
          if (subRules.length > 0) {
            out.push({ combinator: 'or', rules: subRules });
          }
          break;
        }
        default:
          break;
      }
    }
  }
};

/** Converts BGP triples into pattern rules. */
const visitBgp = (bgp: TraqulaBgp, optional: boolean, out: RuleGroupType['rules']): void => {
  for (const triple of bgp.triples) {
    if (triple.type !== 'triple') continue;
    const subject = termToString(triple.subject);
    const predicate = termToString(triple.predicate);
    const object = termToString(triple.object);

    const meta: SparqlPatternMeta = {
      graphRole: 'pattern',
      graphLang: 'sparql',
      subject,
      optional,
    };
    out.push({
      field: predicate,
      operator: 'binds',
      value: object,
      meta,
    });
  }
};

/** Maps a SPARQL comparison operator string to an RQB operator. */
const sparqlOpToRqb: Record<string, string> = {
  '=': '=',
  '!=': '!=',
  '<': '<',
  '>': '>',
  '<=': '<=',
  '>=': '>=',
};

/** Converts a FILTER expression into rules. */
const visitFilter = (expr: TraqulaExpression, out: RuleGroupType['rules']): void => {
  if (expr.type === 'expression' && expr.subType === 'operation') {
    const op = expr.operator ?? '';
    const args = expr.args ?? [];

    // Logical operators
    if (op === '&&') {
      for (const arg of args) {
        visitFilter(arg as TraqulaExpression, out);
      }
      return;
    }
    if (op === '||') {
      const subRules: (RuleType | RuleGroupType)[] = [];
      for (const arg of args) {
        const branchRules: RuleGroupType['rules'] = [];
        visitFilter(arg as TraqulaExpression, branchRules);
        subRules.push(...branchRules);
      }
      out.push({ combinator: 'or', rules: subRules });
      return;
    }

    // Negation
    if (op === '!') {
      if (args.length === 1) {
        const inner = args[0] as TraqulaExpression;
        // !BOUND(x) → null check
        if (
          inner.type === 'expression' &&
          inner.subType === 'operation' &&
          inner.operator === 'bound'
        ) {
          const field = termToString((inner.args?.[0] ?? {}) as TraqulaTerm);
          out.push({ field, operator: 'null', value: null, meta: filterMeta });
          return;
        }
        const innerRules: RuleGroupType['rules'] = [];
        visitFilter(inner, innerRules);
        if (innerRules.length === 1 && !('combinator' in innerRules[0])) {
          out.push(negateRule(innerRules[0]));
        } else {
          out.push({ combinator: 'and', not: true, rules: innerRules });
        }
        return;
      }
    }

    // Comparison operators
    if (op in sparqlOpToRqb && args.length === 2) {
      const field = termToString(args[0] as TraqulaTerm);
      const value = termToLiteralValue(args[1] as TraqulaExpression);
      out.push({ field, operator: sparqlOpToRqb[op], value, meta: filterMeta });
      return;
    }

    // BOUND(?x) → notNull
    if (op === 'bound' && args.length === 1) {
      const field = termToString(args[0] as TraqulaTerm);
      out.push({ field, operator: 'notNull', value: null, meta: filterMeta });
      return;
    }

    // String functions
    if (op === 'contains' && args.length === 2) {
      const field = termToString(args[0] as TraqulaTerm);
      const value = termToLiteralValue(args[1] as TraqulaExpression);
      out.push({ field, operator: 'contains', value, meta: filterMeta });
      return;
    }
    if (op === 'strstarts' && args.length === 2) {
      const field = termToString(args[0] as TraqulaTerm);
      const value = termToLiteralValue(args[1] as TraqulaExpression);
      out.push({ field, operator: 'beginsWith', value, meta: filterMeta });
      return;
    }
    if (op === 'strends' && args.length === 2) {
      const field = termToString(args[0] as TraqulaTerm);
      const value = termToLiteralValue(args[1] as TraqulaExpression);
      out.push({ field, operator: 'endsWith', value, meta: filterMeta });
      return;
    }
  }
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
