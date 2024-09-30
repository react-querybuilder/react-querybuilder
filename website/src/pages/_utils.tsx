export const dotdot = (path: string) => path.slice(0, Math.max(0, path.lastIndexOf('/') + 1));

export const Loading = () => <div>Loading...</div>;
