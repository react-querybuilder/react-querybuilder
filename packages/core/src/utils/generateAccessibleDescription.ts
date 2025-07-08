import type { AccessibleDescriptionGenerator as ADG } from '../types';
import { pathsAreEqual } from './pathUtils';

export const generateAccessibleDescription: ADG = params =>
  pathsAreEqual([], params.path) ? `Query builder` : `Rule group at path ${params.path.join('-')}`;
