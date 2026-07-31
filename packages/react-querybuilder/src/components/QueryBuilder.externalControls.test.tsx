import type { Field, RuleGroupType } from '@react-querybuilder/core';
import { add, defaultCombinators, move, remove, update } from '@react-querybuilder/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ChangeEvent } from 'react';
import * as React from 'react';
import { getDispatchQueryById, getQuerySelectorById, useQueryBuilderSelector } from '../redux';
import { QueryBuilder } from './QueryBuilder';
import { QueryBuilderStateProvider } from './QueryBuilderStateProvider';

/**
 * Mirrors the "Uncontrolled component" example from the External controls guide
 * (`website/docs/tips/external-controls.mdx`). The combination it exercises—an external toolbar
 * reading a query builder's state by `qbId` and writing to it, from outside the query builder's
 * own component tree—is not covered anywhere else, so this guards the documented pattern
 * against regressions.
 */

const user = userEvent.setup();

const fields: Field[] = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];

const initialQuery: RuleGroupType = {
  combinator: 'and',
  rules: [
    { field: 'firstName', operator: '=', value: 'Steve' },
    { field: 'lastName', operator: '=', value: 'Vai' },
  ],
};

const NullComponent = () => null;
const qbId = 'external-controls';

const ExternalControls = () => {
  const query = useQueryBuilderSelector(getQuerySelectorById(qbId)) as RuleGroupType;
  const dispatchQuery = (q: RuleGroupType) => getDispatchQueryById(qbId)?.(q);

  // The query builder registers its query as it mounts, so there is one render before it exists
  if (!query) return null;

  return (
    <div>
      <button
        type="button"
        data-testid="add"
        onClick={() =>
          dispatchQuery(add(query, { field: 'firstName', operator: '=', value: 'Steve' }, []))
        }
      />
      <button
        type="button"
        data-testid="remove"
        onClick={() => dispatchQuery(remove(query, [0]))}
      />
      <button
        type="button"
        data-testid="move"
        onClick={() => dispatchQuery(move(query, [query.rules.length - 1], [0]))}
      />
      <select
        data-testid="combinator"
        value={query.combinator}
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          dispatchQuery(update(query, 'combinator', e.target.value, []))
        }>
        {defaultCombinators.map(c => (
          <option key={c.name} value={c.name}>
            {c.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const App = () => (
  <QueryBuilderStateProvider>
    <ExternalControls />
    <QueryBuilder
      qbId={qbId}
      fields={fields}
      defaultQuery={initialQuery}
      controlElements={{
        addGroupAction: NullComponent,
        addRuleAction: NullComponent,
        removeRuleAction: NullComponent,
      }}
    />
  </QueryBuilderStateProvider>
);

const ruleFields = () =>
  screen.getAllByTestId('rule').map(r => r.querySelector<HTMLSelectElement>('.rule-fields')!.value);

it('renders the external controls in sync with the uncontrolled query builder', () => {
  render(<App />);
  expect(ruleFields()).toEqual(['firstName', 'lastName']);
  expect(screen.getByTestId<HTMLSelectElement>('combinator').value).toBe('and');
});

it('adds a rule from outside the query builder', async () => {
  render(<App />);
  await user.click(screen.getByTestId('add'));
  expect(ruleFields()).toEqual(['firstName', 'lastName', 'firstName']);
});

it('removes a rule from outside the query builder', async () => {
  render(<App />);
  await user.click(screen.getByTestId('remove'));
  expect(ruleFields()).toEqual(['lastName']);
});

it('moves a rule from outside the query builder', async () => {
  render(<App />);
  await user.click(screen.getByTestId('move'));
  expect(ruleFields()).toEqual(['lastName', 'firstName']);
});

it('updates the combinator from outside the query builder', async () => {
  render(<App />);
  await user.selectOptions(screen.getByTestId('combinator'), 'or');
  expect(screen.getByTestId<HTMLSelectElement>('combinator').value).toBe('or');
  // The query builder's own combinator selector reflects the external change
  expect(screen.getByTestId('combinators')).toHaveValue('or');
});

it('reflects changes made inside the query builder', async () => {
  render(<App />);
  await user.selectOptions(screen.getByTestId('combinators'), 'or');
  expect(screen.getByTestId<HTMLSelectElement>('combinator').value).toBe('or');
});

it('still calls onQueryChange for externally dispatched updates', async () => {
  const onQueryChange = vi.fn();
  render(
    <QueryBuilderStateProvider>
      <ExternalControls />
      <QueryBuilder
        qbId={qbId}
        fields={fields}
        defaultQuery={initialQuery}
        onQueryChange={onQueryChange}
      />
    </QueryBuilderStateProvider>
  );
  onQueryChange.mockClear();

  await user.click(screen.getByTestId('add'));
  expect(onQueryChange).toHaveBeenCalledTimes(1);
  expect(onQueryChange.mock.calls[0][0].rules).toHaveLength(3);
});
