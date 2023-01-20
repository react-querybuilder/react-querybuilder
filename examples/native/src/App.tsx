import { QueryBuilderNative } from '@react-querybuilder/native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { RuleGroupType } from 'react-querybuilder';
import { formatQuery } from 'react-querybuilder';

const styles = StyleSheet.create({
  code: {
    fontFamily: 'sans-serif',
  },
});

export const App = () => {
  const [query, setQuery] = useState<RuleGroupType>({
    combinator: 'and',
    rules: [],
  });

  return (
    <View>
      <Text>React Query Builder Native Example</Text>
      <QueryBuilderNative query={query} onQueryChange={q => setQuery(q)} />
      <Text style={styles.code}>{formatQuery(query, 'sql')}</Text>
    </View>
  );
};
