import AWS from 'aws-sdk'
import Boom from '@hapi/boom'
import fs from 'fs'
import path from 'path'
import Logger from '../logging'
import { getImageCacheFolderPath } from '../globals'
import HTTPStatusCode from 'http-status-codes'

let s3Client
export const authenticate = () => {
    if (s3Client) {
        return s3Client
    }

    const {
        Endpoint,
        S3
    } = AWS

    const wasabiEndpoint = new Endpoint(process.env.IMAGE_PROVIDER_URL)
    s3Client = new S3({
        endpoint: wasabiEndpoint,
        accessKeyId: process.env.WASABI_ACCESS_KEY_ID,
        secretAccessKey: process.env.WASABI_SECRET_KEY_ID
    })
    return s3Client
}

export const fetchImageHandler = async (request, h) => {
    const imageCachePath = getImageCacheFolderPath()
    const authenticatedS3Client = authenticate()
    const { fileId } = request.params
    const {
        existsSync,
        writeFile
    } = fs
    const imagePath = path.join(imageCachePath, fileId)

    if (!existsSync(imageCachePath)) {
        fs.mkdirSync(imageCachePath, { recursive: true })
    }

    if (existsSync(imagePath)) {
        return h.file(imagePath)
    }

    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: fileId
    }

    const response = await new Promise((resolve, reject) => {
        authenticatedS3Client.getObject(params, (err, data) => {
            if (!err) {
                resolve(data)
            }
            else {
                if (err.statusCode === HTTPStatusCode.NOT_FOUND) {
                    reject(Boom.notFound(`Could not find the file given key ${fileId}`))
                }

                Logger.error('Error while fetching data: ', err)
                reject(Boom.internal('Error while fetching data.'))
            }
        })
    })

    const buffer = response.Body

    writeFile(imagePath, buffer, (err) => {
        if (err) {
            Logger.error('Error while writing fetched data to cache:', err)
        }
    })

    return h.response(response.Body).type('image/png')
}

export const uploadImage = (fileName, fileStream) => {
    const authenticatedS3Client = authenticate()

    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: fileName,
        Body: fileStream
    }

    const options = {
        partSize: 10 * 1024 * 1024,
        queueSize: 10
    }

    return new Promise((resolve, reject) => authenticatedS3Client.upload(params, options, (err) => {
        if (err) {
            Logger.error('Error while uploading data: ', err)
            reject(err)
        }

        resolve()
    }))
}

export const deleteImageCacheHandler = (request, h) => {
    try {
        const imageCachePath = getImageCacheFolderPath()
        if (fs.existsSync(imageCachePath)) {
            fs.rmSync(imageCachePath, { recursive: true })
        }
    }
    catch (e) {
        return Boom.internal('Error while deleting cache.', e)
    }

    return h.response()
}
