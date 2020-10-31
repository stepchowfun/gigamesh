import { Static } from 'runtypes';
import { SignUpRequest, SignUpResponse } from '../shared/api/schema';
import { signUpInvitationLifespanMs } from '../constants/constants';
import { ErrorCode, getPool } from '../storage/storage';

export default async function signUp(
  payload: Static<typeof SignUpRequest>['payload'],
): Promise<Static<typeof SignUpResponse>['payload']> {
  // Get the database connection pool.
  const pool = await getPool();

  // Query for the invitation.
  const invitations = (
    await pool.query<{
      createdAt: Date;
      email: string;
      normalizedEmail: string;
    }>(
      'SELECT created_at AS "createdAt", email, normalized_email AS "normalizedEmail" ' +
        'FROM sign_up_invitation ' +
        'WHERE id = $1',
      [payload.signUpInvitationId],
    )
  ).rows;
  if (invitations.length === 0) {
    return { type: 'InvitationExpiredOrInvalid' };
  }
  const invitation = invitations[0];

  // Check if the invitation has expired.
  if (
    invitation.createdAt.valueOf() + signUpInvitationLifespanMs <=
    Date.now()
  ) {
    return { type: 'InvitationExpiredOrInvalid' };
  }

  // Create the user.
  let userId;
  try {
    userId = (
      await pool.query<{ id: string }>(
        'INSERT INTO "user" (email, normalized_email) ' +
          'VALUES ($1, $2) ' +
          'RETURNING id;',
        [invitation.email, invitation.normalizedEmail],
      )
    ).rows[0].id;
  } catch (e) {
    if (e.code === ErrorCode.UniquenessViolation) {
      return { type: 'UserAlreadyExists' };
    }

    throw e;
  }

  // Create a session.
  const sessionId = (
    await pool.query<{ id: string }>(
      'INSERT INTO session (user_id) VALUES ($1) RETURNING id;',
      [userId],
    )
  ).rows[0].id;

  // Return the session token to the client.
  return { type: 'SignUpSuccessful', sessionId };
}
