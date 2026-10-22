import type { DefaultOperatorName, ExportFormat, MatchMode, RuleType } from '../../types';
import { lc } from '../misc';
import { processMatchMode, regexFallbackRule } from './utils';

/**
 * Describes what an export format can express. Used by default rule processors to decide
 * whether to skip a rule and by the "diagnostics" format (`diagnosticsTargetFormat`) to
 * report rules that would be skipped.
 *
 * @group Export
 */
export interface FormatCapabilities {
  /** Lowercased operator names the format can express. */
  operators: ReadonlySet<Lowercase<DefaultOperatorName>>;
  /** Supports `valueSource: 'field'`. Set = only for those (lowercased) operators. */
  fieldValueSource: boolean | ReadonlySet<Lowercase<DefaultOperatorName>>;
  /** Supported (lowercased, post-coercion) match modes. Empty = none. */
  matchModes: ReadonlySet<Lowercase<MatchMode>>;
  /** Native group negation. `false` = De Morgan push-down via {@link negateRuleGroup}. */
  nativeNot: boolean;
}

/**
 * Capabilities of export formats, keyed by {@link ExportFormat}. Only populated for
 * vector database formats at this time.
 *
 * @group Export
 */
export const formatCapabilities: Partial<Record<ExportFormat, FormatCapabilities>> = {
  pinecone: {
    operators: new Set<Lowercase<DefaultOperatorName>>([
      '=',
      '!=',
      '<',
      '<=',
      '>',
      '>=',
      'in',
      'notin',
      'between',
      'notbetween',
      'null',
      'notnull',
    ]),
    fieldValueSource: false,
    matchModes: new Set(),
    nativeNot: false,
  },
  chroma: {
    operators: new Set<Lowercase<DefaultOperatorName>>([
      '=',
      '!=',
      '<',
      '<=',
      '>',
      '>=',
      'in',
      'notin',
      'between',
      'notbetween',
    ]),
    fieldValueSource: false,
    matchModes: new Set(),
    nativeNot: false,
  },
  weaviate: {
    operators: new Set<Lowercase<DefaultOperatorName>>([
      '=',
      '!=',
      '<',
      '<=',
      '>',
      '>=',
      'in',
      'notin',
      'between',
      'notbetween',
      'null',
      'notnull',
      'contains',
      'doesnotcontain',
      'beginswith',
      'doesnotbeginwith',
      'endswith',
      'doesnotendwith',
    ]),
    fieldValueSource: false,
    matchModes: new Set(),
    nativeNot: true,
  },
  milvus: {
    operators: new Set<Lowercase<DefaultOperatorName>>([
      '=',
      '!=',
      '<',
      '<=',
      '>',
      '>=',
      'in',
      'notin',
      'between',
      'notbetween',
      'null',
      'notnull',
      'contains',
      'doesnotcontain',
      'beginswith',
      'doesnotbeginwith',
      'endswith',
      'doesnotendwith',
    ]),
    // See `defaultRuleProcessorMilvus`
    fieldValueSource: new Set<Lowercase<DefaultOperatorName>>([
      '=',
      '!=',
      '<',
      '<=',
      '>',
      '>=',
      'between',
      'notbetween',
    ]),
    matchModes: new Set(),
    nativeNot: true,
  },
  qdrant: {
    operators: new Set<Lowercase<DefaultOperatorName>>([
      '=',
      '!=',
      '<',
      '<=',
      '>',
      '>=',
      'in',
      'notin',
      'between',
      'notbetween',
      'null',
      'notnull',
      'contains',
      'doesnotcontain',
      'beginswith',
      'doesnotbeginwith',
    ]),
    fieldValueSource: false,
    matchModes: new Set<Lowercase<MatchMode>>(['some', 'none']),
    nativeNot: true,
  },
};

/**
 * Feature of a rule that a format can't express.
 *
 * @group Export
 */
export type UnsupportedRuleFeature = 'operator' | 'valueSource' | 'matchMode';

/**
 * Returns the first feature of `rule` unsupported per `caps`, or `null` if fully supported.
 * Match-mode rules are checked by mode only (operator ignored). Regex operators are checked as
 * their `contains`/`doesNotContain` fallbacks.
 *
 * @group Export
 */
export const getUnsupportedRuleFeature = (
  ruleParam: RuleType,
  caps: FormatCapabilities
): UnsupportedRuleFeature | null => {
  const rule = regexFallbackRule(ruleParam);
  if (rule.match?.mode) {
    const mm = processMatchMode(rule);
    const mode = mm ? mm.mode : (lc(rule.match.mode) as Lowercase<MatchMode>);
    return caps.matchModes.has(mode) ? null : 'matchMode';
  }
  const op = lc(rule.operator) as Lowercase<DefaultOperatorName>;
  const fvs = caps.fieldValueSource;
  if (rule.valueSource === 'field' && (typeof fvs === 'boolean' ? !fvs : !fvs.has(op))) {
    return 'valueSource';
  }
  return caps.operators.has(op) ? null : 'operator';
};
