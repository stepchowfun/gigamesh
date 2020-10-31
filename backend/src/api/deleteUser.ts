import { Static } from 'runtypes';

import { DeleteUserRequest, DeleteUserResponse } from '../shared/api/schema';
import { getPool } from '../storage/storage';
import {
  sessionLifespanSinceActiveMs,
  sessionLifespanSinceCreationMs,
} from '../constants/constants';

export default async function deleteUser(
  payload: Static<typeof DeleteUserRequest>['payload'],
): Promise<Static<typeof DeleteUserResponse>['payload']> {
  // Get the database connection pool.
  const pool = await getPool();

  // Fetch a client from the pool.
  const client = await pool.connect();

  // Wrap everything in a try/catch/finally block so we can roll back the
  // transaction if needed and release the client back to the pool.
  try {
    // Start the transaction. The motivation for the transaction is to ensure
    // that the user being (fake) deleted and the `previous_user_email` row
    // being created both happen or neither happens at all.
    await client.query('BEGIN');

    // Fetch the session.
    const sessions = (
      await client.query<{
        createdAt: Date;
        refreshedAt: Date;
        userId: string;
      }>(
        'SELECT create_at AS "createdAt", refreshed_at AS "refreshedAt", user_id AS "userId" ' +
          'FROM session ' +
          'WHERE id = $1 ' +
          'LIMIT 1',
        [payload.sessionId],
      )
    ).rows;
    if (sessions.length === 0) {
      await client.query('ROLLBACK');
      return { type: 'NotLoggedIn' };
    }
    const session = sessions[0];

    // Make sure the session hasn't expired.
    if (
      session.createdAt.valueOf() + sessionLifespanSinceCreationMs <=
        Date.now() ||
      session.refreshedAt.valueOf() + sessionLifespanSinceActiveMs <= Date.now()
    ) {
      return { type: 'NotLoggedIn' };
    }

    // Delete any sessions for the user.
    await client.query<{}>('DELETE FROM session WHERE user_id = $1', [
      session.userId,
    ]);

    // Delete any log in invitations for the user.
    await client.query<{}>('DELETE FROM log_in_invitation WHERE user_id = $1', [
      session.userId,
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
        [session.userId],
      )
    ).rows[0];

    // Create a record of the user's email.
    await client.query<{}>(
      'INSERT INTO previous_user_email (user_id, email, normalized_email) ' +
        'VALUES ($1, $2, $3)',
      [session.userId, user.email, user.normalizedEmail],
    );

    // Mark the user as deleted.
    await client.query<{}>(
      'UPDATE "user" ' +
        'SET email = NULL, normalized_email = NULL, deleted = true ' +
        'WHERE id = $1',
      [session.userId],
    );

    // Commit the transaction.
    await client.query('COMMIT');
  } catch (e) {
    // Something went wrong. Roll back the transaction and rethrow the error.
    await client.query('ROLLBACK');
    throw e;
  } finally {
    // Release the client back to the pool no matter what.
    client.release();
  }

  // If we made it this far, the deletion was successful.
  return { type: 'Success' };
}
