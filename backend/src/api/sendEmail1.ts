import sendgrid from '@sendgrid/mail';
import { Static } from 'runtypes';
import { authenticationEmailSender } from '../shared/constants/constants';
import { getSendgridSecret } from '../secrets/secrets';
import { SendEmail1Request, SendEmail1Response } from '../shared/api/schema';

export default async function sendEmail1(
  request: Omit<Static<typeof SendEmail1Request>, 'type'>,
): Promise<Omit<Static<typeof SendEmail1Response>, 'type'>> {
  // Fetch the SendGrid API key.
  const sendgridApiKey = await getSendgridSecret();

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
