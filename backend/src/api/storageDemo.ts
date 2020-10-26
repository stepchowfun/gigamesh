import { Static } from 'runtypes';
import { StorageDemoRequest, StorageDemoResponse } from '../shared/api/schema';
import getPool from '../storage/storage';

export default async function storageDemo(
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  request: Omit<Static<typeof StorageDemoRequest>, 'type'>,
): Promise<Omit<Static<typeof StorageDemoResponse>, 'type'>> {
  // Get the database connection pool.
  const pool = await getPool();

  // Query the database.
  const response = await pool.query('SELECT NOW() as now');

  // Return a response to the client.
  return {
    now: response.rows[0].now,
  };
}
