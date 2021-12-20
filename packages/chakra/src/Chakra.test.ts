import {
  testActionElement,
  testDragHandle,
  testNotToggle,
  testValueEditor,
  testValueSelector,
} from '@react-querybuilder/compat';
import {
  ChakraActionElement,
  ChakraDragHandle,
  ChakraNotToggle,
  ChakraValueEditor,
  ChakraValueSelector,
} from '.';

testActionElement(ChakraActionElement);
testDragHandle(ChakraDragHandle);
testNotToggle(ChakraNotToggle);
testValueEditor(ChakraValueEditor);
testValueSelector(ChakraValueSelector);
