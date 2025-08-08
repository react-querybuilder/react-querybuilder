import type { RulesEngine } from '../types';
import { addRE, groupRE, insertRE, moveRE, removeRE, updateRE } from './rulesEngineTools';

const id = expect.any(String);

describe('addRE', () => {
  it('adds a rule action to an empty rules engine', () => {
    expect(addRE({ conditions: [], id: 'root' }, { actionType: 'a' }, [])).toEqual({
      conditions: [{ actionType: 'a' }],
      id: 'root',
    });
  });

  it('does not add a rule action to a rules engine with a trailing rule action', () => {
    expect(
      addRE({ conditions: [{ actionType: 'a' }], id: 'root' }, { actionType: 'b' }, [])
    ).toEqual({
      conditions: [{ actionType: 'a' }],
      id: 'root',
    });
  });

  it('adds a rule group to an empty rules engine', () => {
    expect(addRE({ conditions: [], id: 'root' }, { combinator: 'and', rules: [] }, [])).toEqual({
      conditions: [{ combinator: 'and', rules: [] }],
      id: 'root',
    });
  });

  it('adds a rule group as second-to-last element when action is present', () => {
    expect(
      addRE(
        { conditions: [{ combinator: 'and', rules: [] }, { actionType: 'a' }], id: 'root' },
        { id: 'new', combinator: 'and', rules: [] },
        []
      )
    ).toEqual({
      conditions: [
        { combinator: 'and', rules: [] },
        { id: 'new', combinator: 'and', rules: [] },
        { actionType: 'a' },
      ],
      id: 'root',
    });
  });

  it('does not add a rule to the conditions of a rules engine', () => {
    expect(
      addRE({ conditions: [], id: 'root' }, { field: 'f', operator: '=', value: 'v' }, [])
    ).toEqual({ conditions: [], id: 'root' });
  });

  it('adds a rule group to a nested rules engine', () => {
    expect(
      addRE(
        { conditions: [{ combinator: 'and', rules: [], conditions: [] }], id: 'root' },
        { combinator: 'and', rules: [] },
        [0]
      )
    ).toEqual({
      conditions: [
        { combinator: 'and', rules: [], conditions: [{ combinator: 'and', rules: [] }] },
      ],
      id: 'root',
    });
  });

  it('makes a rule group a rule engine when appropriate', () => {
    expect(
      addRE(
        { conditions: [{ combinator: 'and', rules: [] }], id: 'root' },
        { id: 'new', combinator: 'and', rules: [] },
        [0]
      )
    ).toEqual({
      conditions: [
        {
          combinator: 'and',
          rules: [],
          conditions: [{ id: 'new', combinator: 'and', rules: [] }],
        },
      ],
      id: 'root',
    });
  });

  it('adds a rule to a nested rules engine', () => {
    expect(
      addRE(
        {
          conditions: [
            {
              combinator: 'and',
              rules: [],
              conditions: [
                { combinator: 'and', rules: [] },
                { combinator: 'and', rules: [] },
                { combinator: 'and', rules: [] },
              ],
            },
          ],
          id: 'root',
        },
        { field: 'f', operator: '=', value: 'v' },
        [0, 1],
        []
      )
    ).toEqual({
      conditions: [
        {
          combinator: 'and',
          rules: [],
          conditions: [
            { combinator: 'and', rules: [] },
            { combinator: 'and', rules: [{ id, field: 'f', operator: '=', value: 'v' }] },
            { combinator: 'and', rules: [] },
          ],
        },
      ],
      id: 'root',
    });
  });

  it('ignores invalid rules engines', () => {
    // oxlint-disable-next-line no-explicit-any
    const r1 = {} as any;
    expect(addRE(r1, { actionType: 'a' }, [])).toBe(r1);

    // oxlint-disable-next-line no-explicit-any
    const r2 = { conditions: [{ dummy: 'd' }] } as any;
    expect(addRE(r2, { actionType: 'a' }, [0])).toBe(r2);
  });

  it('ignores invalid paths', () => {
    const r1 = { conditions: [], id: 'root' };

    // oxlint-disable-next-line no-explicit-any
    expect(addRE(r1, { actionType: 'a' }, 26 as any)).toBe(r1);
    expect(addRE(r1, { actionType: 'a' }, [1, 2])).toBe(r1);
  });
});

