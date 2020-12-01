import { Pool } from 'pg';

import { databaseConnectionInfo } from '../constants/constants';
import { getPostgresSecret } from '../secrets/secrets';

let pool: Pool | null = null;

export enum ErrorCode {
  UniquenessViolation = '23505',
}

export async function getPool(): Promise<Pool> {
  if (pool === null) {
    pool = new Pool({
      ...databaseConnectionInfo(),
      password: await getPostgresSecret(),
    });
  }

  return pool;
}
