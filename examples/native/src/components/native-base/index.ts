import type { Controls, Field } from 'react-querybuilder';
import { NativeBaseActionElement } from './NativeBaseActionElement';
import { NativeBaseNotToggle } from './NativeBaseNotToggle';
import { NativeBaseValueEditor } from './NativeBaseValueEditor';
import { NativeBaseValueSelector } from './NativeBaseValueSelector';

export const controlElements: Partial<Controls<Field, string>> = {
  actionElement: NativeBaseActionElement,
  notToggle: NativeBaseNotToggle,
  valueEditor: NativeBaseValueEditor,
  valueSelector: NativeBaseValueSelector,
};
