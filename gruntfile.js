module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');

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
            }
        },
        copy: {
            main: {
                files: [
                  { expand: true, flatten: true, src: ['<%= dist %>/**'], dest: '../JasperApp/vendor/jasper/', filter: 'isFile' },
                ]
            }
        }
    });

    grunt.registerTask('default', ['typescript', 'uglify', 'copy']);

};