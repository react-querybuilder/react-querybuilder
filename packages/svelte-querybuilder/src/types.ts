import type {
  BaseOption,
  BaseTranslations,
  Classnames,
  Combinator,
  Field,
  FullField,
  FullOperator,
  FullOptionList,
  Operator,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleType,
  ValidationMap,
  ValidationResult,
  ValueSources,
} from '@react-querybuilder/core';

export interface QueryBuilderProps<RG extends RuleGroupTypeAny = RuleGroupType> {
  /**
   * Query object (use with bind:query for two-way binding)
   */
  query?: RG;

  /**
   * Array of field definitions
   */
  fields?: Field[];

  /**
   * Callback when query changes
   */
  onQueryChange?: (query: RG) => void;

  /**
   * Custom operators list
   */
  operators?: Operator[];

  /**
   * Custom combinators list
   */
  combinators?: Combinator[];

  /**
   * Custom control components
   */
  controlElements?: Partial<ControlElementProps>;

  /**
   * CSS class overrides
   */
  controlClassnames?: Partial<Classnames>;

  /**
   * Custom translations
   */
  translations?: Partial<BaseTranslations>;

  /**
   * Show NOT toggle for groups
   */
  showNotToggle?: boolean;

  /**
   * Show combinators between rules
   */
  showCombinatorsBetweenRules?: boolean;

  /**
   * Disable all controls
   */
  disabled?: boolean;

  /**
   * Add rule to new groups automatically
   */
  addRuleToNewGroups?: boolean;

  /**
   * Independent combinators mode
   */
  independentCombinators?: boolean;

  /**
   * Enable drag and drop
   */
  enableDragAndDrop?: boolean;

  /**
   * Validation map
   */
  validator?: ValidationMap;

  /**
   * Context object passed to all controls
   */
  context?: unknown;

  /**
   * Show cloning UI
   */
  showCloneButtons?: boolean;

  /**
   * Show lock UI
   */
  showLockButtons?: boolean;

  /**
   * Show mute UI
   */
  showMuteButtons?: boolean;

  /**
   * Show shift actions (up/down)
   */
  showShiftActions?: boolean;

  /**
   * Reset on field change
   */
  resetOnFieldChange?: boolean;

  /**
   * Reset on operator change
   */
  resetOnOperatorChange?: boolean;

  /**
   * Auto-select first field
   */
  autoSelectField?: boolean;

  /**
   * Auto-select first operator
   */
  autoSelectOperator?: boolean;

  /**
   * List size threshold for single/multiselect
   */
  listsAsArrays?: boolean;

  /**
   * Parse numbers
   */
  parseNumbers?: boolean;

  /**
   * Debugging output
   */
  debugMode?: boolean;

  /**
   * Custom ID for this builder
   */
  qbId?: string;
}

export interface RuleGroupProps<RG extends RuleGroupTypeAny = RuleGroupType> {
  /**
   * The rule group to render
   */
  ruleGroup: RG;

  /**
   * Path to this group
   */
  path: number[];

  /**
   * Schema containing all configuration
   */
  schema: QueryBuilderSchema;

  /**
   * Actions for manipulating the query
   */
  actions: QueryBuilderActions;

  /**
   * Nesting level (0 = root)
   */
  level?: number;

  /**
   * Parent disabled state
   */
  disabled?: boolean;

  /**
   * Whether shifting up is disabled
   */
  shiftUpDisabled?: boolean;

  /**
   * Whether shifting down is disabled
   */
  shiftDownDisabled?: boolean;

  /**
   * Parent context
   */
  context?: unknown;
}

export interface RuleProps {
  /**
   * The rule to render
   */
  rule: RuleType;

  /**
   * Path to this rule
   */
  path: number[];

  /**
   * Schema containing all configuration
   */
  schema: QueryBuilderSchema;

  /**
   * Actions for manipulating the query
   */
  actions: QueryBuilderActions;

