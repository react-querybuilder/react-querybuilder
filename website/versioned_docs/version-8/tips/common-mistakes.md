---
title: Common mistakes
description: How to resolve some frequently-reported issues
hide_table_of_contents: true
---

## Custom component as closure

Avoid defining custom components for React Query Builder [inside the body of another function component](https://react.dev/learn/your-first-component#nesting-and-organizing-components). Here's what not to do:

```jsx title="App.jsx"
const App = () => {
  // Other stuff ...

  // highlight-start
  const CustomValueEditor = props => {
    // Custom logic here ...
    return <input />;
  };
  // highlight-end

  return (
    <QueryBuilder
      fields={fields}
      query={query}
      handleOnChange={q => setQuery(q)}
      controlElements={{
        valueEditor: CustomValueEditor,
      }}
    />
  );
};
```

This pattern causes issues like input fields losing focus after each keystroke because `CustomValueEditor` is recreated on every `App` render. Instead, declare custom components outside the parent function:

```jsx title="App.jsx"
// highlight-start
const CustomValueEditor = props => {
  // Custom logic here ...
  return <input />;
};
// highlight-end

const App = () => {
  // Other stuff ...

  return (
    <QueryBuilder
      fields={fields}
      query={query}
      handleOnChange={q => setQuery(q)}
      controlElements={{
        valueEditor: CustomValueEditor,
      }}
    />
  );
};
```

Another common mistake involves creating wrapper arrow functions in JSX. In this example, `CustomValueEditor` is correctly defined outside `App`, but assigning an arrow function that renders it (instead of the component itself) creates a new function component on every render:

```jsx title="App.jsx"
const CustomValueEditor = props => {
  // Custom logic here ...
  return <input />;
};

const App = () => {
  // Other stuff ...

  return (
    <QueryBuilder
      fields={fields}
      query={query}
      handleOnChange={q => setQuery(q)}
      controlElements={{
        // highlight-start
        // Don't do this:
        valueEditor: props => <CustomValueEditor {...props} />,
        // Do this instead:
        // valueEditor: CustomValueEditor,
        // highlight-end
      }}
    />
  );
};
```
