/**
 * Options controlling how query changes are recorded for undo/redo.
 *
 * Shared by the `react-querybuilder/history` entry point and the
 * {@link index!QueryManager QueryManager} utility.
 */
export interface QueryHistoryOptions {
  /**
   * Maximum number of undo steps to retain. Older entries are discarded.
   *
   * @default 50
   */
  maxHistory?: number;
  /**
   * Consecutive changes to the same property of the same rule within this many milliseconds
   * are merged into a single undo step, so that (for example) typing a multi-character value
   * produces one history entry rather than one per keystroke.
   *
   * Set to `0` to record every change separately.
   *
   * @default 500
   */
  coalesceMs?: number;
}
