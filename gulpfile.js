'use strict';

var gulp = require('gulp');
var eslint = require('gulp-eslint');
var jscs = require('gulp-jscs');
var browserify = require('gulp-browserify');
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var bower = require('gulp-bower');

var LINT_SOURCES = [
    'public/js/**/*.js',
    'app/**/*.js',
    'config/**/*.js',
    'lib/**/*.js',
    'gulfile.js',
    'browser-shims.js',
    'server.js'
];

gulp.task('bower', function (cb) {
    bower('./vendor')
        .pipe(gulp.dest('./vendor/'));

    cb();
});

gulp.task('styles', function () {
    return gulp.src('./less/master.less')
        .pipe(less({
            strictImports: true
        }))
        .pipe(autoprefixer({
            browsers: [
                'android 2.3',
                'android >= 4',
                'chrome >= 20',
                'firefox >= 24',
                'ie >= 8',
                'ios >= 6',
                'opera >= 12',
                'safari >= 6'
            ]
        }))
        .pipe(gulp.dest('./public/dist/'));
});

gulp.task('scripts', ['lint', 'codeStyle'], function () {
    // Single entry point to browserify 
    gulp.src(['./public/js/main.js'])
        .pipe(browserify({
            insertGlobals : true,
            debug : !gulp.env.production
        }))
        .pipe(gulp.dest('./public/dist/'))
});

gulp.task('lint', function() {
    return gulp.src(LINT_SOURCES)
            .pipe(eslint())
            .pipe(eslint.format())
            .pipe(eslint.failOnError());
});

gulp.task('codeStyle', function () {
    return gulp.src(LINT_SOURCES)
        .pipe(jscs());
});

gulp.task('default', ['styles', 'scripts'], function () {
    // This will only run if the lint task is successful... 
});
