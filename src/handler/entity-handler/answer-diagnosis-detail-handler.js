import Boom from '@hapi/boom'
import {
    createAnswerDiagnosisDetail,
    deleteAnswerDiagnosisDetailById,
    findAnswerDiagnosisDetailById,
    getAllAnswerDiagnosisDetails
} from '../../db/queries/answer-diagnosis-detail-queries'
import Logger from '../../logging'
import { findAnswerById } from '../../db/queries/answer-queries'
import { findDiagnosisById } from '../../db/queries/diagnosis-queries'
import { setupDiagnosisMatrix } from '../../recommender/diagnosis-matcher'

export const getAllAnswerDiagnosisDetailsHandler = () => getAllAnswerDiagnosisDetails()

export const createAnswerDiagnosisDetailHandler = async (request) => {
    const {
        answerId,
        diagnosisId
    } = request.payload

    const answer = await findAnswerById(answerId)
    if (!answer) {
        return Boom.notFound(`Answer with id ${answerId} does not exist.`)
    }

    const diagnosis = await findDiagnosisById(diagnosisId)
    if (!diagnosis) {
        return Boom.notFound(`Diagnosis with id ${diagnosis} does not exist.`)
    }

    try {
        const result = await createAnswerDiagnosisDetail(request.payload)
        await setupDiagnosisMatrix()
        return result
    }
    catch (e) {
        Logger.error('Error while creating AnswerDiagnosisDetail', e)
        return Boom.internal('Error while creating AnswerDiagnosisDetail')
    }
}

export const deleteAnswerDiagnosisDetailHandler = async (request, h) => {
    const answerDiagnosisDetailId = request.params.entityId

    try {
        const answerDiagnosisDetail = await findAnswerDiagnosisDetailById(answerDiagnosisDetailId)
        if (!answerDiagnosisDetail) {
            return Boom.notFound(`AnswerDiagnosisDetail with id ${answerDiagnosisDetailId} does not exist.`)
        }

        await deleteAnswerDiagnosisDetailById(answerDiagnosisDetailId)
    }
    catch (e) {
        Logger.error(`Error while removing AnswerDiagnosisDetail with id ${answerDiagnosisDetailId}`, e)
        return Boom.internal('Error while removing AnswerDiagnosisDetail')
    }

    return h.response
}
