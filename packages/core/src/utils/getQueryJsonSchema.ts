import { betweenOperators, defaultCombinators, defaultOperators, inOperators } from '../defaults';
import type {
  BaseOptionMap,
  FlexibleOptionListProp,
  FullCombinator,
  FullField,
  FullOperator,
  JSONSchema,
  ValueSource,
} from '../types';
import { filterFieldsByComparator } from './filterFieldsByComparator';
import { getValueSourcesUtil } from './getValueSourcesUtil';
import { lc } from './misc';
import { prepareOptionList, toFlatOptionArray, toFullOptionList } from './optGroupUtils';

/**
 * Options for {@link getQueryJsonSchema}.
 */
export interface GetQueryJsonSchemaOptions {
  /** `'standard'` = `RuleGroupType`; `'ic'` = `RuleGroupTypeIC`. Default `'standard'`. */
  queryType?: 'standard' | 'ic';
  /**
   * `'full'` = per-field operator/value constraints (`anyOf` per field/operator class);
   * `'loose'` = field/operator enums only (smaller; for large `fields`). Default `'full'`.
   */
  mode?: 'full' | 'loose';
  /**
   * Provider compat (e.g. OpenAI structured outputs): `additionalProperties: false`
   * everywhere, all props required (optional ones nullable), root is an object. Default `false`.
   */
  strict?: boolean;
  /**
   * Group recursion. `'ref'` (default) = recursive `$ref`. Number = max nested group depth
   * below root, fully inlined (no `$ref`/`$defs`) for providers w/o recursion support.
   */
  maxDepth?: 'ref' | number;
  /** Include `id`/`path` props. Default `false` (LLM output shouldn't invent ids). */
  includeIds?: boolean;
  /**
   * `true` = allow `valueSource: 'field'` for all fields; `false` = never.
   * Default: derived from each field's `valueSources`.
   */
  allowFieldValueSource?: boolean;
  /** Include `not` on groups. Default `true`. */
  includeNot?: boolean;
  /** Combinators. Default {@link defaultCombinators}. */
  combinators?: FlexibleOptionListProp<FullCombinator>;
  /** Fallback operators for fields w/o `operators`. Default {@link defaultOperators}. */
  operators?: FlexibleOptionListProp<FullOperator>;
  /** Add field `label`s as `description`s. Default `true`. */
  descriptions?: boolean;
  /** Emit `$schema` (draft-07). Default `false`. */
  includeSchemaDeclaration?: boolean;
  /**
   * List values (`between`/`in`/multiselect) as arrays (`true`, default) or
   * comma-separated strings (`false`). Should match `formatQuery`'s `listsAsArrays`.
   */
  listsAsArrays?: boolean;
}

type OpClass = 'unary' | 'binary' | 'between' | 'in';
type Props = Record<string, JSONSchema>;

const draft07 = 'http://json-schema.org/draft-07/schema#';
const dateHints: Record<string, string> = {
  date: 'Date (YYYY-MM-DD)',
  'datetime-local': 'Date/time (YYYY-MM-DDTHH:mm)',
  time: 'Time (HH:mm)',
  month: 'Month (YYYY-MM)',
  week: 'Week (YYYY-Www)',
};

const strEnum = (values: unknown[]): JSONSchema => ({ type: 'string', enum: values });

const uniq = <T>(arr: T[]): T[] => [...new Set(arr)];

// Adds `null` to a typed schema (strict mode optional props)
const nullable = (s: JSONSchema): JSONSchema => {
  const type = uniq([s.type!, 'null'].flat()) as JSONSchema['type'];
  return s.enum ? { ...s, type, enum: [...s.enum, null] } : { ...s, type };
};

const getOpClass = (op: FullOperator): OpClass => {
  const n = lc(op.name);
  if (n === 'null' || n === 'notnull') return 'unary';
  if (op.arity === 'unary' || (typeof op.arity === 'number' && op.arity < 2)) return 'unary';
  if ([...betweenOperators].some(o => lc(o) === n)) return 'between';
  if ([...inOperators].some(o => lc(o) === n)) return 'in';
  return 'binary';
};

