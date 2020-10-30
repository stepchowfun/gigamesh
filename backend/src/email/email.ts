import sendgrid from '@sendgrid/mail';
import { emailSender } from '../constants/constants';
import { getSendgridSecret } from '../secrets/secrets';

export default async function send(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  // Configure SendGrid.
  sendgrid.setApiKey(await getSendgridSecret());

  // Send the email.
  await sendgrid.send({ ...options, from: emailSender });
}
