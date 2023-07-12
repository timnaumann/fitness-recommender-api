import { getEntityPath } from '../helper/helpers'
import joi from '@hapi/joi'
import {
    addSettingHandler,
    deleteSettingHandler,
    getAllSettingsHandler
} from '../../handler/entity-handler/settings-handler'

export const getSettingsEndpoint = (server) => {
    server.route({
        method: 'GET',
        path: getEntityPath('settings'),
        handler: (request, h) => {
            return getAllSettingsHandler(request, h)
        },
        options: {
            auth: 'jwt'
        }
    })
}

export const addSettingEndpoint = (server) => {
    server.route({
        method: 'POST',
        path: getEntityPath('settings/{key}'),
        handler: (request, h) => {
            return addSettingHandler(request, h)
        },
        options: {
            validate: {
                payload: joi.object({
                    value: joi.alternatives(
                        joi.string(),
                        joi.number(),
                        joi.boolean()
                    ).required()
                })
            },
            auth: 'jwt'
        }
    })
}

export const deleteSettingEndpoint = (server) => {
    server.route({
        method: 'DELETE',
        path: getEntityPath('settings/{key}'),
        handler: (request, h) => {
            return deleteSettingHandler(request, h)
        },
        options: {
            auth: 'jwt'
        }
    })
}