/**
 * Generates a JSON Schema describing valid queries for the given `fields`.
 * Suitable for LLM structured output/tool input schemas, MCP `inputSchema`,
 * and generic validators (Ajv, etc.).
 *
 * Emits only keywords with identical meaning in draft-07 and 2020-12:
 * `type`, `properties`, `required`, `enum`, `anyOf`, `items` (single schema),
 * `minItems`/`maxItems`, `additionalProperties`, `description`, `$ref`, `$defs`.
 * No `oneOf`/`allOf`/`not`/`const`/`format`/`pattern`/tuples.
 *
 * Provider compat (`strict: true` recommended for all):
 * | Consumer                  | Notes                                             |
 * | ------------------------- | ------------------------------------------------- |
 * | OpenAI structured outputs | requires `strict`; recursion via `$ref` OK        |
 * | Anthropic tools           | `$ref`/`$defs` OK                                 |
 * | Gemini                    | use numeric `maxDepth` if `$ref` rejected         |
 * | AI SDK `jsonSchema()`     | passes through to provider                        |
 * | MCP `inputSchema`         | root must be object → use `strict` or `maxDepth`  |
 * | Ajv (draft-07 / 2020)     | all modes                                         |
 *
 * Schema is necessary but not sufficient: IC alternation (rule/group, combinator, ...)
 * and some operator/value pairings aren't expressible; check those with
 * `formatQuery(query, { format: 'diagnostics', fields })`.
 *
 * Only `'value'` and `'field'` value sources are represented.
 */
