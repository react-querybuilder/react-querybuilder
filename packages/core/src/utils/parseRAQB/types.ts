/**
 * Types describing the plain-JSON structures produced by
 * [react-awesome-query-builder](https://github.com/ukrbublik/react-awesome-query-builder) (RAQB).
 *
 * These mirror RAQB's own `JsonTree`/`Config` definitions closely enough for conversion, but
 * intentionally use loose types where RAQB's runtime output is broader than its type declarations.
 */

/** RAQB item type discriminator. */
export type RAQBItemType = 'group' | 'rule' | 'rule_group' | 'switch_group' | 'case_group';

/** RAQB value source. `"const"` behaves identically to `"value"`. */
export type RAQBValueSource = 'value' | 'field' | 'func' | 'const';

/** RAQB left-hand side source. `"func"` means `properties.field` is a {@link RAQBFuncValue}. */
export type RAQBFieldSource = 'field' | 'func';

/** RAQB `!group` field mode. */
export type RAQBRuleGroupMode = 'struct' | 'some' | 'array';

/** A single argument of a RAQB {@link RAQBFuncValue}. */
export interface RAQBFuncArgValue {
  value?: unknown;
  valueSrc?: RAQBValueSource;
  valueType?: string;
}

/** A RAQB function call, stored in `value[i]` when `valueSrc[i]` is `"func"`. */
export interface RAQBFuncValue {
  func: string;
  args?: Record<string, RAQBFuncArgValue>;
}

/**
 * Structural equivalent of `@react-querybuilder/datetime`'s `RelativeDateTimeValue`, reproduced
 * here so that `@react-querybuilder/core` need not depend on that package. RAQB's built-in
 * date/time functions (`NOW`, `TODAY`, `START_OF_TODAY`, `TRUNCATE_DATETIME`, `RELATIVE_DATE`,
 * and `RELATIVE_DATETIME`) are converted to values of this shape.
 */
export interface RAQBRelativeDateTimeValue {
  mode: 'relative';
  anchor:
    | 'now'
    | 'startOfDay'
    | 'startOfWeek'
    | 'startOfMonth'
    | 'startOfYear'
    | 'endOfDay'
    | 'endOfWeek'
    | 'endOfMonth'
    | 'endOfYear';
  offset: number;
  unit: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
}

/** Properties common to all RAQB items. */
export interface RAQBBasicItemProperties {
  isLocked?: boolean;
}

/** Properties of a RAQB `rule` item. */
export interface RAQBRuleProperties extends RAQBBasicItemProperties {
  field?: string | RAQBFuncValue | null;
  fieldSrc?: RAQBFieldSource;
  fieldType?: string;
  operator?: string | null;
  /** Always an array in RAQB — one entry per operand. */
  value?: unknown[];
  valueSrc?: RAQBValueSource[];
  valueType?: string[];
  operatorOptions?: Record<string, unknown> | null;
}

/** Properties of a RAQB `group` item. */
export interface RAQBGroupProperties extends RAQBBasicItemProperties {
  conjunction?: string;
  not?: boolean;
}

/**
 * Properties of a RAQB `rule_group` item. Simple (`!struct`-like) rule groups only have `field`
 * and `mode`; extended (`!group` with cardinality operators) rule groups add the full rule
 * properties plus the inner sub-query's `conjunction`/`not`.
 */
export interface RAQBRuleGroupProperties extends RAQBRuleProperties {
  mode?: RAQBRuleGroupMode;
  conjunction?: string;
  not?: boolean;
}

/** Properties of a RAQB `case_group` item. */
export interface RAQBCaseGroupProperties extends RAQBBasicItemProperties {
  field?: string | null;
  value?: unknown[];
  valueSrc?: RAQBValueSource[];
  valueType?: string[];
}

/**
 * RAQB `children1`. An array by default; a keyed object when the tree was produced by
 * `getTree(tree, light, false)` (i.e. `children1AsArray` disabled) or is in the legacy
 * `OldJsonTree` shape.
 */
export type RAQBChildren<T = RAQBJsonItem> = T[] | Record<string, T>;

/** RAQB `rule` item. */
export interface RAQBJsonRule {
  type: 'rule';
  id?: string;
  properties: RAQBRuleProperties;
}

/** RAQB `group` item. */
export interface RAQBJsonGroup {
  type: 'group';
  id?: string;
  children1?: RAQBChildren;
  properties?: RAQBGroupProperties;
}

/** RAQB `rule_group` item (produced by `!struct`-mode and `!group` fields). */
export interface RAQBJsonRuleGroup {
  type: 'rule_group';
  id?: string;
  children1?: RAQBChildren;
  properties?: RAQBRuleGroupProperties;
}

/** RAQB `case_group` item (a single branch of a `switch_group`). */
export interface RAQBJsonCaseGroup {
  type: 'case_group';
  id?: string;
  children1?: RAQBChildren;
  properties?: RAQBCaseGroupProperties;
}

