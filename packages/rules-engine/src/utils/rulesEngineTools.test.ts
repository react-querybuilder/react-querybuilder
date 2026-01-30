import type { DefaultRuleType, Path } from '@react-querybuilder/core';
import { numericRegex } from '@react-querybuilder/core';
import { produce } from 'immer';
import type {
  Consequent,
  RECondition,
  REConditionIC,
  RulesEngine,
  RulesEngineAny,
  RulesEngineIC,
} from '../types';
import {
  addRE,
  addREInPlace,
  insertRE,
  insertREInPlace,
  moveRE,
  moveREInPlace,
  removeRE,
  removeREInPlace,
  updateRE,
  updateREInPlace,
} from './rulesEngineTools';

const stripIDs = (re: unknown) =>
  JSON.parse(
    JSON.stringify(re, (key, value) => (key === 'id' || key === 'path' ? undefined : value))
  );

const idGenerator = () => `${Math.random()}`;

const pathsAsIDs = (re: RulesEngineAny): RulesEngineAny => {
  // oxlint-disable-next-line no-explicit-any
  const addPathIDs = (obj: any, path: Path): any => {
    if (obj && typeof obj === 'object' && 'conditions' in obj) {
      return {
        ...obj,
        id: JSON.stringify(path),
        // oxlint-disable-next-line no-explicit-any
        conditions: obj.conditions.map((c: any, i: number) => addPathIDs(c, [...path, i])),
      };
    } else if (obj && typeof obj === 'object' && 'antecedent' in obj) {
      return {
        ...obj,
        id: JSON.stringify(path),
        antecedent: { ...obj.antecedent, id: JSON.stringify([...path, 'antecedent']) },
        ...(obj.conditions && {
          // oxlint-disable-next-line no-explicit-any
          conditions: obj.conditions.map((c: any, i: number) => addPathIDs(c, [...path, i])),
        }),
      };
    }
    return obj;
  };
  return addPathIDs(re, []);
};

const badPath: Path = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

// Sample rules
const [r1, r2, r3]: DefaultRuleType[] = (['=', '<', '>'] as const).map((operator, i) => ({
  field: `f${i + 1}`,
  operator,
  value: `v${i + 1}`,
}));

// Sample consequents
const c1: Consequent = { type: 'action', command: 'cmd1' };
const c2: Consequent = { type: 'action', command: 'cmd2' };

// Sample conditions
const cond1: RECondition = { antecedent: { combinator: 'and', rules: [r1] }, consequent: c1 };
const cond2: RECondition = { antecedent: { combinator: 'or', rules: [r2, r3] }, consequent: c2 };
const condIC1: REConditionIC = { antecedent: { rules: [r1] }, consequent: c1 };
const condIC2: REConditionIC = { antecedent: { rules: [r2, 'and', r3] }, consequent: c2 };

// Sample rules engines
const re1: RulesEngine = { conditions: [] };
const reIC1: RulesEngineIC = { conditions: [] };

// const re2: RulesEngine = { conditions: [cond1] };
// const reIC2: RulesEngineIC = { conditions: [condIC1] };

const re3: RulesEngine = { conditions: [cond1, cond2] };
// const reIC3: RulesEngineIC = { conditions: [condIC1, condIC2] };

const re1wID: RulesEngine = { id: '[]', ...re1 };
const reIC1wID: RulesEngineIC = { id: '[]', ...reIC1 };
const re3wIDs = pathsAsIDs(re3) as RulesEngine;
// const reIC3wIDs = pathsAsIDs(reIC3) as RulesEngineIC;

const testRET = (
  title: string,
  rulesEngine: RulesEngineAny,
  expectation: RulesEngineAny,
  exact?: boolean,
  only?: boolean
) => {
  (only ? it.only : it)(title, () => {
    if (exact) {
      expect(rulesEngine).toBe(expectation);
    } else {
      expect(stripIDs(rulesEngine)).toEqual(expectation);
    }
  });
};

const testLoop = [
  ['path', (x: Path) => x],
  ['id', (x: Path) => JSON.stringify(x)],
] as const;

