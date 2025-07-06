/* oxlint-disable @typescript-eslint/consistent-type-imports */
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';
import Layout from '@theme/Layout';
import { useEffect, useMemo, useState } from 'react';
import './_styles/demo.css';
import './_styles/rqb-material.css';

import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DragIndicator from '@mui/icons-material/DragIndicator';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import TextField from '@mui/material/TextField';

import { createTheme, ThemeProvider } from '@mui/material';
import { QueryBuilderMaterial } from '@react-querybuilder/material';
import { Loading } from '../_utils';

const loading = <Loading />;

const muiComponents = {
  DragIndicator,
  Button,
  Checkbox,
  CloseIcon,
  ContentCopyIcon,
  FormControl,
  FormControlLabel,
  KeyboardArrowDownIcon,
  KeyboardArrowUpIcon,
  ListSubheader,
  LockIcon,
  LockOpenIcon,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextareaAutosize,
  TextField,
};

function ReactQueryBuilderDemo_MaterialBrowser() {
  const { colorMode } = useColorMode();
  const [{ Demo }, setComponents] = useState<{
    Demo?: typeof import('./_components/Demo').default;
  }>({});

  useEffect(() => {
    let active = true;

    const getComps = async () => {
      const { default: Demo } = await import('./_components/Demo');

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
      <BrowserOnly fallback={loading}>
        {() => <ReactQueryBuilderDemo_MaterialBrowser />}
      </BrowserOnly>
    </Layout>
  );
}
