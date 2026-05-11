/**
 * Updates website/src/pages/demo/_styles/rqb-mantine.css with the latest
 * content from node_modules/@mantine/core/styles.css.
 *
 * Usage: bun utils/update-mantine-css.ts
 */

import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dir, '..');
const STYLES_SRC = resolve(ROOT, 'node_modules/@mantine/core/styles.css');
const MANTINE_PKG = resolve(ROOT, 'node_modules/@mantine/core/package.json');
const TARGET = resolve(ROOT, 'website/src/pages/demo/_styles/rqb-mantine.css');

// Max lines the CSS reset block is allowed to be before we bail out.
const RESET_MAX_LINES = 50;
// Warn if line count changes by more than this fraction.
const SANITY_THRESHOLD = 0.2;

function warn(msg: string) {
  if (process.env.CI) {
    console.error(`::warning file=website/src/pages/demo/_styles/rqb-mantine.css::${msg}`);
  } else {
    console.error(`\x1b[33mWARNING:\x1b[0m ${msg}`);
  }
}

// ---------------------------------------------------------------------------
// 1. Read source files
// ---------------------------------------------------------------------------

const version: string = (await Bun.file(MANTINE_PKG).json()).version;
const sourceLines = (await Bun.file(STYLES_SRC).text()).split('\n');

// ---------------------------------------------------------------------------
// 2. Detect reset block end
//
// Walk from line 0 tracking brace depth. The reset ends at the closing `}` of
// the last top-level block before the first line that does NOT match a known
// reset-section pattern. Guards against runaway detection with RESET_MAX_LINES.
// ---------------------------------------------------------------------------

const RESET_LINE_PATTERN =
  /^(:root|:host|html|body|\*|input|button|textarea|select|@media|}\s*$|$)/;

let braceDepth = 0;
let resetEndIndex = -1;
let lastTopLevelClose = -1;

for (let i = 0; i < sourceLines.length; i++) {
  const line = sourceLines[i];
  for (const ch of line) {
    if (ch === '{') braceDepth++;
    else if (ch === '}') braceDepth--;
  }

  if (braceDepth === 0 && line.trim() === '}') {
    lastTopLevelClose = i;
  }

  if (lastTopLevelClose !== -1 && braceDepth === 0) {
    let nextContentIndex = i + 1;
    while (nextContentIndex < sourceLines.length && sourceLines[nextContentIndex].trim() === '') {
      nextContentIndex++;
    }
    const nextLine = sourceLines[nextContentIndex]?.trim() ?? '';
    if (nextLine !== '' && !RESET_LINE_PATTERN.test(nextLine)) {
      resetEndIndex = lastTopLevelClose;
      break;
    }
  }

  if (i >= RESET_MAX_LINES) {
    console.error(
      `ERROR: Could not detect end of CSS reset block within ${RESET_MAX_LINES} lines.`
    );
    console.error('The heuristic may need updating. Check utils/update-mantine-css.ts.');
    process.exit(1);
  }
}

if (resetEndIndex === -1) {
  console.error('ERROR: Could not detect end of CSS reset block.');
  process.exit(1);
}

const resetBlock = sourceLines.slice(0, resetEndIndex + 1).join('\n');
const restBlock = sourceLines.slice(resetEndIndex + 1).join('\n');

// ---------------------------------------------------------------------------
// 3. Split the target file at BEGIN_MANTINE_STYLES
// ---------------------------------------------------------------------------

const targetContent = await Bun.file(TARGET).text();
const splitMarker = '/* BEGIN_MANTINE_STYLES';
const splitIndex = targetContent.indexOf(splitMarker);

if (splitIndex === -1) {
  console.error(`ERROR: Could not find "${splitMarker}" in ${TARGET}`);
  process.exit(1);
}

const topSection = targetContent.slice(0, splitIndex);
const oldMantineSection = targetContent.slice(splitIndex);
const oldLineCount = oldMantineSection.split('\n').length;

// ---------------------------------------------------------------------------
// 4. Build new file content
// ---------------------------------------------------------------------------

const newMantineSection = `/* BEGIN_MANTINE_STYLES v${version}
The rest of this file was copied from node_modules/@mantine/core/styles.css.
The "CSS reset" section (except for the \`html, body\` styles) and the \`body\` styles from
the "Global styles" section have been commented here and copied into the \`.rqb-mantine\`
block above. The \`:root { color-scheme: ... }\` declaration in the "Default CSS variables"
section has also been commented.
*/

/* BEGIN_MANTINE_CSS_RESET */
/*
${resetBlock}
*/
/* END_MANTINE_CSS_RESET */
${restBlock}`;

const newLineCount = newMantineSection.split('\n').length;

// ---------------------------------------------------------------------------
// 5. Sanity check
// ---------------------------------------------------------------------------

const delta = Math.abs(newLineCount - oldLineCount) / oldLineCount;
if (delta > SANITY_THRESHOLD) {
  warn(
    `Line count of Mantine CSS section changed by ${Math.round(delta * 100)}% ` +
      `(${oldLineCount} → ${newLineCount}). Review the diff carefully.`
  );
}

// ---------------------------------------------------------------------------
// 6. Write and format
// ---------------------------------------------------------------------------

await Bun.write(TARGET, topSection + newMantineSection);
console.log(`Written ${TARGET}`);

const fmt = Bun.spawnSync(['bun', 'fmt', TARGET], {
  cwd: ROOT,
  stdout: 'inherit',
  stderr: 'inherit',
});
if (fmt.exitCode !== 0) {
  warn('bun fmt failed — file was written but not formatted.');
}

console.log(`Done. Mantine CSS updated to v${version}.`);
