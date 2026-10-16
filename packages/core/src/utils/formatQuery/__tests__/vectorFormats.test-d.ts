// Type-only assertions for vector-format `formatQuery`/`QueryManager#format` overload return types.
// No runtime code; exists to be typechecked.
import type { DiagnosticsResult, RuleGroupType } from '../../../types';
import type { QueryManager } from '../../QueryManager';
import type { formatQuery } from '../formatQuery';

// Exact (invariant) type equality
type Equals<A, B> =
  // oxlint-disable-next-line typescript/no-unnecessary-type-parameters
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Obj = Record<string, unknown>;

declare const q: RuleGroupType;
declare const fq: typeof formatQuery;
declare const qm: QueryManager;
declare function expectType<T>(): <V>(v: V) => Equals<V, T>;

export function _vectorFormatOverloads(): true[] {
  return [
    // String shorthand
    expectType<Obj>()(fq(q, 'qdrant')),
    expectType<Obj>()(fq(q, 'pinecone')),
    expectType<Obj>()(fq(q, 'chroma')),
    expectType<Obj>()(fq(q, 'weaviate')),
    expectType<string>()(fq(q, 'milvus')),
    // Options object
    expectType<Obj>()(fq(q, { format: 'qdrant', parseNumbers: true })),
    expectType<Obj>()(fq(q, { format: 'pinecone', parseNumbers: true })),
    expectType<Obj>()(fq(q, { format: 'chroma', parseNumbers: true })),
    expectType<Obj>()(fq(q, { format: 'weaviate', fieldIdentifierSeparator: '.' })),
    expectType<string>()(fq(q, { format: 'milvus', fallbackExpression: 'id > 0' })),
    // Diagnostics w/ target format
    expectType<DiagnosticsResult>()(
      fq(q, { format: 'diagnostics', diagnosticsTargetFormat: 'milvus' })
    ),
    // QueryManager#format
    expectType<Obj>()(qm.format('qdrant')),
    expectType<Obj>()(qm.format({ format: 'pinecone' })),
    expectType<Obj>()(qm.format('chroma')),
    expectType<Obj>()(qm.format({ format: 'weaviate' })),
    expectType<string>()(qm.format('milvus')),
  ];
}
