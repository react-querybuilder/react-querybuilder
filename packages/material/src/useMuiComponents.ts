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
  InputLabel,
  ListSubheader,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextareaAutosize,
  TextField,
} from '@mui/material';
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
  InputLabel,
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
