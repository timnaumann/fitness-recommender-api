import Logger from '../../logging'

export const generateQuery = (query) => {
    return async (params) => {
        try {
            const value = await query(params)
            return value
        }
        catch (e) {
            Logger.error('Error while executing query.', e)
            throw e
        }
    }
}
