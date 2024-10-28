import type { ComponentPropsWithoutRef } from 'react';
import * as React from 'react';
import type { VersatileSelectorProps } from 'react-querybuilder';
import { toOptions } from './utils';
import { NativeSelectRoot, NativeSelectField } from './snippets/native-select';

export type ChakraValueSelectorProps = VersatileSelectorProps &
  ComponentPropsWithoutRef<typeof NativeSelectRoot>;

export const ChakraValueSelector = ({
  className,
  handleOnChange,
  options,
  value,
  title,
  disabled,
  // Props that should not be in extraProps
  testID: _testID,
  rule: _rule,
  rules: _rules,
  level: _level,
  path: _path,
  context: _context,
  validation: _validation,
  operator: _operator,
  field: _field,
  fieldData: _fieldData,
  multiple: _multiple,
  listsAsArrays: _listsAsArrays,
  schema: _schema,
  ...extraProps
}: ChakraValueSelectorProps): React.JSX.Element => (
  <NativeSelectRoot className={className} title={title} disabled={disabled} {...extraProps}>
    <NativeSelectField value={value} onChange={e => handleOnChange(e.target.value)}>
      {toOptions(options)}
    </NativeSelectField>
  </NativeSelectRoot>
);
