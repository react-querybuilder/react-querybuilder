import { Client } from '@modelcontextprotocol/client';
import { InMemoryTransport } from '@modelcontextprotocol/server';
import { docsIndex } from './docs';
import { convertFilterPrompt, setupQueryBuilderPrompt } from './prompts';
import { createServer, serverName } from './server';

let client: Client;

beforeAll(async () => {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await createServer().connect(serverTransport);
  client = new Client({ name: 'test', version: '1.0.0' });
  await client.connect(clientTransport);
});

afterAll(async () => {
  await client.close();
});

const toolNames = [
  'format_query',
  'parse_query',
  'convert_query',
  'validate_query',
  'get_query_schema',
  'search_docs',
  'get_doc',
];

describe('server', () => {
  test('server info + instructions', () => {
    expect(client.getServerVersion()?.name).toBe(serverName);
    expect(client.getInstructions()).toMatch('convert_query');
  });

  test('lists tools w/ object input schemas', async () => {
    const { tools } = await client.listTools();
    expect(tools.map(t => t.name).toSorted()).toEqual(toolNames.toSorted());
    for (const t of tools) {
      expect(t.inputSchema.type).toBe('object');
      expect(t.description!.length).toBeGreaterThan(50);
      expect(t.annotations?.readOnlyHint).toBe(true);
    }
  });

  test.each([
    ['format_query', { query: { combinator: 'and', rules: [] }, format: 'sql' }, '(1 = 1)'],
    ['parse_query', { input: 'a = 1', sourceFormat: 'sql' }, '"field": "a"'],
    ['convert_query', { input: 'a = 1', from: 'sql', to: 'cel' }, 'a == 1'],
    [
      'validate_query',
      { query: { combinator: 'and', rules: [] }, fields: [{ name: 'a', label: 'A' }] },
      'Valid.',
    ],
    ['get_query_schema', { fields: [{ name: 'a', label: 'A' }] }, '"$defs"'],
    ['search_docs', { query: 'export sql' }, 'https://react-querybuilder.js.org/docs/'],
    ['get_doc', { page: 'utils/export' }, '# Export'],
  ])('%s', async (name, args, expected) => {
    const r = await client.callTool({ name, arguments: args });
    expect(r.isError).toBeFalsy();
    expect((r.content as { text: string }[])[0].text).toContain(expected);
  });

  test('schema rejects bad args', async () => {
    const r = await client.callTool({
      name: 'format_query',
      arguments: { query: {}, format: 'x' },
    });
    expect(r.isError).toBe(true);
    const r2 = await client.callTool({ name: 'search_docs', arguments: { query: 'x', bogus: 1 } });
    expect(r2.isError).toBe(true);
  });

  test('ORM format → helpful error', async () => {
    const r = await client.callTool({
      name: 'format_query',
      arguments: { query: { combinator: 'and', rules: [] }, format: 'drizzle' },
    });
    expect(r.isError).toBe(true);
    expect((r.content as { text: string }[])[0].text).toMatch('ORM');
  });

  test('doc + type resources', async () => {
    const { resources } = await client.listResources();
    const uris = resources.map(r => r.uri);
    expect(uris).toContain('rqb://docs/utils/export');
    expect(uris).toContain('rqb://types/RuleGroupType');
    expect(resources.filter(r => r.uri.startsWith('rqb://docs/'))).toHaveLength(
      docsIndex.pages.length
    );

    const doc = await client.readResource({ uri: 'rqb://docs/utils/export' });
    expect((doc.contents[0] as { text: string }).text.startsWith('# Export')).toBe(true);
    const type = await client.readResource({ uri: 'rqb://types/RuleGroupType' });
    expect((type.contents[0] as { text: string }).text).toMatch('interface RuleGroupType');

    await expect(client.readResource({ uri: 'rqb://docs/nope' })).rejects.toThrow();
    await expect(client.readResource({ uri: 'rqb://types/Nope' })).rejects.toThrow();
  });

  test('prompts', async () => {
    const { prompts } = await client.listPrompts();
    expect(prompts.map(p => p.name).toSorted()).toEqual(['convert_filter', 'setup_query_builder']);
    const p1 = await client.getPrompt({
      name: 'setup_query_builder',
      arguments: { uiLibrary: 'mantine', fields: 'name, age' },
    });
    expect((p1.messages[0].content as { text: string }).text).toMatch('QueryBuilderMantine');
    const p2 = await client.getPrompt({
      name: 'convert_filter',
      arguments: { input: 'a = 1', from: 'sql', to: 'mongodb' },
    });
    expect((p2.messages[0].content as { text: string }).text).toMatch('convert_query');
  });
});

describe('prompts', () => {
  const t = (r: { messages: { content: { text: string } }[] }) => r.messages[0].content.text;

  test('setup_query_builder variants', () => {
    expect(t(setupQueryBuilderPrompt())).toMatch('Install `react-querybuilder`. Import');
    expect(t(setupQueryBuilderPrompt('none'))).not.toMatch('No official');
    expect(t(setupQueryBuilderPrompt('Foo'))).toMatch('No official "Foo" package');
    expect(t(setupQueryBuilderPrompt('native'))).toMatch('QueryBuilderNative');
    expect(t(setupQueryBuilderPrompt(' MUI '.replace('MUI', 'material')))).toMatch(
      '@react-querybuilder/material'
    );
    expect(t(setupQueryBuilderPrompt('', 'x, y'))).toMatch('Fields to support: x, y');
  });

  test('convert_filter variants', () => {
    expect(t(convertFilterPrompt('q'))).toMatch('Identify the source format');
    expect(t(convertFilterPrompt('q'))).toMatch('Ask which target format');
    expect(t(convertFilterPrompt('q', 'sql', 'cel'))).toMatch(
      'Convert this filter from sql to cel'
    );
  });
});
