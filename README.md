# Capstone project - Serverless C19-Radar app

To implement this project, you need to implement a simple TODO application using AWS Lambda and Serverless framework. Search for all comments starting with the `TODO:` in the code to find the placeholders that you need to implement.

# Functionality of the application

The purpose of this application is to manage the contacts you have meet during the C19 pandemic. Using C19-Radar app you will be able to add, update and remove contacts who you have shared time in the last days. Also, you can upload a picture of the day and, finally, you can send an email to alert your contacts in case you are positive in C19 or you have been in contact with a C19 positive

# Contact items

The application stores `Contact` items, and each `Contact` item contains the following fields:

* `userId` (string) - user id. of who manage his contacts
* `contactId` (string) - contact id. to identify the contact
* `name` (string) - name of the contact
* `when` (string) - date of the meeting
* `where` (string) - where the meeting happened
* `email` (string) - email of the contact
* `infected` (boolean) - check if a contact is C19 positive or not
* `evidence` (string) (optional) - evidence the meeting day


# Functions implemented

The projec tis fully configured in the `serverless.yml` file:

* `Auth` - this function implements a custom authorizer for API Gateway.

* `GetContacts` - (https://{{apiId}}.execute-api.eu-central-1.amazonaws.com/dev/contacts) - returns all `Contacts` for a current user.

* `CreateContact` - (https://{{apiId}}.execute-api.eu-central-1.amazonaws.com/dev/contacts) - create a new `Contact` of the current user.

* `UpdateContact` - (https://{{apiId}}.execute-api.eu-central-1.amazonaws.com/dev/contacts/{contactId}) - updates a `Contact` created by a current user. 

* `DeleteContact` - (https://{{apiId}}.execute-api.eu-central-1.amazonaws.com/dev/contacts/{contactId}) - deletes a Contact created by a current user.

* `uploadEvidence` - (https://{{apiId}}.execute-api.eu-central-1.amazonaws.com/dev/contacts/{contactId}/evidence) - returns a pre-signed URL that can be used to upload an evidence file for `Contact`.

* `sendEmail` - https://{{apiId}}.execute-api.eu-central-1.amazonaws.com/dev/contacts/{contactId}/sendAlertMail - send an alert email to the `Contact` selected

### Note
The SES (Simple Email Service) is working in sandbox mode in AWS. For that reason only the registered mails by the AWS admin can receive mails. The image below is how the mail will arrive to the users once the SES service is in production mode

![mail](../master/images/mail.png)

# How to run the application

## Frontend

Run the following commands:

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless C19-Radar application.

# Postman collection

An alternative way to test the API is using the Postman collection that contains sample requests. You can find a Postman collection in this project.
