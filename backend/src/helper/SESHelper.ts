import * as AWS from "aws-sdk";
import {ContactItem} from "../models/ContactItem";
import { SendEmailRequest } from 'aws-sdk/clients/ses';

export class SESHelper {

    constructor(
        private readonly ses = new AWS.SES(),
        private readonly senderMail = process.env.SES_SENDER_MAIL
    ) {
    }

    getC19AlertMailParams(contact: ContactItem) {
        return {
            Destination: {
                ToAddresses: [contact.email]
            },
            Message: {
                Body: {
                    Html: {
                        Charset: 'UTF-8',
                        Data: `<h1>Hello ${contact.name}</h1><p>One of your contacts have been infected of COVID-19.<br>When: ${contact.when}<br>Where: ${contact.where}.<br>Please, take the recommended actions by authorities.<br>Thanks</p>`
                    }
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: "Possible contact infected of COVID-19. Please read"
                }
            },
            Source: this.senderMail
        }
    }

    async sendMail(params: SendEmailRequest) {
        return await this.ses.sendEmail(params).promise()
    }
}