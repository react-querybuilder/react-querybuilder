import type { Controls } from 'react-querybuilder';
import { PaperActionElement } from './PaperActionElement';

export const controlElements: Partial<Controls> = {
  addGroupAction: PaperActionElement,
  addRuleAction: PaperActionElement,
  cloneGroupAction: PaperActionElement,
  cloneRuleAction: PaperActionElement,
  lockRuleAction: PaperActionElement,
  lockGroupAction: PaperActionElement,
  removeGroupAction: PaperActionElement,
  removeRuleAction: PaperActionElement,
};
