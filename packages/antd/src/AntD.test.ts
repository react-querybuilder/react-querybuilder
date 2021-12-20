import {
  testActionElement,
  testDragHandle,
  testNotToggle,
  testValueEditor,
  testValueSelector,
} from '@react-querybuilder/compat';
import {
  AntDActionElement,
  AntDDragHandle,
  AntDNotToggle,
  AntDValueEditor,
  AntDValueSelector,
} from '.';

testActionElement(AntDActionElement);
testDragHandle(AntDDragHandle);
testNotToggle(AntDNotToggle);
testValueEditor(AntDValueEditor);
testValueSelector(AntDValueSelector);
