// These two constants are used when making API calls to the backend.
export const cloudFunctionsBaseUrlDevelopment = 'http://localhost:8081';
export const cloudFunctionsBaseUrlProduction =
  'https://us-east1-gigamesh-279607.cloudfunctions.net';

// These two constants are used to set CORS headers in API responses.
export const originDevelopment = 'http://localhost:8080';
export const originProduction = 'https://www.gigamesh.io';

// This constant points to the secret in GCP Secrets Manager corresponding to the SendGrid API key.
export const sendgridApiKeySecretName =
  'projects/gigamesh-279607/secrets/sendgrid/versions/latest';

// This is the "from" address for authentication emails.
export const authenticationEmailSender = 'automated@gigamesh.io';
