module.exports = {
  plugins: [
    'babel-plugin-syntax-hermes-parser',
    ...(process.env.NODE_ENV === 'test' ? [] : [['react-compiler', { target: '18' }]]),
  ],
  presets: [
    '@babel/env',
    '@babel/flow',
    ['@babel/react', { runtime: 'automatic' }],
    '@babel/typescript',
  ],
  env: { development: { compact: true }, test: { compact: true } },
};
