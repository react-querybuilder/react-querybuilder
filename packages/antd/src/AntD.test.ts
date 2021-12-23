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

describe('AntD compatible components', () => {
  testActionElement(AntDActionElement);
  testDragHandle(AntDDragHandle);
  testNotToggle(AntDNotToggle);
  testValueEditor(AntDValueEditor, { select: true });
  testValueSelector(AntDValueSelector);
});
