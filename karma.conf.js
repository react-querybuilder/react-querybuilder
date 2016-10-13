process.env.BABEL_ENV = 'test'; // Set the proper environment for babel
const testFileGlob = 'lib/**/*.test.js';


module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['mocha', 'chai', 'es6-shim'],

        files: [
            testFileGlob
        ],
        exclude: [],


        preprocessors: {
            [testFileGlob]: ['webpack']
        },
        webpack: require('./config/webpack-test.config'),
        webpackMiddleware: {noInfo: true},


        reporters: ['mocha', 'coverage'],
        coverageReporter: {
            dir: 'coverage',
            reporters: [
                {type: 'html', subdir: 'html'},
                {type: 'text-summary'},
                {'type': 'lcov'}
            ],
            includeAllSources: true,
            instrumenterOptions: {
                istanbul: {noCompact: true}
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
