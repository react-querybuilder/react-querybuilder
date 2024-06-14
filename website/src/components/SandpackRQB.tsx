import type { SandpackFile, SandpackProps } from '@codesandbox/sandpack-react';
import { Sandpack } from '@codesandbox/sandpack-react';
import { useColorMode } from '@docusaurus/theme-common';
import * as React from 'react';
import './SandpackRQB.scss';

interface SandpackRQBProps extends SandpackProps {
  children: React.ReactNode;
  rqbVersion?: 4 | 5 | 6 | 7;
}

export const SandpackRQB = ({
  children,
  customSetup,
  options,
  rqbVersion = 7,
}: SandpackRQBProps) => {
  const isDarkTheme = useColorMode().colorMode === 'dark';
  const codeSnippets = React.Children.toArray(children) as React.ReactElement[];
  const bkgdColor = isDarkTheme ? '#343a46' : '#ffffff';
  let hideStylesCSS = true;

  const files: Record<string, SandpackFile> = {};

  for (const codeSnippet of codeSnippets) {
    const { props } = codeSnippet.props.children;
    let filePath: string;
    let fileHidden = false;
    let fileActive = false;

    if (props.metastring) {
      const [name, ...params] = props.metastring.split(' ');
      filePath = '/' + name;
      fileHidden = params.includes('hidden');
      fileActive = params.includes('active');
    } else {
      if (props.className === 'language-tsx') {
        filePath = '/App.tsx';
      } else if (props.className === 'language-js') {
        filePath = '/App.js';
      } else if (props.className === 'language-css') {
        filePath = '/styles.css';
      } else {
        throw new Error(`Code block is missing a filename: ${props.children}`);
      }
    }
    if (files[filePath]) {
      throw new Error(
        `File ${filePath} was defined multiple times. Each file snippet should have a unique path name.`
      );
    }
    if (filePath === '/styles.css' && !fileHidden) {
      hideStylesCSS = false;
    }
    files[filePath] = {
      code: props.children,
      hidden: fileHidden,
      active: fileActive,
    };
  }

  const rqbCSSimport = RegExp(`^import +'react-querybuilder/dist/query-builder\\.s?css';?$`).test(
    files['/App.tsx']?.code
  )
    ? ''
    : `@import 'react-querybuilder/dist/query-builder.css';`;
  const sandboxStyle = `
body {
  background-color: ${bkgdColor};
}
pre {
  padding: 1rem;
  background-color: white;
  border: 1px solid lightgray;
  border-radius: 0.25rem;
  white-space: pre-wrap;
}
${
  isDarkTheme
    ? `
h1, h2, h3, h4, h5, h6 {
  color: white;
}`
    : ''
}`;

  files['/styles.css'] = {
    code: [rqbCSSimport, sandboxStyle, files['/styles.css']?.code ?? ''].join('\n\n'),
    hidden: hideStylesCSS,
  };

  // files['/styles.scss'] = {
  //   code: files['/styles.scss']?.code ?? '',
  //   hidden: hideStylesCSS,
  // };

  const rqbDependencies: Record<string, string> =
    rqbVersion === 4
      ? { 'react-querybuilder': '^4' }
      : {
          '@react-querybuilder/dnd': `^${rqbVersion || '7'}`,
          'react-querybuilder': `^${rqbVersion || '7'}`,
          'react-dnd': '>=14',
          'react-dnd-html5-backend': '>=14',
        };

  const setup = {
    ...customSetup,
    // dependencies: { sass: '*', ...customSetup?.dependencies, ...rqbDependencies },
    dependencies: { ...customSetup?.dependencies, ...rqbDependencies },
  };

  return (
    <div key={`v${rqbVersion}`} className="sandpackrqb">
      <Sandpack
        files={files}
        theme={isDarkTheme ? 'dark' : undefined}
        template="vite-react-ts"
        customSetup={setup}
        options={options}
      />
    </div>
  );
};
