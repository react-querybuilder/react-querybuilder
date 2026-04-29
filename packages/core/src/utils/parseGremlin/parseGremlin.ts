import type {
  DefaultRuleGroupType,
  DefaultRuleGroupTypeAny,
  DefaultRuleGroupTypeIC,
  DefaultRuleType,
} from '../../types';

/**
 * Options for {@link parseGremlin}.
 */
export interface ParseGremlinOptions {
  independentCombinators?: boolean;
}

/**
 * Parses a Gremlin traversal string into a {@link DefaultRuleGroupType}.
 *
 * Accepts a full Gremlin traversal or a chain of `.has()` steps.
 * Pattern steps (`.hasLabel()`, `.out()`, `.in()`, `.both()`, `.as()`) are
 * consumed but discarded — only `.has()` filter predicates are returned.
 *
 * @example
 * ```ts
 * // Full traversal — extracts .has() conditions only
 * parseGremlin("g.V().hasLabel('Person').has('age', gt(30))");
 *
 * // Bare .has() chain
 * parseGremlin(".has('age', gt(30)).has('name', 'Alice')");
 * ```
 */
export function parseGremlin(gremlin: string): DefaultRuleGroupType;
export function parseGremlin(
  gremlin: string,
  options: Omit<ParseGremlinOptions, 'independentCombinators'> & {
    independentCombinators?: false;
  }
): DefaultRuleGroupType;
export function parseGremlin(
  gremlin: string,
  options: Omit<ParseGremlinOptions, 'independentCombinators'> & {
    independentCombinators: true;
  }
): DefaultRuleGroupTypeIC;
export function parseGremlin(
  gremlin: string,
  _options?: ParseGremlinOptions
): DefaultRuleGroupTypeAny {
  const trimmed = gremlin.trim();
  if (!trimmed) return { combinator: 'and', rules: [] };

  const rules: (DefaultRuleType | DefaultRuleGroupType)[] = [];
  const steps = tokenizeGremlinSteps(trimmed);

  for (const step of steps) {
    // Skip pattern steps — only extract filter predicates
    // .hasLabel('Label') — pattern step, skip
    if (step.startsWith('hasLabel(')) continue;
    // .as('alias') — pattern step, skip
    if (step.startsWith('as(')) continue;
    // .out('edge'), .in('edge'), .both('edge') — pattern step, skip
    if (/^(out|in|both)\(/.test(step)) continue;
    // .V(), .E() — traversal source, skip
    if (/^[VE]\(/.test(step)) continue;

    // .hasNot('prop') — null check
    const hasNotMatch = step.match(/^hasNot\('([^']+)'\)$/);
    if (hasNotMatch) {
      rules.push({ field: hasNotMatch[1], operator: 'null', value: null } as DefaultRuleType);
      continue;
    }

    // .has('prop') — property exists
    const hasExistsMatch = step.match(/^has\('([^']+)'\)$/);
    if (hasExistsMatch) {
      rules.push({ field: hasExistsMatch[1], operator: 'notNull', value: null } as DefaultRuleType);
      continue;
    }

    // .has('prop', value) — equality or predicate
    const hasEqMatch = step.match(/^has\('([^']+)',\s*(.+)\)$/);
    if (hasEqMatch) {
      const [, prop, rawValue] = hasEqMatch;
      const parsed = parseGremlinPredicate(prop, rawValue.trim());
      if (parsed) {
        rules.push(parsed);
      }
      continue;
    }
  }

  return { combinator: 'and', rules };
}

/** Tokenizes a Gremlin traversal string into individual step strings. */
const tokenizeGremlinSteps = (gremlin: string): string[] => {
  const steps: string[] = [];

  // Remove leading source (e.g., "g.V().")
  let str = gremlin.trim();
  const sourceMatch = str.match(/^\w+\.V\(\)\./);
  if (sourceMatch) {
    str = str.slice(sourceMatch[0].length);
  } else if (str.startsWith('.')) {
    // Bare step chain starting with a dot
    str = str.slice(1);
  }

  // Split on top-level dots
  let depth = 0;
  let current = '';

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;

    if (ch === '.' && depth === 0) {
      if (current.trim()) steps.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) steps.push(current.trim());

  return steps;
};

/** Parses a Gremlin predicate (the second argument of `.has()`). */
const parseGremlinPredicate = (prop: string, rawValue: string): DefaultRuleType | null => {
  // Predicate functions: gt(), lt(), gte(), lte(), neq(), within(), without(), between(), outside()
  const predicateMatch = rawValue.match(/^(\w+)\((.+)\)$/);
  if (predicateMatch) {
    const [, predName, args] = predicateMatch;
    const parsedArgs = parseGremlinArgs(args);

    switch (predName) {
      case 'gt':
        return { field: prop, operator: '>', value: parsedArgs[0] } as DefaultRuleType;
      case 'lt':
        return { field: prop, operator: '<', value: parsedArgs[0] } as DefaultRuleType;
      case 'gte':
        return { field: prop, operator: '>=', value: parsedArgs[0] } as DefaultRuleType;
      case 'lte':
        return { field: prop, operator: '<=', value: parsedArgs[0] } as DefaultRuleType;
      case 'neq':
        return { field: prop, operator: '!=', value: parsedArgs[0] } as DefaultRuleType;
      case 'within':
        return { field: prop, operator: 'in', value: parsedArgs } as DefaultRuleType;
      case 'without':
        return { field: prop, operator: 'notIn', value: parsedArgs } as DefaultRuleType;
      case 'between':
        return {
          field: prop,
          operator: 'between',
          value: parsedArgs.slice(0, 2),
        } as DefaultRuleType;
      case 'outside':
        return {
          field: prop,
          operator: 'notBetween',
          value: parsedArgs.slice(0, 2),
        } as DefaultRuleType;
      case 'containing':
        return { field: prop, operator: 'contains', value: parsedArgs[0] } as DefaultRuleType;
      case 'notContaining':
        return { field: prop, operator: 'doesNotContain', value: parsedArgs[0] } as DefaultRuleType;
      case 'startingWith':
        return { field: prop, operator: 'beginsWith', value: parsedArgs[0] } as DefaultRuleType;
      case 'notStartingWith':
        return {
          field: prop,
          operator: 'doesNotBeginWith',
          value: parsedArgs[0],
        } as DefaultRuleType;
      case 'endingWith':
        return { field: prop, operator: 'endsWith', value: parsedArgs[0] } as DefaultRuleType;
      case 'notEndingWith':
        return { field: prop, operator: 'doesNotEndWith', value: parsedArgs[0] } as DefaultRuleType;
      default:
        return null;
    }
  }

  // Plain value — equality
  return { field: prop, operator: '=', value: parseGremlinLiteral(rawValue) } as DefaultRuleType;
};

/** Parses a comma-separated argument list. */
const parseGremlinArgs = (args: string): unknown[] => {
  const result: unknown[] = [];
  let depth = 0;
  let current = '';

  for (const ch of args) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      result.push(parseGremlinLiteral(current.trim()));
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) result.push(parseGremlinLiteral(current.trim()));
  return result;
};

/** Parses a Gremlin literal value. */
const parseGremlinLiteral = (raw: string): unknown => {
  if (raw.startsWith("'") && raw.endsWith("'")) {
    return raw.slice(1, -1).replace(/\\'/g, "'");
  }
  if (raw === 'null') return null;
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  const num = Number(raw);
  if (!Number.isNaN(num)) return num;
  return raw;
};
