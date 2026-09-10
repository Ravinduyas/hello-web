import { config } from 'dotenv';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Load THIS backend's own .env regardless of the process CWD. `dotenv/config`
// only reads `${cwd}/.env`, which misses backend/.env whenever the server is
// started from the hello-manage/ root (e.g. `npm run backend`) — silently
// falling back to default credentials. Resolving the path next to this file
// makes the .env load from any working directory.
config({ path: join(dirname(fileURLToPath(import.meta.url)), '.env') });

/**
 * Where the database lives.
 *
 * Exported from here rather than read at the point of use so that dotenv has
 * certainly run first — importing this module is what loads the .env, and a
 * `process.env.MONGODB_URI` read anywhere else could win the race and get
 * nothing. The default is a local server; set MONGODB_URI to point at Atlas or
 * any other host.
 */
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/?replicaSet=rs0';
export const MONGODB_DB = process.env.MONGODB_DB || 'hellorent';
