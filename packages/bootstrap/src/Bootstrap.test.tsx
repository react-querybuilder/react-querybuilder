import { render, screen } from '@testing-library/react';
import { testDragHandle, testNotToggle, testValueEditor } from 'react-querybuilder/genericTests';
import { QueryBuilder, TestID } from 'react-querybuilder/src';
import {
  BootstrapDragHandle,
  BootstrapNotToggle,
  BootstrapValueEditor,
  QueryBuilderBootstrap,
} from '.';

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
