import {
  ProposeEmailChangeRequest,
  ProposeEmailChangeResponse,
  changeEmailWebRoute,
} from 'frontend-lib';
import { Static } from 'runtypes';

import validateSession from '../../util/session/session';
import { Envelope } from '../../util/envelope/envelope';
import { getPool } from '../../../storage/storage';
import { origin } from '../../../constants/constants';
import { send } from '../../../email/email';

export default async function proposeEmailChange(
  request: Envelope<Static<typeof ProposeEmailChangeRequest>>,
): Promise<Envelope<Static<typeof ProposeEmailChangeResponse>>> {
  // Is the session ID missing?
  const { sessionId } = request;
  if (sessionId === null) {
    return { payload: { type: 'NotLoggedIn' }, sessionId: null };
  }

  // Always trim user-provided input.
  const trimmedEmail = request.payload.newEmail.trim();

  // Get the database connection pool.
  const pool = await getPool();

  // Validate the session and fetch the user ID.
  const userId = await validateSession(sessionId, pool);
  if (userId === null) {
    return { payload: { type: 'NotLoggedIn' }, sessionId: null };
  }

  // Create an proposal to change the email.
  const emailChangeProposalId = (
    await pool.query<{ id: string }>(
      'INSERT INTO email_change_proposal (user_id, new_email) ' +
        'VALUES ($1, $2) ' +
        'RETURNING id;',
      [userId, trimmedEmail],
    )
  ).rows[0].id;

  // Construct the email change link.
  const emailChangeLink = `${origin}${changeEmailWebRoute(
    emailChangeProposalId,
  )}`;

  // Send the proposal to the user.
  await send({
    to: trimmedEmail,
    subject: 'Confirm your new email',
    text: `Navigate here to confirm your new email: ${emailChangeLink}`,
    html: `Click <a href="${emailChangeLink}">here</a> to confirm your new email.`,
  });

  // If we made it this far, the deletion was successful.
  return {
    payload: { type: 'Success' },
    sessionId: request.sessionId,
  };
}
