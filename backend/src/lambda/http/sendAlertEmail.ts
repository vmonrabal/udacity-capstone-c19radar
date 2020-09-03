import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import { getUserId } from '../utils'
import { getContact } from '../../businessLogic/contacts'
import { SESHelper } from '../../helper/SESHelper'
import { createLogger } from '../../utils/logger'

const logger = createLogger('deleteContacts')
const sesHelper = new SESHelper()

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const contactId = event.pathParameters.contactId
    const userId = getUserId(event)

    const contact = await getContact(userId, contactId)
    const mailParams = sesHelper.getC19AlertMailParams(contact)

    try {
        const data = await sesHelper.sendMail(mailParams)
        logger.info(`Contact ${contact.email} alerted from possible COVID-19 case`)
        return {
            statusCode: 200,
            body: JSON.stringify({
                data
            })
        }
    } catch (e) {
        logger.error(`Sending mail to contact ${contact.email} failed`)
        return {
            statusCode: 200,
            body: e.message
        }
    }
})

handler.use(
    cors({
        credentials: true
    })
)