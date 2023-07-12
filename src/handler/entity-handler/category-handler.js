import Boom from '@hapi/boom'
import {
    assignOrUnassignQuestionToCategory,
    createCategory,
    deleteCategoryById,
    findCategoryById,
    findCategoryByName,
    getAllCategories
} from '../../db/queries/category-queries'
import Logger from '../../logging'
import {
    addCategoryPayloadToLocale,
    getDiagnosisReviewQuestionNameForCategory,
    getDiagnosisTestQuestionNameForCategory,
    removeCategoryFromLocale
} from '../handler-helpers'
import HTTPStatusCode from 'http-status-codes'
import { findQuestionById, findQuestionByName, upsertQuestion } from '../../db/queries/question-queries'
import { getAllDiagnosisOfCategory } from '../../db/queries/diagnosis-queries'
import { removeDiagnosisAndAllOfItsRelations } from './diagnosis-handler'
import { deleteQuestionWithAllOfItsRelation } from './questions-handler'

export const getAllCategoriesHandler = () => getAllCategories()

export const createCategoryHandler = async (request, h) => {
    const {
        name: categoryName,
        locale,
        ...restParams
    } = request.payload

    const category = await findCategoryByName(categoryName)

    // return on category create
    if (!category) {
        try {
            const result = await createCategory({ name: categoryName })
            await addCategoryPayloadToLocale({ id: result.id, ...restParams }, locale)

            // create a default diagnosis-test question for each category
            await createDiagnosisTestAndReviewQuestion(result.id, categoryName)

            return h.response({
                ...result,
                ...restParams
            }).code(HTTPStatusCode.CREATED)
        }
        catch (e) {
            Logger.error('Error while creating Category', e)
            return Boom.internal('Error while creating Category')
        }
    }

    try {
        await addCategoryPayloadToLocale({ id: category.id, ...restParams }, locale)

        return {
            ...category,
            ...restParams
        }
    }
    catch (e) {
        Logger.error('Error while updating Category', e)
        return Boom.internal('Error while updating Category')
    }
}

const createDiagnosisTestAndReviewQuestion = async (categoryId, categoryName) => {
    const diagnosisTestQuestion = await upsertQuestion({
        questionParams:
            {
                name: getDiagnosisTestQuestionNameForCategory(categoryName),
                multiSelectable: true
            }
    })

    await assignOrUnassignQuestionToCategory({
        questionId: diagnosisTestQuestion.id,
        categoryId,
        assign: true
    })

    const diagnosisReviewQuestion = await upsertQuestion({
        questionParams:
            {
                name: getDiagnosisReviewQuestionNameForCategory(categoryName),
                // 1-to-1 mapping
                multiSelectable: false
            }
    })

    await assignOrUnassignQuestionToCategory({
        questionId: diagnosisReviewQuestion.id,
        categoryId,
        assign: true
    })
}

const checkIfQuestionAndCategoryExist = async (questionId, categoryId) => {
    const category = await findCategoryById({ categoryId })

    if (!category) {
        throw Error(`Category with Id ${categoryId} does not exist.`)
    }

    const question = await findQuestionById(questionId)

    if (!question) {
        throw Error(`Question with Id ${questionId} does not exist.`)
    }
}

const assignOrUnassignQuestionToCategoryHandler = async (request, h, assign = true) => {
    const questionId = request.params.questionId
    const categoryId = request.params.categoryId

    try {
        await checkIfQuestionAndCategoryExist(questionId, categoryId)
    }
    catch (e) {
        return Boom.notFound(e)
    }

    try {
        const result = await assignOrUnassignQuestionToCategory({
            questionId,
            categoryId,
            assign
        })
        return result
    }
    catch (e) {
        Logger.error('Error while assigning a question to the category', e)
        return Boom.internal('Error while assigning a question to the category')
    }
}

export const deleteCategoryHandler = async (request, h) => {
    const categoryId = request.params.entityId

    try {
        const category = await findCategoryById({ categoryId })

        if (!category) {
            return Boom.notFound(`Category with id ${categoryId} does not exist.`)
        }

        // delete both of the questions
        await removeDiagnosisTestAndReviewQuestions(category.name)

        // we need to delete the related entities manually due to a bug in prisma https://github.com/prisma/prisma/issues/2328
        const diagnosis = await getAllDiagnosisOfCategory()
        await Promise.all(diagnosis.map((d) => removeDiagnosisAndAllOfItsRelations(d.id)))

        await deleteCategoryById(categoryId)
        await removeCategoryFromLocale(categoryId)
    }
    catch (e) {
        Logger.error(`Error while removing category with id ${categoryId}`, e)
        return Boom.internal('Error while removing Category')
    }

    return h.response
}

const removeDiagnosisTestAndReviewQuestions = async (categoryName) => {
    const diagnosisTestQuestion = await findQuestionByName(getDiagnosisReviewQuestionNameForCategory(categoryName))
    await deleteQuestionWithAllOfItsRelation(diagnosisTestQuestion.id)

    const diagnosisReviewQuestion = await findQuestionByName(getDiagnosisTestQuestionNameForCategory(categoryName))
    await deleteQuestionWithAllOfItsRelation(diagnosisReviewQuestion.id)
}

export const assignQuestionToCategoryHandler = (request, h) => assignOrUnassignQuestionToCategoryHandler(request, h, true)
export const unassignQuestionOfCategoryHandler = (request, h) => assignOrUnassignQuestionToCategoryHandler(request, h, false)
