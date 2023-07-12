import Boom from '@hapi/boom'
import {
    createRecommendation,
    findRecommendationById,
    getAllRecommendations,
    removeRecommendationById,
    updateRecommendation
} from '../../db/queries/recommendation-queries'
import { findDiagnosisByName } from '../../db/queries/diagnosis-queries'
import {
    addRecommendationPayloadToLocale,
    enrichRecommendationsWithI18n,
    getRequestLocale,
    removeRecommendationFromLocale
} from '../handler-helpers'
import Logger from '../../logging'

export const getAllRecommendationsHandler = async (request) => {
    const locale = request.query.locale || getRequestLocale(request)
    const recommendations = await getAllRecommendations()
    return enrichRecommendationsWithI18n(recommendations, locale)
}

export const createRecommendationHandler = async (request) => {
    const {
        name,
        diagnosisName,
        locale,
        ...restParams
    } = request.payload

    const diagnosis = await findDiagnosisByName(diagnosisName)

    if (!diagnosis) {
        return Boom.notFound(`Diagnosis with name ${diagnosisName} does not exist.`)
    }

    try {
        const result = await createRecommendation({
            diagnosisId: diagnosis.id,
            name
        })
        await addRecommendationPayloadToLocale({ id: result.id, ...restParams }, locale)

        return { ...result, ...restParams }
    }
    catch (e) {
        Logger.error('Error while creating recommendation', e)
        return Boom.internal('Error while creating recommendation')
    }
}

export const updateRecommendationHandler = async (request) => {
    const recommendationId = request.params.recommendationId

    const recommendation = findRecommendationById(recommendationId)
    if (!recommendation) {
        return Boom.notFound(`Recommendation with id ${recommendationId} does not exist.`)
    }

    const {
        diagnosisName,
        locale,
        ...restParams
    } = request.payload
    const diagnosis = await findDiagnosisByName(diagnosisName)

    if (!diagnosis) {
        return Boom.notFound(`Diagnosis with name ${diagnosisName} does not exist.`)
    }

    try {
        const result = await updateRecommendation({
            recommendationId,
            diagnosisId: diagnosis.id
        })
        await addRecommendationPayloadToLocale({ id: result.id, ...restParams }, locale)

        return { ...result, ...restParams }
    }
    catch (e) {
        Logger.error(`Error while updating recommendation with id ${recommendationId}`, e)
        return Boom.internal('Error while updating recommendation')
    }
}

export const deleteRecommendationHandler = async (request, h) => {
    const recommendationId = request.params.entityId

    try {
        const recommendation = await findRecommendationById(recommendationId)
        if (!recommendation) {
            return Boom.notFound(`Recommendation with id ${recommendationId} does not exist.`)
        }

        await removeRecommendationById(recommendationId)
        await removeRecommendationFromLocale(recommendationId)
    }
    catch (e) {
        Logger.error(`Error while removing recommendation with id ${recommendationId}`, e)
        return Boom.internal('Error while removing recommendation')
    }

    return h.response
}
