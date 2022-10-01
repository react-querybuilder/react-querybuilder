/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';
import Layout from '@theme/Layout';
import React, { useMemo } from 'react';
import './_styles/demo.scss';
import './_styles/rqb-material.scss';

function ReactQueryBuilderDemo_MaterialBrowser() {
  const { colorMode } = useColorMode();

  const DragIndicator = useMemo(
    () =>
      (
        require('@mui/icons-material/DragIndicator') as typeof import('@mui/icons-material/DragIndicator')
      ).default,
    []
  );
  const Button = useMemo(
    () => (require('@mui/material/Button') as typeof import('@mui/material/Button')).default,
    []
  );
  const Checkbox = useMemo(
    () => (require('@mui/material/Checkbox') as typeof import('@mui/material/Checkbox')).default,
    []
  );
  const FormControl = useMemo(
    () =>
      (require('@mui/material/FormControl') as typeof import('@mui/material/FormControl')).default,
    []
  );
  const FormControlLabel = useMemo(
    () =>
      (require('@mui/material/FormControlLabel') as typeof import('@mui/material/FormControlLabel'))
        .default,
    []
  );
  const Input = useMemo(
    () => (require('@mui/material/Input') as typeof import('@mui/material/Input')).default,
    []
  );
  const ListSubheader = useMemo(
    () =>
      (require('@mui/material/ListSubheader') as typeof import('@mui/material/ListSubheader'))
        .default,
    []
  );
  const MenuItem = useMemo(
    () => (require('@mui/material/MenuItem') as typeof import('@mui/material/MenuItem')).default,
    []
  );
  const Radio = useMemo(
    () => (require('@mui/material/Radio') as typeof import('@mui/material/Radio')).default,
    []
  );
  const RadioGroup = useMemo(
    () =>
      (require('@mui/material/RadioGroup') as typeof import('@mui/material/RadioGroup')).default,
    []
  );
  const Select = useMemo(
    () => (require('@mui/material/Select') as typeof import('@mui/material/Select')).default,
    []
  );
  const Switch = useMemo(
    () => (require('@mui/material/Switch') as typeof import('@mui/material/Switch')).default,
    []
  );
  const TextareaAutosize = useMemo(
    () =>
      (require('@mui/material/TextareaAutosize') as typeof import('@mui/material/TextareaAutosize'))
        .default,
    []
  );

  const muiComponents = {
    Button,
    Checkbox,
    DragIndicator,
    FormControl,
    FormControlLabel,
    Input,
    ListSubheader,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    Switch,
    TextareaAutosize,
  };

  const { ThemeProvider, createTheme } = useMemo(
    () => require('@mui/material') as typeof import('@mui/material'),
    []
  );
  const { QueryBuilderMaterial } = useMemo(
    () => require('@react-querybuilder/material') as typeof import('@react-querybuilder/material'),
    []
  );
  const Demo = useMemo(
    () => (require('./_components/Demo') as typeof import('./_components/Demo')).default,
    []
  );

  const muiTheme = useMemo(() => {
    const theme = createTheme({ palette: { mode: colorMode } });
    console.log(theme);
    return theme;
  }, [colorMode, createTheme]);

  return (
    <ThemeProvider theme={muiTheme}>
      <QueryBuilderMaterial muiComponents={muiComponents}>
        <Demo variant="material" />
      </QueryBuilderMaterial>
    </ThemeProvider>
  );
}

export default function ReactQueryBuilderDemo_Material() {
  return (
    <Layout description="React Query Builder Demo">
      <BrowserOnly fallback={<div>Loading...</div>}>
        {() => <ReactQueryBuilderDemo_MaterialBrowser />}
      </BrowserOnly>
    </Layout>
  );
}
