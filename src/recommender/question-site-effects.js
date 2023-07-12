// TODO HIGHLY hacky, we should move this into a configuration file but for one question alone (diagnosis-decision) not worth
// TODO DO NOT TOUCH
import {
    getDiagnosisReviewQuestionNameForCategory,
    getDiagnosisTestQuestionNameForCategory
} from '../handler/handler-helpers'
import { getAllQuestionStages, getQuestionsOfQuestionStage } from '../db/queries/question-stage-queries'
import { USER_ANSWERS } from './user-answers'
import { findAnswersByIds } from '../db/queries/answer-queries'
import { getUserAnswers, getUserCategorySelection, resetQuestionAnswersByQuestionId } from './user-session-management'
import { findQuestionByName } from '../db/queries/question-queries'

const SIDE_EFFECT_ENTITIES = {
    THIRD_STAGE_NAME: 'third',
    FORTH_STAGE_NAME: 'forth',

    DIAGNOSIS_DECISION_QUESTION_NAME: 'diagnosis-decision',
    DIAGNOSIS_DECISION_ANSWER_YES_NAME: 'diagnosis-yes',
    DIAGNOSIS_DECISION_ANSWER_NO_NAME: 'diagnosis-no'
}

const INITIAL_SIDE_EFFECT = {
    questionStages: {
        [SIDE_EFFECT_ENTITIES.THIRD_STAGE_NAME]: {
            visible: false
        },
        [SIDE_EFFECT_ENTITIES.FORTH_STAGE_NAME]: {
            visible: false
        }
    }
}
const sideEffectStack = {}

export const getInitialSideEffects = async (userId) => {
    const userAnswers = getUserAnswers(userId)

    if (userAnswers && Object.keys(userAnswers).length) {
        const selectedUserAnswers = Object.entries(userAnswers).filter(([, value]) => value !== null)
        const answers = await findAnswersByIds(selectedUserAnswers.map(([key]) => parseInt(key)))

        await Promise.all(selectedUserAnswers.map(([key, value]) => {
            const answer = answers.find((a) => a.id === parseInt(key))
            return calculateSideEffects(userId, answer, value)
        }))

        const sideEffects = (await getSideEffectResults(userId)).sideEffects
        return merge(sideEffects || {}, INITIAL_SIDE_EFFECT)
    }

    return INITIAL_SIDE_EFFECT
}

// resets all category specific questions (diagnosis_decision + diagnosis-review + test)
export const calculateSideEffectsOnCategorySelection = async (userId, prevCategory) => {
    if (prevCategory) {
        await resetDiagnosisTestQuestionAnswersOfCategory(userId, prevCategory)
        await resetDiagnosisReviewQuestionAnswersOfCategory(userId, prevCategory)

        const diagnosisDecisionQuestion = await findQuestionByName(SIDE_EFFECT_ENTITIES.DIAGNOSIS_DECISION_QUESTION_NAME)
        await resetQuestionAnswersByQuestionId(userId, diagnosisDecisionQuestion.id)
    }
}

export const calculateSideEffects = async (userId, answer, resultingAnswerValue) => {
    const selectedCategory = getUserCategorySelection(userId)

    // show the diagnosis-review question if the "decision" question was answered accordingly
    if (answer.name === SIDE_EFFECT_ENTITIES.DIAGNOSIS_DECISION_ANSWER_YES_NAME && resultingAnswerValue === USER_ANSWERS.USER_ANSWER_POSITIVE) {
        await setVisibilityOfDiagnosisReviewQuestion(userId, selectedCategory, true)

        await resetDiagnosisTestQuestionAnswersOfCategory(userId, selectedCategory)
    }
    else if (answer.name === SIDE_EFFECT_ENTITIES.DIAGNOSIS_DECISION_ANSWER_NO_NAME && resultingAnswerValue === USER_ANSWERS.USER_ANSWER_POSITIVE) {
        await setVisibilityOfDiagnosisTestQuestion(userId, selectedCategory, true)

        await resetDiagnosisReviewQuestionAnswersOfCategory(userId, selectedCategory)
    }
}

