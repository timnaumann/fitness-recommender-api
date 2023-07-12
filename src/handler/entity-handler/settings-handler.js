import Boom from '@hapi/boom'
import Logger from '../../logging'
import { addSetting, findSettingByKey, getSettings, removeSetting } from '../../db/queries/settings-queries'

export const getAllSettingsHandler = async () => {
    const settingsArray = await getSettings()
    return settingsArray.reduce((acc, {
        key,
        value
    }) => ({
        ...acc,
        [key]: value
    }), {})
}

export const addSettingHandler = async (request) => {
    const key = request.params.key
    const { value } = request.payload

    try {
        await addSetting({
            key,
            value: JSON.stringify(value)
        })
        return getAllSettingsHandler()
    }
    catch (e) {
        Logger.error('Error while updating Setting', e)
        return Boom.internal('Error while updating Setting')
    }
}

export const deleteSettingHandler = async (request, h) => {
    const settingKey = request.params.key

    try {
        const setting = await findSettingByKey(settingKey)

        if (!setting) {
            return Boom.notFound(`Setting with key ${settingKey} does not exist.`)
        }

        await removeSetting(settingKey)
    }
    catch (e) {
        Logger.error(`Error while removing setting with key ${settingKey}`, e)
        return Boom.internal('Error while removing setting.')
    }

    return h.response
}
