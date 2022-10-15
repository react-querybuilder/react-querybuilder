// @ts-check
/** @type {import('./exampleConfigs').ExampleConfigs} */
export const configs = {
  basic: {
    name: 'Basic',
    dependencyKeys: [],
    scssPre: [],
    scssPost: [],
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
    scssPre: [],
    scssPost: [],
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
    scssPre: [],
    scssPost: [],
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
    scssPre: [],
    scssPost: [`.queryBuilder{.ant-input{width:auto;}}`],
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
    scssPre: [`$code-color: #333333;`, `@import 'bootstrap/scss/bootstrap.scss';`],
    scssPost: [`.queryBuilder{.form-control,.form-select{display:inline-block;width:auto;}}`],
    tsxImports: [`import { QueryBuilderBootstrap } from '@react-querybuilder/bootstrap';`],
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
    scssPre: [`$code: #333333;`, `$code-background: unset;`, `@import 'bulma/bulma.sass';`],
    scssPost: [`.queryBuilder{.input{width: auto;}}`],
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
    dependencyKeys: [
      '@chakra-ui/icons',
      '@chakra-ui/react',
      '@chakra-ui/system',
      '@emotion/react',
      '@emotion/styled',
      'framer-motion',
    ],
    scssPre: [],
    scssPost: [
      `.queryBuilder {
  .chakra-select__wrapper {width: fit-content;display: inline-block;}
  .chakra-input {width: auto;display: inline-block;}
  .chakra-radio-group {display: inline-block;}
}`,
    ],
    tsxImports: [
      `import { ChakraProvider, extendTheme } from '@chakra-ui/react';`,
      `import { QueryBuilderChakra } from '@react-querybuilder/chakra';`,
    ],
    additionalDeclarations: [
      `const chakraTheme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  }
});`,
    ],
    wrapper: [
      '<ChakraProvider theme={chakraTheme}><QueryBuilderChakra>',
      '</QueryBuilderChakra></ChakraProvider>',
    ],
    props: [],
    compileToJS: false,
    isCompatPackage: true,
    enableDnD: false,
  },
  material: {
    name: 'MUI/Material',
    dependencyKeys: ['@emotion/react', '@emotion/styled', '@mui/icons-material', '@mui/material'],
    scssPre: [],
    scssPost: [],
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
