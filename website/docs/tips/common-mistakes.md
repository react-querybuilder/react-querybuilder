---
title: Common mistakes
description: How to resolve some frequently-reported issues
hide_table_of_contents: true
---

## Custom component as closure

When defining custom components for React Query Builder, [do not define them within the body of another function component](https://react.dev/learn/your-first-component#nesting-and-organizing-components) like this:

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

This will almost certainly lead to undesirable behavior such as the value editor losing focus after each keystroke. This happens because the `CustomValueEditor` component is being redefined each time the `App` component renders. To fix the problem, move the custom component declaration outside of the other function component (it can still be in the same file, just not within the function body):

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

A similar mistake that leads to the same problems is declaring arrow functions that render components inside the JSX syntax. In the code below, `CustomValueEditor` is correctly defined outside the body of `App`, but an arrow function that _renders_ `CustomValueEditor` is assigned to `valueEditor` instead of the `CustomValueEditor` component itself. This causes a new function component to be created on every render.

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
