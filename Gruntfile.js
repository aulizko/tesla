module.exports = function (grunt) {
    "use strict";

    require('load-grunt-tasks')(grunt);
    require("time-grunt")(grunt);

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        less: {
            core: {
                files: {
                    "public/css/master.css": "less/master.less"
                }
            }
        },
        autoprefixer: {
            options: {
                browsers: [
                    'Android 2.3',
                    'Android >= 4',
                    'Chrome >= 20',
                    'Firefox >= 24', // Firefox 24 is the latest ESR
                    'Explorer >= 8',
                    'iOS >= 6',
                    'Opera >= 12',
                    'Safari >= 6'
                ]
            },
            core: {
                options: {
                    map: true
                },
                src: 'public/css/master.css'
            }
        },
        bower : {
            install : {
                options : {
                    targetDir: 'vendor',
                    layout : 'byComponent',
                    verbose: true,
                    cleanup: true
                }
            }
        },
        browserify: {
            all: {
                options: {
                    transform: ['ractivate', "browserify-shim"],
                    exclude: 'views/layouts/**/*.html',
                    debug: true,
                    watch: true
                },
                files: {
                    'public/js/master.js': ['!public/js/master.js', 'public/js/**/*.js', 'views/**/*.html']
                }
            }
        },
        watch: {
            options: {
                spawn: false,
                interrupt: false,
                livereload: true
            },
            less: {
                files: ["less/**/*.less"],
                tasks: ['less', "autoprefixer"]
            },
            livereload: {
                files: ['view/**/*'],
                options: {
                    livereload: true
                }
            }
        }
    });


    grunt.registerTask('build', ['browserify', 'less', 'autoprefixer']);
    grunt.registerTask('default', ['build', 'watch']);
    grunt.registerTask('dist', ['bower:install', 'build']);
};