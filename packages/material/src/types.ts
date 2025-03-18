import type CloseIcon from '@mui/icons-material/Close';
import type ContentCopyIcon from '@mui/icons-material/ContentCopy';
import type DragIndicator from '@mui/icons-material/DragIndicator';
import type KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import type KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import type LockIcon from '@mui/icons-material/Lock';
import type LockOpenIcon from '@mui/icons-material/LockOpen';
import type Button from '@mui/material/Button';
import type Checkbox from '@mui/material/Checkbox';
import type FormControl from '@mui/material/FormControl';
import type FormControlLabel from '@mui/material/FormControlLabel';
import type ListSubheader from '@mui/material/ListSubheader';
import type MenuItem from '@mui/material/MenuItem';
import type Radio from '@mui/material/Radio';
import type RadioGroup from '@mui/material/RadioGroup';
import type Select from '@mui/material/Select';
import type Switch from '@mui/material/Switch';
import type TextareaAutosize from '@mui/material/TextareaAutosize';
import type TextField from '@mui/material/TextField';

/**
 * @group Props
 */
export interface RQBMaterialComponents {
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
}

/**
 * @group Props
 */
export type MuiComponentName = keyof RQBMaterialComponents;
