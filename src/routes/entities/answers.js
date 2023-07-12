import joi from '@hapi/joi'
import {
    createAnswerHandler,
    deleteAnswerHandler,
    getAllAnswersHandler,
    uploadImageOfAnswerHandler
} from '../../handler/entity-handler/answer-handler'
import { createDeleteEndpoint, getEntityPath } from '../helper/helpers'
import { getSupportedLocales } from '../../globals'

export const getAllAnswers = (server) => {
    server.route({
        method: 'GET',
        path: getEntityPath('answers'),
        handler: () => {
            return getAllAnswersHandler()
        },
        options: {
            auth: 'jwt'
        }
    })
}

export const createAnswer = (server) => {
    server.route({
        method: 'POST',
        path: getEntityPath('answers'),
        handler: (request, h) => {
            return createAnswerHandler(request, h)
        },
        options: {
            validate: {
                payload: joi.object({
                    name: joi.string().required(),
                    questionName: joi.string().required(),

                    label: joi.string().allow(''),
                    description: joi.string().allow(''),
                    sourceUrl: joi.string().allow(''),
                    locale: joi.string().valid(...getSupportedLocales()).required()
                })
            },
            auth: 'jwt'
        }
    })
}

export const deleteAnswerEndpoint = createDeleteEndpoint('answers', deleteAnswerHandler)

export const uploadImageOfAnswer = (server) => {
    server.route({
        method: 'PUT',
        path: getEntityPath('answers/{answerId}/images'),
        handler: (request, h) => {
            return uploadImageOfAnswerHandler(request, h)
        },
        options: {
            payload: {
                output: 'stream',
                parse: true,
                multipart: true
            },
            validate: {
                params: joi.object().keys({
                    answerId: joi.number().integer()
                }),
                query: joi.object().required().keys({
                    locale: joi.string().valid(...getSupportedLocales())
                })
            },
            response: {
                status: {
                    204: joi.string().empty('')
                }
            },
            auth: 'jwt'
        }
    })
}
