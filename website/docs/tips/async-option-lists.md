---
title: Async option list loading
description: Augment value selectors with async option list loading
---

To load option lists asynchronously for a value selector, use the `useValueSelectorAsync` hook.

This opt-in feature enables dynamic loading of options based on rule/group context, with intelligent caching for performance optimization.

## Basic usage

1. Create a component that accepts `ValueSelectorProps`.
2. Pass the props directly to `useValueSelectorAsync` along with the async configuration options.
3. After any custom logic, pass the object returned from `useValueSelectorAsync` as the props to a standard selector component.
4. Assign the component in the [`controlElements` prop](../components/querybuilder-controlelements).

```tsx
import { type UseValueSelectorAsyncParams, useValueSelectorAsync } from 'react-querybuilder';

const useValueSelectorAsyncParams: UseValueSelectorAsyncParams = {
  getCacheKey: 'field',
  loadOptionList: async (value, { ruleOrGroup }) => {
    const response = await fetch(`/api/operators?field=${ruleOrGroup.field}`);
    return response.json();
  },
};

// Step 1
const AsyncOperatorSelector = (props: ValueSelectorProps) => {
  // Step 2
  const asyncProps = useValueSelectorAsync(props, useValueSelectorAsyncParams);

  // Step 3
  return <props.schema.controls.valueSelector {...asyncProps} />;
};

// Step 4
const App = () => <QueryBuilder controlElements={{ operatorSelector: AsyncOperatorSelector }} />;
```

:::tip

While you can render any selector component (e.g. `<AntDValueSelector {...asyncProps} />` or `<MaterialValueSelector {...asyncProps} />`), rendering `<props.schema.controls.valueSelector {...asyncProps} />` (or any other `*Selector` control) makes your async selector more versatile as it will automatically adapt to configuration changes at the context and query builder level. This method can also help avoid some issues with certain [compatibility packages](../compat).

:::

## Configuration options

### `loadOptionList`

Function that returns a `Promise` for the option list. This should ultimately call your API (if and when necessary).

```tsx
const loadFieldOptions = async (value, { ruleOrGroup }) => {
  // Current selector value is available
  console.log('Current value:', value);

  // Rule or group context is available
  if (ruleOrGroup?.field === 'user') {
    return await fetch('/api/user-fields').then(r => r.json());
  }

  return await fetch('/api/default-fields').then(r => r.json());
};

const ValueSelectorAsync = (props: ValueSelectorProps) => {
  const asyncProps = useValueSelectorAsync(props, { loadOptionList: loadFieldOptions });
  return <props.schema.controls.valueSelector {...asyncProps} />;
};
```

### `getCacheKey`

Controls cache key generation. Can be a string, array of strings, or a function returning a string.

#### Cache by property name (string)

```tsx
// Cache by field value only
const getCacheKey = 'field';

// Or cache by operator value only
const getCacheKey = 'operator';

const ValueSelectorAsync = (props: ValueSelectorProps) => {
  const asyncProps = useValueSelectorAsync(props, { getCacheKey, loadOptionList });
  return <props.schema.controls.valueSelector {...asyncProps} />;
};
```

#### Cache by multiple property names (array of strings)

```tsx
// Cache by combination of field and operator
const getCacheKey = ['field', 'operator'];

const ValueSelectorAsync = (props: ValueSelectorProps) => {
  const asyncProps = useValueSelectorAsync(props, { getCacheKey, loadOptionList });
  return <props.schema.controls.valueSelector {...asyncProps} />;
};
```

#### Cache by custom function

```tsx
// `getCacheKey` receives the entire props object as its only parameter
const getCacheKey = (props: ValueSelectorProps) => {
  const {
    rule,
    ruleGroup,
    schema: { qbId },
  } = props;
  // Using `qbId` will cache each query builder separately
  return `${qbid}-${rule?.field}-${rule?.operator}-${ruleGroup?.id}`;
};

const ValueSelectorAsync = (props: ValueSelectorProps) => {
  const asyncProps = useValueSelectorAsync(props, { getCacheKey, loadOptionList });
  return <props.schema.controls.valueSelector {...asyncProps} />;
};
```

### `cacheTTL`

Cache time-to-live in milliseconds. Defaults to `1800000` (30 minutes).

```tsx
// 30 minutes (default)
const cacheTTL = 1_800_000;

// 5 minutes
const cacheTTL = 300_000;

// Disable caching (cache is populated, but immediately invalid)
const cacheTTL = 0;

const ValueSelectorAsync = (props: ValueSelectorProps) => {
  const asyncProps = useValueSelectorAsync(props, { cacheTTL, loadOptionList });
  return <props.schema.controls.valueSelector {...asyncProps} />;
};
```

## Loading states

`useValueSelectorAsync` adds the "queryBuilder-loading" class while the promise from `loadOptionList` is pending. No styles are applied by the default stylesheet for this class.

To add custom classes during pending `loadOptionList` promises, use `controlClassnames#loading` or override the `className` prop on the rendered value selector.

In this example, `my-async-loading-class` will be added to the specific component `ValueSelectorAsync` when loading, and `common-async-loading-class` will be added to _all_ "loading" selectors.

