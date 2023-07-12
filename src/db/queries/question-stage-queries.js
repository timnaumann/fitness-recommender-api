import client from '../db-client'
import { generateQuery } from './query-helpers'

export const getAllQuestionStages = generateQuery(() =>
    client.questionStage.findMany(
        {
            include: {
                questions: {
                    select: {
                        id: true
                    }
                }
            }
        }
    )
)

export const findQuestionStageById = generateQuery((qfStageId) =>
    client.questionStage.findUnique({
        where: {
            id: qfStageId
        }
    }))

export const getQuestionsOfQuestionStage = generateQuery(async (qfStageId) => {
    const questionStage = await client.questionStage.findUnique({
        where: {
            id: qfStageId
        },
        include: {
            questions: true
        }
    })
    return questionStage?.questions
})

export const findQuestionStageByName = generateQuery((stageName) =>
    client.questionStage.findUnique({
        where: {
            name: stageName
        }
    }))

export const upsertQuestionStage = generateQuery(({
    name,
    ...restParams
}) =>
    client.questionStage.upsert({
        where: {
            name
        },
        update: {
            ...restParams
        },
        create: {
            name,
            ...restParams
        }
    }))

export const deleteQuestionStageById = generateQuery((questionStageId) =>
    client.questionStage.delete({
        where: {
            id: questionStageId
        }
    }))
