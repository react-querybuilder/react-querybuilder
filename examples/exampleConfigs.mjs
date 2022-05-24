// @ts-check
/** @type {import('./exampleConfigs').ExampleConfigs} */
export const configs = {
  basic: {
    name: 'Basic',
    dependencies: {},
    scssPre: [],
    scssPost: [],
    tsxImports: [],
    additionalDeclarations: [],
    wrapper: null,
    compileToJS: true,
    isCompatPackage: false,
  },
  'basic-ts': {
    name: 'Basic TypeScript',
    dependencies: {},
    scssPre: [],
    scssPost: [],
    tsxImports: [],
    additionalDeclarations: [],
    wrapper: null,
    compileToJS: false,
    isCompatPackage: false,
  },
  antd: {
    name: 'Ant Design',
    dependencies: { antd: '^4.20.5' },
    scssPre: [`@import 'antd/dist/antd.compact.css';`],
    scssPost: [`.queryBuilder{.ant-input{width:auto;}}`],
    tsxImports: [],
    additionalDeclarations: [],
    wrapper: null,
    compileToJS: false,
    isCompatPackage: true,
  },
  bootstrap: {
    name: 'Bootstrap',
    dependencies: {
      bootstrap: '^5.1.3',
      'bootstrap-icons': '^1.8.2',
    },
    scssPre: [`$code-color: #333333;`, `@import 'bootstrap/scss/bootstrap.scss';`],
    scssPost: [`.queryBuilder{.form-control,.form-select{display:inline-block;width:auto;}}`],
    tsxImports: [],
    additionalDeclarations: [],
    wrapper: null,
    compileToJS: false,
    isCompatPackage: true,
  },
  bulma: {
    name: 'Bulma',
    dependencies: { bulma: '^0.9.4' },
    scssPre: [`$code: #333333;`, `$code-background: unset;`, `@import 'bulma/bulma.sass';`],
    scssPost: [`.queryBuilder{.input{width: auto;}}`],
    tsxImports: [],
    additionalDeclarations: [],
    wrapper: null,
    compileToJS: false,
    isCompatPackage: true,
  },
  chakra: {
    name: 'Chakra UI',
    dependencies: {
      '@chakra-ui/icons': '^2.0.0',
      '@chakra-ui/react': '^2.0.2',
      '@chakra-ui/system': '^2.0.2',
      '@emotion/react': '^11.9.0',
      '@emotion/styled': '^11.8.1',
      'framer-motion': '^6.3.3',
    },
    scssPre: [],
    scssPost: [
      `.queryBuilder {
        .chakra-select__wrapper {width: fit-content;display: inline-block;}
        .chakra-input {width: auto;display: inline-block;}
        .chakra-radio-group {display: inline-block;}
      }`,
    ],
    tsxImports: [`import { ChakraProvider, extendTheme } from '@chakra-ui/react';`],
    additionalDeclarations: [
      `const chakraTheme = extendTheme({config:{initialColorMode: 'light',useSystemColorMode: false}});`,
    ],
    wrapper: ['<ChakraProvider theme={chakraTheme}>', '</ChakraProvider>'],
    compileToJS: false,
    isCompatPackage: true,
  },
  material: {
    name: 'MUI/Material',
    dependencies: {
      '@emotion/react': '^11.9.0',
      '@emotion/styled': '^11.8.1',
      '@mui/material': '^5.8.0'
    },
    scssPre: [],
    scssPost: [],
    tsxImports: [`import { createTheme, ThemeProvider } from '@mui/material/styles';`],
    additionalDeclarations: [`const muiTheme = createTheme();`],
    wrapper: ['<ThemeProvider theme={muiTheme}>', '</ThemeProvider>'],
    compileToJS: false,
    isCompatPackage: true,
  },
};
