import type { AbortReason } from './queryTools';

/**
 * Abort reasons that {@link QueryManager}'s `strict` mode treats as errors. The remaining
 * reasons—`"same-location"` and `"no-change"`—describe valid operations that had nothing to do,
 * so they are reported to `onInvalidTarget` but never throw.
 *
 * Declared apart from `QueryManager` so the `@react-querybuilder/core/derivations` entry point can
 * export it without putting the manager in its module graph.
 *
 * @group Query Tools
 */
export const strictAbortReasons: readonly AbortReason[] = [
  'target-not-found',
  'parent-not-found',
  'parent-not-a-group',
  'destination-not-found',
  'root-not-allowed',
  'not-a-combinator-slot',
  'target-disabled',
  'parent-disabled',
  'max-levels-exceeded',
];

/** @internal */
export const strictAbortReasonSet: ReadonlySet<AbortReason> = new Set<AbortReason>(
  strictAbortReasons
);
