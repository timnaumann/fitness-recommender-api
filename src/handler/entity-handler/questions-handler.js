import Boom from '@hapi/boom'
import HTTPStatusCode from 'http-status-codes'

import Logger from '../../logging'
import {
    deleteQuestionById,
    findQuestionById,
    findQuestionByName,
    getAllQuestions,
    upsertQuestion
} from '../../db/queries/question-queries'
import { addQuestionPayloadToLocale, removeQuestionFromLocale } from '../handler-helpers'
import { findQuestionStageByName } from '../../db/queries/question-stage-queries'
import { findAllAnswersOfQuestion } from '../../db/queries/answer-queries'
import { deleteAnswerWithAllOfItsRelations } from './answer-handler'

export const getAllQuestionsHandler = () => getAllQuestions()

export const createQuestionHandler = async (request, h) => {
    const {
        stageName,
        name,
        label,
        locale,
        ...restParams
    } = request.payload

    let willCreateNewQuestion = false
    const question = await findQuestionByName(name)

    if (!question) {
        willCreateNewQuestion = true
    }

    let stage
    if (stageName) {
        stage = await findQuestionStageByName(stageName)
        if (!stage) {
            return Boom.notFound(`QuestionStage with name ${stageName} does not exist.`)
        }
    }

    try {
        const result = await upsertQuestion({
            stage,
            questionParams: { name, ...restParams }
        })
        await addQuestionPayloadToLocale({
            id: result.id,
            name,
            label
        }, locale)

        const responsePayload = {
            ...result,
            name,
            label
        }

        if (willCreateNewQuestion) {
            return h.response(responsePayload).code(HTTPStatusCode.CREATED)
        }

        return responsePayload
    }
    catch (e) {
        Logger.error('Error while creating/updating Question', e)
        return Boom.internal('Error while creating/updating Question')
    }
}

export const deleteQuestionHandler = async (request, h) => {
    const questionId = request.params.entityId
    try {
        await deleteQuestionWithAllOfItsRelation(questionId)
    }
    catch (e) {
        Logger.error(`Error while removing question with id ${questionId}`, e)
        return Boom.internal('Error while removing Question')
    }

    return h.response
}

export const deleteQuestionWithAllOfItsRelation = async (questionId) => {
    const question = await findQuestionById(questionId)
    if (!question) {
        return Boom.notFound(`Question with id ${questionId} does not exist.`)
    }

    // we need to delete the related entities manually due to a bug in prisma https://github.com/prisma/prisma/issues/2328
    const answers = await findAllAnswersOfQuestion(questionId)
    await Promise.all(answers.map((a) => deleteAnswerWithAllOfItsRelations(a.id)))

    await deleteQuestionById(questionId)
    await removeQuestionFromLocale(questionId)
}
