import sendgrid from '@sendgrid/mail';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import {
  authenticationEmailSender,
  sendgridApiKeySecretName,
} from '../shared/constants/constants';
import { ApiRequest, ApiResponse } from '../shared/api/api';
import { isProduction } from '../shared/environment/environment';

// Create a secret manager once rather than in every request.
const secretManager = new SecretManagerServiceClient();

export default async function api(request: ApiRequest): Promise<ApiResponse> {
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
    subject: 'Sending with Twilio SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  });

  // Return a response to the client.
  return Promise.resolve({ newAge: request.age * 2 });
}
