import { Static } from 'runtypes';
import { SignUpRequest, SignUpResponse } from '../shared/api/schema';
import getPool from '../storage/storage';

export default async function signUp(
  request: Omit<Static<typeof SignUpRequest>, 'type'>,
): Promise<Omit<Static<typeof SignUpResponse>, 'type'>> {
  // Get the database connection pool.
  const pool = await getPool();

  // Query for the invitation.
  const invitation = (
    await pool.query<{ email: string; normalizedEmail: string }>(
      'SELECT email, normalized_email AS normalizedEmail ' +
        'FROM sign_up_invitation ' +
        'WHERE id = $1',
      [request.signUpToken],
    )
  ).rows[0];

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
