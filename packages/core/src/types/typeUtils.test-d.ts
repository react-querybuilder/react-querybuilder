/* oxlint-disable typescript/no-unnecessary-type-parameters -- standard `Equal` idiom */
// Type-only assertions: local utils match type-fest for the shapes used in this repo.
import type * as TF from 'type-fest';
import type { BaseTranslations, FullOption, RuleGroupType } from '.';
import type * as L from './typeUtils';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;
type Extends<A, B> = A extends B ? true : false;

type RequireAtLeastOneOption = L.RequireAtLeastOne<
  { name?: string; value?: string; label: string },
  'name' | 'value'
>;

interface Obj {
  a: number;
  b?: string | null;
  c: boolean | undefined;
  [k: `x${string}`]: unknown;
}
type Fn = ((x: number) => string) & { p?: { q?: number } };

export type _Tests = [
  Expect<Extends<{ name: string; label: string }, RequireAtLeastOneOption>>,
  Expect<Extends<{ value: string; label: string }, RequireAtLeastOneOption>>,
  Expect<Equal<Extends<{ label: string }, RequireAtLeastOneOption>, false>>,
  Expect<Equal<L.Simplify<{ a: 1 } & { b: 2 }>, TF.Simplify<{ a: 1 } & { b: 2 }>>>,
  Expect<Equal<L.Except<Obj, 'a'>, TF.Except<Obj, 'a'>>>,
  Expect<Equal<L.Except<RuleGroupType, 'rules'>, TF.Except<RuleGroupType, 'rules'>>>,
  Expect<Equal<L.SetOptional<Obj, 'a' | 'c'>, TF.SetOptional<Obj, 'a' | 'c'>>>,
  Expect<Equal<L.SetOptional<FullOption, 'value'>, TF.SetOptional<FullOption, 'value'>>>,
  Expect<Equal<L.SetRequired<Obj, 'b'>, TF.SetRequired<Obj, 'b'>>>,
  Expect<Equal<L.SetRequired<Fn, 'p'>, TF.SetRequired<Fn, 'p'>>>,
  Expect<Equal<L.SetNonNullable<Obj>, TF.SetNonNullable<Obj>>>,
  Expect<Equal<L.SetNonNullable<Obj, 'b'>, TF.SetNonNullable<Obj, 'b'>>>,
  Expect<Equal<L.OverrideProperties<Obj, { a: 'z' }>, TF.OverrideProperties<Obj, { a: 'z' }>>>,
  Expect<Equal<L.RequiredDeep<Fn>, TF.RequiredDeep<Fn>>>,
  Expect<Equal<L.RequiredDeep<BaseTranslations>, TF.RequiredDeep<BaseTranslations>>>,
  Expect<
    Equal<
      L.RequiredDeep<{ m?: Map<string, { a?: 1 }>; d?: Date; p?: Promise<{ a?: 1 }> }>,
      TF.RequiredDeep<{ m?: Map<string, { a?: 1 }>; d?: Date; p?: Promise<{ a?: 1 }> }>
    >
  >,
];
