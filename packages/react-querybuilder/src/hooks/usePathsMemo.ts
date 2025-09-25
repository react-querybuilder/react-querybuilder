import { pathsAreEqual, type Path } from '@react-querybuilder/core';
import { useMemo } from 'react';

export interface PathInfo {
  path: Path;
  disabled: boolean;
}

// Memoize the path info so every render doesn't generate a new array
export const usePathsMemo = ({
  disabled,
  path,
  nestedArray,
  disabledPaths,
}: {
  disabled: boolean;
  path: Path;
  nestedArray: unknown[];
  disabledPaths: Path[];
}): PathInfo[] => {
  const nestedArrayLength = nestedArray.length;

  return useMemo(() => {
    const paths: PathInfo[] = [];
    for (let i = 0; i < nestedArrayLength; i++) {
      const thisPath = [...path, i];
      paths[i] = {
        path: thisPath,
        disabled: disabled || disabledPaths.some(p => pathsAreEqual(thisPath, p)),
      };
    }
    return paths;
  }, [disabled, path, nestedArrayLength, disabledPaths]);
};
