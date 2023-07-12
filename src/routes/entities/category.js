import joi from '@hapi/joi'
import {
    getAllCategoriesHandler,
    createCategoryHandler, unassignQuestionOfCategoryHandler, assignQuestionToCategoryHandler, deleteCategoryHandler
} from '../../handler/entity-handler/category-handler'
import { createDeleteEndpoint, getEntityPath } from '../helper/helpers'
import { getSupportedLocales } from '../../globals'

export const getAllCategories = (server) => {
    server.route({
        method: 'GET',
        path: getEntityPath('categories'),
        handler: () => {
            return getAllCategoriesHandler()
        },
        options: {
            auth: 'jwt'
        }
    })
}

export const createCategory = (server) => {
    server.route({
        method: 'POST',
        path: getEntityPath('categories'),
        handler: (request, h) => {
            return createCategoryHandler(request, h)
        },
        options: {
            validate: {
                payload: joi.object({
                    name: joi.string().required(),
                    label: joi.string().required(),
                    description: joi.string().required(),
                    sourceUrl: joi.string().allow(''),
                    locale: joi.string().valid(...getSupportedLocales()).required()
                })
            },
            auth: 'jwt'
        }
    })
}

export const assignQuestionToCategoryEndpoint = (server) => {
    server.route({
        method: 'POST',
        path: getEntityPath('categories/{categoryId}/questions/{questionId}'),
        handler: (request, h) => {
            return assignQuestionToCategoryHandler(request, h)
        },
        options: {
            validate: {
                params: joi.object().keys({
                    categoryId: joi.number().integer(),
                    questionId: joi.number().integer()
                })
            },
            auth: 'jwt'
        }
    })
}

export const unassignQuestionOfCategoryEndpoint = (server) => {
    server.route({
        method: 'DELETE',
        path: getEntityPath('categories/{categoryId}/questions/{questionId}'),
        handler: (request, h) => {
            return unassignQuestionOfCategoryHandler(request, h)
        },
        options: {
            validate: {
                params: joi.object().keys({
                    categoryId: joi.number().integer(),
                    questionId: joi.number().integer()
                })
            },
            auth: 'jwt'
        }
    })
}

export const deleteCategoryEndpoint = createDeleteEndpoint('categories', deleteCategoryHandler)
