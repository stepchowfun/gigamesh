import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { isProduction } from '../shared/environment/environment';
import {
  postgresSecretName,
  sendgridSecretName,
} from '../shared/constants/constants';

// Create a secret manager once rather than in every request.
const secretManager = new SecretManagerServiceClient();

// Cache production secrets so we don't have to query Secret Manager every time.
const secretCache = new Map();

async function readProductionSecret(secretName: string): Promise<string> {
  if (secretCache.has(secretName)) {
    return secretCache.get(secretName);
  }

  const [accessResponse] = await secretManager.accessSecretVersion({
    name: secretName,
  });

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const secret = accessResponse.payload!.data!.toString();

  secretCache.set(secretName, secret);

  return secret;
}

export async function getPostgresSecret(): Promise<string> {
  if (isProduction()) {
    return readProductionSecret(postgresSecretName);
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return Promise.resolve(process.env.POSTGRES_API_KEY!); // [tag:POSTGRES_API_KEY]
}

export async function getSendgridSecret(): Promise<string> {
  if (isProduction()) {
    return readProductionSecret(sendgridSecretName);
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return Promise.resolve(process.env.SENDGRID_API_KEY!); // [tag:SENDGRID_API_KEY]
}
