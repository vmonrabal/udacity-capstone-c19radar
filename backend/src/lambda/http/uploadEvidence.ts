import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { S3Helper } from '../../helper/S3Helper'
import {getContact, updateContactEvidenceUrl} from "../../businessLogic/contacts";

const s3Helper = new S3Helper()

const logger = createLogger('uploadEvidenceUrl')

export const handler = middy( async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const contactId = event.pathParameters.contactId
  const userId = getUserId(event)

  const contact = await getContact(userId, contactId)
  if(!contact) {
    logger.error(`Contact with email ${contactId} to upload evidence not found`)
    return {
      statusCode: 404,
      body: `Contact with id ${contactId} to upload evidence not found`
    }
  }
  const uploadUrl = s3Helper.getUploadUrl(contactId)
  const evidenceUrl = s3Helper.getEvidenceUrl(contactId)

  try{
    await updateContactEvidenceUrl(userId, contactId, evidenceUrl)
    logger.info(`Contact evidence for id ${contactId} created successfully`)
      return {
        statusCode: 201,
        body: JSON.stringify({
          uploadUrl
        })
      }
    } catch (e) {
      logger.error(`Contact evidence upload for ${contactId} failed: ${e.message}`)
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