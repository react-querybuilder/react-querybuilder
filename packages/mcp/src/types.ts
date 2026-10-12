/** Docs page metadata. */
export interface DocsPage {
  /** Path under `/docs/`, e.g. `utils/export`. */
  slug: string;
  title: string;
  description: string;
  url: string;
}

/** Docs chunk: page preamble (empty `heading`) or one `##` section. */
export interface DocsSection {
  /** Index into {@link DocsIndex.pages}. */
  page: number;
  heading: string;
  anchor: string;
  /** Cleaned markdown. */
  text: string;
}

/** Build-time docs/types snapshot (`src/generated/docs-index.json`). */
export interface DocsIndex {
  /** RQB version the docs were built from. */
  version: string;
  pages: DocsPage[];
  sections: DocsSection[];
  /** Type name → declaration source (with JSDoc). */
  types: Record<string, string>;
}

/** Tool handler result (subset of MCP `CallToolResult`). Type alias (not interface) so it's
 * assignable to the SDK's index-signature result type. */
export type ToolResult = {
  content: { type: 'text'; text: string }[];
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
};
