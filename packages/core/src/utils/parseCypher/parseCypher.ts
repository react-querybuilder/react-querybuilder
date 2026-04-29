import { createToken, Lexer, CstParser, type CstNode, type IToken } from 'chevrotain';
import type {
  DefaultRuleGroupType,
  DefaultRuleGroupTypeAny,
  DefaultRuleGroupTypeIC,
  DefaultRuleType,
} from '../../types';

// ─── Lexer Tokens ────────────────────────────────────────────────────────────

const WhiteSpace = createToken({ name: 'WhiteSpace', pattern: /\s+/, group: Lexer.SKIPPED });

// Keywords (longer/multi-word first)
const OptionalMatch = createToken({
  name: 'OptionalMatch',
  pattern: /OPTIONAL\s+MATCH/i,
  longer_alt: undefined,
});
const StartsWith = createToken({ name: 'StartsWith', pattern: /STARTS\s+WITH/i });
const EndsWith = createToken({ name: 'EndsWith', pattern: /ENDS\s+WITH/i });
const IsNotNull = createToken({ name: 'IsNotNull', pattern: /IS\s+NOT\s+NULL/i });
const IsNull = createToken({ name: 'IsNull', pattern: /IS\s+NULL/i });
const NotIn = createToken({ name: 'NotIn', pattern: /NOT\s+IN/i });
const Match = createToken({ name: 'Match', pattern: /MATCH/i });
const Where = createToken({ name: 'Where', pattern: /WHERE/i });
const Return = createToken({ name: 'Return', pattern: /RETURN/i });
const And = createToken({ name: 'And', pattern: /AND/i });
const Or = createToken({ name: 'Or', pattern: /OR/i });
const Not = createToken({ name: 'Not', pattern: /NOT/i });
const Contains = createToken({ name: 'Contains', pattern: /CONTAINS/i });
const In = createToken({ name: 'In', pattern: /IN/i });
const NullLit = createToken({ name: 'NullLit', pattern: /null\b/ });
const TrueLit = createToken({ name: 'TrueLit', pattern: /true\b/ });
const FalseLit = createToken({ name: 'FalseLit', pattern: /false\b/ });

// Literals
const StringLiteral = createToken({ name: 'StringLiteral', pattern: /'(?:[^'\\]|\\.)*'/ });
const NumberLiteral = createToken({ name: 'NumberLiteral', pattern: /-?\d+(?:\.\d+)?/ });

// Operators
const LessEqual = createToken({ name: 'LessEqual', pattern: /<=/ });
const GreaterEqual = createToken({ name: 'GreaterEqual', pattern: />=/ });
const NotEqual = createToken({ name: 'NotEqual', pattern: /<>/ });
const Less = createToken({ name: 'Less', pattern: /</ });
const Greater = createToken({ name: 'Greater', pattern: />/ });
const Equal = createToken({ name: 'Equal', pattern: /=/ });

// Punctuation
const LParen = createToken({ name: 'LParen', pattern: /\(/ });
const RParen = createToken({ name: 'RParen', pattern: /\)/ });
const LBracket = createToken({ name: 'LBracket', pattern: /\[/ });
const RBracket = createToken({ name: 'RBracket', pattern: /\]/ });
const Comma = createToken({ name: 'Comma', pattern: /,/ });
const Colon = createToken({ name: 'Colon', pattern: /:/ });
const Dot = createToken({ name: 'Dot', pattern: /\./ });

// Arrow parts for relationship patterns
const DashArrowRight = createToken({ name: 'DashArrowRight', pattern: /->/ });
const ArrowLeftDash = createToken({ name: 'ArrowLeftDash', pattern: /<-/ });
const Dash = createToken({ name: 'Dash', pattern: /-/ });

// Identifier (must come after all keywords)
const Identifier = createToken({ name: 'Identifier', pattern: /[a-zA-Z_]\w*/ });

// Token order matters: longer patterns and keywords before shorter ones
const allTokens = [
  WhiteSpace,
  // Multi-word keywords (must come before single-word)
  OptionalMatch,
  StartsWith,
  EndsWith,
  IsNotNull,
  IsNull,
  NotIn,
  // Single-word keywords
  Match,
  Where,
  Return,
  And,
  Or,
  Not,
  Contains,
  In,
  NullLit,
  TrueLit,
  FalseLit,
  // Literals
  StringLiteral,
  NumberLiteral,
  // Multi-char operators
  LessEqual,
  GreaterEqual,
  NotEqual,
  DashArrowRight,
  ArrowLeftDash,
  // Single-char operators
  Less,
  Greater,
  Equal,
  // Punctuation
  LParen,
  RParen,
  LBracket,
  RBracket,
  Comma,
  Colon,
  Dot,
  Dash,
  // Identifier last
  Identifier,
];

