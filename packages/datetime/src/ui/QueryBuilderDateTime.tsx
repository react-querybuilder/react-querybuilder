import * as React from 'react';
import { useContext, useMemo } from 'react';
import type { QueryBuilderContextProvider, ValueEditorProps } from 'react-querybuilder';
import {
  getCompatContextProvider,
  QueryBuilderContext,
  useValueEditor,
  ValueEditor,
} from 'react-querybuilder';
import {
  InheritedValueEditorContext,
  useInheritedValueEditor,
} from './InheritedValueEditorContext';
import {
  RelativeDateTimeConfigContext,
  useRelativeDateTimeConfig,
} from './RelativeDateTimeConfigContext';
import { RelativeDateTimeValueEditor } from './RelativeDateTimeValueEditor';
import type { RelativeDateTimeEditorConfig } from './types';

/**
 * Whether a rule should use a date/time editor, based on either the coerced input
 * type (`date`/`datetime-local`) or a date-like `datatype` (`date`/`datetime`/`timestamp`).
 */
const isDateTimeEditor = (props: ValueEditorProps, inputTypeCoerced: string | undefined): boolean =>
  (props.type === 'text' &&
    (inputTypeCoerced === 'date' || inputTypeCoerced === 'datetime-local')) ||
  /^(?:date|datetime|timestamp)\b/i.test(props.fieldData?.datatype as string);

const pad2 = (n: number): string => `${n}`.padStart(2, '0');

/**
 * Formats a `Date` into the local value expected by a native `date`/`datetime-local`
 * input (library-agnostic; the date library only handles parsing/validation).
 */
const formatDateInputValue = (d: Date, withTime: boolean): string => {
  const datePart = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  return withTime ? `${datePart}T${pad2(d.getHours())}:${pad2(d.getMinutes())}` : datePart;
};

/**
 * Renders the inherited (compat) editor when one is provided, otherwise the default
 * {@link react-querybuilder!ValueEditor ValueEditor}. The editor is received as a prop (rather
 * than read from context here) so the JSX element type stays prop-sourced and stable.
 */
const FallbackValueEditor = ({
  editor: Editor,
  ...props
}: ValueEditorProps & {
  editor: React.ComponentType<ValueEditorProps> | null;
}): React.JSX.Element => (Editor ? <Editor {...props} /> : <ValueEditor {...props} skipHook />);

export const DateTimeValueEditor = (props: ValueEditorProps): React.JSX.Element => {
  const uVE = useValueEditor(props);
  const InheritedEditor = useInheritedValueEditor();
  const { dateTimeAPI } = useRelativeDateTimeConfig();

  // Non-date fields and unparseable values: delegate to the inherited (compat) editor when
  // present, otherwise the default editor.
  const fallback = (p: ValueEditorProps) => <FallbackValueEditor editor={InheritedEditor} {...p} />;

  if (!isDateTimeEditor(props, uVE.inputTypeCoerced)) {
    return fallback(props);
  }

  if (dateTimeAPI.isValid(props.value)) {
    const value = formatDateInputValue(
      dateTimeAPI.toDate(props.value),
      uVE.inputTypeCoerced !== 'date'
    );
    return fallback({ ...props, value });
  }

  return fallback(props);
};

/**
 * Provider value editor: renders the relative-capable {@link RelativeDateTimeValueEditor}
 * for date/time fields and falls back to the inherited (compat) editor for everything else.
 */
const QueryBuilderDateTimeValueEditor = (props: ValueEditorProps): React.JSX.Element => {
  const uVE = useValueEditor(props);
  const InheritedEditor = useInheritedValueEditor();

  if (isDateTimeEditor(props, uVE.inputTypeCoerced)) {
    return <RelativeDateTimeValueEditor {...props} />;
  }

  return <FallbackValueEditor editor={InheritedEditor} {...props} />;
};

export const QueryBuilderDateTimeContext: QueryBuilderContextProvider = getCompatContextProvider({
  controlElements: { valueEditor: QueryBuilderDateTimeValueEditor },
});

/** Props for {@link QueryBuilderDateTime}: {@link RelativeDateTimeEditorConfig} plus children. */
export interface QueryBuilderDateTimeProps extends RelativeDateTimeEditorConfig {
  children?: React.ReactNode;
}

/**
 * Context provider enabling date/time features for a wrapped
 * {@link react-querybuilder!QueryBuilder QueryBuilder}: renders the relative-capable
 * {@link RelativeDateTimeValueEditor} for date/time fields, and accepts optional
 * {@link RelativeDateTimeEditorConfig} props (mode controller, anchor/unit options, and
 * toggle labels). With no props it provides the zero-config toggle experience.
 *
 * @group Components
 */
export const QueryBuilderDateTime = ({
  children,
  modeController,
  anchors,
  units,
  toggleLabels,
  dateTimeAPI,
}: QueryBuilderDateTimeProps): React.JSX.Element => {
  const config = useMemo(
    (): RelativeDateTimeEditorConfig => ({
      modeController,
      anchors,
      units,
      toggleLabels,
      dateTimeAPI,
    }),
    [modeController, anchors, units, toggleLabels, dateTimeAPI]
  );

  // Capture the value editor inherited from any outer compat provider (e.g. QueryBuilderMaterial)
  // _before_ QueryBuilderDateTimeContext overrides it, so date/time editors can delegate to it.
  const inheritedValueEditor = (useContext(QueryBuilderContext).controlElements?.valueEditor ??
    null) as React.ComponentType<ValueEditorProps> | null;

  return (
    <RelativeDateTimeConfigContext.Provider value={config}>
      <InheritedValueEditorContext.Provider value={inheritedValueEditor}>
        <QueryBuilderDateTimeContext>{children}</QueryBuilderDateTimeContext>
      </InheritedValueEditorContext.Provider>
    </RelativeDateTimeConfigContext.Provider>
  );
};
