import type { DraggedItem, RuleGroupType, RuleType } from 'react-querybuilder';
import { computeDestinationFromQuadrant, computeShadowQuery } from './shadowQuery';

// #region Test data

const rule1: RuleType = { field: 'f1', operator: '=', value: 'v1' };
const rule2: RuleType = { field: 'f2', operator: '=', value: 'v2' };
const rule3: RuleType = { field: 'f3', operator: '=', value: 'v3' };
const rule4: RuleType = { field: 'f4', operator: '=', value: 'v4' };

const baseQuery: RuleGroupType = { combinator: 'and', rules: [rule1, rule2, rule3] };

const nestedQuery: RuleGroupType = {
  combinator: 'and',
  rules: [rule1, { combinator: 'or', rules: [rule2, rule3] }],
};

const twoGroupsQuery: RuleGroupType = {
  combinator: 'and',
  rules: [
    { combinator: 'or', rules: [rule1, rule2] },
    { combinator: 'or', rules: [rule3, rule4] },
  ],
};

const createDragItem = (path: number[], rule: RuleType = rule1): DraggedItem =>
  ({ ...rule, path, qbId: 'qb1' }) as DraggedItem;

// #endregion

describe('computeDestinationFromQuadrant', () => {
  it('returns first child path for ruleGroup target', () => {
    expect(computeDestinationFromQuadrant([0, 1], 'ruleGroup', 'upper')).toEqual([0, 1, 0]);
    expect(computeDestinationFromQuadrant([0, 1], 'ruleGroup', 'lower')).toEqual([0, 1, 0]);
  });

  it('returns same index for rule target with upper quadrant', () => {
    expect(computeDestinationFromQuadrant([0, 2], 'rule', 'upper')).toEqual([0, 2]);
  });

  it('returns index + 1 for rule target with lower quadrant', () => {
    expect(computeDestinationFromQuadrant([0, 2], 'rule', 'lower')).toEqual([0, 3]);
  });

  it('handles root-level paths', () => {
    expect(computeDestinationFromQuadrant([1], 'rule', 'upper')).toEqual([1]);
    expect(computeDestinationFromQuadrant([1], 'rule', 'lower')).toEqual([2]);
  });

  it('handles deeply nested paths', () => {
    expect(computeDestinationFromQuadrant([0, 1, 2, 3], 'rule', 'upper')).toEqual([0, 1, 2, 3]);
    expect(computeDestinationFromQuadrant([0, 1, 2, 3], 'rule', 'lower')).toEqual([0, 1, 2, 4]);
  });
});

