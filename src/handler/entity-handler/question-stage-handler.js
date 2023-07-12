import Boom from '@hapi/boom'
import Logger from '../../logging'
import {
    deleteQuestionStageById,
    findQuestionStageById,
    findQuestionStageByName,
    getAllQuestionStages,
    upsertQuestionStage
} from '../../db/queries/question-stage-queries'
import { addQuestionStagePayloadToLocale, removeQuestionStageFromLocale } from '../handler-helpers'
import HTTPStatusCode from 'http-status-codes'

export const getAllStagesHandler = () => getAllQuestionStages()

export const createStageHandler = async (request, h) => {
    const {
        name,
        heading,
        locale,
        ...restParams
    } = request.payload

    let willCreateNewStage = false
    const stage = await findQuestionStageByName(name)

    if (!stage) {
        willCreateNewStage = true
    }

    try {
        const result = await upsertQuestionStage({ name, ...restParams })
        heading && await addQuestionStagePayloadToLocale({
            id: result.id,
            heading
        }, locale)

        const responsePayload = {
            ...result,
            heading
        }

        if (willCreateNewStage) {
            return h.response(responsePayload).code(HTTPStatusCode.CREATED)
        }

        return responsePayload
    }
    catch (e) {
        Logger.error('Error while creating/updating QuestionStage', e)
        return Boom.internal('Error while creating/updating QuestionStage')
    }
}

export const deleteQuestionStageHandler = async (request, h) => {
    const questionStageId = request.params.entityId
    try {
        const questionStage = await findQuestionStageById(questionStageId)
        if (!questionStage) {
            return Boom.notFound(`QuestionStage with id ${questionStageId} does not exist.`)
        }

        await deleteQuestionStageById(questionStageId)
        await removeQuestionStageFromLocale(questionStageId)
    }
    catch (e) {
        Logger.error(`Error while removing question stage with id ${questionStageId}`, e)
        return Boom.internal('Error while removing Question Stage')
    }

    return h.response
}
