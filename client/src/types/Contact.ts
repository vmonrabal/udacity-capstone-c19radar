export interface Contact {
  userId: string,
  contactId: string
  name: string,
  when: string,
  where: string,
  email: string,
  infected: boolean,
  evidenceUrl?: string
}
