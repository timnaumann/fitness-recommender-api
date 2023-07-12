import dotenv from 'dotenv'
import hapi from '@hapi/hapi'
import path from 'path'
import inert from '@hapi/inert'
import hapiLocale from 'hapi-locale-17'

import { diagnosisMatcherPlugin } from './recommender/diagnosis-matcher'
import Logger from './logging'
import { appRoot } from '../appRoot'
import { registerRoutes } from './register-routes'
import { getSupportedLocales } from './globals'
import { getAvailableLocales, upsertLocaleJSON } from './db/queries/locales-queries'
import { authPlugin } from './auth'

if (process.env.NODE_ENV === 'production') {
    dotenv.config({
        path: path.join(appRoot, '.env.production')
    })
}
else {
    dotenv.config()
}

const server = hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
        files: {
            relativeTo: path.join(appRoot, 'fixtures')
        },
        cors: {
            credentials: true
        }
    }
})

server.state(process.env.SESSION_COOKIE_NAME, {
    // cookie ttl is per default 30 min
    ttl: 1000 * 60 * 30,
    encoding: 'base64json',
    isSecure: true,
    isSameSite: 'None'
})

const init = async () => {
    await server.register(inert)
    await server.register({
        plugin: hapiLocale,
        options: {
            locales: getSupportedLocales()
        }
    })

    try {
        await addSupportedLocalesToDB()
    }
    catch (e) {
        process.exit(1)
    }

    await server.register(diagnosisMatcherPlugin)

    await server.register(authPlugin)

    registerRoutes(server)

    await server.start()

    Logger.info(`Server running on ${server.info.uri}`)
}

const addSupportedLocalesToDB = async () => {
    try {
        const dbLocales = await getAvailableLocales()
        const alreadyExistingLocales = dbLocales.map((locale) => locale.name)

        const missingLocales = getSupportedLocales().filter((supportedLocale) => !alreadyExistingLocales.includes(supportedLocale))
        await Promise.all(missingLocales.map((locale) => upsertLocaleJSON({
            json: {},
            locale
        })))
    }
    catch (e) {
        Logger.error('The server tried to add the locales to db but it failed. Have you added the relations to the DB? (npm run migrations)')
        throw e
    }
}

process.on('unhandledRejection', (err) => {
    Logger.error('Unhandled Rejection Error in server: :', err)
    process.exit(1)
})

init()
