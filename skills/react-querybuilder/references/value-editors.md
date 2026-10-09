# Value editors

## Built-in editor types

Set via `field.valueEditorType` (or the `getValueEditorType` prop):

| Type             | Renders                       | Value                                       |
| ---------------- | ----------------------------- | ------------------------------------------- |
| `text` (default) | `<input type={inputType}>`    | string (numbers too, unless `parseNumbers`) |
| `textarea`       | `<textarea>`                  | string                                      |
| `select`         | `<select>` from `values`      | option `name`                               |
| `multiselect`    | `<select multiple>`           | comma string, or array with `listsAsArrays` |
| `radio`          | radio group from `values`     | option `name`                               |
| `checkbox`       | checkbox                      | boolean                                     |
| `switch`         | switch (checkbox in base pkg) | boolean                                     |
| `null`           | nothing                       | n/a                                         |

- `between`/`notBetween` render two editors. `in`/`notIn` with `text` render one input expecting a comma-separated list.
- `parseNumbers` (`true`, `'strict'`, `'enhanced'`, `'native'`, or `'*-limited'` to apply only to `inputType: 'number'`) converts numeric strings to numbers in the stored query. `'strict-limited'` is usually the safest choice.

## Custom value editor

1. Declare the component at **module scope** (never inside another component).
2. Accept `ValueEditorProps`; call `handleOnChange(newValue)` to update.
3. Fall back to the default `ValueEditor` for everything you don't handle.
4. Pass the component reference: `controlElements={{ valueEditor: MyValueEditor }}`.

```tsx
import { QueryBuilder, ValueEditor } from 'react-querybuilder';
import type { ValueEditorProps } from 'react-querybuilder';

const MyValueEditor = (props: ValueEditorProps) => {
  if (props.fieldData.datatype === 'rating') {
    return (
      <input
        type="range"
        min={0}
        max={5}
        value={props.value ?? 0}
        disabled={props.disabled}
        className={props.className}
        onChange={e => props.handleOnChange(Number(e.target.value))}
      />
    );
  }
  return <ValueEditor {...props} />;
};

// Usage:
// <QueryBuilder fields={fields} controlElements={{ valueEditor: MyValueEditor }} />
```

Useful `ValueEditorProps`: `value`, `handleOnChange`, `field`, `fieldData` (full field object, including custom properties), `operator`, `valueSource`, `type`, `inputType`, `values`, `listsAsArrays`, `parseNumbers`, `rule`, `path`, `level`, `disabled`, `className`, `context`, `validation`, `schema`.

## With a UI package

- UI packages provide their own `valueEditor` (e.g. `MaterialValueEditor`, `AntDValueEditor`). To customize while keeping the styling, fall back to that component instead of the base `ValueEditor`.
- `useValueEditor(props)` exposes the base editor's logic (multi-value splitting, `between` handling) for fully custom rendering.

## Other control elements

`controlElements` also accepts `fieldSelector`, `operatorSelector`, `combinatorSelector`, `valueSourceSelector`, `addRuleAction`, `addGroupAction`, `removeRuleAction`, `removeGroupAction`, `notToggle`, `ruleGroup`, `rule`, `dragHandle`, and more. Check the `ControlElementsProp` type for the full list. Same rules apply: module-scope components, references not inline arrows.
