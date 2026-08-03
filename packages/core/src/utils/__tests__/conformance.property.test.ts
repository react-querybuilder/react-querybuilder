/**
 * Property-based cross-implementation conformance.
 *
 * `conformance.test.ts` pins the three mutation implementations against each other over a curated
 * list of sequences. That list is bounded by the sequences we thought to write, and the known
 * divergences between `QueryManager` and the Redux path are *interactions between* operations
 * rather than single-operation bugs — the kind of thing you only write a test for if you already
 * suspect it.
 *
 * Two independent implementations of one spec is the textbook model-based-testing setup: each is
 * the other's oracle for free. Shrinking is the real payoff — a failure arrives as a minimal
 * two- or three-operation repro instead of a twelve-operation haystack.
 *
 * ## Coverage
 *
 * Vitest enforces 100% thresholds, and property runs hit different branches per seed, so a line
 * covered on one run could be uncovered on the next. Two rules keep the gate from flaking:
 *
 * 1. Every `fc.assert` here passes an explicit `seed`, so runs are reproducible.
 * 2. These are **correctness** tests. The curated sequences in `conformance.test.ts` are the
 *    coverage mechanism; nothing may rely on a property to reach a branch.
 *
 * Deliberately `.ts` with no React imports, so it runs under both `bun test:bun` and Vitest.
 */

import fc from 'fast-check';
import type { Op, OpSeed, RunOptions } from '../../../../../utils/testing/queryFixtures';
import {
  actionsSupport,
  allPaths,
  createIdGenerator,
  materializeOps,
  queries,
  runViaActions,
  runViaQueryManager,
  runViaQueryTools,
  stripIDs,
} from '../../../../../utils/testing/queryFixtures';
import type { Path, RuleGroupType, RuleGroupTypeAny } from '../../types';
import { convertFromIC, convertToIC } from '../convertQuery';
import { findPath } from '../pathUtils';
import { regenerateIDs } from '../regenerateIDs';
import { transformQuery } from '../transformQuery';

/**
 * Fixed for reproducibility — see the coverage note above. Change it deliberately (and re-run
 * `bun checkall`) rather than incidentally.
 */
const params = { seed: 20_260_803, numRuns: 100 } as const;

const opKinds = ['add', 'update', 'remove', 'move', 'insert', 'group'] as const;

const arbitrarySeed = (kinds: readonly Op['kind'][] = opKinds): fc.Arbitrary<OpSeed> =>
  fc.record({
    kind: fc.constantFrom(...kinds),
    target: fc.nat({ max: 12 }),
    secondary: fc.nat({ max: 12 }),
    useID: fc.boolean(),
    flag: fc.boolean(),
    addGroup: fc.boolean(),
    prop: fc.nat({ max: 12 }),
    relativeMove: fc.boolean(),
  });

const arbitrarySeeds = (kinds?: readonly Op['kind'][]) =>
  fc.array(arbitrarySeed(kinds), { minLength: 1, maxLength: 12 });

/** Every fixture is fair game; the arbitrary picks one per run. */
const fixtureNames = Object.keys(queries) as (keyof typeof queries)[];
const arbitraryFixture = fc.constantFrom(...fixtureNames);

/** Independent-combinator fixtures only, for the IC-specific structural invariant. */
const icFixture = fc.constantFrom(...fixtureNames.filter(n => n.startsWith('ic')));

const idAt = (query: RuleGroupTypeAny, path: Path): string | undefined =>
  (findPath(path, query) as { id?: string } | null)?.id;

/** `createQueryActions` has no `insert` equivalent, so properties involving it exclude that kind. */
const actionKinds = opKinds.filter(k => k !== 'insert');

const run = (
  ops: Op[],
  fixture: keyof typeof queries,
  options: RunOptions = {}
): {
  manager: ReturnType<typeof runViaQueryManager>;
  tools: ReturnType<typeof runViaQueryTools>;
} => ({
  manager: runViaQueryManager(ops, queries[fixture], {
    ...options,
    idGenerator: createIdGenerator(),
  }),
  tools: runViaQueryTools(ops, queries[fixture], { ...options, idGenerator: createIdGenerator() }),
});

