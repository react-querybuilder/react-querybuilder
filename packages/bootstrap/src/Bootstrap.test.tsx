import { render, screen } from '@testing-library/react';
import { QueryBuilder, TestID } from 'react-querybuilder';
import { testDragHandle, testNotToggle, testValueEditor } from 'react-querybuilder/genericTests';
import { BootstrapDragHandle } from './BootstrapDragHandle';
import { BootstrapNotToggle } from './BootstrapNotToggle';
import { BootstrapValueEditor } from './BootstrapValueEditor';
import { QueryBuilderBootstrap } from './index';

declare global {
  // eslint-disable-next-line no-var
  var __RQB_DEV__: boolean;
}
globalThis.__RQB_DEV__ = true;

testDragHandle(BootstrapDragHandle);
testNotToggle(BootstrapNotToggle);
testValueEditor(BootstrapValueEditor);

it('renders with composition', () => {
  render(
    <QueryBuilderBootstrap>
      <QueryBuilder />
    </QueryBuilderBootstrap>
  );
  expect(screen.getByTestId(TestID.ruleGroup)).toBeInTheDocument();
  expect(screen.getByTestId(TestID.addRule)).toHaveClass('btn');
});
