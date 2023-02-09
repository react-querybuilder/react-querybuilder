/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';
import { RQBMaterialComponents } from '@react-querybuilder/material/dist/types/types';
import Layout from '@theme/Layout';
import React, { useEffect, useMemo, useState } from 'react';
import './_styles/demo.scss';
import './_styles/rqb-material.scss';

function ReactQueryBuilderDemo_MaterialBrowser() {
  const { colorMode } = useColorMode();
  const [muiComponents, setMuiComponents] = useState<RQBMaterialComponents | null>(null);

  useEffect(() => {
    let active = true;

    const loadComponents = async () => {
      // setMuiComponents(null)
      const DragIndicator = (
        (await import(
          '@mui/icons-material/DragIndicator'
        )) as typeof import('@mui/icons-material/DragIndicator')
      ).default;
      const Button = (
        (await import('@mui/material/Button')) as typeof import('@mui/material/Button')
      ).default;
      const Checkbox = (
        (await import('@mui/material/Checkbox')) as typeof import('@mui/material/Checkbox')
      ).default;
      const FormControl = (
        (await import('@mui/material/FormControl')) as typeof import('@mui/material/FormControl')
      ).default;
      const FormControlLabel = (
        (await import(
          '@mui/material/FormControlLabel'
        )) as typeof import('@mui/material/FormControlLabel')
      ).default;
      const Input = ((await import('@mui/material/Input')) as typeof import('@mui/material/Input'))
        .default;
      const ListSubheader = (
        (await import(
          '@mui/material/ListSubheader'
        )) as typeof import('@mui/material/ListSubheader')
      ).default;
      const MenuItem = (
        (await import('@mui/material/MenuItem')) as typeof import('@mui/material/MenuItem')
      ).default;
      const Radio = ((await import('@mui/material/Radio')) as typeof import('@mui/material/Radio'))
        .default;
      const RadioGroup = (
        (await import('@mui/material/RadioGroup')) as typeof import('@mui/material/RadioGroup')
      ).default;
      const Select = (
        (await import('@mui/material/Select')) as typeof import('@mui/material/Select')
      ).default;
      const Switch = (
        (await import('@mui/material/Switch')) as typeof import('@mui/material/Switch')
      ).default;
      const TextareaAutosize = (
        (await import(
          '@mui/material/TextareaAutosize'
        )) as typeof import('@mui/material/TextareaAutosize')
      ).default;

      if (!active) {
        return;
      }

      setMuiComponents({
        DragIndicator,
        Button,
        Checkbox,
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
      });
    };

    loadComponents();

    return () => {
      active = false;
    };
  }, []);

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

  const muiTheme = useMemo(
    () => createTheme({ palette: { mode: colorMode } }),
    [colorMode, createTheme]
  );

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
