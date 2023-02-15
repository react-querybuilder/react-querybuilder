import { render, screen } from '@testing-library/react';
import { QueryBuilder } from '../components/QueryBuilder';
import { TestID } from '../defaults';
import type { GetCompatContextProviderProps } from './getCompatContextProvider';
import { getCompatContextProvider } from './getCompatContextProvider';

const ruleGroupClassname = 'getCompatContextProvider-ruleGroup';
const buttonClassname = 'getCompatContextProvider-button';
const buttonText = 'Button';
const propsWithClassnames: GetCompatContextProviderProps = {
  key: 'testWith',
  controlClassnames: { ruleGroup: ruleGroupClassname },
  controlElements: {
    addRuleAction: () => <button className={buttonClassname}>{buttonText}</button>,
  },
};
const propsWithoutClassnames: GetCompatContextProviderProps = {
  key: 'testWithout',
  controlElements: propsWithClassnames.controlElements,
};

it('works without classnames', () => {
  const CompatContextProvider = getCompatContextProvider(propsWithoutClassnames);
  render(
    <CompatContextProvider>
      <QueryBuilder />
    </CompatContextProvider>
  );
  expect(screen.getByText(buttonText)).toHaveClass(buttonClassname);
});

it('works with classnames', () => {
  const CompatContextProvider = getCompatContextProvider(propsWithClassnames);
  render(
    <CompatContextProvider>
      <QueryBuilder />
    </CompatContextProvider>
  );
  expect(screen.getByTestId(TestID.ruleGroup)).toHaveClass(ruleGroupClassname);
  expect(screen.getByText(buttonText)).toHaveClass(buttonClassname);
});
