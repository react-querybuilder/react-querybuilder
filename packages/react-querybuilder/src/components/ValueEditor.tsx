import {
  clsx,
  getFirstOption,
  getParseNumberMethod,
  joinWith,
  parseNumber,
  toArray,
} from '@react-querybuilder/core';
import { produce } from 'immer';
import * as React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { standardClassnames } from '../defaults';
import type { FullField, InputType, ParseNumberMethod, Schema, ValueEditorProps } from '../types';

interface RadioButtonProps {
  name: string;
  disabled?: boolean;
  checked: boolean;
  handleOnChange: (v: unknown) => void;
  label: string;
}
// Extracted from callback so we can use `useId`
const RadioButton = ({ name, disabled, checked, label, handleOnChange }: RadioButtonProps) => {
  const id = React.useId();
  return (
    <label htmlFor={id}>
      <input
        id={id}
        type="radio"
        value={name}
        disabled={disabled}
        checked={checked}
        onChange={e => handleOnChange(e.target.value)}
      />
      {label}
    </label>
  );
};

/**
 * Default `valueEditor` component used by {@link QueryBuilder}.
 *
 * @group Components
 */
export const ValueEditor = <F extends FullField>(
  allProps: ValueEditorProps<F>
): React.JSX.Element | null => {
  const {
    operator,
    value,
    handleOnChange,
    title,
    className,
    type = 'text',
    inputType,
    values = [],
    listsAsArrays,
    fieldData,
    disabled,
    separator = null,
    testID,
    selectorComponent: SelectorComponent = allProps.schema.controls.valueSelector,
    // Some value selectors spread all extra props to the rendered component, so
    // we cherry pick these out of `propsForValueSelector` to keep them from being
    // assigned to DOM elements. (The props with mixed case are the only ones that
    // really matter. Props in all lowercase don't emit warnings.)
    parseNumbers: _parseNumbers,
    skipHook: _skipHook,
    valueSource: _valueSource,
    ...propsForValueSelector
  } = allProps;

  const {
    valueAsArray,
    multiValueHandler,
    bigIntValueHandler,
    parseNumberMethod,
    valueListItemClassName,
    inputTypeCoerced,
  } = useValueEditor(allProps);

  if (operator === 'null' || operator === 'notNull') {
    return null;
  }

  const placeHolderText = fieldData?.placeholder ?? '';

  if (
    (operator === 'between' || operator === 'notBetween') &&
    (type === 'select' || type === 'text')
  ) {
    const editors = ['from', 'to'].map((key, i) => {
      if (type === 'text') {
        return (
          <input
            key={key}
            type={inputTypeCoerced}
            placeholder={placeHolderText}
            value={valueAsArray[i] ?? ''}
            className={valueListItemClassName}
            disabled={disabled}
            onChange={e => multiValueHandler(e.target.value, i)}
          />
        );
      }
      return (
        <SelectorComponent
          key={key}
          {...propsForValueSelector}
          schema={allProps.schema as unknown as Schema<FullField, string>}
          className={valueListItemClassName}
          handleOnChange={v => multiValueHandler(v, i)}
          disabled={disabled}
          value={valueAsArray[i] ?? getFirstOption(values)}
          options={values}
          listsAsArrays={listsAsArrays}
        />
      );
    });

    return (
      <span data-testid={testID} className={className} title={title}>
        {editors[0]}
        {separator}
        {editors[1]}
      </span>
    );
  }

  switch (type) {
    case 'select':
    case 'multiselect':
      return (
        <SelectorComponent
          {...propsForValueSelector}
          schema={allProps.schema as unknown as Schema<FullField, string>}
          testID={testID}
          className={className}
          title={title}
          handleOnChange={handleOnChange}
          disabled={disabled}
          value={value}
          options={values}
          multiple={type === 'multiselect'}
          listsAsArrays={listsAsArrays}
        />
      );

    case 'textarea':
      return (
        <textarea
          data-testid={testID}
          placeholder={placeHolderText}
          value={value}
          title={title}
          className={className}
          disabled={disabled}
          onChange={e => handleOnChange(e.target.value)}
        />
      );

    case 'switch':
    case 'checkbox':
      return (
        <input
          data-testid={testID}
          type="checkbox"
          className={className}
          title={title}
          onChange={e => handleOnChange(e.target.checked)}
          checked={!!value}
          disabled={disabled}
        />
      );

    case 'radio':
      return (
        <span data-testid={testID} className={className} title={title}>
          {values.map(v => (
            <RadioButton
              key={v.name}
              name={v.name}
              disabled={disabled}
              checked={value === v.name}
              handleOnChange={handleOnChange}
              label={v.label}
            />
          ))}
        </span>
      );
  }

  // Note that we don't use `inputTypeCoerced` for this condition.
  // We need to know that its uncoerced value is "bigint".
  if (inputType === 'bigint') {
    return (
      <input
        data-testid={testID}
        type={inputTypeCoerced}
        placeholder={placeHolderText}
        value={`${value}`}
        title={title}
        className={className}
        disabled={disabled}
        onChange={e => bigIntValueHandler(e.target.value)}
      />
    );
  }

  return (
    <input
      data-testid={testID}
      type={inputTypeCoerced}
      placeholder={placeHolderText}
      value={value}
      title={title}
      className={className}
      disabled={disabled}
      onChange={e =>
        handleOnChange(parseNumber(e.target.value, { parseNumbers: parseNumberMethod }))
      }
    />
  );
};

