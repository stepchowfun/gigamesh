import { Static } from 'runtypes';

import { ErrorCode, getPool } from '../storage/storage';
import { SignUpRequest, SignUpResponse } from '../frontend/api/schema';
import { normalizeEmail } from '../email/email';
import { signupProposalLifespanMs } from '../constants/constants';

export default async function signUp(
  payload: Static<typeof SignUpRequest>['payload'],
): Promise<Static<typeof SignUpResponse>['payload']> {
  // Get the database connection pool.
  const pool = await getPool();

  // Fetch and delete the proposal.
  const proposals = (
    await pool.query<{
      createdAt: Date;
      email: string;
    }>(
      'DELETE FROM signup_proposal ' +
        'WHERE id = $1 ' +
        'RETURNING created_at AS "createdAt", email',
      [payload.signupProposalId],
    )
  ).rows;
  if (proposals.length === 0) {
    return { type: 'ProposalExpiredOrInvalid' };
  }
  const proposal = proposals[0];

  // Check if the proposal has expired.
  if (proposal.createdAt.valueOf() + signupProposalLifespanMs <= Date.now()) {
    return { type: 'ProposalExpiredOrInvalid' };
  }

  // Create the user.
  let userId;
  try {
    userId = (
      await pool.query<{ id: string }>(
        'INSERT INTO "user" (email, normalized_email) ' +
          'VALUES ($1, $2) ' +
          'RETURNING id;',
        [proposal.email, normalizeEmail(proposal.email)],
      )
    ).rows[0].id;
  } catch (e) {
    // Warning: TypeScript considers `e` to have type `any`, even though
    // `unknown` would have been more appropriate.
    if (e.code === ErrorCode.UniquenessViolation) {
      return { type: 'ProposalExpiredOrInvalid' };
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
  return { type: 'Success', sessionId, user: { email: proposal.email } };
}
