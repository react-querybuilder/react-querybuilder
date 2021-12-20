import {
  testActionElement,
  testDragHandle,
  testNotToggle,
  testValueEditor,
  testValueSelector,
} from '@react-querybuilder/compat';
import { ActionElement, DragHandle, NotToggle, ValueEditor, ValueSelector } from '..';

testActionElement(ActionElement);
testDragHandle(DragHandle);
testNotToggle(NotToggle);
testValueEditor(ValueEditor);
testValueSelector(ValueSelector);
