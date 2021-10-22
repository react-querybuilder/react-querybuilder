const getParentPath = (path: number[]) => path.filter((_n, i) => i < path.length - 1);

export default getParentPath;
