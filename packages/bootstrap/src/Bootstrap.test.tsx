import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { QueryBuilder, TestID } from 'react-querybuilder';
import { testDragHandle, testNotToggle, testValueEditor } from 'react-querybuilder/genericTests';
import { BootstrapDragHandle } from './BootstrapDragHandle';
import { BootstrapNotToggle } from './BootstrapNotToggle';
import { BootstrapValueEditor } from './BootstrapValueEditor';
import { QueryBuilderBootstrap } from './index';

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