const cypherLexer = new Lexer(allTokens);

// ─── CST Parser ──────────────────────────────────────────────────────────────

class CypherCstParser extends CstParser {
  constructor() {
    super(allTokens, { recoveryEnabled: false });
    this.performSelfAnalysis();
  }

  /** Top-level: sequence of MATCH/OPTIONAL MATCH clauses, optional WHERE, optional RETURN */
  public cypherQuery = this.RULE('cypherQuery', () => {
    this.MANY(() => {
      this.OR([
        { ALT: () => this.SUBRULE(this.optionalMatchClause) },
        { ALT: () => this.SUBRULE(this.matchClause) },
      ]);
    });
    this.OPTION(() => this.SUBRULE(this.whereClause));
    this.OPTION1(() => this.SUBRULE(this.returnClause));
  });

  /** MATCH pattern */
  public matchClause = this.RULE('matchClause', () => {
    this.CONSUME(Match);
    this.SUBRULE(this.pattern);
  });

  /** OPTIONAL MATCH pattern */
  public optionalMatchClause = this.RULE('optionalMatchClause', () => {
    this.CONSUME(OptionalMatch);
    this.SUBRULE(this.pattern);
  });

  /** A graph pattern: node or node-rel-node */
  public pattern = this.RULE('pattern', () => {
    this.SUBRULE(this.nodePattern, { LABEL: 'lhs' });
    this.OPTION(() => {
      this.SUBRULE(this.relPattern);
      this.SUBRULE1(this.nodePattern, { LABEL: 'rhs' });
    });
  });

  /** (alias:Label) or (alias) */
  public nodePattern = this.RULE('nodePattern', () => {
    this.CONSUME(LParen);
    this.CONSUME(Identifier, { LABEL: 'alias' });
    this.OPTION(() => {
      this.CONSUME(Colon);
      this.CONSUME1(Identifier, { LABEL: 'label' });
    });
    this.CONSUME(RParen);
  });

  /** -[:TYPE]-> or <-[:TYPE]- or -[:TYPE]- */
  public relPattern = this.RULE('relPattern', () => {
    this.OR([
      {
        ALT: () => {
          this.CONSUME(ArrowLeftDash, { LABEL: 'leftArrow' });
          this.CONSUME(LBracket);
          this.OPTION(() => {
            this.CONSUME(Colon);
            this.CONSUME(Identifier, { LABEL: 'relType' });
          });
          this.CONSUME(RBracket);
          this.CONSUME(Dash, { LABEL: 'rightDash' });
        },
      },
      {
        ALT: () => {
          this.CONSUME1(Dash, { LABEL: 'leftDash' });
          this.CONSUME1(LBracket);
          this.OPTION1(() => {
            this.CONSUME1(Colon);
            this.CONSUME1(Identifier, { LABEL: 'relType' });
          });
          this.CONSUME1(RBracket);
          this.CONSUME(DashArrowRight, { LABEL: 'rightArrow' });
        },
      },
    ]);
  });

  /** WHERE expression */
  public whereClause = this.RULE('whereClause', () => {
    this.CONSUME(Where);
    this.SUBRULE(this.orExpression);
  });

  /** expression OR expression */
  public orExpression = this.RULE('orExpression', () => {
    this.SUBRULE(this.andExpression, { LABEL: 'lhs' });
    this.MANY(() => {
      this.CONSUME(Or);
      this.SUBRULE1(this.andExpression, { LABEL: 'rhs' });
    });
  });

  /** expression AND expression */
  public andExpression = this.RULE('andExpression', () => {
    this.SUBRULE(this.notExpression, { LABEL: 'lhs' });
    this.MANY(() => {
      this.CONSUME(And);
      this.SUBRULE1(this.notExpression, { LABEL: 'rhs' });
    });
  });

  /** NOT expression */
  public notExpression = this.RULE('notExpression', () => {
    this.OPTION(() => this.CONSUME(Not));
    this.SUBRULE(this.atomicExpression);
  });

