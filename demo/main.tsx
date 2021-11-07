import { LinkOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import {
  Button,
  Checkbox,
  Divider,
  Input,
  Layout,
  Modal,
  Radio,
  Select,
  Tooltip,
  Typography
} from 'antd';
import { Fragment, useState } from 'react';
import ReactDOM from 'react-dom';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import QueryBuilder, {
  DefaultRuleGroupType,
  DefaultRuleGroupTypeIC,
  defaultValidator,
  ExportFormat,
  formatQuery,
  FormatQueryOptions,
  ParameterizedNamedSQL,
  ParameterizedSQL,
  parseSQL,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleGroupTypeIC
} from '../src';
import '../src/query-builder.scss';
import {
  fields,
  formatMap,
  initialQuery,
  initialQueryIC,
  npmLink,
  repoLink,
  StyleName,
  styleOptions
} from './constants';
import './styles/common.scss';
import './styles/github-fork-ribbon.scss';
import './styles/with-antd.scss';
import './styles/with-bootstrap.scss';
import './styles/with-chakra.scss';
import './styles/with-default.scss';
import './styles/with-material.scss';

const { TextArea } = Input;
const { Header, Sider, Content } = Layout;
const { Option } = Select;
const { Link, Title } = Typography;

const muiTheme = createTheme();
const chakraTheme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false
  }
});

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

const App = () => {
  const [query, setQuery] = useState(initialQuery);
  const [queryIC, setQueryIC] = useState(initialQueryIC);
  const [format, setFormat] = useState<ExportFormat>('json_without_ids');
  const [showCombinatorsBetweenRules, setShowCombinatorsBetweenRules] = useState(false);
  const [showNotToggle, setShowNotToggle] = useState(false);
  const [showCloneButtons, setShowCloneButtons] = useState(false);
  const [resetOnFieldChange, setResetOnFieldChange] = useState(true);
  const [resetOnOperatorChange, setResetOnOperatorChange] = useState(false);
  const [autoSelectField, setAutoSelectField] = useState(true);
  const [addRuleToNewGroups, setAddRuleToNewGroups] = useState(false);
  const [useValidation, setUseValidation] = useState(false);
  const [inlineCombinators, setInlineCombinators] = useState(false);
  const [enableDnD, setEnableDnD] = useState(false);
  const [isSQLModalVisible, setIsSQLModalVisible] = useState(false);
  const [sql, setSQL] = useState(formatQuery(initialQuery, 'sql') as string);
  const [sqlParseError, setSQLParseError] = useState('');
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
    },
    {
      checked: inlineCombinators,
      default: false,
      setter: setInlineCombinators,
      link: '#inlinecombinators-optional',
      label: 'Inline combinators',
      title: 'When checked, the query builder supports independent combinators between rules'
    },
    {
      checked: enableDnD,
      default: false,
      setter: setEnableDnD,
      link: '#drag-and-drop',
      label: 'Enable drag-and-drop',
      title: 'When checked, rules and groups can be reordered and dragged to different groups'
    }
  ];

  const resetOptions = () =>
    optionsInfo.forEach((opt) => (opt.checked !== opt.default ? opt.setter(opt.default) : null));

  const formatOptions = useValidation ? ({ format, fields } as FormatQueryOptions) : format;
  const q: RuleGroupTypeAny = inlineCombinators ? queryIC : query;
  const formatString =
    format === 'json_without_ids'
      ? JSON.stringify(JSON.parse(formatQuery(q, formatOptions) as string), null, 2)
      : format === 'parameterized' || format === 'parameterized_named'
      ? JSON.stringify(
          formatQuery(q, formatOptions) as ParameterizedSQL | ParameterizedNamedSQL,
          null,
          2
        )
      : (formatQuery(q, formatOptions) as string);

  const qbWrapperClassName = `with-${style} ${useValidation ? 'useValidation' : ''}`.trim();

  const loadFromSQL = () => {
    try {
      const q = parseSQL(sql) as DefaultRuleGroupType;
      const qIC = parseSQL(sql, { inlineCombinators: true }) as DefaultRuleGroupTypeIC;
      setQuery(q);
      setQueryIC(qIC);
      setIsSQLModalVisible(false);
      setSQLParseError('');
    } catch (err) {
      setSQLParseError(err.message);
    }
  };

  const MUIThemeProvider = style === 'material' ? ThemeProvider : Fragment;
  const ChakraStyleProvider = style === 'chakra' ? ChakraProvider : Fragment;

  return (
    <>
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
            <Title level={4} style={{ marginTop: '1rem' }}>
              Options
              {'\u00a0'}
              <a href={`${repoLink}#api`} target="_blank" rel="noreferrer">
                <Tooltip
                  title={`Boolean props on the QueryBuilder component (click for documentation)`}
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
                      <Tooltip title={`${title} (click for documentation)`} placement="right">
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
            <Title level={4} style={{ marginTop: '1rem' }}>
              Export
              {'\u00a0'}
              <a href={`${repoLink}#formatquery`} target="_blank" rel="noreferrer">
                <Tooltip
                  title={`The export format of the formatQuery function (click for documentation)`}
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
                  <Tooltip title={`formatQuery(query, "${fmt}")`} placement="right">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Radio>
              ))}
            </div>
            <Title level={4} style={{ marginTop: '1rem' }}>
              Import
              {'\u00a0'}
              <a href={`${repoLink}#parsesql`} target="_blank" rel="noreferrer">
                <Tooltip
                  title={`Set the query from SQL (click for documentation)`}
                  placement="right">
                  <QuestionCircleOutlined />
                </Tooltip>
              </a>
            </Title>
            <Button onClick={() => setIsSQLModalVisible(true)}>Load from SQL</Button>
            <Title level={4} style={{ marginTop: '1rem' }}>
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
            <ChakraStyleProvider theme={chakraTheme}>
              <MUIThemeProvider theme={muiTheme}>
                <div className={qbWrapperClassName}>
                  <form className="form-inline" style={{ marginTop: '1rem' }}>
                    <QueryBuilder
                      query={inlineCombinators ? queryIC : query}
                      fields={fields}
                      onQueryChange={(q) =>
                        inlineCombinators
                          ? setQueryIC(q as RuleGroupTypeIC)
                          : setQuery(q as RuleGroupType)
                      }
                      showCombinatorsBetweenRules={showCombinatorsBetweenRules}
                      showNotToggle={showNotToggle}
                      showCloneButtons={showCloneButtons}
                      resetOnFieldChange={resetOnFieldChange}
                      resetOnOperatorChange={resetOnOperatorChange}
                      autoSelectField={autoSelectField}
                      addRuleToNewGroups={addRuleToNewGroups}
                      validator={useValidation ? defaultValidator : undefined}
                      inlineCombinators={inlineCombinators}
                      enableDragAndDrop={enableDnD}
                      {...styleOptions[style]}
                    />
                  </form>
                </div>
              </MUIThemeProvider>
            </ChakraStyleProvider>
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
      <Modal
        title="Load Query From SQL"
        visible={isSQLModalVisible}
        onOk={loadFromSQL}
        onCancel={() => setIsSQLModalVisible(false)}>
        <TextArea
          value={sql}
          onChange={(e) => setSQL(e.target.value)}
          spellCheck={false}
          style={{ height: 200 }}
        />
        {!!sqlParseError && <pre>{sqlParseError}</pre>}
      </Modal>
    </>
  );
};

ReactDOM.render(<App />, document.querySelector('.container'));
