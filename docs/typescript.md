---
title: TypeScript
sidebar_position: 9
---

These are some of the [TypeScript](https://www.typescriptlang.org/) types and interfaces you'll see throughout the documentation. Even if you are not using TypeScript (you really should! 😊), you can use the information below to understand the required shape of the props and function parameters. To see the full type definitions for the `react-querybuilder` library, [click here](https://github.com/react-querybuilder/react-querybuilder/blob/master/src/types.ts).

```ts
interface NameLabelPair {
  name: string;
  label: string;
  [x: string]: any;
}

interface ValidationResult {
  valid: boolean;
  reasons?: any[];
}

interface ValidationMap {
  [id: string]: boolean | ValidationResult;
}

type QueryValidator = (query: RuleGroupTypeAny) => boolean | ValidationMap;

type RuleValidator = (rule: RuleType) => boolean | ValidationResult;

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

type ExportFormat =
  | 'json'
  | 'sql'
  | 'json_without_ids'
  | 'parameterized'
  | 'parameterized_named'
  | 'mongodb';

type ValueProcessor = (field: string, operator: string, value: any) => string;

type ValueEditorType = 'text' | 'select' | 'checkbox' | 'radio' | null;

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

interface ParseSQLOptions {
  inlineCombinators?: boolean;
  paramPrefix?: string;
  params?: any[] | { [p: string]: any };
}
```
