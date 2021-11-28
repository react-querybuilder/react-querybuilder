## @react-querybuilder/bootstrap

Official [Bootstrap](https://getbootstrap.com/) components for [react-querybuilder](https://npmjs.com/package/react-querybuilder).

To see them in action, check out the [`react-querybuilder` demo](https://react-querybuilder.js.org/react-querybuilder/) and choose "Bootstrap" from the Style drop-down.

## Installation

```bash
npm i --save react-querybuilder @react-querybuilder/bootstrap bootstrap bootstrap-icons
# OR
yarn add react-querybuilder @react-querybuilder/bootstrap bootstrap bootstrap-icons
```

## Usage

```tsx
import QueryBuilder, { RuleGroupType } from 'react-querybuilder';
import {
  BootstrapDragHandle,
  BootstrapNotToggle,
  BootstrapValueEditor
} from '@react-querybuilder/bootstrap';

const fields = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' }
];

const App = () => {
  const [query, setQuery] = useState<RuleGroupType>({ combinator: 'and', rules: [] });

  return (
    <QueryBuilder
      fields={fields}
      query={query}
      onQueryChange={(q) => setQuery(q)}
      controlClassnames={{
        addGroup: 'btn btn-secondary btn-sm',
        addRule: 'btn btn-primary btn-sm',
        cloneGroup: 'btn btn-secondary btn-sm',
        cloneRule: 'btn btn-secondary btn-sm',
        removeGroup: 'btn btn-danger btn-sm',
        removeRule: 'btn btn-danger btn-sm',
        combinators: 'form-select form-select-sm',
        fields: 'form-select form-select-sm',
        operators: 'form-select form-select-sm',
        value: 'form-control form-control-sm'
      }}
      controlElements={{
        dragHandle: BootstrapDragHandle,
        notToggle: BootstrapNotToggle,
        valueEditor: BootstrapValueEditor
      }}
    />
  );
};
```

To apply the Bootstrap styles, you can add the following SCSS to your app:

```scss
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins';
@import 'bootstrap/scss/reboot';
@import 'bootstrap/scss/type';
@import 'bootstrap/scss/forms';
@import 'bootstrap/scss/buttons';
@import 'bootstrap/scss/dropdown';

.form-control,
.form-select {
  display: inline-block;
  width: auto;
}
```
