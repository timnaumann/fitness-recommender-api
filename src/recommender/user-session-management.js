import { v4 as uuidv4 } from 'uuid'
import { findQuestionById, getAnswersOfQuestion } from '../db/queries/question-queries'
import { findAnswerById } from '../db/queries/answer-queries'
import { USER_ANSWERS } from './user-answers'
import {
    calculateSideEffects,
    calculateSideEffectsOnCategorySelection,
    getInitialSideEffects,
    getSideEffectResults
} from './question-site-effects'

const userSessions = {}
export const createUserSession = async () => {
    const userId = uuidv4()

    const session = await createNewSession(userId)
    userSessions[userId] = session

    return session
}

const createNewSession = (userId) => {
    const timeStamp = Date.now()
    const userAnswers = {}

    deleteExpiredSessions()

    return {
        userId,
        userAnswers,
        selectedCategory: null,
        creationTime: timeStamp,
        sideEffects: getInitialSideEffects(userId)
    }
}

// default session timing is 60 min
const ttl = 1000 * 60 * 60
const deleteExpiredSessions = () => {
    setTimeout(() => {
        const currentTime = Date.now()

        const sessionsToDelete = Object.values(userSessions).filter((session) => {
            const creationTime = session.creationTime
            return currentTime - creationTime > ttl
        }).map((s) => s.userId)

        sessionsToDelete.forEach((userId) => {
            delete userSessions[userId]
        })
    })
}

export const getExistingUserSession = (userId) => userSessions[userId]

export const getUserCategorySelection = (userId) => {
    const userSession = userSessions[userId]
    return userSession && userSession.selectedCategory
}

export const setUserCategorySelection = async (userId, category) => {
    const user = userSessions[userId]
    const prevCategory = user.selectedCategory

    const nextCategory = category

    user && (user.selectedCategory = category)

    await calculateSideEffectsOnCategorySelection(userId, prevCategory, nextCategory)

    return getSideEffectResults(userId)
}

// setting a userAnswer value to "null" means unset (by the system not by the user)
// if a user explicitly unset an answer its value is false
export const setUserAnswer = async (userId, answerId, value) => {
    const answer = await findAnswerById(answerId)

    if (!await isQuestionMultiselectable(answer.questionId)) {
        // unset all other answers of that specific question
        const otherAnswers = await getAnswersOfQuestion(answer.questionId)
        otherAnswers.forEach((a) => setAnswerValue(userId, a, null))
    }

    await setAnswerValue(userId, answer, value)

    return getSideEffectResults(userId)
}

export const resetQuestionAnswersByQuestionId = async (userId, questionId) => {
    const answersOfQuestion = await getAnswersOfQuestion(questionId)
    return Promise.all(answersOfQuestion.map((a) => unsetAnswer(userId, a)))
}

const unsetAnswer = (userId, answer) => setAnswerValue(userId, answer, null)

const isQuestionMultiselectable = async (questionId) => (await findQuestionById(questionId, false)).multiSelectable

const setAnswerValue = async (userId, answer, value) => {
    const userSession = userSessions[userId]
    const userAnswers = userSession?.userAnswers
    const resultingAnswerValue = value
        ? USER_ANSWERS.USER_ANSWER_POSITIVE
        : (value === null
            ? USER_ANSWERS.USER_ANSWER_NOT_SET_EXPLICITLY
            : USER_ANSWERS.USER_ANSWER_NEGATIVE
        )

    userAnswers[answer.id] = resultingAnswerValue
    await calculateSideEffects(userId, answer, resultingAnswerValue)
}

export const getUserAnswers = (userId) => userSessions[userId]?.userAnswers
