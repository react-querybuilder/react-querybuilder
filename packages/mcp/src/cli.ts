#!/usr/bin/env node
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { createServer, serverName } from './server';

// stdout is the JSON-RPC channel; log to stderr only
const handle = serveStdio(createServer);
console.error(`${serverName} MCP server listening on stdio`);

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => void handle.close().then(() => process.exit(0)));
}
