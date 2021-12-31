import { Sandpack } from '@codesandbox/sandpack-react';
import useThemeContext from '@theme/hooks/useThemeContext';
import * as React from 'react';
import './SandpackRQB.scss';

export const SandpackRQB: React.FC = ({ children }) => {
  const { isDarkTheme } = useThemeContext();
  const appCode = (React.Children.toArray(children) as React.ReactElement[])[0].props.children.props
    .children as string;
  const bkgdColor = isDarkTheme ? '#343a46' : 'white';

  return (
    <div className="sandpackrqb">
      <Sandpack
        files={{
          '/App.tsx': appCode,
          '/styles.css': {
            code: `body{background-color:${bkgdColor};}`,
            hidden: true,
          },
        }}
        theme={isDarkTheme ? 'monokai-pro' : undefined}
        template="react-ts"
        customSetup={{
          dependencies: {
            'react-querybuilder': '4.0.0',
          },
        }}
      />
    </div>
  );
};
