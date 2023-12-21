import common from '../../jest.common.mjs';

/** @type {import('@jest/types').Config.InitialOptions} */
export default {
  ...common,
  coveragePathIgnorePatterns: [...common.coveragePathIgnorePatterns, 'dayjs'],
  displayName: 'antd',
  transformIgnorePatterns: ['/node_modules/(?!antd|@ant-design|rc-.+?|@babel/runtime).+(js|jsx)$'],
};
