import { QuestionOutlineIcon } from '@chakra-ui/icons';
import { ChakraProvider, Tooltip } from '@chakra-ui/react';
import { Button, Checkbox, Divider, Layout, Radio, Select, Space, Typography } from 'antd';
import { useState } from 'react';
import ReactDOM from 'react-dom';
import QueryBuilder, {
  Classnames,
  Controls,
  defaultValidator,
  ExportFormat,
  Field,
  formatQuery,
  RuleGroupType,
  RuleType
} from '../src';
import '../src/query-builder.scss';
import AntDActionElement from './components/AntDActionElement';
import AntDNotToggle from './components/AntDNotToggle';
import AntDValueEditor from './components/AntDValueEditor';
import AntDValueSelector from './components/AntDValueSelector';
import BootstrapNotToggle from './components/BootstrapNotToggle';
import BootstrapValueEditor from './components/BootstrapValueEditor';
import ChakraActionElement from './components/ChakraActionElement';
import ChakraNotToggle from './components/ChakraNotToggle';
import ChakraValueEditor from './components/ChakraValueEditor';
import ChakraValueSelector from './components/ChakraValueSelector';
import MaterialActionElement from './components/MaterialActionElement';
import MaterialNotToggle from './components/MaterialNotToggle';
import MaterialValueEditor from './components/MaterialValueEditor';
import MaterialValueSelector from './components/MaterialValueSelector';
import './styles/common.scss';
import './styles/github-fork-ribbon.scss';
import './styles/with-antd.less';
import './styles/with-bootstrap.scss';
import './styles/with-chakra.scss';
import './styles/with-default.scss';
import './styles/with-material.scss';

const { Header, Sider, Content } = Layout;
const { Option } = Select;
const { Title } = Typography;

type StyleName = 'default' | 'bootstrap' | 'antd' | 'material' | 'chakra';

const repoLink = 'https://github.com/react-querybuilder/react-querybuilder';

const validator = (r: RuleType) => !!r.value;

const controlClassnames: { [k in StyleName]: Partial<Classnames> } = {
  default: {},
  bootstrap: {
    addGroup: 'btn btn-secondary btn-sm',
    addRule: 'btn btn-primary btn-sm',
    cloneGroup: 'btn btn-secondary btn-sm',
    cloneRule: 'btn btn-secondary btn-sm',
    removeGroup: 'btn btn-danger btn-sm',
    removeRule: 'btn btn-danger btn-sm',
    combinators: 'form-select form-select-sm',
    fields: 'form-select form-select-sm',
    operators: 'form-select form-select-sm',
    value: 'form-control form-control-sm'
  },
  antd: {},
  material: {},
  chakra: {}
};

const controlElements: { [k in StyleName]: Partial<Controls> } = {
  default: {},
  bootstrap: {
    notToggle: BootstrapNotToggle,
    valueEditor: BootstrapValueEditor
  },
  antd: {
    addGroupAction: AntDActionElement,
    addRuleAction: AntDActionElement,
    cloneGroupAction: AntDActionElement,
    cloneRuleAction: AntDActionElement,
    combinatorSelector: AntDValueSelector,
    fieldSelector: AntDValueSelector,
    notToggle: AntDNotToggle,
    operatorSelector: AntDValueSelector,
    removeGroupAction: AntDActionElement,
    removeRuleAction: AntDActionElement,
    valueEditor: AntDValueEditor
  },
  material: {
    addGroupAction: MaterialActionElement,
    addRuleAction: MaterialActionElement,
    cloneGroupAction: MaterialActionElement,
    cloneRuleAction: MaterialActionElement,
    combinatorSelector: MaterialValueSelector,
    fieldSelector: MaterialValueSelector,
    notToggle: MaterialNotToggle,
    operatorSelector: MaterialValueSelector,
    removeGroupAction: MaterialActionElement,
    removeRuleAction: MaterialActionElement,
    valueEditor: MaterialValueEditor
  },
  chakra: {
    addGroupAction: ChakraActionElement,
    addRuleAction: ChakraActionElement,
    cloneGroupAction: ChakraActionElement,
    cloneRuleAction: ChakraActionElement,
    combinatorSelector: ChakraValueSelector,
    fieldSelector: ChakraValueSelector,
    notToggle: ChakraNotToggle,
    operatorSelector: ChakraValueSelector,
    removeGroupAction: ChakraActionElement,
    removeRuleAction: ChakraActionElement,
    valueEditor: ChakraValueEditor
  }
};

