import {
  Close as CloseIcon,
  ContentCopy as ContentCopyIcon,
  DragIndicator,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material';
import {
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
} from '@mui/material';
import { useContext, useMemo } from 'react';
import { RQBMaterialContext } from './RQBMaterialContext';
import type { RQBMaterialComponents } from './types';

export const defaultMuiComponents = {
  DragIndicator,
  Button,
  Checkbox,
  CloseIcon,
  ContentCopyIcon,
  FormControl,
  FormControlLabel,
  Input,
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
} satisfies RQBMaterialComponents;

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
