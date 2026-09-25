import {
  defaultNativeWebControlElements,
  QueryBuilderNative,
} from '@react-querybuilder/native';
import { useState } from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, Text } from 'react-native';
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

// Browser-friendly controls on web; native defaults elsewhere
const controlElements = Platform.OS === 'web' ? defaultNativeWebControlElements : undefined;

export default function App() {
  const [query, setQuery] = useState(defaultQuery);

  return (
    // iOS: auto safe-area insets; Android: pad below status bar
    <ScrollView
      style={styles.safe}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.outer}>
      <Text style={styles.title}>React Query Builder Expo Example</Text>
      <QueryBuilderNative
        fields={fields}
        query={query}
        onQueryChange={setQuery}
        controlElements={controlElements}
      />
      <Text style={styles.code}>{formatQuery(query, 'sql')}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  outer: { padding: 10, paddingTop: 10 + (StatusBar.currentHeight ?? 0), gap: 20 },
  title: { fontSize: 18, fontWeight: 'bold' },
  code: { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) },
});
