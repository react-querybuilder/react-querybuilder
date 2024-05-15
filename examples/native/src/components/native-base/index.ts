import type { ControlElementsProp, FullField } from 'react-querybuilder';
import { NativeBaseActionElement } from './NativeBaseActionElement';
import { NativeBaseNotToggle } from './NativeBaseNotToggle';
import { NativeBaseValueEditor } from './NativeBaseValueEditor';
import { NativeBaseValueSelector } from './NativeBaseValueSelector';

export const controlElements: ControlElementsProp<FullField, string> = {
  actionElement: NativeBaseActionElement,
  notToggle: NativeBaseNotToggle,
  valueEditor: NativeBaseValueEditor,
  valueSelector: NativeBaseValueSelector,
};
