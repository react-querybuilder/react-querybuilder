/**
 * This is in a separate file from the other RuleGroup tests because it's the easiest
 * way to isolate the import of the useDeprecatedProps module and get a "clean" test.
 */
import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { consoleMocks, getRuleGroupProps } from '../../genericTests';
import { TestID } from '../defaults';
import { messages } from '../messages';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type RG = typeof import('./RuleGroup');

const { consoleError } = consoleMocks();

it('warns about deprecated props', () => {
  const { RuleGroup } = jest.requireActual<RG>('./RuleGroup');
  // @ts-expect-error ruleGroup is required
  render(<RuleGroup {...getRuleGroupProps()} ruleGroup={undefined} rules={[]} combinator="or" />);
  expect(consoleError).toHaveBeenCalledWith(messages.errorDeprecatedRuleGroupProps);
  expect(screen.getByTestId(TestID.combinators)).toHaveValue('or');
});
