import type { RuleGroupType, RuleType } from '@react-querybuilder/core';
import type { CypherPatternMeta, CypherFilterMeta } from '../../types';

/**
 * Parses a Cypher query string into a `RuleGroupType` with graph `meta` on rules.
 *
 * Handles:
 * - `MATCH (alias:Label)` — node patterns
 * - `MATCH (a:Label)-[:REL]->(b:Label)` — relationship patterns
 * - `OPTIONAL MATCH ...` — optional patterns
 * - `WHERE` clause — boolean filter conditions with standard operators
 *
 * This is a basic recursive descent parser covering common Cypher patterns.
 * It does not handle the full Cypher grammar.
 */
export const parseCypher = (cypher: string): RuleGroupType => {
  const trimmed = cypher.trim();
  const rules: RuleGroupType['rules'] = [];

  // Extract MATCH patterns
  const matchRegex =
    /(OPTIONAL\s+)?MATCH\s+(.+?)(?=\s+(?:OPTIONAL\s+)?MATCH\s|\s+WHERE\s|\s+RETURN\s|$)/gi;
  let matchResult: RegExpExecArray | null;

  while ((matchResult = matchRegex.exec(trimmed)) !== null) {
    const isOptional = !!matchResult[1];
    const patternStr = matchResult[2].trim();
    const patternRules = parseMatchPattern(patternStr, isOptional);
    rules.push(...patternRules);
  }

  // Extract WHERE clause
  const whereMatch = trimmed.match(/WHERE\s+([\s\S]+?)(?=\s+RETURN\s|$)/i);
  if (whereMatch) {
    const whereRules = parseWhereClause(whereMatch[1].trim());
    rules.push(...whereRules);
  }

  return { combinator: 'and', rules };
};

/**
 * Parses a GQL query string. GQL is ~95% compatible with Cypher;
 * the parser handles the same syntax with minor adjustments.
 */
export const parseGQL = (gql: string): RuleGroupType => {
  // GQL uses the same pattern matching syntax as Cypher for reads
  return parseCypher(gql);
};

/** Parses a MATCH pattern string into pattern rules with Cypher meta. */
const parseMatchPattern = (pattern: string, optional: boolean): RuleType[] => {
  const rules: RuleType[] = [];

  // Match relationship patterns: (a:Label)-[:REL]->(b:Label) or (a:Label)<-[:REL]-(b:Label)
  const relRegex = /\((\w+)(?::(\w+))?\)\s*(<)?-\[(?::(\w+))?\]-(>)?\s*\((\w+)(?::(\w+))?\)/g;
  let relMatch: RegExpExecArray | null;

  while ((relMatch = relRegex.exec(pattern)) !== null) {
    const [, sourceAlias, sourceLabel, incoming, relType, , targetAlias, targetLabel] = relMatch;
    const direction = incoming ? 'incoming' : 'outgoing';

    const meta: CypherPatternMeta = {
      graphRole: 'pattern',
      graphLang: 'cypher',
      nodeAlias: sourceAlias,
      ...(sourceLabel && { nodeLabel: sourceLabel }),
      ...(relType && { relType }),
      targetAlias,
      ...(targetLabel && { targetLabel }),
      direction,
      optional,
    };

    rules.push({
      field: relType ?? '_rel',
      operator: 'binds',
      value: targetAlias,
      meta,
    });
    return rules;
  }

  // Match simple node patterns: (a:Label)
  const nodeRegex = /\((\w+)(?::(\w+))?\)/g;
  let nodeMatch: RegExpExecArray | null;

  while ((nodeMatch = nodeRegex.exec(pattern)) !== null) {
    const [, alias, label] = nodeMatch;
    if (label) {
      const meta: CypherPatternMeta = {
        graphRole: 'pattern',
        graphLang: 'cypher',
        nodeAlias: alias,
        nodeLabel: label,
        optional,
      };
      rules.push({
        field: '_type',
        operator: 'is',
        value: label,
        meta,
      });
    }
  }

  return rules;
};

