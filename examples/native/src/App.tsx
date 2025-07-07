import {
  defaultNativeWebControlElements,
  QueryBuilderNative,
} from '@react-querybuilder/native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Field, RuleGroupType } from 'react-querybuilder';
import { formatQuery } from 'react-querybuilder';

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
export const App = () => {
  const [query, setQuery] = useState(defaultQuery);

  return (
    <View style={styles.outer}>
      <Text style={styles.outer}>React Query Builder React Native Example</Text>
      <QueryBuilderNative
        // oxlint-disable-next-line typescript/ban-ts-comment
        // @ts-ignore
        fields={fields}
        query={query}
        onQueryChange={setQuery}
        controlElements={defaultNativeWebControlElements}
      />
      <Text style={styles.code}>{formatQuery(query, 'sql')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: { padding: 10, gap: 20 },
  code: { fontFamily: 'monospace' },
});
