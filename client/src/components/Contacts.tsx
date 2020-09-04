import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import {createContact, deleteContact, getContacts, patchContact, sendAlertEmail} from '../api/contacts-api'
import Auth from '../auth/Auth'
import { Contact } from '../types/Contact'

interface ContactsProps {
  auth: Auth
  history: History
}

interface ErrorMessages {
  name: string,
  email: string,
  when: string,
  where: string,
}

interface ContactsState {
  contacts: Contact[]
  newContactName: string
  newContactEmail: string
  newContactWhen: string
  newContactWhere: string
  loadingContacts: boolean
  errors: ErrorMessages
}

export class Contacts extends React.PureComponent<ContactsProps, ContactsState> {
  state: ContactsState = {
    contacts: [],
    newContactName: '',
    newContactEmail: '',
    newContactWhen: '',
    newContactWhere: '',

    loadingContacts: true,
    errors: {} as ErrorMessages
  }

  handleCreateInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target
    const value = target.value
    const name = target.name
    this.setState(state => ({
      ...state,
      [name]: value
    }))
  }

  handleUpdateInputChange = (pos: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name

    this.setState({
      contacts: update(this.state.contacts, {[pos]: {[name]: {$set: value}}})
    })
  }

  updateValidation(contact: Contact){
    let where = contact.where
    let when = contact.when
    let errors = {} as ErrorMessages
    let formIsValid = true;

    if(!when) {
      formIsValid = false;
      errors.when = 'When cannot be empty'
    }

    if(!where) {
      formIsValid = false;
      errors.where = 'Where cannot be empty'
    }

    this.state.errors = errors
    return formIsValid;
  }

  onContactEdit = async (pos: number) => {
    const contact = this.state.contacts[pos]
    if(!this.updateValidation(contact)){
      alert(JSON.stringify(this.state.errors))
    }
    else {
      try {
        await patchContact(this.props.auth.getIdToken(), contact.contactId, {
          name: contact.name,
          when: contact.when,
          where: contact.where,
          infected: contact.infected
        })
        this.setState({
          contacts: update(this.state.contacts, {
            [pos]: {
              when: {$set: contact.when},
              where: {$set: contact.where},
              infected: {$set: contact.infected}
            }
          })
        })
        alert("Contact updated!")
      } catch (e) {
        alert('Contact update failed')
      }
    }
  }

  onAttachmentButtonClick = (contactId: string) => {
    this.props.history.push(`/contacts/${contactId}/edit`)
  }

  createValidation(){
    let name = this.state.newContactName
    let where = this.state.newContactWhere
    let when = this.state.newContactWhen
    let email = this.state.newContactEmail
    let errors = {} as ErrorMessages
    let formIsValid = true;

    //Name
    if(!name) {
      formIsValid = false;
      errors.name ='Name cannot be empty'
    }
    else if (name.length < 5 || name.length > 20){
      formIsValid = false;
      errors.name = 'Name has to be between 5 and 20 characters'
    }

    if(!email) {
      formIsValid = false;
      errors.email = 'Email cannot be empty'
    }

    if(!when) {
      formIsValid = false;
      errors.when = 'When cannot be empty'
    }

    if(!where) {
      formIsValid = false;
      errors.where = 'Where cannot be empty'
    }

    this.state.errors = errors
    return formIsValid;
  }

  onContactCreate = async () => {
    if(!this.createValidation()){
      alert(JSON.stringify(this.state.errors))
    }
    else {
      try {
        const newContact = await createContact(this.props.auth.getIdToken(), {
          name: this.state.newContactName,
          where: this.state.newContactWhere,
          when: this.state.newContactWhen,
          email: this.state.newContactEmail
        })
        this.setState({
          contacts: [...this.state.contacts, newContact],
          newContactName: '',
          newContactEmail: '',
          newContactWhen: '',
          newContactWhere: '',
          errors: {} as ErrorMessages
        })
      } catch {
        alert('Contact creation failed due to server error. Please report the error')
      }
    }
  }

  onContactDelete = async (contactId: string) => {
    try {
      await deleteContact(this.props.auth.getIdToken(), contactId)
      this.setState({
        contacts: this.state.contacts.filter(contact => contact.contactId != contactId)
      })
    } catch {
      alert('Contact deletion failed')
    }
  }

  onAlertEmailButtonClick = async (contactId: string) => {
    try {
      await sendAlertEmail(this.props.auth.getIdToken(), contactId)
      alert("Alert email sent successfully")
    } catch (e) {
      alert("Alert email sending failed")
    }
  }

  async componentDidMount() {
    try {
      const contacts = await getContacts(this.props.auth.getIdToken())
      this.setState({
        contacts,
        loadingContacts: false
      })
    } catch (e) {
      alert(`Failed to fetch contacts: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Contacts</Header>

        {this.renderCreateContactInput()}

        {this.renderContacts()}
      </div>
    )
  }

  renderCreateContactInput() {
    return (
        <Grid padded>
          <Grid.Row>
            <Grid.Column width={3}>
              <Input
                name="newContactName"
                value={this.state.newContactName}
                placeholder="Name"
                onChange={this.handleCreateInputChange}
                required
              />
            </Grid.Column>
            <Grid.Column width={3}>
              <Input
                  name="newContactEmail"
                  value={this.state.newContactEmail}
                  placeholder="email"
                  onChange={this.handleCreateInputChange}
              />
            </Grid.Column>
            <Grid.Column width={3}>
              <Input
                  name="newContactWhen"
                  value={this.state.newContactWhen}
                  placeholder="yyyy-mm-dd"
                  onChange={this.handleCreateInputChange}
              />
            </Grid.Column>
            <Grid.Column width={4}>
              <Input
                  name="newContactWhere"
                  value={this.state.newContactWhere}
                  placeholder="where"
                  onChange={this.handleCreateInputChange}
              />
            </Grid.Column>
            <Grid.Column width={1} floated="right">
              <Button
                  icon
                  color="blue"
                  onClick={() => this.onContactCreate()}
              >
                <Icon name="add user" />
              </Button>
            </Grid.Column>
            <Grid.Column width={16}>
              <Divider />
            </Grid.Column>
          </Grid.Row>
        </Grid>
    )
  }

  renderContacts() {
    if (this.state.loadingContacts) {
      return this.renderLoading()
    }

    return this.renderContactsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Contacts
        </Loader>
      </Grid.Row>
    )
  }

  renderContactsList() {
    return (
      <Grid padded>
        {this.state.contacts.map((contact, pos) => {
          return (
            <Grid.Row key={contact.contactId}>
              <Grid.Column width={2} verticalAlign="middle">
                {contact.name}
              </Grid.Column>
              <Grid.Column width={2} verticalAlign="middle">
                {contact.email}
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="middle">
                <Input
                    name="when"
                    value={contact.when}
                    onChange={(e) => this.handleUpdateInputChange(pos, e)}
                    placeholder="yyyy-mm-dd"
                />
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="middle">
                <Input
                    name="where"
                    value={contact.where}
                    onChange={(e) => this.handleUpdateInputChange(pos, e)}
                    placeholder="where"
                />
              </Grid.Column>
              <Grid.Column width={2} verticalAlign="middle">
                <label>Infected?
                  <input
                      type="checkbox"
                      name="infected"
                      checked={contact.infected}
                      onChange={(e) => this.handleUpdateInputChange(pos, e)}
                  />
                </label>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onContactEdit(pos)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                    icon
                    color="yellow"
                    onClick={() => this.onAttachmentButtonClick(contact.contactId)}
                >
                  <Icon name="attach" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                    icon
                    color="orange"
                    onClick={() => this.onAlertEmailButtonClick(contact.contactId)}
                >
                  <Icon name="mail" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onContactDelete(contact.contactId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {contact.evidenceUrl && (
                <Image src={contact.evidenceUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}