import { RuleGroupType, RuleGroupTypeAny, RuleGroupTypeIC, RuleType } from '../../types';
import { formatQuery } from '../formatQuery';
import { add, move, remove, update } from '../queryTools';

const stripIDs = (query: RuleGroupTypeAny) => JSON.parse(formatQuery(query, 'json_without_ids'));

const r1: RuleType = { field: 'f1', operator: '=', value: 'v1' };
const r2: RuleType = { field: 'f2', operator: '=', value: 'v2' };
const r3: RuleType = { field: 'f3', operator: '=', value: 'v3' };
const rg1: RuleGroupType = { combinator: 'and', rules: [] };
const rg2: RuleGroupType = { combinator: 'or', rules: [] };
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
      expect(stripIDs(update(rg3, 'field', 'fu', [0], {}))).toEqual({
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
      expect(stripIDs(update(rg3, 'operator', 'ou', [1], {}))).toEqual({
        combinator: 'and',
        rules: [r1, { ...r2, operator: 'ou' }, r3],
      });
      expect(stripIDs(update(rg3, 'operator', 'ou', [1], { resetOnOperatorChange: true }))).toEqual(
        {
          combinator: 'and',
          rules: [r1, { ...r2, operator: 'ou', value: '' }, r3],
        }
      );
      expect(stripIDs(update(rg3, 'value', 'vu', [2], {}))).toEqual({
        combinator: 'and',
        rules: [r1, r2, { ...r3, value: 'vu' }],
      });
    });

    it('updates groups', () => {
      // Root group
      expect(stripIDs(update(rg1, 'combinator', 'or', [], {}))).toEqual(rg2);
      expect(stripIDs(update(rg1, 'not', true, [], {}))).toEqual({ ...rg1, not: true });
      // Nested groups
      expect(
        stripIDs(update({ combinator: 'and', rules: [rg1] }, 'combinator', 'or', [0], {}))
      ).toEqual({
        combinator: 'and',
        rules: [rg2],
      });
      expect(stripIDs(update({ combinator: 'and', rules: [rg1] }, 'not', true, [0], {}))).toEqual({
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
    // TODO: more tests
    it('does not alter the query if the path ends in an even number', () => {
      expect(update(rgic2, 'combinator', 'or', [2], {})).toBe(rgic2);
    });
  });
});

describe('move', () => {
  describe('standard rule groups', () => {
    // TODO: more tests
    it('does not alter the query if the old and new paths are the same', () => {
      expect(move(rg3, [1], [1], {})).toBe(rg3);
    });
  });

  describe('independent combinators', () => {
    // TODO: more tests
  });
});
