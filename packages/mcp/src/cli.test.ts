import path from 'node:path';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

// Spawns the real stdio entry (via Bun, from source)
test('cli serves over stdio', async () => {
  const client = new Client({ name: 'test', version: '1.0.0' });
  await client.connect(
    new StdioClientTransport({
      command: 'bun',
      args: [path.join(import.meta.dirname, 'cli.ts')],
      cwd: path.join(import.meta.dirname, '..'),
      stderr: 'ignore',
    })
  );
  try {
    const r = await client.callTool({
      name: 'convert_query',
      arguments: { input: "a = 'x'", from: 'sql', to: 'mongodb' },
    });
    expect((r.content as { text: string }[])[0].text).toContain('{"a":"x"}');
  } finally {
    await client.close();
  }
}, 20_000);
