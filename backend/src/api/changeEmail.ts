import { Static } from 'runtypes';

import validateSession from '../session/session';
import { ChangeEmailRequest, ChangeEmailResponse } from '../shared/api/schema';
import { changeEmailinvitationLifespanSinceActiveMs } from '../constants/constants';
import { getPool } from '../storage/storage';
import { normalizeEmail } from '../email/email';

export default async function changeEmail(
  payload: Static<typeof ChangeEmailRequest>['payload'],
): Promise<Static<typeof ChangeEmailResponse>['payload']> {
  // Get the database connection pool.
  const pool = await getPool();

  // Fetch a client from the pool.
  const client = await pool.connect();

  // Wrap everything in a try/finally block to ensure the client is released in
  // the end.
  try {
    // Validate the session and fetch the user ID.
    const userId = await validateSession(payload.sessionId, client);
    if (userId === null) {
      return { type: 'NotLoggedIn' };
    }

    // Fetch and delete the invitation.
    const invitations = (
      await client.query<{
        createdAt: Date;
        userId: string;
        newEmail: string;
      }>(
        'DELETE FROM change_email_invitation ' +
          'WHERE id = $1 ' +
          'RETURNING created_at AS "createdAt", user_id AS "userId", new_email AS "newEmail"',
        [payload.changeEmailInvitationId],
      )
    ).rows;
    if (invitations.length === 0) {
      return { type: 'InvitationExpiredOrInvalid' };
    }
    const invitation = invitations[0];

    // Make sure the invitation hasn't expired.
    if (
      invitation.createdAt.valueOf() +
        changeEmailinvitationLifespanSinceActiveMs <=
      Date.now()
    ) {
      return { type: 'InvitationExpiredOrInvalid' };
    }

    // Make sure the invitation is for this user.
    if (userId !== invitation.userId) {
      return { type: 'InvitationExpiredOrInvalid' };
    }

    // The following operations should happen together or not at all, so we
    // wrap them in a transaction.
    try {
      // Start the transaction.
      await client.query('BEGIN');

      // Fetch the user.
      const user = (
        await client.query<{
          id: string;
          email: string;
          normalizedEmail: string;
        }>(
          'SELECT id, email, normalized_email as "normalizedEmail" ' +
            'FROM "user" ' +
            'WHERE id = $1 ' +
            'LIMIT 1 ' +
            'FOR UPDATE',
          [userId],
        )
      ).rows[0];

      // Create a record of the user's email.
      await client.query<{}>(
        'INSERT INTO previous_user_email (user_id, email, normalized_email) ' +
          'VALUES ($1, $2, $3)',
        [userId, user.email, user.normalizedEmail],
      );

      // Update the user's email.
      await client.query<{}>(
        'UPDATE "user" SET email = $1, normalized_email = $2 WHERE id = $3',
        [invitation.newEmail, normalizeEmail(invitation.newEmail), userId],
      );

      // Commit the transaction.
      await client.query('COMMIT');
    } catch (e) {
      // Something went wrong. Roll back the transaction and rethrow the error.
      await client.query('ROLLBACK');
      throw e;
    }
  } finally {
    // Release the client back to the pool.
    client.release();
  }

  // If we made it this far, the email has been changed.
  return { type: 'Success' };
}
