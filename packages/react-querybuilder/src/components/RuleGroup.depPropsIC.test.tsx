/**
 * This is in a separate file from the other RuleGroup tests because it's the easiest
 * way to isolate the import of the useDeprecatedProps module and get a "clean" test.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { consoleMocks, getRuleGroupProps } from '../../genericTests';
import { defaultCombinators, TestID } from '../defaults';
import { errorDeprecatedRuleGroupProps } from '../messages';
import { add } from '../utils';
import { RuleGroup } from './RuleGroup';

const { consoleError } = consoleMocks();

const user = userEvent.setup();

it('warns about deprecated props (independent combinators)', async () => {
  const addListener = jest.fn();
  render(
    <RuleGroup
      {...getRuleGroupProps(
        { independentCombinators: true },
        {
          onRuleAdd: (rOrG, parentPath) => {
            addListener(
              add({ rules: [{ field: 'f', operator: '=', value: 'v' }] }, rOrG, parentPath)
            );
          },
        }
      )}
      path={[]}
      // @ts-expect-error ruleGroup prop is required
      ruleGroup={undefined}
      rules={[{ field: 'f', operator: '=', value: 'v' }]}
      combinator={undefined}
    />
  );
  expect(consoleError).toHaveBeenCalledWith(errorDeprecatedRuleGroupProps);
  await user.click(screen.getByTestId(TestID.addRule));
  expect(addListener.mock.calls[0][0].rules[1]).toBe(defaultCombinators[0].name);
});
