export { QueryBuilderProps } from '../index';

// --- Support Types
export interface NameAndLabel {
  name: string;
  label: string;
}

export interface ControlClassnames {
  queryBuilder: string;

  ruleGroup: string;
  combinators: string;
  addRule: string;
  addGroup: string;
  removeGroup: string;

  rule: string;
  fields: string;
  operators: string;
  value: string;
  removeRule: string;
}

// --- Rules / Rule Groups
export interface Rule {
  id: string;
  field: NameAndLabel;
  value: string;
  operator: NameAndLabel;
}

export interface RuleGroup {
  id: string;
  rules: (Rule | RuleGroup)[];
  combinator: string;
}

export interface Schema {
  fields: NameAndLabel[];
  operators: NameAndLabel[];
  combinators: NameAndLabel[];

  classNames: ControlClassnames;

  createRule: () => Rule;
  createRuleGroup: () => RuleGroup;
  onRuleAdd: (rule: Rule, parentId: string | null) => void;
  onGroupAdd: (group: RuleGroup, parentId: string | null) => void;
  onRuleRemove: (ruleId: string | null, parentId: string | null) => void;
  onGroupRemove: (groupId: string | null, parentId: string | null) => void;
  onPropChange: (prop: any, value: any, ruleId: string | null) => void;
  getLevel: (id: string | null) => number;
  isRuleGroup: (rule: any) => rule is RuleGroup;
  controls: any; // Object of objects
  getOperators: (field: string) => NameAndLabel[];
}

// --- Translations
export interface TranslationTitle {
  title: string;
}

export interface TranslationDetails {
  title: string;
  label: string;
}

export interface Translations {
  fields?: TranslationTitle;
  operators?: TranslationTitle;
  value?: TranslationTitle;
  removeRule?: TranslationDetails;
  removeGroup?: TranslationDetails;
  addRule?: TranslationDetails;
  addGroup?: TranslationDetails;
  combinators?: TranslationTitle;
}
