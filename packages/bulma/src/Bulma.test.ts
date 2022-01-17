import {
  testActionElement,
  testNotToggle,
  testValueEditor,
  testValueSelector,
} from 'react-querybuilder/genericTests';
import { BulmaActionElement, BulmaNotToggle, BulmaValueEditor, BulmaValueSelector } from '.';

describe('Bulma compatible components', () => {
  testActionElement(BulmaActionElement);
  testNotToggle(BulmaNotToggle);
  testValueEditor(BulmaValueEditor);
  testValueSelector(BulmaValueSelector);
});
