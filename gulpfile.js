'use strict';

var gulp = require('gulp');
var eslint = require('gulp-eslint');

gulp.task('lint', function() {
    return gulp.src(['public/js/**/*.js', 'app/**/*.js', 'config/**/*.js', 'lib/**/*.js'])
            .pipe(eslint())
            .pipe(eslint.format())
            .pipe(eslint.failOnError());
});

gulp.task('default', ['lint'], function () {
    // This will only run if the lint task is successful... 
});
