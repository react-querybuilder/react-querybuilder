import { render, screen } from '@testing-library/react';
import {
  testActionElement,
  testNotToggle,
  testValueEditor,
  testValueSelector,
} from 'react-querybuilder/genericTests';
import { QueryBuilder, TestID } from 'react-querybuilder/src';
import {
  BulmaActionElement,
  BulmaNotToggle,
  BulmaValueEditor,
  BulmaValueSelector,
  QueryBuilderBulma,
} from '.';

declare global {
  // eslint-disable-next-line no-var
  var __RQB_DEV__: boolean;
}
globalThis.__RQB_DEV__ = true;

testActionElement(BulmaActionElement);
testNotToggle(BulmaNotToggle);
testValueEditor(BulmaValueEditor);
testValueSelector(BulmaValueSelector);

it('renders with composition', () => {
  render(
    <QueryBuilderBulma>
      <QueryBuilder />
    </QueryBuilderBulma>
  );
  expect(screen.getByTestId(TestID.ruleGroup)).toBeInTheDocument();
  expect(screen.getByTestId(TestID.ruleGroup).querySelector('button')).toHaveClass('button');
});
