import { testNotToggle, testValueEditor, testValueSelector } from '@rqb-testing';
import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { QueryBuilder, TestID } from 'react-querybuilder';
import { BulmaNotToggle } from './BulmaNotToggle';
import { BulmaValueEditor } from './BulmaValueEditor';
import { BulmaValueSelector } from './BulmaValueSelector';
import { QueryBuilderBulma } from './index';

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
