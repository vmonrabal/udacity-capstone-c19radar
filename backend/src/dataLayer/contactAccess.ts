import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { createLogger } from '../utils/logger'
import { ContactItem } from '../models/ContactItem'
import { ContactUpdate } from '../models/ContactUpdate'

const logger = createLogger('contactAccess')
const XAWS = AWSXRay.captureAWS(AWS)

export class ContactAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly contactsTable = process.env.CONTACTS_TABLE,
        private readonly contactsWhenIndex = process.env.CONTACTS_TABLE_WHEN_INDEX,
        private readonly contactsEmailIndex = process.env.CONTACTS_TABLE_EMAIL_INDEX
    ) {
    }

    async getUserContacts(userId: string): Promise<ContactItem[]> {
        logger.info(`Retrieving all contacts for user: ${userId}`)

        const result = await this.docClient.query({
            TableName: this.contactsTable,
            IndexName: this.contactsWhenIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        logger.info(`${result.Items.length} contacts retrieved for user: ${userId}`)
        return result.Items as ContactItem[]
    }

    async getContactByEmail(userId: string, email: string): Promise<ContactItem> {
        const result = await this.docClient.query({
            TableName: this.contactsTable,
            IndexName: this.contactsEmailIndex,
            KeyConditionExpression: 'userId = :userId AND email = :email',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':email' : email
            }
        }).promise()

        const contactItems = result.Items as ContactItem[]
        return contactItems[0]
    }

    async getContact(userId: string, contactId: string): Promise<ContactItem> {
        const result = await this.docClient.get({
            TableName: this.contactsTable,
            Key: {
                userId: userId,
                contactId: contactId
            }
        }).promise()

        return result.Item as ContactItem
    }

    async createContact(contact: ContactItem): Promise<ContactItem> {
        logger.info(`Creating Contact with email ${contact.email} for user: ${contact.userId}`)

        await this.docClient.put({
            TableName: this.contactsTable,
            Item: contact
        }).promise()

        return contact
    }

    async updateContact(contact: ContactItem, contactUpdate: ContactUpdate) {
        logger.info(`Updating Contact with id ${contact.contactId} for user ${contact.userId}`)

        await this.docClient.update({
            TableName: this.contactsTable,
            Key: {
                userId: contact.userId,
                contactId: contact.contactId
            },
            UpdateExpression: 'set #name = :name, #when = :when, #where = :where, infected = :infected',
            ExpressionAttributeNames: {
                '#name': 'name',
                '#when': 'when',
                '#where': 'where'
            },
            ExpressionAttributeValues: {
                ":name": contactUpdate.name,
                ":when": contactUpdate.when,
                ":where": contactUpdate.where,
                ":infected": contactUpdate.infected
            }
        }).promise()
    }

    async updateContactEvidenceUrl(userId: string, contactId: string, evidenceUrl: string) {
        logger.info(`Updating contact evidence with id ${contactId}`)

        await this.docClient.update({
            TableName: this.contactsTable,
            Key: {
                userId: userId,
                contactId: contactId
            },
            UpdateExpression: 'set evidenceUrl = :evidenceUrl',
            ExpressionAttributeValues: {
                ":evidenceUrl": evidenceUrl
            }
        }).promise()
    }


    async deleteContact(contact: ContactItem) {
        logger.info(`Deleting Contact for user ${contact.userId} with email ${contact.email}`)

        await this.docClient.delete({
            TableName: this.contactsTable,
            Key: {
                userId: contact.userId,
                contactId: contact.contactId
            }
        }).promise()
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        console.log('Creating a local DynamoDB instance')
        return new AWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }
    return new XAWS.DynamoDB.DocumentClient()
}
