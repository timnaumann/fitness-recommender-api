import {
    getInitialRecommenderProfile
} from '../handler/recommender-handler'
import joi from '@hapi/joi'
import { getSupportedLocales } from '../globals'

export const getInitialRecommenderProfileEndpoint = (server) => {
    server.route({
        method: 'GET',
        path: '/recommender-profile',
        handler: (request, h) => {
            return getInitialRecommenderProfile(request, h)
        },
        options: {
            validate: {
                query: joi.object({
                    locale: joi.string().valid(...getSupportedLocales())
                })
            },
            state: {
                parse: true,
                failAction: 'error'
            }
        }
    })
}
