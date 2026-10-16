/**
 * Generates the vector DB operator support table in `website/docs/utils/export.mdx` (and the
 * v7 copy) from `formatCapabilities` (between `{/* GENERATED:vector:start *\/}`/
 * `{/* GENERATED:vector:end *\/}`).
 *
 * - `bun ./utils/vector-format-tables.ts` - write
 * - `bun ./utils/vector-format-tables.ts --check` - exit 1 on drift
 */
import path from 'node:path';
import type { FormatConfig } from 'oxfmt';
import { format } from 'oxfmt';
import { defaultOperators } from '../packages/core/src/defaults';
import type { ExportFormat } from '../packages/core/src/types/export';
import { formatCapabilities } from '../packages/core/src/utils/formatQuery/formatCapabilities';

const root = path.join(import.meta.dirname, '..');
const files = [
  'website/docs/utils/export.mdx',
  'website/versioned_docs/version-7/utils/export.mdx',
];
const START = '{/* GENERATED:vector:start */}';
const END = '{/* GENERATED:vector:end */}';

const formats: [ExportFormat, string][] = [
  ['pinecone', 'Pinecone'],
  ['chroma', 'Chroma'],
  ['qdrant', 'Qdrant'],
  ['weaviate', 'Weaviate'],
  ['milvus', 'Milvus'],
];

const yes = '✓';
const no = '–';
const row = (cells: string[]) => `| ${cells.join(' | ')} |`;

export const vectorFormatTable = (): string => {
  const caps = formats.map(([f]) => formatCapabilities[f]!);
  const rows = [
    ...defaultOperators.map(({ name }) =>
      [`\`${name}\``].concat(
        caps.map(c => (c.operators.has(name.toLowerCase() as never) ? yes : no))
      )
    ),
    [
      '`valueSource: "field"`',
      ...caps.map(({ fieldValueSource: fvs }) =>
        typeof fvs === 'boolean'
          ? fvs
            ? yes
            : no
          : fvs.size > 0
            ? `Only ${defaultOperators
                .filter(o => fvs.has(o.name.toLowerCase() as never))
                .map(o => `\`${o.name}\``)
                .join(', ')}`
            : no
      ),
    ],
    ['Match modes', ...caps.map(c => (c.matchModes.size > 0 ? [...c.matchModes].join(', ') : no))],
    ['`not` groups', ...caps.map(c => (c.nativeNot ? 'native' : 'De Morgan'))],
  ];
  const header = ['Feature', ...formats.map(([f, l]) => `[${l}](#${f})`)];
  return [row(header), row(header.map(() => '---')), ...rows.map(r => row(r))].join('\n');
};

if (import.meta.main) {
  // `format()` doesn't read `.oxfmtrc.json` itself
  const { $schema: _, ...fmtConfig }: FormatConfig & { $schema?: string } = Bun.JSONC.parse(
    await Bun.file(path.join(root, '.oxfmtrc.json')).text()
  ) as FormatConfig;
  const check = process.argv.includes('--check');
  let drift = false;
  for (const file of files) {
    const p = path.join(root, file);
    // oxlint-disable-next-line no-await-in-loop
    const current = await Bun.file(p).text();
    const s = current.indexOf(START);
    const e = current.indexOf(END);
    if (s < 0 || e < s) throw new Error(`vector-format-tables: markers not found in ${file}`);
    const replaced = `${current.slice(0, s + START.length)}\n\n${vectorFormatTable()}\n\n${current.slice(e)}`;
    // oxlint-disable-next-line no-await-in-loop
    const next = (await format(p, replaced, fmtConfig)).code;
    if (next === current) continue;
    if (check) {
      drift = true;
      console.error(`Out of date: ${file}`);
    } else {
      // oxlint-disable-next-line no-await-in-loop
      await Bun.write(p, next);
      console.log(`Updated ${file}`);
    }
  }
  if (drift) {
    console.error('Run `bun vector-tables:generate`.');
    process.exit(1);
  }
}
