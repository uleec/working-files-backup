const gulp = require('gulp');
const gutil = require('gulp-util');
const staticHash = require('gulp-static-hash');
const runSequence = require('run-sequence');
const $ = require('gulp-load-plugins')();
const webpack = require('webpack');
const webpackConfig = require('../../webpack.config.production.js');
const webpackConfigDll = require('../../webpack.config.dll.js');
const getCurAppName = require('../shared/getCurAppName');

const paths = gulp.paths;

// 引用webpack对js进行操作
gulp.task('webpack', (callback) => {
  webpack(webpackConfig, (err, stats) => {
    if (err || stats.hasErrors()) {
      throw new gutil.PluginError('webpack:production', err);
    }
    gutil.log('[webpack:production]', stats.toString({
      colors: true,
    }));
    callback();
  });
});

gulp.task('webpack:dll', (callback) => {
  webpack(webpackConfigDll, (err, stats) => {
    if (err || stats.hasErrors()) {
      throw new gutil.PluginError('webpack:production', err);
    }
    gutil.log('[webpack:production]', stats.toString({
      colors: true,
    }));
    callback();
  });
});

gulp.task('build:assets', () => {
  const srcFiles = [`${paths.src}/assets/**/*`];

  if (!gulp.appName) {
    gulp.appName = getCurAppName('axc');
  }

  gutil.log('正在构建的产品： ', gutil.colors.magenta(gulp.appName));

  // copy custom assets
  srcFiles.push(`${paths.src}/config/${gulp.appName}/assets/**/*`);

  return gulp.src(srcFiles)
    .pipe(gulp.dest(paths.build));
},
);

gulp.task('build:html', () =>
  gulp.src(`${paths.build}/index.html`)
    .pipe(staticHash({ asset: 'static' }))
    .pipe(gulp.dest(paths.build)),
);

gulp.task('build:header', () =>
  gulp.src(`${paths.build}/scripts/bundle.js`)
    .pipe($.header(`var a_165F8BA5ABE1A5DA = 0;var v_165F8BA5ABE1A5DA = "${gulp.pkg.version}";`))
    .pipe(gulp.dest(`${paths.build}/scripts/`)),
);
gulp.task('build:complete', () => {
  const configReg = /'\.\/config\/(\w+)'/g;

  return gulp.src(paths.pubWebpack)
    .pipe($.replace(configReg, "publicPath: '/'"))
    .pipe(gulp.dest('./'));
});
gulp.task('build', (callback) => {
  runSequence(
    'clean',
    ['build:assets', 'webpack'],
    'build:complete',
    callback,
  );
});
