import type { Field, Schema, ToFullOption } from '../types/index';
import { pathsAreEqual } from './pathUtils';

export const generateAccessibleDescription = (({ path, qbId }) => {
  return pathsAreEqual([], path)
    ? `Query builder ${qbId}`
    : `Rule group at path ${path.join('-')} in query builder ${qbId}`;
}) satisfies Schema<ToFullOption<Field>, string>['accessibleDescriptionGenerator'];
