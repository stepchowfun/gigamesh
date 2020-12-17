// GCP-specific configuration
const gcpProjectId = 'gigamesh-296502';
const gcpRegion = 'us-central1';

// This is used in a hopefully small number of places to select different logic
// in production than in development/test.
export const isProduction = process.env.NODE_ENV === 'production';

// This is used to generate links in emails and to add canonical URLs to HTTP
// responses.
export const origin = isProduction
  ? 'https://www.gigamesh.io'
  : 'http://localhost:8080';

// This constant points to the secrets in GCP Secret Manager.
export const postgresSecretName = `projects/${gcpProjectId}/secrets/postgres-production/versions/latest`;
export const sendgridSecretName = `projects/${gcpProjectId}/secrets/sendgrid-production/versions/latest`;

// These constants are used for connecting to the database.
export function databaseConnectionInfo(): {
  user: string;
  database: string;
  host: string;
  port: number | undefined;
} {
  if (isProduction) {
    return {
      user: 'production',
      database: 'gigamesh_production',
      host: `/cloudsql/${gcpProjectId}:${gcpRegion}:gigamesh`,
      port: undefined,
    };
  }

  return {
    user: 'development',
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

// This is the maximum duration in milliseconds for which a signup proposal
// is valid.
export const signupProposalLifespanMs = 1000 * 60 * 60 * 24; // 1 day

// This is the maximum duration in milliseconds for which a login proposal
// is valid.
export const loginProposalLifespanMs = 1000 * 60 * 10; // 10 minutes

// This is the maximum duration in milliseconds for which a session is valid.
export const sessionLifespanSinceCreationMs = 1000 * 60 * 60 * 24 * 90; // 90 days

// This is the maximum duration in milliseconds for which a session is valid
// since it was last used.
export const sessionLifespanSinceActiveMs = 1000 * 60 * 60 * 24 * 7; // 7 days

// This is the maximum duration in milliseconds for which an email change
// proposal is valid.
export const emailChangeProposalLifespanMs = 1000 * 60 * 60 * 24 * 7; // 7 days
