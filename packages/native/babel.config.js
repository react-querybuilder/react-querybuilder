module.exports = {
  plugins: ['babel-plugin-syntax-hermes-parser'],
  presets: [
    '@babel/env',
    '@babel/flow',
    ['@babel/react', { runtime: 'automatic' }],
    '@babel/typescript',
  ],
  env: { development: { compact: true }, test: { compact: true } },
};
