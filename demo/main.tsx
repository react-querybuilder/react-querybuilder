import { ChakraProvider } from '@chakra-ui/react';
import { Button, Checkbox, Divider, Layout, Radio, Select, Space, Typography } from 'antd';
import { useState } from 'react';
import ReactDOM from 'react-dom';
import QueryBuilder, {
  Classnames,
  Controls,
  ExportFormat,
  Field,
  formatQuery,
  RuleGroupType
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

const generateID = () => Math.random().toString();

const controlClassnames: { [k in StyleName]: Partial<Classnames> } = {
  default: {},
  bootstrap: {
    addGroup: 'btn btn-secondary btn-sm',
    addRule: 'btn btn-primary btn-sm',
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
    { name: 'firstName', label: 'First Name', placeholder: 'Enter first name' },
    { name: 'lastName', label: 'Last Name', placeholder: 'Enter last name' }
  ],
  [
    { name: 'age', label: 'Age', inputType: 'number' },
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
    { name: 'firstName', label: 'First name', placeholder: 'Enter first name' },
    { name: 'lastName', label: 'Last name', placeholder: 'Enter last name' },
    { name: 'age', label: 'Age', inputType: 'number' },
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
    { name: 'height', label: 'Height' },
    { name: 'job', label: 'Job' }
  ]
];

const preparedQueries: RuleGroupType[] = [
  {
    id: `g-${generateID()}`,
    rules: [
      {
        id: `r-${generateID()}`,
        field: 'firstName',
        value: 'Steve',
        operator: '='
      },
      {
        id: `r-${generateID()}`,
        field: 'lastName',
        value: 'Vai',
        operator: '='
      }
    ],
    combinator: 'and',
    not: false
  },
  {
    id: `g-${generateID()}`,
    rules: [
      {
        field: 'age',
        id: `r-${generateID()}`,
        operator: '>',
        value: '28'
      },
      {
        field: 'isMusician',
        id: `r-${generateID()}`,
        operator: '=',
        value: true
      },
      {
        field: 'instrument',
        id: `r-${generateID()}`,
        operator: '=',
        value: 'Guitar'
      }
    ],
    combinator: 'or',
    not: false
  },
  {
    id: `g-${generateID()}`,
    combinator: 'and',
    not: false,
    rules: []
  }
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
  const [style, setStyle] = useState<StyleName>('default');

  /**
   * Reloads a prepared query, a PoC for query updates by props change.
   * If no target is supplied, clear query (generic query).
   */
  const loadQuery = (target: number) => {
    setQuery(preparedQueries[target]);
    setFields(preparedFields[target]);
  };

  const handleQueryChange = (query) => {
    setQuery(query);
  };

  const formatString =
    format === 'json_without_ids'
      ? JSON.stringify(JSON.parse(formatQuery(query, { format }) as string), null, 2)
      : format === 'parameterized'
      ? JSON.stringify(formatQuery(query, { format }), null, 2)
      : formatQuery(query, { format });

  const qbWrapperClassName = `with-${style}`;

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
            <Title level={4}>Options</Title>
            <div>
              <div>
                <Checkbox
                  checked={showCombinatorsBetweenRules}
                  onChange={(e) => setShowCombinatorsBetweenRules(e.target.checked)}
                >
                  Show combinators between rules
                </Checkbox>
              </div>
              <div>
                <Checkbox
                  checked={showNotToggle}
                  onChange={(e) => setShowNotToggle(e.target.checked)}
                >
                  Show &quot;not&quot; toggle
                </Checkbox>
              </div>
              <div>
                <Checkbox
                  checked={showCloneButtons}
                  onChange={(e) => setShowCloneButtons(e.target.checked)}
                >
                  Show clone buttons
                </Checkbox>
              </div>
              <div>
                <Checkbox
                  checked={resetOnFieldChange}
                  onChange={(e) => setResetOnFieldChange(e.target.checked)}
                >
                  Reset rule on field change
                </Checkbox>
              </div>
              <div>
                <Checkbox
                  checked={resetOnOperatorChange}
                  onChange={(e) => setResetOnOperatorChange(e.target.checked)}
                >
                  Reset rule on operator change
                </Checkbox>
              </div>
              <div>
                <Checkbox
                  checked={autoSelectField}
                  onChange={(e) => setAutoSelectField(e.target.checked)}
                >
                  Auto-select field
                </Checkbox>
              </div>
            </div>
            <Divider />
            <Title level={4}>Output</Title>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}
            >
              {(
                [
                  { fmt: 'json', lbl: 'JSON' },
                  { fmt: 'json_without_ids', lbl: 'JSON Without IDs' },
                  { fmt: 'sql', lbl: 'SQL' },
                  { fmt: 'parameterized', lbl: 'Parameterized' },
                  { fmt: 'mongodb', lbl: 'MongoDB' }
                ] as const
              ).map(({ fmt, lbl }) => (
                <Radio key={fmt} checked={format === fmt} onChange={() => setFormat(fmt)}>
                  {lbl}
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
                  onQueryChange={handleQueryChange}
                  showCombinatorsBetweenRules={showCombinatorsBetweenRules}
                  showNotToggle={showNotToggle}
                  showCloneButtons={showCloneButtons}
                  resetOnFieldChange={resetOnFieldChange}
                  resetOnOperatorChange={resetOnOperatorChange}
                  autoSelectField={autoSelectField}
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
