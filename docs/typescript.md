---
title: TypeScript
---

These are some of the [TypeScript](https://www.typescriptlang.org/) types and interfaces you'll see throughout the documentation. Even if you are not using TypeScript (you really should! 😊), you can use the information below to understand the required shape of the props and function parameters. To see the full type definitions for the `react-querybuilder` library, [click here](https://github.com/react-querybuilder/react-querybuilder/blob/master/src/types.ts).

## Fields

```ts
interface Field {
  id?: string; // The field identifier (if not provided, then `name` will be used)
  name: string; // REQUIRED - the field name
  label: string; // REQUIRED - the field label
  operators?: NameLabelPair[]; // Array of operators (if not provided, then `getOperators()` will be used)
  valueEditorType?: ValueEditorType; // Value editor type for this field (if not provided, then `getValueEditorType()` will be used)
  inputType?: string | null; // Input type for text box inputs, e.g. 'text', 'number', or 'date' (if not provided, then `getInputType()` will be used)
  values?: NameLabelPair[]; // Array of values, applicable when valueEditorType is 'select' or 'radio' (if not provided, then `getValues()` will be used)
  defaultOperator?: string; // Default operator for this field (if not provided, then `getDefaultOperator()` will be used)
  defaultValue?: any; // Default value for this field (if not provided, then `getDefaultValue()` will be used)
  placeholder?: string; // Value to be displayed in the placeholder of the text field
  validator?: RuleValidator; // Called when a rule specifies this field
}
```

## Rules and groups

```ts
interface RuleType {
  path?: number[];
  id?: string;
  field: string;
  operator: string;
  value: any;
}

interface RuleGroupType {
  path?: number[];
  id?: string;
  combinator: string;
  rules: (RuleType | RuleGroupType)[];
  not?: boolean;
}

interface RuleGroupTypeIC {
  path?: number[];
  id?: string;
  rules: (RuleType | RuleGroupTypeIC | string)[];
  not?: boolean;
}

type RuleGroupTypeAny = RuleGroupType | RuleGroupTypeIC;

type RuleOrGroupArray =
  | (RuleType | RuleGroupType)[]
  | (RuleType | RuleGroupTypeIC | string)[];

interface Schema {
  fields: Field[];
  fieldMap: { [k: string]: Field };
  classNames: Classnames;
  combinators: NameLabelPair[];
  controls: Controls;
  createRule(): RuleType;
  createRuleGroup(): RuleGroupTypeAny;
  getOperators(field: string): NameLabelPair[];
  getValueEditorType(field: string, operator: string): ValueEditorType;
  getInputType(field: string, operator: string): string | null;
  getValues(field: string, operator: string): NameLabelPair[];
  isRuleGroup(ruleOrGroup: RuleType | RuleGroupTypeAny): ruleOrGroup is RuleGroupTypeAny;
  onGroupAdd(group: RuleGroupTypeAny, parentPath: number[]): void;
  onGroupRemove(path: number[]): void;
  onPropChange(
    prop: Exclude<keyof RuleType | keyof RuleGroupType, 'id' | 'path'>,
    value: any,
    path: number[]
  ): void;
  onRuleAdd(rule: RuleType, parentPath: number[]): void;
  onRuleRemove(path: number[]): void;
  updateIndependentCombinator(value: string, path: number[]): void;
  showCombinatorsBetweenRules: boolean;
  showNotToggle: boolean;
  showCloneButtons: boolean;
  autoSelectField: boolean;
  addRuleToNewGroups: boolean;
  enableDragAndDrop: boolean;
  validationMap: ValidationMap;
  independentCombinators: boolean;
}
```

## Export

```ts
type ExportFormat =
  | 'json'
  | 'sql'
  | 'json_without_ids'
  | 'parameterized'
  | 'parameterized_named'
  | 'mongodb';

type ValueProcessor = (field: string, operator: string, value: any) => string;

interface FormatQueryOptions {
  format?: ExportFormat;
  valueProcessor?: ValueProcessor;
  quoteFieldNamesWith?: string;
  validator?: QueryValidator;
  fields?: { name: string; validator?: RuleValidator; [k: string]: any }[];
  fallbackExpression?: string;
  paramPrefix?: string;
}

interface ParameterizedSQL {
  sql: string;
  params: any[];
}

interface ParameterizedNamedSQL {
  sql: string;
  params: { [p: string]: any };
}
```

## Import

```ts
interface ParseSQLOptions {
  independentCombinators?: boolean;
  paramPrefix?: string;
  params?: any[] | { [p: string]: any };
  listsAsArrays?: boolean;
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

## Miscellaneous

```ts
interface NameLabelPair {
  name: string;
  label: string;
  [x: string]: any;
}

type ValueEditorType = 'text' | 'select' | 'checkbox' | 'radio' | null;
```
