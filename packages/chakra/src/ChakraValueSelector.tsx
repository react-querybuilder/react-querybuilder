import type { ComponentPropsWithoutRef } from 'react';
import * as React from 'react';
import type { VersatileSelectorProps } from 'react-querybuilder';
import { toOptions } from './utils';
import { NativeSelectRoot, NativeSelectField } from './snippets/native-select';

/**
 * @group Props
 */
export interface ChakraValueSelectorProps
  extends VersatileSelectorProps,
    ComponentPropsWithoutRef<typeof NativeSelectRoot> {}

/**
 * @group Components
 */
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
  ruleGroup: _ruleGroup,
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
  <NativeSelectRoot className={className} title={title} {...extraProps}>
    <NativeSelectField
      value={value}
      onChange={e => handleOnChange(e.target.value)}
      {...{ disabled }}>
      {toOptions(options)}
    </NativeSelectField>
  </NativeSelectRoot>
);
