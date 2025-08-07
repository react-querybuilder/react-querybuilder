import { addRE } from './rulesEngineTools';

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
