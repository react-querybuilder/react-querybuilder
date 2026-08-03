import { LogType } from '../defaults';
import type { RuleGroupType, RuleGroupTypeIC, RuleType } from '../types';
import { createQueryActions } from './queryActions';

const rule = (field = 'f1', value = 'v1'): RuleType => ({ field, operator: '=', value });

const query = (): RuleGroupType => ({
  id: 'root',
  combinator: 'and',
  rules: [
    { id: 'r1', ...rule() },
    { id: 'r2', ...rule('f2', 'v2') },
  ],
});

const withDisabled = (): RuleGroupType => ({
  id: 'root',
  combinator: 'and',
  rules: [
    { id: 'r1', ...rule(), disabled: true },
    { id: 'r2', ...rule('f2', 'v2') },
  ],
});

describe('createQueryActions', () => {
  describe('addRule', () => {
    it('adds a rule', () => {
      const result = createQueryActions().addRule(query(), rule('f3'), []);
      expect(result.rules).toHaveLength(3);
    });

    it('aborts when the parent is disabled', () => {
      const q: RuleGroupType = {
        combinator: 'and',
        rules: [{ id: 'g1', combinator: 'and', disabled: true, rules: [] }],
      };
      expect(createQueryActions().addRule(q, rule(), [0])).toBeUndefined();
    });

    it('aborts when the whole query is disabled', () => {
      expect(
        createQueryActions({ queryDisabled: true }).addRule(query(), rule(), [])
      ).toBeUndefined();
    });

    it('can ignore the query\u2019s disabled properties', () => {
      const q: RuleGroupType = {
        combinator: 'and',
        rules: [{ id: 'g1', combinator: 'and', disabled: true, rules: [] }],
      };
      const result = createQueryActions({ respectDisabled: false }).addRule(q, rule(), [0]);
      expect((result.rules[0] as RuleGroupType).rules).toHaveLength(1);
    });

    it('aborts when onAddRule declines', () => {
      const onAddRule = vi.fn(() => false);
      expect(createQueryActions({ onAddRule }).addRule(query(), rule(), [])).toBeUndefined();
      expect(onAddRule).toHaveBeenCalled();
    });

    it('proceeds when onAddRule returns true', () => {
      const result = createQueryActions({ onAddRule: () => true }).addRule(query(), rule('f3'), []);
      expect(result.rules).toHaveLength(3);
    });

    it('adds the replacement rule when onAddRule returns one', () => {
      const replacement = { ...rule('replaced'), id: 'x' };
      const result = createQueryActions({ onAddRule: () => replacement }).addRule(
        query(),
        rule('f3'),
        []
      );
      expect((result.rules[2] as RuleType).field).toBe('replaced');
    });

    it('honors combinatorPreceding for independent combinators', () => {
      const q: RuleGroupTypeIC = { rules: [{ id: 'r1', ...rule() }] };
      const result = createQueryActions().addRule(
        q,
        { ...rule('f3'), combinatorPreceding: 'or' } as RuleType,
        []
      );
      expect(result.rules[1]).toBe('or');
    });
  });

  describe('addGroup', () => {
    const newGroup = (): RuleGroupType => ({ combinator: 'and', rules: [] });

    it('adds a group', () => {
      expect(createQueryActions().addGroup(query(), newGroup(), []).rules).toHaveLength(3);
    });

    it('aborts beyond maxLevels without logging', () => {
      const onLog = vi.fn();
      expect(
        createQueryActions({ maxLevels: 0, onLog }).addGroup(query(), newGroup(), [])
      ).toBeUndefined();
      expect(onLog).not.toHaveBeenCalled();
    });

    it('allows groups within maxLevels', () => {
      expect(
        createQueryActions({ maxLevels: 1 }).addGroup(query(), newGroup(), []).rules
      ).toHaveLength(3);
    });

    it('honors combinatorPreceding for independent combinators', () => {
      const q: RuleGroupTypeIC = { rules: [{ id: 'r1', ...rule() }] };
      const result = createQueryActions().addGroup(
        q,
        { rules: [], combinatorPreceding: 'or' } as RuleGroupTypeIC,
        []
      );
      expect(result.rules[1]).toBe('or');
    });

    it('aborts when onAddGroup declines', () => {
      expect(
        createQueryActions({ onAddGroup: () => false }).addGroup(query(), newGroup(), [])
      ).toBeUndefined();
    });

    it('adds the replacement group when onAddGroup returns one', () => {
      const replacement: RuleGroupType = { id: 'g9', combinator: 'or', rules: [] };
      const result = createQueryActions({ onAddGroup: () => replacement }).addGroup(
        query(),
        newGroup(),
        []
      );
      expect((result.rules[2] as RuleGroupType).combinator).toBe('or');
    });
  });

  describe('propChange', () => {
    it('updates a property', () => {
      const result = createQueryActions().propChange(query(), 'value', 'new', [0]);
      expect((result.rules[0] as RuleType).value).toBe('new');
    });

    it('aborts for a disabled rule', () => {
      expect(createQueryActions().propChange(withDisabled(), 'value', 'x', [0])).toBeUndefined();
    });

    it('always allows re-enabling a disabled rule', () => {
      const result = createQueryActions().propChange(withDisabled(), 'disabled', false, [0]);
      expect((result.rules[0] as RuleType).disabled).toBe(false);
    });

    it('blocks even a disabled change when the query is disabled', () => {
      expect(
        createQueryActions({ queryDisabled: true }).propChange(
          withDisabled(),
          'disabled',
          false,
          [0]
        )
      ).toBeUndefined();
    });

    it('passes the reset options through', () => {
      const result = createQueryActions({
        resetOnOperatorChange: true,
        getRuleDefaultValue: () => 'reset',
      }).propChange(query(), 'operator', 'contains', [0]);
      expect((result.rules[0] as RuleType).value).toBe('reset');
    });
  });

  describe('removeRuleOrGroup', () => {
    it('removes the target', () => {
      expect(createQueryActions().removeRuleOrGroup(query(), [0]).rules).toHaveLength(1);
    });

    it('aborts for a disabled target', () => {
      expect(createQueryActions().removeRuleOrGroup(withDisabled(), [0])).toBeUndefined();
    });

    it('aborts when onRemove declines', () => {
      expect(
        createQueryActions({ onRemove: () => false }).removeRuleOrGroup(query(), [0])
      ).toBeUndefined();
    });

    it('proceeds when onRemove approves', () => {
      const onRemove = vi.fn(() => true);
      expect(createQueryActions({ onRemove }).removeRuleOrGroup(query(), [0]).rules).toHaveLength(
        1
      );
      expect(onRemove).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'r1' }),
        [0],
        expect.anything(),
        undefined
      );
    });
  });

  describe('moveRule', () => {
    it('moves the target', () => {
      const result = createQueryActions().moveRule(query(), [0], [2]);
      expect((result.rules[1] as RuleType).id).toBe('r1');
    });

    it('aborts for a disabled target', () => {
      expect(createQueryActions().moveRule(withDisabled(), [0], [2])).toBeUndefined();
    });

    it('aborts when the callback declines', () => {
      expect(
        createQueryActions({ onMoveRule: () => false }).moveRule(query(), [0], [2])
      ).toBeUndefined();
    });

    it('computes the prospective query before consulting the callback', () => {
      const onMoveRule = vi.fn(() => true);
      createQueryActions({ onMoveRule }).moveRule(query(), [0], [2], true, 'ctx');
      const [ruleOrGroup, oldPath, newPath, q, nextQuery, misc, context] = onMoveRule.mock
        .calls[0] as unknown[];
      expect((ruleOrGroup as RuleType).id).toBe('r1');
      expect(oldPath).toEqual([0]);
      expect(newPath).toEqual([2]);
      expect((q as RuleGroupType).rules).toHaveLength(2);
      expect((nextQuery as RuleGroupType).rules).toHaveLength(3);
      expect(misc).toMatchObject({ clone: true });
      expect(context).toBe('ctx');
    });

    it('applies a replacement query returned by the callback', () => {
      const replacement: RuleGroupType = { combinator: 'or', rules: [] };
      expect(
        createQueryActions({ onMoveRule: () => replacement }).moveRule(query(), [0], [2])
      ).toBe(replacement);
    });

    it('aborts on an unresolvable source path, without invoking the callback', () => {
      const onMoveRule = vi.fn(() => true);
      expect(createQueryActions({ onMoveRule }).moveRule(query(), [99], [0])).toBeUndefined();
      expect(onMoveRule).not.toHaveBeenCalled();
    });

    it('uses onMoveGroup for groups', () => {
      const q: RuleGroupType = {
        combinator: 'and',
        rules: [
          { id: 'g1', combinator: 'and', rules: [] },
          { id: 'r2', ...rule() },
        ],
      };
      const onMoveGroup = vi.fn(() => true);
      const onMoveRule = vi.fn(() => true);
      createQueryActions({ onMoveGroup, onMoveRule }).moveRule(q, [0], [2]);
      expect(onMoveGroup).toHaveBeenCalled();
      expect(onMoveRule).not.toHaveBeenCalled();
    });
  });

  describe('groupRule', () => {
    it('groups the source into the target', () => {
      const result = createQueryActions().groupRule(query(), [0], [1]);
      expect((result.rules[0] as RuleGroupType).rules).toHaveLength(2);
    });

    it('aborts for a disabled source', () => {
      expect(createQueryActions().groupRule(withDisabled(), [0], [1])).toBeUndefined();
    });

    it('aborts when the callback declines', () => {
      expect(
        createQueryActions({ onGroupRule: () => false }).groupRule(query(), [0], [1])
      ).toBeUndefined();
    });

    it('applies a replacement query returned by the callback', () => {
      const replacement: RuleGroupType = { combinator: 'or', rules: [] };
      expect(
        createQueryActions({ onGroupRule: () => replacement }).groupRule(query(), [0], [1])
      ).toBe(replacement);
    });

    it('aborts on an unresolvable source path, without invoking the callback', () => {
      const onGroupRule = vi.fn(() => true);
      expect(createQueryActions({ onGroupRule }).groupRule(query(), [99], [0])).toBeUndefined();
      expect(onGroupRule).not.toHaveBeenCalled();
    });

    it('uses onGroupGroup for groups', () => {
      const q: RuleGroupType = {
        combinator: 'and',
        rules: [
          { id: 'g1', combinator: 'and', rules: [] },
          { id: 'r2', ...rule() },
        ],
      };
      const onGroupGroup = vi.fn(() => true);
      const onGroupRule = vi.fn(() => true);
      createQueryActions({ onGroupGroup, onGroupRule }).groupRule(q, [0], [1]);
      expect(onGroupGroup).toHaveBeenCalled();
      expect(onGroupRule).not.toHaveBeenCalled();
    });
  });

  describe('logging', () => {
    const logTypes = (onLog: ReturnType<typeof vi.fn>) =>
      onLog.mock.calls.map(c => (c[0] as { type: string }).type);

    it('includes the qbId in every payload', () => {
      const onLog = vi.fn();
      createQueryActions({ qbId: 'qb1', onLog }).addRule(query(), rule(), []);
      expect(onLog).toHaveBeenCalledWith(expect.objectContaining({ qbId: 'qb1' }));
    });

    it.each([
      [
        'add',
        (a: ReturnType<typeof createQueryActions>) => a.addRule(query(), rule(), []),
        LogType.add,
      ],
      [
        'update',
        (a: ReturnType<typeof createQueryActions>) => a.propChange(query(), 'value', 'x', [0]),
        LogType.update,
      ],
      [
        'remove',
        (a: ReturnType<typeof createQueryActions>) => a.removeRuleOrGroup(query(), [0]),
        LogType.remove,
      ],
      [
        'move',
        (a: ReturnType<typeof createQueryActions>) => a.moveRule(query(), [0], [2]),
        LogType.move,
      ],
      [
        'group',
        (a: ReturnType<typeof createQueryActions>) => a.groupRule(query(), [0], [1]),
        LogType.group,
      ],
    ])('logs %s on success', (_label, run, expected) => {
      const onLog = vi.fn();
      run(createQueryActions({ onLog }));
      expect(logTypes(onLog)).toContain(expected);
    });

    it.each([
      [
        'parentPathDisabled',
        (a: ReturnType<typeof createQueryActions>) => a.addRule(withDisabled(), rule(), [0]),
        LogType.parentPathDisabled,
      ],
      [
        'pathDisabled',
        (a: ReturnType<typeof createQueryActions>) => a.removeRuleOrGroup(withDisabled(), [0]),
        LogType.pathDisabled,
      ],
    ])('logs %s when blocked', (_label, run, expected) => {
      const onLog = vi.fn();
      run(createQueryActions({ onLog }));
      expect(logTypes(onLog)).toContain(expected);
    });

    it('logs pathDisabled for a blocked propChange, move, and group', () => {
      const onLog = vi.fn();
      const a = createQueryActions({ onLog });
      a.propChange(withDisabled(), 'value', 'x', [0]);
      a.moveRule(withDisabled(), [0], [2]);
      a.groupRule(withDisabled(), [0], [1]);
      expect(logTypes(onLog)).toEqual([
        LogType.pathDisabled,
        LogType.pathDisabled,
        LogType.pathDisabled,
      ]);
    });

    it('logs parentPathDisabled for a blocked addGroup', () => {
      const onLog = vi.fn();
      createQueryActions({ onLog, queryDisabled: true }).addGroup(
        query(),
        { combinator: 'and', rules: [] },
        []
      );
      expect(logTypes(onLog)).toEqual([LogType.parentPathDisabled]);
    });

    it.each([
      [
        'onAddRuleFalse',
        { onAddRule: () => false },
        (a: ReturnType<typeof createQueryActions>) => a.addRule(query(), rule(), []),
        LogType.onAddRuleFalse,
      ],
      [
        'onAddGroupFalse',
        { onAddGroup: () => false },
        (a: ReturnType<typeof createQueryActions>) =>
          a.addGroup(query(), { combinator: 'and', rules: [] }, []),
        LogType.onAddGroupFalse,
      ],
      [
        'onRemoveFalse',
        { onRemove: () => false },
        (a: ReturnType<typeof createQueryActions>) => a.removeRuleOrGroup(query(), [0]),
        LogType.onRemoveFalse,
      ],
      [
        'onMoveRuleFalse',
        { onMoveRule: () => false },
        (a: ReturnType<typeof createQueryActions>) => a.moveRule(query(), [0], [2]),
        LogType.onMoveRuleFalse,
      ],
      [
        'onGroupRuleFalse',
        { onGroupRule: () => false },
        (a: ReturnType<typeof createQueryActions>) => a.groupRule(query(), [0], [1]),
        LogType.onGroupRuleFalse,
      ],
    ])('logs %s when the callback declines', (_label, config, run, expected) => {
      const onLog = vi.fn();
      run(createQueryActions({ ...config, onLog }));
      expect(logTypes(onLog)).toContain(expected);
    });

    it('logs onMoveGroupFalse and onGroupGroupFalse for groups', () => {
      const q: RuleGroupType = {
        combinator: 'and',
        rules: [
          { id: 'g1', combinator: 'and', rules: [] },
          { id: 'r2', ...rule() },
        ],
      };
      const onLog = vi.fn();
      createQueryActions({ onMoveGroup: () => false, onLog }).moveRule(q, [0], [2]);
      createQueryActions({ onGroupGroup: () => false, onLog }).groupRule(q, [0], [1]);
      expect(logTypes(onLog)).toEqual([LogType.onMoveGroupFalse, LogType.onGroupGroupFalse]);
    });

    it('does not require an onLog callback', () => {
      expect(() => createQueryActions().addRule(query(), rule(), [])).not.toThrow();
    });
  });
  describe('disabledPaths', () => {
    const nested = (): RuleGroupType => ({
      id: 'root',
      combinator: 'and',
      rules: [
        { id: 'r1', ...rule() },
        { id: 'g1', combinator: 'or', rules: [{ id: 'r2', ...rule('f2', 'v2') }] },
      ],
    });
    const actions = createQueryActions({ disabledPaths: [[1]] });

    it('aborts a mutation targeting a listed path', () => {
      expect(actions.propChange(nested(), 'combinator', 'and', [1])).toBeUndefined();
      expect(actions.removeRuleOrGroup(nested(), [1])).toBeUndefined();
      expect(actions.moveRule(nested(), [1], [0])).toBeUndefined();
      expect(actions.groupRule(nested(), [1], [0])).toBeUndefined();
    });

    it('aborts adding to a listed path', () => {
      expect(actions.addRule(nested(), rule('f3'), [1])).toBeUndefined();
      expect(actions.addGroup(nested(), { combinator: 'and', rules: [] }, [1])).toBeUndefined();
    });

    it('aborts a mutation targeting a descendant of a listed path', () => {
      expect(actions.propChange(nested(), 'value', 'x', [1, 0])).toBeUndefined();
    });

    it('allows mutations elsewhere', () => {
      expect(actions.propChange(nested(), 'value', 'x', [0])).toBeDefined();
    });

    it('still allows re-enabling a path-disabled node', () => {
      const result = actions.propChange(nested(), 'disabled', false, [1]);
      expect((result.rules[1] as RuleGroupType).disabled).toBe(false);
    });

    it('is ignored when respectDisabled is false', () => {
      const unguarded = createQueryActions({ disabledPaths: [[1]], respectDisabled: false });
      expect(unguarded.propChange(nested(), 'combinator', 'and', [1])).toBeDefined();
    });

    it('logs the same way a `disabled` property does', () => {
      const onLog = vi.fn();
      createQueryActions({ disabledPaths: [[1]], onLog }).removeRuleOrGroup(nested(), [1]);
      expect(onLog).toHaveBeenCalledWith(expect.objectContaining({ type: LogType.pathDisabled }));
    });
  });
});
