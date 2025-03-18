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
import { useContext, useMemo } from 'react';
import { RQBMaterialContext } from './RQBMaterialContext';
import type { RQBMaterialComponents } from './types';

export const defaultMuiComponents: RQBMaterialComponents = {
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

/**
 * @group Hooks
 */
export const useMuiComponents = (
  preloadedComponents?: RQBMaterialComponents
): RQBMaterialComponents => {
  const muiComponentsFromContext = useContext(RQBMaterialContext);

  const initialComponents = useMemo(
    () =>
      preloadedComponents && muiComponentsFromContext
        ? {
            ...defaultMuiComponents,
            ...muiComponentsFromContext,
            ...preloadedComponents,
          }
        : preloadedComponents
          ? { ...defaultMuiComponents, ...preloadedComponents }
          : muiComponentsFromContext
            ? { ...defaultMuiComponents, ...muiComponentsFromContext }
            : defaultMuiComponents,
    [muiComponentsFromContext, preloadedComponents]
  );

  return initialComponents;
};
