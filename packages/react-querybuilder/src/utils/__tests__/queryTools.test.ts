import { RuleGroupType, RuleGroupTypeAny, RuleGroupTypeIC, RuleType } from '../../types';
import { formatQuery } from '../formatQuery';
import { add, move, remove, update } from '../queryTools';

const stripIDs = (query: RuleGroupTypeAny) => JSON.parse(formatQuery(query, 'json_without_ids'));

const [r1, r2, r3, r4, r5] = ['=', '<', '>', '<=', '>='].map<RuleType>((operator, i) => ({
  field: `f${i + 1}`,
  operator,
  value: `v${i + 1}`,
}));
const [rg1, rg2] = ['and', 'or'].map<RuleGroupType>(combinator => ({ combinator, rules: [] }));
const rg3: RuleGroupType = { combinator: 'and', rules: [r1, r2, r3] };
const rgic1: RuleGroupTypeIC = { rules: [] };
const rgic2: RuleGroupTypeIC = { rules: [r1, 'and', r2] };

describe('add', () => {
  describe('standard rule groups', () => {
    it('adds rules', () => {
      expect(stripIDs(add(rg1, r1, []))).toEqual({
        combinator: 'and',
        rules: [r1],
      });
      expect(stripIDs(add({ combinator: 'and', rules: [r1] }, r2, []))).toEqual({
        combinator: 'and',
        rules: [r1, r2],
      });
    });

    it('adds groups', () => {
      expect(stripIDs(add(rg1, rg2, []))).toEqual({
        combinator: 'and',
        rules: [{ ...rg2, not: false }],
      });
    });
  });

  describe('independent combinators', () => {
    it('adds rules', () => {
      expect(stripIDs(add(rgic1, r1, []))).toEqual({
        rules: [r1],
      });
      expect(stripIDs(add({ rules: [r1] }, r2, []))).toEqual({
        rules: [r1, 'and', r2],
      });
      expect(stripIDs(add({ rules: [r1, 'or', r2] }, r3, []))).toEqual({
        rules: [r1, 'or', r2, 'or', r3],
      });
    });

    it('adds groups', () => {
      expect(stripIDs(add(rgic1, rgic2, []))).toEqual({ rules: [{ ...rgic2, not: false }] });
    });
  });
});

describe('remove', () => {
  describe('standard rule groups', () => {
    it('removes rules', () => {
      expect(stripIDs(remove({ combinator: 'and', rules: [r1, r2] }, [0]))).toEqual({
        combinator: 'and',
        rules: [r2],
      });
      expect(stripIDs(remove({ combinator: 'and', rules: [r1, r2, r3] }, [1]))).toEqual({
        combinator: 'and',
        rules: [r1, r3],
      });
    });

    it('removes groups', () => {
      expect(stripIDs(remove({ combinator: 'and', rules: [r1, rg1] }, [1]))).toEqual({
        combinator: 'and',
        rules: [r1],
      });
    });

    it('does not remove the root group', () => {
      expect(remove(rg1, [])).toBe(rg1);
    });
  });

  describe('independent combinators', () => {
    it('removes rules', () => {
      expect(stripIDs(remove({ rules: [r1] }, [0]))).toEqual(rgic1);
      expect(stripIDs(remove(rgic2, [2]))).toEqual({
        rules: [r1],
      });
      expect(stripIDs(remove({ rules: [r1, 'and', r2, 'or', r3] }, [0]))).toEqual({
        rules: [r2, 'or', r3],
      });
      expect(stripIDs(remove({ rules: [r1, 'and', r2, 'or', r3] }, [2]))).toEqual({
        rules: [r1, 'or', r3],
      });
      expect(stripIDs(remove({ rules: [r1, 'and', r2, 'or', r3] }, [4]))).toEqual({
        rules: [r1, 'and', r2],
      });
    });

    it('removes groups', () => {
      expect(stripIDs(remove({ rules: [rgic1, 'and', rgic2] }, [0]))).toEqual({
        rules: [rgic2],
      });
    });

    it('does not remove the root group', () => {
      expect(remove(rgic1, [])).toBe(rgic1);
    });

    it('does not remove independent combinators', () => {
      expect(remove(rgic2, [1])).toBe(rgic2);
    });
  });
});

