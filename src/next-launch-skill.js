'use strict'

const _ = require('lodash')
const dashbot = require('dashbot')('aob5YSzzizdeG0jYfj93VVKNTbiTBFSTzoXxRpXI').alexa
const moment = require('moment-timezone')
const scraper = require('space-flight-now-scraper')

class NextLaunchSkill {
  buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
      version: '1.0',
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: output,
        },
        card: {
          type: 'Simple',
          title: `SessionSpeechlet - ${title}`,
          content: `SessionSpeechlet - ${output}`,
        },
        reprompt: {
          outputSpeech: {
            type: 'PlainText',
            text: repromptText,
          },
        },
        shouldEndSession,
      }
    }
  }

  getWelcomeResponse() {
    // If we wanted to initialize the session to have some attributes we could add those here.
    const cardTitle = 'Welcome'
    const speechOutput = 'Ask me when the next launch is.'
    const repromptText = 'Please ask me when the next launch is.'
    const shouldEndSession = false

    return this.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession)
  }

  getSessionEndResponse() {
    // If we wanted to initialize the session to have some attributes we could add those here.
    const cardTitle = 'Session Ended'
    const speechOutput = 'Thank you being interested in space. Have a nice day!'
    // Setting this to true ends the session and exits the skill.
    const shouldEndSession = true

    return this.buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession)
  }

  /**
   * Called when the user specifies an intent for this skill.
   */
  async getIntentResponse(intentRequest) {
    const intentName = intentRequest.intent.name

    // Dispatch to your skill's intent handlers
    if (intentName === 'nextlaunch' || intentName === 'nextLaunch') {
      const text = await this.getNextLaunchTextWInterval(false)
      return this.buildSpeechletResponse('Next Launch', text, null, true)
    } else if (intentName === 'nextSpaceXLaunch') {
      const text = await this.getNextLaunchTextWInterval(true)
      return this.buildSpeechletResponse('Next Launch', text, null, true)
    } else if (intentName === 'nextLaunchDate') {
      const text = await this.getNextLaunchTextWDate(false)
      return this.buildSpeechletResponse('Next Launch', text, null, true)
    } else if (intentName === 'nextSpaceXLaunchDate') {
      const text = await this.getNextLaunchTextWDate(true)
      return this.buildSpeechletResponse('Next Launch', text, null, true)
    } else if (intentName === 'AMAZON.HelpIntent') {
      return this.getWelcomeResponse()
    } else if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
      return this.getSessionEndResponse()
    } else {
      throw new Error('Invalid intent')
    }
  }

  findLaunch(launches, spacex) {
    const goodLaunches = _.filter(launches, launch => {
      return launch.launchDatetime && launch.launchDatetime.isAfter(moment()) &&
        (!spacex || launch.missionDescription.toLowerCase().indexOf('spacex') !== -1)
    })
    return goodLaunches[0]
  }

  async getNextLaunchTextWDate(spacex) {
    const launches = await scraper.nextLaunches()
    const launch = this.findLaunch(launches, spacex)
    return `
      On ${launch.launchDatetime.tz('America/Los_Angeles').format('MMMM Do')} at 
      ${launch.launchDatetime.tz('America/Los_Angeles').format('h:mm a')} a
      ${launch.rocket} rocket will launch from
      ${launch.launchSite}     
    `
  }

  plural(amount, string) {
    return amount + ' ' + string + (amount !== 1 ? 's' : '')
  }

  async getNextLaunchTextWInterval(spacex) {
    const launches = await scraper.nextLaunches()
    const launch = this.findLaunch(launches, spacex)
    let secDiff = launch.launchDatetime.unix() - moment().unix()
    const parts = []
    const days = Math.floor(secDiff / (24 * 60 * 60))
    if (days >= 1) {
      parts.push(this.plural(days, 'day'))
      secDiff -= days * (24 * 60 * 60)
    }
    const hours = Math.floor(secDiff / (60 * 60))
    if (hours >= 1) {
      parts.push(this.plural(hours, 'hour'))
      secDiff -= hours * (60 * 60)
    }
    const minutes = Math.floor(secDiff / (60))
    if (minutes >= 1) {
      parts.push(this.plural(minutes, 'minute'))
      secDiff -= minutes * (60)
    }
    console.log(secDiff)
    if (secDiff >= 1) {
      parts.push(this.plural(secDiff, 'second'))
    }
    let interval = ''
    _.each(parts, (part, i) => {
      if (i === parts.length - 2) {
        interval += part + ' and '
      } else if (i === parts.length - 1) {
        interval += part
      } else {
        interval += part + ', '
      }
    })
    return `In ${interval} ${launch.missionDescription.split('[')[0]}`
  }

  async getResponse(event) {
    if (event.request.type === 'LaunchRequest') {
      return this.getWelcomeResponse()
    } else if (event.request.type === 'IntentRequest') {
      return this.getIntentResponse(event.request)
    } else if (event.request.type === 'SessionEndedRequest') {
      return this.getSessionEndResponse()
    }
  }

  async handler(event, context) {
    console.log(`event.session.application.applicationId=${event.session.application.applicationId}`)
    const incomingLogging = dashbot.logIncoming(event, context)
    if (event.session.application.applicationId !== 'amzn1.ask.skill.74bbf820-f663-4544-8910-f18e3db1d368') {
      throw new Error('invalid application id')
    }

    const response = await this.getResponse(event)
    const outgoingLogging = dashbot.logOutgoing(event, response)
    await Promise.all([incomingLogging, outgoingLogging])
    return response
  }
}

module.exports = new NextLaunchSkill()

