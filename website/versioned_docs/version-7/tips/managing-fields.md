---
title: Managing fields
description: Generate a field array from database table/view specification
---

The [`fields`](../components/querybuilder#fields) array forms the foundation of React Query Builder configuration, defining which data fields users can query against.

<!--
TODO: Review each property in detail.
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
-->

## Generating `fields` dynamically

Field arrays typically correspond to database table columns. You can dynamically generate the `fields` array by querying your database's information schema.

The following examples demonstrate database-specific queries to extract field information. Each platform has unique syntax and data type handling, resulting in different query structures. Key patterns include:

- Only `label` and at least one of `name` or `value` are required in the `fields` prop; other properties are optional.
- `label` typically uses the same value as `name` and `value`, but consider using more user-friendly captions from other sources.
- `datatype` (used by the [date/time package](../datetime), though not an official `Field` property) copies the column's declared type directly.
- `inputType` gets normalized to HTML5 input types, or `null` when no reliable mapping exists.
- These examples cast `defaultValue` as text; consider more sophisticated type conversions for your specific needs. `defaultValue` will be `null` when no default is configured.

> **Note:** `inputType: null` and `defaultValue: null` behave differently than `undefined` or missing properties. Consider removing `null` values from the query results or substituting empty strings (`""`) as needed.

### Relational databases

#### PostgreSQL

```sql
SELECT json_agg(
    json_build_object(
      'name', column_name,
      'value', column_name,
      'label', column_name,
      'datatype', data_type || CASE WHEN data_type LIKE '%char%' THEN '(' || character_maximum_length || ')' END,
      'defaultValue', column_default::text,
      'inputType', CASE
        WHEN data_type LIKE '%char%' OR data_type = 'text' THEN 'text'
        WHEN data_type IN ('integer', 'bigint', 'smallint', 'decimal', 'numeric', 'real', 'double precision') THEN 'number'
        WHEN data_type = 'date' THEN 'date'
        WHEN data_type LIKE 'timestamp%' THEN 'datetime-local'
        WHEN data_type LIKE 'time%' THEN 'time'
      END
    ) ORDER BY ordinal_position
  ) AS fields
FROM information_schema.columns
WHERE table_name = 'my_table';
```

#### MySQL

```sql
SELECT JSON_ARRAYAGG(
    JSON_OBJECT(
      'name', COLUMN_NAME,
      'value', COLUMN_NAME,
      'label', COLUMN_NAME,
      'datatype', DATA_TYPE,
      'defaultValue', CAST(column_default AS CHAR),
      'inputType', CASE
        WHEN DATA_TYPE LIKE '%char%' OR DATA_TYPE = 'text' THEN 'text'
        WHEN DATA_TYPE IN ('int', 'bigint', 'smallint', 'decimal', 'dec', 'fixed', 'numeric', 'float', 'double', 'double precision') THEN 'number'
        WHEN DATA_TYPE = 'date' THEN 'date'
        WHEN DATA_TYPE = 'time' THEN 'time'
        WHEN DATA_TYPE IN ('datetime', 'timestamp') THEN 'datetime-local'
      END
    )
  ) AS fields
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'my_table';
```

#### SQLite

```sql
SELECT json_group_array(
      json_object(
        'name', name,
        'value', name,
        'label', name,
        'datatype', type,
        'defaultValue', dflt_value,
        'inputType', CASE
          WHEN UPPER(type) LIKE '%INT%' OR UPPER(type) LIKE '%REAL%' OR UPPER(type) LIKE '%FLOA%' OR UPPER(type) LIKE '%DOUB%' THEN 'number'
        END,
        'affinity', CASE -- See https://sqlite.org/datatype3.html#type_affinity
          WHEN UPPER(type) LIKE '%INT%' THEN 'INTEGER'
          WHEN UPPER(type) LIKE '%CHAR%' OR UPPER(type) LIKE '%CLOB%' OR UPPER(type) LIKE '%TEXT%' THEN 'TEXT'
          WHEN UPPER(type) LIKE '%BLOB%' OR type IS NULL THEN 'BLOB'
          WHEN UPPER(type) LIKE '%REAL%' OR UPPER(type) LIKE '%FLOA%' OR UPPER(type) LIKE '%DOUB%' THEN 'REAL'
          ELSE 'NUMERIC'
        END
      )
    ) fields
  FROM pragma_table_info('my_table')
 ORDER BY cid;
```

#### SQL Server

```sql
SELECT (
  SELECT
    COLUMN_NAME AS [name],
    COLUMN_NAME AS [value],
    COLUMN_NAME AS [label],
    CAST(COLUMN_DEFAULT AS CHAR) AS [defaultValue],
    CASE WHEN DATA_TYPE LIKE '%CHAR%' THEN CONCAT(DATA_TYPE, '(', CAST(ROUND(CHARACTER_MAXIMUM_LENGTH, 0) AS int), ')') ELSE DATA_TYPE END AS [datatype],
    CASE
      WHEN DATA_TYPE IN ('char', 'varchar', 'text', 'nchar', 'nvarchar', 'ntext') THEN 'text'
      WHEN DATA_TYPE IN ('tinyint', 'smallint', 'int', 'bigint', 'bit', 'decimal', 'numeric', 'money', 'smallmoney', 'float', 'real') THEN 'number'
      WHEN DATA_TYPE = 'date' THEN 'date'
      WHEN DATA_TYPE = 'time' THEN 'time'
      WHEN DATA_TYPE LIKE '%datetime%' THEN 'datetime-local'
    END AS [inputType]
    FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_NAME='my_table'
   ORDER BY ORDINAL_POSITION
     FOR JSON AUTO
) AS [fields];
```

#### Oracle

```sql
SELECT json_arrayagg(
    json_object(
      'name' VALUE column_name,
      'value' VALUE column_name,
      'label' VALUE column_name,
      'datatype' VALUE data_type || CASE WHEN data_type LIKE '%CHAR%' THEN '(' || data_length || ')' END,
      -- 'defaultValue' is omitted in this example because ALL_TAB_COLS.DATA_DEFAULT
      -- is type LONG which is difficult to convert to text without custom functions.
      'inputType' VALUE CASE
        WHEN data_type LIKE '%CHAR%' THEN 'text'
        WHEN data_type IN ('NUMBER', 'NUMERIC', 'FLOAT', 'DECIMAL', 'DEC', 'INTEGER', 'INT', 'SMALLINT') THEN 'number'
        WHEN data_type = 'DATE' THEN 'date'
        WHEN data_type = 'TIMESTAMP' THEN 'datetime-local'
      END
    ) ORDER BY column_id
  ) fields
  FROM all_tab_cols
 WHERE table_name = 'my_table';
```

### MongoDB

_Coming soon_

### ElasticSearch

_Coming soon_
