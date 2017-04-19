'use strict'

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
  getIntentResponse(intentRequest) {
    const intentName = intentRequest.intent.name

    // Dispatch to your skill's intent handlers
    if (intentName === 'nextlaunch') {
      return this.buildSpeechletResponse('Next Launch', 'There is a launch soon', null, false)
    } else if (intentName === 'nextSpaceXLaunch') {
      return this.buildSpeechletResponse('Next Launch', 'There is a spacex launch soon', null, false)
    } else if (intentName === 'AMAZON.HelpIntent') {
      return this.getWelcomeResponse()
    } else if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
      return this.getSessionEndResponse()
    } else {
      throw new Error('Invalid intent')
    }
  }

  async handler(event) {
    console.log(`event.session.application.applicationId=${event.session.application.applicationId}`)

    if (event.session.application.applicationId !== 'amzn1.ask.skill.74bbf820-f663-4544-8910-f18e3db1d368') {
      throw new Error('invalid application id')
    }

    if (event.request.type === 'LaunchRequest') {
      return this.getWelcomeResponse()
    } else if (event.request.type === 'IntentRequest') {
      return this.getIntentResponse(event.request)
    } else if (event.request.type === 'SessionEndedRequest') {
      return this.getSessionEndResponse()
    }
  }
}

module.exports = new NextLaunchSkill()

