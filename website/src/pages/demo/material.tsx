/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';
import Layout from '@theme/Layout';
import React, { useEffect, useMemo, useState } from 'react';
import './_styles/demo.scss';
import './_styles/rqb-material.scss';

import DragIndicator from '@mui/icons-material/DragIndicator';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Input from '@mui/material/Input';
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import TextareaAutosize from '@mui/material/TextareaAutosize';

import { createTheme, ThemeProvider } from '@mui/material';
import { QueryBuilderMaterial } from '@react-querybuilder/material';
import { Loading } from '../_utils';

const muiComponents = {
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
};

function ReactQueryBuilderDemo_MaterialBrowser() {
  const { colorMode } = useColorMode();
  const [{ Demo }, setComponents] = useState<{
    Demo?: typeof import('./_components/Demo').default;
  }>({});

  useEffect(() => {
    let active = true;

    const getComps = async () => {
      const comps = await Promise.all([(await import('./_components/Demo')).default]);
      const [Demo] = comps;

      if (active) {
        setComponents(() => ({ Demo }));
      }
    };
    getComps();

    return () => {
      active = false;
    };
  }, []);

  const muiTheme = useMemo(() => createTheme({ palette: { mode: colorMode } }), [colorMode]);

  if (!Demo) return <Loading />;

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
      <BrowserOnly fallback={<Loading />}>
        {() => <ReactQueryBuilderDemo_MaterialBrowser />}
      </BrowserOnly>
    </Layout>
  );
}
