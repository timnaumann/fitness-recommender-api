import joi from '@hapi/joi'

const prefix = process.env.ENTITY_URL_PREFIX
export const getEntityPath = (endpoint) => `/${prefix}/${endpoint}`

export const createDeleteEndpoint = (endpoint, handler) => {
    return (server) => {
        server.route({
            method: 'DELETE',
            path: getEntityPath(`${endpoint}/{entityId}`),
            handler: (request, h) => {
                return handler(request, h)
            },
            options: {
                validate: {
                    params: joi.object({
                        entityId: joi.number().required()
                    })
                },
                response: {
                    status: {
                        204: joi.string().empty('')
                    }
                },
                auth: 'jwt'
            }
        })
    }
}
