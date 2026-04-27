import * as React from 'react';
import { useCallback } from 'react';

/**
 * Props for the {@link GremlinProjectionEditor} component.
 */
export interface GremlinProjectionEditorProps {
  /** The graph traversal source name. Defaults to `"g"`. */
  traversalSource?: string;
  /** Callback when the traversal source changes. */
  onTraversalSourceChange: (source: string) => void;
  /** Whether the editor is disabled. */
  disabled?: boolean;
  /** CSS class name for the wrapper element. */
  className?: string;
}

/**
 * Companion component for editing Gremlin projection options.
 *
 * Provides an input for configuring the graph traversal source name
 * (e.g., `"g"` for `g.V()`). Designed to be used alongside a `QueryBuilder`
 * that contains graph pattern rules with Gremlin meta.
 */
export const GremlinProjectionEditor: React.NamedExoticComponent<GremlinProjectionEditorProps> =
  React.memo(function GremlinProjectionEditor({
    traversalSource = 'g',
    onTraversalSourceChange,
    disabled = false,
    className,
  }: GremlinProjectionEditorProps): React.JSX.Element {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onTraversalSourceChange(e.target.value);
      },
      [onTraversalSourceChange]
    );

    return (
      <div
        className={className ?? 'queryBuilder-gremlinProjection'}
        data-testid="gremlin-projection-editor">
        <label>
          Traversal Source
          <input
            type="text"
            value={traversalSource}
            onChange={handleChange}
            disabled={disabled}
            placeholder="g"
          />
        </label>
      </div>
    );
  });
