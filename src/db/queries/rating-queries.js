import client from '../db-client'
import { generateQuery } from './query-helpers'

export const findRatingById = generateQuery((id) =>
    client.rating.findUnique({
        where: {
            id
        }
    }))

export const getAllRatings = generateQuery(() => client.rating.findMany())

export const createRating = generateQuery(({ recommendationId, rating, explanation, locale }) =>
    client.rating.create({
        data: {
            rating,
            explanation,
            locale,
            recommendation: {
                connect: {
                    id: recommendationId
                }
            }
        }
    }))

export const removeRatingById = generateQuery((ratingId) =>
    client.rating.delete({
        where: {
            id: ratingId
        }
    }))

export const removeAllRatingsOfRecommendation = generateQuery((recommendationId) =>
    client.rating.deleteMany({
        where: {
            recommendationId
        }
    }))
