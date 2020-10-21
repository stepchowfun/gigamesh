import { Pool } from 'pg';
import { getPostgresSecret } from '../secrets/secrets';
import { isProduction } from '../shared/environment/environment';
import {
  databaseHostDevelopment,
  databaseHostProduction,
  databaseNameDevelopment,
  databaseNameProduction,
  databasePortDevelopment,
  databasePortProduction,
  databaseUserDevelopment,
  databaseUserProduction,
} from '../shared/constants/constants';

let pool: Pool | null = null;

export default async function getPool(): Promise<Pool> {
  if (pool === null) {
    if (isProduction()) {
      pool = new Pool({
        user: databaseUserProduction,
        host: databaseHostProduction,
        port: databasePortProduction,
        database: databaseNameProduction,
        password: await getPostgresSecret(),
        max: 1,
        idleTimeoutMillis: 0,
      });
    } else {
      pool = new Pool({
        user: databaseUserDevelopment,
        host: databaseHostDevelopment,
        port: databasePortDevelopment,
        database: databaseNameDevelopment,
        password: await getPostgresSecret(),
        max: 1,
        idleTimeoutMillis: 0,
      });
    }
  }

  return pool;
}
