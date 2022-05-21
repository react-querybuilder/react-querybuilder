/* eslint-disable @typescript-eslint/no-var-requires */
import { createRequire } from 'module';
import { copyFile, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join as pathJoin } from 'node:path';
import prettier from 'prettier';
import { fileURLToPath } from 'url';
import configs from './compatExampleConfigs.mjs';
const require = createRequire(import.meta.url);
const prettierConfig = require('../.prettierrc.json');
const templatePkgJSON = require('./template/package.json');
const stableStringify = require('fast-json-stable-stringify');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const templatePath = pathJoin(__dirname, 'template');
const templatePublic = pathJoin(templatePath, 'public');
const templateSrc = pathJoin(templatePath, 'src');
const templateIndexHTML = (await readFile(pathJoin(templatePublic, 'index.html'))).toString(
  'utf-8'
);
const templateIndexTSX = (await readFile(pathJoin(templateSrc, 'index.tsx'))).toString('utf-8');
const templateIndexSCSS = (await readFile(pathJoin(templateSrc, 'index.scss'))).toString('utf-8');

for (const config of configs) {
  const examplePath = pathJoin(__dirname, config.id);
  const examplePublic = pathJoin(examplePath, 'public');
  const exampleSrc = pathJoin(examplePath, 'src');
  const exampleTitle = `React Query Builder ${config.name} Example`;
  await rm(examplePath, { recursive: true, force: true });
  await mkdir(examplePath);
  await mkdir(examplePublic);
  await mkdir(exampleSrc);

  // public/index.html
  await writeFile(
    pathJoin(examplePublic, 'index.html'),
    templateIndexHTML.replace('__TITLE__', exampleTitle)
  );

  // src/index.scss
  await writeFile(
    pathJoin(exampleSrc, 'index.scss'),
    templateIndexSCSS
      .replace('// __SCSS_PRE__', config.scssPre.join('\n'))
      .replace('// __SCSS_POST__', config.scssPost.join('\n'))
  );

  // src/index.tsx
  const baseImport = `import { ${
    config.id === 'bootstrap' ? `${config.id}ControlClassnames, ` : ''
  }${config.id}ControlElements } from '@react-querybuilder/${config.id}';`;
  const props = [
    `controlElements={${config.id}ControlElements}`,
    config.id === 'bootstrap' ? `controlClassnames={${config.id}ControlClassnames}` : '',
  ];
  await writeFile(
    pathJoin(exampleSrc, 'index.tsx'),
    templateIndexTSX
      .replace('// __IMPORTS__', [baseImport, ...config.tsxImports].join('\n'))
      .replace('// __ADDITIONAL_DECLARATIONS__', config.additionalDeclarations.join('\n'))
      .replace('// __WRAPPER_OPEN__', config.wrapperOpen)
      .replace('// __WRAPPER_CLOSE__', config.wrapperClose)
      .replace('// __RQB_PROPS__', props.join('\n'))
  );

  // package.json
  const examplePkgJSON = JSON.parse(JSON.stringify(templatePkgJSON));
  examplePkgJSON.name = `react-querybuilder-${config.id}-example`;
  examplePkgJSON.description = exampleTitle;
  examplePkgJSON.dependencies[`@react-querybuilder/${config.id}`] =
    templatePkgJSON.dependencies['react-querybuilder'];
  for (const [dep, version] of config.dependencies) {
    examplePkgJSON.dependencies[dep] = version;
  }
  await writeFile(pathJoin(examplePath, 'package.json'), stableStringify(examplePkgJSON));

  // tsconfig.json
  await copyFile(pathJoin(templatePath, 'tsconfig.json'), pathJoin(examplePath, 'tsconfig.json'));

  // Prettify everything
  for (const folderPath of [examplePath, examplePublic, exampleSrc]) {
    const fileList = (await readdir(folderPath, { withFileTypes: true }))
      .filter(dirent => dirent.isFile())
      .map(dirent => pathJoin(folderPath, dirent.name));
    for (const filePath of fileList) {
      const fileContents = (await readFile(filePath)).toString('utf-8');
      const prettified = prettier.format(fileContents, {
        ...prettierConfig,
        filepath: filePath,
        plugins: ['prettier-plugin-organize-imports'],
      });
      await writeFile(filePath, prettified);
    }
  }
}
