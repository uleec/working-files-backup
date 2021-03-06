const gulp = require('gulp');
const gutil = require('gulp-util');
const rename = require('gulp-rename');
const runSequence = require('run-sequence');
const browserSync = require('browser-sync');
const $ = require('gulp-load-plugins')();
const getCurAppName = require('../shared/getCurAppName');

const paths = gulp.paths;
const argv = require('minimist')(process.argv.slice(2));

let demoPubWebPath = 'http://www.axilspot.com/demo-static/';

gulp.task('demo:pre', ['config'], () => {
  const utilIndexPath = 'shared/utils/index.js';

  if (!gulp.appName) {
    gulp.appName = getCurAppName();
  }

  if (argv.p) {
    demoPubWebPath = argv.p;
  }

  demoPubWebPath = `${demoPubWebPath}${gulp.appName}/`;

  paths.pubWebPath = demoPubWebPath;

  return gulp.src(utilIndexPath)
    .pipe($.replace("require('./lib/sync')", "require('./lib/sync_demo')"))
    .pipe(gulp.dest('shared/utils/'));
});

gulp.task('demo:afterBuild', () => {
  const utilIndexPath = 'shared/utils/index.js';

  paths.pubWebPath = '/';

  return gulp.src(utilIndexPath)
    .pipe($.replace("require('./lib/sync_demo')", "require('./lib/sync')"))

    .pipe(gulp.dest('shared/utils/'));
});

gulp.task('demo:copy', () => {
  let name = 'ac';

  if (argv.n) {
    name = argv.n;
  }
  return gulp.src([`./tools/data/${name}/*.*`, './tools/data/*.*'])
    .pipe(rename((path) => {
      path.extname = '';
    }))
    .on('end', () => {
      gutil.log('拷贝Ajax测试文件', gutil.colors.magenta(name));
    })
    .pipe(gulp.dest(`${paths.build}/goform/`));
});

gulp.task('demo:serve', (callback) => {
  // Run Browsersync
  browserSync({
    port: 3000,
    ui: {
      port: 3001,
    },
    server: {
      baseDir: 'build',
    },
  });

  callback();
});


gulp.task('demo', (callback) => {
  runSequence(
    'clean',
    'demo:pre',
    'build',
    ['demo:afterBuild', 'demo:copy'],
    'demo:serve',
    callback,
  );
});
