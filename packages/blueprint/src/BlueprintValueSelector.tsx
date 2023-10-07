import type { MenuItemProps } from '@blueprintjs/core';
import { HTMLSelect, MenuItem } from '@blueprintjs/core';
import type {
  ItemPredicate,
  ItemRenderer,
  ItemRendererProps,
  MultiSelectProps,
} from '@blueprintjs/select';
import { MultiSelect } from '@blueprintjs/select';
import * as React from 'react';
import type { Option, VersatileSelectorProps } from 'react-querybuilder';
import { getOption, toArray, toOptions, useValueSelector } from 'react-querybuilder';
import { optionListMapNameToValue } from './utils';

export type BlueprintValueSelectorProps = VersatileSelectorProps &
  Partial<MultiSelectProps<Option>>;

const getOptionProps = (
  opt: Option,
  { handleClick, handleFocus, modifiers: { active, disabled }, ref }: ItemRendererProps
): MenuItemProps & React.Attributes => ({
  active,
  disabled,
  key: opt.name,
  onClick: handleClick,
  onFocus: handleFocus,
  ref,
  text: opt.label,
});

const tagRenderer = (opt: Option) => opt.label;

const itemPredicate: ItemPredicate<Option> = (query, opt, _idx, exactMatch) => {
  const normalizedLabel = opt.label.toLowerCase();
  const normalizedQuery = query.toLowerCase();
  if (exactMatch) {
    return normalizedLabel === normalizedQuery;
  } else {
    // return normalizedLabel.indexOf(normalizedQuery) >= 0;
    return new RegExp(normalizedQuery.split('').join('.*?'), 'i').test(normalizedLabel);
  }
};

const noResults = <MenuItem disabled={true} text="No results" roleStructure="listoption" />;

export const BlueprintValueSelector = ({
  className,
  handleOnChange,
  options,
  value,
  disabled,
  multiple,
  listsAsArrays,
  testID,
  title,
  field: _field,
  operator: _operator,
  fieldData: _fieldData,
  rule: _rule,
  rules: _rules,
  path: _path,
  level: _level,
  context: _context,
  validation: _validation,
  schema: _schema,
  ...otherProps
}: BlueprintValueSelectorProps) => {
  const { onChange, val } = useValueSelector({ handleOnChange, listsAsArrays, multiple, value });

  const valAsArray = React.useMemo(() => toArray(val), [val]);

  const data = React.useMemo(() => optionListMapNameToValue(options), [options]);

  const selectedItems = React.useMemo(
    () => valAsArray.map(v => getOption(data, v)!).filter(Boolean),
    [data, valAsArray]
  );

  const multiselectRemoveTag = React.useCallback(
    (_t: React.ReactNode, idx: number) => {
      valAsArray.splice(idx, 1);
      onChange(valAsArray);
    },
    [onChange, valAsArray]
  );

  const multiselectChangeHandler = React.useCallback(
    (item: Option) => {
      if (!valAsArray.includes(item.name)) {
        onChange([...valAsArray, item.name]);
      } else {
        const idx = valAsArray.findIndex(v => v === item.name);
        if (idx >= 0) {
          valAsArray.splice(idx, 1);
          onChange(valAsArray);
        }
      }
    },
    [onChange, valAsArray]
  );

  const itemRenderer = React.useCallback<ItemRenderer<Option>>(
    (opt, props) => {
      if (!props.modifiers.matchesPredicate) {
        return null;
      }

      return (
        <MenuItem
          {...getOptionProps(opt, props)}
          roleStructure="listoption"
          selected={valAsArray.includes(opt.name)}
          text={opt.label}
        />
      );
    },
    [valAsArray]
  );

  return multiple ? (
    <MultiSelect<Option>
      {...otherProps}
      data-testid={testID}
      className={className}
      disabled={disabled}
      items={data}
      selectedItems={selectedItems}
      onItemSelect={multiselectChangeHandler}
      onClear={() => onChange([])}
      itemsEqual="value"
      itemPredicate={itemPredicate}
      itemRenderer={itemRenderer}
      tagRenderer={tagRenderer}
      tagInputProps={{ onRemove: multiselectRemoveTag }}
      noResults={noResults}
    />
  ) : (
    <HTMLSelect
      {...otherProps}
      data-testid={testID}
      title={title}
      className={className}
      disabled={disabled}
      onChange={e => onChange(e.target.value)}
      value={val as string}>
      {toOptions(options)}
    </HTMLSelect>
  );
};

BlueprintValueSelector.displayName = 'BlueprintValueSelector';