const preparedFields: Field[][] = [
  [
    { name: 'firstName', label: 'First Name', placeholder: 'Enter first name', validator },
    {
      name: 'lastName',
      label: 'Last Name',
      placeholder: 'Enter last name',
      defaultOperator: 'beginsWith',
      validator
    }
  ],
  [
    { name: 'age', label: 'Age', inputType: 'number', validator },
    {
      name: 'isMusician',
      label: 'Is a musician',
      valueEditorType: 'checkbox',
      operators: [{ name: '=', label: 'is' }],
      defaultValue: false
    },
    {
      name: 'instrument',
      label: 'Instrument',
      valueEditorType: 'select',
      values: [
        { name: 'Guitar', label: 'Guitar' },
        { name: 'Piano', label: 'Piano' },
        { name: 'Vocals', label: 'Vocals' },
        { name: 'Drums', label: 'Drums' }
      ],
      defaultValue: 'Piano',
      operators: [{ name: '=', label: 'is' }]
    }
  ],
  [
    { name: 'firstName', label: 'First name', placeholder: 'Enter first name', validator },
    { name: 'lastName', label: 'Last name', placeholder: 'Enter last name', validator },
    { name: 'age', label: 'Age', inputType: 'number', validator },
    {
      name: 'gender',
      label: 'Gender',
      operators: [{ name: '=', label: 'is' }],
      valueEditorType: 'radio',
      values: [
        { name: 'M', label: 'Male' },
        { name: 'F', label: 'Female' },
        { name: 'O', label: 'Other' }
      ]
    },
    { name: 'height', label: 'Height', validator },
    { name: 'job', label: 'Job', validator }
  ]
];

const preparedQueries: RuleGroupType[] = [
  {
    id: 'root0',
    rules: [
      {
        field: 'firstName',
        value: 'Steve',
        operator: '='
      },
      {
        field: 'lastName',
        value: 'Vai',
        operator: '='
      }
    ],
    combinator: 'and',
    not: false
  },
  {
    id: 'root1',
    rules: [
      {
        field: 'age',
        operator: '>',
        value: '28'
      },
      {
        field: 'isMusician',
        operator: '=',
        value: true
      },
      {
        field: 'instrument',
        operator: '=',
        value: 'Guitar'
      }
    ],
    combinator: 'or',
    not: false
  },
  {
    id: 'root2',
    combinator: 'and',
    not: false,
    rules: []
  }
];

const formatMap: { fmt: ExportFormat; lbl: string }[] = [
  { fmt: 'json', lbl: 'JSON' },
  { fmt: 'json_without_ids', lbl: 'JSON Without IDs' },
  { fmt: 'sql', lbl: 'SQL' },
  { fmt: 'parameterized', lbl: 'Parameterized SQL' },
  { fmt: 'mongodb', lbl: 'MongoDB' }
];

