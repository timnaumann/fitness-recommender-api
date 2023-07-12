import joi from '@hapi/joi'
import { createDeleteEndpoint, getEntityPath } from '../helper/helpers'
import {
    createStageHandler,
    deleteQuestionStageHandler,
    getAllStagesHandler
} from '../../handler/entity-handler/question-stage-handler'
import { getSupportedLocales } from '../../globals'

export const getAllStages = (server) => {
    server.route({
        method: 'GET',
        path: getEntityPath('question-stages'),
        handler: () => {
            return getAllStagesHandler()
        },
        options: {
            auth: 'jwt'
        }
    })
}

export const createStage = (server) => {
    server.route({
        method: 'POST',
        path: getEntityPath('question-stages'),
        handler: (request, h) => {
            return createStageHandler(request, h)
        },
        options: {
            validate: {
                payload: joi.object({
                    name: joi.string().required(),
                    heading: joi.string().allow(''),
                    questionFlowPosition: joi.number().min(0),
                    locale: joi.string().valid(...getSupportedLocales()).required()
                })
            },
            auth: 'jwt'
        }
    })
}

export const deleteQuestionStageEndpoint = createDeleteEndpoint('question-stages', deleteQuestionStageHandler)
