module.exports = {
  plugins: process.env.NODE_ENV === 'test' ? [] : [['react-compiler', { target: '18' }]],
  presets: ['@babel/env', ['@babel/react', { runtime: 'automatic' }], '@babel/typescript'],
  env: { development: { compact: true }, test: { compact: true } },
};
