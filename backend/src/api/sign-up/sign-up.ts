import { SignUpRequest, SignUpResponse } from 'frontend-lib';
import { Static } from 'runtypes';

import { Envelope } from '../envelope/envelope';
import { ErrorCode, getPool } from '../../storage/storage';
import { normalizeEmail } from '../../email/email';
import { signupProposalLifespanMs } from '../../constants/constants';

export default async function signUp(
  request: Envelope<Static<typeof SignUpRequest>>,
): Promise<Envelope<Static<typeof SignUpResponse>>> {
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
      [request.payload.signupProposalId],
    )
  ).rows;
  if (proposals.length === 0) {
    return {
      payload: { type: 'ProposalExpiredOrInvalid' },
      sessionId: request.sessionId,
    };
  }
  const proposal = proposals[0];

  // Check if the proposal has expired.
  if (proposal.createdAt.valueOf() + signupProposalLifespanMs <= Date.now()) {
    return {
      payload: { type: 'ProposalExpiredOrInvalid' },
      sessionId: request.sessionId,
    };
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (e.code === ErrorCode.UniquenessViolation) {
      return {
        payload: { type: 'ProposalExpiredOrInvalid' },
        sessionId: request.sessionId,
      };
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
  return {
    payload: { type: 'Success', user: { email: proposal.email } },
    sessionId,
  };
}
