import { useMemo } from 'react';
import { defaultComponentsRE } from '../components';
import type { ComponentsRE } from '../types';

export const useMergeComponents = (componentsProp: Partial<ComponentsRE>): ComponentsRE =>
  useMemo(
    (): ComponentsRE => Object.assign({}, defaultComponentsRE, componentsProp),
    [componentsProp]
  );
