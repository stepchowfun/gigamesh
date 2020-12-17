import { DeleteUserRequest, DeleteUserResponse } from 'frontend-lib';
import { Static } from 'runtypes';

import validateSession from '../../util/session/session';
import { Envelope } from '../../util/envelope/envelope';
import { getPool } from '../../../storage/storage';
import { send } from '../../../email/email';

export default async function deleteUser(
  request: Envelope<Static<typeof DeleteUserRequest>>,
): Promise<Envelope<Static<typeof DeleteUserResponse>>> {
  // Is the session ID missing?
  const { sessionId } = request;
  if (sessionId === null) {
    return { payload: { type: 'NotLoggedIn' }, sessionId: null };
  }

  // Get the database connection pool.
  const pool = await getPool();

  // Fetch a client from the pool.
  const client = await pool.connect();

  // Wrap everything in a try/finally block to ensure the client is released in
  // the end.
  try {
    // Validate the session and fetch the user ID.
    const userId = await validateSession(sessionId, client);
    if (userId === null) {
      return { payload: { type: 'NotLoggedIn' }, sessionId: null };
    }

    // Delete any sessions for the user.
    await client.query<{}>('DELETE FROM session WHERE user_id = $1', [userId]);

    // Delete any login proposals for the user.
    await client.query<{}>('DELETE FROM login_proposal WHERE user_id = $1', [
      userId,
    ]);

    // The following operations should happen together or not at all, so we
    // wrap them in a transaction.
    try {
      // Start the transaction.
      await client.query('BEGIN');

      // Fetch the user.
      const user = (
        await client.query<{
          id: string;
          email: string;
          normalizedEmail: string;
          previousUserEmailId: string | null;
          deleted: boolean;
        }>(
          'SELECT ' +
            '  id, ' +
            '  email, ' +
            '  normalized_email as "normalizedEmail", ' +
            '  deleted, ' +
            '  previous_user_email_id AS "previousUserEmailId" ' +
            'FROM "user" ' +
            'WHERE id = $1 ' +
            'LIMIT 1 ' +
            'FOR UPDATE',
          [userId],
        )
      ).rows[0];

      // Make sure the user hasn't already been deleted. The `validateSession`
      // call above already performed this check, but we do it again here while
      // the user row is locked to prevent multiple deletions of the same user
      // (which would result in duplicate rows being inserted into the
      // `previous_user_email` table).
      if (user.deleted) {
        return {
          payload: { type: 'NotLoggedIn' },
          sessionId: null,
        };
      }

      // Create a record of the user's email.
      const newPreviousUserEmailId = (
        await client.query<{ id: string }>(
          'INSERT INTO previous_user_email (email, normalized_email, previous_user_email_id) ' +
            'VALUES ($1, $2, $3) ' +
            'RETURNING id;',
          [user.email, user.normalizedEmail, user.previousUserEmailId],
        )
      ).rows[0].id;

      // Mark the user as deleted.
      await client.query<{}>(
        'UPDATE "user" ' +
          'SET ' +
          '  email = NULL, ' +
          '  normalized_email = NULL, ' +
          '  previous_user_email_id = $1, ' +
          '  deleted = true ' +
          'WHERE id = $2',
        [newPreviousUserEmailId, userId],
      );

      // Commit the transaction.
      await client.query('COMMIT');

      // Send an email notification to the user.
      await send({
        to: user.email, // The old email
        subject: 'Your Gigamesh account has been deleted',
        text: 'At your request, your Gigamesh account has been deleted.',
        html: 'At your request, your Gigamesh account has been deleted.',
      });
    } catch (e) {
      // Something went wrong. Roll back the transaction and rethrow the error.
      await client.query('ROLLBACK');
      throw e;
    }
  } finally {
    // Release the client back to the pool.
    client.release();
  }

  // If we made it this far, the deletion was successful.
  return {
    payload: { type: 'Success' },
    sessionId: null,
  };
}