describe('updateRE', () => {
  it('updates a rules engine in a rules engine', () => {
    expect(
      updateRE(
        { conditions: [{ rules: [{ field: 'f', operator: '=', value: 'v' }] }], id: 'root' },
        'someProp',
        'initial value',
        [0]
      )
    ).toEqual({
      conditions: [
        { rules: [{ field: 'f', operator: '=', value: 'v' }], someProp: 'initial value' },
      ],
      id: 'root',
    });
  });

  it('updates a rule in a rules engine', () => {
    expect(
      updateRE(
        { conditions: [{ rules: [{ field: 'f', operator: '=', value: 'v' }] }], id: 'root' },
        'value',
        'new value',
        [0],
        [0]
      )
    ).toEqual({
      conditions: [{ rules: [{ field: 'f', operator: '=', value: 'new value' }] }],
      id: 'root',
    });
  });

  it('ignores invalid paths', () => {
    const r1 = { conditions: [], id: 'root' };

    // oxlint-disable-next-line no-explicit-any
    expect(updateRE(r1, 'value', 'new value', 26 as any)).toBe(r1);
    expect(updateRE(r1, 'value', 'new value', [1, 2])).toBe(r1);
  });
});

describe('removeRE', () => {
  it('removes a condition from a rules engine', () => {
    expect(
      removeRE(
        { conditions: [{ combinator: 'and', rules: [] }, { actionType: 'a' }], id: 'root' },
        [0]
      )
    ).toEqual({ conditions: [{ actionType: 'a' }], id: 'root' });
  });

  it('removes a rule from a nested condition', () => {
    expect(
      removeRE(
        {
          conditions: [{ combinator: 'and', rules: [{ field: 'f', operator: '=', value: 'v' }] }],
          id: 'root',
        },
        [0],
        [0]
      )
    ).toEqual({
      conditions: [{ combinator: 'and', rules: [] }],
      id: 'root',
    });
  });

  it('ignores root removal', () => {
    const r1 = { conditions: [], id: 'root' };
    expect(removeRE(r1, [])).toBe(r1);
  });

  it('ignores invalid paths', () => {
    const r1 = { conditions: [], id: 'root' };
    expect(removeRE(r1, [1, 2])).toBe(r1);
    expect(removeRE(r1, 'invalid-id')).toBe(r1);
  });
});

describe('moveRE', () => {
  it('moves a condition up', () => {
    expect(
      moveRE(
        {
          conditions: [
            { combinator: 'and', rules: [] },
            { combinator: 'or', rules: [] },
            { actionType: 'a' },
          ],
          id: 'root',
        },
        [1],
        'up'
      )
    ).toEqual({
      conditions: [
        { combinator: 'or', rules: [] },
        { combinator: 'and', rules: [] },
        { actionType: 'a' },
      ],
      id: 'root',
    });
  });

  it.skip('moves a condition down', () => {
    expect(
      moveRE(
        {
          conditions: [
            { combinator: 'and', rules: [] },
            { combinator: 'or', rules: [] },
            { actionType: 'a' },
          ],
          id: 'root',
        },
        [0],
        'down'
      )
    ).toEqual({
      conditions: [
        { combinator: 'or', rules: [] },
        { combinator: 'and', rules: [] },
        { actionType: 'a' },
      ],
      id: 'root',
    });
  });

  it.skip('moves a condition to specific path', () => {
    expect(
      moveRE(
        {
          conditions: [
            { combinator: 'and', rules: [] },
            { combinator: 'or', rules: [] },
            { combinator: 'xor', rules: [] },
          ],
          id: 'root',
        },
        [0],
        [2]
      )
    ).toEqual({
      conditions: [
        { combinator: 'or', rules: [] },
        { combinator: 'xor', rules: [] },
        { combinator: 'and', rules: [] },
      ],
      id: 'root',
    });
  });

  it('ignores moving to same location', () => {
    const r1: RulesEngine = {
      conditions: [{ combinator: 'and', rules: [] }, { actionType: 'a' }],
      id: 'root',
    };
    expect(moveRE(r1, [0], [0])).toBe(r1);
  });

  it('ignores invalid moves', () => {
    const r1 = {
      conditions: [{ combinator: 'and', rules: [] }],
      id: 'root',
    };
    expect(moveRE(r1, [0], 'up')).toBe(r1); // Can't move up from first position
    expect(moveRE(r1, [0], 'down')).toBe(r1); // Can't move down from last position

    const r2: RulesEngine = {
      conditions: [{ combinator: 'and', rules: [] }, { actionType: 'b' }],
      id: 'root',
    };
    expect(moveRE(r2, [1], 'up')).toBe(r2); // Can't move action up
    expect(moveRE(r2, [0], 'down')).toBe(r2); // Can't move rules engine below action
    expect(moveRE(r2, [1], [0])).toBe(r2); // Can't move action to non-last position
  });

  it('ignores root moves', () => {
    const r1 = { conditions: [], id: 'root' };
    expect(moveRE(r1, [], [1])).toBe(r1);
  });
});