  /**
   * Nesting level
   */
  level?: number;

  /**
   * Parent disabled state
   */
  disabled?: boolean;

  /**
   * Whether shifting up is disabled
   */
  shiftUpDisabled?: boolean;

  /**
   * Whether shifting down is disabled
   */
  shiftDownDisabled?: boolean;

  /**
   * Parent context
   */
  context?: unknown;
}

export interface QueryBuilderSchema {
  fields: FullField[];
  operators: FullOperator[];
  combinators: Combinator[];
  controls: ControlElementProps;
  classNames: Classnames;
  translations: BaseTranslations;
  validationMap?: ValidationMap;
  showNotToggle: boolean;
  showCombinatorsBetweenRules: boolean;
  showCloneButtons: boolean;
  showLockButtons: boolean;
  showMuteButtons: boolean;
  showShiftActions: boolean;
  independentCombinators: boolean;
  enableDragAndDrop: boolean;
  autoSelectField: boolean;
  autoSelectOperator: boolean;
  addRuleToNewGroups: boolean;
  resetOnFieldChange: boolean;
  resetOnOperatorChange: boolean;
  listsAsArrays: boolean;
  parseNumbers: boolean;
  debugMode: boolean;
  qbId: string;
  valueSources?: ValueSources;
}

export interface QueryBuilderActions {
  onGroupAdd: (path: number[]) => void;
  onGroupRemove: (path: number[]) => void;
  onRuleAdd: (path: number[], rule?: RuleType) => void;
  onRuleRemove: (path: number[]) => void;
  onPropChange: (prop: string, value: unknown, path: number[]) => void;
  moveRule: (oldPath: number[], newPath: number[], clone?: boolean) => void;
}

export interface ControlElementProps {
  /**
   * Path to the element
   */
  path: number[];

  /**
   * Nesting level
   */
  level: number;

  /**
   * Schema
   */
  schema: QueryBuilderSchema;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Context
   */
  context?: unknown;

  /**
   * Test ID
   */
  testID?: string;

  /**
   * CSS class name
   */
  className?: string;

  /**
   * Validation result
   */
  validation?: ValidationResult;

  // /**
  //  * Element-specific props
  //  */
  // [key: string]: any;
}

export interface ValueEditorProps extends ControlElementProps {
  field: string;
  operator: string;
  // oxlint-disable-next-line typescript/no-explicit-any
  value: any;
  valueSource: 'value' | 'field';
  fieldData: FullField;
  type?:
    | 'text'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'textarea'
    | 'multiselect'
    | 'date'
    | 'datetime-local'
    | 'time';
  inputType?: string;
  // oxlint-disable-next-line typescript/no-explicit-any
  values?: any[];
  listsAsArrays?: boolean;
  parseNumbers?: boolean;
  // oxlint-disable-next-line typescript/no-explicit-any
  handleOnChange: (value: any) => void;
}

export interface ValueSelectorProps extends ControlElementProps {
  options: FullOptionList<BaseOption>;
  value: string;
  // oxlint-disable-next-line typescript/no-explicit-any
  handleOnChange: (value: any) => void;
  multiple?: boolean;
  listsAsArrays?: boolean;
  title?: string;
}

export interface ActionElementProps extends ControlElementProps {
  label?: string;
  title?: string;
  handleOnClick: (e: Event) => void;
  ruleOrGroup?: RuleType | RuleGroupType;
}

export interface NotToggleProps extends ControlElementProps {
  checked: boolean;
  handleOnChange: (checked: boolean) => void;
  label?: string;
  title?: string;
}

export interface ShiftActionsProps extends ControlElementProps {
  shiftUp?: () => void;
  shiftDown?: () => void;
  shiftUpDisabled?: boolean;
  shiftDownDisabled?: boolean;
  labels?: {
    shiftUp?: string;
    shiftDown?: string;
  };
  titles?: {
    shiftUp?: string;
    shiftDown?: string;
  };
}
