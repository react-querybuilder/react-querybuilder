import { render, screen } from '@testing-library/react';
import { QueryBuilder, TestID } from 'react-querybuilder';
import {
  testActionElement,
  testNotToggle,
  testValueEditor,
  testValueSelector,
} from 'react-querybuilder/genericTests';
import { QueryBuilderMantine } from './index';
import { MantineActionElement } from './MantineActionElement';
import { MantineNotToggle } from './MantineNotToggle';
import { MantineValueEditor } from './MantineValueEditor';
import { MantineValueSelector } from './MantineValueSelector';

declare global {
  // eslint-disable-next-line no-var
  var __RQB_DEV__: boolean;
}
globalThis.__RQB_DEV__ = true;

testActionElement(MantineActionElement);
testNotToggle(MantineNotToggle);
testValueEditor(MantineValueEditor);
testValueSelector(MantineValueSelector);

it('renders with composition', () => {
  render(
    <QueryBuilderMantine>
      <QueryBuilder />
    </QueryBuilderMantine>
  );
  expect(screen.getByTestId(TestID.ruleGroup)).toBeInTheDocument();
  expect(screen.getByTestId(TestID.ruleGroup).querySelector('button')).toHaveClass(
    'mantine-Button-root'
  );
});
