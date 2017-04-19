module.exports = function(grunt) {
  grunt.initConfig({
    lambda_package: {
      default: {
        options: {
          include_time: false,
          include_version: false,
          package_folder: './build/babel'
        }
      }
    },
    lambda_invoke: {
      default: {
        options: {
          file_name: './build/babel/src/index.js',
          event: 'aws/test-event/test.json'
        }
      }
    }
  })

  grunt.loadNpmTasks('grunt-aws-lambda')

  grunt.registerTask('default', ['lambda_package'])
}