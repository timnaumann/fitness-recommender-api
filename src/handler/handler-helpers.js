import { getAvailableLocales, getLocale, upsertLocaleJSON } from '../db/queries/locales-queries'

export const addCategoryPayloadToLocale = (payload, locale) => addObjectPayloadToLocale('categories', payload, locale)
export const removeCategoryFromLocale = (entityId) => removeEntityFromLocale('categories', entityId)

export const addQuestionPayloadToLocale = (payload, locale) => addObjectPayloadToLocale('questions', payload, locale)
export const removeQuestionFromLocale = (entityId) => removeEntityFromLocale('questions', entityId)

export const addDiagnosisPayloadToLocale = (payload, locale) => addObjectPayloadToLocale('diagnosis', payload, locale)
export const removeDiagnosisFromLocale = (entityId) => removeEntityFromLocale('diagnosis', entityId)

export const addAnswerPayloadToLocale = (payload, locale) => addObjectPayloadToLocale('answers', payload, locale)
export const removeAnswerFromLocale = (entityId) => removeEntityFromLocale('answers', entityId)

export const addRecommendationPayloadToLocale = (payload, locale) => addObjectPayloadToLocale('recommendations', payload, locale)
export const removeRecommendationFromLocale = (entityId) => removeEntityFromLocale('recommendations', entityId)
export const removeRecommendationsFromLocale = (entityIds) => removeEntitiesFromLocale('recommendations', entityIds)
export const enrichRecommendationsWithI18n = async (recommendations, locale) => {
    const localeFile = (await getLocale(locale)).localeFile
    const recommI18n = localeFile.recommendations || {}
    return recommendations.map((r) => ({
        ...r,
        ...recommI18n[r.id]
    }))
}

export const addQuestionStagePayloadToLocale = (payload, locale) => addObjectPayloadToLocale('questionStages', payload, locale)
export const removeQuestionStageFromLocale = (entityId) => removeEntityFromLocale('questionStages', entityId)

export const addObjectPayloadToLocale = async (entityDescriptor, payload, locale) => {
    const {
        id,
        ...restPayload
    } = payload
    const dbResponse = await getLocale(locale)

    let localeFile
    if (dbResponse) {
        localeFile = dbResponse.localeFile
    }
    else {
        localeFile = {}
    }

    if (!localeFile[entityDescriptor]) {
        localeFile[entityDescriptor] = {}
    }

    localeFile[entityDescriptor][id] = {
        ...localeFile[entityDescriptor][id],
        ...restPayload
    }

    await upsertLocaleJSON({
        json: localeFile,
        locale
    })
}

export const removeEntityFromLocale = async (entityDescriptor, entityId) => {
    const dbResponse = await getAvailableLocales(true)

    await Promise.all(dbResponse.map(async (locale) => {
        const localeFile = locale.localeFile

        if (localeFile[entityDescriptor]?.[entityId]) {
            delete localeFile[entityDescriptor][entityId]
            await upsertLocaleJSON({
                json: localeFile,
                locale: locale.name
            })
        }
    }))
}

export const removeEntitiesFromLocale = async (entityDescriptor, entityIds) => {
    const dbResponse = await getAvailableLocales(true)

    await Promise.all(dbResponse.map(async (locale) => {
        const localeFile = locale.localeFile

        entityIds.forEach((entityId) => {
            delete localeFile[entityDescriptor]?.[entityId]
        })

        await upsertLocaleJSON({
            json: localeFile,
            locale: locale.name
        })
    }))
}

// TODO change defaultLocale if we have data in other languages
export const getRequestLocale = (request) => 'de-DE' || request.getLocale()

export const getDiagnosisReviewQuestionNameForCategory = (categoryName) => `diagnosis-review-${categoryName}`
export const getDiagnosisTestQuestionNameForCategory = (categoryName) => `diagnosis-tests-${categoryName}`
