import { Static } from 'runtypes';

import { LogOutRequest, LogOutResponse } from '../shared/api/schema';
import { getPool } from '../storage/storage';

export default async function logOut(
  payload: Static<typeof LogOutRequest>['payload'],
): Promise<Static<typeof LogOutResponse>['payload']> {
  // Get the database connection pool.
  const pool = await getPool();

  // Delete the session if it exists.
  await pool.query<{}>('DELETE FROM session WHERE id = $1 ', [
    payload.sessionId,
  ]);

  // There's nothing useful to return to the client.
  return {};
}
