import { LinkOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { ChakraProvider, Tooltip } from '@chakra-ui/react';
import { Button, Checkbox, Divider, Layout, Radio, Select, Typography } from 'antd';
import { useState } from 'react';
import ReactDOM from 'react-dom';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import QueryBuilder, {
  defaultValidator,
  ExportFormat,
  Field,
  formatQuery,
  FormatQueryOptions,
  ParameterizedNamedSQL,
  ParameterizedSQL,
  QueryBuilderProps,
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
const { Link, Title } = Typography;

type StyleName = 'default' | 'bootstrap' | 'antd' | 'material' | 'chakra';

const repoLink = 'https://github.com/react-querybuilder/react-querybuilder';
const npmLink = 'https://www.npmjs.com/package/react-querybuilder';

SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('json_without_ids', json);
SyntaxHighlighter.registerLanguage('parameterized', json);
SyntaxHighlighter.registerLanguage('parameterized_named', json);
SyntaxHighlighter.registerLanguage('sql', sql);

const shStyle = {
  ...vs,
  hljs: {
    ...vs.hljs,
    backgroundColor: '#eeeeee',
    border: '1px solid gray',
    borderRadius: 4,
    fontFamily: "Consolas, 'Courier New', monospace",
    fontSize: 'small',
    padding: '1rem',
    minWidth: 405,
    whiteSpace: 'pre-wrap'
  }
};

const validator = (r: RuleType) => !!r.value;

const styleOptions: { [s in StyleName]: Partial<QueryBuilderProps> } = {
  default: {},
  bootstrap: {
    controlClassnames: {
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
    controlElements: {
      notToggle: BootstrapNotToggle,
      valueEditor: BootstrapValueEditor
    }
  },
  antd: {
    controlElements: {
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
    }
  },
  material: {
    controlElements: {
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
    }
  },
  chakra: {
    controlElements: {
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
  }
};

const fields: Field[] = [
  { name: 'firstName', label: 'First Name', placeholder: 'Enter first name', validator },
  {
    name: 'lastName',
    label: 'Last Name',
    placeholder: 'Enter last name',
    defaultOperator: 'beginsWith',
    validator
  },
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
  },
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
];

const initialQuery: RuleGroupType = {
  rules: [
    {
      field: 'firstName',
      value: 'Stev',
      operator: 'beginsWith'
    },
    {
      field: 'lastName',
      value: 'Vai, Vaughan',
      operator: 'in'
    },
    {
      field: 'age',
      operator: '>',
      value: '28'
    },
    {
      combinator: 'or',
      rules: [
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
      ]
    }
  ],
  combinator: 'and',
  not: false
};

const formatMap: { fmt: ExportFormat; lbl: string }[] = [
  { fmt: 'json_without_ids', lbl: 'JSON Without IDs' },
  { fmt: 'json', lbl: 'JSON' },
  { fmt: 'sql', lbl: 'SQL' },
  { fmt: 'parameterized', lbl: 'Parameterized SQL' },
  { fmt: 'parameterized_named', lbl: 'Parameterized (Named) SQL' },
  { fmt: 'mongodb', lbl: 'MongoDB' }
];

const RootView = () => {
  const [query, setQuery] = useState(initialQuery);
  const [format, setFormat] = useState<ExportFormat>('json_without_ids');
  const [showCombinatorsBetweenRules, setShowCombinatorsBetweenRules] = useState(false);
  const [showNotToggle, setShowNotToggle] = useState(false);
  const [showCloneButtons, setShowCloneButtons] = useState(false);
  const [resetOnFieldChange, setResetOnFieldChange] = useState(true);
  const [resetOnOperatorChange, setResetOnOperatorChange] = useState(false);
  const [autoSelectField, setAutoSelectField] = useState(true);
  const [addRuleToNewGroups, setAddRuleToNewGroups] = useState(false);
  const [useValidation, setUseValidation] = useState(false);
  const [style, setStyle] = useState<StyleName>('default');

  const optionsInfo = [
    {
      checked: showCombinatorsBetweenRules,
      default: false,
      setter: setShowCombinatorsBetweenRules,
      link: '#showcombinatorsbetweenrules-optional',
      label: 'Combinators between rules',
      title:
        'When checked, combinator (and/or) selectors will appear between rules instead of in the group header'
    },
    {
      checked: showNotToggle,
      default: false,
      setter: setShowNotToggle,
      link: '#shownottoggle-optional',
      label: 'Show "not" toggle',
      title: `When checked, the check box to invert a group's rules, by default labelled "Not", will be visible`
    },
    {
      checked: showCloneButtons,
      default: false,
      setter: setShowCloneButtons,
      link: '#showclonebuttons-optional',
      label: 'Show clone buttons',
      title: 'When checked, the buttons to clone rules and groups will be visible'
    },
    {
      checked: resetOnFieldChange,
      default: true,
      setter: setResetOnFieldChange,
      link: '#resetonfieldchange-optional',
      label: 'Reset on field change',
      title: `When checked, operator and value will be reset when a rule's field selection changes`
    },
    {
      checked: resetOnOperatorChange,
      default: false,
      setter: setResetOnOperatorChange,
      link: '#resetonoperatorchange-optional',
      label: 'Reset on operator change',
      title: 'When checked, the value will reset when the operator changes'
    },
    {
      checked: autoSelectField,
      default: true,
      setter: setAutoSelectField,
      link: '#autoselectfield-optional',
      label: 'Auto-select field',
      title: 'When checked, the default field will be automatically selected for new rules'
    },
    {
      checked: addRuleToNewGroups,
      default: false,
      setter: setAddRuleToNewGroups,
      link: '#addruletonewgroups-optional',
      label: 'Add rule to new groups',
      title: 'When checked, a rule will be automatically added to new groups'
    },
    {
      checked: useValidation,
      default: false,
      setter: setUseValidation,
      link: '#validator-optional',
      label: 'Use validation',
      title:
        'When checked, the validator functions will be used to put a purple outline around empty text fields and bold the +Rule button for empty groups'
    }
  ];

  const resetOptions = () =>
    optionsInfo.forEach((opt) => (opt.checked !== opt.default ? opt.setter(opt.default) : null));

  const formatOptions = useValidation ? ({ format, fields } as FormatQueryOptions) : format;
  const formatString =
    format === 'json_without_ids'
      ? JSON.stringify(JSON.parse(formatQuery(query, formatOptions) as string), null, 2)
      : format === 'parameterized' || format === 'parameterized_named'
      ? JSON.stringify(
          formatQuery(query, formatOptions) as ParameterizedSQL | ParameterizedNamedSQL,
          null,
          2
        )
      : (formatQuery(query, formatOptions) as string);

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
                  <QuestionCircleOutlined />
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
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </a>
                  </Checkbox>
                </div>
              ))}
              <Button type="default" onClick={resetOptions}>
                Defaults
              </Button>
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
                  <QuestionCircleOutlined />
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
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Radio>
              ))}
            </div>
            <Divider />
            <Title level={4}>
              Installation{'\u00a0'}
              <Link href={npmLink} target="_blank">
                <LinkOutlined />
              </Link>
            </Title>
            <pre>npm i react-querybuilder</pre>
            OR
            <pre>yarn add react-querybuilder</pre>
          </Sider>
          <Content style={{ backgroundColor: '#ffffff', padding: '1rem 1rem 0 0' }}>
            <div className={qbWrapperClassName}>
              <form className="form-inline" style={{ marginTop: '1rem' }}>
                <QueryBuilder
                  query={query}
                  fields={fields}
                  onQueryChange={setQuery}
                  showCombinatorsBetweenRules={showCombinatorsBetweenRules}
                  showNotToggle={showNotToggle}
                  showCloneButtons={showCloneButtons}
                  resetOnFieldChange={resetOnFieldChange}
                  resetOnOperatorChange={resetOnOperatorChange}
                  autoSelectField={autoSelectField}
                  addRuleToNewGroups={addRuleToNewGroups}
                  validator={useValidation && defaultValidator}
                  {...styleOptions[style]}
                />
              </form>
            </div>
            <Divider />
            {format === 'mongodb' ? (
              <pre id="formatQuery-output">{formatString}</pre>
            ) : (
              <SyntaxHighlighter language={format} style={shStyle}>
                {formatString}
              </SyntaxHighlighter>
            )}
          </Content>
        </Layout>
      </Layout>
    </ChakraProvider>
  );
};

ReactDOM.render(<RootView />, document.querySelector('.container'));
