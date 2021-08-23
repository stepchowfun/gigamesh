import { ChangeEmailRequest, ChangeEmailResponse } from 'frontend-lib';
import { Static } from 'runtypes';

import validateSession from '../../util/session/session';
import { Envelope } from '../../util/envelope/envelope';
import { emailChangeProposalLifespanMs } from '../../../constants/constants';
import { ErrorCode, getPool } from '../../../storage/storage';
import { normalizeEmail, send } from '../../../email/email';

export default async function changeEmail(
  request: Envelope<Static<typeof ChangeEmailRequest>>,
): Promise<Envelope<Static<typeof ChangeEmailResponse>>> {
  // Is the session ID missing?
  const { sessionId } = request;
  if (sessionId === null) {
    return { payload: { type: 'NotLoggedIn' }, sessionId: null };
  }

  // Get the database connection pool.
  const pool = await getPool();

  // Fetch a client from the pool.
  const client = await pool.connect();

  // Wrap everything in a try/finally block to ensure the client is released in
  // the end.
  try {
    // Validate the session and fetch the user ID.
    const userId = await validateSession(sessionId, client);
    if (userId === null) {
      return {
        payload: { type: 'NotLoggedIn' },
        sessionId: null,
      };
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
        [request.payload.emailChangeProposalId],
      )
    ).rows;
    if (proposals.length === 0) {
      return {
        payload: { type: 'ProposalExpiredOrInvalid' },
        sessionId,
      };
    }
    const proposal = proposals[0];

    // Make sure the proposal hasn't expired.
    if (
      proposal.createdAt.valueOf() + emailChangeProposalLifespanMs <=
      Date.now()
    ) {
      return {
        payload: { type: 'ProposalExpiredOrInvalid' },
        sessionId,
      };
    }

    // Make sure the proposal is for this user.
    if (userId !== proposal.userId) {
      return {
        payload: { type: 'ProposalExpiredOrInvalid' },
        sessionId,
      };
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

      // Send an email notification to the user.
      await send({
        to: user.email, // The old email
        subject: 'Your Gigamesh email address has changed',
        text: "The email address on your Gigamesh account has been changed. It's no longer this address.",
        html: "The email address on your Gigamesh account has been changed. It's no longer this address.",
      });

      // If we made it this far, the email has been changed.
      return {
        payload: { type: 'Success' },
        sessionId,
      };
    } catch (e) {
      // Something went wrong. Roll back the transaction and rethrow the error.
      await client.query('ROLLBACK');

      // Warning: TypeScript considers `e` to have type `any`, even though
      // `unknown` would have been more appropriate.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (e.code === ErrorCode.UniquenessViolation) {
        return {
          payload: { type: 'ProposalExpiredOrInvalid' },
          sessionId,
        };
      }

      throw e;
    }
  } finally {
    // Release the client back to the pool.
    client.release();
  }
}