export const getQueryJsonSchema = (
  fields: FlexibleOptionListProp<FullField> | BaseOptionMap<FullField>,
  options: GetQueryJsonSchemaOptions = {}
): JSONSchema => {
  const {
    queryType = 'standard',
    mode = 'full',
    strict = false,
    maxDepth = 'ref',
    includeIds = false,
    allowFieldValueSource,
    includeNot = true,
    combinators = defaultCombinators,
    operators = defaultOperators,
    descriptions = true,
    includeSchemaDeclaration = false,
    listsAsArrays = true,
  } = options;

  const fieldList = prepareOptionList<FullField>({ optionList: fields }).optionList;
  const flatFields = toFlatOptionArray(fieldList);
  const fallbackOps = toFlatOptionArray(toFullOptionList<FullOperator>(operators));
  const combinatorNames = uniq(toFlatOptionArray(toFullOptionList(combinators)).map(c => c.name));

  // Builds object schema, applying strict rules
  const obj = (properties: Props, required: string[], description?: string): JSONSchema => {
    const props: Props = strict
      ? Object.fromEntries(
          Object.entries(properties).map(([k, v]) => [k, required.includes(k) ? v : nullable(v)])
        )
      : properties;
    return {
      type: 'object',
      ...(description ? { description } : {}),
      properties: props,
      required: strict ? Object.keys(props) : required,
      ...(strict ? { additionalProperties: false } : {}),
    };
  };

  const idProps: Props = includeIds
    ? { id: { type: 'string' }, path: { type: 'array', items: { type: 'integer' } } }
    : {};

  const listOf = (item: JSONSchema, cls: 'between' | 'in' | 'multi'): JSONSchema => {
    if (!listsAsArrays) {
      return {
        type: 'string',
        description:
          cls === 'between' ? 'Two comma-separated values' : 'Comma-separated list of values',
      };
    }
    return {
      type: 'array',
      items: item,
      ...(cls === 'between' ? { minItems: 2, maxItems: 2 } : {}),
    };
  };

  const getFieldOps = (f: FullField): FullOperator[] =>
    f.operators
      ? toFlatOptionArray(toFullOptionList<FullOperator>(f.operators as unknown[]))
      : fallbackOps;

  const getValueSources = (f: FullField, op: string): ValueSource[] => {
    const vs = getValueSourcesUtil(f, op).map(v => v.value);
    const result = uniq(allowFieldValueSource === true ? [...vs, 'field' as const] : vs).filter(
      v => (v === 'value' || v === 'field') && (v !== 'field' || allowFieldValueSource !== false)
    );
    return result.length > 0 ? result : ['value'];
  };

  // Scalar schema for valueSource 'value'
  const scalarFor = (f: FullField, op: string): { schema: JSONSchema; multi: boolean } => {
    const vet = typeof f.valueEditorType === 'function' ? f.valueEditorType(op) : f.valueEditorType;
    if (vet === 'checkbox' || vet === 'switch')
      return { schema: { type: 'boolean' }, multi: false };
    const values = f.values
      ? toFlatOptionArray(toFullOptionList(f.values as unknown[])).map(v => v.name)
      : [];
    if (values.length > 0 && vet !== 'text' && vet !== 'textarea') {
      return { schema: strEnum(uniq(values)), multi: vet === 'multiselect' };
    }
    const multi = vet === 'multiselect';
    if (f.inputType === 'number') return { schema: { type: 'number' }, multi };
    const hint = f.inputType ? dateHints[f.inputType] : undefined;
    return { schema: hint ? { type: 'string', description: hint } : { type: 'string' }, multi };
  };

  const valueSchemaFor = (cls: OpClass, scalar: JSONSchema, multi: boolean): JSONSchema =>
    cls === 'between'
      ? listOf(scalar, 'between')
      : cls === 'in'
        ? listOf(scalar, 'in')
        : multi
          ? listOf(scalar, 'multi')
          : scalar;

  // Value-shape variants (value/valueSource props + required) for a field/operator
  const shapesFor = (f: FullField, op: FullOperator): { props: Props; required: string[] }[] => {
    const cls = getOpClass(op);
    if (cls === 'unary') {
      return [{ props: { value: { type: 'string', description: 'Ignored' } }, required: [] }];
    }
    const vss = getValueSources(f, op.name);
    const shapes: { props: Props; required: string[] }[] = [];
    for (const vs of vss) {
      if (vs === 'value') {
        const { schema, multi } = scalarFor(f, op.name);
        shapes.push({
          props: {
            valueSource: strEnum(['value']),
            value: valueSchemaFor(cls, schema, multi),
          },
          required: ['value'],
        });
      } else {
        const names = uniq(
          toFlatOptionArray(filterFieldsByComparator(f, fieldList, op.name) as FullField[]).map(
            c => c.name
          )
        );
        if (names.length > 0) {
          shapes.push({
            props: {
              valueSource: strEnum(['field']),
              value: valueSchemaFor(cls, strEnum(names), false),
            },
            required: ['valueSource', 'value'],
          });
        }
      }
    }
    return shapes;
  };

  const fieldBranches = (f: FullField): JSONSchema[] => {
    // Group operators w/ identical value shapes
    const groups = new Map<string, { ops: string[]; props: Props; required: string[] }>();
    for (const op of getFieldOps(f)) {
      for (const shape of shapesFor(f, op)) {
        const key = JSON.stringify(shape);
        const existing = groups.get(key);
        if (existing) existing.ops.push(op.name);
        else groups.set(key, { ops: [op.name], ...shape });
      }
    }
    const description = descriptions && f.label !== f.name ? f.label : undefined;
    return [...groups.values()].map(g =>
      obj(
        {
          ...idProps,
          field: strEnum([f.name]),
          operator: strEnum(uniq(g.ops)),
          ...g.props,
        },
        ['field', 'operator', ...g.required],
        description
      )
    );
  };

  const looseRule = (): JSONSchema => {
    const fieldNames = uniq(flatFields.map(f => f.name));
    const opNames = uniq(
      (flatFields.length > 0 ? flatFields.flatMap(f => getFieldOps(f)) : fallbackOps).map(
        o => o.name
      )
    );
    const anyField = flatFields.some(f =>
      getFieldOps(f).some(op => getValueSources(f, op.name).includes('field'))
    );
    const scalar: JSONSchema[] = [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }];
    const value: JSONSchema = strict
      ? { anyOf: [...scalar, { type: 'array', items: { anyOf: scalar } }] }
      : {};
    return obj(
      {
        ...idProps,
        field: fieldNames.length > 0 ? strEnum(fieldNames) : { type: 'string' },
        operator: strEnum(opNames),
        ...(anyField ? { valueSource: strEnum(['value', 'field']) } : {}),
        value,
      },
      ['field', 'operator', 'value']
    );
  };

  const ruleSchema = ((): JSONSchema => {
    if (mode === 'loose' || flatFields.length === 0) return looseRule();
    const branches = flatFields.flatMap(f => fieldBranches(f));
    return branches.length === 1 ? branches[0] : { anyOf: branches };
  })();

  const groupSchema = (rule: JSONSchema, child: JSONSchema | null): JSONSchema => {
    const members = child ? [rule, child] : [rule];
    const props: Props = { ...idProps };
    const required: string[] = ['rules'];
    if (queryType === 'ic') {
      props.rules = {
        type: 'array',
        description: 'Alternating rules/groups and combinator strings',
        items: { anyOf: [...members, strEnum(combinatorNames)] },
      };
    } else {
      props.combinator = strEnum(combinatorNames);
      required.unshift('combinator');
      props.rules = { type: 'array', items: members.length === 1 ? rule : { anyOf: members } };
    }
    if (includeNot) props.not = { type: 'boolean' };
    return obj(props, required);
  };

  const decl: JSONSchema = includeSchemaDeclaration ? { $schema: draft07 } : {};

  if (typeof maxDepth === 'number') {
    let schema = groupSchema(ruleSchema, null);
    for (let i = 0; i < Math.max(0, Math.floor(maxDepth)); i++) {
      schema = groupSchema(ruleSchema, schema);
    }
    return { ...decl, ...schema };
  }

  const ruleRef: JSONSchema = { $ref: '#/$defs/rule' };
  const groupRef: JSONSchema = { $ref: '#/$defs/group' };
  const group = groupSchema(ruleRef, groupRef);
  const $defs = { group, rule: ruleSchema };

  // Strict: root must be an object, not a $ref
  return strict ? { ...decl, ...group, $defs } : { ...decl, $defs, ...groupRef };
};
