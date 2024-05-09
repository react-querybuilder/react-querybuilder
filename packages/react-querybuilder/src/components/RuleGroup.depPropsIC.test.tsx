/**
 * This is in a separate file from the other RuleGroup tests because it's the easiest
 * way to isolate the import of the useDeprecatedProps module and get a "clean" test.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { consoleMocks, getRuleGroupProps } from '../../genericTests';
import { TestID, defaultCombinators } from '../defaults';
import { messages } from '../messages';
import { add } from '../utils';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type RG = typeof import('./RuleGroup');

const { consoleError } = consoleMocks();

const user = userEvent.setup();

it('warns about deprecated props (independent combinators)', async () => {
  const { RuleGroup } = jest.requireActual<RG>('./RuleGroup');
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
  expect(consoleError).toHaveBeenCalledWith(messages.errorDeprecatedRuleGroupProps);

  await user.click(screen.getByTestId(TestID.addRule));
  expect(addListener).toHaveBeenCalledTimes(1);
  expect(addListener).toHaveBeenLastCalledWith(
    expect.objectContaining({
      rules: expect.arrayContaining([
        expect.anything(),
        defaultCombinators[0].name,
        expect.anything(),
      ]),
    })
  );
});
