const gulp = require('gulp');
const gutil = require('gulp-util');
const $ = require('gulp-load-plugins')();
const argv = require('minimist')(process.argv.slice(2));

const paths = gulp.paths;
const configReg = /'\.\/config\/(\w+)'/g;
const mainPath = `${paths.src}/index.jsx`;

gulp.task('config', () => {
  let name = 'ac';

  if (argv.n) {
    name = argv.n;
  }
  return gulp.src(mainPath)
    .pipe($.replace(configReg, "'./config/" + name + "'"))
    .on('end', () => {
      gutil.log('切换到配置文件：', gutil.colors.magenta(name));
    })
    .pipe(gulp.dest(paths.src));
});

gulp.task('config:ap', () => {
  gulp.src(mainPath)
    .pipe($.replace(configReg, "'./config/ap'"))
    .pipe(gulp.dest(paths.src));
});