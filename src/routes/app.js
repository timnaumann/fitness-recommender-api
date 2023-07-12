import path from 'path'
import { appRoot } from '../../appRoot'
import joi from '@hapi/joi'
import { getRequestLocale } from '../handler/handler-helpers'
import { getSupportedLocales } from '../globals'

export const getManagementPages = (server) => {
    server.route({
        method: 'GET',
        path: '/legal/{legalFile}',
        handler: (request, h) => {
            const locale = request.query.locale || getRequestLocale(request)
            const legalFile = `${locale}_${request.params.legalFile}.html`
            return h.file(`legal/${legalFile}`)
        },
        options: {
            validate: {
                params: joi.object().required().keys({
                    legalFile: joi.string()
                }),
                query: joi.object({
                    locale: joi.string().valid(...getSupportedLocales())
                })
            }
        }
    })
}

export const getBlogPage = (server) => {
    server.route({
        method: 'GET',
        path: '/blogpage/{blogPageFile}',
        handler: (request, h) => {
            const blogPageFile = `${request.params.blogPageFile}.html`
            return h.file(`blogpage/${blogPageFile}`)
        },
        options: {
            validate: {
                params: joi.object().required().keys({
                    blogPageFile: joi.string()
                }),
            }
        }
    })
}

export const getClient = (server) => {
    server.route({
        method: 'GET',
        path: '/{path*}',
        handler: {
            directory: {
                path: path.join(appRoot, process.env.CLIENT_PATH),
                listing: false,
                index: true
            }
        }
    })
}
