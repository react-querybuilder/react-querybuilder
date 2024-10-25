/* eslint-disable unicorn/prefer-module */
module.exports = {
  plugins: [['react-compiler', { target: '18' }]],
  presets: [require.resolve('@docusaurus/core/lib/babel/preset')],
};
