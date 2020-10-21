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

// These constants are used for connecting to the database.
export const databaseName = 'gigamesh';
export const databaseUser = 'postgres';
export const databaseHost = '/cloudsql/gigamesh-293109:us-central1:gigamesh';

// This is the "from" address for emails.
export const emailFromAddress = 'automated@gigamesh.io';
