import { testDragHandle, testNotToggle, testValueEditor } from '@react-querybuilder/compat';
import { BootstrapDragHandle, BootstrapNotToggle, BootstrapValueEditor } from '.';

describe('Bootstrap compatible components', () => {
  testDragHandle(BootstrapDragHandle);
  testNotToggle(BootstrapNotToggle);
  testValueEditor(BootstrapValueEditor);
});
