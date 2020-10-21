import { Pool } from 'pg';
import { getPostgresSecret } from '../secrets/secrets';
import {
  databaseHost,
  databaseName,
  databaseUser,
} from '../shared/constants/constants';

let pool: Pool | null = null;

export default async function getPool(): Promise<Pool> {
  if (pool === null) {
    pool = new Pool({
      user: databaseUser,
      host: databaseHost,
      database: databaseName,
      password: await getPostgresSecret(),
      max: 1,
      idleTimeoutMillis: 0,
    });
  }

  return pool;
}
