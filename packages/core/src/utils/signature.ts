import type { RuleGroupTypeAny, RuleType } from '../types';
import { isRuleGroup } from './isRuleGroup';

/**
 * Signature returned when a change alters the _shape_ of the query—rules or groups added,
 * removed, moved, or reordered—rather than the properties of a single node. Structural changes
 * never coalesce with each other, so each one produces its own history entry.
 */
export const structuralSignature = '~structural';

/**
 * Signature returned when two queries differ by reference only, with no observable difference
 * in their properties.
 */
export const unchangedSignature = '';

/**
 * Returns the list of property names that differ between two nodes, ignoring `rules` (which is
 * compared structurally by the caller).
 */
const changedProps = (prev: object, next: object): string[] => {
  const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  keys.delete('rules');
  const changed: string[] = [];
  for (const key of keys) {
    if (!Object.is(prev[key as keyof object], next[key as keyof object])) {
      changed.push(key);
    }
  }
  return changed.toSorted();
};

const signatureOfNode = (
  prev: RuleGroupTypeAny | RuleType | string,
  next: RuleGroupTypeAny | RuleType | string,
  /** Identifier of the parent group, used to describe independent combinator changes. */
  parentId: string,
  /** Index within the parent's `rules` array, used to describe independent combinator changes. */
  index: number
): string => {
  // Immer's structural sharing means untouched subtrees keep their identity, so reference
  // equality prunes the walk to the single mutated path.
  if (prev === next) return unchangedSignature;

  // Independent combinators are plain strings in the `rules` array.
  if (typeof prev === 'string' || typeof next === 'string') {
    return typeof prev === typeof next ? `${parentId}:combinator[${index}]` : structuralSignature;
  }

  const prevIsGroup = isRuleGroup(prev);
  const nextIsGroup = isRuleGroup(next);
  // A rule replaced by a group (or vice versa) is a structural change.
  if (prevIsGroup !== nextIsGroup) return structuralSignature;

  if (!prevIsGroup || !nextIsGroup) {
    const props = changedProps(prev, next);
    return props.length === 0 ? unchangedSignature : `${next.id ?? ''}:${props.join(',')}`;
  }

  // Adding or removing children is structural.
  if (prev.rules.length !== next.rules.length) return structuralSignature;

  const ownProps = changedProps(prev, next);

  let changedIndex = -1;
  for (const [i, prevRule] of prev.rules.entries()) {
    if (prevRule !== next.rules[i]) {
      // More than one child changed, which means children were moved or reordered.
      if (changedIndex !== -1) return structuralSignature;
      changedIndex = i;
    }
  }

  if (changedIndex === -1) {
    return ownProps.length === 0 ? unchangedSignature : `${next.id ?? ''}:${ownProps.join(',')}`;
  }

  // Both this group's own properties and one of its children changed, which no single edit
  // does—treat it as structural rather than attributing it to either.
  if (ownProps.length > 0) return structuralSignature;

  return signatureOfNode(
    prev.rules[changedIndex],
    next.rules[changedIndex],
    next.id ?? '',
    changedIndex
  );
};

/**
 * Describes _what changed_ between two versions of a query as a short string, so that
 * consecutive edits to the same property of the same rule (e.g. typing in a value editor) can
 * be recognized and coalesced into a single history entry.
 *
 * Returns {@link structuralSignature} for changes to the shape of the query, {@link unchangedSignature} when the
 * two queries differ by reference only, and `"<id>:<props>"` otherwise.
 *
 * The walk prunes on reference equality, so it costs O(depth) rather than O(size) for the
 * single-node edits that make up the overwhelming majority of changes.
 *
 * Note that this relies on the structural sharing that Immer—and therefore every query
 * produced by RQB's own update functions—guarantees: nodes that did not change keep their
 * identity. A query that has been wholly rebuilt (deep-cloned, round-tripped through JSON,
 * re-parsed from a string) shares no identity with its predecessor, so it is reported as
 * {@link structuralSignature} and will not coalesce. That is a graceful degradation—every change simply
 * gets its own history entry—but controlled components that clone the query on every change
 * will not benefit from coalescing.
 */
export const signatureOf = (prev: RuleGroupTypeAny, next: RuleGroupTypeAny): string =>
  signatureOfNode(prev, next, '', -1);
