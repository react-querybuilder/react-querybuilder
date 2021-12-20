/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  projects: ['packages/react-querybuilder', 'packages/bootstrap', 'packages/bulma'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
};
