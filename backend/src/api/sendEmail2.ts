import sendgrid from '@sendgrid/mail';
import { Static } from 'runtypes';
import { authenticationEmailSender } from '../shared/constants/constants';
import { getSendgridSecret } from '../secrets/secrets';
import { SendEmail2Request, SendEmail2Response } from '../shared/api/schema';

export default async function sendEmail2(
  request: Omit<Static<typeof SendEmail2Request>, 'type'>,
): Promise<Omit<Static<typeof SendEmail2Response>, 'type'>> {
  // Fetch the SendGrid API key.
  const sendgridApiKey = await getSendgridSecret();

  // Configure SendGrid.
  sendgrid.setApiKey(sendgridApiKey);

  // Send an email.
  await sendgrid.send({
    to: 'boyerstephan@gmail.com',
    from: authenticationEmailSender,
    subject: 'This API was called: sendEmail2',
    text: 'Hello, World!',
    html: '<strong>Hello, World!</strong>',
  });

  // Return a response to the client.
  return Promise.resolve({
    newAge: request.age * 3,
  });
}
