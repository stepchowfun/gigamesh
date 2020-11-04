import { Static } from 'runtypes';

import validateSession from '../session/session';
import { GetUserRequest, GetUserResponse } from '../shared/api/schema';
import { getPool } from '../storage/storage';

export default async function getUser(
  payload: Static<typeof GetUserRequest>['payload'],
): Promise<Static<typeof GetUserResponse>['payload']> {
  // Get the database connection pool.
  const pool = await getPool();

  // Validate the session and fetch the user ID.
  const userId = await validateSession(payload.sessionId, pool);
  if (userId === null) {
    return { type: 'NotLoggedIn' };
  }

  // Fetch the user.
  const user = (
    await pool.query<{
      email: string;
    }>('SELECT email FROM "user" WHERE id = $1 LIMIT 1', [userId])
  ).rows[0];

  // If we made it this far, the deletion was successful.
  return { type: 'Success', email: user.email };
}
