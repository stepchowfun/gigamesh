import { Static } from 'runtypes';
import { SignUpRequest, SignUpResponse } from '../shared/api/schema';
import { signUpInvitationLifespanMs } from '../constants/constants';
import getPool from '../storage/storage';

export default async function signUp(
  request: Omit<Static<typeof SignUpRequest>, 'type'>,
): Promise<Omit<Static<typeof SignUpResponse>, 'type'>> {
  // Get the database connection pool.
  const pool = await getPool();

  // Query for the invitation.
  const invitation = (
    await pool.query<{
      createdAt: Date;
      email: string;
      normalizedEmail: string;
    }>(
      'SELECT created_at AS "createdAt", email, normalized_email AS "normalizedEmail" ' +
        'FROM sign_up_invitation ' +
        'WHERE id = $1',
      [request.signUpToken],
    )
  ).rows[0];

  // Check if the invitation has expired.
  if (
    invitation.createdAt.valueOf() + signUpInvitationLifespanMs <=
    Date.now()
  ) {
    throw new Error('The sign up invitation has expired.');
  }

  // Create the user.
  const userId = (
    await pool.query<{ id: string }>(
      'INSERT INTO "user" (email, normalized_email) ' +
        'VALUES ($1, $2) ' +
        'RETURNING id;',
      [invitation.email, invitation.normalizedEmail],
    )
  ).rows[0].id;

  // Create a session.
  const sessionToken = (
    await pool.query<{ id: string }>(
      'INSERT INTO session (user_id) VALUES ($1) RETURNING id;',
      [userId],
    )
  ).rows[0].id;

  // Return the session token to the client.
  return { sessionToken };
}
