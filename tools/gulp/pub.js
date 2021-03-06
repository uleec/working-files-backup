const del = require('del');
const gulp = require('gulp');
const gutil = require('gulp-util');
const runSequence = require('run-sequence');
const $ = require('gulp-load-plugins')();
const argv = require('minimist')(process.argv.slice(2));
const zip = require('gulp-zip');
const getCurAppName = require('../shared/getCurAppName');

const paths = gulp.paths;

// 发布硬AC版本
// 发布 AXC版本
gulp.task('pub:clean', () => {
  let distPath = paths.pub;

  if (argv.d) {
    distPath = argv.d;
  }

  return del([distPath], {
    force: true,
  });
});

gulp.task('pub:build', (callback) => {
  // 产品系列：axc（默认值）, ap, ac
  let productSeries = 'axc';

  if (!gulp.appName) {
    gulp.appName = getCurAppName('axc');
  }

  if (gulp.appName && gulp.appName.indexOf('axc') !== 0) {
    productSeries = gulp.appName;
  }

  // 只有在 AXC 系列才需要做，goform 路径相关替换
  if (productSeries === 'axc') {
    return gulp.src([`${paths.build}/scripts/**/*`])
      .pipe($.replace(/(\/?)goform\//g, 'index.php/goform/'))
      .pipe($.replace('/~zhangfang/axc/', ''))
      .pipe(gulp.dest(`${paths.build}/scripts/`));
  }
  return callback();
});

gulp.task('pub:copy', () => {
  const srcPaths = [`${paths.build}/**/*`];
  let distPath = paths.pub;
  let name = 'axc';

  if (!gulp.appName) {
    gulp.appName = getCurAppName('axc');
  }

  // 如果是 AXC 系列, 需要拷贝 PHP
  if (gulp.appName && gulp.appName.indexOf('axc') === 0) {
    srcPaths.push(`${paths.src}/config/axc/assets/**/*`);
    srcPaths.push(`${paths.php}/**/*`);
  }

  if (argv.d) {
    distPath = argv.d;
  }

  if (argv.n) {
    name = argv.n;
  }

  if (argv.z) {
    return gulp.src(srcPaths)
      .pipe(gulp.dest(distPath))
      .pipe(zip(`${name}.zip`))
      .pipe(gulp.dest(paths.tmp));
  }

  return gulp.src(srcPaths)
    .pipe(gulp.dest(distPath));
});


gulp.task('pub', (callback) => {
  let distPath = paths.pub;

  if (argv.d) {
    distPath = argv.d;
  }

  gutil.log('切换发布目标目录：', gutil.colors.magenta(distPath));

  runSequence(['pub:clean', 'test'], 'config', 'pub:path', ['build'], 'pub:build', 'pub:copy', callback);
});