describe('computeShadowQuery', () => {
  it('returns null for a no-op move (same position)', () => {
    const result = computeShadowQuery({
      originalQuery: baseQuery,
      draggedItem: createDragItem([1], rule2),
      draggedPath: [1],
      targetPath: [1],
      targetType: 'rule',
      quadrant: 'upper',
      dropEffect: 'move',
      groupItems: false,
    });
    expect(result).toBeNull();
  });

  it('returns null for a no-op move (position + 1)', () => {
    const result = computeShadowQuery({
      originalQuery: baseQuery,
      draggedItem: createDragItem([1], rule2),
      draggedPath: [1],
      targetPath: [1],
      targetType: 'rule',
      quadrant: 'lower',
      dropEffect: 'move',
      groupItems: false,
    });
    expect(result).toBeNull();
  });

  it('moves a rule from last to first via upper quadrant', () => {
    const result = computeShadowQuery({
      originalQuery: baseQuery,
      draggedItem: createDragItem([2], rule3),
      draggedPath: [2],
      targetPath: [0],
      targetType: 'rule',
      quadrant: 'upper',
      dropEffect: 'move',
      groupItems: false,
    });
    expect(result).not.toBeNull();
    expect((result!.shadowQuery as RuleGroupType).rules).toHaveLength(3);
    expect((result!.shadowQuery as RuleGroupType).rules[0]).toMatchObject({ field: 'f3' });
  });

  it('moves a rule from first to last via lower quadrant', () => {
    const result = computeShadowQuery({
      originalQuery: baseQuery,
      draggedItem: createDragItem([0], rule1),
      draggedPath: [0],
      targetPath: [2],
      targetType: 'rule',
      quadrant: 'lower',
      dropEffect: 'move',
      groupItems: false,
    });
    expect(result).not.toBeNull();
    expect((result!.shadowQuery as RuleGroupType).rules).toHaveLength(3);
    expect((result!.shadowQuery as RuleGroupType).rules[2]).toMatchObject({ field: 'f1' });
  });

  it('copies a rule (clone) preserving the original', () => {
    const result = computeShadowQuery({
      originalQuery: baseQuery,
      draggedItem: createDragItem([0], rule1),
      draggedPath: [0],
      targetPath: [2],
      targetType: 'rule',
      quadrant: 'lower',
      dropEffect: 'copy',
      groupItems: false,
    });
    expect(result).not.toBeNull();
    // Original stays, copy is added
    expect((result!.shadowQuery as RuleGroupType).rules).toHaveLength(4);
  });

  it('moves a rule into a group via ruleGroup target', () => {
    const result = computeShadowQuery({
      originalQuery: nestedQuery,
      draggedItem: createDragItem([0], rule1),
      draggedPath: [0],
      targetPath: [1],
      targetType: 'ruleGroup',
      quadrant: 'upper',
      dropEffect: 'move',
      groupItems: false,
    });
    expect(result).not.toBeNull();
    // rule1 moved into the nested group as first child
    const q = result!.shadowQuery as RuleGroupType;
    expect(q.rules).toHaveLength(1);
    const nestedGroup = q.rules[0] as RuleGroupType;
    expect(nestedGroup.rules).toHaveLength(3);
    expect(nestedGroup.rules[0]).toMatchObject({ field: 'f1' });
  });

  it('groups two items together in group mode', () => {
    const result = computeShadowQuery({
      originalQuery: baseQuery,
      draggedItem: createDragItem([0], rule1),
      draggedPath: [0],
      targetPath: [2],
      targetType: 'rule',
      quadrant: 'upper',
      dropEffect: 'move',
      groupItems: true,
    });
    expect(result).not.toBeNull();
    // The group() function creates a new group containing both items
    const q = result!.shadowQuery as RuleGroupType;
    expect(q.rules.length).toBeLessThanOrEqual(3);
  });

  it('computes correct previewPath when source is before destination in same parent', () => {
    const result = computeShadowQuery({
      originalQuery: baseQuery,
      draggedItem: createDragItem([0], rule1),
      draggedPath: [0],
      targetPath: [2],
      targetType: 'rule',
      quadrant: 'upper',
      dropEffect: 'move',
      groupItems: false,
    });
    expect(result).not.toBeNull();
    // Source at [0] removed, dest was [2] → effective [1]
    expect(result!.previewPath).toEqual([1]);
  });

  it('computes correct previewPath when source is after destination', () => {
    const result = computeShadowQuery({
      originalQuery: baseQuery,
      draggedItem: createDragItem([2], rule3),
      draggedPath: [2],
      targetPath: [0],
      targetType: 'rule',
      quadrant: 'upper',
      dropEffect: 'move',
      groupItems: false,
    });
    expect(result).not.toBeNull();
    expect(result!.previewPath).toEqual([0]);
  });

  it('handles cross-group moves', () => {
    const result = computeShadowQuery({
      originalQuery: nestedQuery,
      draggedItem: createDragItem([1, 0], rule2),
      draggedPath: [1, 0],
      targetPath: [0],
      targetType: 'rule',
      quadrant: 'upper',
      dropEffect: 'move',
      groupItems: false,
    });
    expect(result).not.toBeNull();
    const q = result!.shadowQuery as RuleGroupType;
    // rule2 should now be first in the root group
    expect(q.rules[0]).toMatchObject({ field: 'f2' });
  });

  it('returns null for a no-op move within a nested group', () => {
    // draggedPath [0, 1], lower quadrant of [0, 1] → dest [0, 2]
    // Same parent [0], destIdx(2) === dragIdx(1)+1 → no-op
    const result = computeShadowQuery({
      originalQuery: twoGroupsQuery,
      draggedItem: createDragItem([0, 1], rule2),
      draggedPath: [0, 1],
      targetPath: [0, 1],
      targetType: 'rule',
      quadrant: 'lower',
      dropEffect: 'move',
      groupItems: false,
    });
    expect(result).toBeNull();
  });

  it('detects different parent paths in isNoOp (not a no-op)', () => {
    // Move from [0, 1] to upper of [1, 1] → dest is [1, 1]
    // Parents are [0] and [1] — different, so not a no-op
    const result = computeShadowQuery({
      originalQuery: twoGroupsQuery,
      draggedItem: createDragItem([0, 1], rule2),
      draggedPath: [0, 1],
      targetPath: [1, 1],
      targetType: 'rule',
      quadrant: 'upper',
      dropEffect: 'move',
      groupItems: false,
    });
    expect(result).not.toBeNull();
  });

  it('computes correct previewPath for cross-parent move (different parents)', () => {
    // Move from [0, 0] to upper of [1, 0] → dest [1, 0]
    // Parents [0] vs [1] differ → sameParent is false → previewPath = destinationPath
    const result = computeShadowQuery({
      originalQuery: twoGroupsQuery,
      draggedItem: createDragItem([0, 0], rule1),
      draggedPath: [0, 0],
      targetPath: [1, 0],
      targetType: 'rule',
      quadrant: 'upper',
      dropEffect: 'move',
      groupItems: false,
    });
    expect(result).not.toBeNull();
    // For cross-parent, previewPath should equal destinationPath
    expect(result!.previewPath).toEqual([1, 0]);
  });

  it('returns the query unchanged for out-of-bounds source path', () => {
    const result = computeShadowQuery({
      originalQuery: baseQuery,
      draggedItem: createDragItem([99], rule1),
      draggedPath: [99],
      targetPath: [0],
      targetType: 'rule',
      quadrant: 'upper',
      dropEffect: 'move',
      groupItems: false,
    });
    // move() with invalid source returns original query structure
    expect(result).not.toBeNull();
  });
});
