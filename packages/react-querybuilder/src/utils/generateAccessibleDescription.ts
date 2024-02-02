import type { AccessibleDescriptionGenerator as ADG } from '../types/index';
import { pathsAreEqual } from './pathUtils';

export const generateAccessibleDescription: ADG = ({ path, qbId: _qbID }) =>
  pathsAreEqual([], path) ? `Query builder` : `Rule group at path ${path.join('-')}`;
