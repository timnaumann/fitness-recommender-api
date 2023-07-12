export const health = (server) => {
    server.route({
        method: 'GET',
        path: '/health',
        handler: (request, h) => {
            return h.response()
        },
        config: {
            response: {
                emptyStatusCode: 200
            }
        }
    })
}
