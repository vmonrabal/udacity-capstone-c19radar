import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateContactRequest } from '../../requests/UpdateContactRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { updateContact } from '../../businessLogic/contacts'

const logger = createLogger('updateContacts')

export const handler = middy( async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const contactId = event.pathParameters.contactId
  const userId = getUserId(event)
  const updatedContact: UpdateContactRequest = JSON.parse(event.body)

  try {
    await updateContact(userId, contactId, updatedContact)
    logger.info(`Contact ${contactId} for user ${userId} updated successfully`)
    return {
      statusCode: 200,
      body: 'Contact updated'
    }
  } catch (e) {
    logger.error(`Contact ${contactId} for user ${userId} updated failed: ${e.message}`)
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
