---
title: Working with option lists
description: Managing ambiguity in option list types
---

import { DemoLink } from '@site/src/components/DemoLink';
import Details from '@theme/Details';

%importmd ../\_ts_admonition.md

Option list props in React Query Builder like [`fields`](../components/querybuilder#fields), [`combinators`](../components/querybuilder#combinators), and [`operators`](../components/querybuilder#operators), are based on the type [`OptionList`](../typescript#option-lists). `OptionList` is a union type allowing two different types of arrays: `Option[]` and `OptionGroup[]`. This is a flexible design, but it adds some complexity to the consumption of option list-type props in custom subcomponents.

This page provides tips to help manage the inherent ambiguity of option list TypeScript types.

:::info

- `Option` objects have `label`, `name`, and `value` properties, all of which extend `string`.
- `OptionGroup` objects have a `label` property along with an `options` property which is an array of `Option` objects.

This structure is similar to the `children` prop on a `<select>` element, which can be an array of `<option>` elements or an array of `<optgroup>` elements that each contain its own nested `<option>` list.

:::

## An incorrect assumption

You may have found this page after seeing a TypeScript error message similar to this:

```
Property 'name' does not exist on type 'FullOption<string> | OptionGroup<FullOption<string>>'.
  Property 'name' does not exist on type 'OptionGroup<FullOption<string>>'. ts(2339)
```

This generally happens when you treat elements in the option list as if they were definitely `Option` types. For example, mapping through the list to get the `name` property, like this:

```tsx
const ListAllOptionNames = (props: ValueSelectorProps) => {
  return <div>{props.options.map(opt => opt.name).join(', ')}</div>;
  //                                        ^^^^ error
};
```

It's natural to assume that an option list passed in to `QueryBuilder` as an `Option[]` would _still_ be an `Option[]` when it gets to the subcomponent. However, React Query Builder's type generics only infer the type of the options within the list, not the type of the list itself.

:::tip

All options in list-type props passed to subcomponents are guaranteed to include both `name` and `value` properties, even if they don't include one or the other in their original form on the corresponding `QueryBuilder` prop.

As an example, consider this `fields` array:

```ts
const fields: Field[] = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];
```

When this array is assigned to the [`fields` prop](../components/querybuilder#fields), the `fieldSelector` component will receive the same array but with each option object augmented with a `value` property equivalent to the original `name`:

```tsx
const MyFieldSelector = (props: FieldSelectorProps) => {
  console.log(props.options); // =>
  // [
  //   { name: 'firstName', value: 'firstName', label: 'First Name' },
  //   { name: 'lastName', value: 'lastName', label: 'Last Name' }],
  // ]
  return <ValueSelector {...props} />;
};

const App = () => (
  <QueryBuilder fields={fields} controlElements={{ fieldSelector: MyFieldSelector }} />
);
```

**If `name` and `value` differ for a given option, `value` takes precedence.**

:::

## Workarounds

There are several ways to handle this ambiguity. One way is to cast option list props to `Option[]` with the `as` keyword. If your option list is _definitely_ `Option[]`, this will probably work without causing issues. However, while the `as` keyword may help avoid TypeScript errors, it has no effect on execution. Therefore it can be akin to lying to the TypeScript compiler (preventing it from doing its job), so this method is not recommended.

```tsx
const MyComponent(props: ValueSelectorProps) => {
  return <div>{(props.options as Option[]).map(opt => opt.name).join(', ')}</div>;
  //                          ^^^^^^^^^^^ avoids TypeScript error; may have issues during execution
};
```

:::info

All [default option lists](../utils/misc#defaults) (`defaultCombinators`, `defaultOperators`, etc.) are type `Option[]`.

:::

Another solution is to use the [`isOptionGroupArray`](#isoptiongrouparray) type guard to determine if the option list is `OptionGroup[]`. This not only avoids the "lying" issue of the `as` keyword, but also allows you to perform separate actions depending on whether the option list type is `Option[]` or `OptionGroup[]`.

```tsx
const MyComponent(props: ValueSelectorProps) => {
  if (isOptionGroupArray(props.options)) {
    return <div>{props.options.flatMap(og => og.options).map(opt => opt.name).join(', ')}</div>;
  }
  return <div>{(props.options).map(opt => opt.name).join(', ')}</div>;
};
```

## Utilities

Several utility functions are available to help manage the dual-potential nature of option list props without the need for type guards or casting with `as`.

### `getOption`

```ts
function getOption(arr: OptionList, identifier: string): Option;
```

Retrieves the full option object from an option list based on the given identifier (corresponding to `name` or `value`), regardless of whether the list is `Option[]` or `OptionGroup[]`.

#### Examples

```ts
getOption(
  [
    { name: 'firstName', label: 'First Name' },
    { name: 'lastName', label: 'Last Name' },
  ],
  'lastName'
);
// => { name: 'lastName', label: 'Last Name' }

getOption(
  [
    { label: 'First', options: [{ name: 'firstName', label: 'First Name' }] },
    { label: 'Last', options: [{ name: 'lastName', label: 'Last Name' }] },
  ],
  'lastName'
);
// => { name: 'lastName', label: 'Last Name' }
```

### `getFirstOption`

```ts
function getFirstOption(arr: OptionList): Option;
```

Retrieves the value of the identifier property (`name` or `value`) of the first `Option` in the list, regardless of whether the list is `Option[]` or `OptionGroup[]`.

`QueryBuilder` uses this function to set default values for option lists in new rules and groups when no other method for determining the default value is provided.

#### Examples

```ts
getFirstOption([
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
]);
// => 'firstName'

getFirstOption([
  { label: 'First', options: [{ name: 'firstName', label: 'First Name' }] },
  { label: 'Last', options: [{ name: 'lastName', label: 'Last Name' }] },
]);
// => 'firstName'
```

### `toOptions`

```ts
function toOptions(arr: OptionList): ReactElement;
```

Generates an array of `<option>` elements if the provided option list is an `Option` array, or an array of `<optgroup>` elements if the list is an `OptionGroup` array. Intended for use as the `children` prop on a `<select>` element, as [`ValueSelector`](../components/valueselector) does.

:::info

Some of the [compatibility packages](../compat) implement their own `toOptions` method that generates "option" elements appropriate for their respective style library.

:::

#### Usage

```tsx
const MyComponent(props: ValueSelectorProps) => {
  return (
    <select value={props.value} onChange={e => props.handleOnChange(e.target.value)}>
      {toOptions(props.options)}
    </select>
  )
}
```

<Details summary= "Examples">

#### `Option[]` example

```tsx
toOptions([
  { value: 'firstName', label: 'First Name' },
  { value: 'lastName', label: 'Last Name' },
]);
// yields (approximately):
[
  <option key={'firstName'} value={'firstName'}>
    First Name
  </option>,
  <option key={'lastName'} value={'lastName'}>
    Last Name
  </option>,
];
```

#### `OptionGroup[]` example

```tsx
toOptions([
  { label: 'First', options: [{ value: 'firstName', label: 'First Name' }] },
  { label: 'Last', options: [{ value: 'lastName', label: 'Last Name' }] },
]);
// yields (approximately):
[
  <optgroup key={'First'} label={'First'}>
    <option key={'firstName'} value={'firstName'}>
      First Name
    </option>
  </optgroup>,
  <optgroup key={'Last'} label={'Last'}>
    <option key={'lastName'} value={'lastName'}>
      Last Name
    </option>
  </optgroup>,
];
```

</Details>

### `toFlatOptionArray`

```ts
function toFlatOptionArray(arr: any): boolean;
```

Flattens `OptionGroup` arrays into `Option` arrays using [`Array.prototype.flatMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap), in case `OptionGroup[]` is inappropriate or inapplicable, and leaves `Option` arrays unmodified. The flattened list is de-duplicated using [`uniqByIdentifier`](#uniqbyidentifier).

### `isOptionGroupArray`

```ts
function isOptionGroupArray(arr: any): boolean;
```

A type guard to distiguish between the two different array types represented by `OptionList`. If the result is `true`, the array in question is an `OptionGroup[]`, so the options themselves will be within an `options` array property on each option group.

<Details summary= "Examples">

```ts
isOptionGroupArray([
  { value: 'firstName', label: 'First Name' },
  { value: 'lastName', label: 'Last Name' },
]);
// => false

isOptionGroupArray([
  { label: 'First', options: [{ value: 'firstName', label: 'First Name' }] },
  { label: 'Last', options: [{ value: 'lastName', label: 'Last Name' }] },
]);
// => true
```

</Details>

### `uniqOptList`

```ts
function uniqOptList(arr: any): boolean;
```

Removes duplicate options from an `OptionList` based on a matching identifier properties (`name` or `value`), regardless of whether the list is `Option[]` or `OptionGroup[]`.

### `uniqByIdentifier`

```ts
function uniqByIdentifier(arr: any): boolean;
```

Removes duplicate options from an `Option` array based on a matching identifier properties (`name` or `value`).
