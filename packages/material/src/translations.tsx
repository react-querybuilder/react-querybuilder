import * as React from 'react';
import type { Translations } from 'react-querybuilder';
import { defaultTranslations } from 'react-querybuilder';
import { RQBMaterialContext } from './RQBMaterialContext';

const CloseIconWrapper = () => {
  const muiComponents = React.useContext(RQBMaterialContext);
  if (!muiComponents) {
    return defaultTranslations.removeRule.label;
  }
  const { CloseIcon } = muiComponents;
  return <CloseIcon />;
};
const ContentCopyIconWrapper = () => {
  const muiComponents = React.useContext(RQBMaterialContext);
  if (!muiComponents) {
    return defaultTranslations.cloneRule.label;
  }
  const { ContentCopyIcon } = muiComponents;
  return <ContentCopyIcon />;
};
const LockIconWrapper = () => {
  const muiComponents = React.useContext(RQBMaterialContext);
  if (!muiComponents) {
    return defaultTranslations.lockRuleDisabled.label;
  }
  const { LockIcon } = muiComponents;
  return <LockIcon />;
};
const LockOpenIconWrapper = () => {
  const muiComponents = React.useContext(RQBMaterialContext);
  if (!muiComponents) {
    return defaultTranslations.lockRule.label;
  }
  const { LockOpenIcon } = muiComponents;
  return <LockOpenIcon />;
};
const ShiftDownIconWrapper = () => {
  const muiComponents = React.useContext(RQBMaterialContext);
  if (!muiComponents) {
    return defaultTranslations.shiftActionDown.label;
  }
  const { KeyboardArrowDownIcon } = muiComponents;
  return <KeyboardArrowDownIcon />;
};
const ShiftUpIconWrapper = () => {
  const muiComponents = React.useContext(RQBMaterialContext);
  if (!muiComponents) {
    return defaultTranslations.shiftActionUp.label;
  }
  const { KeyboardArrowUpIcon } = muiComponents;
  return <KeyboardArrowUpIcon />;
};

export const materialTranslations: Pick<
  Translations,
  | 'removeGroup'
  | 'removeRule'
  | 'cloneRule'
  | 'cloneRuleGroup'
  | 'lockGroup'
  | 'lockRule'
  | 'lockGroupDisabled'
  | 'lockRuleDisabled'
  | 'shiftActionDown'
  | 'shiftActionUp'
> = {
  removeGroup: { label: <CloseIconWrapper /> },
  removeRule: { label: <CloseIconWrapper /> },
  cloneRule: { label: <ContentCopyIconWrapper /> },
  cloneRuleGroup: { label: <ContentCopyIconWrapper /> },
  lockGroup: { label: <LockOpenIconWrapper /> },
  lockRule: { label: <LockOpenIconWrapper /> },
  lockGroupDisabled: { label: <LockIconWrapper /> },
  lockRuleDisabled: { label: <LockIconWrapper /> },
  shiftActionDown: { label: <ShiftDownIconWrapper /> },
  shiftActionUp: { label: <ShiftUpIconWrapper /> },
};
