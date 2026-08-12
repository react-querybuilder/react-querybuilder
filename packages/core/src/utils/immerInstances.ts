import { Immer, produce, setAutoFreeze as immerSetAutoFreeze } from 'immer';

/**
 * Globally enables or disables immer's auto-freeze, i.e. the deep freeze applied to every query
 * returned by {@link add}, {@link update}, {@link remove}, {@link move}, {@link insert}, and
 * {@link group}.
 *
 * Re-exported from immer so that consumers mixing these tools with their own `produce` calls can
 * switch both at once. Prefer the per-call `freeze` option, or the {@link QueryManager} option of
 * the same name, when the change should not be process-wide. A per-call `freeze: false` wins
 * regardless of this setting; a per-call `freeze: true` does not re-enable freezing once this has
 * turned it off, since it selects immer's default instance.
 *
 * @group Query Tools
 */
export const setAutoFreeze: (autoFreeze: boolean) => void = immerSetAutoFreeze;

// Immer has no per-call auto-freeze control, so a second instance with auto-freeze disabled
// serves calls that opt out. `setAutoFreeze` (re-exported from the root) affects the default
// instance only, which is what a global escape hatch should do.
const unfrozenImmer = new Immer({ autoFreeze: false });

/**
 * The `produce` implementation matching the requested freeze behavior.
 *
 * @internal
 */
export const producerFor = (freeze = true): typeof produce =>
  freeze ? produce : unfrozenImmer.produce;
