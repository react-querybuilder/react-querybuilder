import type {
  Close as CloseIcon,
  ContentCopy as ContentCopyIcon,
  DragIndicator,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material';
import type {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  ListSubheader,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextareaAutosize,
  TextField,
} from '@mui/material';

/**
 * @group Props
 */
export type RQBMaterialComponents = {
  Button: typeof Button;
  Checkbox: typeof Checkbox;
  CloseIcon: typeof CloseIcon;
  ContentCopyIcon: typeof ContentCopyIcon;
  DragIndicator: typeof DragIndicator;
  FormControl: typeof FormControl;
  FormControlLabel: typeof FormControlLabel;
  ListSubheader: typeof ListSubheader;
  LockIcon: typeof LockIcon;
  LockOpenIcon: typeof LockOpenIcon;
  MenuItem: typeof MenuItem;
  KeyboardArrowDownIcon: typeof KeyboardArrowDownIcon;
  KeyboardArrowUpIcon: typeof KeyboardArrowUpIcon;
  Radio: typeof Radio;
  RadioGroup: typeof RadioGroup;
  Select: typeof Select;
  Switch: typeof Switch;
  TextareaAutosize: typeof TextareaAutosize;
  TextField: typeof TextField;
};

/**
 * @group Props
 */
export type MuiComponentName = keyof RQBMaterialComponents;
