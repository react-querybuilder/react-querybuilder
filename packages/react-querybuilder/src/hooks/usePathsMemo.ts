import type { Path, PathInfo } from '@react-querybuilder/core';
import { derivePathInfo } from '@react-querybuilder/core';
import { useMemo } from 'react';

export type { PathInfo };

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

  return useMemo(
    () => derivePathInfo(path, nestedArrayLength, { disabled, disabledPaths }),
    [disabled, path, nestedArrayLength, disabledPaths]
  );
};
