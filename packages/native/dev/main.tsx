import * as React from 'react';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { StyleSheet, Text, View } from 'react-native';
import type { Field, RuleGroupType } from 'react-querybuilder';
import { formatQuery } from 'react-querybuilder';
import { QueryBuilderNative, defaultNativeWebControlElements } from '../src';

const styles = StyleSheet.create({
  outer: {
    padding: 10,
  },
  code: {
    fontFamily: 'sans-serif',
  },
});

const fields: Field[] = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
];

const defaultQuery: RuleGroupType = {
  combinator: 'and',
  rules: [
    { field: 'firstName', operator: 'beginsWith', value: 'Stev' },
    { field: 'lastName', operator: 'in', value: 'Vai, Vaughan' },
  ],
};

const App = () => {
  const [query, setQuery] = useState(defaultQuery);

  return (
    <View style={styles.outer}>
      <QueryBuilderNative
        fields={fields}
        query={query}
        onQueryChange={setQuery}
        controlElements={defaultNativeWebControlElements}
      />
      <Text style={styles.code}>{formatQuery(query, 'sql')}</Text>
    </View>
  );
};

createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
