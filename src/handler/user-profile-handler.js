import Boom from '@hapi/boom'
import { findQuestionByName } from '../db/queries/question-queries'
import { findAllAnswersOfQuestion } from '../db/queries/answer-queries'

import { getAllRecommendationsOfDiagnosis } from '../db/queries/recommendation-queries'
import {
    getExistingUserSession,
    getUserAnswers,
    getUserCategorySelection,
    setUserAnswer,
    setUserCategorySelection
} from '../recommender/user-session-management'
import { findCategoryById } from '../db/queries/category-queries'
import {
    enrichRecommendationsWithI18n,
    getDiagnosisTestQuestionNameForCategory,
    getRequestLocale
} from './handler-helpers'
import Logger from '../logging'

export const setUserAnswerHandler = (request) => {
    const usrId = request.params.userProfileId
    const answerId = request.payload.answerId

    if (!getExistingUserSession(usrId)) {
        return Boom.notFound('No userSession present for the given userId!')
    }

    return setUserAnswer(usrId, answerId, request.payload.value)
}

export const setSelectedCategoryHandler = async (request, h) => {
    const userId = request.params.userProfileId
    const categoryId = request.params.categoryId

    let category
    try {
        category = await findCategoryById({ categoryId })
    } catch (e) {
        Logger.error(`Error while retrieving category ${categoryId}.`, e)
        return Boom.internal()
    }

    const diagnosisTestQuestion = await getDiagnosisTestQuestion(category.name)
    if (!diagnosisTestQuestion) {
        return Boom.notFound(`There is no diagnosisTestQuestion for category ${category.name}. 
    You need to add it before you can get a summary.`)
    }

    return setUserCategorySelection(userId, category)
}

export const getUserProfileSummaryHandler = async (request, h) => {
    const userId = request.params.userProfileId

    const selectedCategory = getUserCategorySelection(userId)

    if (!selectedCategory) {
        return h.response([])
    }

    const diagnosisTestQuestion = await getDiagnosisTestQuestion(selectedCategory.name)
    if (!diagnosisTestQuestion) {
        return Boom.notFound(`There is no diagnosisTestQuestion for category ${selectedCategory.name}. 
    You need to add it before you can get a summary.`)
    }

    const userAnswers = getUserAnswers(userId)

    const diagnosisTestAnswers = await findAllAnswersOfQuestion(diagnosisTestQuestion.id)
    const diagnosisTestAnswersIds = diagnosisTestAnswers.map((a) => a.id)

    return Object.entries(userAnswers)
        .map(([key, value]) => [parseInt(key), value])
        .filter(([key]) => diagnosisTestAnswersIds.includes(key))
        .filter(([, value]) => value !== null)
        .map(([key, value]) => ({
            id: key,
            value: !!value
        }))
}

const getDiagnosisTestQuestion = (categoryName) => {
    const diagnosisTestQuestionName = getDiagnosisTestQuestionNameForCategory(categoryName)
    return findQuestionByName(diagnosisTestQuestionName)
}

export const getUserProfileRecommendationsHandler = async (request, h, server) => {
    const locale = request.query.locale || getRequestLocale(request)
    const amount = request.query.amount
    const userId = request.params.userProfileId

    const userAnswers = getUserAnswers(userId)

    if (!userAnswers) {
        Logger.error(`No user found for id ${userId} while retrieving recommendations.`)
        return []
    }

    const diagnosisPrediction = await server.methods.getDiagnosisByUserAnswers(userAnswers)
    if (!diagnosisPrediction) {
        return []
    }

    const recommendations = (diagnosisPrediction?.diagnosisId && await getAllRecommendationsOfDiagnosis(diagnosisPrediction.diagnosisId)) || []
    const slicedRecommendations = recommendations.slice(0, amount)

    return enrichRecommendationsWithI18n(slicedRecommendations, locale)
}

export const rateRecommendationHandler = async (request, h) => {

}