  /** Parenthesized group or single condition */
  public atomicExpression = this.RULE('atomicExpression', () => {
    this.OR([
      {
        ALT: () => {
          this.CONSUME(LParen);
          this.SUBRULE(this.orExpression);
          this.CONSUME(RParen);
        },
      },
      { ALT: () => this.SUBRULE(this.condition) },
    ]);
  });

  /** Single condition: field op value */
  public condition = this.RULE('condition', () => {
    this.SUBRULE(this.propertyRef, { LABEL: 'field' });
    this.OR([
      {
        ALT: () => {
          this.CONSUME(Equal);
          this.SUBRULE(this.literal, { LABEL: 'value' });
        },
      },
      {
        ALT: () => {
          this.CONSUME(NotEqual);
          this.SUBRULE1(this.literal, { LABEL: 'value' });
        },
      },
      {
        ALT: () => {
          this.CONSUME(Less);
          this.SUBRULE2(this.literal, { LABEL: 'value' });
        },
      },
      {
        ALT: () => {
          this.CONSUME(Greater);
          this.SUBRULE3(this.literal, { LABEL: 'value' });
        },
      },
      {
        ALT: () => {
          this.CONSUME(LessEqual);
          this.SUBRULE4(this.literal, { LABEL: 'value' });
        },
      },
      {
        ALT: () => {
          this.CONSUME(GreaterEqual);
          this.SUBRULE5(this.literal, { LABEL: 'value' });
        },
      },
      {
        ALT: () => {
          this.CONSUME(Contains);
          this.SUBRULE6(this.literal, { LABEL: 'value' });
        },
      },
      {
        ALT: () => {
          this.CONSUME(StartsWith);
          this.SUBRULE7(this.literal, { LABEL: 'value' });
        },
      },
      {
        ALT: () => {
          this.CONSUME(EndsWith);
          this.SUBRULE8(this.literal, { LABEL: 'value' });
        },
      },
      { ALT: () => this.CONSUME(IsNotNull) },
      { ALT: () => this.CONSUME(IsNull) },
      {
        ALT: () => {
          this.CONSUME(In);
          this.SUBRULE(this.listLiteral, { LABEL: 'list' });
        },
      },
      {
        ALT: () => {
          this.CONSUME(NotIn);
          this.SUBRULE1(this.listLiteral, { LABEL: 'list' });
        },
      },
    ]);
  });

  /** Dotted property reference: alias.prop or just identifier */
  public propertyRef = this.RULE('propertyRef', () => {
    this.CONSUME(Identifier, { LABEL: 'head' });
    this.MANY(() => {
      this.CONSUME(Dot);
      this.CONSUME1(Identifier, { LABEL: 'tail' });
    });
  });

  /** A literal value */
  public literal = this.RULE('literal', () => {
    this.OR([
      { ALT: () => this.CONSUME(StringLiteral) },
      { ALT: () => this.CONSUME(NumberLiteral) },
      { ALT: () => this.CONSUME(NullLit) },
      { ALT: () => this.CONSUME(TrueLit) },
      { ALT: () => this.CONSUME(FalseLit) },
      { ALT: () => this.CONSUME(Identifier) },
    ]);
  });

  /** [val, val, ...] */
  public listLiteral = this.RULE('listLiteral', () => {
    this.CONSUME(LBracket);
    this.OPTION(() => {
      this.SUBRULE(this.literal, { LABEL: 'items' });
      this.MANY(() => {
        this.CONSUME(Comma);
        this.SUBRULE1(this.literal, { LABEL: 'items' });
      });
    });
    this.CONSUME(RBracket);
  });

  /** RETURN clause (consumed but not transformed) */
  public returnClause = this.RULE('returnClause', () => {
    this.CONSUME(Return);
    this.MANY(() => {
      this.OR([
        { ALT: () => this.CONSUME(Identifier) },
        { ALT: () => this.CONSUME(Comma) },
        { ALT: () => this.CONSUME(Dot) },
      ]);
    });
  });
}

const parserInstance = new CypherCstParser();

// ─── CST Visitor (CST → RuleGroupType) ──────────────────────────────────────

