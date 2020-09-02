/**
 * Fields in a request to update a single Contact item.
 */
export interface UpdateContactRequest {
  name: string,
  when: string,
  where: string,
  infected: boolean,
}
