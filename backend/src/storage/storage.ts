import { Client, Pool } from 'pg';

import {
  databaseConnectionInfo,
  sessionLifespanSinceActiveMs,
  sessionLifespanSinceCreationMs,
} from '../constants/constants';
import { getPostgresSecret } from '../secrets/secrets';

let pool: Pool | null = null;

export const enum ErrorCode {
  UniquenessViolation = '23505',
}

export async function getPool(): Promise<Pool> {
  if (pool === null) {
    pool = new Pool({
      ...databaseConnectionInfo(),
      password: await getPostgresSecret(),
    });
  }

  return pool;
}

export async function sessionIdToUserId(
  sessionId: string,
  connection?: Client | Pool,
): Promise<string | null> {
  // Make sure we have a client.
  let clientOrPool = connection;
  if (clientOrPool === undefined) {
    clientOrPool = await getPool();
  }

  // Fetch the session.
  const sessions = (
    await clientOrPool.query<{
      createdAt: Date;
      refreshedAt: Date;
      userId: string;
    }>(
      'SELECT created_at AS "createdAt", refreshed_at AS "refreshedAt", user_id AS "userId" ' +
        'FROM session ' +
        'WHERE id = $1 ' +
        'LIMIT 1',
      [sessionId],
    )
  ).rows;
  if (sessions.length === 0) {
    return null;
  }
  const session = sessions[0];

  // Make sure the session hasn't expired.
  if (
    session.createdAt.valueOf() + sessionLifespanSinceCreationMs <=
      Date.now() ||
    session.refreshedAt.valueOf() + sessionLifespanSinceActiveMs <= Date.now()
  ) {
    return null;
  }

  // Refresh the session.
  await clientOrPool.query<{}>(
    'UPDATE session SET refreshed_at = now() WHERE id = $1',
    [sessionId],
  );

  // If we made it this far, the session is legitimate. Return the user ID.
  return session.userId;
}