describe('update', () => {
  describe('standard rule groups', () => {
    it('updates rules', () => {
      expect(stripIDs(update(rg3, 'field', 'fu', [0]))).toEqual({
        combinator: 'and',
        rules: [{ ...r1, field: 'fu', value: '' }, r2, r3],
      });
      expect(
        stripIDs(
          update(
            { combinator: 'and', rules: [{ field: 'f1', operator: '<', value: 'v1' }] },
            'field',
            'fu',
            [0],
            {}
          )
        )
      ).toEqual({
        combinator: 'and',
        rules: [{ ...r1, field: 'fu', value: '' }],
      });
      expect(stripIDs(update(rg3, 'field', 'fu', [0], { resetOnFieldChange: false }))).toEqual({
        combinator: 'and',
        rules: [{ ...r1, field: 'fu' }, r2, r3],
      });
      expect(stripIDs(update(rg3, 'operator', 'ou', [1]))).toEqual({
        combinator: 'and',
        rules: [r1, { ...r2, operator: 'ou' }, r3],
      });
      expect(stripIDs(update(rg3, 'operator', 'ou', [1], { resetOnOperatorChange: true }))).toEqual(
        {
          combinator: 'and',
          rules: [r1, { ...r2, operator: 'ou', value: '' }, r3],
        }
      );
      expect(stripIDs(update(rg3, 'value', 'vu', [2]))).toEqual({
        combinator: 'and',
        rules: [r1, r2, { ...r3, value: 'vu' }],
      });
    });

    it('updates groups', () => {
      expect(stripIDs(update(rg1, 'combinator', 'or', []))).toEqual(rg2);
      expect(stripIDs(update(rg1, 'not', true, []))).toEqual({ ...rg1, not: true });
      expect(
        stripIDs(update({ combinator: 'and', rules: [rg1] }, 'combinator', 'or', [0]))
      ).toEqual({
        combinator: 'and',
        rules: [rg2],
      });
      expect(stripIDs(update({ combinator: 'and', rules: [rg1] }, 'not', true, [0]))).toEqual({
        combinator: 'and',
        rules: [{ ...rg1, not: true }],
      });
    });

    it('does not reset operator or value when the value is the same', () => {
      expect(update(rg3, 'field', 'f1', [0], { resetOnFieldChange: true })).toBe(rg3);
      expect(update(rg3, 'operator', '=', [0], { resetOnOperatorChange: true })).toBe(rg3);
    });
  });

  describe('independent combinators', () => {
    it('updates combinators', () => {
      expect(stripIDs(update(rgic2, 'combinator', 'or', [1]))).toEqual({ rules: [r1, 'or', r2] });
    });

    it('does not alter the query if the path ends in an even number', () => {
      expect(update(rgic2, 'combinator', 'or', [2])).toBe(rgic2);
    });
  });
});

