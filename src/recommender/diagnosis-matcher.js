import { getAllDiagnosis } from '../db/queries/diagnosis-queries'
import tf from '@tensorflow/tfjs-node'
import { getAllAnswers } from '../db/queries/answer-queries'

let diagnosisMatrix = []
const matrixRowToDiagnosisIdMapper = {}

export const setupDiagnosisMatrix = async () => {
    diagnosisMatrix = []

    let allAnswers = await getAllAnswers('id')

    if (allAnswers.length === 0) {
        return tf.tensor([])
    }

    allAnswers = allAnswers.map((answer) => {
        return {
            id: answer.id,
            significance: 0
        }
    })
    const allDiagnosis = await getAllDiagnosis({
        getAnswerDiagnosisDetails: true
    })

    if (allAnswers.length !== 0 && allDiagnosis.length !== 0) {
        allDiagnosis.forEach((diagnosis, index = 0) => {
            const diagnosisRow = JSON.parse(JSON.stringify(allAnswers))
            diagnosis.answerDiagnosisDetails.forEach((diagnosisDetail) => {
                const id = diagnosisDetail.answer.id
                const answerInRow = diagnosisRow.find((obj) => obj.id === id)
                answerInRow.significance = diagnosisDetail.significance
            })
            diagnosisMatrix.push(diagnosisRow.map((obj) => obj.significance))
            matrixRowToDiagnosisIdMapper[index] = diagnosis.id
        })
    }
}

const similarityThreshold = 0.7
const matchDiagnosisMatrix = async (userAnswers) => {
    const allAnswers = await getAllAnswers('id')
    const valueVector = allAnswers.map(({ id }) => {
        const userAnswer = userAnswers[id]
        return userAnswer || 0
    })

    const tensor = tf.tensor(diagnosisMatrix)
    const matrix = await tensor.array()
    if (matrix.length === 0) {
        return null
    }

    const similarities = matrix.map((row) => cosineDistance(row, valueVector))

    const weightedSimilarityThreshold = valueVector.length ? similarityThreshold / valueVector.length : similarityThreshold
    const isGoodDiagnosisPresent = similarities.find(s => s >= weightedSimilarityThreshold)
    if (!isGoodDiagnosisPresent) {
        return null
    }

    const finalSimilarity = Math.max(...similarities)
    const rowIndex = similarities.indexOf(finalSimilarity)
    return {
        similarity: finalSimilarity,
        diagnosisId: matrixRowToDiagnosisIdMapper[rowIndex]
    }
}

const cosineDistance = (x, y) => {
    const dotProduct = (u, w) => {
        if (w.length !== u.length) {
            return
        }

        let dotProductVal = 0
        // eslint-disable-next-line @hapi/for-loop
        for (let i = 0; i < u.length; i++) {
            dotProductVal += u[i] * w[i]
        }

        return dotProductVal
    }

    const euklied = (v) => {
        v = v.map((element) => element * element)
        v = v.reduce((i, j) => i + j)
        return Math.sqrt(v)
    }

    const result = dotProduct(x, y) / (euklied(x) * euklied(y))
    if (Number.isNaN(result)) {
        // in case of zero vector because of missing answerDiagnosisDetails to diagnosis
        return 0
    }

    return result
}

export const diagnosisMatcherPlugin = {
    name: 'diagnosisMatcher',
    version: '0.0.1',
    register: async function (server) {
        await setupDiagnosisMatrix()
        server.method('getDiagnosisByUserAnswers', matchDiagnosisMatrix)
    }
}
