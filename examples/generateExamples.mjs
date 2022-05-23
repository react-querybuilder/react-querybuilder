import { createRequire } from 'module';
import { copyFile, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join as pathJoin, resolve } from 'node:path';
import prettier from 'prettier';
import { fileURLToPath } from 'url';
import { transformWithEsbuild } from 'vite';
import configs from './configs.mjs';
const require = createRequire(import.meta.url);
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
const templatePublic = pathJoin(templatePath, 'public');
const templateSrc = pathJoin(templatePath, 'src');
const templateIndexHTML = (await readFile(pathJoin(templatePublic, 'index.html'))).toString(
  'utf-8'
);
const templateIndexTSX = (await readFile(pathJoin(templateSrc, 'index.tsx'))).toString('utf-8');
const templateIndexSCSS = (await readFile(pathJoin(templateSrc, 'index.scss'))).toString('utf-8');
const templateREADMEmd = (await readFile(pathJoin(templatePath, 'README.md'))).toString('utf-8');

for (const configID in configs) {
  const config = configs[configID];
  const examplePath = pathJoin(__dirname, configID);
  const examplePublic = pathJoin(examplePath, 'public');
  const exampleSrc = pathJoin(examplePath, 'src');
  const exampleTitle = `React Query Builder ${config.name} Example`;
  await rm(examplePath, { recursive: true, force: true });
  await mkdir(examplePath);
  await mkdir(examplePublic);
  await mkdir(exampleSrc);

  // #region public/index.html
  await writeFile(
    pathJoin(examplePublic, 'index.html'),
    templateIndexHTML.replace('__TITLE__', exampleTitle)
  );
  // #endregion

  // #region src/index.scss
  const processedTemplateSCSS = templateIndexSCSS
    .replace('// __SCSS_PRE__', config.scssPre.join('\n'))
    .replace('// __SCSS_POST__', config.scssPost.join('\n'))
    .replace(/((query-builder\.)s(css))/g, config.compileToJS ? '$2$3' : '$1');
  await writeFile(
    pathJoin(exampleSrc, `index.${config.compileToJS ? '' : 's'}css`),
    processedTemplateSCSS
  );
  // #endregion

  // #region src/index.tsx
  let baseImport = '';
  const props = [];
  if (config.isCompatPackage) {
    baseImport = `import { ${
      configID === 'bootstrap' ? `${configID}ControlClassnames, ` : ''
    }${configID}ControlElements } from '@react-querybuilder/${configID}';`;
    props.push(
      `controlElements={${configID}ControlElements}`,
      configID === 'bootstrap' ? `controlClassnames={${configID}ControlClassnames}` : ''
    );
  }
  const processedTemplateTSX = templateIndexTSX
    .replace('// __IMPORTS__', [baseImport, ...config.tsxImports].join('\n'))
    .replace('// __ADDITIONAL_DECLARATIONS__', config.additionalDeclarations.join('\n'))
    .replace('// __WRAPPER_OPEN__', config.wrapper[0])
    .replace('// __WRAPPER_CLOSE__', config.wrapper[1])
    .replace('// __RQB_PROPS__', props.join('\n'))
    .replace(/((index\.)s(css))/g, config.compileToJS ? '$2$3' : '$1');
  const sourceCode = config.compileToJS
    ? (
        await transformWithEsbuild(processedTemplateTSX, 'index.tsx', {
          minify: false,
          minifyWhitespace: false,
          jsx: 'preserve',
        })
      ).code.replace(/^(const|createRoot|\s+return)/gm, '\n\n$1')
    : processedTemplateTSX;
  await writeFile(pathJoin(exampleSrc, `index.${config.compileToJS ? 'js' : 'tsx'}`), sourceCode);
  // #endregion

  // #region package.json
  const examplePkgJSON = JSON.parse(JSON.stringify(templatePkgJSON));
  examplePkgJSON.name = `react-querybuilder-${configID}-example`;
  examplePkgJSON.description = exampleTitle;
  if (config.isCompatPackage) {
    examplePkgJSON.dependencies[`@react-querybuilder/${configID}`] =
      templatePkgJSON.dependencies['react-querybuilder'];
  }
  if (config.compileToJS) {
    delete examplePkgJSON.devDependencies['typescript'];
    for (const devDep of Object.keys(examplePkgJSON.devDependencies)) {
      if (devDep.match(/^@types\//)) {
        delete examplePkgJSON.devDependencies[devDep];
      }
    }
  }
  for (const [dep, version] of config.dependencies) {
    examplePkgJSON.dependencies[dep] = version;
  }
  await writeFile(pathJoin(examplePath, 'package.json'), stableStringify(examplePkgJSON));
  // #endregion

  // #region tsconfig.json
  if (!config.compileToJS) {
    await copyFile(pathJoin(templatePath, 'tsconfig.json'), pathJoin(examplePath, 'tsconfig.json'));
  }
  // #endregion

  // #region README.md
  const exampleREADMEmd = templateREADMEmd.replace('/examples/_template', `/examples/${configID}`);
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
