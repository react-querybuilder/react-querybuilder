import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import stableStringify from 'fast-json-stable-stringify';
import type { Options as PrettierOptions } from 'prettier';
import prettier from 'prettier';
import * as prettierPluginOrganizeImports from 'prettier-plugin-organize-imports';
import * as prettierPluginEstree from 'prettier/plugins/estree';
import { transformWithEsbuild } from 'vite';
import { configs } from './exampleConfigs.js';

interface PackageJSON {
  name: string;
  description: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
}

console.log('Generating/updating examples');

const rootPrettierConfig = await prettier.resolveConfig(import.meta.file);
const lernaJson = Bun.file(path.join(import.meta.dir, '../lerna.json'));
const { version } = await lernaJson.json();

const compileToJS = async (code: string, fileName: string) => {
  const compiled = await transformWithEsbuild(code, fileName, {
    minify: false,
    minifyWhitespace: false,
    jsx: 'preserve',
  });
  return compiled.code.replaceAll(/^(const|createRoot|\s+return)/gm, '\n\n$1');
};

const packagesPath = path.join(import.meta.dir, '../packages');
const templatePath = path.join(import.meta.dir, '_template');
const templateDotCS = path.join(templatePath, '.codesandbox');
const templateDotDC = path.join(templatePath, '.devcontainer');
const templateSrc = path.join(templatePath, 'src');
const templateDotCSTemplateJSON = await Bun.file(path.join(templateDotCS, 'template.json')).json();
const templateIndexHTML = await Bun.file(path.join(templatePath, 'index.html')).text();
const templateIndexTSX = await Bun.file(path.join(templateSrc, 'index.tsx')).text();
const templateAppTSX = await Bun.file(path.join(templateSrc, 'App.tsx')).text();
const templateStylesCSS = await Bun.file(path.join(templateSrc, 'styles.css')).text();
const templateREADMEmd = await Bun.file(path.join(templatePath, 'README.md')).text();

