import { Sandpack, SandpackFile, SandpackProps } from '@codesandbox/sandpack-react';
import { useColorMode } from '@docusaurus/theme-common';
import * as React from 'react';
import './SandpackRQB.scss';

export const SandpackRQB: React.FC<SandpackProps> = ({ children, customSetup, options }) => {
  const { isDarkTheme } = useColorMode();
  const codeSnippets = React.Children.toArray(children) as React.ReactElement[];
  const bkgdColor = isDarkTheme ? '#343a46' : '#ffffff';
  let hideStylesCSS = true;

  const files = codeSnippets.reduce(
    (result: Record<string, SandpackFile>, codeSnippet: React.ReactElement) => {
      if (codeSnippet.props.mdxType !== 'pre') {
        return result;
      }
      const { props } = codeSnippet.props.children;
      let filePath: string;
      let fileHidden = false;
      let fileActive = false;

      if (props.metastring) {
        const [name, ...params] = props.metastring.split(' ');
        filePath = '/' + name;
        if (params.includes('hidden')) {
          fileHidden = true;
        }
        if (params.includes('active')) {
          fileActive = true;
        }
        // isSingleFile = false;
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
      if (result[filePath]) {
        throw new Error(
          `File ${filePath} was defined multiple times. Each file snippet should have a unique path name.`
        );
      }
      if (filePath === '/styles.css' && !fileHidden) {
        hideStylesCSS = false;
      }
      result[filePath] = {
        code: props.children,
        hidden: fileHidden,
        active: fileActive,
      };

      return result;
    },
    {}
  );

  const rqbCSSimport = RegExp(`^import +'react-querybuilder/dist/query-builder\\.s?css';?$`).test(
    files['/App.tsx'].code
  )
    ? ''
    : `@import 'react-querybuilder/dist/query-builder.css';`;
  const sandboxStyle = `body { background-color: ${bkgdColor}; }`;

  files['/styles.css'] = {
    code: [rqbCSSimport, sandboxStyle, files['/styles.css']?.code ?? ''].join('\n\n'),
    hidden: hideStylesCSS,
  };

  const setup = {
    ...customSetup,
    dependencies: { ...customSetup?.dependencies, 'react-querybuilder': 'latest' },
  };

  return (
    <div className="sandpackrqb">
      <Sandpack
        files={files}
        theme={isDarkTheme ? 'monokai-pro' : undefined}
        template="react-ts"
        customSetup={setup}
        options={options}
      />
    </div>
  );
};
