import dayjs from 'dayjs';
import * as React from 'react';
import type { QueryBuilderContextProvider, ValueEditorProps } from 'react-querybuilder';
import { getCompatContextProvider, useValueEditor, ValueEditor } from 'react-querybuilder';
import { RelativeDateTimeValueEditor } from './RelativeDateTimeValueEditor';

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

export const QueryBuilderDateTime: QueryBuilderContextProvider = getCompatContextProvider({
  controlElements: { valueEditor: QueryBuilderDateTimeValueEditor },
});
