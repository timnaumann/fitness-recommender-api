import client from '../db-client'
import { generateQuery } from './query-helpers'

export const getAvailableLocales = generateQuery((withLocaleFiles = false) => client.locale.findMany({
    select: {
        name: true,
        ...(withLocaleFiles && {
            localeFile: true
        })
    }
}))

export const getLocale = generateQuery((locale) => findLocale(null, locale))

export const getLocaleJSONOnly = generateQuery(async (locale) => {
    const localeFile = await findLocale({
        localeFile: true
    }, locale)
    return localeFile && localeFile.localeFile
})

const findLocale = (selectQuery, locale) => {
    let select
    if (selectQuery) {
        select = {
            ...selectQuery
        }
    }

    return client.locale.findUnique({
        where: {
            name: locale
        },
        select
    })
}

export const upsertLocaleJSON = generateQuery(({ json, locale }) => {
    return client.locale.upsert({
        where: {
            name: locale
        },
        update: {
            localeFile: json
        },
        create: {
            name: locale,
            localeFile: json
        }
    })
})
