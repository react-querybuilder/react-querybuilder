import type {
  Consequent,
  EvaluationMode,
  REConditionAny,
  RulesEngine,
  RulesEngineAny,
} from '../../types';

/**
 * Primitives that adapt {@link walkRulesEngine} to a particular guard representation `G` (e.g. a
 * `json-rules-engine` `TopLevelCondition`, or a {@link NativePredicate} function).
 */
export interface WalkPrimitives<G> {
  /** Compiles a single condition's antecedent (rule group) into a guard. */
  processAntecedent: (antecedent: REConditionAny['antecedent']) => G;
  /** ANDs guards together. An empty array must yield an always-true guard. */
  combine: (guards: G[]) => G;
  /** Negates a guard. */
  negate: (guard: G) => G;
}

/** A flattened rules-engine condition: a single combined guard paired with its consequent. */
export interface FlatRule<G> {
  guard: G;
  consequent: Consequent;
}

/**
 * Flattens a {@link react-querybuilder!RulesEngine RulesEngine} into an ordered list of
 * guard/consequent pairs, reproducing the if/else-if/else (`"cascade"`) or independent
 * (`"cumulative"`) semantics shared by the runnable export targets.
 *
 * Each emitted guard ANDs the condition's own antecedent with its ancestor antecedents and—in
 * `"cascade"` mode—the negated antecedents of its prior siblings. A `defaultConsequent` is guarded
 * by all sibling antecedents (cascade `else`) or is always-true (cumulative baseline). A condition
 * with nested conditions but no consequent contributes only a guard for its children.
 *
 * @group Export
 */
export const walkRulesEngine = <G>(
  rulesEngine: RulesEngineAny,
  mode: EvaluationMode,
  { processAntecedent, combine, negate }: WalkPrimitives<G>
): FlatRule<G>[] => {
  const walk = (node: RulesEngine, ancestorGuards: G[]): FlatRule<G>[] => {
    const rules: FlatRule<G>[] = [];
    const siblingNegations: G[] = [];

    for (const c of node.conditions) {
      const ownAntecedent = processAntecedent(c.antecedent);
      const guards = [
        ...ancestorGuards,
        ...(mode === 'cascade' ? siblingNegations : []),
        ownAntecedent,
      ];

      const hasNested = Array.isArray(c.conditions) && c.conditions.length > 0;

      // Emit a rule for the consequent. A condition that only groups nested conditions
      // (no consequent) contributes no consequent of its own.
      if (c.consequent || !hasNested) {
        rules.push({ guard: combine(guards), consequent: c.consequent ?? { type: '' } });
      }

      if (hasNested) {
        rules.push(...walk(c as RulesEngine, guards));
      }

      siblingNegations.push(negate(ownAntecedent));
    }

    if (node.defaultConsequent) {
      const guards = [...ancestorGuards, ...(mode === 'cascade' ? siblingNegations : [])];
      rules.push({ guard: combine(guards), consequent: node.defaultConsequent });
    }

    return rules;
  };

  return walk(rulesEngine as RulesEngine, []);
};