describe('addRE', () => {
  describe.each(testLoop)('standard rules engine by %s', (_, p) => {
    testRET('adds a condition', addRE(re1wID, cond1, p([])), { conditions: [cond1] });
    testRET('adds another condition', addRE({ id: '[]', conditions: [cond1] }, cond2, p([])), {
      conditions: [cond1, cond2],
    });

    it('adds a condition with custom idGenerator', () => {
      const result = addRE(re1wID, cond1, p([]), { idGenerator });
      expect(result.conditions[0].id).toMatch(numericRegex);
    });
  });

  describe.each(testLoop)('independent combinators by %s', (_, p) => {
    testRET('adds a condition', addRE(reIC1wID, condIC1, p([])), { conditions: [condIC1] });
    testRET('adds another condition', addRE({ id: '[]', conditions: [condIC1] }, condIC2, p([])), {
      conditions: [condIC1, condIC2],
    });
  });

  describe.each(testLoop)('on bad %s', (_, p) => {
    testRET('bails out', addRE(re1, cond1, p(badPath)), re1, true);
  });

  // oxlint-disable-next-line no-explicit-any
  testRET('bails out on invalid condition', addRE(re1, {} as any, []), re1, true);

  describe('edge cases', () => {
    it('handles non-array conditions', () => {
      const reWithoutArray = { id: 'test' };
      // oxlint-disable-next-line no-explicit-any
      const result = addRE(reWithoutArray as any, cond1, []);
      expect(stripIDs(result.conditions[0])).toEqual(stripIDs(cond1));
    });

    it('handles missing parent condition', () => {
      const result = addRE(re1wID, cond1, [99]);
      expect(result).toBe(re1wID);
    });
  });
});

describe('removeRE', () => {
  describe.each(testLoop)('standard rules engine by %s', (_, p) => {
    testRET(
      'removes the first of two conditions',
      removeRE({ conditions: [{ ...cond1, id: '[0]' }, cond2] }, p([0])),
      { conditions: [cond2] }
    );
    testRET(
      'removes the second of three conditions',
      removeRE({ conditions: [cond1, { ...cond2, id: '[1]' }, cond1] }, p([1])),
      { conditions: [cond1, cond1] }
    );
    testRET('does not remove the root', removeRE(re1wID, p([])), re1wID, true);
  });

  describe.each(testLoop)('independent combinators by %s', (_, p) => {
    testRET('removes a condition', removeRE({ conditions: [{ ...condIC1, id: '[0]' }] }, p([0])), {
      conditions: [],
    });
    const tempREIC: RulesEngineIC = { conditions: [condIC1, { ...condIC2, id: '[1]' }] };
    testRET('removes the second of two conditions', removeRE(tempREIC, p([1])), {
      conditions: [condIC1],
    });
  });

  describe.each(testLoop)('on bad %s', (_, p) => {
    testRET('bails out', removeRE(re1, p(badPath)), re1, true);
  });

  describe('edge cases', () => {
    it('handles empty path', () => {
      const result = removeRE(re3wIDs, []);
      expect(result).toBe(re3wIDs);
    });

    it('handles invalid parent', () => {
      const result = removeRE(re3wIDs, [99]);
      expect(result).toBe(re3wIDs);
    });
  });
});

describe('updateRE', () => {
  describe.each(testLoop)('standard rules engine by %s', (_, p) => {
    it('updates root property', () => {
      const result = updateRE(re1wID, 'defaultConsequent', c1, p([]));
      expect(result.defaultConsequent).toEqual(c1);
    });

    it('bails out on bad path', () => {
      const result = updateRE(re1wID, 'value', 'test', p(badPath));
      expect(result).toBe(re1wID);
    });

    it('handles invalid condition path', () => {
      const result = updateRE(re3wIDs, 'test', 'value', p([99]));
      expect(result).toBe(re3wIDs);
    });
  });
});

