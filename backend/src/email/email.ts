import sendgrid from '@sendgrid/mail';

import { emailSender } from '../constants/constants';
import { getSendgridSecret } from '../secrets/secrets';

export async function send(options: {
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

// Normalize an email address for doing email-based database lookups or
// enforcing uniqueness. This function should not be used to normalize email
// addresses before using them to send email; we leave such normalization up to
// SendGrid.
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase().normalize('NFC');
}
