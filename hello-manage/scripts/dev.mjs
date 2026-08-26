/**
 * Starts both halves of Hello Manage.
 *
 * `npm run dev` used to alias the frontend alone, so running it in a folder
 * that holds a backend and an admin UI started the UI on :5174 and left every
 * request to :4000 refused. Both now come up together, tagged so the output is
 * readable, and stopping one stops the other.
 *
 * If an API is already listening it is reused rather than started again: a
 * second one only dies with EADDRINUSE, and under `node --watch` it does not
 * even exit — it sits waiting for a file change, so the admin would carry on
 * against nothing while the console filled with a stack trace.
 */
import { spawn } from 'node:child_process';
import { connect } from 'node:net';
import { delimiter, resolve } from 'node:path';

const RESET = '\x1b[0m';
const DIM = '\x1b[2m';
const API_PORT = Number(process.env.PORT) || 4000;

// npm puts node_modules/.bin on PATH for its own scripts; spawning directly
// does not, so vite would not be found. Both bin folders are listed because the
// repo shares a single install at the root.
const PATH_WITH_BINS = [
  resolve('node_modules/.bin'),
  resolve('..', 'node_modules/.bin'),
  process.env.PATH,
].join(delimiter);

/** True if something already answers on the port — probed by connecting to it. */
function isListening(port) {
  return new Promise(done => {
    const socket = connect({ port, host: '127.0.0.1' });
    const finish = result => {
      socket.destroy();
      done(result);
    };
    socket.setTimeout(700);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
  });
}

const children = [];
let stopping = false;

function stopAll(code) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill();
  process.exit(code);
}

function start({ tag, colour, command }) {
  const child = spawn(command, {
    // shell: true so this behaves the same on Windows, where these are .cmd
    // shims rather than executables.
    shell: true,
    env: { ...process.env, PATH: PATH_WITH_BINS, Path: PATH_WITH_BINS },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  children.push(child);

  const label = `${colour}${tag}${RESET} | `;
  const write = stream => chunk => {
    for (const line of chunk.toString().split(/\r?\n/)) {
      if (line.trim()) stream.write(label + line + '\n');
    }
  };
  child.stdout.on('data', write(process.stdout));
  child.stderr.on('data', write(process.stderr));

  child.on('exit', code => {
    if (stopping) return;
    console.log(`${label}exited with code ${code} — stopping the other half too.`);
    stopAll(code ?? 1);
  });
}

if (await isListening(API_PORT)) {
  console.log(
    `${DIM}api   | already running on :${API_PORT} — reusing it. ` +
      `Stop that process first if you want a fresh one.${RESET}`,
  );
} else {
  start({ tag: 'api  ', colour: '\x1b[36m', command: 'node --watch backend/index.ts' });
}

start({ tag: 'admin', colour: '\x1b[35m', command: 'vite --config frontend/vite.config.ts' });

process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));
