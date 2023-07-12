import client from '../db-client'
import { generateQuery } from './query-helpers'

export const getAllAnswerDiagnosisDetails = generateQuery(() => client.answerDiagnosisDetails.findMany({
    include: {
        diagnosis: true,
        answer: true
    }
}))

export const createAnswerDiagnosisDetail = generateQuery(({ answerId, diagnosisId, significance }) =>
    client.answerDiagnosisDetails.upsert({
        where: {
            diagnosisId_answerId: {
                diagnosisId,
                answerId
            }
        },
        update: {
            significance
        },
        create: {
            significance,
            diagnosis: {
                connect: {
                    id: diagnosisId
                }
            },
            answer: {
                connect: {
                    id: answerId
                }
            }
        }
    }))

export const findAnswerDiagnosisDetailById = generateQuery((id) =>
    client.answerDiagnosisDetails.findMany({
        where: {
            id
        }
    })
)

export const deleteAnswerDiagnosisDetailById = generateQuery((id) =>
    client.answerDiagnosisDetails.deleteMany({
        where: {
            id
        }
    }))

export const removeAllAnswerDiagnosisDetailsOfDiagnosis = generateQuery((diagnosisId) =>
    client.answerDiagnosisDetails.deleteMany({
        where: {
            diagnosisId
        }
    }))

export const removeAllAnswerDiagnosisDetailsOfAnswer = generateQuery((answerId) =>
    client.answerDiagnosisDetails.deleteMany({
        where: {
            answerId
        }
    }))
