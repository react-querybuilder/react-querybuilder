import { Parser as SparqlParser } from '@traqula/parser-sparql-1-2';
import type {
  DefaultRuleGroupType,
  DefaultRuleGroupTypeAny,
  DefaultRuleGroupTypeIC,
  DefaultRuleType,
} from '../../types';

// Reuse a single parser instance (Chevrotain-backed; creating parsers is expensive)
let parserInstance: SparqlParser | undefined;
const getParser = (): SparqlParser => {
  if (!parserInstance) {
    parserInstance = new SparqlParser();
  }
  return parserInstance;
};

// ─── Traqula AST Type Subset ─────────────────────────────────────────────────

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
  | TraqulaQuery;

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

/** Walks patterns, extracting only FILTER expressions (skipping BGP triples). */
const visitPatterns = (
  patterns: TraqulaPattern[],
  out: (DefaultRuleType | DefaultRuleGroupType)[]
): void => {
  for (const p of patterns) {
    if (p.type === 'pattern') {
      switch (p.subType) {
        case 'bgp':
          // Skip triple patterns — Phase 1 only extracts filter conditions
          break;
        case 'optional':
          visitPatterns((p as TraqulaOptional).patterns, out);
          break;
        case 'filter':
          visitFilter((p as TraqulaFilter).expression, out);
          break;
        case 'group':
          visitPatterns((p as TraqulaPatternGroup).patterns, out);
          break;
        case 'union': {
          const union = p as TraqulaUnion;
          const subRules: (DefaultRuleType | DefaultRuleGroupType)[] = [];
          for (const branch of union.patterns) {
            const branchRules: (DefaultRuleType | DefaultRuleGroupType)[] = [];
            visitPatterns(branch.patterns, branchRules);
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
const visitFilter = (
  expr: TraqulaExpression,
  out: (DefaultRuleType | DefaultRuleGroupType)[]
): void => {
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
      const subRules: (DefaultRuleType | DefaultRuleGroupType)[] = [];
      for (const arg of args) {
        const branchRules: (DefaultRuleType | DefaultRuleGroupType)[] = [];
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
          out.push({ field, operator: 'null', value: null } as DefaultRuleType);
          return;
        }
        const innerRules: (DefaultRuleType | DefaultRuleGroupType)[] = [];
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
      out.push({ field, operator: sparqlOpToRqb[op], value } as DefaultRuleType);
      return;
    }

    // BOUND(?x) → notNull
    if (op === 'bound' && args.length === 1) {
      const field = termToString(args[0] as TraqulaTerm);
      out.push({ field, operator: 'notNull', value: null } as DefaultRuleType);
      return;
    }

    // String functions
    if (op === 'contains' && args.length === 2) {
      const field = termToString(args[0] as TraqulaTerm);
      const value = termToLiteralValue(args[1] as TraqulaExpression);
      out.push({ field, operator: 'contains', value } as DefaultRuleType);
      return;
    }
    if (op === 'strstarts' && args.length === 2) {
      const field = termToString(args[0] as TraqulaTerm);
      const value = termToLiteralValue(args[1] as TraqulaExpression);
      out.push({ field, operator: 'beginsWith', value } as DefaultRuleType);
      return;
    }
    if (op === 'strends' && args.length === 2) {
      const field = termToString(args[0] as TraqulaTerm);
      const value = termToLiteralValue(args[1] as TraqulaExpression);
      out.push({ field, operator: 'endsWith', value } as DefaultRuleType);
      return;
    }
  }
};

/** Negates a rule by converting its operator. */
const negateRule = (rule: DefaultRuleType): DefaultRuleType => {
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
  return { ...rule, operator: negMap[rule.operator] ?? rule.operator } as DefaultRuleType;
};

/**
 * Ensures all prefixed names in a SPARQL query have corresponding PREFIX
 * declarations so the parser accepts them without requiring full URIs.
 */
const ensurePrefixes = (sparql: string): string => {
  const declaredPrefixes = new Set<string>();
  const prefixDeclRegex = /PREFIX\s+(\w*):/gi;
  let m: RegExpExecArray | null;
  while ((m = prefixDeclRegex.exec(sparql)) !== null) {
    declaredPrefixes.add(m[1].toLowerCase());
  }

  const usedPrefixes = new Set<string>();
  const prefixUsageRegex = /\b(\w+):\w+/g;
  while ((m = prefixUsageRegex.exec(sparql)) !== null) {
    const prefix = m[1];
    if (/^https?$/i.test(prefix) || /^urn$/i.test(prefix)) continue;
    const before = sparql.slice(0, m.index);
    const lastOpen = before.lastIndexOf('<');
    const lastClose = before.lastIndexOf('>');
    if (lastOpen > lastClose) continue;
    if (!declaredPrefixes.has(prefix.toLowerCase())) {
      usedPrefixes.add(prefix);
    }
  }

  if (usedPrefixes.size === 0) return sparql;

  const stubs = [...usedPrefixes].map(p => `PREFIX ${p}: <urn:rqb:prefix:${p}:>`).join('\n');
  return stubs + '\n' + sparql;
};

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Options for {@link parseSPARQL}.
 */
export interface ParseSPARQLOptions {
  independentCombinators?: boolean;
}

/**
 * Parses a SPARQL query string into a {@link DefaultRuleGroupType}.
 *
 * Accepts a full SPARQL query or a `FILTER` expression. Triple patterns are
 * consumed but discarded — only FILTER conditions are returned.
 *
 * @example
 * ```ts
 * // Full query — extracts FILTER conditions only
 * parseSPARQL('SELECT ?x WHERE { ?x foaf:name ?name . FILTER(?age > 30) }');
 *
 * // Bare FILTER expression wrapped in a stub query
 * parseSPARQL('?age > 30 && ?name != "Alice"');
 * ```
 */
export function parseSPARQL(sparql: string): DefaultRuleGroupType;
export function parseSPARQL(
  sparql: string,
  options: Omit<ParseSPARQLOptions, 'independentCombinators'> & {
    independentCombinators?: false;
  }
): DefaultRuleGroupType;
export function parseSPARQL(
  sparql: string,
  options: Omit<ParseSPARQLOptions, 'independentCombinators'> & {
    independentCombinators: true;
  }
): DefaultRuleGroupTypeIC;
export function parseSPARQL(
  sparql: string,
  _options?: ParseSPARQLOptions
): DefaultRuleGroupTypeAny {
  const trimmed = sparql.trim();
  if (!trimmed) return { combinator: 'and', rules: [] };

  // Auto-detect input shape
  let input = trimmed;
  if (/^\s*(select|prefix|construct|describe|ask)\b/i.test(input)) {
    // Full SPARQL query — parse as-is
  } else {
    // Bare expression — wrap in a stub query with FILTER
    input = `SELECT * WHERE { FILTER(${input}) }`;
  }

  const prepared = ensurePrefixes(input);

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

  const rules: (DefaultRuleType | DefaultRuleGroupType)[] = [];
  visitPatterns(typed.where.patterns ?? [], rules);
  return { combinator: 'and', rules };
}
