import { defaultCoalesceMs } from '../defaults';
import { structuralSignature } from './signature';

/**
 * Determines whether a change should be absorbed into the current history entry instead of
 * pushing a new one. This is the exact rule {@link QueryManager} applies when recording history,
 * exposed so non-React implementations can manage their own history stacks without
 * reimplementing (and drifting from) the semantics.
 *
 * A change coalesces only when all three hold:
 * - the change is not structural (rules/groups added, removed, moved, or reordered)
 * - its signature matches the previously recorded signature
 * - it occurred within `coalesceMs` of the previous recording
 *
 * Note that {@link unchangedSignature} is not handled here. A change with no observable
 * difference is never recorded at all, which is a separate decision made before this check.
 *
 * @param prevSig Signature of the previously recorded change, or `undefined` if there is none.
 * @param nextSig Signature of the change being recorded, from {@link signatureOf}.
 * @param prevAt Timestamp of the previous recording.
 * @param now Timestamp of the change being recorded.
 * @param coalesceMs Coalescing window in milliseconds.
 */
export const shouldCoalesce = (
  prevSig: string | undefined,
  nextSig: string,
  prevAt: number,
  now: number,
  coalesceMs: number = defaultCoalesceMs
): boolean => nextSig !== structuralSignature && nextSig === prevSig && now - prevAt < coalesceMs;
