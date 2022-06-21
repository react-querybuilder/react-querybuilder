// @ts-check
import { createRequire } from 'module';
import { copyFile, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join as pathJoin, resolve } from 'node:path';
import prettier from 'prettier';
import { fileURLToPath } from 'url';
import { transformWithEsbuild } from 'vite';
import { configs } from './exampleConfigs.mjs';
const require = createRequire(import.meta.url);
/** @type {import('prettier').Config} */
const prettierConfig = require('../.prettierrc.json');
const templatePkgJSON = require('./_template/package.json');
const stableStringify = require('fast-json-stable-stringify');
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
const templateSrc = pathJoin(templatePath, 'src');
const templateIndexHTML = (await readFile(pathJoin(templatePath, 'index.html'))).toString('utf-8');
const templateIndexTSX = (await readFile(pathJoin(templateSrc, 'index.tsx'))).toString('utf-8');
const templateIndexSCSS = (await readFile(pathJoin(templateSrc, 'index.scss'))).toString('utf-8');
const templateREADMEmd = (await readFile(pathJoin(templatePath, 'README.md'))).toString('utf-8');

for (const exampleID in configs) {
  const exampleConfig = configs[exampleID];
  const examplePath = pathJoin(__dirname, exampleID);
  const exampleSrc = pathJoin(examplePath, 'src');
  const exampleTitle = `React Query Builder ${exampleConfig.name} Example`;
  await rm(examplePath, { recursive: true, force: true });
  await mkdir(examplePath);
  await mkdir(exampleSrc);

  // #region public/index.html
  const exampleIndexHTML = templateIndexHTML
    .replace('__TITLE__', exampleTitle)
    .replace(/((\/src\/index)\.tsx)/g, exampleConfig.compileToJS ? '$2.jsx' : '$1');
  await writeFile(pathJoin(examplePath, 'index.html'), exampleIndexHTML);
  // #endregion

  // #region src/index.scss
  const processedTemplateSCSS = templateIndexSCSS
    .replace('// __SCSS_PRE__', exampleConfig.scssPre.join('\n'))
    .replace('// __SCSS_POST__', exampleConfig.scssPost.join('\n'))
    .replace(/((query-builder\.)s(css))/g, exampleConfig.compileToJS ? '$2$3' : '$1');
  await writeFile(
    pathJoin(exampleSrc, `index.${exampleConfig.compileToJS ? '' : 's'}css`),
    processedTemplateSCSS
  );
  // #endregion

  // #region src/index.tsx
  let baseImport = '';
  const props = [];
  if (exampleConfig.isCompatPackage) {
    baseImport = `import { ${
      exampleID === 'bootstrap' ? `${exampleID}ControlClassnames, ` : ''
    }${exampleID}ControlElements } from '@react-querybuilder/${exampleID}';`;
    props.push(
      `controlElements={${exampleID}ControlElements}`,
      exampleID === 'bootstrap' ? `controlClassnames={${exampleID}ControlClassnames}` : ''
    );
  }
  const processedTemplateTSX = templateIndexTSX
    .replace('// __IMPORTS__', [baseImport, ...exampleConfig.tsxImports].join('\n'))
    .replace('// __ADDITIONAL_DECLARATIONS__', exampleConfig.additionalDeclarations.join('\n'))
    .replace('// __WRAPPER_OPEN__', exampleConfig.wrapper?.[0] ?? '')
    .replace('// __WRAPPER_CLOSE__', exampleConfig.wrapper?.[1] ?? '')
    .replace('// __RQB_PROPS__', props.join('\n'))
    .replace(/((index\.)s(css))/g, exampleConfig.compileToJS ? '$2$3' : '$1');
  const sourceCode = exampleConfig.compileToJS
    ? (
        await transformWithEsbuild(processedTemplateTSX, 'index.tsx', {
          minify: false,
          minifyWhitespace: false,
          jsx: 'preserve',
        })
      ).code.replace(/^(const|createRoot|\s+return)/gm, '\n\n$1')
    : processedTemplateTSX;
  await writeFile(
    pathJoin(exampleSrc, `index.${exampleConfig.compileToJS ? 'j' : 't'}sx`),
    sourceCode
  );
  // #endregion

  // #region package.json
  /** @type {import('./exampleConfigs').PackageJSON} */
  const examplePkgJSON = JSON.parse(JSON.stringify(templatePkgJSON));
  examplePkgJSON.name = `react-querybuilder-${exampleID}-example`;
  examplePkgJSON.description = exampleTitle;
  if (exampleConfig.isCompatPackage) {
    examplePkgJSON.dependencies[`@react-querybuilder/${exampleID}`] =
      templatePkgJSON.dependencies['react-querybuilder'];
  }
  if (exampleConfig.compileToJS) {
    delete examplePkgJSON.devDependencies['typescript'];
    delete examplePkgJSON.devDependencies['sass'];
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

  // #region vite.config.js and sandbox.config.json
  await copyFile(pathJoin(templatePath, 'vite.config.js'), pathJoin(examplePath, 'vite.config.js'));
  await copyFile(
    pathJoin(templatePath, 'sandbox.config.json'),
    pathJoin(examplePath, 'sandbox.config.json')
  );
  // #endregion

  // #region README.md
  const exampleREADMEmd = templateREADMEmd.replace('/examples/_template', `/examples/${exampleID}`);
  await writeFile(pathJoin(examplePath, 'README.md'), exampleREADMEmd);
  // #endregion

  // #region Prettify everything
  const fileList = await recursivelyGetFiles(examplePath);
  for (const filePath of fileList) {
    const fileContents = (await readFile(filePath)).toString('utf-8');
    const prettified = prettier.format(fileContents, {
      ...prettierConfig,
      filepath: filePath,
      plugins: ['prettier-plugin-organize-imports'],
    });
    await writeFile(filePath, prettified);
  }
  // #endregion
}
