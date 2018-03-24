process.env.BABEL_ENV = 'test'; // Set the proper environment for babel


module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['mocha', 'chai', 'es6-shim'],

        files: [
            'tests.webpack.js',
        ],
        exclude: [],


        preprocessors: {
            'tests.webpack.js': ['webpack', 'sourcemap']
        },
        webpack: require('./config/webpack-test.config'),
        webpackMiddleware: {
            stats: 'errors-only'
        },


        reporters: ['mocha', 'coverage'],
        coverageReporter: {
            dir: 'coverage',
            reporters: [
                { type: 'html', subdir: 'html' },
                { type: 'text-summary' },
                { 'type': 'lcov' }
            ],
            includeAllSources: true,
            instrumenterOptions: {
                istanbul: { noCompact: true }
            }
        },


        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: ['PhantomJS'],
        singleRun: true,
        concurrency: Infinity
    })
};
