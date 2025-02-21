interface ExampleConfig {
  name: string;
  dependencyKeys: (string | [string, string])[];
  cssPre: string[];
  cssPost: string[];
  tsxImports: string[];
  additionalDeclarations: string[];
  wrapper: [string, string] | null;
  props: string[];
  compileToJS: boolean;
  isCompatPackage: boolean;
  enableDnD: boolean;
}

export const configs: Record<string, ExampleConfig> = {
  basic: {
    name: 'Basic',
    dependencyKeys: [],
    cssPre: [],
    cssPost: [],
    tsxImports: [],
    additionalDeclarations: [],
    wrapper: null,
    props: [],
    compileToJS: true,
    isCompatPackage: false,
    enableDnD: false,
  },
  'basic-ts': {
    name: 'Basic TypeScript',
    dependencyKeys: [],
    cssPre: [],
    cssPost: [],
    tsxImports: [],
    additionalDeclarations: [],
    wrapper: null,
    props: [],
    compileToJS: false,
    isCompatPackage: false,
    enableDnD: false,
  },
  dnd: {
    name: 'Drag-and-drop',
    dependencyKeys: ['react-dnd', 'react-dnd-html5-backend'],
    cssPre: [],
    cssPost: [],
    tsxImports: [`import { QueryBuilderDnD } from '@react-querybuilder/dnd';`],
    additionalDeclarations: [],
    wrapper: ['<QueryBuilderDnD>', '</QueryBuilderDnD>'],
    props: [],
    compileToJS: false,
    isCompatPackage: false,
    enableDnD: true,
  },
  antd: {
    name: 'Ant Design',
    dependencyKeys: ['@ant-design/icons', 'antd'],
    cssPre: [],
    cssPost: [`.queryBuilder{.ant-input{width:auto;}}`],
    tsxImports: [`import { QueryBuilderAntD } from '@react-querybuilder/antd';`],
    additionalDeclarations: [],
    wrapper: ['<QueryBuilderAntD>', '</QueryBuilderAntD>'],
    props: [],
    compileToJS: false,
    isCompatPackage: true,
    enableDnD: false,
  },
  bootstrap: {
    name: 'Bootstrap',
    dependencyKeys: ['bootstrap', 'bootstrap-icons', ['@popperjs/core', '^2.11.5']],
    cssPre: [`@import 'bootstrap/dist/css/bootstrap.css';`],
    cssPost: [
      `:root{--bs-code-color: #333333;} .queryBuilder{.form-control,.form-select{display:inline-block;width:auto;}}`,
    ],
    tsxImports: [
      `import { QueryBuilderBootstrap } from '@react-querybuilder/bootstrap';`,
      `import 'bootstrap-icons/font/bootstrap-icons.css';`,
    ],
    additionalDeclarations: [],
    wrapper: ['<QueryBuilderBootstrap>', '</QueryBuilderBootstrap>'],
    props: [],
    compileToJS: false,
    isCompatPackage: true,
    enableDnD: false,
  },
  bulma: {
    name: 'Bulma',
    dependencyKeys: ['bulma'],
    cssPre: [`@import 'bulma/css/bulma.css';`],
    cssPost: [
      `:root{--bulma-code: #333333;--bulma-code-background:unset;} .queryBuilder{.input{width: auto;}}`,
    ],
    tsxImports: [`import { QueryBuilderBulma } from '@react-querybuilder/bulma';`],
    additionalDeclarations: [],
    wrapper: ['<QueryBuilderBulma>', '</QueryBuilderBulma>'],
    props: [],
    compileToJS: false,
    isCompatPackage: true,
    enableDnD: false,
  },
  chakra: {
    name: 'Chakra UI',
    dependencyKeys: ['@chakra-ui/react', '@emotion/react', 'next-themes', 'react-icons'],
    cssPre: [],
    cssPost: [
      `.queryBuilder .chakra-native-select__root {width:fit-content;display:inline-block;}
  .queryBuilder .chakra-input {width:auto;display:inline-block;}`,
    ],
    tsxImports: [
      `import { ChakraProvider, Theme, createSystem, defaultConfig } from '@chakra-ui/react';`,
      `import { QueryBuilderChakra } from '@react-querybuilder/chakra';`,
      `import { ThemeProvider } from 'next-themes';`,
    ],
    additionalDeclarations: [
      `const chakraTheme = createSystem(defaultConfig);

const Provider = (props: React.PropsWithChildren) => (
  <ChakraProvider value={chakraTheme}>
    <ThemeProvider attribute="class" disableTransitionOnChange>
      {props.children}
    </ThemeProvider>
  </ChakraProvider>
);`,
    ],
    wrapper: [
      '<Provider><Theme colorPalette="teal"><QueryBuilderChakra>',
      '</QueryBuilderChakra></Theme></Provider>',
    ],
    props: [],
    compileToJS: false,
    isCompatPackage: true,
    enableDnD: false,
  },
  fluent: {
    name: 'Fluent UI',
    dependencyKeys: ['@fluentui/react-components'],
    cssPre: [],
    cssPost: [],
    tsxImports: [
      `import { FluentProvider, webLightTheme } from '@fluentui/react-components';`,
      `import { QueryBuilderFluent } from '@react-querybuilder/fluent';`,
    ],
    additionalDeclarations: [],
    wrapper: [
      '<FluentProvider theme={webLightTheme}><QueryBuilderFluent>',
      '</QueryBuilderFluent></FluentProvider>',
    ],
    props: [],
    compileToJS: false,
    isCompatPackage: true,
    enableDnD: false,
  },
  mantine: {
    name: 'Mantine',
    dependencyKeys: ['@mantine/core', '@mantine/dates', '@mantine/hooks', 'dayjs'],
    cssPre: [`@import '@mantine/core/styles.css';`],
    cssPost: [],
    tsxImports: [
      `import { MantineProvider } from '@mantine/core';`,
      `import { QueryBuilderMantine } from '@react-querybuilder/mantine';`,
    ],
    additionalDeclarations: [],
    wrapper: ['<MantineProvider><QueryBuilderMantine>', '</QueryBuilderMantine></MantineProvider>'],
    props: [],
    compileToJS: false,
    isCompatPackage: true,
    enableDnD: false,
  },
  material: {
    name: 'MUI/Material',
    dependencyKeys: ['@emotion/react', '@emotion/styled', '@mui/icons-material', '@mui/material'],
    cssPre: [],
    cssPost: [],
    tsxImports: [
      `import { teal } from "@mui/material/colors";`,
      `import { createTheme, ThemeProvider } from '@mui/material/styles';`,
      `import { QueryBuilderMaterial } from '@react-querybuilder/material';`,
    ],
    additionalDeclarations: [
      `const muiTheme = createTheme({
  palette: {
    secondary: {
      main: teal[500]
    }
  }
});`,
    ],
    wrapper: [
      '<ThemeProvider theme={muiTheme}><QueryBuilderMaterial>',
      '</QueryBuilderMaterial></ThemeProvider>',
    ],
    props: [],
    compileToJS: false,
    isCompatPackage: true,
    enableDnD: false,
  },
};
