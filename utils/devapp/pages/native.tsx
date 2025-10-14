import type { Field, RuleGroupType } from '@react-querybuilder/core';
import { formatQuery } from '@react-querybuilder/core';
import { QueryBuilderNative, defaultNativeWebControlElements } from '@react-querybuilder/native';
import * as React from 'react';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { StyleSheet, Text, View } from 'react-native';

const styles = StyleSheet.create({
  outer: {
    padding: 10,
    gap: 20,
  },
  code: {
    fontFamily: 'monospace',
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

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
