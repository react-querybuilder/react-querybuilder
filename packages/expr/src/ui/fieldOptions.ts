import type { FullField, FullOptionList } from 'react-querybuilder';
import { toFlatOptionArray } from 'react-querybuilder';
import type { ExpressionFieldOption } from './expressionEditorUtils';

/** Flattens a (possibly grouped) field option list into editor field options. */
export const toFieldOptions = (fields: FullOptionList<FullField>): ExpressionFieldOption[] =>
  toFlatOptionArray(fields).map(f => ({ name: `${f.value}`, label: f.label }));
