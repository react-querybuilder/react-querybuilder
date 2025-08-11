---
title: Managing fields
description: Generate a field array from database table/view specification
---

The [`fields`](../components/querybuilder#fields) array is probably the most foundational configuration in React Query Builder.

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

Field arrays often map directly to database table columns. You can generate the `fields` array by querying the database information schema.

The following examples provide starting points for database-specific queries. Each platform has syntax variations and data type quirks, so examples aren't identical. Common patterns:

- None of the properties assigned below are required in the `fields` prop except for `label` and at least one of `name` or `value`.
- `label` is selected from the same configuration as `name` and `value`, but you'll probably want to grab a more user-friendly caption from somewhere else.
- `datatype` (used in the [date/time package](../datetime), but not, strictly speaking, an "official" `Field` property) will be copied verbatim from the declared type for the column per the platform.
- `inputType` will be normalized to an HTML5 input type, or `null` if one cannot be reliably inferred.
- The examples below cast `defaultValue` as text unconditionally. You may want a more sophisticated conversion to the appropriate type for your application. `defaultValue` will be `null` if a default is not set in the table configuration.

> _Note that `inputType: null` and `defaultValue: null` can lead to different behaviors than having them not defined or having a value of `undefined`. You may want to remove instances of the strings `, "inputType": null` and `, "defaultValue": null` from the result, or perhaps fall back to the empty string (`""`)._

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
