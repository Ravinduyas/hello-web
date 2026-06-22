import { config } from 'dotenv';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Load THIS backend's own .env regardless of the process CWD. `dotenv/config`
// only reads `${cwd}/.env`, which misses backend/.env whenever the server is
// started from the hello-manage/ root (e.g. `npm run backend`) — silently
// falling back to default credentials. Resolving the path next to this file
// makes the .env load from any working directory.
config({ path: join(dirname(fileURLToPath(import.meta.url)), '.env') });
