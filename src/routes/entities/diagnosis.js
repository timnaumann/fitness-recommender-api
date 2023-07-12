import joi from '@hapi/joi'
import {
    createDiagnosisHandler,
    deleteDiagnosisHandler,
    getAllDiagnosisHandler
} from '../../handler/entity-handler/diagnosis-handler'
import { createDeleteEndpoint, getEntityPath } from '../helper/helpers'
import { getSupportedLocales } from '../../globals'

export const diagnosisGetAll = (server) => {
    server.route({
        method: 'GET',
        path: getEntityPath('diagnosis'),
        handler: () => {
            return getAllDiagnosisHandler()
        },
        options: {
            auth: 'jwt'
        }
    })
}

export const diagnosisCreate = (server) => {
    server.route({
        method: 'POST',
        path: getEntityPath('diagnosis'),
        handler: (request, h) => {
            return createDiagnosisHandler(request, h)
        },
        options: {
            validate: {
                payload: joi.object({
                    name: joi.string().required(),
                    description: joi.string().allow(''),
                    categoryName: joi.string().required(),
                    locale: joi.string().valid(...getSupportedLocales()).required()
                })
            },
            auth: 'jwt'
        }
    })
}

export const deleteDiagnosisEndpoint = createDeleteEndpoint('diagnosis', deleteDiagnosisHandler)
