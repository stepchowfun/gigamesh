// These two constants are used when making API calls to the backend.
export const cloudFunctionsBaseUrlDevelopment = 'http://localhost:8081';
export const cloudFunctionsBaseUrlProduction =
  'https://us-central1-gigamesh-293109.cloudfunctions.net';

// These two constants are used to set CORS headers in API responses.
export const originDevelopment = 'http://localhost:8080';
export const originProduction = 'https://www.gigamesh.io';

// This constant points to the secrets in GCP Secret Manager.
export const postgresSecretName =
  'projects/gigamesh-293109/secrets/postgres/versions/latest';
export const sendgridSecretName =
  'projects/gigamesh-293109/secrets/sendgrid/versions/latest';

// This is the "from" address for authentication emails.
export const authenticationEmailSender = 'automated@gigamesh.io';
