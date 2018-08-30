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
  rules: Rule[];
  combinator: string;
}

export interface Schema {
  fields: NameAndLabel[];
  operators: NameAndLabel[];
  combinators: NameAndLabel[];

  classNames: ControlClassnames;

  createRule: () => Rule;
  createRuleGroup: () => RuleGroup;
  onRuleAdd: (rule: Rule, parentId: string) => void;
  onGroupAdd: (group: RuleGroup, parentId: string) => void;
  onRuleRemove: (ruleId: string, parentId: string) => void;
  onGroupRemove: (groupId: string, parentId: string) => void;
  onPropChange: (prop: any, value: any, ruleId: string) => void;
  getLevel: (id: string) => number;
  isRuleGroup: (rule: any) => rule is RuleGroup;
  controls: any; // Object of objects
  getOperators: (field: NameAndLabel) => NameAndLabel[];
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
  fields: TranslationTitle;
  operators: TranslationTitle;
  value: TranslationTitle;
  removeRule: TranslationDetails;
  removeGroup: TranslationDetails;
  addRule: TranslationDetails;
  addGroup: TranslationDetails;
  combinators: TranslationDetails;
}
