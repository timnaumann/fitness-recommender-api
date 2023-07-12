import joi from '@hapi/joi'
import { deleteImageCacheHandler } from '../../handler/image-handler'
import { getEntityPath } from '../helper/helpers'

export const deleteImageCache = (server) => {
    server.route({
        method: 'DELETE',
        path: getEntityPath('images/cache'),
        handler: (request, h) => {
            return deleteImageCacheHandler(request, h)
        },
        options: {
            response: {
                status: {
                    204: joi.string().empty('')
                }
            },
            auth: 'jwt'
        }
    })
}