/** Parses a WHERE clause string into filter rules. */
const parseWhereClause = (where: string): (RuleType | RuleGroupType)[] => {
  const tokens = tokenizeWhere(where);
  return parseExpression(tokens, 0).rules;
};

interface ParseResult {
  rules: (RuleType | RuleGroupType)[];
  pos: number;
}

/** Tokenizes a WHERE clause string. */
const tokenizeWhere = (where: string): string[] => {
  const tokens: string[] = [];
  let i = 0;

  while (i < where.length) {
    // Skip whitespace
    if (/\s/.test(where[i])) {
      i++;
      continue;
    }

    // Parentheses
    if (where[i] === '(' || where[i] === ')') {
      tokens.push(where[i]);
      i++;
      continue;
    }

    // String literals
    if (where[i] === "'") {
      let j = i + 1;
      while (j < where.length && where[j] !== "'") {
        if (where[j] === '\\') j++;
        j++;
      }
      tokens.push(where.slice(i, j + 1));
      i = j + 1;
      continue;
    }

    // Multi-word operators and keywords
    const rest = where.slice(i);
    const multiWord = rest.match(
      /^(STARTS\s+WITH|ENDS\s+WITH|IS\s+NOT\s+NULL|IS\s+NULL|NOT\s+IN)\b/i
    );
    if (multiWord) {
      tokens.push(multiWord[1].replace(/\s+/g, ' ').toUpperCase());
      i += multiWord[1].length;
      continue;
    }

    // Comparison operators
    const compOp = rest.match(/^(<>|<=|>=|<|>|=)/);
    if (compOp) {
      tokens.push(compOp[1]);
      i += compOp[1].length;
      continue;
    }

    // Words (identifiers, keywords, etc.)
    const word = rest.match(/^[\w.]+/);
    if (word) {
      tokens.push(word[0]);
      i += word[0].length;
      continue;
    }

    // List brackets
    if (where[i] === '[' || where[i] === ']') {
      tokens.push(where[i]);
      i++;
      continue;
    }

    // Commas
    if (where[i] === ',') {
      tokens.push(',');
      i++;
      continue;
    }

    i++;
  }

  return tokens;
};

/** Parses a token stream into rules, respecting AND/OR precedence and grouping. */
const parseExpression = (tokens: string[], pos: number): ParseResult & { combinator: string } => {
  const items: (RuleType | RuleGroupType)[] = [];
  let combinator = 'and';
  let i = pos;

  while (i < tokens.length) {
    const token = tokens[i];
    const tokenUpper = token.toUpperCase();

    if (tokenUpper === 'AND' || tokenUpper === 'OR') {
      combinator = tokenUpper.toLowerCase();
      i++;
      continue;
    }

    if (tokenUpper === 'NOT') {
      // Look ahead for grouped expression
      if (tokens[i + 1] === '(') {
        const sub = parseExpression(tokens, i + 2);
        items.push({
          combinator: sub.combinator,
          not: true,
          rules: sub.rules,
        });
        i = sub.pos + 1; // skip closing paren
        continue;
      }
      // NOT applied to next condition (e.g., NOT a.name CONTAINS 'x')
      i++;
      const condition = parseSingleCondition(tokens, i);
      if (condition) {
        // Wrap in negated group
        items.push({
          combinator: 'and',
          not: true,
          rules: [condition.rule],
        });
        i = condition.pos;
      }
      continue;
    }

    if (token === '(') {
      const sub = parseExpression(tokens, i + 1);
      if (sub.rules.length === 1) {
        items.push(sub.rules[0]);
      } else {
        items.push({
          combinator: sub.combinator,
          rules: sub.rules,
        });
      }
      i = sub.pos + 1; // skip closing paren
      continue;
    }

    if (token === ')') {
      return { rules: items, pos: i, combinator };
    }

    // Try to parse a single condition
    const condition = parseSingleCondition(tokens, i);
    if (condition) {
      items.push(condition.rule);
      i = condition.pos;
    } else {
      i++;
    }
  }

  return { rules: items, pos: i, combinator };
};

