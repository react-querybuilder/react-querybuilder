import dayjs from 'dayjs';
import * as React from 'react';
import { useMemo } from 'react';
import type { QueryBuilderContextProvider, ValueEditorProps } from 'react-querybuilder';
import { getCompatContextProvider, useValueEditor, ValueEditor } from 'react-querybuilder';
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

  if (!isDateTimeEditor(props, uVE.inputTypeCoerced)) {
    return <ValueEditor {...props} skipHook />;
  }

  const maybeDate = dayjs(props.value);
  if (maybeDate.isValid()) {
    const value = maybeDate.format(
      uVE.inputTypeCoerced === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DDTHH:mm'
    );
    return <ValueEditor {...props} value={value} skipHook />;
  }

  return <ValueEditor {...props} skipHook />;
};

/**
 * Provider value editor: renders the relative-capable {@link RelativeDateTimeValueEditor}
 * for date/time fields and falls back to the standard editor for everything else.
 */
const QueryBuilderDateTimeValueEditor = (props: ValueEditorProps): React.JSX.Element => {
  const uVE = useValueEditor(props);

  if (isDateTimeEditor(props, uVE.inputTypeCoerced)) {
    return <RelativeDateTimeValueEditor {...props} />;
  }

  return <ValueEditor {...props} skipHook />;
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

  return (
    <RelativeDateTimeConfigContext.Provider value={config}>
      <QueryBuilderDateTimeContext>{children}</QueryBuilderDateTimeContext>
    </RelativeDateTimeConfigContext.Provider>
  );
};
