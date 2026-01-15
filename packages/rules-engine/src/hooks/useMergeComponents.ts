import { useMemo } from 'react';
import { defaultComponentsRE } from '../components';
import type { ComponentsRE } from '../types';

/**
 * Merges the default components with any provided overrides.
 *
 * @group Hooks
 */
export const useMergeComponents = (componentsProp?: Partial<ComponentsRE>): ComponentsRE =>
  useMemo(
    // TODO: more granular merge strategy
    (): ComponentsRE => Object.assign({}, defaultComponentsRE, componentsProp),
    [componentsProp]
  );
