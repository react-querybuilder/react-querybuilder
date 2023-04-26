import type { DragIndicator } from '@mui/icons-material';
import type {
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

export type RQBMaterialComponents = {
  Button: typeof Button;
  Checkbox: typeof Checkbox;
  DragIndicator: typeof DragIndicator;
  FormControl: typeof FormControl;
  FormControlLabel: typeof FormControlLabel;
  Input: typeof Input;
  ListSubheader: typeof ListSubheader;
  MenuItem: typeof MenuItem;
  Radio: typeof Radio;
  RadioGroup: typeof RadioGroup;
  Select: typeof Select;
  Switch: typeof Switch;
  TextareaAutosize: typeof TextareaAutosize;
};

export type MuiComponentName = keyof RQBMaterialComponents;
