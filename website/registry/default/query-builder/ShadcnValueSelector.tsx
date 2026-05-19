import * as React from 'react';
import { useMemo } from 'react';
import type { SelectProps } from '@/components/ui/select';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { VersatileSelectorProps } from 'react-querybuilder';
import { isOptionGroupArray, useValueSelector } from 'react-querybuilder';

/**
 * @group Props
 */
export type ShadcnValueSelectorProps = VersatileSelectorProps & Partial<SelectProps>;

/**
 * @group Components
 */
export const ShadcnValueSelector = ({
  className,
  handleOnChange,
  options,
  value,
  title,
  disabled,
  multiple: _multiple,
  listsAsArrays: _listsAsArrays,
  testID,
  field: _field,
  fieldData: _fieldData,
  rule: _rule,
  ruleGroup: _ruleGroup,
  rules: _rules,
  path: _path,
  level: _level,
  context: _context,
  validation: _validation,
  schema: _schema,
  ...otherProps
}: ShadcnValueSelectorProps): React.JSX.Element => {
  const { onChange, val } = useValueSelector({ handleOnChange, value });

  const optionContent = useMemo(() => {
    if (isOptionGroupArray(options)) {
      return options.map(og => (
        <SelectGroup key={og.label}>
          <SelectLabel>{og.label}</SelectLabel>
          {og.options.map(opt => (
            <SelectItem key={opt.name} value={opt.name}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectGroup>
      ));
    }
    return options.map(opt =>
      'options' in opt ? null : (
        <SelectItem key={opt.name} value={opt.name}>
          {opt.label}
        </SelectItem>
      )
    );
  }, [options]);

  return (
    <Select {...otherProps} value={val as string} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger data-testid={testID} className={className} title={title}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>{optionContent}</SelectContent>
    </Select>
  );
};
