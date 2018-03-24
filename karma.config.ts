// Karma configuration
// Generated on Sat Mar 24 2018 12:31:21 GMT+0530 (IST)

export = function(config: any) {
  config.set({
    basePath: '',
    // frameworks: ['mocha'],
    // frameworks: ['mocha', 'karma-typescript'],
    frameworks: ['mocha'],
    files: ['test/test.js'],
    exclude: [],
    preprocessors: {
      'test/test.js': 'webpack' // *.tsx for React Jsx
    },
    // reporters: ['progress', 'karma-typescript'],
    // reporters: ['progress'],
    reporters: ['spec'],
    port: 9876,
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeHeadless'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: 1,

    webpack: {
      // module: {
      //   // loaders: [{test: /\.tsx?$/, loader: 'ts-loader'}]
      // }
    },
    plugins: [
      require("karma-webpack"),
      require("karma-mocha"),
      require("karma-spec-reporter")
    ]
  })
}