const templatePkgJsonNewTextRaw = await Bun.file(path.join(templatePath, 'package.json')).text();
const templatePkgJsonNewText = templatePkgJsonNewTextRaw.replaceAll(
  /("@?react-querybuilder(?:\/\w+)?": ").*?"/g,
  `$1${version}"`
);
await Bun.write(path.join(templatePath, 'package.json'), templatePkgJsonNewText);
const templatePkgJSON: PackageJSON = await Bun.file(path.join(templatePath, 'package.json')).json();

const generateExampleFromTemplate = async (exampleID: string) => {
  const exampleConfig = configs[exampleID];
  const examplePath = path.join(import.meta.dir, exampleID);
  const exampleDotCS = path.join(examplePath, '.codesandbox');
  const exampleDotDC = path.join(examplePath, '.devcontainer');
  const exampleSrc = path.join(examplePath, 'src');
  const exampleBaseTitle = `React Query Builder ${exampleConfig.name}`;
  const exampleTitle = `${exampleBaseTitle} Example`;
  const exampleTemplateName = `${exampleBaseTitle} Template`;
  await rm(examplePath, { recursive: true, force: true });
  await mkdir(examplePath);
  await Promise.all([mkdir(exampleDotCS), mkdir(exampleSrc)]);

  await Bun.write(
    path.join(examplePath, 'prettier.config.mjs'),
    Bun.file(path.join(templatePath, 'prettier.config.mjs'))
  );

  const examplePrettierConfig = await prettier.resolveConfig(
    path.join(examplePath, 'package.json')
  );
  const formatAndWrite = async (filepath: string, fileContents: string) => {
    let printWidth = examplePrettierConfig?.printWidth;

    if (filepath.endsWith('css')) {
      printWidth = rootPrettierConfig?.printWidth;
    }

    const prettierOptions: PrettierOptions = {
      ...examplePrettierConfig,
      ...(printWidth ? { printWidth } : {}),
      filepath,
      plugins: [
        prettierPluginOrganizeImports,
        // https://github.com/prettier/prettier/issues/16501
        prettierPluginEstree as prettier.Plugin,
      ],
    };

    return Bun.write(
      filepath,
      (await prettier.check(fileContents, prettierOptions))
        ? fileContents
        : await prettier.format(fileContents, prettierOptions)
    );
  };

  // Array of Bun.write promises
  const toWrite: ReturnType<typeof Bun.write>[] = [];

  // #region Straight copies
  toWrite.push(
    Bun.write(
      path.join(exampleDotCS, 'tasks.json'),
      Bun.file(path.join(templateDotCS, 'tasks.json'))
    ),
    Bun.write(
      path.join(exampleDotCS, 'workspace.json'),
      Bun.file(path.join(templateDotCS, 'workspace.json'))
    ),
    Bun.write(
      path.join(exampleDotDC, 'devcontainer.json'),
      Bun.file(path.join(templateDotDC, 'devcontainer.json'))
    ),
    Bun.write(
      path.join(examplePath, '.gitignore'),
      Bun.file(path.join(templatePath, '.gitignore'))
    ),
    Bun.write(
      path.join(examplePath, `vite.config.${exampleConfig.compileToJS ? 'j' : 't'}s`),
      Bun.file(path.join(templatePath, 'vite.config.ts'))
    ),
    ...(exampleConfig.compileToJS
      ? []
      : [
          Bun.write(
            path.join(exampleSrc, 'vite-env.d.ts'),
            Bun.file(path.join(templateSrc, 'vite-env.d.ts'))
          ),
          Bun.write(
            path.join(examplePath, 'tsconfig.json'),
            Bun.file(path.join(templatePath, 'tsconfig.json'))
          ),
        ])
  );
  // #endregion

  // #region /index.html
  const exampleIndexHTML = templateIndexHTML
    .replace('__TITLE__', exampleTitle)
    .replace('index.tsx', exampleConfig.compileToJS ? 'index.jsx' : 'index.tsx');
  toWrite.push(formatAndWrite(path.join(examplePath, 'index.html'), exampleIndexHTML));
  // #endregion

  // #region src/styles.css
  const processedTemplateCSS = templateStylesCSS
    .replace('/* __CSS_PRE__ */', exampleConfig.cssPre.join('\n'))
    .replace('/* __CSS_POST__ */', exampleConfig.cssPost.join('\n'));
  toWrite.push(formatAndWrite(path.join(exampleSrc, `styles.css`), processedTemplateCSS));
  // #endregion

  // #region src/index.tsx
  const exampleIndexSourceCode = exampleConfig.compileToJS
    ? await compileToJS(templateIndexTSX, 'index.tsx')
    : templateIndexTSX;
  toWrite.push(
    formatAndWrite(
      path.join(exampleSrc, `index.${exampleConfig.compileToJS ? 'j' : 't'}sx`),
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
    .replace('// __RQB_PROPS__', exampleConfig.props.join('\n'));
  const exampleAppSourceCode = exampleConfig.compileToJS
    ? await compileToJS(processedTemplateAppTSX, 'App.tsx')
    : processedTemplateAppTSX;
  toWrite.push(
    formatAndWrite(
      path.join(exampleSrc, `App.${exampleConfig.compileToJS ? 'j' : 't'}sx`),
      exampleAppSourceCode
    )
  );
  // #endregion

  // #region package.json
  const examplePkgJSON = structuredClone(templatePkgJSON);
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
      if (devDep.startsWith('@types/')) {
        delete examplePkgJSON.devDependencies[devDep];
      }
    }
  }
  if (exampleConfig.dependencyKeys.length > 0) {
    const compatPkgJson: PackageJSON = await Bun.file(
      path.join(packagesPath, `${exampleID}/package.json`)
    ).json();
    for (const depKey of exampleConfig.dependencyKeys) {
      if (Array.isArray(depKey)) {
        examplePkgJSON.dependencies[depKey[0]] = depKey[1];
      } else {
        examplePkgJSON.dependencies[depKey] = compatPkgJson.peerDependencies[depKey];
      }
    }
  }
  toWrite.push(
    formatAndWrite(path.join(examplePath, 'package.json'), stableStringify(examplePkgJSON))
  );
  // #endregion

  // #region .codesandbox/template.json
  const exampleDotCSTemplateJSON = {
    ...templateDotCSTemplateJSON,
    title: exampleTemplateName,
    description: exampleTemplateName,
  };
  toWrite.push(
    formatAndWrite(
      path.join(exampleDotCS, 'template.json'),
      stableStringify(exampleDotCSTemplateJSON)
    )
  );
  // #endregion

  // #region README.md
  const exampleREADMEmd =
    `## ${exampleTitle}` +
    '\n\n' +
    templateREADMEmd
      .replaceAll(/(\/?examples?[/-])?_template/g, `$1${exampleID}`)
      .replaceAll('App.tsx', exampleConfig.compileToJS ? 'App.jsx' : '$&') +
    '\n\n' +
    '> _Development note: Do not modify the files in this folder directly. Edit corresponding ' +
    'files in the [_template](../_template) folder and/or [exampleConfigs.ts](../exampleConfigs.ts), ' +
    'then run `bun generate-examples` from the repository root directory (requires [Bun](https://bun.sh/))._';
  toWrite.push(formatAndWrite(path.join(examplePath, 'README.md'), exampleREADMEmd));
  // #endregion

  console.log(`Generated "${exampleConfig.name}" example code (${exampleID})`);

  return Promise.all(toWrite);
};

// #region Other examples' package.json
const otherExamples = ['base-ui', 'ci', 'native', 'next', 'preact', 'tremor'] as const;

const updateOtherExample = async (otherExampleName: string) => {
  const otherExamplePkgJSON: PackageJSON = await Bun.file(
    path.join(import.meta.dir, `${otherExampleName}/package.json`)
  ).json();
  for (const dep of Object.keys(otherExamplePkgJSON.dependencies)) {
    if (/^@?react-querybuilder(\/[a-z]+)?/.test(dep)) {
      otherExamplePkgJSON.dependencies[dep] = templatePkgJSON.dependencies['react-querybuilder'];
    }
  }
  const otherExamplePkgJsonPath = path.join(import.meta.dir, `${otherExampleName}/package.json`);
  const otherExamplePrettierOptions = await prettier.resolveConfig(otherExamplePkgJsonPath);
  const otherExamplePkgJsonFileContents = await prettier.format(
    stableStringify(otherExamplePkgJSON),
    {
      ...otherExamplePrettierOptions,
      filepath: otherExamplePkgJsonPath,
      plugins: [
        prettierPluginOrganizeImports,
        // https://github.com/prettier/prettier/issues/16501
        prettierPluginEstree as prettier.Plugin,
      ],
    }
  );
  console.log(`Updated package.json for "${otherExampleName}" example`);
  return Bun.write(otherExamplePkgJsonPath, otherExamplePkgJsonFileContents);
};
// #endregion

const templateExamples = Object.keys(configs);

const results = await Promise.allSettled([
  ...templateExamples.map(v => generateExampleFromTemplate(v)),
  ...otherExamples.map(v => updateOtherExample(v)),
]);

for (const [idx, result] of results.entries()) {
  if (result.status === 'rejected') {
    const exampleName =
      idx >= templateExamples.length
        ? otherExamples[idx - templateExamples.length]
        : templateExamples[idx];
    console.log(
      `Failed to generate or format "${exampleName}" example. Reason: "${result.reason}"`
    );
  }
}

console.log('Finished generating/updating examples');