describe('QueryManager conforms to the query tools for arbitrary sequences', () => {
  it('produces identical queries, ids, and abort reasons', () => {
    fc.assert(
      fc.property(arbitraryFixture, arbitrarySeeds(), (fixture, seeds) => {
        const ops = materializeOps(seeds, queries[fixture]);
        const { manager, tools } = run(ops, fixture);

        expect(manager.query).toEqual(tools.query);
        expect(manager.aborts).toEqual(tools.aborts);
        expect(manager.refused).toEqual(tools.refused);
      }),
      params
    );
  });

  it('agrees under every respectDisabled × queryDisabled combination', () => {
    fc.assert(
      fc.property(
        arbitraryFixture,
        arbitrarySeeds(),
        fc.boolean(),
        fc.boolean(),
        (fixture, seeds, respectDisabled, queryDisabled) => {
          const options: RunOptions = { respectDisabled, queryDisabled };
          const ops = materializeOps(seeds, queries[fixture], options);
          const { manager, tools } = run(ops, fixture, options);

          expect(manager.query).toEqual(tools.query);
          expect(manager.aborts).toEqual(tools.aborts);
        }
      ),
      params
    );
  });

  it('agrees for arbitrary disabledPaths', () => {
    fc.assert(
      fc.property(
        arbitraryFixture,
        arbitrarySeeds(),
        fc.array(fc.array(fc.nat({ max: 3 }), { maxLength: 3 }), { maxLength: 3 }),
        (fixture, seeds, disabledPaths) => {
          const options: RunOptions = { disabledPaths };
          const ops = materializeOps(seeds, queries[fixture], options);
          const { manager, tools } = run(ops, fixture, options);

          expect(manager.query).toEqual(tools.query);
          expect(manager.aborts).toEqual(tools.aborts);
        }
      ),
      params
    );
  });

  it('agrees for arbitrary maxLevels', () => {
    fc.assert(
      fc.property(
        arbitraryFixture,
        arbitrarySeeds(),
        fc.integer({ min: 1, max: 4 }),
        (fixture, seeds, maxLevels) => {
          const options: RunOptions = { maxLevels };
          const ops = materializeOps(seeds, queries[fixture], options);
          const { manager, tools } = run(ops, fixture, options);

          expect(manager.query).toEqual(tools.query);
          expect(manager.aborts).toEqual(tools.aborts);
        }
      ),
      params
    );
  });
});

describe('createQueryActions conforms to the query tools for arbitrary sequences', () => {
  it('produces the same query', () => {
    fc.assert(
      fc.property(arbitraryFixture, arbitrarySeeds(actionKinds), (fixture, seeds) => {
        const ops = materializeOps(seeds, queries[fixture]);
        // The seed arbitrary already excludes `insert`, but an empty query forces an `add`, so
        // assert the invariant rather than assuming it.
        expect(actionsSupport(ops)).toBe(true);

        const { tools } = run(ops, fixture);
        const actions = runViaActions(ops, queries[fixture], { idGenerator: createIdGenerator() });

        expect(stripIDs(actions.query)).toEqual(stripIDs(tools.query));
      }),
      params
    );
  });

  it('refuses whenever the guards refuse', () => {
    fc.assert(
      fc.property(arbitraryFixture, arbitrarySeeds(actionKinds), (fixture, seeds) => {
        const ops = materializeOps(seeds, queries[fixture]);
        const { tools } = run(ops, fixture);
        const actions = runViaActions(ops, queries[fixture], { idGenerator: createIdGenerator() });

        // Only the guard reasons map one-for-one onto a refusal; the actions collapse everything
        // else into an unchanged query, which the equality property above already covers.
        const guarded = new Set(['target-disabled', 'parent-disabled', 'max-levels-exceeded']);
        const expected = tools.aborts.map(reason =>
          reason === null ? false : guarded.has(reason) ? true : null
        );
        const actual = expected.map((e, i) => (e === null ? null : actions.refused[i]));

        expect(actual).toEqual(expected);
      }),
      params
    );
  });
});

