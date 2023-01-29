/**
 * This is in a separate file from the other RuleGroup tests because it's the easiest
 * way to isolate the import of the useDeprecatedProps module and get a "clean" test.
 */
import { render, screen } from '@testing-library/react';
import { consoleMocks, getRuleGroupProps } from '../genericTests';
import { TestID } from './defaults';
import { errorDeprecatedRuleGroupProps } from './messages';
import { RuleGroup } from './RuleGroup';

const { consoleError } = consoleMocks();

it('warns about deprecated props', () => {
  // @ts-expect-error ruleGroup is required
  render(<RuleGroup {...getRuleGroupProps()} ruleGroup={undefined} rules={[]} combinator="or" />);
  expect(consoleError).toHaveBeenCalledWith(errorDeprecatedRuleGroupProps);
  expect(screen.getByTestId(TestID.combinators)).toHaveValue('or');
});
