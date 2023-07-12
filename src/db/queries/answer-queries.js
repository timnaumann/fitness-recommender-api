import client from '../db-client'
import { generateQuery } from './query-helpers'

export const getAllAnswers = generateQuery((selectValue) => {
    if (selectValue) {
        return client.answer.findMany(
            {
                select: {
                    [selectValue]: true
                },
                orderBy: {
                    id: 'asc'
                }
            }
        )
    }

    return client.answer.findMany()
})

export const upsertAnswer = generateQuery(({ questionId, name }) =>
    client.answer.upsert({
        where: {
            name
        },
        update: {
            questionId
        },
        create: {
            name,
            question: {
                connect: {
                    id: questionId
                }
            }
        }
    }
    ))

export const findAnswersByIds = generateQuery((ids) =>
    client.answer.findMany({
        where: {
            id: {
                in: ids
            }
        }
    })
)

export const findAnswerByName = generateQuery((name) =>
    client.answer.findUnique({
        where: {
            name
        }
    })
)

export const findAnswerById = generateQuery((answerId) =>
    client.answer.findUnique({
        where: {
            id: answerId
        }
    })
)

export const findAllAnswersOfQuestion = generateQuery((questionId) =>
    client.answer.findMany({
        where: {
            questionId
        }
    })
)

export const deleteAnswerById = generateQuery((answerId) =>
    client.answer.delete({
        where: {
            id: answerId
        }
    })
)
