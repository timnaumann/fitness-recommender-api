import { appRoot } from '../appRoot'
import path from 'path'

export const getSupportedLocales = () => process.env.SUPPORTED_LOCALES.split(',')

export const getImageCacheFolderPath = () => path.join(appRoot, 'fixtures/images/cache')

export const isDevelopmentEnv = () => (process.env.NODE_ENV === 'develop')

export const getServerHostAddress = () => {
    if (isDevelopmentEnv()) {
        return `//${process.env.HOST}:${process.env.PORT}`
    }

    return `//${process.env.DOMAIN}`
}
