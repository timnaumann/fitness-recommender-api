import client from '../db-client'
import { generateQuery } from './query-helpers'

export const getSettings = generateQuery(() => client.setting.findMany())

export const addSetting = generateQuery(({
    key,
    value
}) => {
    return client.setting.upsert({
        where: {
            key
        },
        update: {
            value
        },
        create: {
            key,
            value
        }
    })
})

export const removeSetting = generateQuery((key) =>
    client.setting.delete({
        where: {
            key
        }
    }))

export const findSettingByKey = generateQuery((key) =>
    client.setting.findUnique({
        where: {
            key
        }
    }))
