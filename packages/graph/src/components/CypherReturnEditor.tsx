import type { RuleGroupTypeAny } from '@react-querybuilder/core';
import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { collectBoundAliases, extractPatternRules } from '../utils';

/**
 * Props for the {@link CypherReturnEditor} component.
 */
export interface CypherReturnEditorProps {
  /** The current query, used to extract available aliases from pattern rules. */
  query: RuleGroupTypeAny;
  /** Whether the RETURN clause is included. Defaults to `true`. */
  includeReturn?: boolean;
  /** Callback when `includeReturn` changes. */
  onIncludeReturnChange: (includeReturn: boolean) => void;
  /** Whether the editor is disabled. */
  disabled?: boolean;
  /** CSS class name for the wrapper element. */
  className?: string;
}

/**
 * Companion component for editing the Cypher/GQL RETURN clause.
 *
 * Displays a toggle for including/excluding the RETURN clause and a
 * read-only list of available node aliases extracted from pattern rules
 * in the current query. Designed to be used alongside a `QueryBuilder`
 * that contains graph pattern rules with Cypher/GQL meta.
 */
export const CypherReturnEditor: React.NamedExoticComponent<CypherReturnEditorProps> = React.memo(
  function CypherReturnEditor({
    query,
    includeReturn = true,
    onIncludeReturnChange,
    disabled = false,
    className,
  }: CypherReturnEditorProps): React.JSX.Element {
    const aliases = useMemo(() => {
      const patternRules = extractPatternRules(query);
      return collectBoundAliases(patternRules);
    }, [query]);

    const handleToggle = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onIncludeReturnChange(e.target.checked);
      },
      [onIncludeReturnChange]
    );

    return (
      <div className={className ?? 'queryBuilder-cypherReturn'} data-testid="cypher-return-editor">
        <label>
          <input
            type="checkbox"
            checked={includeReturn}
            onChange={handleToggle}
            disabled={disabled}
          />
          Include RETURN
        </label>
        {includeReturn && aliases.length > 0 && (
          <div className="queryBuilder-cypherReturn-aliases">
            <span>Returning: </span>
            <code>{aliases.join(', ')}</code>
          </div>
        )}
        {includeReturn && aliases.length === 0 && (
          <div className="queryBuilder-cypherReturn-empty">
            <em>No aliases bound (add pattern rules)</em>
          </div>
        )}
      </div>
    );
  }
);
