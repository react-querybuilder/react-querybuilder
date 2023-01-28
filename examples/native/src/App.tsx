import {
  defaultNativeWebControlElements,
  NativeValueSelector,
  NativeValueSelectorWeb,
  QueryBuilderNative,
} from '@react-querybuilder/native';
import { extendTheme, NativeBaseProvider } from 'native-base';
import { useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import type {
  Field,
  Option,
  OptionList,
  RuleGroupType,
} from 'react-querybuilder';
import { formatQuery } from 'react-querybuilder';
import { nativeBaseControlElements } from './components';

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

type UILib =
  | 'default'
  | 'native-base'
  | 'fluentui'
  | 'kitten'
  | 'paper'
  | 'tamagui';

const uiLibs: OptionList<Option<UILib>> = [
  { name: 'default', label: 'Default' },
  { name: 'paper', label: 'React Native Paper' },
  { name: 'native-base', label: 'NativeBase' },
  { name: 'fluentui', label: 'Fluent UI' },
  { name: 'kitten', label: 'Kitten' },
  { name: 'tamagui', label: 'Tamagui' },
];

const nativeBaseTheme = extendTheme({
  config: {
    initialColorMode: 'dark',
  },
});

const LibSelector = ({ libSetter }: { libSetter: (lib: UILib) => void }) => {
  const ValueSelectorComponent =
    Platform.OS === 'web' ? NativeValueSelectorWeb : NativeValueSelector;
  return (
    <ValueSelectorComponent
      options={uiLibs}
      handleOnChange={v => libSetter(v)}
      path={[]}
      level={0}
      schema={{} as any}
    />
  );
};

export const App = () => {
  const [uiLib, setUIlib] = useState<UILib>('default');
  const [query, setQuery] = useState(defaultQuery);
  const controlElements = useMemo(() => {
    switch (uiLib) {
      case 'native-base':
        return nativeBaseControlElements;
      default:
        return defaultNativeWebControlElements;
    }
  }, [uiLib]);

  return (
    <NativeBaseProvider theme={nativeBaseTheme}>
      <View style={styles.outer}>
        <Text style={styles.outer}>
          React Query Builder React Native Example
        </Text>
        <View>
          <Text>UI library</Text>
          <LibSelector libSetter={setUIlib} />
        </View>
        <QueryBuilderNative
          fields={fields}
          query={query}
          onQueryChange={q => setQuery(q)}
          controlElements={controlElements}
        />
        <Text style={styles.code}>{formatQuery(query, 'sql')}</Text>
      </View>
    </NativeBaseProvider>
  );
};

const styles = StyleSheet.create({
  outer: {
    padding: 10,
  },
  code: {
    fontFamily: 'sans-serif',
  },
});