describe('moveRE', () => {
  it('shifts the first condition down', () => {
    const result = moveRE(re3wIDs, [0], 'down');
    expect(stripIDs(result)).toEqual({ conditions: [cond2, cond1] });
  });

  it('shifts the last condition up', () => {
    const result = moveRE(re3wIDs, [1], 'up');
    expect(stripIDs(result)).toEqual({ conditions: [cond2, cond1] });
  });

  describe('clone', () => {
    it('clones when moving with clone option', () => {
      const result = moveRE(re3wIDs, [0], [1], { clone: true });
      expect(stripIDs(result)).toEqual({ conditions: [cond1, cond1, cond2] });
    });

    it('clones when moving down with clone option', () => {
      const result = moveRE(re3wIDs, [0], 'down', { clone: true });
      expect(stripIDs(result)).toEqual({ conditions: [cond1, cond1, cond2] });
    });

    it('uses custom idGenerator when cloning', () => {
      const idGenerator = () => 'custom-id';
      const result = moveRE(re3wIDs, [0], 'down', { clone: true, idGenerator });
      expect(result.conditions[1].id).toBe('custom-id');
    });
  });

  describe('explicit path moves', () => {
    it('moves from one explicit path to another', () => {
      const result = moveRE(re3wIDs, [0], [1]);
      expect(stripIDs(result)).toEqual({ conditions: [cond2, cond1] });
    });

    it('moves from explicit path beyond current position', () => {
      const re4: RulesEngine = { conditions: [cond1, cond2, cond1] };
      const re4wIDs = pathsAsIDs(re4) as RulesEngine;
      const result = moveRE(re4wIDs, [0], [2]);
      expect(stripIDs(result)).toEqual({ conditions: [cond2, cond1, cond1] });
    });

    it('applies path adjustment for explicit moves', () => {
      const re4: RulesEngine = { conditions: [cond1, cond2, cond1] };
      const re4wIDs = pathsAsIDs(re4) as RulesEngine;
      // Move first condition to position 2 should account for removal
      const result = moveRE(re4wIDs, [0], [2]);
      expect(stripIDs(result)).toEqual({ conditions: [cond2, cond1, cond1] });
    });
  });

  describe('nested structure moves', () => {
    it('moves condition within nested rules engine', () => {
      // Create a nested rules engine condition
      // const nestedRE: RulesEngine = { conditions: [cond1, cond2] };
      const nestedCondition: RECondition = {
        antecedent: { combinator: 'and', rules: [] },
        consequent: c1,
        conditions: [cond1, cond2],
      };
      // oxlint-disable-next-line no-explicit-any
      const reNested: RulesEngine = { conditions: [nestedCondition as any] };
      const reNestedwIDs = pathsAsIDs(reNested) as RulesEngine;

      const result = moveRE(reNestedwIDs, [0, 0], [0, 1]);
      expect(stripIDs(result.conditions[0].conditions)).toEqual([cond2, cond1]);
    });
  });

  describe('edge cases and validation', () => {
    it('handles moving with string ID instead of path', () => {
      const result = moveRE(re3wIDs, '[0]', '[1]');
      expect(stripIDs(result)).toEqual({ conditions: [cond2, cond1] });
    });

    it('handles moving from string ID to direction', () => {
      const result = moveRE(re3wIDs, '[0]', 'down');
      expect(stripIDs(result)).toEqual({ conditions: [cond2, cond1] });
    });

    it('bails when source ID not found', () => {
      const result = moveRE(re3wIDs, 'nonexistent', 'down');
      expect(result).toBe(re3wIDs);
    });

    it('bails when target ID not found', () => {
      const result = moveRE(re3wIDs, '[0]', 'nonexistent');
      expect(result).toBe(re3wIDs);
    });

    it('handles empty conditions array', () => {
      const emptyRE: RulesEngine = { conditions: [] };
      const result = moveRE(emptyRE, [0], 'down');
      expect(result).toBe(emptyRE);
    });

    it('handles single condition', () => {
      const singleRE: RulesEngine = { conditions: [cond1] };
      const singleREwID = pathsAsIDs(singleRE) as RulesEngine;
      const result = moveRE(singleREwID, [0], 'down');
      expect(result).toBe(singleREwID); // Can't move single item
    });

    it('bails when old path == new path', () => {
      const result = moveRE(re3wIDs, [1], [1]);
      expect(result).toBe(re3wIDs);
    });

    it('does not shift first condition up', () => {
      const result = moveRE(re3wIDs, [0], 'up');
      expect(result).toBe(re3wIDs);
    });

    it('does not shift last condition down', () => {
      const result = moveRE(re3wIDs, [1], 'down');
      expect(result).toBe(re3wIDs);
    });

    it('bails on bad path', () => {
      const result = moveRE(re1wID, [1], badPath);
      expect(result).toBe(re1wID);
    });

    it('bails on invalid old path', () => {
      const result = moveRE(re3wIDs, badPath, [0]);
      expect(result).toBe(re3wIDs);
    });

    it('bails on invalid old path down', () => {
      const result = moveRE(re3wIDs, badPath, 'down');
      expect(result).toBe(re3wIDs);
    });

    it('bails on empty old path', () => {
      const result = moveRE(re3wIDs, [], [0]);
      expect(result).toBe(re3wIDs);
    });
  });

  describe('complex scenarios', () => {
    it('moves condition to beginning of array', () => {
      const re4: RulesEngine = { conditions: [cond1, cond2, cond1] };
      const re4wIDs = pathsAsIDs(re4) as RulesEngine;
      const result = moveRE(re4wIDs, [2], [0]);
      expect(stripIDs(result)).toEqual({ conditions: [cond1, cond1, cond2] });
    });

    it('moves condition to end of array', () => {
      const re4: RulesEngine = { conditions: [cond1, cond2, cond1] };
      const re4wIDs = pathsAsIDs(re4) as RulesEngine;
      const result = moveRE(re4wIDs, [0], [2]);
      expect(stripIDs(result)).toEqual({ conditions: [cond2, cond1, cond1] });
    });

    it('handles multiple up/down moves correctly', () => {
      const re4: RulesEngine = { conditions: [cond1, cond2, cond1] };
      const re4wIDs = pathsAsIDs(re4) as RulesEngine;

      // Move last item up twice
      const result1 = moveRE(re4wIDs, [2], 'up'); // Should move to position 1
      const result1wIDs = pathsAsIDs(result1) as RulesEngine;
      const result2 = moveRE(result1wIDs, [1], 'up'); // Should move to position 0

      expect(stripIDs(result2)).toEqual({
        conditions: [cond1, cond1, cond2], // Last moved to first
      });
    });
  });
});

