import joi from '@hapi/joi'
import { createDeleteEndpoint, getEntityPath } from '../helper/helpers'
import { getSupportedLocales } from '../../globals'
import {
    createRatingHandler,
    deleteRatingHandler,
    getAllRatingsHandler
} from '../../handler/entity-handler/ratings-handler'

export const getAllRatingsEndpoint = (server) => {
    server.route({
        method: 'GET',
        path: getEntityPath('ratings'),
        handler: (request, h) => {
            return getAllRatingsHandler(request, h)
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

export const createRatingEndpoint = (server) => {
    server.route({
        method: 'POST',
        path: getEntityPath('ratings'),
        handler: (request, h) => {
            return createRatingHandler(request, h)
        },
        options: {
            validate: {
                payload: joi.object({
                    recommendationId: joi.number(),
                    rating: joi.number().min(1).max(5),
                    explanation: joi.string().allow(''),
                    locale: joi.string().valid(...getSupportedLocales()).required()
                })
            }
        }
    })
}

export const deleteRecommendationEndpoint = createDeleteEndpoint('ratings', deleteRatingHandler)