/** RAQB `switch_group` item (ternary/CASE-WHEN). Not supported by {@link parseRAQB}. */
export interface RAQBJsonSwitchGroup {
  type: 'switch_group';
  id?: string;
  children1?: RAQBChildren<RAQBJsonCaseGroup>;
  properties?: RAQBBasicItemProperties;
}

/** Any RAQB tree item. */
export type RAQBJsonItem =
  | RAQBJsonGroup
  | RAQBJsonRule
  | RAQBJsonRuleGroup
  | RAQBJsonCaseGroup
  | RAQBJsonSwitchGroup;

/** A complete RAQB query tree in plain-JSON form (the output of RAQB's `Utils.getTree()`). */
export type RAQBJsonTree = RAQBJsonGroup | RAQBJsonSwitchGroup;

/** RAQB list value entry (`fieldSettings.listValues`). */
export interface RAQBListValue {
  value?: unknown;
  title?: string;
  [k: string]: unknown;
}

/** RAQB tree value entry (`fieldSettings.treeValues`). */
export interface RAQBTreeValue extends RAQBListValue {
  children?: RAQBTreeValue[];
}

/** RAQB `fieldSettings`, flattened across all of RAQB's per-type settings interfaces. */
export interface RAQBFieldSettings {
  listValues?: RAQBListValue[] | Record<string, string> | string[];
  treeValues?: RAQBTreeValue[];
  allowCustomValues?: boolean;
  min?: number;
  max?: number;
  step?: number;
  maxLength?: number;
  labelYes?: string;
  labelNo?: string;
  [k: string]: unknown;
}

/** A RAQB field definition (simple, `!struct`, or `!group`). */
export interface RAQBField {
  type: string;
  label?: string;
  label2?: string;
  tooltip?: string;
  operators?: string[];
  excludeOperators?: string[];
  defaultOperator?: string;
  defaultValue?: unknown;
  valueSources?: RAQBValueSource[];
  fieldSettings?: RAQBFieldSettings;
  preferWidgets?: string[];
  hideForSelect?: boolean;
  hideForCompare?: boolean;
  /** Present when `type` is `"!struct"` or `"!group"`. */
  subfields?: Record<string, RAQBField>;
  /** Present when `type` is `"!group"`. */
  mode?: RAQBRuleGroupMode;
  [k: string]: unknown;
}

/** The subset of a RAQB `Config` used by {@link parseRAQBFields}. */
export interface RAQBConfig {
  fields: Record<string, RAQBField>;
  settings?: {
    fieldSeparator?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}

/** Reasons a RAQB construct could not be converted. */
export type RAQBUnsupportedReason =
  | 'switch_group'
  | 'case_group'
  | 'operator'
  | 'match_mode'
  | 'field'
  | 'func'
  | 'value_source';

/** Details passed to {@link ParseRAQBOptions.onUnsupported}. */
export interface RAQBUnsupportedInfo {
  reason: RAQBUnsupportedReason;
  /** The RAQB identifier that could not be mapped (operator key, func name, field path, etc.). */
  key?: string;
  /** Human-readable explanation. */
  message: string;
}

/**
 * Options recognized by the "raqb" {@link formatQuery} format, passed through
 * {@link FormatQueryOptions.context}.
 */
export interface FormatRAQBContext {
  /**
   * Character used to qualify sub-query rule field names with their parent `!group` field name
   * (RAQB stores them as e.g. `cars.vendor`). Should match the config's `settings.fieldSeparator`.
   *
   * @default '.'
   */
  raqbFieldSeparator?: string;
  /**
   * Additional or overriding RQB-to-RAQB operator mappings, merged over the defaults. Keyed by
   * RQB operator name.
   */
  raqbOperatorMap?: Record<string, string>;
  /**
   * Additional or overriding `@react-querybuilder/expr`-to-RAQB function name mappings, merged
   * over the defaults (`lower` → `LOWER`, `upper` → `UPPER`). Functions absent from the merged
   * map are passed through with their original name.
   */
  raqbFunctionMap?: Record<string, string>;
  /**
   * RQB expressions store function arguments in an ordered array, while RAQB stores them in a
   * keyed object. By default, arguments are keyed `arg0`, `arg1`, etc. Use this option to specify
   * explicit argument names per function, keyed by the _RAQB_ function name.
   *
   * @example
   * ```ts
   * { raqbFuncArgOrder: { RELATIVE_DATETIME: ['date', 'op', 'val', 'dim'] } }
   * ```
   */
  raqbFuncArgOrder?: Record<string, string[]>;
  /**
   * When `false`, relative date/time values (`{ mode: "relative", anchor, offset, unit }`) are
   * emitted as plain values instead of RAQB built-in date/time function calls.
   *
   * @default true
   */
  raqbRelativeDateTimes?: boolean;
  /**
   * When `true`, `valueType` entries are emitted alongside each operand based on the field's
   * `inputType`/`valueEditorType`. RAQB only validates `valueType` when present, so this is off
   * by default to avoid spurious validation errors from imprecise inference.
   *
   * @default false
   */
  raqbValueTypes?: boolean;
}
