import Boom from '@hapi/boom'
import Logger from '../logging'
import { getAllQuestions } from '../db/queries/question-queries'
import { getAllCategories } from '../db/queries/category-queries'
import { getAllDiagnosis } from '../db/queries/diagnosis-queries'
import { getAllAnswers } from '../db/queries/answer-queries'
import { getRequestLocale } from './handler-helpers'
import { getLocaleJSONOnly } from '../db/queries/locales-queries'
import { getAllQuestionStages } from '../db/queries/question-stage-queries'
import { getSupportedLocales } from '../globals'
import { createUserSession, getExistingUserSession } from '../recommender/user-session-management'
import { getAllSettingsHandler } from './entity-handler/settings-handler'
import { getInitialSideEffects } from '../recommender/question-site-effects'

export const getInitialRecommenderProfile = async (request, h) => {
    const queryLocale = request.query.locale

    const userSession = await getExistingUserSessionOrCreateIfNecessary(request)
    storeUserSessionIdInCookie(h, userSession.userId)

    try {
        const calls = [
            getAllQuestions(true, true),
            getAllCategories(),
            getAllDiagnosis(),
            getAllAnswers(),
            getLocaleJSONOnly(queryLocale || getRequestLocale(request)),
            getAllQuestionStages(),
            getAllSettingsHandler(),
            getInitialSideEffects(userSession.userId)
        ]

        const [
            questions,
            categories,
            diagnosis,
            answers,
            locale,
            questionStages,
            settings,
            userSessionSideEffects
        ] = await Promise.all(calls)

        // TODO recommendations might need their own locale handling
        delete locale.recommendations

        return h.response({
            metaData: {
                supportedLocales: getSupportedLocales(),
                settings
            },
            questions,
            questionStages,
            categories,
            diagnosis,
            answers,
            i18n: locale,
            sessionData: {
                userId: userSession.userId,
                selectedCategoryId: userSession.selectedCategory?.id,
                userAnswers: userSession.userAnswers,
                sideEffects: userSessionSideEffects
            }
        })
    }
    catch (e) {
        Logger.error('Error while creating RecommenderProfile', e)
        return Boom.internal('Error while creating RecommenderProfile')
    }
}

const getExistingUserSessionOrCreateIfNecessary = (request) => {
    const userId = getUserSessionIdFromCookie(request)

    if (userId && getExistingUserSession(userId)) {
        return getExistingUserSession(userId)
    }

    return createUserSession()
}

const sessionIdCookieName = process.env.SESSION_COOKIE_NAME
const storeUserSessionIdInCookie = (h, sessionId) => {
    h.state(sessionIdCookieName, {
        sessionId
    })
}

const getUserSessionIdFromCookie = (request) => request.state[sessionIdCookieName]?.sessionId
