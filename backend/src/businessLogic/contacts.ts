import * as uuid from 'uuid'

import { CreateContactRequest } from '../requests/CreateContactRequest'
import { ContactAccess } from '../dataLayer/contactAccess'
import { ContactItem } from '../models/ContactItem'
import { UpdateContactRequest } from '../requests/UpdateContactRequest'


const contactAccess = new ContactAccess()

export async function getUserContacts(userId: string): Promise<ContactItem[]> {
    return await contactAccess.getUserContacts(userId)
}

export async function getContactByEmail(userId: string, email: string): Promise<ContactItem> {
    return await contactAccess.getContactByEmail(userId, email)
}

export async function getContact(userId: string, contactId: string): Promise<ContactItem> {
    return await contactAccess.getContact(userId, contactId)
}

export async function createContact(
    userId: string,
    createContactRequest: CreateContactRequest
): Promise<ContactItem> {

    const contact = await contactAccess.getContactByEmail(userId, createContactRequest.email)
    if(contact) {
        throw new Error("There is a user with the same email")
    }

    const contactId = uuid.v4()
    return await contactAccess.createContact({
        userId: userId,
        contactId: contactId,
        infected: false,
        ...createContactRequest
    })
}

export async function updateContact(
    userId: string,
    contactId: string,
    updateContactRequest: UpdateContactRequest
) {
    const contactToUpdate = await contactAccess.getContact(userId, contactId)
    if(!contactToUpdate){
        throw new Error('Contact not found')
    }
    await contactAccess.updateContact(contactToUpdate, updateContactRequest)
}

export async function updateContactEvidenceUrl(
    userId: string,
    contactId: string,
    evidenceUrl: string
) {
    const contactToUpdate = await contactAccess.getContact(userId, contactId)
    if(!contactToUpdate){
        throw new Error('Contact not found')
    }
    await contactAccess.updateContactEvidenceUrl(userId, contactId, evidenceUrl)
}

export async function deleteContact(
    userId: string,
    contactId: string
) {
    const contactToDelete = await contactAccess.getContact(userId, contactId)
    if(!contactToDelete){
        throw new Error('Contact not found')
    }
    await contactAccess.deleteContact(contactToDelete)
}

