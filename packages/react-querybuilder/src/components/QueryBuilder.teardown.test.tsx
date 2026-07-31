import { render } from '@testing-library/react';
import * as React from 'react';
import { getRqbStore } from '../redux/getRqbStore';
import { QueryBuilder } from './QueryBuilder';

const store = getRqbStore();
const queryIds = () => Object.keys(store.getState().queries);
const queryCount = () => queryIds().length;

const defaultQuery = { combinator: 'and', rules: [{ field: 'f1', operator: '=', value: 'v1' }] };

it('adds the query to the store on mount and removes it on unmount', () => {
  const before = queryCount();

  const { unmount } = render(<QueryBuilder defaultQuery={defaultQuery} />);
  expect(queryCount()).toBe(before + 1);

  unmount();
  expect(queryCount()).toBe(before);
});

it('retains query state on unmount when preserveQueryStateOnUnmount is true', () => {
  const before = queryIds();

  const { unmount } = render(
    <QueryBuilder defaultQuery={defaultQuery} preserveQueryStateOnUnmount />
  );
  const qbId = queryIds().find(id => !before.includes(id))!;
  expect(qbId).toBeDefined();

  unmount();
  expect(queryIds()).toContain(qbId);
  expect(store.getState().queries[qbId]).toMatchObject(defaultQuery);
});

it('tears down independently for multiple query builders', () => {
  const before = queryCount();

  const { unmount: unmount1 } = render(<QueryBuilder defaultQuery={defaultQuery} />);
  const { unmount: unmount2 } = render(<QueryBuilder defaultQuery={defaultQuery} />);
  expect(queryCount()).toBe(before + 2);

  unmount1();
  expect(queryCount()).toBe(before + 1);

  unmount2();
  expect(queryCount()).toBe(before);
});

it('retains query state through StrictMode double-invoked effects', () => {
  const before = queryIds();

  const { unmount } = render(
    <React.StrictMode>
      <QueryBuilder defaultQuery={defaultQuery} />
    </React.StrictMode>
  );

  const newIds = queryIds().filter(id => !before.includes(id));
  expect(newIds).toHaveLength(1);
  // The StrictMode cleanup tears the query down, so the registration effect must re-seed it.
  expect(store.getState().queries[newIds[0]]).toMatchObject(defaultQuery);

  unmount();
  expect(queryIds()).toEqual(before);
});

it('does not call onQueryChange when re-seeding after a StrictMode teardown', () => {
  const onQueryChange = vi.fn();

  render(
    <React.StrictMode>
      <QueryBuilder defaultQuery={defaultQuery} onQueryChange={onQueryChange} />
    </React.StrictMode>
  );

  // Only the mount query change, not an extra call from the re-seed
  expect(onQueryChange).toHaveBeenCalledTimes(1);
});
