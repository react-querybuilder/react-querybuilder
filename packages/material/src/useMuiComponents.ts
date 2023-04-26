import { DragIndicator } from '@mui/icons-material';
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

export const defaultMuiComponents: RQBMaterialComponents = {
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
        : /* TODO: why does this next line cause the app to crash? */
          /* componentCache && process.env.NODE_ENV === 'production' ? componentCache : */
          defaultMuiComponents,
    [muiComponentsFromContext, preloadedComponents]
  );

  return initialComponents;
};
