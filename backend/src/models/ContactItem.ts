export interface ContactItem {
    userId: string,
    contactId: string
    name: string,
    when: string,
    where: string,
    email: string,
    phone?: string,
    infected: boolean,
    evidenceUrl?: string
}
