import type { FormatQueryOptions, RuleType } from '@react-querybuilder/core';

// ─── Graph Role Discriminator ───────────────────────────────────────────────

/** Discriminates between pattern-defining rules and filter-condition rules. */
export type GraphRole = 'pattern' | 'filter';

/** Supported graph query languages. */
export type GraphLang = 'cypher' | 'gql' | 'sparql' | 'gremlin';

// ─── Base Meta ──────────────────────────────────────────────────────────────

/** Base metadata shared by all graph language extensions. */
export interface GraphMetaBase {
  /** Discriminates between pattern-defining rules and filter-condition rules. */
  graphRole: GraphRole;
  /** Which graph language this rule targets. */
  graphLang?: GraphLang;
  [key: string]: unknown;
}

// ─── Cypher / GQL Meta ─────────────────────────────────────────────────────

/** Metadata for a Cypher/GQL graph pattern rule. */
export interface CypherPatternMeta extends GraphMetaBase {
  graphRole: 'pattern';
  /** Node alias in MATCH clause, e.g. `"a"` for `(a:Person)`. */
  nodeAlias: string;
  /** Node label, e.g. `"Person"`. */
  nodeLabel?: string;
  /** Relationship type, e.g. `"KNOWS"`. */
  relType?: string;
  /** Target node alias for relationship patterns. */
  targetAlias?: string;
  /** Target node label. */
  targetLabel?: string;
  /** Relationship direction. */
  direction?: 'incoming' | 'outgoing' | 'undirected';
  /** Whether this pattern is an OPTIONAL MATCH. */
  optional?: boolean;
}

/** Metadata for a Cypher/GQL filter rule. */
export interface CypherFilterMeta extends GraphMetaBase {
  graphRole: 'filter';
}

/** Union of all Cypher/GQL meta types. */
export type CypherMeta = CypherPatternMeta | CypherFilterMeta;

// ─── SPARQL Meta ────────────────────────────────────────────────────────────

/** Metadata for a SPARQL triple pattern rule. */
export interface SparqlPatternMeta extends GraphMetaBase {
  graphRole: 'pattern';
  /** Subject variable or URI, e.g. `"?person"`. */
  subject: string;
  /** Whether to wrap in `OPTIONAL { }`. */
  optional?: boolean;
}

/** Metadata for a SPARQL filter rule. */
export interface SparqlFilterMeta extends GraphMetaBase {
  graphRole: 'filter';
}

/** Union of all SPARQL meta types. */
export type SparqlMeta = SparqlPatternMeta | SparqlFilterMeta;

// ─── Gremlin Meta ───────────────────────────────────────────────────────────

/** Metadata for a Gremlin traversal step rule. */
export interface GremlinPatternMeta extends GraphMetaBase {
  graphRole: 'pattern';
  /** Step label, e.g. `"a"` for `.as('a')`. */
  stepLabel?: string;
  /** Edge label for traversal steps. */
  edgeLabel?: string;
  /** Traversal direction. */
  direction?: 'out' | 'in' | 'both';
}

/** Metadata for a Gremlin filter (`.has()`) rule. */
export interface GremlinFilterMeta extends GraphMetaBase {
  graphRole: 'filter';
}

/** Union of all Gremlin meta types. */
export type GremlinMeta = GremlinPatternMeta | GremlinFilterMeta;

// ─── Combined Meta Type ─────────────────────────────────────────────────────

/** Union of all graph meta types. */
export type GraphMeta = CypherMeta | SparqlMeta | GremlinMeta;

// ─── Type Guards ────────────────────────────────────────────────────────────

/** Checks whether a meta object represents a graph pattern rule. */
export const isPatternMeta = (
  meta?: Record<string, unknown>
): meta is GraphMetaBase & { graphRole: 'pattern' } =>
  meta != null && (meta as GraphMetaBase).graphRole === 'pattern';

/** Checks whether a meta object represents a graph filter rule. */
export const isFilterMeta = (
  meta?: Record<string, unknown>
): meta is GraphMetaBase & { graphRole: 'filter' } =>
  meta != null && (meta as GraphMetaBase).graphRole === 'filter';

/** Checks whether a meta object is a Cypher/GQL pattern. */
export const isCypherPatternMeta = (meta?: Record<string, unknown>): meta is CypherPatternMeta =>
  isPatternMeta(meta) && 'nodeAlias' in meta;

/** Checks whether a meta object is a SPARQL pattern. */
export const isSparqlPatternMeta = (meta?: Record<string, unknown>): meta is SparqlPatternMeta =>
  isPatternMeta(meta) && 'subject' in meta;

/** Checks whether a meta object is a Gremlin pattern. */
export const isGremlinPatternMeta = (meta?: Record<string, unknown>): meta is GremlinPatternMeta =>
  isPatternMeta(meta) &&
  ('stepLabel' in meta ||
    'edgeLabel' in meta ||
    (meta as GremlinPatternMeta).direction !== undefined);

/** Checks whether a rule has graph `meta`. */
export const hasGraphMeta = (rule: RuleType): rule is RuleType & { meta: GraphMeta } =>
  rule.meta != null && typeof (rule.meta as GraphMetaBase).graphRole === 'string';

// ─── Formatter Options ──────────────────────────────────────────────────────

/** Options for Cypher/GQL formatters. */
export interface CypherFormatOptions {
  /** GQL mode uses `INSERT` instead of `CREATE` and other minor syntax differences. */
  dialect?: 'cypher' | 'gql';
  /** Prefix for parameterized queries, e.g. `"$"`. */
  paramPrefix?: string;
  /** Whether to include `RETURN` clause with all bound variables. */
  includeReturn?: boolean;
  /** Indentation string (default: two spaces). */
  indent?: string;
}

/** Options for SPARQL formatters. */
export interface SparqlFormatOptions {
  /** PREFIX declarations to include at the top of the query. */
  prefixes?: Record<string, string>;
  /** Variables to SELECT (defaults to all bound variables). */
  selectVariables?: string[];
  /** Indentation string (default: two spaces). */
  indent?: string;
}

/** Options for Gremlin formatters. */
export interface GremlinFormatOptions {
  /** The graph traversal source name (default: `"g"`). */
  traversalSource?: string;
  /** Indentation string (default: two spaces). */
  indent?: string;
}

/** Supported graph query format identifiers for {@link formatGraphQuery}. */
export type GraphQueryFormat = GraphLang;

/**
 * Options for the unified {@link formatGraphQuery} function. Combines
 * a `format` selector, format-specific settings, and options from the
 * core `FormatQueryOptions` that are applicable to graph query languages.
 */
export interface FormatGraphQueryOptions extends Pick<
  FormatQueryOptions,
  | 'paramPrefix'
  | 'parseNumbers'
  | 'fields'
  | 'validator'
  | 'fallbackExpression'
  | 'placeholderFieldName'
  | 'placeholderOperatorName'
  | 'preserveValueOrder'
> {
  /** The graph query language to target. */
  format: GraphQueryFormat;

  // ── Cypher / GQL options ──
  /** Whether to include a `RETURN` clause (Cypher/GQL only). */
  includeReturn?: boolean;

  // ── SPARQL options ──
  /** PREFIX declarations to include at the top of the query (SPARQL only). */
  prefixes?: Record<string, string>;
  /** Variables to SELECT (SPARQL only; defaults to all bound variables). */
  selectVariables?: string[];

  // ── Gremlin options ──
  /** The graph traversal source name (Gremlin only; default: `"g"`). */
  traversalSource?: string;

  // ── Common options ──
  /**
   * Indentation string (default: two spaces).
   *
   * @default '  '
   */
  indent?: string;
}
