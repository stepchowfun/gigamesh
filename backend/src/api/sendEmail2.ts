import { Static } from 'runtypes';
import { authenticationEmailSender } from '../shared/constants/constants';
import { SendEmail2Request, SendEmail2Response } from '../shared/api/schema';
import send from '../email/email';

export default async function sendEmail2(
  request: Omit<Static<typeof SendEmail2Request>, 'type'>,
): Promise<Omit<Static<typeof SendEmail2Response>, 'type'>> {
  // Send an email.
  await send({
    to: 'boyerstephan@gmail.com',
    from: authenticationEmailSender,
    subject: 'This API was called: sendEmail2',
    text: 'Hello, World!',
    html: '<strong>Hello, World!</strong>',
  });

  // Return a response to the client.
  return {
    newAge: request.age * 3,
  };
}