/** Resolves a literal token to a JS value. */
const tokenToValue = (token: IToken): unknown => {
  const img = token.image;
  switch (token.tokenType) {
    case StringLiteral:
      return img.slice(1, -1).replace(/\\'/g, "'");
    case NumberLiteral:
      return Number(img);
    case NullLit:
      return null;
    case TrueLit:
      return true;
    case FalseLit:
      return false;
    default:
      return img;
  }
};

/** Extracts a literal value from a CST 'literal' node. */
const extractLiteral = (literalNode: CstNode): unknown => {
  const children = literalNode.children;
  const token =
    (children.StringLiteral as IToken[])?.[0] ??
    (children.NumberLiteral as IToken[])?.[0] ??
    (children.NullLit as IToken[])?.[0] ??
    (children.TrueLit as IToken[])?.[0] ??
    (children.FalseLit as IToken[])?.[0] ??
    (children.Identifier as IToken[])?.[0];
  return token ? tokenToValue(token) : '';
};

/** Builds a dotted property reference string from a propertyRef CST node. */
const extractPropertyRef = (node: CstNode): string => {
  const head = (node.children.head as IToken[])[0].image;
  const tails = (node.children.tail as IToken[] | undefined) ?? [];
  if (tails.length === 0) return head;
  return head + '.' + tails.map(t => t.image).join('.');
};

/** Extracts list items from a listLiteral CST node. */
const extractList = (node: CstNode): unknown[] => {
  const items = (node.children.items as CstNode[] | undefined) ?? [];
  return items.map(extractLiteral);
};

type RuleOrGroup = DefaultRuleType | DefaultRuleGroupType;

/** Visits an orExpression CST node. */
const visitOrExpression = (node: CstNode): RuleOrGroup[] => {
  const lhsNodes = node.children.lhs as CstNode[];
  const rhsNodes = (node.children.rhs as CstNode[] | undefined) ?? [];

  if (rhsNodes.length === 0) {
    return visitAndExpression(lhsNodes[0]);
  }

  const allParts = [lhsNodes[0], ...rhsNodes];
  const subRules: RuleOrGroup[] = [];
  for (const part of allParts) {
    const partRules = visitAndExpression(part);
    if (partRules.length === 1) {
      subRules.push(partRules[0]);
    } else {
      subRules.push({ combinator: 'and', rules: partRules });
    }
  }
  return [{ combinator: 'or', rules: subRules }];
};

/** Visits an andExpression CST node. */
const visitAndExpression = (node: CstNode): RuleOrGroup[] => {
  const lhsNodes = node.children.lhs as CstNode[];
  const rhsNodes = (node.children.rhs as CstNode[] | undefined) ?? [];
  const all = [lhsNodes[0], ...rhsNodes];
  const rules: RuleOrGroup[] = [];
  for (const item of all) {
    rules.push(...visitNotExpression(item));
  }
  return rules;
};

/** Visits a notExpression CST node. */
const visitNotExpression = (node: CstNode): RuleOrGroup[] => {
  const hasNot = !!(node.children.Not as IToken[] | undefined)?.length;
  const atomicRules = visitAtomicExpression((node.children.atomicExpression as CstNode[])[0]);

  if (!hasNot) return atomicRules;

  return [{ combinator: 'and', not: true, rules: atomicRules }];
};

/** Visits an atomicExpression CST node. */
const visitAtomicExpression = (node: CstNode): RuleOrGroup[] => {
  if (node.children.orExpression) {
    return visitOrExpression((node.children.orExpression as CstNode[])[0]);
  }
  if (node.children.condition) {
    return [visitCondition((node.children.condition as CstNode[])[0])];
  }
  return [];
};

/** Visits a condition CST node and returns a DefaultRuleType (no meta). */
const visitCondition = (node: CstNode): DefaultRuleType => {
  const field = extractPropertyRef((node.children.field as CstNode[])[0]);

  if (node.children.IsNull) {
    return { field, operator: 'null', value: null } as DefaultRuleType;
  }
  if (node.children.IsNotNull) {
    return { field, operator: 'notNull', value: null } as DefaultRuleType;
  }

  if (node.children.In) {
    const list = extractList((node.children.list as CstNode[])[0]);
    return { field, operator: 'in', value: list } as DefaultRuleType;
  }
  if (node.children.NotIn) {
    const list = extractList((node.children.list as CstNode[])[0]);
    return { field, operator: 'notIn', value: list } as DefaultRuleType;
  }

  const valueNode = (node.children.value as CstNode[] | undefined)?.[0];
  const value = valueNode ? extractLiteral(valueNode) : null;

  if (node.children.Equal) return { field, operator: '=', value } as DefaultRuleType;
  if (node.children.NotEqual) return { field, operator: '!=', value } as DefaultRuleType;
  if (node.children.Less) return { field, operator: '<', value } as DefaultRuleType;
  if (node.children.Greater) return { field, operator: '>', value } as DefaultRuleType;
  if (node.children.LessEqual) return { field, operator: '<=', value } as DefaultRuleType;
  if (node.children.GreaterEqual) return { field, operator: '>=', value } as DefaultRuleType;
  if (node.children.Contains) return { field, operator: 'contains', value } as DefaultRuleType;
  if (node.children.StartsWith) return { field, operator: 'beginsWith', value } as DefaultRuleType;
  if (node.children.EndsWith) return { field, operator: 'endsWith', value } as DefaultRuleType;

  return { field, operator: '=', value } as DefaultRuleType;
};

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Options for {@link parseCypher}.
 */
export interface ParseCypherOptions {
  independentCombinators?: boolean;
}

/**
 * Parses a Cypher query string into a {@link DefaultRuleGroupType}.
 *
 * Accepts a full Cypher query, a `WHERE` clause, or a bare boolean expression.
 * MATCH and RETURN clauses are consumed but discarded — only WHERE conditions
 * are returned.
 *
 * @example
 * ```ts
 * // Full query — extracts WHERE conditions only
 * parseCypher('MATCH (a:Person) WHERE a.age > 30 RETURN a');
 *
 * // WHERE clause
 * parseCypher('WHERE a.age > 30 AND a.name CONTAINS "Alice"');
 *
 * // Bare expression
 * parseCypher('a.age > 30 AND a.name CONTAINS "Alice"');
 * ```
 */
export function parseCypher(cypher: string): DefaultRuleGroupType;
export function parseCypher(
  cypher: string,
  options: Omit<ParseCypherOptions, 'independentCombinators'> & {
    independentCombinators?: false;
  }
): DefaultRuleGroupType;
export function parseCypher(
  cypher: string,
  options: Omit<ParseCypherOptions, 'independentCombinators'> & {
    independentCombinators: true;
  }
): DefaultRuleGroupTypeIC;
export function parseCypher(
  cypher: string,
  _options?: ParseCypherOptions
): DefaultRuleGroupTypeAny {
  const trimmed = cypher.trim();
  if (!trimmed) return { combinator: 'and', rules: [] };

  // Auto-detect input shape (like parseSQL)
  let input = trimmed;
  if (!/^\s*match\b/i.test(input) && !/^\s*where\b/i.test(input)) {
    // Bare expression — prepend WHERE so the parser can handle it
    input = `WHERE ${input}`;
  }

  const lexResult = cypherLexer.tokenize(input);
  if (lexResult.errors.length > 0) {
    return { combinator: 'and', rules: [] };
  }

  parserInstance.input = lexResult.tokens;
  const cst = parserInstance.cypherQuery();

  if (parserInstance.errors.length > 0) {
    return { combinator: 'and', rules: [] };
  }

  const rules: RuleOrGroup[] = [];

  // Only process WHERE clause — skip MATCH/RETURN
  const whereClauses = (cst.children.whereClause as CstNode[] | undefined) ?? [];
  if (whereClauses.length > 0) {
    const whereNode = whereClauses[0];
    const orExpr = (whereNode.children.orExpression as CstNode[])[0];
    const whereRules = visitOrExpression(orExpr);

    // If the top-level OR produced a single AND group without NOT, flatten it
    if (
      whereRules.length === 1 &&
      'combinator' in whereRules[0] &&
      whereRules[0].combinator === 'and' &&
      !('not' in whereRules[0] && whereRules[0].not)
    ) {
      rules.push(...whereRules[0].rules);
    } else {
      rules.push(...whereRules);
    }
  }

  return { combinator: 'and', rules };
}

/**
 * Parses a GQL query string. GQL is ~95% compatible with Cypher;
 * the parser handles the same syntax.
 */
export function parseGQL(gql: string): DefaultRuleGroupType;
export function parseGQL(
  gql: string,
  options: Omit<ParseCypherOptions, 'independentCombinators'> & {
    independentCombinators?: false;
  }
): DefaultRuleGroupType;
export function parseGQL(
  gql: string,
  options: Omit<ParseCypherOptions, 'independentCombinators'> & {
    independentCombinators: true;
  }
): DefaultRuleGroupTypeIC;
export function parseGQL(gql: string, options?: ParseCypherOptions): DefaultRuleGroupTypeAny {
  // Call the implementation signature directly (not the overloads)
  return (parseCypher as (s: string, o?: ParseCypherOptions) => DefaultRuleGroupTypeAny)(
    gql,
    options
  );
}
