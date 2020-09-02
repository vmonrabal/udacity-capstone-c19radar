import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserContacts } from '../../businessLogic/contacts'

const logger = createLogger('getContacts')

export const handler = middy( async(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event: ', event)

    const userId = getUserId(event)

    try {
        const items = await getUserContacts(userId)
        return {
            statusCode: 200,
            body: JSON.stringify({
                items: items
            })
        }
    } catch (e) {
        return {
            statusCode: 500,
            body: e.message
        }
    }
})

handler.use(
    cors({
        credentials: true
    })
)
