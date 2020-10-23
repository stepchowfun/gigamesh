import { Static } from 'runtypes';
import { fromEmailAddress } from '../shared/constants/constants';
import { EmailDemoRequest, EmailDemoResponse } from '../shared/api/schema';
import send from '../email/email';

export default async function emailDemo(
  request: Omit<Static<typeof EmailDemoRequest>, 'type'>,
): Promise<Omit<Static<typeof EmailDemoResponse>, 'type'>> {
  // Send an email.
  await send({
    to: 'boyerstephan@gmail.com',
    from: fromEmailAddress,
    subject: 'Hello from Gigamesh!',
    text: 'Hello, World!',
    html: '<strong>Hello, World!</strong>',
  });

  // Return a response to the client.
  return {
    newAge: request.age * 2,
  };
}
