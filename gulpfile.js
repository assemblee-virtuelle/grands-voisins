/**
 * To install dependencies run :
 * npm i -D gulp gulp-babel babel-preset-es2015 gulp-sourcemaps gulp-uglify gulp-concat
 */
const gulp = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');

// Compress all js included jpo router.
gulp.task('buildJs', () => {
  "use strict";
  return gulp.src([
    'src/script.js',
  ])
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(concat('script.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write(''))
    .pipe(gulp.dest('dist/'));
});

gulp.task('buildCss', () => {
  "use strict";

});

gulp.task('watch', () => {
  gulp.watch([
    'scss/style.scss',
    'src/script.js',
  ], ['buildJs', 'buildCss']);
});