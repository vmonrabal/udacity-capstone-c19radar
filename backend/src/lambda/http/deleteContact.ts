import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { deleteContact } from '../../businessLogic/contacts'
import {S3Helper} from "../../helper/S3Helper";

const logger = createLogger('deleteContacts')
const s3Helper = new S3Helper()

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  const contactId = event.pathParameters.contactId
  const userId = getUserId(event)

  try {
    await deleteContact(userId, contactId)
    await s3Helper.deleteEvidence(contactId)
    logger.info(`Contact ${contactId} for user ${userId} deleted successfully`)
    return {
      statusCode: 200,
      body: 'Contact deleted'
    }
  } catch (e) {
    logger.error(`Contact ${contactId} for user ${userId} delete failed: ${e.message}`)
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
