'use strict';

var gulp = require('gulp');
var eslint = require('gulp-eslint');
var jscs = require('gulp-jscs');
var browserify = require('gulp-browserify2');
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var bower = require('gulp-bower');
var debug = require('gulp-debug');
var nodemon = require('gulp-nodemon');

var LINT_SOURCES = [
    'public/js/**/*.js',
    'app/**/*.js',
    'config/**/*.js',
    'lib/**/*.js',
    'gulfile.js',
    'browser-shims.js',
    'server.js'
];

gulp.task('dev', function () {
    nodemon({
        script: 'server.js',
        ext: 'html js json',
        ignore: [
            "test/*",
            "upload/*",
            "public/*",
            ".git*",
            "Gruntfile.js",
            "browser-shims.js",
            "tmp",
            "node_modules",
            "less"
        ]
    })
    .on('change', ['lint', 'codeStyle'])
    .on('restart', function () {
        console.log('restarted!')
    });
});

gulp.task('bower', function (cb) {
    bower('./vendor')
        .pipe(gulp.dest('./vendor/'));

    cb();
});

gulp.task('styles', function () {
    return gulp.src(['./less/master.less', './less/logged-in-only.less'])
        .pipe(less({
            strictImports: true
        }))
        .on( "error", function( err ) {
            console.log(err);
          })
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
    gulp.src('./public/js/main.js')
        .pipe(browserify({
            fileName: 'master.js',
            options: {
                insertGlobals : true,
                debug : true
            }
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
