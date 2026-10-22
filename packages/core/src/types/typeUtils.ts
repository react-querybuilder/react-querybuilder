// Local equivalents of the `type-fest` utilities used in this package. Importing `type-fest`
// loads its entire index (~200 files) into every program that typechecks this source.
// Semantics guarded by `typeUtils.test-d.ts`.

type Primitive = null | undefined | string | number | boolean | symbol | bigint;
type BuiltIns = Primitive | void | Date | RegExp;

/** Flattens an intersection into a single object type. */
export type Simplify<T> = { [K in keyof T]: T[K] } & {};

/** Like `Omit`, but `K` must be keys of `O`. */
export type Except<O, K extends keyof O> = {
  [P in keyof O as P extends K ? never : P]: O[P];
};

/**
 * Requires at least one of keys `K`. Unlike type-fest's, no `IfNotAnyOrNever` wrapper, which
 * defers evaluation on generic params and breaks property access downstream.
 */
export type RequireAtLeastOne<O, K extends keyof O> = {
  [P in K]-?: Required<Pick<O, P>> & Partial<Pick<O, Exclude<K, P>>>;
}[K] &
  Except<O, K>;

type HomomorphicPick<T, K extends keyof T> = { [P in keyof T as Extract<P, K>]: T[P] };

/** Makes keys `K` of `B` optional. */
export type SetOptional<B, K extends keyof B> = (B extends (...args: never) => unknown
  ? (...args: Parameters<B>) => ReturnType<B>
  : unknown) &
  (B extends unknown ? Simplify<Except<B, K> & Partial<HomomorphicPick<B, K>>> : never);

/** Makes keys `K` of `B` required. (Object types only.) */
export type SetRequired<B, K extends keyof B> = (B extends (...args: never) => unknown
  ? (...args: Parameters<B>) => ReturnType<B>
  : unknown) &
  Simplify<Except<B, K> & Required<HomomorphicPick<B, K>>>;

/** Makes keys `K` (default all) of `B` non-nullable. */
export type SetNonNullable<B, K extends keyof B = keyof B> = {
  [P in keyof B]: P extends K ? NonNullable<B[P]> : B[P];
};

/** Replaces existing properties of `T` with those of `O`. */
export type OverrideProperties<
  T,
  O extends Partial<Record<keyof T, unknown>> & {
    [P in keyof O]: P extends keyof T ? O[P] : never;
  },
> = Simplify<Except<T, Extract<keyof O, keyof T>> & O>;

type HasMultipleCallSignatures<T extends (...args: never[]) => unknown> = T extends {
  (...args: infer A): unknown;
  (...args: infer B): unknown;
}
  ? B extends A
    ? A extends B
      ? false
      : true
    : true
  : false;

type RequiredObjectDeep<T extends object> = { [P in keyof T]-?: RequiredDeep<T[P]> };

/** Deeply required version of `T`. */
export type RequiredDeep<T> = T extends BuiltIns
  ? T
  : T extends Map<infer K, infer V>
    ? Map<RequiredDeep<K>, RequiredDeep<V>>
    : T extends Set<infer I>
      ? Set<RequiredDeep<I>>
      : T extends ReadonlyMap<infer K, infer V>
        ? ReadonlyMap<RequiredDeep<K>, RequiredDeep<V>>
        : T extends ReadonlySet<infer I>
          ? ReadonlySet<RequiredDeep<I>>
          : T extends WeakMap<infer K, infer V>
            ? WeakMap<RequiredDeep<K>, RequiredDeep<V>>
            : T extends WeakSet<infer I>
              ? WeakSet<RequiredDeep<I>>
              : T extends Promise<infer V>
                ? Promise<RequiredDeep<V>>
                : T extends (...args: never[]) => unknown
                  ? [keyof T] extends [never]
                    ? T
                    : HasMultipleCallSignatures<T> extends true
                      ? T
                      : ((...args: Parameters<T>) => ReturnType<T>) & RequiredObjectDeep<T>
                  : T extends object
                    ? Simplify<RequiredObjectDeep<T>>
                    : unknown;
