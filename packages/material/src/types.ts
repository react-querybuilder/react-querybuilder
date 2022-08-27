/* eslint-disable-next-line @typescript-eslint/consistent-type-imports */
export type ButtonType = typeof import('@mui/material/Button').default;
/* eslint-disable-next-line @typescript-eslint/consistent-type-imports */
export type CheckboxType = typeof import('@mui/material/Checkbox').default;
/* eslint-disable-next-line @typescript-eslint/consistent-type-imports */
export type DragIndicatorType = typeof import('@mui/icons-material/DragIndicator').default;
/* eslint-disable-next-line @typescript-eslint/consistent-type-imports */
export type FormControlLabelType = typeof import('@mui/material/FormControlLabel').default;
/* eslint-disable-next-line @typescript-eslint/consistent-type-imports */
export type FormControlType = typeof import('@mui/material/FormControl').default;
/* eslint-disable-next-line @typescript-eslint/consistent-type-imports */
export type InputType = typeof import('@mui/material/Input').default;
/* eslint-disable-next-line @typescript-eslint/consistent-type-imports */
export type ListSubheaderType = typeof import('@mui/material/ListSubheader').default;
/* eslint-disable-next-line @typescript-eslint/consistent-type-imports */
export type MenuItemType = typeof import('@mui/material/MenuItem').default;
/* eslint-disable-next-line @typescript-eslint/consistent-type-imports */
export type RadioGroupType = typeof import('@mui/material/RadioGroup').default;
/* eslint-disable-next-line @typescript-eslint/consistent-type-imports */
export type RadioType = typeof import('@mui/material/Radio').default;
/* eslint-disable-next-line @typescript-eslint/consistent-type-imports */
export type SelectType = typeof import('@mui/material/Select').default;
/* eslint-disable-next-line @typescript-eslint/consistent-type-imports */
export type SwitchType = typeof import('@mui/material/Switch').default;
/* eslint-disable-next-line @typescript-eslint/consistent-type-imports */
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
