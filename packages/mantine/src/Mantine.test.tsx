import { render, screen } from '@testing-library/react';
import type { Schema } from 'react-querybuilder';
import { QueryBuilder, TestID } from 'react-querybuilder';
import { testActionElement, testNotToggle, testValueEditor } from 'react-querybuilder/genericTests';
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
testValueEditor(MantineValueEditor, { select: true, multiselect: true, betweenSelect: true });

describe('MantineValueSelector', () => {
  it('renders as a single select', () => {
    render(
      <MantineValueSelector
        testID={TestID.fields}
        options={[]}
        handleOnChange={() => {}}
        path={[0]}
        level={1}
        schema={{} as Schema}
      />
    );
  });

  it('renders as a multiselect', () => {
    render(
      <MantineValueSelector
        testID={TestID.fields}
        multiple
        options={[]}
        handleOnChange={() => {}}
        path={[0]}
        level={1}
        schema={{} as Schema}
      />
    );
  });
});

describe('MantineValueEditor as select and date picker', () => {});

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
