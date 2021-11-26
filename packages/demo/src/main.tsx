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
import queryString from 'query-string';
import { FC, useEffect, useMemo, useState } from 'react';
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
  QueryBuilderProps,
  RuleGroupTypeAny,
  RuleGroupTypeIC
} from 'react-querybuilder';
import {
  docsLink,
  fields,
  formatMap,
  initialQuery,
  initialQueryIC,
  npmLink,
  StyleName,
  styleOptions
} from './constants';
import 'react-querybuilder/dist/query-builder.scss';
import 'antd/dist/antd.compact.css';

const { TextArea } = Input;
const { Header, Sider, Content } = Layout;
const { Option } = Select;
const { Link, Text, Title } = Typography;

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

const CustomFragment: FC = ({ children }) => <>{children}</>;

const permalinkText = 'Copy permalink';
const permalinkCopiedText = 'Copied!';

// Initialize options from URL hash
const initialOptions: { [opt: string]: boolean } = {
  showCombinatorsBetweenRules: false,
  showNotToggle: false,
  showCloneButtons: false,
  resetOnFieldChange: true,
  resetOnOperatorChange: false,
  autoSelectField: true,
  addRuleToNewGroups: false,
  useValidation: false,
  independentCombinators: false,
  enableDragAndDrop: false
};
const hash = queryString.parse(location.hash);
Object.keys(hash).forEach((opt) => (initialOptions[opt] = hash[opt] === 'true'));

