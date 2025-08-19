module.exports = {
  presets: ['@babel/env', ['@babel/react', { runtime: 'automatic' }], '@babel/typescript'],
  env: { development: { compact: true }, test: { compact: true } },
};
