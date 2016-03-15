var gulp = require('gulp'), sass = require('gulp-sass');

gulp.task('default', ['sass', 'watch']);

gulp.task('sass', function() {
  return gulp.src('./src/scss/**/*.scss')
  .pipe(sass().on('error', console.error))
  .pipe(gulp.dest('./public/css'));
});

gulp.task('watch', function() {
  gulp.watch('./src/scss/**/*.scss', ['sass']);
});
