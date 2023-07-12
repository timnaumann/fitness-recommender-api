import { getAvailableLocales, getLocale, getLocaleJSONOnly, upsertLocaleJSON } from '../../db/queries/locales-queries'
import Logger from '../../logging'
import Boom from '@hapi/boom'

export const getAvailableLocalesHandler = async () => {
    try {
        const result = await getAvailableLocales()
        return result
    }
    catch (e) {
        Logger.error('Error while retrieving available Locales', e)
        return Boom.internal('Error while retrieving available Locales')
    }
}

export const getLocaleData = async (request) => {
    try {
        const locale = await getLocale(request.params.locale)

        if (!locale) {
            return Boom.notFound(`LocaleFile for locale ${request.params.locale} does not exist.`)
        }

        return locale
    }
    catch (e) {
        Logger.error('Error while retrieving Locales', e)
    }
}

export const addGenericLocaleKeys = async (request, h) => {
    const locale = request.params.locale

    try {
        const localeJSON = await getLocaleJSONOnly(locale)

        if (!locale) {
            return Boom.notFound(`LocaleFile for locale ${request.params.locale} does not exist.`)
        }

        localeJSON.generic = {
            ...localeJSON?.generic,
            ...request.payload
        }

        await upsertLocaleJSON({
            json: localeJSON,
            locale
        })
        return localeJSON.generic
    }
    catch (e) {
        Logger.error(`Error while adding the payload to locale ${locale} `, e)
        return Boom.internal(`Error while adding the payload to locale ${locale}`)
    }
}

export const addLocaleKeyToEntity = async (request, h, {
    entityId,
    entityType
}) => {
    const locale = request.params.locale

    try {
        const localeJSON = await getLocaleJSONOnly(locale)

        if (!localeJSON) {
            return Boom.notFound(`LocaleFile for locale ${request.params.locale} does not exist.`)
        }

        if (!localeJSON[entityType]) {
            localeJSON[entityType] = {}
        }

        localeJSON[entityType][entityId] = {
            ...localeJSON[entityType][entityId],
            ...request.payload
        }

        await upsertLocaleJSON({
            json: localeJSON,
            locale
        })
        return localeJSON[entityType][entityId]
    }
    catch (e) {
        Logger.error(`Error while adding the payload to locale ${locale} `, e)
        return Boom.internal(`Error while adding the payload to locale ${locale}`)
    }
}
