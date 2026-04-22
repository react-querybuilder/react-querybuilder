import type { RuleType } from '@react-querybuilder/core';
import * as React from 'react';
import { useCallback, useMemo } from 'react';
import type {
  CypherPatternMeta,
  GremlinPatternMeta,
  GraphMetaBase,
  SparqlPatternMeta,
} from './types';
import { isCypherPatternMeta, isGremlinPatternMeta, isSparqlPatternMeta } from './types';

/**
 * Props for the `GraphMetaEditor` component.
 */
export interface GraphMetaEditorProps {
  /** The rule whose `meta` is being edited. */
  rule: RuleType;
  /** Callback when the meta changes. Receives the full updated meta object. */
  handleOnChange: (meta: GraphMetaBase) => void;
  /** Which graph language this editor targets. Determines which fields are shown. */
  graphLang?: 'cypher' | 'gql' | 'sparql' | 'gremlin';
  /** Whether the editor is disabled. */
  disabled?: boolean;
  /** CSS class name for the wrapper element. */
  className?: string;
}

/**
 * A minimal editor component for graph-specific `meta` properties on a rule.
 *
 * Renders input fields for the graph meta based on the target language:
 * - **Cypher/GQL**: nodeAlias, nodeLabel, relType, targetAlias, direction
 * - **SPARQL**: subject, optional flag
 * - **Gremlin**: stepLabel, edgeLabel, direction
 *
 * This component is designed to be used as a custom `controlElement` or within
 * a custom rule component in the query builder.
 */
export const GraphMetaEditor: React.NamedExoticComponent<GraphMetaEditorProps> = React.memo(
  function GraphMetaEditor({
    rule,
    handleOnChange,
    graphLang,
    disabled = false,
    className,
  }: GraphMetaEditorProps): React.JSX.Element {
    const meta = useMemo(() => (rule.meta ?? {}) as GraphMetaBase, [rule.meta]);
    const lang = graphLang ?? meta.graphLang ?? 'cypher';

    const updateMeta = useCallback(
      (key: string, value: unknown) => {
        handleOnChange({ ...meta, [key]: value, graphLang: lang } as GraphMetaBase);
      },
      [meta, handleOnChange, lang]
    );

    const handleTextChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        updateMeta(e.target.name, e.target.value);
      },
      [updateMeta]
    );

    const handleSelectChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateMeta(e.target.name, e.target.value);
      },
      [updateMeta]
    );

    const handleCheckboxChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        updateMeta(e.target.name, e.target.checked);
      },
      [updateMeta]
    );

    if (lang === 'sparql') {
      const sparqlMeta: SparqlPatternMeta = isSparqlPatternMeta(meta)
        ? meta
        : { graphRole: 'pattern', subject: '' };
      return (
        <div className={className ?? 'queryBuilder-graphMeta'} data-testid="graph-meta-editor">
          <label>
            Subject
            <input
              type="text"
              name="subject"
              value={sparqlMeta.subject ?? ''}
              onChange={handleTextChange}
              disabled={disabled}
              placeholder="?variable"
            />
          </label>
          <label>
            <input
              type="checkbox"
              name="optional"
              checked={sparqlMeta.optional ?? false}
              onChange={handleCheckboxChange}
              disabled={disabled}
            />
            Optional
          </label>
        </div>
      );
    }

    if (lang === 'gremlin') {
      const gremlinMeta: GremlinPatternMeta = isGremlinPatternMeta(meta)
        ? meta
        : { graphRole: 'pattern' };
      return (
        <div className={className ?? 'queryBuilder-graphMeta'} data-testid="graph-meta-editor">
          <label>
            Step Label
            <input
              type="text"
              name="stepLabel"
              value={gremlinMeta.stepLabel ?? ''}
              onChange={handleTextChange}
              disabled={disabled}
              placeholder="a"
            />
          </label>
          <label>
            Edge Label
            <input
              type="text"
              name="edgeLabel"
              value={gremlinMeta.edgeLabel ?? ''}
              onChange={handleTextChange}
              disabled={disabled}
              placeholder="knows"
            />
          </label>
          <select
            name="direction"
            value={gremlinMeta.direction ?? 'out'}
            onChange={handleSelectChange}
            disabled={disabled}>
            <option value="out">Out</option>
            <option value="in">In</option>
            <option value="both">Both</option>
          </select>
        </div>
      );
    }

    // Cypher / GQL (default)
    const cypherMeta: CypherPatternMeta = isCypherPatternMeta(meta)
      ? meta
      : { graphRole: 'pattern', nodeAlias: '' };
    return (
      <div className={className ?? 'queryBuilder-graphMeta'} data-testid="graph-meta-editor">
        <label>
          Node Alias
          <input
            type="text"
            name="nodeAlias"
            value={cypherMeta.nodeAlias ?? ''}
            onChange={handleTextChange}
            disabled={disabled}
            placeholder="a"
          />
        </label>
        <label>
          Node Label
          <input
            type="text"
            name="nodeLabel"
            value={cypherMeta.nodeLabel ?? ''}
            onChange={handleTextChange}
            disabled={disabled}
            placeholder="Person"
          />
        </label>
        <label>
          Rel Type
          <input
            type="text"
            name="relType"
            value={cypherMeta.relType ?? ''}
            onChange={handleTextChange}
            disabled={disabled}
            placeholder="KNOWS"
          />
        </label>
        <label>
          Target Alias
          <input
            type="text"
            name="targetAlias"
            value={cypherMeta.targetAlias ?? ''}
            onChange={handleTextChange}
            disabled={disabled}
            placeholder="b"
          />
        </label>
        <select
          name="direction"
          value={cypherMeta.direction ?? 'outgoing'}
          onChange={handleSelectChange}
          disabled={disabled}>
          <option value="outgoing">Outgoing →</option>
          <option value="incoming">← Incoming</option>
          <option value="undirected">— Undirected</option>
        </select>
        <label>
          <input
            type="checkbox"
            name="optional"
            checked={cypherMeta.optional ?? false}
            onChange={handleCheckboxChange}
            disabled={disabled}
          />
          Optional
        </label>
      </div>
    );
  }
);
