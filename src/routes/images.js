import { fetchImageHandler } from '../handler/image-handler'
import joi from '@hapi/joi'

export const fetchData = (server) => {
    server.route({
        method: 'GET',
        path: '/images/{fileId}',
        handler: (request, h) => {
            return fetchImageHandler(request, h)
        },
        options: {
            validate: {
                params: joi.object().required().keys({
                    fileId: joi.string()
                })
            }
        }
    })
}
