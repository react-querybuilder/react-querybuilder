import { LinkOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
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
import {
  StrictMode,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createRoot } from 'react-dom/client';
import {
  defaultOptions,
  fields,
  formatMap,
  getFormatQueryString,
  initialQuery,
  initialQueryIC,
  optionOrder,
  optionsMetadata,
  optionsReducer,
  type CommonRQBProps,
  type DemoOptions,
} from 'react-querybuilder/dev';
import {
  convertToIC,
  defaultValidator,
  formatQuery,
  parseJsonLogic,
  parseSQL,
  QueryBuilder,
  type ExportFormat,
  type FormatQueryOptions,
} from 'react-querybuilder/src';
import 'react-querybuilder/src/query-builder.scss';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { styleConfigs } from './components';
import { docsLink, npmLink, styleNameArray, styleNameMap, type StyleName } from './constants';

type DemoOptionsWithStyle = DemoOptions & { style?: StyleName };

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
SyntaxHighlighter.registerLanguage('mongodb', json);
SyntaxHighlighter.registerLanguage('parameterized', json);
SyntaxHighlighter.registerLanguage('parameterized_named', json);
SyntaxHighlighter.registerLanguage('sql', sql);

const shStyle: Record<string, CSSProperties> = {
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

const CustomFragment = (props: { children?: ReactNode }) => <>{props.children}</>;

const permalinkText = 'Copy link';
const permalinkCopiedText = 'Copied!';

const getOptionsFromHash = (hash: Partial<DemoOptionsWithStyle>) => {
  const optionsFromHash: DemoOptionsWithStyle = defaultOptions;
  for (const opt of optionOrder) {
    optionsFromHash[opt] = (hash[opt] ?? `${defaultOptions[opt]}`) === 'true';
  }
  optionsFromHash.style = hash.style ?? 'default';
  return optionsFromHash;
};

const initialSQL = `SELECT *\n  FROM my_table\n WHERE ${formatQuery(initialQuery, 'sql')};`;
const initialJsonLogic = JSON.stringify(formatQuery(initialQuery, 'jsonlogic'));

// Initialize options from URL hash
const { style: initialStyle, ...initialOptions } = getOptionsFromHash(
  queryString.parse(location.hash)
);

const App = () => {
  const [query, setQuery] = useState(initialQuery);
  const [queryIC, setQueryIC] = useState(initialQueryIC);
  const [format, setFormat] = useState<ExportFormat>('json_without_ids');
  const [options, setOptions] = useReducer(optionsReducer, initialOptions);
  const [isSQLModalVisible, setIsSQLModalVisible] = useState(false);
  const [sql, setSQL] = useState(initialSQL);
  const [sqlParseError, setSQLParseError] = useState('');
  const [isJsonLogicModalVisible, setIsJsonLogicModalVisible] = useState(false);
  const [jsonLogic, setJsonLogic] = useState(initialJsonLogic);
  const [jsonLogicParseError, setJsonLogicParseError] = useState('');
  const [style, setStyle] = useState<StyleName>(initialStyle ?? 'default');
  const [copyPermalinkText, setCopyPermalinkText] = useState(permalinkText);

  const permalinkHash = useMemo(
    () => `#${queryString.stringify({ ...options, style })}`,
    [options, style]
  );

  useEffect(() => {
    history.pushState(null, '', permalinkHash);
    const updateOptionsFromHash = (e: HashChangeEvent) => {
      const { style: s, ...opts } = getOptionsFromHash(
        queryString.parse(
          queryString.parseUrl(e.newURL, { parseFragmentIdentifier: true }).fragmentIdentifier ?? ''
        )
      );
      setOptions({ type: 'replace', payload: opts });
      setStyle(s ?? 'default');
    };
    window.addEventListener('hashchange', updateOptionsFromHash);

    return () => window.removeEventListener('hashchange', updateOptionsFromHash);
  }, [permalinkHash]);

  const optionsInfo = useMemo(
    () =>
      optionOrder.map(opt => ({
        ...optionsMetadata[opt],
        default: defaultOptions[opt],
        checked: options[opt],
        setter: (v: boolean) =>
          setOptions({ type: 'update', payload: { optionName: opt, value: v } }),
      })),
    [options]
  );

  const formatOptions = useMemo(
    (): FormatQueryOptions => ({
      format,
      fields: options.validateQuery ? fields : undefined,
      parseNumbers: options.parseNumbers,
    }),
    [format, options.parseNumbers, options.validateQuery]
  );
  const q = options.independentCombinators ? queryIC : query;
  const formatString = useMemo(() => getFormatQueryString(q, formatOptions), [formatOptions, q]);

  const qbWrapperClassName = `with-${style}${options.validateQuery ? ' validateQuery' : ''}`;

  const loadFromSQL = useCallback(() => {
    try {
      const q = parseSQL(sql);
      const qIC = parseSQL(sql, { independentCombinators: true });
      setQuery(q);
      setQueryIC(qIC);
      setIsSQLModalVisible(false);
      setSQLParseError('');
    } catch (err) {
      setSQLParseError((err as Error).message);
    }
  }, [sql]);
  const loadFromJsonLogic = useCallback(() => {
    try {
      const q = parseJsonLogic(jsonLogic);
      const qIC = convertToIC(q);
      setQuery(q);
      setQueryIC(qIC);
      setIsJsonLogicModalVisible(false);
      setJsonLogicParseError('');
    } catch (err) {
      setJsonLogicParseError((err as Error).message);
    }
  }, [jsonLogic]);

  const onClickCopyPermalink = async () => {
    try {
      await navigator.clipboard.writeText(`${location.origin}${location.pathname}${permalinkHash}`);
      setCopyPermalinkText(permalinkCopiedText);
    } catch (e) {
      console.error('Clipboard error', e);
    }
    setTimeout(() => setCopyPermalinkText(permalinkText), 1214);
  };

  const MUIThemeProvider = useMemo(
    () => (style === 'material' ? ThemeProvider : CustomFragment),
    [style]
  );
  const ChakraStyleProvider = useMemo(
    () => (style === 'chakra' ? ChakraProvider : CustomFragment),
    [style]
  );

  const commonRQBProps = useMemo(
    (): CommonRQBProps => ({
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
            <Title level={4}>
              Style
              {'\u00a0'}
              <a href={`${docsLink}/docs/compat`} target="_blank" rel="noreferrer">
                <Tooltip
                  title="Use first-party alternate QueryBuilder components designed for popular style libraries (click for documentation)"
                  placement="right">
                  <QuestionCircleOutlined />
                </Tooltip>
              </a>
            </Title>
            <Select
              value={style}
              onChange={setStyle}
              dropdownMatchSelectWidth={false}
              style={{ minWidth: 100 }}>
              {styleNameArray.map(s => (
                <Option key={s} value={s}>
                  {styleNameMap[s]}
                </Option>
              ))}
            </Select>
            <Title level={4} style={{ marginTop: '1rem' }}>
              Options
              {'\u00a0'}
              <a href={`${docsLink}/docs/api/querybuilder`} target="_blank" rel="noreferrer">
                <Tooltip
                  title="Boolean props on the QueryBuilder component (click for documentation)"
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
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: '0.5rem',
                }}>
                <Tooltip title="Reset the options above to their default values" placement="right">
                  <Button type="default" onClick={() => setOptions({ type: 'reset' })}>
                    Reset
                  </Button>
                </Tooltip>
                <Tooltip
                  title={`Enable all features except "${optionsMetadata.disabled.label}"`}
                  placement="right">
                  <Button type="default" onClick={() => setOptions({ type: 'all' })}>
                    Select all
                  </Button>
                </Tooltip>
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
              {formatMap.map(([fmt, lbl, lnk]) => (
                <div key={fmt}>
                  <Radio checked={format === fmt} onChange={() => setFormat(fmt)}>
                    {lbl}
                    {'\u00a0'}
                    <a href={lnk} target="_blank" rel="noreferrer">
                      <Tooltip
                        title={`formatQuery(query, "${fmt}") (click for information)`}
                        placement="right">
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </a>
                  </Radio>
                </div>
              ))}
            </div>
            <Title level={4} style={{ marginTop: '1rem' }}>
              Import
              {'\u00a0'}
              <a href={`${docsLink}/docs/api/import`} target="_blank" rel="noreferrer">
                <Tooltip
                  title={`Use the parse* methods to set the query from SQL/JsonLogic/etc. (click for documentation)`}
                  placement="right">
                  <QuestionCircleOutlined />
                </Tooltip>
              </a>
            </Title>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexDirection: 'column',
                rowGap: '0.5rem',
              }}>
              <Button onClick={() => setIsSQLModalVisible(true)}>Load from SQL</Button>
              <Button onClick={() => setIsJsonLogicModalVisible(true)}>Load from JsonLogic</Button>
            </div>
            <Title level={4} style={{ marginTop: '1rem' }}>
              Installation{'\u00a0'}
              <Link href={npmLink} target="_blank">
                <LinkOutlined />
              </Link>
            </Title>
            <pre>npm i react-querybuilder</pre>
            OR
            <pre>yarn add react-querybuilder</pre>
            <Title level={4} style={{ marginTop: '1rem' }}>
              Links
            </Title>
            <p>
              <a href="ie11.html">IE-compatible demo</a>
            </p>
            <p>
              UMD build: <a href="umd.html">demo</a> / <a href={`${docsLink}/docs/umd`}>docs</a>
            </p>
          </Sider>
          <Content style={{ backgroundColor: '#ffffff', padding: '1rem 1rem 0 0' }}>
            {style !== 'default' && (
              <div style={{ marginBottom: '0.5rem', whiteSpace: 'normal' }}>
                To use the official React Query Builder components for {styleNameMap[style]} in your
                project, install{' '}
                <Link
                  target="_blank"
                  href={`https://www.npmjs.com/package/@react-querybuilder/${style}`}>
                  @react-querybuilder/{style}
                </Link>
                . Click{' '}
                <Link
                  target="_blank"
                  href={`https://codesandbox.io/s/github/react-querybuilder/react-querybuilder/tree/main/examples/${style}`}>
                  here
                </Link>{' '}
                to see sample usage.
              </div>
            )}
            <ChakraStyleProvider theme={chakraTheme}>
              <MUIThemeProvider theme={muiTheme}>
                <Suspense fallback={loadingPlaceholder}>
                  <div className={qbWrapperClassName}>
                    <form className="form-inline" style={{ marginTop: '1rem' }}>
                      {options.independentCombinators ? (
                        <QueryBuilder
                          {...commonRQBProps}
                          independentCombinators
                          key={`queryIC-${style}`}
                          query={queryIC}
                          onQueryChange={q => setQueryIC(q)}
                        />
                      ) : (
                        <QueryBuilder
                          {...commonRQBProps}
                          independentCombinators={false}
                          key={`query-${style}`}
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
            <SyntaxHighlighter language={format} style={shStyle}>
              {formatString}
            </SyntaxHighlighter>
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
          clauses). A trailing semicolon is also optional.
        </Text>
        {!!sqlParseError && <pre>{sqlParseError}</pre>}
      </Modal>
      <Modal
        title="Load Query From JsonLogic"
        visible={isJsonLogicModalVisible}
        onOk={loadFromJsonLogic}
        onCancel={() => setIsJsonLogicModalVisible(false)}>
        <TextArea
          value={jsonLogic}
          onChange={e => setJsonLogic(e.target.value)}
          spellCheck={false}
          style={{ height: 200, fontFamily: 'monospace' }}
        />
        <Text italic>
          JsonLogic must be a <Text code>JSON.parse</Text>-able string.
        </Text>
        {!!jsonLogicParseError && <pre>{jsonLogicParseError}</pre>}
      </Modal>
    </>
  );
};

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
