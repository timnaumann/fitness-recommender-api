import joi from '@hapi/joi'
import {
    getUserProfileRecommendationsHandler,
    getUserProfileSummaryHandler,
    rateRecommendationHandler,
    setSelectedCategoryHandler,
    setUserAnswerHandler
} from '../handler/user-profile-handler'
import { getSupportedLocales } from '../globals'

export const setUserAnswerEndpoint = (server) => {
    server.route({
        method: 'POST',
        path: '/user-profiles/{userProfileId}',
        handler: (request, h) => {
            return setUserAnswerHandler(request, h)
        },
        options: {
            validate: {
                payload: joi.object({
                    answerId: joi.number().required(),
                    value: joi.boolean().required()
                }),
                params: joi.object({
                    userProfileId: joi.string().guid()
                })
            }
        }
    })
}

export const setSelectedCategoryEndpoint = (server) => {
    server.route({
        method: 'POST',
        path: '/user-profiles/{userProfileId}/categories/{categoryId}',
        handler: (request, h) => {
            return setSelectedCategoryHandler(request, h)
        },
        options: {
            validate: {
                params: joi.object({
                    userProfileId: joi.string().guid(),
                    categoryId: joi.number().integer().required()
                }).required()
            },
            response: {
                status: {
                    204: joi.string().empty('')
                }
            }
        }
    })
}

export const getUserProfileSummary = (server) => {
    server.route({
        method: 'GET',
        path: '/user-profiles/{userProfileId}/summary',
        handler: (request, h) => {
            return getUserProfileSummaryHandler(request, h)
        },
        options: {
            validate: {
                params: joi.object({
                    userProfileId: joi.string().guid()
                })
            }
        }
    })
}

export const getUserRecommendations = (server) => {
    server.route({
        method: 'GET',
        path: '/user-profiles/{userProfileId}/recommendations',
        handler: (request, h) => {
            return getUserProfileRecommendationsHandler(request, h, server)
        },
        options: {
            validate: {
                params: joi.object({
                    userProfileId: joi.string().guid()
                }),
                query: joi.object({
                    amount: joi.number().integer().min(0).default(5),
                    locale: joi.string().valid(...getSupportedLocales())
                })
            }
        }
    })
}

export const rateRecommendation = (server) => {
    server.route({
        method: 'PUT',
        path: '/user-profiles/{userProfileId}/recommendations/{recommendationId}/rating',
        handler: (request, h) => {
            return rateRecommendationHandler(request, h, server)
        },
        options: {
            validate: {
                params: joi.object({
                    userProfileId: joi.string().guid(),
                    recommendationId: joi.string().required()
                })
            }
        }
    })
}
