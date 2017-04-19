'use strict'
require('babel-polyfill')

const errorUtil = require('error-util')
const nextLaunchSkill = require('./next-launch-skill')

exports.handler = (event, context, callback) => {
  errorUtil.handleLambda(nextLaunchSkill.handler(event), event, context, callback)
}
