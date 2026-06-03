import dayjs from 'dayjs';
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
import { RelativeDateTimeConfigContext } from './RelativeDateTimeConfigContext';
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

export const DateTimeValueEditor = (props: ValueEditorProps): React.JSX.Element => {
  const uVE = useValueEditor(props);
  const InheritedEditor = useInheritedValueEditor();

  // Non-date fields and unparseable values: delegate to the inherited (compat) editor when
  // present, otherwise the default editor.
  const fallback = (p: ValueEditorProps) =>
    InheritedEditor ? <InheritedEditor {...p} /> : <ValueEditor {...p} skipHook />;

  if (!isDateTimeEditor(props, uVE.inputTypeCoerced)) {
    return fallback(props);
  }

  const maybeDate = dayjs(props.value);
  if (maybeDate.isValid()) {
    const value = maybeDate.format(
      uVE.inputTypeCoerced === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DDTHH:mm'
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

  return InheritedEditor ? <InheritedEditor {...props} /> : <ValueEditor {...props} skipHook />;
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
}: QueryBuilderDateTimeProps): React.JSX.Element => {
  const config = useMemo(
    (): RelativeDateTimeEditorConfig => ({ modeController, anchors, units, toggleLabels }),
    [modeController, anchors, units, toggleLabels]
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
