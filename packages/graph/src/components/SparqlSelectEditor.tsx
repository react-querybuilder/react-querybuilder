import type { RuleGroupTypeAny } from '@react-querybuilder/core';
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { collectSparqlVariables, extractPatternRules } from '../utils';

/**
 * Props for the {@link SparqlSelectEditor} component.
 */
export interface SparqlSelectEditorProps {
  /** The current query, used to extract available variables from pattern rules. */
  query: RuleGroupTypeAny;
  /**
   * Variables to include in the SELECT clause. When `undefined`, the formatter
   * auto-detects variables from pattern rules.
   */
  selectVariables?: string[];
  /** Callback when the selected variables change. Pass `undefined` to revert to auto-detect. */
  onSelectVariablesChange: (variables: string[] | undefined) => void;
  /** PREFIX declarations as a `prefix → URI` map. */
  prefixes?: Record<string, string>;
  /** Callback when prefix declarations change. */
  onPrefixesChange: (prefixes: Record<string, string>) => void;
  /** Whether the editor is disabled. */
  disabled?: boolean;
  /** CSS class name for the wrapper element. */
  className?: string;
}

/**
 * Companion component for editing the SPARQL SELECT clause and PREFIX declarations.
 *
 * Displays detected variables from pattern rules with checkboxes to include/exclude
 * them from the SELECT clause, and a prefix editor for namespace declarations.
 * Designed to be used alongside a `QueryBuilder` that contains graph pattern rules
 * with SPARQL meta.
 */
export const SparqlSelectEditor: React.NamedExoticComponent<SparqlSelectEditorProps> = React.memo(
  function SparqlSelectEditor({
    query,
    selectVariables,
    onSelectVariablesChange,
    prefixes = {},
    onPrefixesChange,
    disabled = false,
    className,
  }: SparqlSelectEditorProps): React.JSX.Element {
    const detectedVars = useMemo(() => {
      const patternRules = extractPatternRules(query);
      return collectSparqlVariables(patternRules);
    }, [query]);

    const activeVars = selectVariables ?? detectedVars;

    const handleVarToggle = useCallback(
      (variable: string, checked: boolean) => {
        if (checked) {
          onSelectVariablesChange([...activeVars, variable]);
        } else {
          const filtered = activeVars.filter(v => v !== variable);
          onSelectVariablesChange(filtered.length > 0 ? filtered : undefined);
        }
      },
      [activeVars, onSelectVariablesChange]
    );

    const handleResetToAuto = useCallback(() => {
      onSelectVariablesChange(undefined);
    }, [onSelectVariablesChange]);

    // Prefix editor state
    const [newPrefix, setNewPrefix] = useState('');
    const [newUri, setNewUri] = useState('');

    const handleAddPrefix = useCallback(() => {
      if (newPrefix && newUri) {
        onPrefixesChange({ ...prefixes, [newPrefix]: newUri });
        setNewPrefix('');
        setNewUri('');
      }
    }, [newPrefix, newUri, prefixes, onPrefixesChange]);

    const handleRemovePrefix = useCallback(
      (prefix: string) => {
        const { [prefix]: _, ...rest } = prefixes;
        onPrefixesChange(rest);
      },
      [prefixes, onPrefixesChange]
    );

    return (
      <div className={className ?? 'queryBuilder-sparqlSelect'} data-testid="sparql-select-editor">
        <fieldset disabled={disabled}>
          <legend>SELECT Variables</legend>
          {detectedVars.length > 0 ? (
            <div className="queryBuilder-sparqlSelect-vars">
              {detectedVars.map(v => (
                <label key={v}>
                  <input
                    type="checkbox"
                    checked={activeVars.includes(v)}
                    onChange={e => handleVarToggle(v, e.target.checked)}
                  />
                  {v}
                </label>
              ))}
            </div>
          ) : (
            <em>No variables detected (add pattern rules)</em>
          )}
          {selectVariables && (
            <button type="button" onClick={handleResetToAuto}>
              Reset to auto-detect
            </button>
          )}
        </fieldset>
        <fieldset disabled={disabled}>
          <legend>PREFIX Declarations</legend>
          {Object.entries(prefixes).length > 0 && (
            <ul className="queryBuilder-sparqlSelect-prefixes">
              {Object.entries(prefixes).map(([prefix, uri]) => (
                <li key={prefix}>
                  <code>
                    {prefix}: &lt;{uri}&gt;
                  </code>
                  <button type="button" onClick={() => handleRemovePrefix(prefix)}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="queryBuilder-sparqlSelect-addPrefix">
            <input
              type="text"
              value={newPrefix}
              onChange={e => setNewPrefix(e.target.value)}
              placeholder="prefix"
            />
            <input
              type="text"
              value={newUri}
              onChange={e => setNewUri(e.target.value)}
              placeholder="http://example.org/"
            />
            <button type="button" onClick={handleAddPrefix}>
              Add
            </button>
          </div>
        </fieldset>
      </div>
    );
  }
);
