/// <reference types="bun-types" />

import type { ESLint } from 'eslint';
import stableStringify from 'fast-json-stable-stringify';
import { mkdir, rm } from 'fs/promises';
import { join as pathJoin } from 'path';
import prettier, { type Options as PrettierOptions } from 'prettier';
import { transformWithEsbuild } from 'vite';
import { configs } from './exampleConfigs.js';

type ESLintExtendsIsArray = ESLint.ConfigData & { extends: string[] };

interface PackageJSON {
  name: string;
  description: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
}

console.log('Generating/updating examples');

const rootNodeModulesPath = pathJoin(import.meta.dir, '../node_modules');
const rootPrettierConfig = await prettier.resolveConfig(import.meta.file);
const lernaJson = Bun.file(pathJoin(import.meta.dir, '../lerna.json'));
const { version } = await lernaJson.json();
const eslintrc: ESLintExtendsIsArray = await Bun.file(
  pathJoin(import.meta.dir, '../.eslintrc.json')
).json();

const compileToJS = async (code: string, fileName: string) =>
  (
    await transformWithEsbuild(code, fileName, {
      minify: false,
      minifyWhitespace: false,
      jsx: 'preserve',
    })
  ).code.replace(/^(const|createRoot|\s+return)/gm, '\n\n$1');

const noTypeScriptESLint = (s: string) => !/@typescript-eslint/.test(s);

const packagesPath = pathJoin(import.meta.dir, '../packages');
const templatePath = pathJoin(import.meta.dir, '_template');
const templateDotCS = pathJoin(templatePath, '.codesandbox');
const templateSrc = pathJoin(templatePath, 'src');
const templateIndexHTML = await Bun.file(pathJoin(templatePath, 'index.html')).text();
const templateIndexTSX = await Bun.file(pathJoin(templateSrc, 'index.tsx')).text();
const templateAppTSX = await Bun.file(pathJoin(templateSrc, 'App.tsx')).text();
const templateStylesSCSS = await Bun.file(pathJoin(templateSrc, 'styles.scss')).text();
const templateREADMEmd = await Bun.file(pathJoin(templatePath, 'README.md')).text();

