import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

import { isProduction } from '../shared/constants/constants';
import { postgresSecretName, sendgridSecretName } from '../constants/constants';

// Create a secret manager once rather than in every request.
const secretManager = new SecretManagerServiceClient();

// Cache production secrets so we don't have to query Secret Manager every time.
const secretCache = new Map();

async function readSecret(
  secretName: string,
  envVarName: string,
): Promise<string> {
  // Check the cache.
  if (secretCache.has(secretName)) {
    // It was a cache hit. Return early.
    return secretCache.get(secretName);
  }

  // It was a cache miss. Are we in production mode?
  if (isProduction()) {
    // We're in production mode. Query Secret Manager.
    const [accessResponse] = await secretManager.accessSecretVersion({
      name: secretName,
    });

    // Extract the secret from the response.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const secret = accessResponse.payload!.data!.toString();

    // Cache the secret for next time.
    secretCache.set(secretName, secret);

    // Return it.
    return secret;
  }

  // We're in development mode. Read the appropriate environment variable.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const secret = process.env[envVarName]!;

  // Cache the secret for next time.
  secretCache.set(secretName, secret);

  // Return it.
  return secret;
}

export async function getPostgresSecret(): Promise<string> {
  // [tag:POSTGRES_SECRET]
  return readSecret(postgresSecretName, 'POSTGRES_SECRET');
}

export async function getSendgridSecret(): Promise<string> {
  // [tag:SENDGRID_SECRET]
  return readSecret(sendgridSecretName, 'SENDGRID_SECRET');
}
