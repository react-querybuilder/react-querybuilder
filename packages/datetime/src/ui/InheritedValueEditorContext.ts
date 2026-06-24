import type { Context } from 'react';
import { createContext, useContext } from 'react';
import type { ValueEditorProps } from 'react-querybuilder';

/**
 * Holds the value editor inherited from an outer (compat package) context provider,
 * captured _before_ {@link QueryBuilderDateTime} overrides it. Lets the date/time value
 * editor delegate non-date fields (and absolute date inputs) to the compat editor instead
 * of the bare default {@link react-querybuilder!ValueEditor ValueEditor}. `null` = none
 * inherited (fall back to default).
 */
export const InheritedValueEditorContext: Context<React.ComponentType<ValueEditorProps> | null> =
  createContext<React.ComponentType<ValueEditorProps> | null>(null);

/** Inherited (compat) value editor, or `null` if none. See {@link InheritedValueEditorContext}. */
export const useInheritedValueEditor = (): React.ComponentType<ValueEditorProps> | null =>
  useContext(InheritedValueEditorContext);
