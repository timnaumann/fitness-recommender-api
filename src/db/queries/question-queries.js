import client from '../db-client'
import { generateQuery } from './query-helpers'

export const getAllQuestions = generateQuery((
    getCategories = true,
    getAnswers = true
) => {
    let include
    if (getCategories || getAnswers) {
        include = {
            ...(getCategories && {
                // we need to return everything here, otherwise prisma will throw an error (bug?)
                categories: true
            }),
            ...(getAnswers && {
                answers: {
                    select: {
                        id: true
                    }
                }
            })
        }
    }

    return client.question.findMany({
        include
    })
})

export const upsertQuestion = generateQuery(({
    stage,
    questionParams
}) => {
    const payload = {
        ...questionParams,
        ...(stage && {
            questionStage: {
                connect: {
                    id: stage.id
                }
            }
        })
    }

    return client.question.upsert({
        where: {
            name: questionParams.name
        },
        update: payload,
        create: payload
    })
})

export const findQuestionByName = generateQuery((questionName) => client.question.findUnique({
    where: {
        name: questionName
    }
}))

export const findQuestionById = generateQuery((questionId) =>
    client.question.findUnique({
        where: {
            id: questionId
        }
    }))

export const getAnswersOfQuestion = generateQuery(async (questionId) => {
    const question = await client.question.findUnique({
        where: {
            id: questionId
        },
        include: {
            answers: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    })
    return question.answers
})

export const deleteQuestionById = generateQuery((questionId) => client.question.delete({
    where: {
        id: questionId
    }
}))
