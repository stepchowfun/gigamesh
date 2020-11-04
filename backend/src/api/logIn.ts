import { Static } from 'runtypes';

import { LogInRequest, LogInResponse } from '../shared/api/schema';
import { getPool } from '../storage/storage';
import { loginProposalLifespanMs } from '../constants/constants';

export default async function logIn(
  payload: Static<typeof LogInRequest>['payload'],
): Promise<Static<typeof LogInResponse>['payload']> {
  // Get the database connection pool.
  const pool = await getPool();

  // Fetch and delete the proposal.
  const proposals = (
    await pool.query<{
      createdAt: Date;
      userId: string;
    }>(
      'DELETE FROM login_proposal ' +
        'WHERE id = $1 ' +
        'RETURNING created_at AS "createdAt", user_id AS "userId"',
      [payload.loginProposalId],
    )
  ).rows;
  if (proposals.length === 0) {
    return { type: 'ProposalExpiredOrInvalid' };
  }
  const proposal = proposals[0];

  // Make sure the proposal hasn't expired.
  if (proposal.createdAt.valueOf() + loginProposalLifespanMs <= Date.now()) {
    return { type: 'ProposalExpiredOrInvalid' };
  }

  // Fetch the user.
  const user = (
    await pool.query<{
      deleted: boolean;
    }>('SELECT deleted FROM "user" WHERE id = $1 LIMIT 1', [proposal.userId])
  ).rows[0];

  // Make sure the user exists.
  if (user.deleted) {
    return { type: 'ProposalExpiredOrInvalid' };
  }

  // Create a session.
  const sessionId = (
    await pool.query<{ id: string }>(
      'INSERT INTO session (user_id) VALUES ($1) RETURNING id;',
      [proposal.userId],
    )
  ).rows[0].id;

  // Return the session token to the client.
  return { type: 'Success', sessionId };
}
