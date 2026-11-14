import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import { useColorMode } from '@docusaurus/theme-common';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { createTheme, ThemeProvider } from '@mui/material';
import Slider from '@mui/material/Slider';
import { MaterialValueEditor, QueryBuilderMaterial } from '@react-querybuilder/material';
import CodeBlock from '@theme/CodeBlock';
import Layout from '@theme/Layout';
import TabItem from '@theme/TabItem';
import Tabs from '@theme/Tabs';
import clsx from 'clsx';
import { forwardRef, StrictMode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import type {
  ExportFormat,
  RuleGroupType,
  RuleType,
  ValueEditorProps,
  ValueProcessorByRule,
} from 'react-querybuilder';
import {
  defaultOperators,
  defaultValueProcessorByRule,
  formatQuery,
  getOption,
  QueryBuilder,
  QueryBuilderContext,
  toFullOptionList,
  ValueEditor,
} from 'react-querybuilder';
import Select from 'react-select';
import '../css/index.css';
import { CustomStylesQB } from './_CustomStylesQB';
import { ExtendQB } from './_ExtendQB';
import * as rtl from './_rtl';
import { initialQuery, initialSimpleQuery } from './demo/_constants';
import { fields } from './demo/_constants/fields';
import { musicalInstruments } from './demo/_constants/musicalInstruments';
import { getExportDisplayLanguage, getFormatQueryString } from './demo/_constants/utils';
import styles from './index.module.css';

const qbContextProviderValue = { controlClassnames: { queryBuilder: styles.queryBuilder } };

const datePickerFields = fields.filter(f => f.name === 'birthdate');
const initialDatePickerQuery: RuleGroupType = {
  combinator: 'and',
  rules: [{ field: 'birthdate', operator: '=', value: new Date() }],
};
// oxlint-disable-next-line typescript/no-explicit-any
const DateButton = forwardRef<HTMLButtonElement>(({ value, onClick }: any, ref) => (
  <button onClick={onClick} ref={ref}>
    {value} 📅
  </button>
));
const dateButton = <DateButton />;
const ExtendedValueEditor_DatePicker = (props: ValueEditorProps) =>
  props.field === 'birthdate' ? (
    <DatePicker
      selected={props.value}
      onChange={(d: Date | null) => props.handleOnChange(d)}
      customInput={dateButton}
      dateFormat="yyyy-MM-dd"
    />
  ) : (
    <ValueEditor {...props} />
  );

const selectFields = fields.filter(f => f.name === 'alsoPlays');
const selectOptions = toFullOptionList(musicalInstruments);
const initialSelectQuery: RuleGroupType = {
  combinator: 'and',
  rules: [
    {
      field: 'alsoPlays',
      operator: 'in',
      value: [
        { value: 'Cowbell', label: 'Cowbell' },
        { value: 'More cowbell', label: 'More cowbell' },
      ],
    },
  ],
};
const ExtendedValueEditor_Select = (props: ValueEditorProps) => {
  const isDarkTheme = useColorMode().colorMode === 'dark';

  return props.field === 'alsoPlays' ? (
    <Select
      key={`${isDarkTheme}`}
      value={props.value}
      isMulti
      onChange={v => props.handleOnChange(v)}
      options={selectOptions}
      styles={{
        control: base => ({ ...base, borderColor: '#8081a2' }),
        container: base => ({ ...base, width: '100%' }),
        menu: base => ({ ...base, zIndex: 99 }),
      }}
      theme={theme =>
        isDarkTheme
          ? {
              ...theme,
              colors: {
                ...theme.colors,
                primary25: '#768cad', // "#DEEBFF",
                danger: theme.colors.dangerLight, // "#DE350B",
                dangerLight: theme.colors.danger, // "#FFBDAD",
                neutral0: '#222222', // "hsl(0, 0%, 100%)",
                neutral10: '#525252', // "hsl(0, 0%, 90%)",
                neutral80: '#ffffff', // "hsl(0, 0%, 20%)",
              },
            }
          : theme
      }
    />
  ) : (
    <ValueEditor {...props} />
  );
};

const sliderFields = fields.filter(f => f.name === 'age');
const initialSliderQuery: RuleGroupType = {
  combinator: 'and',
  rules: [{ field: 'age', operator: 'between', value: [20, 60] }],
};
const ExtendedValueEditor_Slider = (props: ValueEditorProps) =>
  props.field === 'age' ? (
    <div className="slider-wrapper">
      <Slider
        track={props.rule.operator.startsWith('not') ? 'inverted' : 'normal'}
        value={props.value}
        onChange={(e, v) => props.handleOnChange(v)}
        valueLabelDisplay="on"
        step={10}
        min={0}
        max={100}
      />
    </div>
  ) : (
    <MaterialValueEditor {...props} />
  );

const SliderDemo = () => {
  const { colorMode } = useColorMode();
  const muiTheme = useMemo(() => createTheme({ palette: { mode: colorMode } }), [colorMode]);

  return (
    <ThemeProvider theme={muiTheme}>
      <QueryBuilderMaterial>
        <QueryBuilder
          fields={sliderFields}
          defaultQuery={initialSliderQuery}
          controlElements={{ valueEditor: ExtendedValueEditor_Slider }}
          getOperators={() => defaultOperators.filter(op => op.name.endsWith('tween'))}
        />
      </QueryBuilderMaterial>
    </ThemeProvider>
  );
};

const sqlValueProcessor: ValueProcessorByRule = (rule: RuleType) =>
  `${getOption(fields, rule.field)?.inputType === 'date' ? `DATE ` : ''}${defaultValueProcessorByRule(rule)}`;

const showcaseFormats: [ExportFormat, string][] = [
  ['sql', 'SQL'],
  ['mongodb_query', 'Mongo'],
  ['natural_language', 'English'],
  ['cel', 'CEL'],
];
const CYCLE_MS = 3000;

const ExportShowcase = () => {
  const [query, setQuery] = useState(initialSimpleQuery);
  // Permanent stop (tab click/query edit) vs temporary pause (hover/focus)
  const [stopped, setStopped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Docusaurus Tabs is uncontrolled, so cycle by clicking the next tab element
  useEffect((): (() => void) | void => {
    if (stopped || hovered || focused) return;
    if (globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => {
      const tabs = [...(tabsRef.current?.querySelectorAll<HTMLElement>('[role="tab"]') ?? [])];
      const i = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
      tabs[(i + 1) % tabs.length]?.click();
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, [stopped, hovered, focused]);

  // Programmatic clicks aren't trusted, so this only catches real user selection
  const stopOnUserTabSelect = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') return;
    if (e.nativeEvent.isTrusted && (e.target as HTMLElement).closest('[role="tab"]')) {
      setStopped(true);
    }
  };

  const onQueryChange = useCallback((q: RuleGroupType) => {
    setQuery(q);
    setStopped(true);
  }, []);

  return (
    <main
      className={styles.exportShowcase}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={e => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}>
      <div>
        <QueryBuilder
          fields={fields}
          defaultQuery={query}
          onQueryChange={onQueryChange}
          enableMountQueryChange={false}
        />
      </div>
      <div className={styles.exportShowcaseArrow} aria-hidden>
        →
      </div>
      <div
        ref={tabsRef}
        className={styles.exportTabs}
        onClickCapture={stopOnUserTabSelect}
        onKeyDownCapture={stopOnUserTabSelect}>
        <Tabs defaultValue="sql">
          {showcaseFormats.map(([format, label]) => (
            <TabItem key={format} value={format} label={label}>
              <CodeBlock
                className={clsx(styles.wsPreWrap, styles.scrollVert200)}
                language={getExportDisplayLanguage(format)}>
                {format === 'mongodb_query'
                  ? // Compact JSON to limit height jumps
                    JSON.stringify(formatQuery(query, { format, fields }))
                  : getFormatQueryString(query, {
                      format,
                      valueProcessor: format === 'sql' ? sqlValueProcessor : undefined,
                      fields,
                    })}
              </CodeBlock>
            </TabItem>
          ))}
        </Tabs>
        <Link
          className={styles.exportMoreLink}
          href="/demo?outputMode=export"
          title="More formats in the demo">
          …
        </Link>
      </div>
    </main>
  );
};

const LandingPage = () => {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout description="The Query Builder Component for React">
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className={clsx('hero__title', styles.heroTitle)}>{siteConfig.title}</h1>
          <p className={clsx('hero__subtitle', styles.heroSubtitle)}>
            The most complete query builder solution for React.
            <br />
            Fully customizable, framework-friendly, and fluent in 20+ query languages.
          </p>
          <div className={styles.buttons} style={{ marginBottom: 'var(--ifm-spacing-vertical)' }}>
            <Link className="button button--secondary button--lg" to="/docs/intro">
              Get started
            </Link>
            <Link className="button button--secondary button--lg" href="/demo">
              Live demo
            </Link>
          </div>
          <div className={styles.buttons}>
            <CodeBlock>npm i react-querybuilder</CodeBlock>
          </div>
        </div>
      </header>
      <ExportShowcase />
      <section className="alt" style={{ padding: '3rem 0' }}>
        <div className="container">
          <div className="stats">
            <div>
              <b>20+</b>
              <span className="muted">export formats</span>
            </div>
            <div>
              <b>10</b>
              <span className="muted">UI library adapters</span>
            </div>
            <div>
              <b>100%</b>
              <span className="muted">test coverage</span>
            </div>
            <div>
              <b>10+ yrs</b>
              <span className="muted">in production</span>
            </div>
          </div>
        </div>
      </section>
      <main className={`${styles.main} homepage-showcase`}>
        <QueryBuilderContext.Provider value={qbContextProviderValue}>
          <div className={styles.featureRow}>
            <div>
              <span className={styles.eyebrow}>Customize</span>
              <h2>Bring your own components.</h2>
              <p>
                Swap any piece — a date picker, a multi-select, a slider — and keep everything else.
                Or use an official adapter for MUI, Ant Design, Chakra, Mantine, Bootstrap, and
                more.
              </p>
              <Link href="/docs/tips/custom-with-fallback">Custom components →</Link>
            </div>
            <div className="extended-queryBuilder">
              <Link href="https://reactdatepicker.com/" style={{ whiteSpace: 'nowrap' }}>
                <code>react-datepicker</code>
              </Link>
              <QueryBuilder
                fields={datePickerFields}
                defaultQuery={initialDatePickerQuery}
                controlElements={{ valueEditor: ExtendedValueEditor_DatePicker }}
                getOperators={() => defaultOperators.filter(op => op.name === '=')}
              />
              <Link href="https://react-select.com/" style={{ whiteSpace: 'nowrap' }}>
                <code>react-select</code>
              </Link>
              <QueryBuilder
                fields={selectFields}
                defaultQuery={initialSelectQuery}
                controlElements={{ valueEditor: ExtendedValueEditor_Select }}
                getOperators={() => defaultOperators.filter(op => op.name === 'in')}
              />
              <Link
                href="https://mui.com/material-ui/react-slider/"
                style={{ whiteSpace: 'nowrap' }}>
                <code>@mui/material/Slider</code>
              </Link>
              <BrowserOnly>{() => <SliderDemo />}</BrowserOnly>
            </div>
          </div>
          <div className={styles.featureRow}>
            <div>
              <span className={styles.eyebrow}>Style</span>
              <h2>Make it look like yours.</h2>
              <p>
                Every element has a stable class name. Restyle, reorder, or completely reimagine the
                layout with plain CSS.
              </p>
              <Link href="/docs/styling/overview">Styling guide →</Link>
            </div>
            <div className="custom-styling">
              <CustomStylesQB />
            </div>
          </div>
          <div className={styles.featureRow}>
            <div>
              <span className={styles.eyebrow}>Globalize</span>
              <h2>Speaks every language.</h2>
              <p>Translate every label and flip to right-to-left with a single prop.</p>
              <Link href="/docs/components/querybuilder#translations">Translations →</Link>
            </div>
            <div dir="rtl">
              <QueryBuilder
                fields={rtl.fields}
                defaultQuery={initialQuery}
                operators={rtl.operators}
                combinators={rtl.combinators}
                translations={rtl.translations}
                showCloneButtons
                showNotToggle
              />
            </div>
          </div>
          <div className={styles.featureRow}>
            <div>
              <span className={styles.eyebrow}>Extend</span>
              <h2>Drag-and-drop, date/time, native, and more.</h2>
              <p>
                Opt-in packages add reordering, expressions, date/time math, a rules engine, React
                Native support, and an MCP server for AI tooling.
              </p>
              <Link href="/docs/compat">All packages →</Link>
            </div>
            <div>
              <ExtendQB />
            </div>
          </div>
        </QueryBuilderContext.Provider>
      </main>
    </Layout>
  );
};

export default function Index() {
  return (
    <StrictMode>
      <LandingPage />
    </StrictMode>
  );
}
