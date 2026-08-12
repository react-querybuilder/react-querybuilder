import type { AccessibleDescriptionGenerator as ADG } from '../types';
import { pathsAreEqual } from './pathUtils';

/**
 * The default `accessibleDescriptionGenerator`. Produces the `aria-label` for a rule group:
 * `"Query builder"` for the root group, `"Rule group at path 0-1"` for any other.
 *
 * @group Accessibility
 */
export const generateAccessibleDescription: ADG = params =>
  pathsAreEqual([], params.path) ? `Query builder` : `Rule group at path ${params.path.join('-')}`;
