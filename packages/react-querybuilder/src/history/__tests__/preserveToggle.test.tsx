import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { useState } from 'react';
import { QueryBuilder } from '../../components/QueryBuilder';
import { getRqbStore } from '../../redux/getRqbStore';
import { QueryBuilderHistory } from '../index';
import { queryHistorySlice } from '../queryHistorySlice';

const user = userEvent.setup();
const store = getRqbStore();
const fields = [{ name: 'f1', label: 'F1' }];
const startQuery = {
  id: 'g',
  combinator: 'and',
  rules: [{ id: 'r1', field: 'f1', operator: '=', value: '' }],
};
const historyFor = (qbId: string) =>
  queryHistorySlice.selectors.selectHistoryById(store.getState(), qbId);

const Harness = ({ qbId }: { qbId: string }) => {
  const [preserve, setPreserve] = useState(false);
  return (
    <QueryBuilderHistory coalesceMs={0}>
      <button type="button" data-testid="toggle" onClick={() => setPreserve(p => !p)} />
      <QueryBuilder
        qbId={qbId}
        fields={fields}
        defaultQuery={startQuery}
        showUndoRedo
        preserveQueryStateOnUnmount={preserve}
      />
    </QueryBuilderHistory>
  );
};

// Regression: `preserveQueryStateOnUnmount` must not be a dependency of the registration
// effect. As a dependency, toggling it re-ran the effect even though nothing unmounted, and
// the cleanup's `unsetQueryState` destroyed the recorded history.
it('retains history when preserveQueryStateOnUnmount is toggled', async () => {
  render(<Harness qbId="toggle-preserve" />);

  await user.type(screen.getByTestId('value-editor'), 'ab');
  expect(historyFor('toggle-preserve')?.past).toHaveLength(2);
  expect(screen.getByTestId('undo-action')).toBeEnabled();

  await user.click(screen.getByTestId('toggle'));

  expect(historyFor('toggle-preserve')?.past).toHaveLength(2);
  expect(screen.getByTestId('undo-action')).toBeEnabled();
  expect(store.getState().queries['toggle-preserve']).toBeDefined();

  // Undo still works after the toggle
  await user.click(screen.getByTestId('undo-action'));
  expect(screen.getByTestId<HTMLInputElement>('value-editor').value).toBe('a');
});

it('still honors the latest value of preserveQueryStateOnUnmount on unmount', async () => {
  const { unmount } = render(<Harness qbId="toggle-then-unmount" />);
  await user.type(screen.getByTestId('value-editor'), 'a');
  expect(store.getState().queries['toggle-then-unmount']).toBeDefined();

  // Flip to `true`, then unmount: the query must survive
  await user.click(screen.getByTestId('toggle'));
  unmount();
  expect(store.getState().queries['toggle-then-unmount']).toBeDefined();
});

it('tears down on unmount when the flag is toggled back off', async () => {
  const { unmount } = render(<Harness qbId="toggle-off-unmount" />);
  await user.type(screen.getByTestId('value-editor'), 'a');

  await user.click(screen.getByTestId('toggle')); // -> true
  await user.click(screen.getByTestId('toggle')); // -> false
  unmount();
  expect(store.getState().queries['toggle-off-unmount']).toBeUndefined();
});
