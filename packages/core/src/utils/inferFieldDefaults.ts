import type {
  DatatypeCategoryMap,
  FullField,
  FullOptionList,
  FullOptionRecord,
  InputType,
  ValueEditorType,
} from '../types';
import { getDatatypeCategory } from './getDatatypeCategory';
import { isFlexibleOptionGroupArray } from './optGroupUtils';

/**
 * Options for {@link inferFieldDefaults}.
 */
export interface InferFieldDefaultsOptions {
  /** Custom raw datatype → category map. */
  datatypeMap?: DatatypeCategoryMap;
}

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
  { datatypeMap }: InferFieldDefaultsOptions = {}
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

/**
 * Value of the `inferFieldDefaults` prop/option. `true` → default options.
 */
export type InferFieldDefaultsProp = boolean | InferFieldDefaultsOptions;

/**
 * Applies {@link inferFieldDefaults} to a prepared field list and its lookup map (see
 * {@link prepareOptionList}). Returns the same objects when `opts` is falsy or nothing changed.
 * List and map entries are separate objects (as from `prepareOptionList`), so each is inferred.
 *
 * @group Option Lists
 */
export const inferFieldListDefaults = <F extends FullField>(
  {
    optionList,
    optionsMap,
  }: { optionList: FullOptionList<F>; optionsMap: Partial<FullOptionRecord<F>> },
  opts: InferFieldDefaultsProp | undefined
): { optionList: FullOptionList<F>; optionsMap: Partial<FullOptionRecord<F>> } => {
  if (!opts) return { optionList, optionsMap };
  const o = opts === true ? {} : opts;
  let changed = false;
  const infer = (f: F) => {
    const r = inferFieldDefaults(f, o);
    if (r !== f) changed = true;
    return r;
  };
  const list = (
    isFlexibleOptionGroupArray(optionList, { allowEmpty: true })
      ? optionList.map(og => {
          const options = og.options.map(f => infer(f as F));
          return options.every((f, i) => f === og.options[i]) ? og : { ...og, options };
        })
      : (optionList as F[]).map(f => infer(f))
  ) as FullOptionList<F>;
  const map: Partial<FullOptionRecord<F>> = {};
  for (const [k, f] of Object.entries(optionsMap) as [string, F][]) {
    (map as Record<string, F>)[k] = infer(f);
  }
  return changed ? { optionList: list, optionsMap: map } : { optionList, optionsMap };
};
