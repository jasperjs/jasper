module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jasmine');

    grunt.initConfig({
        dist: 'dist',
        uglify: {
            base: {
                src: '<%= dist %>/jasper.js',
                dest: '<%= dist %>/jasper.min.js'
            }
        },
        typescript: {
            base: {
                src: ['src/_references.ts'],
                dest: '<%= dist %>/jasper.js',
                options: {
                    module: 'amd', //or commonjs
                    target: 'es5', //or es3
                    sourceMap: true,
                    declaration: true,
                    references: [
                        'typed/angular.d.ts'
                    ]
                }
            },
            tests: {
                src: ['src/_references.ts'],
                options: {
                    module: 'amd', //or commonjs
                    target: 'es5', //or es3
                    sourceMap: false,
                    declaration: false,
                    references: [
                        'typed/angular.d.ts',
                        'typed/jasmine.d.ts'
                    ]
                }
            }
        },
        jasmine: {
            pivotal: {
                src: [
                    'vendor/angularjs/angular.min.js',
                    'vendor/angularjs/angular-route.min.js',
                    'vendor/angularjs/angular-mocks.js',
                    'src/**/*.js'
                ],
                options: {
                    specs: 'spec/**/*.js'
                    /* helpers: 'spec/*Helper.js'*/
                }
            }
        }
    });

    grunt.registerTask('default', ['typescript', 'uglify']);

    grunt.registerTask('test', ['typescript:tests', 'jasmine']);

};