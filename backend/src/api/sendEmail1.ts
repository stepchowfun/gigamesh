import { Static } from 'runtypes';
import { authenticationEmailSender } from '../shared/constants/constants';
import { SendEmail1Request, SendEmail1Response } from '../shared/api/schema';
import send from '../email/email';

export default async function sendEmail1(
  request: Omit<Static<typeof SendEmail1Request>, 'type'>,
): Promise<Omit<Static<typeof SendEmail1Response>, 'type'>> {
  // Send an email.
  await send({
    to: 'boyerstephan@gmail.com',
    from: authenticationEmailSender,
    subject: 'This API was called: sendEmail1',
    text: 'Hello, World!',
    html: '<strong>Hello, World!</strong>',
  });

  // Return a response to the client.
  return {
    newAge: request.age * 2,
  };
}
