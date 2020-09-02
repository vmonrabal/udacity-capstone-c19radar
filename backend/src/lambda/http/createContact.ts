import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { CreateContactRequest } from '../../requests/CreateContactRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import { createContact } from '../../businessLogic/contacts'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'

const logger = createLogger('createContact')

export const handler = middy( async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  const newContact: CreateContactRequest = JSON.parse(event.body)
  const userId = getUserId(event)

  try {
    const contactCreated = await createContact(userId, newContact)
    logger.info(`Contact with ${contactCreated.email} for user ${userId} created successfully`)

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: contactCreated
      })
    }
  } catch (e) {
    logger.error(`Contact with with ${newContact.email} creation for user ${userId} failed: ${e.message}`)
    return {
      statusCode: 404,
      body: e.message
    }
  }
})

handler.use(
    cors({
      credentials: true
    })
)
