/// <reference types="bun-types" />

import type { ESLint as _ESLint } from 'eslint';
import stableStringify from 'fast-json-stable-stringify';
import { mkdir, rm } from 'fs/promises';
// import glob from 'glob';
import { join as pathJoin } from 'path';
// import prettier from 'prettier';
import { transformWithEsbuild } from 'vite';
import { configs } from './exampleConfigs.js';

// Seems like this should be unnecessary...
declare module 'bun' {
  interface BunFile {
    json(): Promise<any>;
  }
}

type ESLintExtendsIsArray = _ESLint.ConfigData & { extends: string[] };

interface PackageJSON {
  name: string;
  description: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
}

console.log('Generating/updating examples');

// const rootPrettierConfig = await prettier.resolveConfig(__filename);
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

const noTypeScriptESLint = (/** @type {string} */ s) => !/@typescript-eslint/.test(s);

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

const generateCommonExample = (exampleID: string) => async () => {
  const exampleConfig = configs[exampleID];
  const examplePath = pathJoin(import.meta.dir, exampleID);
  const exampleDotCS = pathJoin(examplePath, '.codesandbox');
  const exampleSrc = pathJoin(examplePath, 'src');
  const exampleTitle = `React Query Builder ${exampleConfig.name} Example`;
  await rm(examplePath, { recursive: true, force: true });
  await mkdir(examplePath), await Promise.all([await mkdir(exampleDotCS), await mkdir(exampleSrc)]);

  // #region /index.html
  const exampleIndexHTML = templateIndexHTML
    .replace('__TITLE__', exampleTitle)
    .replace('index.tsx', exampleConfig.compileToJS ? 'index.jsx' : 'index.tsx');
  await Bun.write(pathJoin(examplePath, 'index.html'), exampleIndexHTML);
  // #endregion

  // #region src/index.scss
  const processedTemplateSCSS = templateStylesSCSS
    .replace('// __SCSS_PRE__', exampleConfig.scssPre.join('\n'))
    .replace('// __SCSS_POST__', exampleConfig.scssPost.join('\n'))
    .replace(/((query-builder\.)s(css))/g, exampleConfig.compileToJS ? '$2$3' : '$1');
  await Bun.write(
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
  await Bun.write(
    pathJoin(exampleSrc, `index.${exampleConfig.compileToJS ? 'j' : 't'}sx`),
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
  await Bun.write(
    pathJoin(exampleSrc, `App.${exampleConfig.compileToJS ? 'j' : 't'}sx`),
    exampleAppSourceCode
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
  await Bun.write(pathJoin(examplePath, 'package.json'), stableStringify(examplePkgJSON));
  // #endregion

  // #region tsconfig.json
  if (!exampleConfig.compileToJS) {
    await Promise.all([
      await Bun.write(
        pathJoin(exampleSrc, 'vite-env.d.ts'),
        Bun.file(pathJoin(templateSrc, 'vite-env.d.ts'))
      ),
      await Bun.write(
        pathJoin(examplePath, 'tsconfig.json'),
        Bun.file(pathJoin(templatePath, 'tsconfig.json'))
      ),
      await Bun.write(
        pathJoin(examplePath, 'tsconfig.node.json'),
        Bun.file(pathJoin(templatePath, 'tsconfig.node.json'))
      ),
    ]);
  }
  // #endregion

  // #region Straight copies
  await Promise.all([
    await Bun.write(
      pathJoin(exampleDotCS, 'workspace.json'),
      Bun.file(pathJoin(templateDotCS, 'workspace.json'))
    ),
    await Bun.write(
      pathJoin(examplePath, '.prettierrc'),
      Bun.file(pathJoin(templatePath, '.prettierrc'))
    ),
    await Bun.write(
      pathJoin(examplePath, '.gitignore'),
      Bun.file(pathJoin(templatePath, '.gitignore'))
    ),
    await Bun.write(
      pathJoin(examplePath, 'vite.config.ts'),
      Bun.file(pathJoin(templatePath, 'vite.config.ts'))
    ),
  ]);
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
  await Bun.write(
    pathJoin(examplePath, '.eslintrc.json'),
    // prettier.format(
    stableStringify(exampleESLintRC)
    //, { filepath: 'f.json' })
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
  await Bun.write(pathJoin(examplePath, 'README.md'), exampleREADMEmd);
  // #endregion

  // This section is commented out until Bun doesn't segfault when a prettier plugin is used
  // // #region Prettify this example
  // const fileList = glob.sync(`examples/${exampleID}/**/*.{ts,tsx,js,jsx,json,css,scss,html,md}`);
  // for (const filepath of fileList) {
  //   const fileContents = await Bun.file(filepath).text();
  //   const printWidth = filepath.endsWith('css')
  //     ? rootPrettierConfig?.printWidth
  //     : (await prettier.resolveConfig(filepath))?.printWidth;
  //   const { plugins: _p, ...rpc } = rootPrettierConfig ?? {};
  //   const prettierOptions: prettier.Options = {
  //     ...rpc,
  //     printWidth,
  //     filepath,
  //     // plugins: ['prettier-plugin-organize-imports'],
  //   };
  //   const alreadyPretty = prettier.check(fileContents, prettierOptions);
  //   if (!alreadyPretty) {
  //     const prettified = prettier.format(fileContents, prettierOptions);
  //     await Bun.write(filepath, prettified);
  //   }
  // }
  // // #endregion

  console.log(`Generated "${exampleConfig.name}" example (${exampleID})`);
};

// #region Other examples' package.json
const otherExamples = ['ci', 'native'];

const updateOtherExample = (otherExampleName: string) => async () => {
  const otherExamplePkgJSON: PackageJSON = await Bun.file(
    pathJoin(import.meta.dir, `${otherExampleName}/package.json`)
  ).json();
  for (const dep of Object.keys(otherExamplePkgJSON.dependencies)) {
    if (/^@?react-querybuilder(\/[a-z]+)?/.test(dep)) {
      otherExamplePkgJSON.dependencies[dep] = templatePkgJSON.dependencies['react-querybuilder'];
    }
  }
  const otherExamplePkgJsonPath = pathJoin(import.meta.dir, `${otherExampleName}/package.json`);
  // const otherExamplePrettierOptions = await prettier.resolveConfig(otherExamplePkgJsonPath);
  const otherExamplePkgJsonFileContents =
    // prettier.format(
    stableStringify(otherExamplePkgJSON);
  //   , {
  //   ...otherExamplePrettierOptions,
  //   filepath: otherExamplePkgJsonPath,
  // });
  await Bun.write(otherExamplePkgJsonPath, otherExamplePkgJsonFileContents);
  console.log(`Updated package.json for "${otherExampleName}" example`);
};

await Promise.all([
  ...Object.keys(configs).map(async ex => generateCommonExample(ex)()),
  ...otherExamples.map(async ex => updateOtherExample(ex)()),
]);

console.log('Finished generating/updating examples');
// #endregion
