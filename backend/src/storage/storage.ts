import { Pool } from 'pg';

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
): Promise<string | null> {
  // Fetch the session.
  const sessions = (
    await (await getPool()).query<{
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

  // If we made it this far, the session is legitimate. Return the user ID.
  return session.userId;
}
