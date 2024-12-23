---
title: TypeScript reference
---

These are some of the [TypeScript](https://www.typescriptlang.org/) types and interfaces you'll see throughout the documentation. Even if you are not using TypeScript, you can use the information below to understand the required shape of the props and function parameters.

:::note

Some of the definitions below have been simplified from their actual implementations for legibility and ease of comprehension.

The **[API documentation](/api)**, however, is generated directly from the source code and provides direct links to the actual definitions of each type within the repository should you need more detailed information.

:::

## Fields

```ts
interface Field {
  id?: string; // The field identifier (if not provided, `name` will be used)
  name: string; // The field name (REQUIRED)
  label: string; // The field label (REQUIRED)
  operators?: OptionList<Operator>[]; // Array of operators (if not provided, `getOperators()` will be used)
  valueEditorType?: ValueEditorType; // Value editor type for this field (if not provided, `getValueEditorType()` will be used)
  inputType?: string | null; // @type attribute for the <input /> rendered by ValueEditor, e.g. 'text', 'number', or 'date' (if not provided, `getInputType()` will be used)
  values?: OptionList; // Array of value options, applicable when valueEditorType is 'select', 'radio', or 'multiselect' (if not provided, `getValues()` will be used)
  defaultOperator?: string; // Default operator for this field (if not provided, `getDefaultOperator()` will be used)
  defaultValue?: any; // Default value for this field (if not provided, `getDefaultValue()` will be used)
  placeholder?: string; // Placeholder text for the value editor when this field is selected
  validator?: RuleValidator; // Validation function for rules that specify this field
  valueSources?: ValueSources | ((operator: string) => ValueSources); // List of allowed value sources (must contain "value", "field", or both)
  comparator?: string | ((f: Field, operator: string) => boolean); // Determines which (other) fields to include in the list when the rule's valueSource is "field"
  className?: Classname; // Assigned to rules where this field is selected
  separator?: ReactNode; // Rendered between multiple value editors, e.g. when the operator is "between" or "notBetween"
}
```

Notes:

- `Field` extends the `Option` interface, which is described [below](#option-lists).
- More information on `valueEditorType` is available [below](#value-editor) and in the [`ValueEditor` component documentation](./components/valueeditor).

## Rules and groups

_For more information about the `Path` type, see [Path concepts](./tips/path)._

```ts
type Path = number[];

type RuleType = {
  path?: Path;
  id?: string;
  disabled?: boolean;
  field: string;
  operator: string;
  value: any;
  valueSource?: ValueSource;
};

type RuleGroupType = {
  path?: Path;
  id?: string;
  disabled?: boolean;
  combinator: string;
  rules: (RuleType | RuleGroupType)[];
  not?: boolean;
};

type RuleGroupTypeIC = {
  path?: Path;
  id?: string;
  disabled?: boolean;
  rules: (RuleType | RuleGroupTypeIC | string)[]; // see note below
  not?: boolean;
};

type RuleGroupTypeAny = RuleGroupType | RuleGroupTypeIC;

type RuleOrGroupArray = RuleGroupType['rules'] | RuleGroupTypeIC['rules'];
```

:::info

`RuleGroupTypeIC` (see [independent combinators](./components/querybuilder#independent-combinators)) is _greatly_ simplified here for brevity. In reality, the following conditions will be enforced by TypeScript:

- All even indexes in the `rules` array must be of type `RuleType` or `RuleGroupTypeIC`.
- All odd indexes in the `rules` array must be of type `string`.
- The array length must be zero or an odd number, therefore the first and last elements of the `rules` array must be of type `RuleType` or `RuleGroupTypeIC`.

For example, the following would be invalid because the first element in the `rules` array (the `0`th index, which should be `RuleType | RuleGroupTypeIC`) is a `string`, and the second element (the `1`st index, which should be a `string`) is a `RuleType`. Also, the length is an even number (2).

```ts
const ruleGroupInvalid: RuleGroupTypeIC = {
  rules: ['and', { field: 'firstName', operator: '=', value: 'Steve' }],
};
```

We can resolve this issue by either removing the first element or inserting another rule before it:

```ts
const ruleGroupValid1: RuleGroupTypeIC = {
  rules: [{ field: 'firstName', operator: '=', value: 'Steve' }],
};

// OR

const ruleGroupValid2: RuleGroupTypeIC = {
  rules: [
    { field: 'lastName', operator: '=', value: 'Vai' },
    'and',
    { field: 'firstName', operator: '=', value: 'Steve' },
  ],
};
```

:::

## Export

```ts
type ExportFormat =
  | 'json'
  | 'sql'
  | 'json_without_ids'
  | 'parameterized'
  | 'parameterized_named'
  | 'mongodb'
  | 'mongodb_query'
  | 'cel'
  | 'jsonlogic'
  | 'jsonata'
  | 'elasticsearch'
  | 'spel'
  | 'natural_language';

interface FormatQueryOptions {
  format?: ExportFormat;
  valueProcessor?: ValueProcessor;
  ruleProcessor?: RuleProcessor;
  quoteFieldNamesWith?: string | [string, string];
  fieldIdentifierSeparator?: string;
  quoteValuesWith?: string;
  validator?: QueryValidator;
  fields?: OptionList<Field>;
  getOperators?: (
    field: string,
    misc: { fieldData: FullField }
  ) => FlexibleOptionList<FullOperator> | null;
  fallbackExpression?: string;
  paramPrefix?: string;
  paramsKeepPrefix?: boolean;
  numberedParams?: boolean;
  parseNumbers?: ParseNumberMethod;
  placeholderFieldName?: string;
  placeholderOperatorName?: string;
  concatOperator?: string;
  preset?: SQLPreset;
  context?: Record<string, any>;
}

type RuleProcessor = (rule: RuleType, options?: ValueProcessorOptions) => any;

type ValueProcessor = (field: string, operator: string, value: any) => string;

interface ValueProcessorOptions extends FormatQueryOptions {
  escapeQuotes?: boolean;
  fieldData?: Field;
  fieldParamNames?: Record<string, string[]>;
  getNextNamedParam?: (field: string) => string;
  wrapValueWith?: [string, string];
}

interface ParameterizedSQL {
  sql: string;
  params: any[];
}

interface ParameterizedNamedSQL {
  sql: string;
  params: { [p: string]: any };
}

type ParseNumberMethod = boolean | 'enhanced' | 'native' | 'strict';
```

## Import

```ts
interface ParserCommonOptions {
  fields?: OptionList<Field>[] | Record<string, Field>;
  getValueSources?: (field: string, operator: string) => ValueSources;
  listsAsArrays?: boolean;
  independentCombinators?: boolean;
}

interface ParseSQLOptions extends ParserCommonOptions {
  paramPrefix?: string;
  params?: any[] | Record<string, any>;
}

type ParseCELOptions = ParserCommonOptions;

type ParseSpELOptions = ParserCommonOptions;

type ParseJsonLogicOptions = ParserCommonOptions;

interface ParseMongoDbOptions extends ParserCommonOptions {
  preventOperatorNegation?: boolean;
  additionalOperators?: Record<
    string,
    (operator: string, value: any, otherOptions: ParserCommonOptions) => RuleType | RuleGroupType
  >;
}
```

## Validation

```ts
interface ValidationResult {
  valid: boolean;
  reasons?: any[];
}

interface ValidationMap {
  [id: string]: boolean | ValidationResult;
}

type QueryValidator = (query: RuleGroupTypeAny) => boolean | ValidationMap;

type RuleValidator = (rule: RuleType) => boolean | ValidationResult;
```

## Option lists

_As of version 7, options and lists can use `name` **or** `value` as the item identifier. Both `name` and `value` will be passed down to subcomponents, so `name` will be available even if `value` is used in props and vice versa. `name` is used in the documentation for brevity and backwards compatibility. [Click here for more information](./tips/option-lists)._

```ts
interface Option {
  name: string;
  label: string;
  [x: string]: any;
}

interface OptionGroup {
  label: string;
  options: Option[];
}

type OptionList = Option[] | OptionGroup[];

interface Combinator extends Option {
  className?: Classname; // Assigned to groups where this combinator is selected
}

interface Operator extends Option {
  arity?: number | 'unary' | 'binary' | 'ternary';
  className?: Classname; // Assigned to rules where this operator is selected
}
```

## Value editor

See [`ValueEditor` component documentation here](./components/valueeditor).

```ts
type ValueEditorType =
  | 'text'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'textarea'
  | 'multiselect'
  | 'date'
  | 'datetime-local'
  | 'time'
  | null;

type ValueSource = 'value' | 'field';

type ValueSources = ['value'] | ['value', 'field'] | ['field', 'value'] | ['field'];
```

## Miscellaneous

```ts
interface Schema {
  qbId: string;
  fields: OptionList<Field>;
  fieldMap: Record<string, Field>;
  classNames: Classnames;
  combinators: OptionList<Combinator>;
  controls: Controls;
  createRule(): RuleType;
  createRuleGroup(): RuleGroupTypeAny;
  dispatchQuery(query: RuleGroupTypeAny): void;
  getQuery(): RuleGroupTypeAny | undefined;
  getOperators(field: string): OptionList<Operator>;
  getValueEditorType(field: string, operator: string): ValueEditorType;
  getValueEditorSeparator(field: string, operator: string): ReactNode;
  getValueSources(field: string, operator: string): ValueSources;
  getInputType(field: string, operator: string): string | null;
  getValues(field: string, operator: string): OptionList;
  getRuleClassname(rule: RuleType): Classname;
  getRuleGroupClassname(ruleGroup: RuleGroupTypeAny): Classname;
  showCombinatorsBetweenRules: boolean;
  showNotToggle: boolean;
  showShiftActions: boolean;
  showCloneButtons: boolean;
  showLockButtons: boolean;
  autoSelectField: boolean;
  autoSelectOperator: boolean;
  addRuleToNewGroups: boolean;
  enableDragAndDrop: boolean;
  validationMap: ValidationMap;
  independentCombinators: boolean;
  listsAsArrays: boolean;
  parseNumbers: ParseNumbersMethod;
  disabledPaths: Path[];
}

interface QueryActions {
  onGroupAdd(group: RuleGroupTypeAny, parentPath: Path, context?: any): void;
  onGroupRemove(path: Path): void;
  onPropChange(
    prop: Exclude<keyof RuleType | keyof RuleGroupType, 'id' | 'path'>,
    value: any,
    path: Path
  ): void;
  onRuleAdd(rule: RuleType, parentPath: Path, context?: any): void;
  onRuleRemove(path: Path): void;
  moveRule(oldPath: Path, newPath: Path, clone?: boolean): void;
}
```
