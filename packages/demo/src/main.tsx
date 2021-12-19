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
  Spin,
  Tooltip,
  Typography,
} from 'antd';
import 'antd/dist/antd.compact.css';
import queryString from 'query-string';
import { FC, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
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
  RuleGroupTypeIC,
} from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.scss';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import {
  defaultOptions,
  DemoOptions,
  docsLink,
  fields,
  formatMap,
  initialQuery,
  initialQueryIC,
  npmLink,
  optionsMetadata,
  styleConfigs,
  StyleName,
  styleNameMap,
} from './constants';

const { TextArea } = Input;
const { Header, Sider, Content } = Layout;
const { Option } = Select;
const { Link, Text, Title } = Typography;

const muiTheme = createTheme();
const chakraTheme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
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
    whiteSpace: 'pre-wrap',
  },
};

const CustomFragment: FC = ({ children }) => <>{children}</>;

const permalinkText = 'Copy permalink';
const permalinkCopiedText = 'Copied!';

const getOptionsFromHash = (hash: Partial<DemoOptions>): DemoOptions => ({
  showCombinatorsBetweenRules:
    (hash.showCombinatorsBetweenRules ?? `${defaultOptions.showCombinatorsBetweenRules}`) ===
    'true',
  showNotToggle: (hash.showNotToggle ?? `${defaultOptions.showNotToggle}`) === 'true',
  showCloneButtons: (hash.showCloneButtons ?? `${defaultOptions.showCloneButtons}`) === 'true',
  resetOnFieldChange:
    (hash.resetOnFieldChange ?? `${defaultOptions.resetOnFieldChange}`) === 'true' ?? true,
  resetOnOperatorChange:
    (hash.resetOnOperatorChange ?? `${defaultOptions.resetOnOperatorChange}`) === 'true',
  autoSelectField: (hash.autoSelectField ?? `${defaultOptions.autoSelectField}`) === 'true' ?? true,
  addRuleToNewGroups:
    (hash.addRuleToNewGroups ?? `${defaultOptions.addRuleToNewGroups}`) === 'true',
  validateQuery: (hash.validateQuery ?? `${defaultOptions.validateQuery}`) === 'true',
  independentCombinators:
    (hash.independentCombinators ?? `${defaultOptions.independentCombinators}`) === 'true',
  enableDragAndDrop: (hash.enableDragAndDrop ?? `${defaultOptions.enableDragAndDrop}`) === 'true',
  disabled: (hash.disabled ?? `${defaultOptions.disabled}`) === 'true',
});

// Initialize options from URL hash
const initialOptions = getOptionsFromHash(queryString.parse(location.hash));

