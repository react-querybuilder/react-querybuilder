import { render, screen } from '@testing-library/react';
import { QueryBuilder, TestID } from 'react-querybuilder';
import {
  testActionElement,
  testDragHandle,
  testNotToggle,
  testValueEditor,
  testValueSelector,
} from 'react-querybuilder/genericTests';
import { FluentActionElement } from './FluentActionElement';
import { FluentDragHandle } from './FluentDragHandle';
import { FluentNotToggle } from './FluentNotToggle';
import { FluentValueEditor } from './FluentValueEditor';
import { FluentValueSelector } from './FluentValueSelector';
import { QueryBuilderFluent } from './index';

jest.setTimeout(30_000);

declare global {
  // eslint-disable-next-line no-var
  var __RQB_DEV__: boolean;
}
globalThis.__RQB_DEV__ = true;

testActionElement(FluentActionElement);
testDragHandle(FluentDragHandle);
testNotToggle(FluentNotToggle);
testValueEditor(FluentValueEditor, { selectorClassOnParent: true });
testValueSelector(FluentValueSelector, { classOnParent: true });

it('renders with composition', () => {
  render(
    <QueryBuilderFluent>
      <QueryBuilder />
    </QueryBuilderFluent>
  );
  expect(screen.getByTestId(TestID.addRule)).toBeInTheDocument();
});