const App = () => {
  const [query, setQuery] = useState(initialQuery);
  const [queryIC, setQueryIC] = useState(initialQueryIC);
  const [format, setFormat] = useState<ExportFormat>('json_without_ids');
  const [showCombinatorsBetweenRules, setShowCombinatorsBetweenRules] = useState(
    initialOptions.showCombinatorsBetweenRules
  );
  const [showNotToggle, setShowNotToggle] = useState(initialOptions.showNotToggle);
  const [showCloneButtons, setShowCloneButtons] = useState(initialOptions.showCloneButtons);
  const [resetOnFieldChange, setResetOnFieldChange] = useState(initialOptions.resetOnFieldChange);
  const [resetOnOperatorChange, setResetOnOperatorChange] = useState(
    initialOptions.resetOnOperatorChange
  );
  const [autoSelectField, setAutoSelectField] = useState(initialOptions.autoSelectField);
  const [addRuleToNewGroups, setAddRuleToNewGroups] = useState(initialOptions.addRuleToNewGroups);
  const [useValidation, setUseValidation] = useState(initialOptions.useValidation);
  const [independentCombinators, setIndependentCombinators] = useState(
    initialOptions.independentCombinators
  );
  const [enableDragAndDrop, setEnableDragAndDrop] = useState(initialOptions.enableDragAndDrop);
  const [isSQLModalVisible, setIsSQLModalVisible] = useState(false);
  const [sql, setSQL] = useState(
    `SELECT *\n  FROM my_table\n WHERE ${formatQuery(initialQuery, 'sql')};`
  );
  const [sqlParseError, setSQLParseError] = useState('');
  const [style, setStyle] = useState<StyleName>('default');
  const [copyPermalinkText, setCopyPermalinkText] = useState(permalinkText);

  const permalinkHash = useMemo(
    () =>
      '#' +
      queryString.stringify({
        showCombinatorsBetweenRules,
        showNotToggle,
        showCloneButtons,
        resetOnFieldChange,
        resetOnOperatorChange,
        autoSelectField,
        addRuleToNewGroups,
        useValidation,
        independentCombinators,
        enableDragAndDrop
      }),
    [
      showCombinatorsBetweenRules,
      showNotToggle,
      showCloneButtons,
      resetOnFieldChange,
      resetOnOperatorChange,
      autoSelectField,
      addRuleToNewGroups,
      useValidation,
      independentCombinators,
      enableDragAndDrop
    ]
  );

  useEffect(() => {
    history.pushState(null, '', permalinkHash);
  });

  const optionsInfo = [
    {
      checked: showCombinatorsBetweenRules,
      default: false,
      setter: setShowCombinatorsBetweenRules,
      link: '/docs/api/querybuilder#showcombinatorsbetweenrules',
      label: 'Combinators between rules',
      title:
        'When checked, combinator (and/or) selectors will appear between rules instead of in the group header'
    },
    {
      checked: showNotToggle,
      default: false,
      setter: setShowNotToggle,
      link: '/docs/api/querybuilder#shownottoggle',
      label: 'Show "not" toggle',
      title: `When checked, the check box to invert a group's rules, by default labelled "Not", will be visible`
    },
    {
      checked: showCloneButtons,
      default: false,
      setter: setShowCloneButtons,
      link: '/docs/api/querybuilder#showclonebuttons',
      label: 'Show clone buttons',
      title: 'When checked, the buttons to clone rules and groups will be visible'
    },
    {
      checked: resetOnFieldChange,
      default: true,
      setter: setResetOnFieldChange,
      link: '/docs/api/querybuilder#resetonfieldchange',
      label: 'Reset on field change',
      title: `When checked, operator and value will be reset when a rule's field selection changes`
    },
    {
      checked: resetOnOperatorChange,
      default: false,
      setter: setResetOnOperatorChange,
      link: '/docs/api/querybuilder#resetonoperatorchange',
      label: 'Reset on operator change',
      title: 'When checked, the value will reset when the operator changes'
    },
    {
      checked: autoSelectField,
      default: true,
      setter: setAutoSelectField,
      link: '/docs/api/querybuilder#autoselectfield',
      label: 'Auto-select field',
      title: 'When checked, the default field will be automatically selected for new rules'
    },
    {
      checked: addRuleToNewGroups,
      default: false,
      setter: setAddRuleToNewGroups,
      link: '/docs/api/querybuilder#addruletonewgroups',
      label: 'Add rule to new groups',
      title: 'When checked, a rule will be automatically added to new groups'
    },
    {
      checked: useValidation,
      default: false,
      setter: setUseValidation,
      link: '/docs/api/validation',
      label: 'Use validation',
      title:
        'When checked, the validator functions will be used to put a purple outline around empty text fields and bold the +Rule button for empty groups'
    },
    {
      checked: independentCombinators,
      default: false,
      setter: setIndependentCombinators,
      link: '/docs/api/querybuilder#inlinecombinators',
      label: 'Independent combinators',
      title: 'When checked, the query builder supports independent combinators between rules'
    },
    {
      checked: enableDragAndDrop,
      default: false,
      setter: setEnableDragAndDrop,
      link: '/docs/api/querybuilder#enabledraganddrop',
      label: 'Enable drag-and-drop',
      title: 'When checked, rules and groups can be reordered and dragged to different groups'
    }
  ];

  const resetOptions = () =>
    optionsInfo.forEach((opt) => (opt.checked !== opt.default ? opt.setter(opt.default) : null));

  const formatOptions = useValidation ? ({ format, fields } as FormatQueryOptions) : format;
  const q: RuleGroupTypeAny = independentCombinators ? queryIC : query;
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
      const qIC = parseSQL(sql, { independentCombinators: true }) as DefaultRuleGroupTypeIC;
      setQuery(q);
      setQueryIC(qIC);
      setIsSQLModalVisible(false);
      setSQLParseError('');
    } catch (err) {
      setSQLParseError((err as Error).message);
    }
  };

  const onClickCopyPermalink = async () => {
    try {
      await navigator.clipboard.writeText(`${location.origin}${location.pathname}${permalinkHash}`);
      setCopyPermalinkText(permalinkCopiedText);
    } catch (e) {
      console.error('Clipboard error', e);
    }
    setTimeout(() => {
      setCopyPermalinkText(permalinkText);
    }, 1500);
  };

  const MUIThemeProvider = style === 'material' ? ThemeProvider : CustomFragment;
  const ChakraStyleProvider = style === 'chakra' ? ChakraProvider : CustomFragment;

  const commonRQBProps: QueryBuilderProps = {
    ...styleOptions[style],
    fields,
    showCombinatorsBetweenRules,
    showNotToggle,
    showCloneButtons,
    resetOnFieldChange,
    resetOnOperatorChange,
    autoSelectField,
    addRuleToNewGroups,
    independentCombinators,
    validator: useValidation ? defaultValidator : undefined,
    enableDragAndDrop
  };

  return (
    <>
      <Layout>
        <Header>
          <Title level={3} style={{ display: 'inline-block' }}>
            <a href={docsLink}>React Query Builder Demo</a>
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
              <a href={`${docsLink}/docs/api/querybuilder`} target="_blank" rel="noreferrer">
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
                    <a href={`${docsLink}${link}`} target="_blank" rel="noreferrer">
                      <Tooltip title={`${title} (click for documentation)`} placement="right">
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </a>
                  </Checkbox>
                </div>
              ))}
              <div style={{ marginTop: '0.5rem' }}>
                <Tooltip title="Reset the options above to their default values" placement="right">
                  <Button type="default" onClick={resetOptions}>
                    Reset default options
                  </Button>
                </Tooltip>
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <Tooltip
                  title="Copy a URL that will load this demo with the options set as they are currently"
                  placement="right">
                  <Button type="default" onClick={onClickCopyPermalink}>
                    {copyPermalinkText}
                  </Button>
                </Tooltip>
              </div>
            </div>
            <Title level={4} style={{ marginTop: '1rem' }}>
              Export
              {'\u00a0'}
              <a href={`${docsLink}/docs/api/export`} target="_blank" rel="noreferrer">
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
              <a href={`${docsLink}/docs/api/import`} target="_blank" rel="noreferrer">
                <Tooltip
                  title={`Use the parseSQL method to set the query from SQL (click for documentation)`}
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
                    {independentCombinators ? (
                      <QueryBuilder
                        {...(commonRQBProps as QueryBuilderProps<RuleGroupTypeIC>)}
                        key={style}
                        query={queryIC}
                        onQueryChange={(q) => setQueryIC(q)}
                      />
                    ) : (
                      <QueryBuilder
                        {...commonRQBProps}
                        key={style}
                        query={query}
                        onQueryChange={(q) => setQuery(q)}
                      />
                    )}
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
          style={{ height: 200, fontFamily: 'monospace' }}
        />
        <Text italic>
          SQL string can either be the full <Text code>SELECT</Text> statement or the{' '}
          <Text code>WHERE</Text> clause by itself (without the word &quot;WHERE&quot; -- just the
          clauses). Semicolon is also optional.
        </Text>
        {!!sqlParseError && <pre>{sqlParseError}</pre>}
      </Modal>
    </>
  );
};

ReactDOM.render(<App />, document.getElementById('app'));