// resets all of the answers for diagnosisTest + Review due to a change in visibility, otherwise the recommender behavior
// will not work properly later on
const resetDiagnosisReviewQuestionAnswersOfCategory = async (userId, selectedCategory) => {
    setVisibilityOfDiagnosisReviewQuestion(userId, selectedCategory, false)

    const diagnosisReviewQuestionName = getDiagnosisReviewQuestionNameForCategory(selectedCategory.name)
    const diagnosisReviewQuestion = await findQuestionByName(diagnosisReviewQuestionName)
    await resetQuestionAnswersByQuestionId(userId, diagnosisReviewQuestion.id)
}

const resetDiagnosisTestQuestionAnswersOfCategory = async (userId, selectedCategory) => {
    setVisibilityOfDiagnosisTestQuestion(userId, selectedCategory, false)

    const diagnosisTestQuestionName = getDiagnosisTestQuestionNameForCategory(selectedCategory.name)
    const diagnosisTestQuestion = await findQuestionByName(diagnosisTestQuestionName)
    await resetQuestionAnswersByQuestionId(userId, diagnosisTestQuestion.id)
}

const setVisibilityOfDiagnosisReviewQuestion = (userId, selectedCategory, value) => {
    const diagnosisReviewQuestionName = getDiagnosisReviewQuestionNameForCategory(selectedCategory.name)
    appendSideEffect(userId, {
        questions: {
            [diagnosisReviewQuestionName]: {
                visible: value
            }
        }
    })
}

const setVisibilityOfDiagnosisTestQuestion = (userId, selectedCategory, value) => {
    const diagnosisTestQuestionName = getDiagnosisTestQuestionNameForCategory(selectedCategory.name)
    appendSideEffect(userId, {
        questions: {
            [diagnosisTestQuestionName]: {
                visible: value
            }
        }
    })
}

// should change if a question of the stage is visible
const shouldChangeVisibilityOfQuestionStages = async (userId) => {
    const questionStages = await getAllQuestionStages()
    const sideEffects = getSideEffects(userId)

    if (!sideEffects.questions) {
        return
    }

    await Promise.all(questionStages.map(async (questionStage) => {
        const questionNames = (await getQuestionsOfQuestionStage(questionStage.id)).map((q) => q.name)
        const questionSideEffects = sideEffects?.questions

        const siteEffectQuestions = Object.entries(questionSideEffects)
            .filter(([key]) => questionNames.includes(key))

        if (siteEffectQuestions.length) {
            const aQuestionIsVisible = siteEffectQuestions.some(([, value]) => value.visible)
            appendSideEffect(userId, {
                questionStages: {
                    [questionStage.name]: {
                        visible: aQuestionIsVisible
                    }
                }
            })
        }
    }))
}

const appendSideEffect = (userId, sideEffect) => {
    let sideEffectsOfUser = sideEffectStack[userId]

    if (!sideEffectsOfUser) {
        sideEffectStack[userId] = []
        sideEffectsOfUser = sideEffectStack[userId]
    }

    sideEffectsOfUser.push(sideEffect)
}

export const getSideEffects = (userId) => {
    const sideEffectsOfUser = sideEffectStack[userId]
    if (!sideEffectsOfUser) {
        return {}
    }

    return sideEffectsOfUser.reduce((acc, value) => merge(value, acc), {})
}

export const getSideEffectResults = async (userId) => {
    await shouldChangeVisibilityOfQuestionStages(userId)

    const sideEffectsOfUser = sideEffectStack[userId]
    if (!sideEffectsOfUser) {
        return {
            userAnswers: getUserAnswers(userId)
        }
    }

    setTimeout(() => {
        delete sideEffectStack[userId]
    })

    return {
        userAnswers: getUserAnswers(userId),
        sideEffects: getSideEffects(userId)
    }
}

export const merge = (objFrom, objTo) => Object.keys(objFrom)
    .reduce(
        (merged, key) => {
            merged[key] = objFrom[key] instanceof Object && !Array.isArray(objFrom[key])
                ? merge(objFrom[key], merged[key] ?? {})
                : objFrom[key]
            return merged
        }, { ...objTo }
    )
