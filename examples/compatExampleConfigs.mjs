export default [
  {
    id: 'antd',
    name: 'Ant Design',
    dependencies: [['antd', '^4.20.5']],
    scssPre: [`@import 'antd/dist/antd.compact.css';`],
    scssPost: [`.queryBuilder{.ant-input{width:auto;}}`],
    tsxImports: [],
    additionalDeclarations: [],
    wrapperOpen: '',
    wrapperClose: '',
  },
  {
    id: 'bootstrap',
    name: 'Bootstrap',
    dependencies: [
      ['bootstrap', '^5.1.3'],
      ['bootstrap-icons', '^1.8.2'],
    ],
    scssPre: [`$code-color: #333333;`, `@import 'bootstrap/scss/bootstrap.scss';`],
    scssPost: [`.queryBuilder{.form-control,.form-select{display:inline-block;width:auto;}}`],
    tsxImports: [],
    additionalDeclarations: [],
    wrapperOpen: '',
    wrapperClose: '',
  },
  {
    id: 'bulma',
    name: 'Bulma',
    dependencies: [['bulma', '^0.9.4']],
    scssPre: [`$code: #333333;`, `$code-background: unset;`, `@import 'bulma/bulma.sass';`],
    scssPost: [`.queryBuilder{.input{width: auto;}}`],
    tsxImports: [],
    additionalDeclarations: [],
    wrapperOpen: '',
    wrapperClose: '',
  },
  {
    id: 'chakra',
    name: 'Chakra UI',
    dependencies: [
      ['@chakra-ui/icons', '^2.0.0'],
      ['@chakra-ui/react', '^2.0.2'],
      ['@chakra-ui/system', '^2.0.2'],
      ['@emotion/react', '^11.9.0'],
      ['@emotion/styled', '^11.8.1'],
      ['framer-motion', '^6.3.3'],
    ],
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
    wrapperOpen: '<ChakraProvider theme={chakraTheme}>',
    wrapperClose: '</ChakraProvider>',
  },
  {
    id: 'material',
    name: 'MUI/Material',
    dependencies: [['@mui/material', '^5.8.0']],
    scssPre: [],
    scssPost: [],
    tsxImports: [`import { createTheme, ThemeProvider } from '@mui/material/styles';`],
    additionalDeclarations: [`const muiTheme = createTheme();`],
    wrapperOpen: '<ThemeProvider theme={muiTheme}>',
    wrapperClose: '</ThemeProvider>',
  },
];
