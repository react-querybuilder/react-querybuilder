import { QueryBuilderNative } from '@react-querybuilder/native';
import {
  Box,
  Code,
  extendTheme,
  Heading,
  HStack,
  Link,
  NativeBaseProvider,
  Switch,
  Text,
  useColorMode,
  VStack,
} from 'native-base';
import { useState } from 'react';
import type { RuleGroupType } from 'react-querybuilder';
import { formatQuery } from 'react-querybuilder';
import { controlElements } from './components';

const theme = extendTheme({
  config: {
    // Changing initialColorMode to 'dark'
    initialColorMode: 'dark',
  },
});

type ITheme = typeof theme;

// Making the custom theme typing available
declare module 'native-base' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface ICustomTheme extends ITheme {}
}

const ToggleDarkMode = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <HStack space={2}>
      <Text>Dark</Text>
      <Switch
        isChecked={colorMode === 'light'}
        onToggle={toggleColorMode}
        aria-label={
          colorMode === 'light' ? 'switch to dark mode' : 'switch to light mode'
        }
      />
      <Text>Light</Text>
    </HStack>
  );
};

export const Example = () => {
  const { colorMode } = useColorMode();
  const [query, setQuery] = useState<RuleGroupType>({
    combinator: 'and',
    rules: [],
  });

  return (
    <Box
      bg={colorMode === 'light' ? 'coolGray.50' : 'coolGray.900'}
      minHeight="100vh"
      justifyContent="center"
      px={4}>
      <VStack space={5} alignItems="center">
        <Heading size="lg">React Query Builder NativeBase Example</Heading>
        <Link href="https://docs.nativebase.io" isExternal>
          <Text color="primary.500" underline fontSize={'xl'}>
            Learn NativeBase
          </Text>
        </Link>
        <ToggleDarkMode />
        <QueryBuilderNative
          query={query}
          onQueryChange={q => setQuery(q)}
          controlElements={controlElements}
        />
        <Code>{formatQuery(query, 'sql')}</Code>
      </VStack>
    </Box>
  );
};

export const App = () => {
  return (
    <NativeBaseProvider theme={theme}>
      <Example />
    </NativeBaseProvider>
  );
};
