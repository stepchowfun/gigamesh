import { Static } from 'runtypes';

import { InviteRequest, InviteResponse } from '../shared/api/schema';
import { getPool } from '../storage/storage';
import { origin } from '../constants/constants';
import {
  logInHashPrefix,
  signUpHashPrefix,
} from '../shared/constants/constants';
import { normalizeEmail, send } from '../email/email';

export default async function invite(
  payload: Static<typeof InviteRequest>['payload'],
): Promise<Static<typeof InviteResponse>['payload']> {
  // Always trim user-provided input.
  const trimmedEmail = payload.email.trim();

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
    // The user doesn't exist yet. Create an invitation to sign up.
    const signUpInvitationId = (
      await pool.query<{ id: string }>(
        'INSERT INTO sign_up_invitation (email) VALUES ($1) RETURNING id;',
        [trimmedEmail],
      )
    ).rows[0].id;

    // Construct the sign up link.
    const signUpLink = `${origin()}/${signUpHashPrefix}${signUpInvitationId}`;

    // Send the invitation to the user.
    await send({
      to: trimmedEmail,
      subject: 'Your Gigamesh invitation',
      text: `Navigate here to get started: ${signUpLink}`,
      html: `Click <a href="${signUpLink}">here</a> to get started!`,
    });
  } else {
    // The user exists already. Get the user's ID.
    const userId = matchingUsers[0].id;

    // Create an invitation to log in.
    const logInInvitationId = (
      await pool.query<{ id: string }>(
        'INSERT INTO log_in_invitation (user_id) ' +
          'VALUES ($1) ' +
          'RETURNING id;',
        [userId],
      )
    ).rows[0].id;

    // Construct the log in link.
    const logInLink = `${origin()}/${logInHashPrefix}${logInInvitationId}`;

    // Send the invitation to the user.
    await send({
      to: trimmedEmail,
      subject: 'Your Gigamesh log in link',
      text: `Navigate here to log in: ${logInLink}`,
      html: `Click <a href="${logInLink}">here</a> to log in!`,
    });
  }

  // There's nothing useful to return to the client.
  return {};
}
