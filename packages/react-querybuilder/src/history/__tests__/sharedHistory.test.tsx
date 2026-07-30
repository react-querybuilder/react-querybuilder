import type { RuleGroupType } from '@react-querybuilder/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { useState } from 'react';
import { QueryBuilder } from '../../components/QueryBuilder';
import { getRqbStore } from '../../redux/getRqbStore';
import { QueryBuilderHistory, useQueryBuilderHistory } from '../index';
import { queryHistorySlice } from '../queryHistorySlice';

const user = userEvent.setup();
const store = getRqbStore();

const fields = [{ name: 'f1', label: 'F1' }];
const startQuery: RuleGroupType = {
  id: 'g',
  combinator: 'and',
  rules: [{ id: 'r1', field: 'f1', operator: '=', value: '' }],
};

const historyFor = (qbId: string) =>
  queryHistorySlice.selectors.selectHistoryById(store.getState(), qbId);
const valueEditor = () => screen.getByTestId<HTMLInputElement>('value-editor');
const undoBtn = () => screen.getByTestId('undo-action');

/** External toolbar sharing a `qbId` with the built-in undo/redo buttons. */
const Toolbar = ({ qbId }: { qbId: string }) => {
  const { past } = useQueryBuilderHistory(qbId);
  return <span data-testid="past-count">{past.length}</span>;
};

// Regression: history belongs to the query builder, not to an individual consumer. Previously
// the first consumer to unmount dispatched `unregister`, destroying the history that the
// remaining consumers were still using.
it('retains history when one of several consumers unmounts', async () => {
  const Harness = () => {
    const [showToolbar, setShowToolbar] = useState(true);
    return (
      <QueryBuilderHistory coalesceMs={0}>
        {showToolbar && <Toolbar qbId="shared" />}
        <button type="button" data-testid="hide" onClick={() => setShowToolbar(false)} />
        <QueryBuilder qbId="shared" fields={fields} defaultQuery={startQuery} showUndoRedo />
      </QueryBuilderHistory>
    );
  };

  render(<Harness />);
  await user.type(valueEditor(), 'ab');
  expect(historyFor('shared')?.past).toHaveLength(2);
  expect(screen.getByTestId('past-count')).toHaveTextContent('2');

  await user.click(screen.getByTestId('hide'));

  expect(screen.queryByTestId('past-count')).toBeNull();
  expect(historyFor('shared')?.past).toHaveLength(2);
  expect(undoBtn()).toBeEnabled();

  // The built-in buttons still work
  await user.click(undoBtn());
  expect(valueEditor().value).toBe('a');
});

it('retains history when a consumer re-subscribes with different options', async () => {
  const OptionsHarness = () => {
    const [coalesceMs, setCoalesceMs] = useState(0);
    return (
      <QueryBuilderHistory coalesceMs={coalesceMs}>
        <Toolbar qbId="resub" />
        <button type="button" data-testid="bump" onClick={() => setCoalesceMs(1000)} />
        <QueryBuilder qbId="resub" fields={fields} defaultQuery={startQuery} showUndoRedo />
      </QueryBuilderHistory>
    );
  };

  render(<OptionsHarness />);
  await user.type(valueEditor(), 'ab');
  expect(historyFor('resub')?.past).toHaveLength(2);

  // Changing the options changes `subscribe`'s identity, forcing a re-subscribe
  await user.click(screen.getByTestId('bump'));

  expect(historyFor('resub')?.past).toHaveLength(2);
  expect(historyFor('resub')?.coalesceMs).toBe(1000);
  expect(screen.getByTestId('past-count')).toHaveTextContent('2');
});

it('discards history when the query builder itself unmounts', async () => {
  const { unmount } = render(
    <QueryBuilderHistory coalesceMs={0}>
      <QueryBuilder qbId="teardown" fields={fields} defaultQuery={startQuery} showUndoRedo />
    </QueryBuilderHistory>
  );

  await user.type(valueEditor(), 'ab');
  expect(historyFor('teardown')?.past).toHaveLength(2);

  unmount();
  expect(historyFor('teardown')).toBeUndefined();
});

it('retains history across query builder unmount when query state is preserved', async () => {
  const { unmount } = render(
    <QueryBuilderHistory coalesceMs={0}>
      <QueryBuilder
        qbId="preserved"
        fields={fields}
        defaultQuery={startQuery}
        showUndoRedo
        preserveQueryStateOnUnmount
      />
    </QueryBuilderHistory>
  );

  await user.type(valueEditor(), 'ab');
  expect(historyFor('preserved')?.past).toHaveLength(2);

  unmount();
  // Consistent with the retained query: history survives too
  expect(historyFor('preserved')?.past).toHaveLength(2);
});
