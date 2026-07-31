import { consoleMocks } from '@rqb-testing';
import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { messages } from '../messages';
import { getRqbStore } from '../redux/getRqbStore';
import { getQbIdInstanceCount } from '../redux/instanceRegistry';
import { QueryBuilder } from './QueryBuilder';

const { consoleError } = consoleMocks();

const store = getRqbStore();
const queryIds = () => Object.keys(store.getState().queries);

const defaultQuery = {
  id: 'rg',
  combinator: 'and',
  rules: [{ id: 'r1', field: 'f1', operator: '=', value: 'v1' }],
};

it('uses the qbId prop as the store key', () => {
  render(<QueryBuilder qbId="my-qb" defaultQuery={defaultQuery} />);

  expect(queryIds()).toContain('my-qb');
  expect(store.getState().queries['my-qb']).toBe(defaultQuery);
  expect(getQbIdInstanceCount('my-qb')).toBe(1);
});

it('unregisters the qbId on unmount', () => {
  const { unmount } = render(<QueryBuilder qbId="unregister-me" defaultQuery={defaultQuery} />);
  expect(getQbIdInstanceCount('unregister-me')).toBe(1);

  unmount();
  expect(getQbIdInstanceCount('unregister-me')).toBe(0);
  expect(queryIds()).not.toContain('unregister-me');
});

it('allows a qbId to be reused after the previous query builder unmounts', () => {
  const { unmount } = render(
    <QueryBuilder qbId="reused" defaultQuery={defaultQuery} preserveQueryStateOnUnmount />
  );
  unmount();

  render(<QueryBuilder qbId="reused" />);

  // The second query builder picks up the preserved query rather than falling back
  expect(queryIds()).toContain('reused');
  expect(store.getState().queries['reused']).toBe(defaultQuery);
  expect(consoleError).not.toHaveBeenCalledWith(messages.errorDuplicateQbId);
});

it('warns and falls back to a generated qbId when another instance is already mounted', async () => {
  const before = queryIds();

  render(<QueryBuilder qbId="dupe" defaultQuery={defaultQuery} />);
  // Second query builder mounts in a separate commit, so the first is already registered
  render(
    <QueryBuilder
      qbId="dupe"
      defaultQuery={{ combinator: 'or', rules: [{ field: 'f2', operator: '=', value: 'v2' }] }}
    />
  );

  await new Promise(r => setTimeout(r, 0));
  expect(consoleError).toHaveBeenCalledWith(messages.errorDuplicateQbId);

  // Only one instance holds the requested id; the other fell back to a generated one
  expect(getQbIdInstanceCount('dupe')).toBe(1);
  const newIds = queryIds().filter(id => !before.includes(id));
  expect(newIds).toHaveLength(2);
  expect(newIds).toContain('dupe');

  // Both query builders still render, and independently
  expect(screen.getAllByTestId('rule')).toHaveLength(2);
});

it('does not clobber the existing query when a duplicate qbId is used', async () => {
  const firstQuery = {
    id: 'rg1',
    combinator: 'and',
    rules: [{ id: 'r1', field: 'f1', operator: '=', value: 'v1' }],
  };
  const secondQuery = {
    id: 'rg2',
    combinator: 'or',
    rules: [{ id: 'r2', field: 'f2', operator: '=', value: 'v2' }],
  };

  render(<QueryBuilder qbId="no-clobber" defaultQuery={firstQuery} />);
  const beforeCollision = store.getState().queries['no-clobber'];

  render(<QueryBuilder qbId="no-clobber" defaultQuery={secondQuery} />);
  await new Promise(r => setTimeout(r, 0));

  // The already-registered query builder keeps its query, untouched
  expect(store.getState().queries['no-clobber']).toBe(beforeCollision);
  expect(store.getState().queries['no-clobber']).toBe(firstQuery);
});

it('does not warn about duplicates when qbId is generated', async () => {
  render(<QueryBuilder defaultQuery={defaultQuery} />);
  render(<QueryBuilder defaultQuery={defaultQuery} />);

  await new Promise(r => setTimeout(r, 0));
  expect(consoleError).not.toHaveBeenCalledWith(messages.errorDuplicateQbId);
});

it('warns when the qbId prop changes after mount', async () => {
  const { rerender } = render(<QueryBuilder qbId="original" defaultQuery={defaultQuery} />);
  expect(consoleError).not.toHaveBeenCalledWith(messages.errorChangedQbId);

  rerender(<QueryBuilder qbId="changed" defaultQuery={defaultQuery} />);

  await new Promise(r => setTimeout(r, 0));
  expect(consoleError).toHaveBeenCalledWith(messages.errorChangedQbId);
  // The original id is retained
  expect(queryIds()).toContain('original');
  expect(queryIds()).not.toContain('changed');
});

it('does not treat a same-commit remount as a collision', async () => {
  const Wrapper = ({ instanceKey }: { instanceKey: number }) => (
    <QueryBuilder key={instanceKey} qbId="remounted" defaultQuery={defaultQuery} />
  );

  const { rerender } = render(<Wrapper instanceKey={1} />);
  // Changing the key unmounts the old instance and mounts a new one in a single commit
  rerender(<Wrapper instanceKey={2} />);

  await new Promise(r => setTimeout(r, 0));
  expect(consoleError).not.toHaveBeenCalledWith(messages.errorDuplicateQbId);
  expect(getQbIdInstanceCount('remounted')).toBe(1);
  expect(queryIds()).toContain('remounted');
});

it('does not treat StrictMode double-invoked effects as a collision', async () => {
  render(
    <React.StrictMode>
      <QueryBuilder qbId="strict" defaultQuery={defaultQuery} />
    </React.StrictMode>
  );

  await new Promise(r => setTimeout(r, 0));
  expect(consoleError).not.toHaveBeenCalledWith(messages.errorDuplicateQbId);
  expect(getQbIdInstanceCount('strict')).toBe(1);
  expect(store.getState().queries['strict']).toBe(defaultQuery);
});
