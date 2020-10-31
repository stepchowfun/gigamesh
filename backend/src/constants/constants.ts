import { isProduction } from '../shared/constants/constants';

// These two constants are used for two things:
// 1. to set CORS headers in API responses and
// 2. to generate links in emails.
export function origin(): string {
  if (isProduction()) {
    return 'https://www.gigamesh.io';
  }

  return 'http://localhost:8080';
}

// This constant points to the secrets in GCP Secret Manager.
export const postgresSecretName =
  'projects/gigamesh-293109/secrets/postgres-api/versions/latest';
export const sendgridSecretName =
  'projects/gigamesh-293109/secrets/sendgrid/versions/latest';

// These constants are used for connecting to the database.
export function databaseConnectionInfo(): {
  user: string;
  database: string;
  host: string;
  port: number | undefined;
} {
  if (isProduction()) {
    return {
      user: 'api_production',
      database: 'gigamesh_production',
      host: '/cloudsql/gigamesh-293109:us-central1:gigamesh-db',
      port: undefined,
    };
  }

  return {
    user: 'api_development',
    database: 'gigamesh_development',
    host: '127.0.0.1',
    port: 5432,
  };
}

// This is the "from" address for emails.
export const emailSender = {
  email: 'automated@gigamesh.io',
  name: 'Gigamesh',
};

// This is the maximum duration in milliseconds for which a sign up invitation
// is valid.
export const signUpInvitationLifespanMs = 1000 * 60 * 60 * 24; // 1 day

// This is the maximum duration in milliseconds for which a log in invitation
// is valid.
export const logInInvitationLifespanMs = 1000 * 60 * 10; // 10 minutes

// This is the maximum duration in milliseconds for which a session is valid
// since it was created.
export const sessionLifespanSinceCreationMs = 1000 * 60 * 60 * 24 * 90; // 90 days

// This is the maximum duration in milliseconds for which a session is valid
// since it was active.
export const sessionLifespanSinceActiveMs = 1000 * 60 * 60 * 24 * 7; // 7 days
