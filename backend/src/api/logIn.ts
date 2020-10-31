import { Static } from 'runtypes';

import { LogInRequest, LogInResponse } from '../shared/api/schema';
import { getPool } from '../storage/storage';
import { logInInvitationLifespanMs } from '../constants/constants';

export default async function logIn(
  payload: Static<typeof LogInRequest>['payload'],
): Promise<Static<typeof LogInResponse>['payload']> {
  // Get the database connection pool.
  const pool = await getPool();

  // Fetch and delete the invitation.
  const invitations = (
    await pool.query<{
      createdAt: Date;
      userId: string;
    }>(
      'DELETE FROM log_in_invitation ' +
        'WHERE id = $1 ' +
        'RETURNING created_at AS "createdAt", user_id AS "userId"',
      [payload.logInInvitationId],
    )
  ).rows;
  if (invitations.length === 0) {
    return { type: 'InvitationExpiredOrInvalid' };
  }
  const invitation = invitations[0];

  // Check if the invitation has expired.
  if (
    invitation.createdAt.valueOf() + logInInvitationLifespanMs <=
    Date.now()
  ) {
    return { type: 'InvitationExpiredOrInvalid' };
  }

  // Create a session.
  const sessionId = (
    await pool.query<{ id: string }>(
      'INSERT INTO session (user_id) VALUES ($1) RETURNING id;',
      [invitation.userId],
    )
  ).rows[0].id;

  // Return the session token to the client.
  return { type: 'Success', sessionId };
}
