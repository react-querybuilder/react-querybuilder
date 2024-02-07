import { forwardRef } from 'react';
import type { Controls, Field } from 'react-querybuilder';
import { NativeActionElement } from './NativeActionElement';
import { NativeInlineCombinator } from './NativeInlineCombinator';
import { NativeNotToggle } from './NativeNotToggle';
import { NativeShiftActions } from './NativeShiftActions';
import { NativeValueEditor } from './NativeValueEditor';
import { NativeValueEditorWeb } from './NativeValueEditorWeb';
import { NativeValueSelector } from './NativeValueSelector';
import { NativeValueSelectorWeb } from './NativeValueSelectorWeb';
import { RuleGroupNative } from './RuleGroupNative';
import { RuleNative } from './RuleNative';

export const defaultNativeControlElements = {
  actionElement: NativeActionElement,
  addGroupAction: NativeActionElement,
  addRuleAction: NativeActionElement,
  cloneGroupAction: NativeActionElement,
  cloneRuleAction: NativeActionElement,
  combinatorSelector: NativeValueSelector,
  // TODO?: implement drag-and-drop
  dragHandle: forwardRef(/* istanbul ignore next */ () => null),
  fieldSelector: NativeValueSelector,
  inlineCombinator: NativeInlineCombinator,
  lockGroupAction: NativeActionElement,
  lockRuleAction: NativeActionElement,
  notToggle: NativeNotToggle,
  operatorSelector: NativeValueSelector,
  removeGroupAction: NativeActionElement,
  removeRuleAction: NativeActionElement,
  rule: RuleNative,
  ruleGroup: RuleGroupNative,
  shiftActions: NativeShiftActions,
  valueEditor: NativeValueEditor,
  valueSelector: NativeValueSelector,
  valueSourceSelector: NativeValueSelector,
} satisfies Controls<Field, string>;

export const defaultNativeWebControlElements = {
  ...defaultNativeControlElements,
  combinatorSelector: NativeValueSelectorWeb,
  fieldSelector: NativeValueSelectorWeb,
  operatorSelector: NativeValueSelectorWeb,
  valueEditor: NativeValueEditorWeb,
  valueSelector: NativeValueSelector,
  valueSourceSelector: NativeValueSelectorWeb,
} satisfies Controls<Field, string>;
