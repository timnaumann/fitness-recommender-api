import client from '../db-client'
import { generateQuery } from './query-helpers'

export const getAllDiagnosis = generateQuery(({
    getRecommendations = false,
    getAnswerDiagnosisDetails = false
} = {}) => {
    let include

    if (getRecommendations) {
        include = {
            recommendations: {
                select: {
                    id: true
                }
            }
        }
    }

    if (getAnswerDiagnosisDetails) {
        include = {
            ...include,
            answerDiagnosisDetails: {

                select: {
                    significance: true,
                    answer: true
                }
            }
        }
    }

    return client.diagnosis.findMany({
        orderBy: {
            id: 'asc'
        },
        include
    })
})

export const getAllDiagnosisOfCategory = generateQuery((categoryId) =>
    client.diagnosis.findMany({
        where: {
            categoryId
        }
    }))

export const upsertDiagnosis = generateQuery(({ categoryId, name }) =>
    client.diagnosis.upsert({
        where: {
            name
        },
        update: {
            categoryId
        },
        create: {
            name,
            category: {
                connect: {
                    id: categoryId
                }
            }
        }
    }))

export const findDiagnosisByName = generateQuery((diagnosisName) =>
    client.diagnosis.findUnique({
        where: {
            name: diagnosisName
        }
    }))

export const findDiagnosisById = generateQuery((diagnosisId) =>
    client.diagnosis.findUnique({
        where: {
            id: diagnosisId
        }
    }))

export const deleteDiagnosisById = generateQuery((diagnosisId) =>
    client.diagnosis.delete({
        where: {
            id: diagnosisId
        }
    }))
