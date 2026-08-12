/**
 * `@react-querybuilder/core/derivations` — the pure, framework-agnostic subset of the core API.
 *
 * Every export here is a plain function, constant, or type. Nothing in this entry point references
 * {@link QueryManager}, so framework adapters that own their own state (Svelte runes, Solid stores,
 * Vue refs) can depend on the derivations without pulling the manager into their bundle. The
 * query-formatting and query-parsing surfaces are likewise excluded; import them from
 * `@react-querybuilder/core` or their own subpaths (`.../formatQuery`, `.../parseSQL`, etc.).
 *
 * The exclusion is enforced by `utils/check-derivations-purity.ts`, which runs after the build.
 *
 * Everything exported here is also exported from the package root, so this entry point is a
 * bundle-size optimization, never a source of distinct behavior.
 *
 * @module
 */

export * from './controlPropKeys';
export * from './defaults';
export * from './types';
export { strictAbortReasons } from './utils/abortReasons';
export * from './utils/arrayUtils';
export * from './utils/clsx';
export * from './utils/coalesce';
export * from './utils/convertQuery';
export * from './utils/defaultValidator';
export * from './utils/deriveClassNames';
export * from './utils/deriveRuleContext';
export * from './utils/deriveValueEditor';
export * from './utils/filterFieldsByComparator';
export * from './utils/generateAccessibleDescription';
export * from './utils/generateID';
export * from './utils/getMatchModesUtil';
export * from './utils/getParseNumberMethod';
export * from './utils/getRuleDefaultValue';
export * from './utils/getValidationClassNames';
export * from './utils/getValueSourcesUtil';
export { setAutoFreeze } from './utils/immerInstances';
export * from './utils/isRuleGroup';
export * from './utils/isRuleOrGroupValid';
export * from './utils/mergeAnyTranslations';
export * from './utils/mergeClassnames';
export * from './utils/misc';
export * from './utils/objectUtils';
export * from './utils/optGroupUtils';
export * from './utils/optionResolvers';
export * from './utils/optionsEqual';
export * from './utils/parseNumber';
export * from './utils/pathUtils';
export * from './utils/preferProp';
export * from './utils/prepareQueryObjects';
export * from './utils/queryActions';
export * from './utils/queryTools';
export * from './utils/regenerateIDs';
export * from './utils/ruleFactory';
export * from './utils/signature';
export * from './utils/transformQuery';
