/* eslint-disable @typescript-eslint/consistent-type-imports */
export type ButtonType = typeof import('@mui/material/Button').default;
export type CheckboxType = typeof import('@mui/material/Checkbox').default;
export type DragIndicatorType = typeof import('@mui/icons-material/DragIndicator').default;
export type FormControlLabelType = typeof import('@mui/material/FormControlLabel').default;
export type FormControlType = typeof import('@mui/material/FormControl').default;
export type InputType = typeof import('@mui/material/Input').default;
export type ListSubheaderType = typeof import('@mui/material/ListSubheader').default;
export type MenuItemType = typeof import('@mui/material/MenuItem').default;
export type RadioGroupType = typeof import('@mui/material/RadioGroup').default;
export type RadioType = typeof import('@mui/material/Radio').default;
export type SelectType = typeof import('@mui/material/Select').default;
export type SwitchType = typeof import('@mui/material/Switch').default;
export type TextareaAutosizeType = typeof import('@mui/material/TextareaAutosize').default;

export type RQBMaterialComponents = {
  Button: ButtonType;
  Checkbox: CheckboxType;
  DragIndicator: DragIndicatorType;
  FormControl: FormControlType;
  FormControlLabel: FormControlLabelType;
  Input: InputType;
  ListSubheader: ListSubheaderType;
  MenuItem: MenuItemType;
  Radio: RadioType;
  RadioGroup: RadioGroupType;
  Select: SelectType;
  Switch: SwitchType;
  TextareaAutosize: TextareaAutosizeType;
};

export type MuiComponentName = keyof RQBMaterialComponents;
