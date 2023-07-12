import Boom from '@hapi/boom'

import {
    deleteAnswerById,
    findAnswerById,
    findAnswerByName,
    getAllAnswers,
    upsertAnswer
} from '../../db/queries/answer-queries'
import { findQuestionByName } from '../../db/queries/question-queries'
import { addAnswerPayloadToLocale, getRequestLocale, removeAnswerFromLocale } from '../handler-helpers'
import Logger from '../../logging'
import HTTPStatusCode from 'http-status-codes'
import { removeAllAnswerDiagnosisDetailsOfAnswer } from '../../db/queries/answer-diagnosis-detail-queries'
import { setupDiagnosisMatrix } from '../../recommender/diagnosis-matcher'
import { getServerHostAddress } from '../../globals'
import { uploadImage } from '../image-handler'

export const getAllAnswersHandler = () => getAllAnswers()

export const createAnswerHandler = async (request, h) => {
    const { name, questionName, locale, ...restParams } = request.payload

    let willCreateNewAnswer = false
    const answer = await findAnswerByName(name)
    if (!answer) {
        willCreateNewAnswer = true
    }

    const question = await findQuestionByName(questionName)
    if (!question) {
        return Boom.notFound(`Question with name ${questionName} does not exist.`)
    }

    try {
        const result = await upsertAnswer({ questionId: question.id, name })
        await addAnswerPayloadToLocale({ id: result.id, ...restParams }, locale)
        const responsePayload = {
            ...result, ...restParams
        }

        if (willCreateNewAnswer) {
            await setupDiagnosisMatrix()
            return h.response(responsePayload).code(HTTPStatusCode.CREATED)
        }

        return responsePayload
    }
    catch (e) {
        Logger.error('Error while creating/updating answer', e)
        return Boom.internal('Error while creating/updating answer')
    }
}

export const deleteAnswerHandler = async (request, h) => {
    const answerId = request.params.entityId

    try {
        const answer = await findAnswerById(answerId)
        if (!answer) {
            return Boom.notFound(`Answer with id ${answerId} does not exist.`)
        }

        await deleteAnswerWithAllOfItsRelations(answerId)
        await setupDiagnosisMatrix()
    }
    catch (e) {
        Logger.error(`Error while removing answer with id ${answerId}`, e)
        return Boom.internal('Error while removing Answer')
    }

    return h.response
}

export const deleteAnswerWithAllOfItsRelations = async (answerId) => {
    // we need to delete the related entities manually due to a bug in prisma https://github.com/prisma/prisma/issues/2328
    await removeAllAnswerDiagnosisDetailsOfAnswer(answerId)

    await deleteAnswerById(answerId)
    await removeAnswerFromLocale(answerId)
}

export const uploadImageOfAnswerHandler = async (request, h) => {
    const locale = request.query.locale || getRequestLocale(request)
    const answerId = request.params.answerId

    const fileName = request.payload.imageName
    const readableStream = request.payload.image

    const targetFileName = `answer_${answerId}_${fileName}`
    const sourceUrl = `${getServerHostAddress()}/images/${targetFileName}`

    await addAnswerPayloadToLocale({ id: answerId, sourceUrl }, locale)
    await uploadImage(targetFileName, readableStream)
    return h.response()
}
