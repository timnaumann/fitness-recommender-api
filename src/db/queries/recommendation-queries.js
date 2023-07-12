import client from '../db-client'
import { generateQuery } from './query-helpers'

export const findRecommendationById = generateQuery((id) =>
    client.recommendation.findUnique({
        where: {
            id
        }
    }))

export const getAllRecommendations = generateQuery(() => client.recommendation.findMany())

export const getAllRecommendationsOfDiagnosis = generateQuery((diagnosisId) => client.recommendation.findMany({
    where: {
        diagnosisId
    }
}))

export const createRecommendation = generateQuery(({
    diagnosisId,
    name
}) => client.recommendation.upsert({
    where: {
        name
    },
    update: {
        diagnosisId
    },
    create: {
        name,
        diagnosis: {
            connect: {
                id: diagnosisId
            }
        }
    }
}))

export const updateRecommendation = generateQuery(({
    recommendationId,
    ...params
}) =>
    client.recommendation.update({
        where: {
            id: recommendationId
        },
        data: {
            ...params
        }
    }))

export const removeRecommendationById = generateQuery((recommendationId) =>
    client.recommendation.delete({
        where: {
            id: recommendationId
        }
    }))

export const removeAllRecommendationsOfDiagnosis = generateQuery((diagnosisId) =>
    client.recommendation.deleteMany({
        where: {
            diagnosisId
        }
    }))