describe('mutation invariants', () => {
  /** Rules only, stripped of ids, in depth-first order. */
  const rulesOf = (query: RuleGroupTypeAny): unknown[] => {
    const stripped = stripIDs(query);
    const collect = (rg: RuleGroupTypeAny): unknown[] =>
      (rg.rules as unknown[]).flatMap(child =>
        typeof child === 'string'
          ? []
          : 'rules' in (child as object)
            ? collect(child as RuleGroupTypeAny)
            : [child]
      );
    return collect(stripped);
  };

  const sortedRules = (query: RuleGroupTypeAny): string[] =>
    rulesOf(query)
      .map(rule => JSON.stringify(rule))
      .toSorted();

  it('a non-refused move preserves the multiset of rules', () => {
    fc.assert(
      fc.property(arbitraryFixture, arbitrarySeed(['move']), (fixture, seed) => {
        const [op] = materializeOps([seed], queries[fixture]);
        if (op.kind !== 'move' || op.clone) return;

        const before = runViaQueryTools([], queries[fixture], { idGenerator: createIdGenerator() });
        const after = runViaQueryTools([op], queries[fixture], {
          idGenerator: createIdGenerator(),
        });

        expect(sortedRules(after.query)).toEqual(sortedRules(before.query));
      }),
      params
    );
  });

  it('a successful group operation preserves the multiset of rules', () => {
    fc.assert(
      fc.property(arbitraryFixture, arbitrarySeed(['group']), (fixture, seed) => {
        const [op] = materializeOps([seed], queries[fixture]);
        if (op.kind !== 'group' || op.clone) return;

        const before = runViaQueryTools([], queries[fixture], { idGenerator: createIdGenerator() });
        const after = runViaQueryTools([op], queries[fixture], {
          idGenerator: createIdGenerator(),
        });

        expect(sortedRules(after.query)).toEqual(sortedRules(before.query));
      }),
      params
    );
  });

  it('never produces duplicate ids', () => {
    fc.assert(
      fc.property(arbitraryFixture, arbitrarySeeds(), (fixture, seeds) => {
        const ops = materializeOps(seeds, queries[fixture]);
        const { manager } = run(ops, fixture);

        // `move`/`group` with `clone: true` regenerate ids, so no id may ever appear twice no
        // matter how the tree was rearranged.
        const ids = allPaths(manager.query)
          .map(path => idAt(manager.query, path))
          .filter(Boolean);

        expect(new Set(ids).size).toBe(ids.length);
      }),
      params
    );
  });

  it('preserves the rule/combinator alternation of independent-combinator queries', () => {
    /**
     * Describes every group in the query as a string of `r` (rule or group) and `c`
     * (combinator), depth-first. A valid IC group alternates, starting and ending with `r`.
     */
    const shapesOf = (rg: RuleGroupTypeAny): string[] => [
      (rg.rules as unknown[]).map(child => (typeof child === 'string' ? 'c' : 'r')).join(''),
      ...(rg.rules as unknown[]).flatMap(child =>
        typeof child !== 'string' && 'rules' in (child as object)
          ? shapesOf(child as RuleGroupTypeAny)
          : []
      ),
    ];

    /** The alternating shape a group of the same length must have. */
    const alternating = (shapes: string[]): string[] =>
      shapes.map(shape =>
        Array.from({ length: shape.length }, (_, index) => (index % 2 === 0 ? 'r' : 'c')).join('')
      );

    fc.assert(
      fc.property(icFixture, arbitrarySeeds(), (fixture, seeds) => {
        const ops = materializeOps(seeds, queries[fixture]);
        const { manager, tools } = run(ops, fixture);

        for (const query of [manager.query, tools.query]) {
          const shapes = shapesOf(query);
          expect(shapes).toEqual(alternating(shapes));
          // An alternating shape of even length would end with a dangling combinator. Empty
          // groups are legal.
          expect(shapes.filter(shape => shape.length > 0 && shape.length % 2 === 0)).toEqual([]);
        }
      }),
      params
    );
  });
});

describe('round-trip properties', () => {
  /** Builds an arbitrary query by running an arbitrary sequence against a fixture. */
  const arbitraryQuery = fc
    .tuple(arbitraryFixture, arbitrarySeeds())
    .map(
      ([fixture, seeds]) =>
        runViaQueryTools(materializeOps(seeds, queries[fixture]), queries[fixture], {
          idGenerator: createIdGenerator(),
        }).query
    );

  it('convertFromIC(convertToIC(query)) is idempotent', () => {
    fc.assert(
      fc.property(arbitraryQuery, query => {
        // Only non-IC queries can be converted *to* IC.
        if (!('combinator' in query)) return;

        const roundTripped = convertFromIC(convertToIC(query as RuleGroupType));

        // A single round trip is lossy — `convertToIC` drops group combinators, so
        // `convertFromIC` restores defaults rather than the originals. What must hold is that
        // the result is a fixed point: converting again changes nothing further.
        expect(stripIDs(roundTripped)).toEqual(stripIDs(convertFromIC(convertToIC(roundTripped))));
      }),
      params
    );
  });

  it('regenerateIDs preserves structure', () => {
    fc.assert(
      fc.property(arbitraryQuery, query => {
        expect(stripIDs(regenerateIDs(query))).toEqual(stripIDs(query));
      }),
      params
    );
  });

  it('an identity transform is a no-op', () => {
    fc.assert(
      fc.property(arbitraryQuery, query => {
        // `transformQuery` assigns `path` to every node as it walks, so the output is identical
        // modulo the derived properties `stripIDs` drops.
        expect(stripIDs(transformQuery(query as RuleGroupType, {}))).toEqual(stripIDs(query));
      }),
      params
    );
  });
});
