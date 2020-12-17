import { GetHomeDataRequest, GetHomeDataResponse } from 'frontend-lib';
import { Static } from 'runtypes';

import validateSession from '../../util/session/session';
import { Envelope } from '../../util/envelope/envelope';
import { getPool } from '../../../storage/storage';

export default async function getHomeData(
  request: Envelope<Static<typeof GetHomeDataRequest>>,
): Promise<Envelope<Static<typeof GetHomeDataResponse>>> {
  // Is the session ID missing?
  const { sessionId } = request;
  if (sessionId === null) {
    return { payload: { type: 'NotLoggedIn' }, sessionId: null };
  }

  // Get the database connection pool.
  const pool = await getPool();

  // Validate the session and fetch the user ID.
  const userId = await validateSession(sessionId, pool);
  if (userId === null) {
    return { payload: { type: 'NotLoggedIn' }, sessionId: null };
  }

  // Fetch the user.
  const user = (
    await pool.query<{
      email: string;
    }>('SELECT email FROM "user" WHERE id = $1 LIMIT 1', [userId])
  ).rows[0];

  // There's nothing useful to return to the client.
  return {
    payload: { type: 'Success', user: { email: user.email } },
    sessionId,
  };
}
