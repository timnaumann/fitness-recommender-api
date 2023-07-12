import winston from 'winston'

const tzoffset = (new Date()).getTimezoneOffset() * 60000

const logFormat = winston.format.printf((info) => {
    const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1)
    return `${localISOTime}-${info.level}: ${info.message}\n`
})
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            level: 'info',
            format: winston.format.combine(winston.format.colorize(), logFormat)
        })
    ]
})

export default logger
