/* eslint-disable const/no-extraneous-dependencies */

const browserSync = require('browser-sync');
const historyApiFallback = require('connect-history-api-fallback');
const gulp = require('gulp');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const serverApiMiddleware = require('../middleware/api');
const config = require('../../webpack.config.dev');
const getCurAppName = require('../shared/getCurAppName');

gulp.task('serve:build', ['build'], (callback) => {
  // Run Browsersync
  browserSync({
    port: 3000,
    ui: {
      port: 3001,
    },
    server: {
      baseDir: 'build',
    },

    files: [
      'build/*.html',
    ],

    middleware: [
      {
        route: '/goform',
        handle: serverApiMiddleware(),
      },
      historyApiFallback(),
    ],
  });

  callback();
});

gulp.task('serve:dev', (callback) => {
  const bundler = webpack(config);
  const currAppName = getCurAppName();

  // Run Browsersync and use middleware for Hot Module Replacement
  browserSync({
    server: {
      baseDir: ['src', 'src/assets', `src/config/${currAppName}/assets`],
      index: 'index.html',
      middleware: [
        {
          route: '/goform',
          handle: serverApiMiddleware(),
        },
        webpackDevMiddleware(bundler, {
          // Dev middleware can't access config, so we provide publicPath
          publicPath: config.output.publicPath,
        // lazy: true,
          // pretty colored output
          stats: { colors: true },

          // Set to false to display a list of each file that is being bundled.
          noInfo: true,

          // for other settings see
          // http://webpack.github.io/docs/webpack-dev-middleware.html
        }),

        // bundler should be the same as above
        webpackHotMiddleware(bundler),

        historyApiFallback(),

      ],
    },
    // no need to watch '*.js' here, webpack will take care of it for us,
    // including full page reloads if HMR won't work
    files: [
      'src/index.html',
      'tools/data/*.json',
      'src/assets/**/*',
    ],
  });

  callback();
});
