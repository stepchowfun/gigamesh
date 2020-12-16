import validateUuid from 'uuid-validate';
import { LogOutRequest, LogOutResponse } from 'frontend-lib';
import { Static } from 'runtypes';

import { Envelope } from '../../util/envelope/envelope';
import { getPool } from '../../../storage/storage';

export default async function logOut(
  request: Envelope<Static<typeof LogOutRequest>>,
): Promise<Envelope<Static<typeof LogOutResponse>>> {
  // Is the session ID missing?
  const { sessionId } = request;
  if (sessionId === null) {
    return { payload: {}, sessionId: null };
  }

  // Validate the session ID.
  if (!validateUuid(sessionId, 4)) {
    return { payload: {}, sessionId: null };
  }

  // Get the database connection pool.
  const pool = await getPool();

  // Delete the session if it exists.
  await pool.query<{}>('DELETE FROM session WHERE id = $1', [sessionId]);

  // There's nothing useful to return to the client.
  return {
    payload: {},
    sessionId: null,
  };
}
