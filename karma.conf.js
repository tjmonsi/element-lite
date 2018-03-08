// Karma configuration
const path = require('path');

module.exports = function (config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],

    // list of files / patterns to load in the browser
    files: [
      {
        pattern: './node_modules/@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js',
        included: true,
        watched: false
      },
      {
        pattern: './node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js',
        included: true,
        watched: false
      },
      {
        pattern: './test/*.test.js',
        included: false,
        watched: true
      },
      {
        pattern: './test/index.js',
        included: true,
        watched: true
      }
    ],

    webpack: {
      mode: 'development',
      resolve: {
        modules: [
          path.resolve(__dirname, './node_modules')
        ]
      },
      module: {
        rules: [
          {
            // If you see a file that ends in .js, just send it to the babel-loader.
            test: /\.js$/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [[
                  'env'
                ]],
                plugins: [
                  'babel-plugin-syntax-dynamic-import',
                  ['transform-object-rest-spread', {useBuiltIns: true}]
                ]
              }
            }
          }
        ]
      }
    },

    webpackMiddleware: {
      // webpack-dev-middleware configuration
      noInfo: true
    },

    // list of files to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      './test/index.js': ['webpack']
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  });
};
