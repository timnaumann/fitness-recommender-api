import glob from 'glob'
import path from 'path'
import { appRoot } from '../appRoot'

export const registerRoutes = (server) => {
    glob.sync('src/routes/**/*.js', {
        root: appRoot,
        ignore: ['helper']
    }).forEach(async (file) => {
        const route = await import(path.join(appRoot, file))
        Object.values(route).forEach((registerEndpoint) => {
            registerEndpoint(server)
        })
    })
}