```tsx
const ValueSelectorAsync = (props: ValueSelectorProps) => {
  const asyncProps = useValueSelectorAsync(props, { ...otherParams, isLoading });

  return (
    <props.schema.controls.valueSelector
      {...asyncProps}
      className={`${asyncProp.className}${asyncProps.isLoading ? ' my-async-loading-class' : ''}`}
    />
  );
};

const App = () => (
  <QueryBuilder
    controlElements={{ valueSelector: ValueSelectorAsync }}
    controlClassnames={{ loading: 'common-async-loading-class' }}
  />
);
```

To force a "loading" state, set the `isLoading` parameter to `true`:

```tsx
const ValueSelectorAsync = (props: ValueSelectorProps) => {
  // Assume this hook determines whether to force a "loading" state and returns a `boolean`:
  const isLoading = useIsLoading(props);

  const asyncProps = useValueSelectorAsync(props, { ...otherParams, isLoading });

  return <props.schema.controls.valueSelector {...asyncProps} />;
};
```

## Real-world examples

### Dependent values

Load options in the value editor that depend on the selected field and operator. The value editor must

```tsx
const ValueSelectorAsync = (props: ValueSelectorProps) => {
  const asyncProps = useValueSelectorAsync(props, {
    loadOptionList: async (value, { ruleOrGroup }) => {
      const { field, operator } = ruleOrGroup as RuleType;
      return myValuesAPI({ field, operator });
    },
    getCacheKey: ['field', 'operator'],
  });

  return <props.schema.controls.valueSelector {...asyncProps} />;
};

// Assign the async value selector as `selectorComponent` to an otherwise
// "pass-through" value editor component.
const ValueEditorAsync = (props: ValueEditorProps) => (
  <ValueEditor {...props} selectorComponent={ValueSelectorAsync} />
);

// Assign the custom value editor in `controlElements`
const App = () => <QueryBuilder controlElements={{ valueEditor: ValueEditorAsync }} />;
```

### Dependent operators

Load operators that depend on the selected field type:

```tsx
const ValueSelectorAsync = (props: ValueSelectorProps) => {
  const asyncProps = useValueSelectorAsync(props, {
    loadOptionList: async (value, { ruleOrGroup }) => {
      const fieldType = props.fieldData.datatype; // custom field property
      return getOperatorsForType(fieldType);
    },
    getCacheKey: props => `operators-${props.fieldData.datatype}`,
  });

  return <props.schema.controls.valueSelector {...asyncProps} />;
};
```

### Auto-complete value selector

Create an auto-complete component by including the current value in the cache key:

```tsx
const AutoCompleteValueSelector = (props: ValueSelectorProps) => {
  const asyncProps = useValueSelectorAsync(props, {
    loadOptionList: async (value, { ruleOrGroup }) => {
      if (!value || value.length < 2) return [];

      return fetch(`/api/autocomplete?q=${value}&field=${ruleOrGroup?.field}`).then(r => r.json());
    },
    getCacheKey: props => `autocomplete-${props.rule?.field}-${props.value}`,
  });

  return <MyAutocompleteSelector {...asyncProps} />;
};

// Use the autocomplete selector as the selector for the value editor
const ValueEditorWithAutocomplete = (props: ValueEditorProps) => (
  <ValueEditor {...props} selectorComponent={AutoCompleteValueSelector} />
);

// Assign the new value editor
const App = () => <QueryBuilder controlElements={{ valueEditor: ValueEditorWithAutocomplete }} />;
```

## Error handling

Async loading errors can be managed within your `loadOptionList` function or by checking the `errors` property on the object returned from `useValueSelectorAsync`, which will contain an error message when the promise is rejected.

Internal error handling:

```tsx
const loadOptionList = async (value, { ruleOrGroup }) => {
  try {
    const response = await fetch('/api/options');
    if (!response.ok) throw new Error('Failed to load options');
    return response.json();
  } catch (error) {
    // Log the error and return fallback options
    console.error('Failed to load options:', error);
    return [{ name: 'error', value: 'error', label: 'Error loading options' }];
  }
};
```

Promise rejection detection:

```tsx
const AsyncOperatorSelector = (props: ValueSelectorProps) => {
  const asyncProps = useValueSelectorAsync(props, useValueSelectorAsyncParams);

  // If `errors` is truthy, the promise was rejected
  if (asyncProps.errors) {
    const fallbackOptions = [{ name: 'error', value: 'error', label: 'Error loading options' }];
    return <props.schema.controls.valueSelector {...asyncProps} options={fallbackOptions} />;
  }

  return <props.schema.controls.valueSelector {...asyncProps} />;
};
```

## Best practices

### Cache key design

- **Don't include the selector's own value** unless building auto-complete
- **Use specific, meaningful keys** to avoid cache conflicts
- **Consider rule/group hierarchy** for context-dependent options

```tsx
// ❌ Bad: includes own value (unless auto-complete)
getCacheKey: props => `${props.rule?.field}-${props.value}`;

// ✅ Good: context-dependent without own value
getCacheKey: props => `operators-${props.rule?.field}`;
```

### Performance optimization

- **Set appropriate cache TTL** based on data freshness requirements
- **Use specific cache keys** to maximize cache hits
- **Consider debouncing** for auto-complete scenarios

### Error resilience

- **Provide fallback options** when loading fails
- **Handle network timeouts** gracefully
- **Show meaningful error states** to users
