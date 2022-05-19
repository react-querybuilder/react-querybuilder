import { objectKeys } from 'react-querybuilder/src';

export type StyleName = 'default' | 'antd' | 'bootstrap' | 'bulma' | 'chakra' | 'material';

export const npmLink = 'https://www.npmjs.com/package/react-querybuilder';
export const docsLink = 'https://react-querybuilder.js.org';

export const styleNameMap: Record<StyleName, string> = {
  default: 'Default',
  bootstrap: 'Bootstrap',
  material: 'MUI/Material',
  antd: 'Ant Design',
  chakra: 'Chakra UI',
  bulma: 'Bulma',
};

const { default: _d, ...compatStyles } = styleNameMap;

export const styleNameArray: StyleName[] = ['default', ...objectKeys(compatStyles).sort()];
