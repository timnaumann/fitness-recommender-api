import jwt from 'hapi-auth-jwt2'
import jwksRsa from 'jwks-rsa'

const validate = (decoded) => {
    const { exp, preferred_username } = decoded

    if (preferred_username === process.env.TECHNICAL_USERNAME) {
        return {
            isValid: true
        }
    }

    if (Date.now() >= exp * 1000) {
        return {
            isValid: false,
            errorMessage: 'The token is expired'
        }
    }

    return { isValid: true }
}

const getPublicKeyFromKeycloak = async function () {
    const client = jwksRsa({
        jwksUri: process.env.KEYCLOAK_KEY_SET_ENDPOINT
    })
    const key = await client.getSigningKey(process.env.KEYCLOAK_API_KID)
    return {
        key: key.getPublicKey()
    }
}

export const authPlugin = {
    name: 'authPlugin',
    version: '1.0.0',
    register: async (server) => {
        await server.register(jwt)

        server.auth.strategy('jwt', 'jwt', {
            key: getPublicKeyFromKeycloak,
            validate,
            verifyOptions: {
                ignoreExpiration: true,
                algorithms: ['RS256']
            }
        })
    }
}
