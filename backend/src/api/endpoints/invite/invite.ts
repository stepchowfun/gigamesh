import { InviteRequest, InviteResponse } from 'frontend-lib';
import { Static } from 'runtypes';

import { Envelope } from '../../util/envelope/envelope';
import { getPool } from '../../../storage/storage';
import { normalizeEmail, send } from '../../../email/email';
import { origin } from '../../../constants/constants';

export default async function invite(
  request: Envelope<Static<typeof InviteRequest>>,
): Promise<Envelope<Static<typeof InviteResponse>>> {
  // Always trim user-provided input.
  const trimmedEmail = request.payload.email.trim();

  // Get the database connection pool.
  const pool = await getPool();

  // Query for the user, if it exists.
  const matchingUsers = (
    await pool.query<{ id: string }>(
      'SELECT id FROM "user" WHERE normalized_email = $1 LIMIT 1',
      [normalizeEmail(trimmedEmail)],
    )
  ).rows;

  // Is the user missing?
  if (matchingUsers.length === 0) {
    // The user doesn't exist yet. Create an proposal to sign up.
    const signupProposalId = (
      await pool.query<{ id: string }>(
        'INSERT INTO signup_proposal (email) VALUES ($1) RETURNING id;',
        [trimmedEmail],
      )
    ).rows[0].id;

    // Construct the signup link.
    const signupLink = `${origin()}/sign-up/${signupProposalId}`;

    // Send the proposal to the user.
    await send({
      to: trimmedEmail,
      subject: 'Your Gigamesh invitation',
      text: `Navigate here to get started: ${signupLink}`,
      html: `Click <a href="${signupLink}">here</a> to get started!`,
    });
  } else {
    // The user exists already. Get the user's ID.
    const userId = matchingUsers[0].id;

    // Create an proposal to log in.
    const loginProposalId = (
      await pool.query<{ id: string }>(
        'INSERT INTO login_proposal (user_id) ' +
          'VALUES ($1) ' +
          'RETURNING id;',
        [userId],
      )
    ).rows[0].id;

    // Construct the login link.
    const logInLink = `${origin()}/log-in/${loginProposalId}`;

    // Send the proposal to the user.
    await send({
      to: trimmedEmail,
      subject: 'Your Gigamesh login link',
      text: `Navigate here to log in: ${logInLink}`,
      html: `Click <a href="${logInLink}">here</a> to log in!`,
    });
  }

  // There's nothing useful to return to the client.
  return { payload: {}, sessionId: request.sessionId };
}