export interface UseValueEditor {
  /**
   * Array of values for when the main value represents a list, e.g. when operator
   * is "between" or "in".
   */
  // oxlint-disable-next-line typescript/no-explicit-any
  valueAsArray: any[];
  /**
   * An update handler for a series of value editors, e.g. when operator is "between".
   * Calling this function will update a single element of the value array and leave
   * the rest of the array as is.
   *
   * @param {string} val The new value for the editor
   * @param {number} idx The index of the editor (and the array element to update)
   */
  multiValueHandler: (val: unknown, idx: number) => void;
  /**
   * An update handler for bigint editors, e.g. when `inputType` is "bigint" and
   * `parseNumbersMethod` is truthy.
   */
  bigIntValueHandler: (val: unknown) => void;
  /**
   * Evaluated `parseNumber` method based on `parseNumbers` prop. This property ends up
   * being the same as the `parseNumbers` prop minus the "-limited" suffix, unless
   * the "-limited" suffix is present and the `inputType` is not "number", in which case
   * it's set to `false`.
   */
  parseNumberMethod: ParseNumberMethod;
  /**
   * Class for items in a value editor series (e.g. "between" value editors).
   */
  valueListItemClassName: string;
  /**
   * Coerced `inputType` based on `inputType` and `operator`.
   */
  inputTypeCoerced: InputType;
}

/**
 * This hook is primarily concerned with multi-value editors like date range
 * pickers, editors for 'in' and 'between' operators, etc.
 *
 * @returns The value as an array (`valueAsArray`), a change handler for
 * series of editors (`multiValueHandler`), a processed version of the
 * `parseNumbers` prop (`parseNumberMethod`), and the classname(s) to be applied
 * to each editor in editor series (`valueListItemClassName`).
 *
 * **NOTE:** The following logic only applies if `skipHook` is not `true`. To avoid
 * automatically updating the `value`, pass `{ skipHook: true }`.
 *
 * If the `value` is an array of non-zero length, the `operator` is _not_ one of
 * the known multi-value operators ("between", "notBetween", "in", "notIn"), and
 * the `type` is not "multiselect", then the `value` will be set to the first
 * element of the array (i.e., `value[0]`).
 *
 * The same thing will happen if `inputType` is "number" and `value` is a string
 * containing a comma, since `<input type="number">` doesn't handle commas.
 *
 * @example
 * // Consider the following rule:
 * `{ field: "f1", operator: "in", value: ["twelve","fourteen"] }`
 * // If `operator` changes to "=", the value will be reset to "twelve".
 *
 * @example
 * // Consider the following rule:
 * `{ field: "f1", operator: "between", value: "12,14" }`
 * // If `operator` changes to "=", the value will be reset to "12".
 *
 * @group Hooks
 */
export const useValueEditor = <F extends FullField = FullField, O extends string = string>(
  props: ValueEditorProps<F, O>
): UseValueEditor => {
  const {
    handleOnChange,
    inputType,
    operator,
    value,
    listsAsArrays,
    parseNumbers,
    values,
    type,
    skipHook,
    schema: { classNames: classNamesProp, suppressStandardClassnames },
  } = props;

  useEffect(() => {
    if (
      !skipHook &&
      type !== 'multiselect' &&
      !['between', 'notBetween', 'in', 'notIn'].includes(operator) &&
      (Array.isArray(value) ||
        (inputType === 'number' && typeof value === 'string' && value.includes(',')))
    ) {
      handleOnChange(toArray(value, { retainEmptyStrings: true })[0] ?? '');
    }
  }, [handleOnChange, inputType, operator, skipHook, type, value]);

  const valueAsArray = useMemo(() => toArray(value, { retainEmptyStrings: true }), [value]);

  const parseNumberMethod = useMemo(
    () => getParseNumberMethod({ parseNumbers, inputType }),
    [inputType, parseNumbers]
  );

  const multiValueHandler = useCallback(
    // oxlint-disable-next-line typescript/no-explicit-any
    (val: any, idx: number) => {
      const v = produce(valueAsArray, va => {
        va[idx] = parseNumber(val, { parseNumbers: parseNumberMethod });
        // Enforce an array length of (at least) two for "between"/"notBetween"
        if (
          idx === 0 &&
          (operator === 'between' || operator === 'notBetween') &&
          (va.length < 2 || va[1] === undefined)
        ) {
          va[1] = getFirstOption(values);
        }
      });
      handleOnChange(listsAsArrays ? v : joinWith(v, ','));
    },
    [handleOnChange, listsAsArrays, operator, parseNumberMethod, valueAsArray, values]
  );

  const bigIntValueHandler = useCallback(
    (v: unknown) => {
      const valAsMaybeNumber = parseNumber(v, {
        parseNumbers: parseNumberMethod,
        bigIntOnOverflow: true,
      });
      let bi: bigint;
      try {
        bi = BigInt(valAsMaybeNumber);
      } catch {
        handleOnChange(valAsMaybeNumber);
        return;
      }
      handleOnChange(bi);
    },
    [handleOnChange, parseNumberMethod]
  );

  const valueListItemClassName = clsx(
    suppressStandardClassnames || standardClassnames.valueListItem,
    // Optional chaining is necessary for QueryBuilderNative
    classNamesProp?.valueListItem
  );

  const inputTypeCoerced =
    inputType === 'bigint' || operator === 'in' || operator === 'notIn'
      ? 'text'
      : inputType || 'text';

  return {
    valueAsArray,
    multiValueHandler,
    bigIntValueHandler,
    parseNumberMethod,
    valueListItemClassName,
    inputTypeCoerced,
  };
};
