import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { getRqbStore } from '../redux/getRqbStore';
import { queriesSlice } from '../redux/queriesSlice';
import type { SetQueryStateAction } from '../redux/queriesSlice';
import type { RuleGroupProps } from '../types';
import { QueryBuilder } from './QueryBuilder';
import { RuleGroup } from './RuleGroup';

const user = userEvent.setup();
const store = getRqbStore();

const query = { id: 'rg', combinator: 'and', rules: [] };

/**
 * Spies on the `setQueryState` action creator. The thunk dispatches through redux-thunk's
 * inner `dispatch`, not `store.dispatch`, so the action creator is the reliable place to
 * observe the actions (and their `meta`) that query builders produce.
 */
const spySetQueryState = () => {
  const spy = vi.spyOn(queriesSlice.actions, 'setQueryState');
  return {
    spy,
    /** Every action produced by the spied-on creator. */
    actions: () => spy.mock.results.map(r => r.value as SetQueryStateAction),
    lastAction: () => spy.mock.results.at(-1)!.value as SetQueryStateAction,
  };
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('setQueryState meta', () => {
  it('attaches a timestamp to every setQueryState action', async () => {
    const { actions } = spySetQueryState();
    const before = Date.now();

    render(<QueryBuilder qbId="meta-ts" defaultQuery={query} />);
    await user.click(screen.getByTestId('add-rule'));

    const after = Date.now();
    expect(actions().length).toBeGreaterThan(0);
    for (const action of actions()) {
      expect(typeof action.meta.timestamp).toBe('number');
      expect(action.meta.timestamp).toBeGreaterThanOrEqual(before);
      expect(action.meta.timestamp).toBeLessThanOrEqual(after);
    }
  });

  it('defaults fromHistory to false', () => {
    const { actions } = spySetQueryState();

    render(<QueryBuilder qbId="meta-fh-default" defaultQuery={query} />);

    expect(actions().length).toBeGreaterThan(0);
    expect(actions().every(a => a.meta.fromHistory === false)).toBe(true);
  });

  it('sets fromHistory when the action creator is called with the option', () => {
    const action = queriesSlice.actions.setQueryState({ qbId: 'x', query }, { fromHistory: true });
    expect(action.meta.fromHistory).toBe(true);
    expect(typeof action.meta.timestamp).toBe('number');
  });

  it('does not attach meta to unsetQueryState', () => {
    const action = queriesSlice.actions.unsetQueryState({ qbId: 'x' });
    expect(action).not.toHaveProperty('meta');
  });

  it('still applies the query to the store', () => {
    act(() => {
      store.dispatch(queriesSlice.actions.setQueryState({ qbId: 'meta-apply', query }));
    });
    expect(store.getState().queries['meta-apply']).toBe(query);
  });
});

describe('schema.dispatchQuery options', () => {
  const newQuery = { id: 'rg2', combinator: 'or', rules: [] };

  /** Renders a button that calls `schema.dispatchQuery` with the given options. */
  const makeDispatcher = (options?: { fromHistory?: boolean }) =>
    function CustomRuleGroup(props: RuleGroupProps) {
      return (
        <>
          <button
            type="button"
            data-testid="dispatch-btn"
            onClick={() => props.schema.dispatchQuery(newQuery, options)}
          />
          <RuleGroup {...props} />
        </>
      );
    };

  it('marks the action as fromHistory when requested', async () => {
    const onQueryChange = vi.fn();
    const { lastAction } = spySetQueryState();

    render(
      <QueryBuilder
        qbId="dq-history"
        defaultQuery={query}
        onQueryChange={onQueryChange}
        controlElements={{ ruleGroup: makeDispatcher({ fromHistory: true }) }}
      />
    );
    await user.click(screen.getByTestId('dispatch-btn'));

    expect(lastAction().meta.fromHistory).toBe(true);
    expect(lastAction().payload.query).toBe(newQuery);
    // The query is still applied and `onQueryChange` still fires
    expect(store.getState().queries['dq-history']).toBe(newQuery);
    expect(onQueryChange).toHaveBeenLastCalledWith(newQuery);
  });

  it('marks the action as not fromHistory when options are omitted', async () => {
    const { lastAction } = spySetQueryState();

    render(
      <QueryBuilder
        qbId="dq-plain"
        defaultQuery={query}
        controlElements={{ ruleGroup: makeDispatcher() }}
      />
    );
    await user.click(screen.getByTestId('dispatch-btn'));

    expect(lastAction().meta.fromHistory).toBe(false);
    expect(store.getState().queries['dq-plain']).toBe(newQuery);
  });

  it('marks ordinary user edits as not fromHistory', async () => {
    const { lastAction } = spySetQueryState();

    render(<QueryBuilder qbId="dq-edit" defaultQuery={query} />);
    await user.click(screen.getByTestId('add-rule'));

    expect(lastAction().meta.fromHistory).toBe(false);
    expect(lastAction().payload.qbId).toBe('dq-edit');
  });
});

describe('serializability', () => {
  it('does not trigger the serializable-state middleware warning', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    act(() => {
      store.dispatch(
        queriesSlice.actions.setQueryState({ qbId: 'serializable', query }, { fromHistory: true })
      );
    });

    expect(consoleErrorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('non-serializable value')
    );
  });
});