/** Parses a single condition from the token stream. */
const parseSingleCondition = (
  tokens: string[],
  pos: number
): { rule: RuleType; pos: number } | null => {
  if (pos >= tokens.length) return null;

  const field = tokens[pos];
  if (!field || field === ')' || field.toUpperCase() === 'AND' || field.toUpperCase() === 'OR') {
    return null;
  }

  const opToken = tokens[pos + 1]?.toUpperCase();
  if (!opToken) return null;

  const meta: CypherFilterMeta = { graphRole: 'filter', graphLang: 'cypher' };

  switch (opToken) {
    case '=':
      return {
        rule: { field, operator: '=', value: parseLiteral(tokens[pos + 2]), meta },
        pos: pos + 3,
      };
    case '<>':
      return {
        rule: { field, operator: '!=', value: parseLiteral(tokens[pos + 2]), meta },
        pos: pos + 3,
      };
    case '<':
      return {
        rule: { field, operator: '<', value: parseLiteral(tokens[pos + 2]), meta },
        pos: pos + 3,
      };
    case '>':
      return {
        rule: { field, operator: '>', value: parseLiteral(tokens[pos + 2]), meta },
        pos: pos + 3,
      };
    case '<=':
      return {
        rule: { field, operator: '<=', value: parseLiteral(tokens[pos + 2]), meta },
        pos: pos + 3,
      };
    case '>=':
      return {
        rule: { field, operator: '>=', value: parseLiteral(tokens[pos + 2]), meta },
        pos: pos + 3,
      };
    case 'CONTAINS':
      return {
        rule: { field, operator: 'contains', value: parseLiteral(tokens[pos + 2]), meta },
        pos: pos + 3,
      };
    case 'STARTS WITH':
      return {
        rule: { field, operator: 'beginsWith', value: parseLiteral(tokens[pos + 2]), meta },
        pos: pos + 3,
      };
    case 'ENDS WITH':
      return {
        rule: { field, operator: 'endsWith', value: parseLiteral(tokens[pos + 2]), meta },
        pos: pos + 3,
      };
    case 'IS NULL':
      return { rule: { field, operator: 'null', value: null, meta }, pos: pos + 2 };
    case 'IS NOT NULL':
      return { rule: { field, operator: 'notNull', value: null, meta }, pos: pos + 2 };
    case 'IN':
      return parseInList(field, false, tokens, pos + 2, meta);
    case 'NOT IN':
      return parseInList(field, true, tokens, pos + 2, meta);
    default:
      return null;
  }
};

/** Parses an IN [list] expression. */
const parseInList = (
  field: string,
  negate: boolean,
  tokens: string[],
  pos: number,
  meta: CypherFilterMeta
): { rule: RuleType; pos: number } | null => {
  if (tokens[pos] !== '[') return null;
  const items: unknown[] = [];
  let i = pos + 1;
  while (i < tokens.length && tokens[i] !== ']') {
    if (tokens[i] === ',') {
      i++;
      continue;
    }
    items.push(parseLiteral(tokens[i]));
    i++;
  }
  return {
    rule: { field, operator: negate ? 'notIn' : 'in', value: items, meta },
    pos: i + 1,
  };
};

/** Parses a literal value from a token. */
const parseLiteral = (token: string): unknown => {
  if (!token) return '';
  if (token.startsWith("'") && token.endsWith("'")) {
    return token.slice(1, -1).replace(/\\'/g, "'");
  }
  if (token === 'null') return null;
  if (token === 'true') return true;
  if (token === 'false') return false;
  const num = Number(token);
  if (!Number.isNaN(num)) return num;
  return token;
};
