// @ts-check
import stableStringify from 'fast-json-stable-stringify';
import glob from 'glob';
import { createRequire } from 'module';
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join as pathJoin } from 'node:path';
import prettier from 'prettier';
import { fileURLToPath } from 'url';
import { transformWithEsbuild } from 'vite';
import { configs } from './exampleConfigs.mjs';
const require = createRequire(import.meta.url);
/** @type {{ version: string; }} */
const { version } = require('../lerna.json');
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootPrettierConfig = await prettier.resolveConfig(__filename);

/** @type {(code: string, fileName: string) => Promise<string>} */
const compileToJS = async (code, fileName) =>
  (
    await transformWithEsbuild(code, fileName, {
      minify: false,
      minifyWhitespace: false,
      jsx: 'preserve',
    })
  ).code.replace(/^(const|createRoot|\s+return)/gm, '\n\n$1');

const packagesPath = pathJoin(__dirname, '../packages');
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
  .replace(/("@?react-querybuilder(?:\/\w+)?": ").*?"/g, `$1^${version}"`);
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
  const processedTemplateIndexTSX = templateIndexTSX.replace(
    /styles\.scss/g,
    exampleConfig.compileToJS ? 'styles.css' : '$&'
  );
  const exampleIndexSourceCode = exampleConfig.compileToJS
    ? await compileToJS(processedTemplateIndexTSX, 'index.tsx')
    : processedTemplateIndexTSX;
  await writeFile(
    pathJoin(exampleSrc, `index.${exampleConfig.compileToJS ? 'js' : 'tsx'}`),
    exampleIndexSourceCode
  );
  // #endregion

  // #region src/App.tsx
  const processedTemplateAppTSX = templateAppTSX
    .replace('// __IMPORTS__', exampleConfig.tsxImports.join('\n'))
    .replace('// __ADDITIONAL_DECLARATIONS__', exampleConfig.additionalDeclarations.join('\n'))
    .replace('{/* __WRAPPER_OPEN__ */}', exampleConfig.wrapper?.[0] ?? '')
    .replace('{/* __WRAPPER_CLOSE__ */}', exampleConfig.wrapper?.[1] ?? '')
    .replace('// __RQB_PROPS__', exampleConfig.props.join('\n'))
    .replace(/styles\.scss/g, exampleConfig.compileToJS ? 'styles.css' : '$&');
  const exampleAppSourceCode = exampleConfig.compileToJS
    ? await compileToJS(processedTemplateAppTSX, 'App.tsx')
    : processedTemplateAppTSX;
  await writeFile(
    pathJoin(exampleSrc, `App.${exampleConfig.compileToJS ? 'js' : 'tsx'}`),
    exampleAppSourceCode
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
  for (const depKey of exampleConfig.dependencyKeys) {
    /** @type {import('./exampleConfigs').PackageJSON} */
    const compatPkgJson = require(pathJoin(packagesPath, `${exampleID}/package.json`));
    if (Array.isArray(depKey)) {
      examplePkgJSON.dependencies[depKey[0]] = depKey[1];
    } else {
      examplePkgJSON.dependencies[depKey] = compatPkgJson.peerDependencies[depKey];
    }
  }
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
    `## ${exampleTitle}` +
    '\n\n' +
    templateREADMEmd
      .replace(/\/examples\/_template/g, `/examples/${exampleID}`)
      .replace(/App.tsx/g, exampleConfig.compileToJS ? 'App.js' : '$&') +
    '\n\n' +
    '> _Development note: Do not modify these files directly. Edit corresponding files in the ' +
    '[_template](../_template) folder and/or [exampleConfigs.mjs](../exampleConfigs.mjs), then run ' +
    '`yarn generate-examples` from the repository root directory._';
  await writeFile(pathJoin(examplePath, 'README.md'), exampleREADMEmd);
  // #endregion

  // #region Prettify this example
  const fileList = glob.sync(`examples/${exampleID}/**/*.{ts,tsx,js,jsx,json,css,scss,html,md}`);
  for (const filepath of fileList) {
    const fileContents = (await readFile(filepath)).toString('utf-8');
    const printWidth = filepath.endsWith('css')
      ? rootPrettierConfig?.printWidth
      : (await prettier.resolveConfig(filepath))?.printWidth;
    /** @type {import('prettier').Options} */
    const prettierOptions = {
      ...rootPrettierConfig,
      printWidth,
      filepath,
      plugins: ['prettier-plugin-organize-imports'],
    };
    if (!prettier.check(fileContents, prettierOptions)) {
      let prettified = prettier.format(fileContents, prettierOptions);
      if (exampleConfig.compileToJS) {
        prettified = prettified.replace(
          /^import +(\{(.*?)\} +from +['"]react['"])/g,
          'import React, $1'
        );
      }
      await writeFile(filepath, prettified);
    }
  }
  // #endregion

  console.log(`Generated "${exampleConfig.name}" example (${exampleID})`);
}

console.log('Finished generating examples');
