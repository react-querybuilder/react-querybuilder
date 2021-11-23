export const getParentPath = (path: number[]) => path.slice(0, path.length - 1);

export const pathsAreEqual = (path1: number[], path2: number[]) =>
  path1.join('-') === path2.join('-');

export const isAncestor = (maybeAncestor: number[], path: number[]) =>
  maybeAncestor.length < path.length && RegExp(`^${maybeAncestor.join('-')}`).test(path.join('-'));

export const getCommonAncestorPath = (path1: number[], path2: number[]) => {
  const commonAncestorPath: number[] = [];
  const parentPath1 = getParentPath(path1);
  const parentPath2 = getParentPath(path2);

  for (
    let i = 0;
    i < parentPath1.length && i < parentPath2.length && parentPath1[i] === parentPath2[i];
    i++
  ) {
    commonAncestorPath.push(parentPath2[i]);
  }

  return commonAncestorPath;
};
