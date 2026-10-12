# @react-querybuilder/mcp

Local (stdio) [Model Context Protocol](https://modelcontextprotocol.io) server for [React Query Builder](https://react-querybuilder.js.org/). Gives coding agents the library's real query tooling and version-pinned docs.

## Tools

| Tool               | Purpose                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| `format_query`     | RQB query → any `formatQuery` format (SQL, parameterized, MongoDB, CEL, JsonLogic, natural language, …) |
| `parse_query`      | SQL/CEL/MongoDB/JsonLogic/SpEL/JSONata/Cypher/GQL/Gremlin/SPARQL → RQB query                            |
| `convert_query`    | Parse + format in one step (e.g. SQL → MongoDB); returns the intermediate RQB query too                 |
| `validate_query`   | Check a query against a `fields` config (shape, IC alternation, operators, value arity/types, …)        |
| `get_query_schema` | JSON Schema for valid queries (`getQueryJsonSchema`)                                                    |
| `search_docs`      | Full-text search of the docs (matching this package's version)                                          |
| `get_doc`          | A docs page (or `#anchor` section) as markdown                                                          |

ORM formats (`drizzle`, `prisma`, `sequelize`, `tanstack_db`) need live ORM objects and aren't available over MCP. `fields` input accepts the JSON-serializable subset of `Field` (no function props such as `validator`).

Also provides:

- **Resources**: `rqb://docs/{slug}` (every docs page) and `rqb://types/{name}` (key type declarations, e.g. `RuleGroupType`, `FormatQueryOptions`, `QueryBuilderProps`).
- **Prompts**: `setup_query_builder` (`uiLibrary`, `fields`) and `convert_filter` (`input`, `from`, `to`).

## Configuration

Requires Node.js 20+.

**Claude Code**

```bash
claude mcp add rqb -- npx -y @react-querybuilder/mcp
```

**opencode** (`opencode.json`)

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "rqb": {
      "type": "local",
      "command": ["npx", "-y", "@react-querybuilder/mcp"]
    }
  }
}
```

**Cursor** (`.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "rqb": { "command": "npx", "args": ["-y", "@react-querybuilder/mcp"] }
  }
}
```

**VS Code** (`.vscode/mcp.json`)

```json
{
  "servers": {
    "rqb": { "type": "stdio", "command": "npx", "args": ["-y", "@react-querybuilder/mcp"] }
  }
}
```

`bunx @react-querybuilder/mcp` also works.

## Programmatic use

```ts
import { createServer, handleConvertQuery } from '@react-querybuilder/mcp';

// Tool handlers are plain async functions
const result = await handleConvertQuery({ input: 'age > 30', from: 'sql', to: 'mongodb_query' });

// Or connect the server to any MCP transport
const server = createServer();
```

## Development

```bash
bun run build:mcp   # builds the docs index (src/generated/, gitignored) + dist
bun test packages/mcp
bun run test:mcp    # Vitest w/ coverage
```

Smoke test with the MCP Inspector (after building):

```bash
bunx @modelcontextprotocol/inspector node packages/mcp/dist/cli.mjs
```
