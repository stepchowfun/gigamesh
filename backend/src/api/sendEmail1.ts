import sendgrid from '@sendgrid/mail';
import { Static } from 'runtypes';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import {
  authenticationEmailSender,
  sendgridApiKeySecretName,
} from '../shared/constants/constants';
import { SendEmail1Request, SendEmail1Response } from '../shared/api/schema';
import { isProduction } from '../shared/environment/environment';

// Create a secret manager once rather than in every request.
const secretManager = new SecretManagerServiceClient();

export default async function sendEmail1(
  request: Omit<Static<typeof SendEmail1Request>, 'type'>,
): Promise<Omit<Static<typeof SendEmail1Response>, 'type'>> {
  // Fetch the SendGrid API key.
  const sendgridApiKey = await (async (): Promise<string> => {
    if (isProduction()) {
      const [accessResponse] = await secretManager.accessSecretVersion({
        name: sendgridApiKeySecretName,
      });

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return accessResponse.payload!.data!.toString();
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return process.env.SENDGRID_API_KEY!;
  })();

  // Configure SendGrid.
  sendgrid.setApiKey(sendgridApiKey);

  // Send an email.
  await sendgrid.send({
    to: 'boyerstephan@gmail.com',
    from: authenticationEmailSender,
    subject: 'This API was called: sendEmail1',
    text: 'Hello, World!',
    html: '<strong>Hello, World!</strong>',
  });

  // Return a response to the client.
  return Promise.resolve({
    newAge: request.age * 2,
  });
}