const App = () => {
  const [query, setQuery] = useState(initialQuery);
  const [queryIC, setQueryIC] = useState(initialQueryIC);
  const [format, setFormat] = useState<ExportFormat>('json_without_ids');
  const [options, setOptions] = useState<DemoOptions>(initialOptions);
  const [isSQLModalVisible, setIsSQLModalVisible] = useState(false);
  const [sql, setSQL] = useState(
    `SELECT *\n  FROM my_table\n WHERE ${formatQuery(initialQuery, 'sql')};`
  );
  const [sqlParseError, setSQLParseError] = useState('');
  const [style, setStyle] = useState<StyleName>('default');
  const [copyPermalinkText, setCopyPermalinkText] = useState(permalinkText);

  const permalinkHash = useMemo(() => `#${queryString.stringify(options)}`, [options]);

  useEffect(() => {
    history.pushState(null, '', permalinkHash);
    const updateOptionsFromHash = (e: HashChangeEvent) => {
      const opts = getOptionsFromHash(
        queryString.parse(
          queryString.parseUrl(e.newURL, { parseFragmentIdentifier: true }).fragmentIdentifier ?? ''
        )
      );
      setOptions(opts);
    };
    window.addEventListener('hashchange', updateOptionsFromHash);

    return () => window.removeEventListener('hashchange', updateOptionsFromHash);
  }, [permalinkHash]);

  const optionSetter = useCallback(
    (opt: keyof DemoOptions) => (v: boolean) => setOptions(opts => ({ ...opts, [opt]: v })),
    []
  );

  const optionsInfo = useMemo(
    () =>
      (
        [
          'showCombinatorsBetweenRules',
          'showNotToggle',
          'showCloneButtons',
          'resetOnFieldChange',
          'resetOnOperatorChange',
          'autoSelectField',
          'addRuleToNewGroups',
          'validateQuery',
          'independentCombinators',
          'enableDragAndDrop',
          'disabled',
        ] as (keyof DemoOptions)[]
      ).map(opt => ({
        ...optionsMetadata[opt],
        default: defaultOptions[opt],
        checked: options[opt],
        setter: optionSetter(opt),
      })),
    [options, optionSetter]
  );

  const resetOptions = useCallback(
    () =>
      optionsInfo.forEach(opt => (opt.checked !== opt.default ? opt.setter(opt.default) : null)),
    [optionsInfo]
  );

  const formatOptions = useMemo(
    () => (options.validateQuery ? ({ format, fields } as FormatQueryOptions) : format),
    [format, options.validateQuery]
  );
  const q: RuleGroupTypeAny = options.independentCombinators ? queryIC : query;
  const formatString = useMemo(
    () =>
      format === 'json_without_ids'
        ? JSON.stringify(JSON.parse(formatQuery(q, formatOptions) as string), null, 2)
        : format === 'parameterized' || format === 'parameterized_named'
        ? JSON.stringify(
            formatQuery(q, formatOptions) as ParameterizedSQL | ParameterizedNamedSQL,
            null,
            2
          )
        : (formatQuery(q, formatOptions) as string),
    [format, formatOptions, q]
  );

  const qbWrapperClassName = `with-${style}${options.validateQuery ? ' validateQuery' : ''}`;

  const loadFromSQL = useCallback(() => {
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
  }, [sql]);

  const onClickCopyPermalink = async () => {
    try {
      await navigator.clipboard.writeText(`${location.origin}${location.pathname}${permalinkHash}`);
      setCopyPermalinkText(permalinkCopiedText);
    } catch (e) {
      console.error('Clipboard error', e);
    }
    setTimeout(() => setCopyPermalinkText(permalinkText), 1214);
  };

  const MUIThemeProvider = style === 'material' ? ThemeProvider : CustomFragment;
  const ChakraStyleProvider = style === 'chakra' ? ChakraProvider : CustomFragment;

  const commonRQBProps = useMemo(
    (): QueryBuilderProps => ({
      ...styleConfigs[style],
      fields,
      ...options,
      validator: options.validateQuery ? defaultValidator : undefined,
    }),
    [style, options]
  );

  const loadingPlaceholder = useMemo(
    () => (
      <div className="loading-placeholder">
        <Spin />
        <div>Loading {styleNameMap[style]} components...</div>
      </div>
    ),
    [style]
  );

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
            <Select value={style} onChange={v => setStyle(v as StyleName)}>
              <Option value="default">{styleNameMap.default}</Option>
              <Option value="bootstrap">{styleNameMap.bootstrap}</Option>
              <Option value="material">{styleNameMap.material}</Option>
              <Option value="antd">{styleNameMap.antd}</Option>
              <Option value="chakra">{styleNameMap.chakra}</Option>
              <Option value="bulma">{styleNameMap.bulma}</Option>
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
                  <Checkbox checked={checked} onChange={e => setter(e.target.checked)}>
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
                <Suspense fallback={loadingPlaceholder}>
                  <div className={qbWrapperClassName}>
                    <form className="form-inline" style={{ marginTop: '1rem' }}>
                      {options.independentCombinators ? (
                        <QueryBuilder
                          {...(commonRQBProps as QueryBuilderProps<RuleGroupTypeIC>)}
                          key={style}
                          query={queryIC}
                          onQueryChange={q => setQueryIC(q)}
                        />
                      ) : (
                        <QueryBuilder
                          {...commonRQBProps}
                          key={style}
                          query={query}
                          onQueryChange={q => setQuery(q)}
                        />
                      )}
                    </form>
                  </div>
                </Suspense>
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
          onChange={e => setSQL(e.target.value)}
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
