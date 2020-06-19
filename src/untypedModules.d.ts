declare module 'array-find' {
  export default function arrayFind<T>(array: Array<T>, predicate: (element: T) => boolean): T | undefined;
}
