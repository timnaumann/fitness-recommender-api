import joi from '@hapi/joi'
import { createDeleteEndpoint, getEntityPath } from '../helper/helpers'
import {
    createAnswerDiagnosisDetailHandler, deleteAnswerDiagnosisDetailHandler,
    getAllAnswerDiagnosisDetailsHandler
} from '../../handler/entity-handler/answer-diagnosis-detail-handler'

export const getAllAnswerDiagnosisDetailsEndpoint = (server) => {
    server.route({
        method: 'GET',
        path: getEntityPath('answer-diagnosis-details'),
        handler: () => {
            return getAllAnswerDiagnosisDetailsHandler()
        },
        options: {
            auth: 'jwt'
        }
    })
}

export const createAnswerDiagnosisDetailsEndpoint = (server) => {
    server.route({
        method: 'POST',
        path: getEntityPath('answer-diagnosis-details'),
        handler: (request, h) => {
            return createAnswerDiagnosisDetailHandler(request, h)
        },
        options: {
            validate: {
                payload: joi.object({
                    significance: joi.number().required(),
                    diagnosisId: joi.number().integer().required(),
                    answerId: joi.number().integer().required()
                })
            },
            auth: 'jwt'
        }
    })
}

export const deleteAnswerDiagnosisDetailEndpoint = createDeleteEndpoint('answer-diagnosis-details', deleteAnswerDiagnosisDetailHandler)