describe('move', () => {
  describe('standard rule groups', () => {
    it('moves a rule down within the same group', () => {
      expect(
        stripIDs(
          move(
            {
              combinator: 'and',
              rules: [r1, r2],
            },
            [0],
            [2]
          )
        )
      ).toEqual({ combinator: 'and', rules: [r2, r1] });
    });

    it('moves a rule to a different group with a common ancestor', () => {
      expect(stripIDs(move({ combinator: 'and', rules: [r1, r2, rg1] }, [1], [2, 0]))).toEqual({
        combinator: 'and',
        rules: [r1, { ...rg1, rules: [r2] }],
      });
    });

    it("moves a rule up to its parent group's parent group", () => {
      expect(stripIDs(move({ combinator: 'and', rules: [rg3] }, [0, 1], [0]))).toEqual({
        combinator: 'and',
        rules: [r2, { combinator: 'and', rules: [r1, r3] }],
      });
    });

    it('moves a rule up to another group', () => {
      expect(
        stripIDs(
          move(
            {
              combinator: 'and',
              rules: [
                { combinator: 'and', rules: [r1] },
                { combinator: 'and', rules: [r2, r3] },
              ],
            },
            [1, 1],
            [0, 1]
          )
        )
      ).toEqual({
        combinator: 'and',
        rules: [
          { combinator: 'and', rules: [r1, r3] },
          { combinator: 'and', rules: [r2] },
        ],
      });
    });

    it('clones rules', () => {
      expect(stripIDs(move(rg3, [1], [0], { clone: true }))).toEqual({
        combinator: 'and',
        rules: [r2, r1, r2, r3],
      });
    });

    it('clones groups', () => {
      expect(
        stripIDs(move({ combinator: 'and', rules: [r1, rg3, r2] }, [1], [0], { clone: true }))
      ).toEqual({
        combinator: 'and',
        rules: [rg3, r1, rg3, r2],
      });
    });

    it('does not alter the query if the old and new paths are the same', () => {
      expect(move(rg3, [1], [1])).toBe(rg3);
    });
  });

  describe('independent combinators', () => {
    it('swaps the first rule with the last within the same group', () => {
      expect(stripIDs(move(rgic2, [0], [3]))).toEqual({ rules: [r2, 'and', r1] });
    });

    it('swaps the last rule with the first within the same group', () => {
      expect(stripIDs(move(rgic2, [2], [0]))).toEqual({ rules: [r2, 'and', r1] });
    });

    it('moves a rule from first to last within the same group', () => {
      expect(stripIDs(move({ rules: [r1, 'and', r2, 'or', r3] }, [0], [5]))).toEqual({
        rules: [r2, 'or', r3, 'or', r1],
      });
    });

    it('moves a rule from last to first within the same group', () => {
      expect(stripIDs(move({ rules: [r1, 'and', r2, 'or', r3] }, [4], [0]))).toEqual({
        rules: [r3, 'and', r1, 'and', r2],
      });
    });

    it('moves a rule from last to middle by dropping on inline combinator', () => {
      expect(stripIDs(move({ rules: [r1, 'and', r2, 'or', r3] }, [4], [1]))).toEqual({
        rules: [r1, 'or', r3, 'and', r2],
      });
    });

    it('moves a first-child rule to a different group as the first child', () => {
      expect(
        stripIDs(move({ rules: [r1, 'and', { rules: [r2, 'and', r3] }] }, [0], [2, 0]))
      ).toEqual({
        rules: [{ rules: [r1, 'and', r2, 'and', r3] }],
      });
    });

    it('moves a middle-child rule to a different group as a middle child', () => {
      expect(
        stripIDs(
          move(
            { rules: [r1, 'and', r2, 'and', r3, 'and', { rules: [r4, 'and', r5] }] },
            [2],
            [6, 1]
          )
        )
      ).toEqual({
        rules: [r1, 'and', r3, 'and', { rules: [r4, 'and', r2, 'and', r5] }],
      });
    });

    it('moves an only-child rule up to a different group with only one existing child', () => {
      expect(
        stripIDs(move({ rules: [{ rules: [r1] }, 'and', { rules: [r2] }] }, [2, 0], [0, 1]))
      ).toEqual({
        rules: [{ rules: [r1, 'and', r2] }, 'and', { rules: [] }],
      });
      expect(
        stripIDs(move({ rules: [{ rules: [r1] }, 'and', { rules: [r2] }] }, [2, 0], [0, 0]))
      ).toEqual({
        rules: [{ rules: [r2, 'and', r1] }, 'and', { rules: [] }],
      });
    });

    it('moves a middle-child rule up to a different group with only one existing child', () => {
      expect(
        stripIDs(
          move(
            { rules: [{ rules: [r1] }, 'and', { rules: [r2, 'and', r3, 'and', r4] }] },
            [2, 2],
            [0, 1]
          )
        )
      ).toEqual({
        rules: [{ rules: [r1, 'and', r3] }, 'and', { rules: [r2, 'and', r4] }],
      });
    });

    it('does not alter the query if the old path is to a combinator', () => {
      expect(move(rgic2, [1], [0])).toBe(rgic2);
    });
  });
});
