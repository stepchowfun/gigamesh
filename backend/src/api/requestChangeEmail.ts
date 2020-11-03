import { Static } from 'runtypes';

import validateSession from '../session/session';
import {
  RequestChangeEmailRequest,
  RequestChangeEmailResponse,
} from '../shared/api/schema';
import { changeEmailHashPrefix } from '../shared/constants/constants';
import { getPool } from '../storage/storage';
import { origin } from '../constants/constants';
import { send } from '../email/email';

export default async function requestChangeEmail(
  payload: Static<typeof RequestChangeEmailRequest>['payload'],
): Promise<Static<typeof RequestChangeEmailResponse>['payload']> {
  // Always trim user-provided input.
  const trimmedEmail = payload.newEmail.trim();

  // Get the database connection pool.
  const pool = await getPool();

  // Validate the session and fetch the user ID.
  const userId = await validateSession(payload.sessionId, pool);
  if (userId === null) {
    return { type: 'NotLoggedIn' };
  }

  // Create an invitation to change the email.
  const changeEmailInvitationId = (
    await pool.query<{ id: string }>(
      'INSERT INTO change_email_invitation (user_id, new_email) ' +
        'VALUES ($1, $2) ' +
        'RETURNING id;',
      [userId, trimmedEmail],
    )
  ).rows[0].id;

  // Construct the email change link.
  const changeEmailLink = `${origin()}/${changeEmailHashPrefix}${changeEmailInvitationId}`;

  // Send the invitation to the user.
  await send({
    to: trimmedEmail,
    subject: 'Confirm your new email',
    text: `Navigate here to confirm your new email: ${changeEmailLink}`,
    html: `Click <a href="${changeEmailLink}">here</a> to confirm your new email.`,
  });

  // If we made it this far, the invitation has been sent.
  return { type: 'Success' };
}
