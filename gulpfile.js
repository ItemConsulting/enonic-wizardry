var gulp = require('gulp');
var mocha = require('gulp-mocha');
var browserify = require('gulp-browserify');

gulp.task('default', function () {
    return gulp.src(["wizardry.js", '!./lib/enonic.js'])
        .pipe(browserify())
        .pipe(gulp.dest("./dest"));
});


gulp.task('test', function (done) {
    return gulp.src('./test/**/*.js', { read: false })
        .pipe(mocha());
});