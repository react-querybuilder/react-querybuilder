import type { DatatypeCategoryMap, FullField, InputType, ValueEditorType } from '../types';
import { getDatatypeCategory } from './getDatatypeCategory';

/**
 * Fills absent `inputType`/`valueEditorType` based on the field's `datatype` (inverse of
 * {@link inferOperators}). Explicit values are never overridden. Returns the same object
 * if nothing was filled, otherwise a shallow copy.
 *
 * | category             | fills                         |
 * | -------------------- | ----------------------------- |
 * | `number`             | `inputType: 'number'`         |
 * | `boolean`            | `valueEditorType: 'checkbox'` |
 * | `date`.              | `inputType: 'date'`           |
 * | `datetime`           | `inputType: 'datetime-local'` |
 * | `time`               | `inputType: 'time'`           |
 * | `enum` (w/ `values`) | `valueEditorType: 'select'`   |
 *
 * @group Option Lists
 */
export const inferFieldDefaults = <F extends FullField>(
  field: F,
  { datatypeMap }: { datatypeMap?: DatatypeCategoryMap } = {}
): F => {
  const cat = getDatatypeCategory(field, { datatypeMap, hints: false });
  if (cat === null || Array.isArray(cat)) return field;

  let inputType: InputType | undefined;
  let valueEditorType: ValueEditorType | undefined;
  switch (cat) {
    case 'number':
      inputType = 'number';
      break;
    case 'date':
      inputType = 'date';
      break;
    case 'datetime':
      inputType = 'datetime-local';
      break;
    case 'time':
      inputType = 'time';
      break;
    case 'boolean':
      valueEditorType = 'checkbox';
      break;
    case 'enum':
      if (Array.isArray(field.values) && field.values.length > 0) valueEditorType = 'select';
      break;
  }

  const fills: Partial<FullField> = {};
  if (inputType && field.inputType == null) fills.inputType = inputType;
  if (valueEditorType && field.valueEditorType == null) fills.valueEditorType = valueEditorType;
  return Object.keys(fills).length > 0 ? { ...field, ...fills } : field;
};
