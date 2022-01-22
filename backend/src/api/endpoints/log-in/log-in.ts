import * as validateUuid from 'uuid-validate';
import { LogInRequest, LogInResponse } from 'frontend-lib';
import { Static } from 'runtypes';

import { Envelope } from '../../util/envelope/envelope';
import { getPool } from '../../../storage/storage';
import { loginProposalLifespanMs } from '../../../constants/constants';

export default async function logIn(
  request: Envelope<Static<typeof LogInRequest>>,
): Promise<Envelope<Static<typeof LogInResponse>>> {
  // Validate the login proposal ID.
  const { loginProposalId } = request.payload;
  if (!validateUuid(loginProposalId, 4)) {
    return {
      payload: { type: 'ProposalExpiredOrInvalid' },
      sessionId: request.sessionId,
    };
  }

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
      [loginProposalId],
    )
  ).rows;
  if (proposals.length === 0) {
    return {
      payload: { type: 'ProposalExpiredOrInvalid' },
      sessionId: request.sessionId,
    };
  }
  const proposal = proposals[0];

  // Make sure the proposal hasn't expired.
  if (proposal.createdAt.valueOf() + loginProposalLifespanMs <= Date.now()) {
    return {
      payload: { type: 'ProposalExpiredOrInvalid' },
      sessionId: request.sessionId,
    };
  }

  // Fetch the user.
  const user = (
    await pool.query<{
      email: string;
      deleted: boolean;
    }>('SELECT email, deleted FROM "user" WHERE id = $1 LIMIT 1', [
      proposal.userId,
    ])
  ).rows[0];

  // Make sure the user exists.
  if (user.deleted) {
    return {
      payload: { type: 'ProposalExpiredOrInvalid' },
      sessionId: request.sessionId,
    };
  }

  // Create a session.
  const sessionId = (
    await pool.query<{ id: string }>(
      'INSERT INTO session (user_id) VALUES ($1) RETURNING id;',
      [proposal.userId],
    )
  ).rows[0].id;

  // Return the session token to the client.
  return {
    payload: { type: 'Success' },
    sessionId,
  };
}
