import type { Controls, Field, ToFullOption } from 'react-querybuilder';
import { NativeBaseActionElement } from './NativeBaseActionElement';
import { NativeBaseNotToggle } from './NativeBaseNotToggle';
import { NativeBaseValueEditor } from './NativeBaseValueEditor';
import { NativeBaseValueSelector } from './NativeBaseValueSelector';

export const controlElements: Partial<Controls<ToFullOption<Field>, string>> = {
  addGroupAction: NativeBaseActionElement,
  addRuleAction: NativeBaseActionElement,
  cloneGroupAction: NativeBaseActionElement,
  cloneRuleAction: NativeBaseActionElement,
  combinatorSelector: NativeBaseValueSelector,
  fieldSelector: NativeBaseValueSelector,
  notToggle: NativeBaseNotToggle,
  operatorSelector: NativeBaseValueSelector,
  lockRuleAction: NativeBaseActionElement,
  lockGroupAction: NativeBaseActionElement,
  removeGroupAction: NativeBaseActionElement,
  removeRuleAction: NativeBaseActionElement,
  valueEditor: NativeBaseValueEditor,
  valueSourceSelector: NativeBaseValueSelector,
};
