import * as AWS from "aws-sdk";
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

export class S3Helper {

    constructor(
        private readonly s3 = new XAWS.S3({signatureVersion: 'v4'}),
        private readonly bucketName = process.env.EVIDENCE_S3_BUCKET,
        private readonly signedUrlexpiration = process.env.SIGNED_URL_EXPIRATION
    ) {
    }

    getUploadUrl(contactId: string) {
        return this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: contactId,
            Expires: this.signedUrlexpiration
        })
    }

    async deleteEvidence(contactId: string) {
        return this.s3.deleteObject({
            Bucket: this.bucketName,
            Key: contactId
        }).promise()
    }

    getEvidenceUrl(contactId: string) {
        return `https://${this.bucketName}.s3.amazonaws.com/${contactId}`
    }
}

