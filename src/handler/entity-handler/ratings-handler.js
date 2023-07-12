import Boom from '@hapi/boom'
import { findRecommendationById, updateRecommendation } from '../../db/queries/recommendation-queries'
import Logger from '../../logging'
import { createRating, findRatingById, getAllRatings, removeRatingById } from '../../db/queries/rating-queries'

export const getAllRatingsHandler = () => getAllRatings()

export const createRatingHandler = async (request) => {
    const { recommendationId, rating, ...restParams } = request.payload

    const recommendation = await findRecommendationById(recommendationId)

    if (!recommendation) {
        return Boom.notFound(`Recommendation with id ${recommendationId} does not exist.`)
    }

    try {
        const result = await createRating({ recommendationId, rating, ...restParams })
        await incrementAndSaveRecommendationRatingValues(recommendation, rating)

        return result
    }
    catch (e) {
        Logger.error('Error while creating rating', e)
        return Boom.internal('Error while creating rating.')
    }
}

export const deleteRatingHandler = async (request, h) => {
    const ratingId = request.params.entityId

    try {
        const rating = await findRatingById(ratingId)

        if (!rating) {
            return Boom.notFound(`Rating with id ${rating} does not exist.`)
        }

        await removeRatingById(ratingId)
        await decrementAndSaveRecommendationRatingValues(rating.recommendationId, rating.rating)
    }
    catch (e) {
        Logger.error(`Error while removing rating with id ${ratingId}`, e)
        return Boom.internal('Error while removing rating.')
    }

    return h.response
}

// at the moment, prisma does not support aggregations during querying so deal with it
const incrementAndSaveRecommendationRatingValues = (recommendation, rating) => {
    const totalRatings = recommendation.totalRatings + 1
    let previousAverageRating = recommendation.averageRating

    if (previousAverageRating === -1) {
    // averageRating is now set
        previousAverageRating = 0
    }

    const averageRating = previousAverageRating + (rating - previousAverageRating) / totalRatings
    return updateRecommendation({ recommendationId: recommendation.id, totalRatings, averageRating })
}

const decrementAndSaveRecommendationRatingValues = async (recommendationId, rating) => {
    const recommendation = await findRecommendationById(recommendationId)

    const totalRatings = recommendation.totalRatings - 1

    const previousAverageRating = recommendation.averageRating
    let averageRating = 0
    if (totalRatings !== 0) {
        averageRating = previousAverageRating - (rating - previousAverageRating) / totalRatings
    }

    return updateRecommendation({ recommendationId: recommendation.id, totalRatings, averageRating })
}
