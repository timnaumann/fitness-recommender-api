import client from '../db-client'
import { generateQuery } from './query-helpers'

export const getAllCategories = generateQuery(() => client.category.findMany())

export const createCategory = generateQuery((payload) =>
    client.category.create({
        data: {
            ...payload
        }
    }))

export const findCategoryById = generateQuery(({ categoryId, withQuestions = false }) =>
    client.category.findUnique({
        where: {
            id: categoryId
        },
        ...(withQuestions && { include: { questions: true } })
    }))

export const findCategoryByName = generateQuery((categoryName) =>
    client.category.findUnique({
        where: {
            name: categoryName
        }
    }))

export const assignOrUnassignQuestionToCategory = generateQuery(({ questionId, categoryId, assign }) =>
    client.category.update({
        where: {
            id: categoryId
        },
        data: {
            questions: {
                [assign ? 'connect' : 'disconnect']: {
                    id: questionId
                }
            }
        },
        include: {
            questions: true
        }
    }))

export const deleteCategoryById = generateQuery((categoryId) =>
    client.category.delete({
        where: {
            id: categoryId
        }
    }))
