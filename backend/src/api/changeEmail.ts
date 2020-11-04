import { Static } from 'runtypes';

import validateSession from '../session/session';
import { ChangeEmailRequest, ChangeEmailResponse } from '../shared/api/schema';
import { emailChangeProposalLifespanMs } from '../constants/constants';
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

    // Fetch and delete the proposal.
    const proposals = (
      await client.query<{
        createdAt: Date;
        userId: string;
        newEmail: string;
      }>(
        'DELETE FROM email_change_proposal ' +
          'WHERE id = $1 ' +
          'RETURNING created_at AS "createdAt", user_id AS "userId", new_email AS "newEmail"',
        [payload.emailChangeProposalId],
      )
    ).rows;
    if (proposals.length === 0) {
      return { type: 'ProposalExpiredOrInvalid' };
    }
    const proposal = proposals[0];

    // Make sure the proposal hasn't expired.
    if (
      proposal.createdAt.valueOf() + emailChangeProposalLifespanMs <=
      Date.now()
    ) {
      return { type: 'ProposalExpiredOrInvalid' };
    }

    // Make sure the proposal is for this user.
    if (userId !== proposal.userId) {
      return { type: 'ProposalExpiredOrInvalid' };
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
          previousUserEmailId: string | null;
        }>(
          'SELECT ' +
            '  id, ' +
            '  email, ' +
            '  normalized_email as "normalizedEmail", ' +
            '  previous_user_email_id AS "previousUserEmailId" ' +
            'FROM "user" ' +
            'WHERE id = $1 ' +
            'LIMIT 1 ' +
            'FOR UPDATE',
          [userId],
        )
      ).rows[0];

      // Create a record of the user's email.
      const newPreviousUserEmailId = (
        await client.query<{ id: string }>(
          'INSERT INTO previous_user_email (email, normalized_email, previous_user_email_id) ' +
            'VALUES ($1, $2, $3) ' +
            'RETURNING id;',
          [user.email, user.normalizedEmail, user.previousUserEmailId],
        )
      ).rows[0].id;

      // Update the user's email.
      await client.query<{}>(
        'UPDATE "user" ' +
          'SET ' +
          '  email = $1, ' +
          '  normalized_email = $2, ' +
          '  previous_user_email_id = $3 ' +
          'WHERE id = $4',
        [
          proposal.newEmail,
          normalizeEmail(proposal.newEmail),
          newPreviousUserEmailId,
          userId,
        ],
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