const RootView = () => {
  const [query, setQuery] = useState<RuleGroupType>(preparedQueries[0]);
  const [fields, setFields] = useState<Field[]>(preparedFields[0]);
  const [format, setFormat] = useState<ExportFormat>('json');
  const [showCombinatorsBetweenRules, setShowCombinatorsBetweenRules] = useState(false);
  const [showNotToggle, setShowNotToggle] = useState(false);
  const [showCloneButtons, setShowCloneButtons] = useState(false);
  const [resetOnFieldChange, setResetOnFieldChange] = useState(true);
  const [resetOnOperatorChange, setResetOnOperatorChange] = useState(false);
  const [autoSelectField, setAutoSelectField] = useState(true);
  const [addRuleToNewGroups, setAddRuleToNewGroups] = useState(false);
  const [useValidation, setUseValidation] = useState(false);
  const [style, setStyle] = useState<StyleName>('default');

  const loadQuery = (target: number) => {
    setQuery(preparedQueries[target]);
    setFields(preparedFields[target]);
  };

  const optionsInfo = [
    {
      checked: showCombinatorsBetweenRules,
      setter: setShowCombinatorsBetweenRules,
      link: '#showcombinatorsbetweenrules-optional',
      label: 'Combinators between rules',
      title:
        'When checked, combinator (and/or) selectors will appear between rules instead of in the group header'
    },
    {
      checked: showNotToggle,
      setter: setShowNotToggle,
      link: '#shownottoggle-optional',
      label: 'Show "not" toggle',
      title: `When checked, the check box to invert a group's rules, by default labelled "Not", will be visible`
    },
    {
      checked: showCloneButtons,
      setter: setShowCloneButtons,
      link: '#showclonebuttons-optional',
      label: 'Show clone buttons',
      title: 'When checked, the buttons to clone rules and groups will be visible'
    },
    {
      checked: resetOnFieldChange,
      setter: setResetOnFieldChange,
      link: '#resetonfieldchange-optional',
      label: 'Reset on field change',
      title: `When checked, operator and value will be reset when a rule's field selection changes`
    },
    {
      checked: resetOnOperatorChange,
      setter: setResetOnOperatorChange,
      link: '#resetonoperatorchange-optional',
      label: 'Reset on operator change',
      title: 'When checked, the value will reset when the operator changes'
    },
    {
      checked: autoSelectField,
      setter: setAutoSelectField,
      link: '#autoselectfield-optional',
      label: 'Auto-select field',
      title: 'When checked, the default field will be automatically selected for new rules'
    },
    {
      checked: addRuleToNewGroups,
      setter: setAddRuleToNewGroups,
      link: '#addruletonewgroups-optional',
      label: 'Add rule to new groups',
      title: 'When checked, a rule will be automatically added to new groups'
    },
    {
      checked: useValidation,
      setter: setUseValidation,
      link: '#validator-optional',
      label: 'Use validation',
      title:
        'When checked, the validator functions will be used to put a purple outline around empty text fields and bold the +Rule button for empty groups'
    }
  ];

  const formatString =
    format === 'json_without_ids'
      ? JSON.stringify(JSON.parse(formatQuery(query, { format }) as string), null, 2)
      : format === 'parameterized'
      ? JSON.stringify(formatQuery(query, { format }), null, 2)
      : formatQuery(query, { format });

  const qbWrapperClassName = `with-${style} ${useValidation ? 'useValidation' : ''}`.trim();

  return (
    <ChakraProvider resetCSS={style === 'chakra'}>
      <Layout>
        <Header>
          <Title level={3} style={{ display: 'inline-block' }}>
            <a href="https://github.com/react-querybuilder/react-querybuilder">
              React Query Builder
            </a>
          </Title>
        </Header>
        <Layout>
          <Sider theme="light" width={260} style={{ padding: '1rem' }}>
            <Title level={4}>Style</Title>
            <Select value={style} onChange={(v) => setStyle(v as StyleName)}>
              <Option value="default">Default</Option>
              <Option value="bootstrap">Bootstrap</Option>
              <Option value="material">Material</Option>
              <Option value="antd">Ant Design</Option>
              <Option value="chakra">Chakra UI</Option>
            </Select>
            <Divider />
            <Title level={4}>
              Options
              {'\u00a0'}
              <a href={`${repoLink}#api`} target="_blank" rel="noreferrer">
                <Tooltip
                  label={`Boolean props on the QueryBuilder component (click for documentation)`}
                  fontSize="small"
                  placement="right">
                  <QuestionOutlineIcon />
                </Tooltip>
              </a>
            </Title>
            <div>
              {optionsInfo.map(({ checked, label, link, setter, title }) => (
                <div key={label}>
                  <Checkbox checked={checked} onChange={(e) => setter(e.target.checked)}>
                    {label}
                    {'\u00a0'}
                    <a href={`${repoLink}${link}`} target="_blank" rel="noreferrer">
                      <Tooltip
                        label={`${title} (click for documentation)`}
                        fontSize="small"
                        placement="right">
                        <QuestionOutlineIcon />
                      </Tooltip>
                    </a>
                  </Checkbox>
                </div>
              ))}
            </div>
            <Divider />
            <Title level={4}>
              Output
              {'\u00a0'}
              <a href={`${repoLink}#formatquery`} target="_blank" rel="noreferrer">
                <Tooltip
                  label={`The output format of the formatQuery function (click for documentation)`}
                  fontSize="small"
                  placement="right">
                  <QuestionOutlineIcon />
                </Tooltip>
              </a>
            </Title>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
              {formatMap.map(({ fmt, lbl }) => (
                <Radio key={fmt} checked={format === fmt} onChange={() => setFormat(fmt)}>
                  {lbl}
                  {'\u00a0'}
                  <Tooltip
                    label={`formatQuery(query, "${fmt}")`}
                    fontSize="small"
                    placement="right">
                    <QuestionOutlineIcon />
                  </Tooltip>
                </Radio>
              ))}
            </div>
            <Divider />
            <Title level={4}>Installation</Title>
            <pre>npm i react-querybuilder</pre>
            OR
            <pre>yarn add react-querybuilder</pre>
          </Sider>
          <Content style={{ backgroundColor: '#ffffff', padding: '1rem 1rem 0 0' }}>
            <Space>
              {[null, null, null].map((_el, idx) => (
                <Button key={idx} type="default" onClick={() => loadQuery(idx)}>
                  Load query #{idx + 1}
                </Button>
              ))}
            </Space>
            <div className={qbWrapperClassName}>
              <form className="form-inline" style={{ marginTop: '1rem' }}>
                <QueryBuilder
                  query={query}
                  fields={fields}
                  controlClassnames={controlClassnames[style]}
                  controlElements={controlElements[style]}
                  onQueryChange={setQuery}
                  showCombinatorsBetweenRules={showCombinatorsBetweenRules}
                  showNotToggle={showNotToggle}
                  showCloneButtons={showCloneButtons}
                  resetOnFieldChange={resetOnFieldChange}
                  resetOnOperatorChange={resetOnOperatorChange}
                  autoSelectField={autoSelectField}
                  addRuleToNewGroups={addRuleToNewGroups}
                  validator={useValidation && defaultValidator}
                />
              </form>
            </div>
            <Divider />
            <pre>{formatString}</pre>
          </Content>
        </Layout>
      </Layout>
    </ChakraProvider>
  );
};

ReactDOM.render(<RootView />, document.querySelector('.container'));
