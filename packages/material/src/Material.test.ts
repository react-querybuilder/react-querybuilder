import {
  testActionElement,
  testDragHandle,
  testNotToggle,
  testValueEditor,
  testValueSelector,
} from '@react-querybuilder/compat';
import {
  MaterialActionElement,
  MaterialDragHandle,
  MaterialNotToggle,
  MaterialValueEditor,
  MaterialValueSelector,
} from '.';

testActionElement(MaterialActionElement);
testDragHandle(MaterialDragHandle);
testNotToggle(MaterialNotToggle);
testValueEditor(MaterialValueEditor);
testValueSelector(MaterialValueSelector);
