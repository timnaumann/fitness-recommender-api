import joi from '@hapi/joi'
import { createDeleteEndpoint, getEntityPath } from '../helper/helpers'
import {
    createQuestionHandler,
    deleteQuestionHandler,
    getAllQuestionsHandler
} from '../../handler/entity-handler/questions-handler'
import { getSupportedLocales } from '../../globals'

export const getAllQuestionsEndpoint = (server) => {
    server.route({
        method: 'GET',
        path: getEntityPath('questions'),
        handler: () => {
            return getAllQuestionsHandler()
        },
        options: {
            auth: 'jwt'
        }
    })
}

export const createQuestionEndpoint = (server) => {
    server.route({
        method: 'POST',
        path: getEntityPath('questions'),
        handler: (request, h) => {
            return createQuestionHandler(request, h)
        },
        options: {
            validate: {
                payload: joi.object({
                    name: joi.string().required(),
                    label: joi.string().required(),

                    widgetType: joi.string().optional(),
                    multiSelectable: joi.boolean().optional(),
                    questionFlowPosition: joi.number().min(0),

                    stageName: joi.string(),

                    locale: joi.string().valid(...getSupportedLocales()).required()
                })
            },
            auth: 'jwt'
        }
    })
}

export const deleteQuestionEndpoint = createDeleteEndpoint('questions', deleteQuestionHandler)
