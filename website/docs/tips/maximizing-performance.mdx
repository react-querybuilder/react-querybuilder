---
title: Maximizing rendering performance
description: How to avoid common pitfalls for a smoother user experience
hide_table_of_contents: true
---

import Admonition from '@theme/Admonition';
import AdmonitionIconCaution from '@theme/Admonition/Icon/Warning';

%importmd ../\_ts_admonition.md

:::tip TL;DR

Each prop passed to `QueryBuilder` should have a stable reference or be memoized.

:::

As of version 7, all `QueryBuilder` props, components, and derived values are aggressively memoized with `React.memo`, `useMemo`, `useCallback`, and immutability tools like [`immer`](https://immerjs.github.io/immer/). This can noticeably improve rendering performance for large queries, especially when using certain style libraries. To take advantage of these optimizations, _every_ prop passed to `QueryBuilder` (except `query`, if used) must have a stable reference or at least be memoized. For related reasons, we encourage the use of `QueryBuilder` as an uncontrolled component (assign `defaultQuery` instead of `query`).

## Avoiding common pitfalls

You can avoid unstable references by defining unchanging props, including object, array, and function definitions, outside the component rendering function. This commonly includes the `fields` array and `onQueryChange` callback. For props that _must_ be defined inside the component, memoize them with `useMemo` or `useCallback`. In particular, avoid defining non-primitive props inline in the JSX.

<!-- prettier-ignore -->
- <span style={{ color: 'green', fontWeight: 'bold' }}>✓ DO</span> define variables that will remain unchanged outside the component if possible.
- <span style={{ color: 'green', fontWeight: 'bold' }}>✓ DO</span> memoize objects, arrays, and other values that must be created and/or calculated within the component with `useMemo`.
- <span style={{ color: 'green', fontWeight: 'bold' }}>✓ DO</span> memoize functions that must be created within the component with `useCallback`.
- <span style={{ color: 'red', fontWeight: 'bold' }}>⚠ DO NOT</span> define objects, arrays, or functions inline in the JSX prop declarations.
  - This includes subcomponents—see [Custom component as closure](./common-mistakes#custom-component-as-closure).
  - Inline assignment of primitives like strings, numbers, and booleans is usually not a problem.

## Exceptions

Some props implement more granular memoization. Internally, `QueryBuilder` individually memoizes each property of the objects passed to these props:

- `controlClassnames`
- `controlElements`
- `translations` (even nested properties are memoized individually for `translations`)

## Examples

### "Bad" example

These patterns can be detrimental to the overall performance of `QueryBuilder`.

<Admonition type="danger" title="" icon={<AdmonitionIconCaution />}>

```tsx
function App() {
  const { t } = useTranslation(); // (<-- third-party i18n library)
  // ⚠ Even though this `useState` call only sets the initial `query` value once, the object
  // itself is still created on every render. This doesn't affect the stability of the reference,
  // but it's probably a good idea to define the object outside the component anyway.
  const [query, setQuery] = useState({ combinator: 'and', rules: [] });

  // ❌ This function is not memoized and will get recreated on each render.
  const getOperators = (field: Field) => t(defaultOperators);

  return (
    <QueryBuilder
      // ⚠ As a controlled component with potential for updates (not disabled), an unstable
      // reference to `query` is unavoidable. This is generally not a problem, but using
      // `defaultQuery` instead of `query` could avoid the issue entirely.
      query={query}
      //
      // ❌ Inline function definition. Also see note below about `useState`/`useReducer`.
      onQueryChange={q => setQuery(q)}
      //
      // ❌ Inline definition of an array that doesn't change over time.
      fields={[
        { name: 'firstName', label: 'First Name' },
        { name: 'lastName', label: 'Last Name' },
      ]}
      //
      // This function is not defined inline in the JSX, but it does not have a stable
      // reference since it's recreated on each render (see its declaration above).
      getOperators={getOperators}
      //
      controlElements={{
        // ❌ Component function is defined inline and will be recreated during each render.
        // This can also cause bugs like "input loses focus after each keystroke."
        actionElement: props => <button onClick={props.handleOnClick}>{props.label}</button>,
      }}
    />
  );
}
```

</Admonition>

### "Good" example

Follow the patterns in this example to get the best performance from `QueryBuilder`.

<Admonition type="tip" title="" icon={'✓'}>

```tsx
// ✅ Fields array that never changes defined outside the component.
const fields: Field[] = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];

// ✅ Custom subcomponent defined outside the main component render function.
const MyActionElement = (props: ActionProps) => (
  <button onClick={props.handleOnClick}>{props.label}</button>
);

// ✅ Default query, which is only access once, defined outside the component.
const defaultQuery: RuleGroupType = { combinator: 'and', rules: [] };

function App() {
  const { t } = useTranslation(); // (<-- third-party i18n library)
  // ✅ `useState` parameter (the initial value of `query`) defined outside the component.
  const [query, setQuery] = useState(defaultQuery);

  // ✅ Function defined inside the component memoized with `useCallback`. Since `t`
  // _probably_ has a stable reference, this function will rarely, if ever, be recreated.
  const getOperators = useCallback((field: Field) => t(defaultOperators), [t]);

  return (
    <QueryBuilder
      // ✅ The value passed to `defaultQuery` is only used once, so the stability of
      // its reference is unimportant.
      defaultQuery={query}
      //
      // ✅ `useState` setters and `useReducer` dispatchers always have stable references.
      onQueryChange={setQuery}
      //
      // ✅ `fields` array defined outside the component.
      fields={fields}
      //
      // ✅ Function memoized with `useCallback`.
      getOperators={getOperators}
      //
      // See "Exceptions" section above regarding the following props.
      controlElements={{
        // ✅ Subcomponent defined outside the current component.
        actionElement: MyActionElement,
      }}
      // ✅ `translations` is memoized down to the sub-property level.
      translations={{
        addGroup: {
          label: 'Add Group',
        },
        addRule: {
          label: 'Add Rule',
        },
      }}
    />
  );
}
```

</Admonition>
