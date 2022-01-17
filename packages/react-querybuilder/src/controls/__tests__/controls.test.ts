import {
  testActionElement,
  testDragHandle,
  testNotToggle,
  testValueEditor,
  testValueSelector,
} from '../../../genericTests';
import { ActionElement } from '../ActionElement';
import { DragHandle } from '../DragHandle';
import { NotToggle } from '../NotToggle';
import { ValueEditor } from '../ValueEditor';
import { ValueSelector } from '../ValueSelector';

testActionElement(ActionElement);
testDragHandle(DragHandle);
testNotToggle(NotToggle);
testValueEditor(ValueEditor);
testValueSelector(ValueSelector);
