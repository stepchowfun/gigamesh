import { Static } from 'runtypes';

import { DeleteUserRequest, DeleteUserResponse } from '../shared/api/schema';
import { getPool } from '../storage/storage';
import validateSession from '../session/session';

export default async function deleteUser(
  payload: Static<typeof DeleteUserRequest>['payload'],
): Promise<Static<typeof DeleteUserResponse>['payload']> {
  // Get the database connection pool.
  const pool = await getPool();

  // Fetch a client from the pool.
  const client = await pool.connect();

  // Wrap everything in a try/finally block to ensure the client is released in
  // the end.
  try {
    // Fetch the user ID.
    const userId = await validateSession(payload.sessionId, client);
    if (userId === null) {
      return { type: 'NotLoggedIn' };
    }

    // Delete any sessions for the user.
    await client.query<{}>('DELETE FROM session WHERE user_id = $1', [userId]);

    // Delete any log in invitations for the user.
    await client.query<{}>('DELETE FROM log_in_invitation WHERE user_id = $1', [
      userId,
    ]);

    // Fetch the user.
    const user = (
      await client.query<{
        id: string;
        email: string;
        normalizedEmail: string;
      }>(
        'SELECT id, email, normalized_email as "normalizedEmail" ' +
          'FROM "user" ' +
          'WHERE id = $1 ' +
          'LIMIT 1',
        [userId],
      )
    ).rows[0];

    // The next two operations should happen together or not at all, so we wrap
    // them in a transaction.
    try {
      // Start the transaction.
      await client.query('BEGIN');

      // Create a record of the user's email.
      await client.query<{}>(
        'INSERT INTO previous_user_email (user_id, email, normalized_email) ' +
          'VALUES ($1, $2, $3)',
        [userId, user.email, user.normalizedEmail],
      );

      // Mark the user as deleted.
      await client.query<{}>(
        'UPDATE "user" ' +
          'SET email = NULL, normalized_email = NULL, deleted = true ' +
          'WHERE id = $1',
        [userId],
      );

      // Commit the transaction.
      await client.query('COMMIT');
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
  return { type: 'Success' };
}
