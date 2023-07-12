import Boom from '@hapi/boom'
import {
    deleteDiagnosisById,
    findDiagnosisById,
    findDiagnosisByName,
    getAllDiagnosis,
    upsertDiagnosis
} from '../../db/queries/diagnosis-queries'
import Logger from '../../logging'
import {
    addDiagnosisPayloadToLocale,
    removeDiagnosisFromLocale,
    removeRecommendationsFromLocale
} from '../handler-helpers'
import { findCategoryByName } from '../../db/queries/category-queries'
import HTTPStatusCode from 'http-status-codes'
import {
    getAllRecommendationsOfDiagnosis,
    removeAllRecommendationsOfDiagnosis
} from '../../db/queries/recommendation-queries'
import { removeAllAnswerDiagnosisDetailsOfDiagnosis } from '../../db/queries/answer-diagnosis-detail-queries'
import { setupDiagnosisMatrix } from '../../recommender/diagnosis-matcher'

export const getAllDiagnosisHandler = () => getAllDiagnosis()

export const createDiagnosisHandler = async (request, h) => {
    const { name, description, categoryName, locale } = request.payload
    const diagnosis = await findDiagnosisByName(name)

    let willCreateNewDiagnosis = false
    if (!diagnosis) {
        willCreateNewDiagnosis = true
    }

    const category = await findCategoryByName(categoryName)
    if (!category) {
        return Boom.notFound(`Category with name ${categoryName} does not exist but is required.`)
    }

    try {
        const result = await upsertDiagnosis({ categoryId: category.id, name })
        await addDiagnosisPayloadToLocale({ id: result.id, name, description }, locale)

        const responsePayload = {
            ...result,
            description
        }

        if (willCreateNewDiagnosis) {
            await setupDiagnosisMatrix()
            return h.response(responsePayload).code(HTTPStatusCode.CREATED)
        }

        return responsePayload
    }
    catch (e) {
        Logger.error('Error while creating/updating Diagnosis', e)
        return Boom.internal('Error while creating/updating Diagnosis')
    }
}

export const deleteDiagnosisHandler = async (request, h) => {
    const diagnosisId = request.params.entityId

    try {
        const diagnosis = await findDiagnosisById(diagnosisId)
        if (!diagnosis) {
            return Boom.notFound(`Diagnosis with id ${diagnosisId} does not exist.`)
        }

        await removeDiagnosisAndAllOfItsRelations(diagnosisId)
        await setupDiagnosisMatrix()
    }
    catch (e) {
        Logger.error(`Error while removing diagnosis with id ${diagnosisId}`, e)
        return Boom.internal('Error while removing Diagnosis')
    }

    return h.response
}

export const removeDiagnosisAndAllOfItsRelations = async (diagnosisId) => {
    // we need to delete the related entities manually due to a bug in prisma https://github.com/prisma/prisma/issues/2328
    const recommendationsOfDiagnosis = await getAllRecommendationsOfDiagnosis(diagnosisId)
    await removeAllRecommendationsOfDiagnosis(diagnosisId)
    await removeRecommendationsFromLocale(recommendationsOfDiagnosis.map((r) => r.id))

    // answer-diagnosis-details
    await removeAllAnswerDiagnosisDetailsOfDiagnosis(diagnosisId)

    // delete the diagnosis now
    await deleteDiagnosisById(diagnosisId)
    await removeDiagnosisFromLocale(diagnosisId)
}
