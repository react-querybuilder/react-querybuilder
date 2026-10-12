/** MCP `GetPromptResult` subset. */
export type PromptResult = {
  description?: string;
  messages: { role: 'user'; content: { type: 'text'; text: string } }[];
};

const docs = 'https://react-querybuilder.js.org/docs';

const uiPackages: Record<string, { pkg: string; wrapper: string }> = {
  antd: { pkg: '@react-querybuilder/antd', wrapper: 'QueryBuilderAntD' },
  bootstrap: { pkg: '@react-querybuilder/bootstrap', wrapper: 'QueryBuilderBootstrap' },
  bulma: { pkg: '@react-querybuilder/bulma', wrapper: 'QueryBuilderBulma' },
  chakra: { pkg: '@react-querybuilder/chakra', wrapper: 'QueryBuilderChakra' },
  fluent: { pkg: '@react-querybuilder/fluent', wrapper: 'QueryBuilderFluent' },
  mantine: { pkg: '@react-querybuilder/mantine', wrapper: 'QueryBuilderMantine' },
  material: { pkg: '@react-querybuilder/material', wrapper: 'QueryBuilderMaterial' },
  prime: { pkg: '@react-querybuilder/prime', wrapper: 'QueryBuilderPrime' },
  tremor: { pkg: '@react-querybuilder/tremor', wrapper: 'QueryBuilderTremor' },
};

const user = (text: string, description: string): PromptResult => ({
  description,
  messages: [{ role: 'user', content: { type: 'text', text } }],
});

/** `setup_query_builder` prompt. */
export const setupQueryBuilderPrompt = (uiLibrary = '', fields = ''): PromptResult => {
  const lib = uiLibrary.trim().toLowerCase();
  const ui = uiPackages[lib];
  const isNative = lib === 'native' || lib === 'react-native';
  const steps = [
    'Add a React Query Builder (RQB) query builder to this app. Follow these steps:',
    '',
    '1. Check `package.json`: React version, installed RQB packages/version (docs assume v8), ' +
      'and whether the app already uses a UI library.',
    isNative
      ? '2. Install `react-querybuilder @react-querybuilder/native`. Render `QueryBuilderNative` ' +
        `(see get_doc "compat" and ${docs}/compat).`
      : ui
        ? `2. Install \`react-querybuilder ${ui.pkg}\`. Wrap \`<QueryBuilder>\` in ` +
          `\`<${ui.wrapper}>\` (don't pass \`controlElements\` manually). Import ` +
          "`react-querybuilder/dist/query-builder.css` plus the UI library's own styles " +
          `(see get_doc "compat").`
        : '2. Install `react-querybuilder`. Import `react-querybuilder/dist/query-builder.css`.' +
          (lib && lib !== 'none'
            ? ` No official "${uiLibrary}" package exists; use the default controls or custom ` +
              'controlElements (search_docs "custom components").'
            : ''),
    '3. Define `fields` (`Field[]`: `name`, `label`, plus `inputType`, `valueEditorType`, ' +
      '`values`, `operators` as needed). Keep it outside the component or memoize it.' +
      (fields ? `\n   Fields to support: ${fields}` : ''),
    '4. Use controlled state: `const [query, setQuery] = useState<RuleGroupType>({ ' +
      "combinator: 'and', rules: [] })` and `<QueryBuilder fields={fields} query={query} " +
      'onQueryChange={setQuery} />`.',
    '5. To send the query to a backend, use `formatQuery(query, format)` (format_query tool to ' +
      'preview output; "parameterized" for SQL with bind params). On a server, import from ' +
      '`@react-querybuilder/core`, not `react-querybuilder`.',
    '6. Verify every prop you use exists on `QueryBuilderProps` (resource ' +
      '`rqb://types/QueryBuilderProps` or get_doc "components/querybuilder"). Do not invent props.',
    '7. If you hand-write an initial query, check it with validate_query.',
  ];
  return user(steps.join('\n'), 'Set up a React Query Builder UI');
};

/** `convert_filter` prompt. */
export const convertFilterPrompt = (input: string, from = '', to = ''): PromptResult =>
  user(
    [
      `Convert this filter${from ? ` from ${from}` : ''}${to ? ` to ${to}` : ''} using the ` +
        'React Query Builder MCP tools (do not hand-convert):',
      '',
      '```',
      input,
      '```',
      '',
      '1. ' +
        (from
          ? `Use sourceFormat/from "${from}".`
          : 'Identify the source format (sql, cel, mongodb, jsonlogic, spel, jsonata, cypher, ' +
            'gql, gremlin, sparql).'),
      '2. ' +
        (to
          ? `Call convert_query with to "${to}".`
          : 'Ask which target format is needed if unclear, then call convert_query.') +
        ' Pass `fields` if the field list is known.',
      '3. If convert_query warns that rules were dropped or the result is empty, call ' +
        'parse_query to inspect the intermediate query and report unsupported constructs.',
      '4. Show the result and the intermediate RQB query. Mention any warnings.',
    ].join('\n'),
    'Convert a filter between formats'
  );
