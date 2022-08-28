// @ts-check
import stableStringify from 'fast-json-stable-stringify';
import { createRequire } from 'module';
import { copyFile, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join as pathJoin, resolve } from 'node:path';
import prettier from 'prettier';
import { fileURLToPath } from 'url';
import { transformWithEsbuild } from 'vite';
import { configs } from './exampleConfigs.mjs';
const require = createRequire(import.meta.url);
/** @type {import('../lerna').LernaJSON} */
const lernaJSON = require('../lerna.json');
/** @type {import('prettier').Config} */
const prettierConfig = require('../.prettierrc.json');
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {(dir: string) => Promise<string[]>} */
async function recursivelyGetFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map(dirent => {
      const res = resolve(dir, dirent.name);
      return dirent.isDirectory() ? recursivelyGetFiles(res) : res;
    })
  );
  return files.flat();
}

const templatePath = pathJoin(__dirname, '_template');
const templatePublic = pathJoin(templatePath, 'public');
const templateSrc = pathJoin(templatePath, 'src');
const templateIndexHTML = (await readFile(pathJoin(templatePublic, 'index.html'))).toString(
  'utf-8'
);
const templateIndexTSX = (await readFile(pathJoin(templateSrc, 'index.tsx'))).toString('utf-8');
const templateAppTSX = (await readFile(pathJoin(templateSrc, 'App.tsx'))).toString('utf-8');
const templateStylesSCSS = (await readFile(pathJoin(templateSrc, 'styles.scss'))).toString('utf-8');
const templateREADMEmd = (await readFile(pathJoin(templatePath, 'README.md'))).toString('utf-8');

const templatePkgJsonNewText = (await readFile(pathJoin(templatePath, 'package.json')))
  .toString('utf-8')
  .replace(/("react-querybuilder": ").*?"/g, `$1^${lernaJSON.version}"`);
await writeFile(pathJoin(templatePath, 'package.json'), templatePkgJsonNewText);
const templatePkgJSON = require('./_template/package.json');

for (const exampleID in configs) {
  const exampleConfig = configs[exampleID];
  const examplePath = pathJoin(__dirname, exampleID);
  const examplePublic = pathJoin(examplePath, 'public');
  const exampleSrc = pathJoin(examplePath, 'src');
  const exampleTitle = `React Query Builder ${exampleConfig.name} Example`;
  await rm(examplePath, { recursive: true, force: true });
  await mkdir(examplePath);
  await mkdir(examplePublic);
  await mkdir(exampleSrc);

  // #region public/index.html
  const exampleIndexHTML = templateIndexHTML.replace('__TITLE__', exampleTitle);
  await writeFile(pathJoin(examplePublic, 'index.html'), exampleIndexHTML);
  // #endregion

  // #region src/index.scss
  const processedTemplateSCSS = templateStylesSCSS
    .replace('// __SCSS_PRE__', exampleConfig.scssPre.join('\n'))
    .replace('// __SCSS_POST__', exampleConfig.scssPost.join('\n'))
    .replace(/((query-builder\.)s(css))/g, exampleConfig.compileToJS ? '$2$3' : '$1');
  await writeFile(
    pathJoin(exampleSrc, `styles.${exampleConfig.compileToJS ? '' : 's'}css`),
    processedTemplateSCSS
  );
  // #endregion

  // #region src/index.tsx
  const processedTemplateIndexTSX = templateIndexTSX
    .replace(/(!)/g, exampleConfig.compileToJS ? '' : '$1')
    .replace(/((styles\.)s(css))/g, exampleConfig.compileToJS ? '$2$3' : '$1');
  await writeFile(
    pathJoin(exampleSrc, `index.${exampleConfig.compileToJS ? 'j' : 't'}sx`),
    processedTemplateIndexTSX
  );
  // #endregion

  // #region src/App.tsx
  const processedTemplateAppTSX = templateAppTSX
    .replace('// __IMPORTS__', exampleConfig.tsxImports.join('\n'))
    .replace('// __ADDITIONAL_DECLARATIONS__', exampleConfig.additionalDeclarations.join('\n'))
    .replace('{/* __WRAPPER_OPEN__ */}', exampleConfig.wrapper?.[0] ?? '')
    .replace('{/* __WRAPPER_CLOSE__ */}', exampleConfig.wrapper?.[1] ?? '')
    .replace('// __RQB_PROPS__', exampleConfig.props.join('\n'));
  const sourceCode = exampleConfig.compileToJS
    ? (
        await transformWithEsbuild(processedTemplateAppTSX, 'App.tsx', {
          minify: false,
          minifyWhitespace: false,
          jsx: 'preserve',
        })
      ).code.replace(/^(const|createRoot|\s+return)/gm, '\n\n$1')
    : processedTemplateAppTSX;
  await writeFile(
    pathJoin(exampleSrc, `App.${exampleConfig.compileToJS ? 'j' : 't'}sx`),
    sourceCode
  );
  // #endregion

  // #region package.json
  /** @type {import('./exampleConfigs').PackageJSON} */
  const examplePkgJSON = JSON.parse(JSON.stringify(templatePkgJSON));
  examplePkgJSON.name = `react-querybuilder-${exampleID}-example`;
  examplePkgJSON.description = exampleTitle;
  if (exampleConfig.isCompatPackage || exampleConfig.enableDnD) {
    examplePkgJSON.dependencies[`@react-querybuilder/${exampleID}`] =
      templatePkgJSON.dependencies['react-querybuilder'];
  }
  if (exampleConfig.compileToJS) {
    delete examplePkgJSON.devDependencies['typescript'];
    for (const devDep of Object.keys(examplePkgJSON.devDependencies)) {
      if (devDep.match(/^@types\//)) {
        delete examplePkgJSON.devDependencies[devDep];
      }
    }
  }
  examplePkgJSON.dependencies = { ...examplePkgJSON.dependencies, ...exampleConfig.dependencies };
  await writeFile(pathJoin(examplePath, 'package.json'), stableStringify(examplePkgJSON));
  // #endregion

  // #region tsconfig.json
  if (!exampleConfig.compileToJS) {
    await copyFile(pathJoin(templatePath, 'tsconfig.json'), pathJoin(examplePath, 'tsconfig.json'));
  }
  // #endregion

  // #region .prettierrc
  await copyFile(pathJoin(templatePath, '.prettierrc'), pathJoin(examplePath, '.prettierrc'));
  // #endregion

  // #region README.md
  const exampleREADMEmd =
    templateREADMEmd.replace('/examples/_template', `/examples/${exampleID}`) +
    '\n\n> _Development note: Do not modify these files directly. Edit corresponding files in the ' +
    '[_template](../_template) folder and/or [exampleConfigs.mjs](../exampleConfigs.mjs), then run ' +
    '`yarn generate-examples` from the repository root directory._';
  await writeFile(pathJoin(examplePath, 'README.md'), exampleREADMEmd);
  // #endregion

  // #region Prettify everything
  const fileList = await recursivelyGetFiles(examplePath);
  for (const filepath of fileList) {
    const fileContents = (await readFile(filepath)).toString('utf-8');
    const prettified = prettier.format(fileContents, {
      ...prettierConfig,
      printWidth: 80, // narrower since codesandbox code panel is narrow
      filepath,
      plugins: ['prettier-plugin-organize-imports'],
    });
    await writeFile(filepath, prettified);
  }
  // #endregion

  console.log(`Generated "${exampleConfig.name}" example (${exampleID})`);
}

console.log('Finished generating examples');
