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
export const databaseUserDevelopment = 'postgres';
export const databaseNameDevelopment = 'gigamesh';
export const databaseHostDevelopment = '127.0.0.1';
export const databasePortDevelopment = 5432;
export const databaseNameProduction = 'gigamesh';
export const databaseUserProduction = 'postgres';
export const databaseHostProduction =
  '/cloudsql/gigamesh-293109:us-central1:gigamesh';
export const databasePortProduction = undefined;

// This is the "from" address for emails.
export const emailFromAddress = 'automated@gigamesh.io';
