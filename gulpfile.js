'use strict';

var gulp = require('gulp');
var eslint = require('gulp-eslint');
var jscs = require('gulp-jscs');

gulp.task('lint', function() {
    return gulp.src(['public/js/**/*.js', 'app/**/*.js', 'config/**/*.js', 'lib/**/*.js', 'gulfile.js', 'browser-shims.js', 'server.js'])
            .pipe(eslint())
            .pipe(eslint.format())
            .pipe(eslint.failOnError());
});

gulp.task('codeStyle', function () {
    return gulp.src(['public/js/**/*.js', 'app/**/*.js', 'config/**/*.js', 'lib/**/*.js', 'gulfile.js', 'browser-shims.js', 'server.js'])
        .pipe(jscs());
});

gulp.task('default', ['lint', 'codeStyle'], function () {
    // This will only run if the lint task is successful... 
});
