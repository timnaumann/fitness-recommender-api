import { getEntityPath } from '../helper/helpers'
import joi from '@hapi/joi'

import {
    addGenericLocaleKeys,
    addLocaleKeyToEntity,
    getAvailableLocalesHandler,
    getLocaleData
} from '../../handler/entity-handler/locale-handler'
import { getSupportedLocales } from '../../globals'

export const getAvailableLocalesEndpoint = (server) => {
    server.route({
        method: 'GET',
        path: getEntityPath('locales'),
        handler: (request, h) => {
            return getAvailableLocalesHandler(request, h)
        },
        options: {
            auth: 'jwt'
        }
    })
}

export const getLocaleEndpoint = (server) => {
    server.route({
        method: 'GET',
        path: getEntityPath('locales/{locale}'),
        handler: (request, h) => {
            return getLocaleData(request, h)
        },
        options: {
            validate: {
                query: joi.object().required().keys({
                    locale: joi.string().valid(...getSupportedLocales())
                })
            },
            auth: 'jwt'
        }
    })
}

export const addGeneralI18nKeysEndpoint = (server) => {
    server.route({
        method: 'POST',
        path: getEntityPath('locales/{locale}/generic-keys'),
        handler: (request, h) => {
            return addGenericLocaleKeys(request, h)
        },
        options: {
            validate: {
                query: joi.object().required().keys({
                    locale: joi.string().valid(...getSupportedLocales())
                })
            },
            auth: 'jwt'
        }
    })
}

export const generateLocaleValuesEndpoint = (entityType, pathParam) => {
    return (server) => {
        server.route({
            method: 'POST',
            path: getEntityPath(`locales/{locale}/${entityType}/{${pathParam}}`),
            handler: (request, h) => {
                return addLocaleKeyToEntity(request, h, {
                    entityId: request.params[pathParam],
                    entityType
                })
            },
            options: {
                validate: {
                    params: joi.object().required().keys({
                        locale: joi.string().valid(...getSupportedLocales()),
                        [pathParam]: joi.number()
                    })
                },
                auth: 'jwt'
            }
        })
    }
}

export const addAnswerLocaleValuesEndpoint = generateLocaleValuesEndpoint('answers', 'answerId')
export const addQuestionLocaleValuesEndpoint = generateLocaleValuesEndpoint('questions', 'questionId')
export const addCategoriesLocaleValuesEndpoint = generateLocaleValuesEndpoint('categories', 'categoryId')
export const addDiagnosisLocaleValuesEndpoint = generateLocaleValuesEndpoint('diagnosis', 'diagnosisId')
