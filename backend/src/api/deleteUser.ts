import { Static } from 'runtypes';

import validateSession from '../session/session';
import { DeleteUserRequest, DeleteUserResponse } from '../shared/api/schema';
import { getPool } from '../storage/storage';

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
    // Validate the session and fetch the user ID.
    const userId = await validateSession(payload.sessionId, client);
    if (userId === null) {
      return { type: 'NotLoggedIn' };
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
          deleted: boolean;
        }>(
          'SELECT id, email, normalized_email as "normalizedEmail", deleted ' +
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
        return { type: 'NotLoggedIn' };
      }

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
