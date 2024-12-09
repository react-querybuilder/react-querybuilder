import dayjs from 'dayjs';
import * as React from 'react';
import type { QueryBuilderContextProvider, ValueEditorProps } from 'react-querybuilder';
import { getCompatContextProvider, useValueEditor, ValueEditor } from 'react-querybuilder';

export const DateTimeValueEditor = (props: ValueEditorProps): React.JSX.Element => {
  const uVE = useValueEditor(props);

  if (
    (props.type !== 'text' ||
      (uVE.inputTypeCoerced !== 'date' && uVE.inputTypeCoerced !== 'datetime-local')) &&
    !/^(?:date|datetime|timestamp)\b/i.test(props.fieldData?.datatype as string)
  ) {
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

export const QueryBuilderDateTime: QueryBuilderContextProvider = getCompatContextProvider({
  controlElements: { valueEditor: DateTimeValueEditor },
});
