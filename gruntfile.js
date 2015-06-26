module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-karma');

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
                src: ['src/_references.ts', 'test/**/*.ts'],
                options: {
                    module: 'amd', //or commonjs
                    target: 'es5', //or es3
                    sourceMap: false,
                    declaration: false,
                    references: [
                        'typed/angular.d.ts',
                        'typed/angular-mocks.d.ts',
                        'typed/jasmine.d.ts'
                    ]
                }
            }
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            },
            ci: {
                configFile: 'karma.conf.js',
                singleRun: true,
                browsers: ['PhantomJS']
            }
        }
    });

    grunt.registerTask('default', ['typescript', 'uglify']);

    grunt.registerTask('test', ['default', 'typescript:tests', 'karma']);
    grunt.registerTask('test-ci', ['typescript:tests', 'karma:ci']);
};