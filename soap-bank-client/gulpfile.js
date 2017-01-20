var gulp = require('gulp'),
    concat = require('gulp-concat'),
    clean = require('gulp-clean');

gulp.task('clean-scripts', () => {
    return gulp.src('app/dist/scripts.js', {read: false})
        .pipe(clean());
});

gulp.task('compress',['clean-scripts'], () => {
  return gulp.src('app/webapp/**/*.js')
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest('app/dist/'));
});