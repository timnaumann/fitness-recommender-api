import joi from '@hapi/joi'
import {
    createRecommendationHandler,
    deleteRecommendationHandler,
    getAllRecommendationsHandler
} from '../../handler/entity-handler/recommendation-handler'
import { createDeleteEndpoint, getEntityPath } from '../helper/helpers'
import { getSupportedLocales } from '../../globals'

export const getAllRecommendations = (server) => {
    server.route({
        method: 'GET',
        path: getEntityPath('recommendations'),
        handler: (request, h) => {
            return getAllRecommendationsHandler(request, h)
        },
        options: {
            validate: {
                query: joi.object({
                    locale: joi.string().valid(...getSupportedLocales())
                })
            },
            auth: 'jwt'
        }
    })
}

export const createRecommendation = (server) => {
    server.route({
        method: 'POST',
        path: getEntityPath('recommendations'),
        handler: (request, h) => {
            return createRecommendationHandler(request, h)
        },
        options: {
            validate: {
                payload: joi.object({
                    name: joi.string().required(),
                    locale: joi.string().valid(...getSupportedLocales()).required(),
                    diagnosisName: joi.string().required(),

                    heading: joi.string().allow(''),
                    description: joi.string().allow(''),
                    sourceUrl: joi.string().allow(''),
                    tool: joi.string().allow(''),
                    toolUrl: joi.string().allow('')
                })
            },
            auth: 'jwt'
        }
    })
}

export const deleteRecommendationEndpoint = createDeleteEndpoint('recommendations', deleteRecommendationHandler)
