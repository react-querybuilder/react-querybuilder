import type { Controls } from 'react-querybuilder';
import { KittenActionElement } from './KittenActionElement';

export const controlElements: Partial<Controls> = {
  addGroupAction: KittenActionElement,
  addRuleAction: KittenActionElement,
  cloneGroupAction: KittenActionElement,
  cloneRuleAction: KittenActionElement,
  lockRuleAction: KittenActionElement,
  lockGroupAction: KittenActionElement,
  removeGroupAction: KittenActionElement,
  removeRuleAction: KittenActionElement,
};