describe('insertRE', () => {
  it('inserts at first position on root path', () => {
    const result = insertRE(re1, cond1, []);
    expect(stripIDs(result)).toEqual({ ...re1, conditions: [cond1] });
  });

  it('inserts at given position', () => {
    const re: RulesEngine = { conditions: [cond1, cond2] };
    const condNew: RECondition = { antecedent: { combinator: 'and', rules: [r1] }, consequent: c1 };
    const result = insertRE(re, condNew, [1]);
    expect(stripIDs(result)).toEqual({ ...re, conditions: [cond1, condNew, cond2] });
  });

  it('replaces at given position', () => {
    const re: RulesEngine = { conditions: [cond1, cond2] };
    const condNew: RECondition = { antecedent: { combinator: 'and', rules: [r1] }, consequent: c1 };
    const result = insertRE(re, condNew, [1], { replace: true });
    expect(stripIDs(result)).toEqual({ ...re, conditions: [cond1, condNew] });
  });

  it('bails out on bad path', () => {
    const result = insertRE(re1, cond1, badPath);
    expect(result).toBe(re1);
  });

  it('handles missing parent', () => {
    const result = insertRE(re1, cond1, [99, 0]);
    expect(result).toBe(re1);
  });

  it('adds id if missing', () => {
    const condAsRE: REConditionIC = { antecedent: { rules: [] } };
    const result = insertRE(re1, condAsRE, [0]);
    expect(result.conditions[0].id).toBeDefined();
  });

  it('handles non-rules-engine subject', () => {
    const invalidSubject = { notARulesEngine: true };
    // oxlint-disable-next-line no-explicit-any
    const result = insertRE(re1, invalidSubject as any, [0]);
    expect(result.conditions).toEqual([]);
  });
});

describe('addREInPlace', () => {
  it('mutates the original rules engine', () => {
    const original: RulesEngine = { conditions: [] };
    const result = addREInPlace(original, cond1, []);
    expect(original).toBe(result);
  });
});

describe('updateREInPlace', () => {
  it('mutates the original rules engine', () => {
    const original: RulesEngine = { conditions: [{ ...cond1 }] };
    const result = updateREInPlace(original, 'id', 'newId', []);
    expect(original).toBe(result);
  });
});

describe('removeREInPlace', () => {
  it('mutates the original rules engine', () => {
    const original: RulesEngine = { conditions: [cond1, cond2] };
    const result = removeREInPlace(original, [0]);
    expect(original).toBe(result);
  });
});

describe('moveREInPlace', () => {
  it('mutates the original rules engine', () => {
    const original: RulesEngine = { conditions: [cond1, cond2] };
    const result = moveREInPlace(original, [0], [2]);
    expect(original).toBe(result);
  });

  it('handles cloning from a regular object', () => {
    const original: RulesEngine = { conditions: [cond1, cond2] };
    const result = moveREInPlace(original, [0], [2], { clone: true, idGenerator });
    expect(result.conditions.length).toBe(3);
    expect(result.conditions[2].id).toMatch(numericRegex);
  });

  it('handles cloning from within a draft', () => {
    const original: RulesEngine = { conditions: [cond1, cond2] };
    const result = produce(original, draft => {
      moveREInPlace(draft, [0], [2], { clone: true, idGenerator });
    });
    expect(result.conditions.length).toBe(3);
    expect(result.conditions[2].id).toMatch(numericRegex);
  });
});

describe('insertREInPlace', () => {
  it('mutates the original rules engine', () => {
    const original: RulesEngine = { conditions: [cond1] };
    const result = insertREInPlace(original, cond2, [0]);
    expect(original).toBe(result);
  });
});
