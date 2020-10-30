// These two constants are used to set CORS headers in API responses.
export const originDevelopment = 'http://localhost:8080';
export const originProduction = 'https://www.gigamesh.io';

// This constant points to the secrets in GCP Secret Manager.
export const postgresSecretName =
  'projects/gigamesh-293109/secrets/postgres-api/versions/latest';
export const sendgridSecretName =
  'projects/gigamesh-293109/secrets/sendgrid/versions/latest';

// These constants are used for connecting to the database.
export const databaseUserDevelopment = 'api_development';
export const databaseNameDevelopment = 'gigamesh_development';
export const databaseHostDevelopment = '127.0.0.1';
export const databasePortDevelopment = 5432;
export const databaseUserProduction = 'api_production';
export const databaseNameProduction = 'gigamesh_production';
export const databaseHostProduction =
  '/cloudsql/gigamesh-293109:us-central1:gigamesh-db';
export const databasePortProduction = undefined;

// This is the "from" address for emails.
export const emailSender = {
  email: 'automated@gigamesh.io',
  name: 'Gigamesh',
};

// This is the duration in milliseconds for which a sign up invitation is valid.
export const signUpInvitationLifespanMs = 1000 * 60 * 10; // 10 minutes
