import { getRqbStore } from '../getRqbStore';
import {
  _RQB_INTERNAL_clearQbIdRegistry,
  getQbIdInstanceCount,
  registerQbId,
  unregisterQbId,
} from '../instanceRegistry';
import { queriesSlice } from '../queriesSlice';

afterEach(() => {
  _RQB_INTERNAL_clearQbIdRegistry();
});

describe('instance registry', () => {
  it('starts at zero for unknown ids', () => {
    expect(getQbIdInstanceCount('nope')).toBe(0);
  });

  it('counts registrations', () => {
    expect(registerQbId('a')).toBe(1);
    expect(getQbIdInstanceCount('a')).toBe(1);
    expect(registerQbId('a')).toBe(2);
    expect(getQbIdInstanceCount('a')).toBe(2);
  });

  it('tracks ids independently', () => {
    registerQbId('a');
    registerQbId('b');
    registerQbId('b');
    expect(getQbIdInstanceCount('a')).toBe(1);
    expect(getQbIdInstanceCount('b')).toBe(2);
  });

  it('counts unregistrations', () => {
    registerQbId('a');
    registerQbId('a');
    expect(unregisterQbId('a')).toBe(1);
    expect(unregisterQbId('a')).toBe(0);
    expect(getQbIdInstanceCount('a')).toBe(0);
  });

  it('does not go negative', () => {
    expect(unregisterQbId('never-registered')).toBe(0);
    expect(getQbIdInstanceCount('never-registered')).toBe(0);
    registerQbId('a');
    expect(unregisterQbId('a')).toBe(0);
    expect(unregisterQbId('a')).toBe(0);
    expect(getQbIdInstanceCount('a')).toBe(0);
  });

  it('deletes the key when the count reaches zero', () => {
    registerQbId('a');
    unregisterQbId('a');
    // Re-registering starts fresh rather than resuming a stale count
    expect(registerQbId('a')).toBe(1);
  });

  it('clears the registry', () => {
    registerQbId('a');
    registerQbId('b');
    _RQB_INTERNAL_clearQbIdRegistry();
    expect(getQbIdInstanceCount('a')).toBe(0);
    expect(getQbIdInstanceCount('b')).toBe(0);
  });
});

describe('unsetQueryState', () => {
  it('removes only the targeted query', () => {
    const store = getRqbStore();
    const query = { combinator: 'and', rules: [] };

    store.dispatch(queriesSlice.actions.setQueryState({ qbId: 'q1', query }));
    store.dispatch(queriesSlice.actions.setQueryState({ qbId: 'q2', query }));
    expect(store.getState().queries).toHaveProperty('q1');
    expect(store.getState().queries).toHaveProperty('q2');

    store.dispatch(queriesSlice.actions.unsetQueryState({ qbId: 'q1' }));
    expect(store.getState().queries).not.toHaveProperty('q1');
    expect(store.getState().queries).toHaveProperty('q2');

    store.dispatch(queriesSlice.actions.unsetQueryState({ qbId: 'q2' }));
    expect(store.getState().queries).not.toHaveProperty('q2');
  });

  it('is a no-op for unknown ids', () => {
    const store = getRqbStore();
    const before = store.getState().queries;
    store.dispatch(queriesSlice.actions.unsetQueryState({ qbId: 'does-not-exist' }));
    expect(store.getState().queries).toEqual(before);
  });
});