describe('insertRE', () => {
  it('inserts a condition at specified path', () => {
    expect(
      insertRE(
        { conditions: [{ combinator: 'and', rules: [] }], id: 'root' },
        { combinator: 'or', rules: [] },
        [1]
      )
    ).toEqual({
      conditions: [
        { combinator: 'and', rules: [] },
        { combinator: 'or', rules: [] },
      ],
      id: 'root',
    });
  });

  it('inserts an action before existing action', () => {
    expect(
      insertRE(
        { conditions: [{ combinator: 'and', rules: [] }, { actionType: 'a' }], id: 'root' },
        { combinator: 'or', rules: [] },
        [2]
      )
    ).toEqual({
      conditions: [
        { combinator: 'and', rules: [] },
        { combinator: 'or', rules: [] },
        { actionType: 'a' },
      ],
      id: 'root',
    });
  });

  it('does not insert second action', () => {
    const r1: RulesEngine = {
      conditions: [{ combinator: 'and', rules: [] }, { actionType: 'a' }],
      id: 'root',
    };
    expect(insertRE(r1, { actionType: 'b' }, [1])).toBe(r1);
  });

  it('inserts rule into nested condition', () => {
    expect(
      insertRE(
        { conditions: [{ combinator: 'and', rules: [] }], id: 'root' },
        { field: 'f', operator: '=', value: 'v' },
        [0],
        [0]
      )
    ).toEqual({
      conditions: [{ combinator: 'and', rules: [{ id, field: 'f', operator: '=', value: 'v' }] }],
      id: 'root',
    });
  });

  it('ignores invalid insertions', () => {
    const r1 = { conditions: [], id: 'root' };
    expect(insertRE(r1, { field: 'f', operator: '=', value: 'v' }, [0])).toBe(r1);
  });
});

describe('groupRE', () => {
  it('groups rules within the same condition', () => {
    expect(
      groupRE(
        {
          conditions: [
            {
              combinator: 'and',
              rules: [
                { field: 'f1', operator: '=', value: 'v1' },
                { field: 'f2', operator: '=', value: 'v2' },
              ],
            },
          ],
          id: 'root',
        },
        [0],
        [0],
        [0],
        [1]
      )
    ).toEqual({
      conditions: [
        {
          combinator: 'and',
          rules: [
            {
              id,
              combinator: 'and',
              rules: [
                { id, field: 'f2', operator: '=', value: 'v2' },
                { id, field: 'f1', operator: '=', value: 'v1' },
              ],
            },
          ],
        },
      ],
      id: 'root',
    });
  });

  // TODO: Cross-condition grouping should work. This test as written should fail.
  it('ignores grouping across different conditions', () => {
    const r1 = {
      conditions: [
        { combinator: 'and', rules: [{ field: 'f1', operator: '=', value: 'v1' }] },
        { combinator: 'and', rules: [{ field: 'f2', operator: '=', value: 'v2' }] },
      ],
      id: 'root',
    };
    expect(groupRE(r1, [0], [0], [1], [0])).toBe(r1);
  });

  it('ignores invalid paths', () => {
    const r1 = { conditions: [], id: 'root' };
    expect(groupRE(r1, 'invalid1', [0], 'invalid2', [0])).toBe(r1);
  });

  it('ignores non-rule-group conditions', () => {
    const r1: RulesEngine = { conditions: [{ actionType: 'a' }], id: 'root' };
    expect(groupRE(r1, [0], [0], [0], [1])).toBe(r1);
  });
});

describe('error handling', () => {
  it('handles malformed rules engines gracefully', () => {
    // oxlint-disable-next-line no-explicit-any
    const malformed = { conditions: [{ invalid: 'data' }] } as any;

    expect(removeRE(malformed, [0])).toEqual({ conditions: [] });
    expect(moveRE(malformed, [0], 'up')).toBe(malformed);
    expect(insertRE(malformed, { actionType: 'a' }, [0])).toEqual({
      conditions: [{ actionType: 'a' }, { invalid: 'data' }],
    });
    expect(groupRE(malformed, [0], [0], [0], [1])).toBe(malformed);
  });
});