const templatePkgJsonNewText = (
  await Bun.file(pathJoin(templatePath, 'package.json')).text()
).replace(/("@?react-querybuilder(?:\/\w+)?": ").*?"/g, `$1^${version}"`);
await Bun.write(pathJoin(templatePath, 'package.json'), templatePkgJsonNewText);
const templatePkgJSON: PackageJSON = await Bun.file(pathJoin(templatePath, 'package.json')).json();

const generateExampleFromTemplate = async (exampleID: string) => {
  const exampleConfig = configs[exampleID];
  const examplePath = pathJoin(import.meta.dir, exampleID);
  const exampleDotCS = pathJoin(examplePath, '.codesandbox');
  const exampleSrc = pathJoin(examplePath, 'src');
  const exampleTitle = `React Query Builder ${exampleConfig.name} Example`;
  await rm(examplePath, { recursive: true, force: true });
  await mkdir(examplePath);
  await Promise.all([mkdir(exampleDotCS), mkdir(exampleSrc)]);

  await Bun.write(
    pathJoin(examplePath, '.prettierrc'),
    Bun.file(pathJoin(templatePath, '.prettierrc'))
  );

  const examplePrettierConfig = await prettier.resolveConfig(pathJoin(examplePath, 'package.json'));
  const formatAndWrite = (filepath: string, fileContents: string) => {
    let printWidth = examplePrettierConfig?.printWidth;

    if (filepath.endsWith('css')) {
      printWidth = rootPrettierConfig?.printWidth;
    }

    const prettierOptions: PrettierOptions = {
      ...examplePrettierConfig,
      ...(printWidth ? { printWidth } : {}),
      filepath,
      pluginSearchDirs: [rootNodeModulesPath],
    };

    return Bun.write(
      filepath,
      prettier.check(fileContents, prettierOptions)
        ? fileContents
        : prettier.format(fileContents, prettierOptions)
    );
  };

  // Array of Bun.write promises
  const toWrite: ReturnType<typeof Bun.write>[] = [];

  // #region Straight copies
  toWrite.push(
    Bun.write(
      pathJoin(exampleDotCS, 'tasks.json'),
      Bun.file(pathJoin(templateDotCS, 'tasks.json'))
    ),
    Bun.write(
      pathJoin(exampleDotCS, 'workspace.json'),
      Bun.file(pathJoin(templateDotCS, 'workspace.json'))
    ),
    Bun.write(pathJoin(examplePath, '.gitignore'), Bun.file(pathJoin(templatePath, '.gitignore'))),
    Bun.write(
      pathJoin(examplePath, `vite.config.${exampleConfig.compileToJS ? 'j' : 't'}s`),
      Bun.file(pathJoin(templatePath, 'vite.config.ts'))
    ),
    ...(exampleConfig.compileToJS
      ? []
      : [
          Bun.write(
            pathJoin(exampleSrc, 'vite-env.d.ts'),
            Bun.file(pathJoin(templateSrc, 'vite-env.d.ts'))
          ),
          Bun.write(
            pathJoin(examplePath, 'tsconfig.json'),
            Bun.file(pathJoin(templatePath, 'tsconfig.json'))
          ),
        ])
  );
  // #endregion

  // #region /index.html
  const exampleIndexHTML = templateIndexHTML
    .replace('__TITLE__', exampleTitle)
    .replace('index.tsx', exampleConfig.compileToJS ? 'index.jsx' : 'index.tsx');
  toWrite.push(formatAndWrite(pathJoin(examplePath, 'index.html'), exampleIndexHTML));
  // #endregion

  // #region src/index.scss
  const processedTemplateSCSS = templateStylesSCSS
    .replace('// __SCSS_PRE__', exampleConfig.scssPre.join('\n'))
    .replace('// __SCSS_POST__', exampleConfig.scssPost.join('\n'))
    .replace(/((query-builder\.)s(css))/g, exampleConfig.compileToJS ? '$2$3' : '$1');
  toWrite.push(
    formatAndWrite(
      pathJoin(exampleSrc, `styles.${exampleConfig.compileToJS ? '' : 's'}css`),
      processedTemplateSCSS
    )
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
  toWrite.push(
    formatAndWrite(
      pathJoin(exampleSrc, `index.${exampleConfig.compileToJS ? 'j' : 't'}sx`),
      exampleIndexSourceCode
    )
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
  toWrite.push(
    formatAndWrite(
      pathJoin(exampleSrc, `App.${exampleConfig.compileToJS ? 'j' : 't'}sx`),
      exampleAppSourceCode
    )
  );
  // #endregion

  // #region package.json
  const examplePkgJSON = JSON.parse(JSON.stringify(templatePkgJSON));
  examplePkgJSON.name = `react-querybuilder-${exampleID}-example`;
  examplePkgJSON.description = exampleTitle;
  if (exampleConfig.isCompatPackage || exampleConfig.enableDnD) {
    examplePkgJSON.dependencies[`@react-querybuilder/${exampleID}`] =
      templatePkgJSON.dependencies['react-querybuilder'];
  }
  if (exampleConfig.compileToJS) {
    delete examplePkgJSON.devDependencies['sass'];
    delete examplePkgJSON.devDependencies['typescript'];
    for (const devDep of Object.keys(examplePkgJSON.devDependencies)) {
      if (devDep.match(/^@types(?:cript-eslint)?\//)) {
        delete examplePkgJSON.devDependencies[devDep];
      }
    }
  }
  for (const depKey of exampleConfig.dependencyKeys) {
    const compatPkgJson: PackageJSON = await Bun.file(
      pathJoin(packagesPath, `${exampleID}/package.json`)
    ).json();
    if (Array.isArray(depKey)) {
      examplePkgJSON.dependencies[depKey[0]] = depKey[1];
    } else {
      examplePkgJSON.dependencies[depKey] = compatPkgJson.peerDependencies[depKey];
    }
  }
  toWrite.push(
    formatAndWrite(pathJoin(examplePath, 'package.json'), stableStringify(examplePkgJSON))
  );
  // #endregion

  // #region .eslintrc.json
  const exampleESLintRC: typeof eslintrc = JSON.parse(JSON.stringify(eslintrc));
  delete exampleESLintRC.env?.node;
  delete exampleESLintRC.ignorePatterns;
  if (exampleConfig.compileToJS) {
    exampleESLintRC.extends = exampleESLintRC.extends.filter(noTypeScriptESLint);
    exampleESLintRC.plugins = exampleESLintRC.plugins?.filter(noTypeScriptESLint);
    delete exampleESLintRC.parser;
    for (const rule of Object.keys(exampleESLintRC.rules ?? {})) {
      if (rule.match(/^@types(?:cript-eslint)?\//)) {
        delete exampleESLintRC.rules?.[rule];
      }
    }
  }
  toWrite.push(
    formatAndWrite(pathJoin(examplePath, '.eslintrc.json'), stableStringify(exampleESLintRC))
  );
  // #endregion

  // #region README.md
  const exampleREADMEmd =
    `## ${exampleTitle}` +
    '\n\n' +
    templateREADMEmd
      .replace(/\/examples\/_template/g, `/examples/${exampleID}`)
      .replace(/App.tsx/g, exampleConfig.compileToJS ? 'App.jsx' : '$&') +
    '\n\n' +
    '> _Development note: Do not modify the files in this folder directly. Edit corresponding ' +
    'files in the [_template](../_template) folder and/or [exampleConfigs.ts](../exampleConfigs.ts), ' +
    'then run `bun generate-examples` from the repository root directory (requires [Bun](https://bun.sh/))._';
  toWrite.push(formatAndWrite(pathJoin(examplePath, 'README.md'), exampleREADMEmd));
  // #endregion

  console.log(`Generated "${exampleConfig.name}" example code (${exampleID})`);

  return Promise.all(toWrite);
};

// #region Other examples' package.json
const otherExamples = ['ci', 'native', 'next', 'tremor'] as const;

const updateOtherExample = async (otherExampleName: string) => {
  const otherExamplePkgJSON: PackageJSON = await Bun.file(
    pathJoin(import.meta.dir, `${otherExampleName}/package.json`)
  ).json();
  for (const dep of Object.keys(otherExamplePkgJSON.dependencies)) {
    if (/^@?react-querybuilder(\/[a-z]+)?/.test(dep)) {
      otherExamplePkgJSON.dependencies[dep] = templatePkgJSON.dependencies['react-querybuilder'];
    }
  }
  const otherExamplePkgJsonPath = pathJoin(import.meta.dir, `${otherExampleName}/package.json`);
  const otherExamplePrettierOptions = await prettier.resolveConfig(otherExamplePkgJsonPath);
  const otherExamplePkgJsonFileContents = prettier.format(stableStringify(otherExamplePkgJSON), {
    ...otherExamplePrettierOptions,
    filepath: otherExamplePkgJsonPath,
    pluginSearchDirs: [rootNodeModulesPath],
  });
  console.log(`Updated package.json for "${otherExampleName}" example`);
  return Bun.write(otherExamplePkgJsonPath, otherExamplePkgJsonFileContents);
};
// #endregion

const templateExamples = Object.keys(configs);

const results = await Promise.allSettled([
  ...templateExamples.map(generateExampleFromTemplate),
  ...otherExamples.map(updateOtherExample),
]);

results.forEach((result, idx) => {
  if (result.status === 'rejected') {
    const exampleName =
      idx >= templateExamples.length
        ? otherExamples[idx - templateExamples.length]
        : templateExamples[idx];
    console.log(
      `Failed to generate or format "${exampleName}" example. Reason: "${result.reason}"`
    );
  }
});

console.log('Finished generating/updating examples');
