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
import { createServer } from 'node:net';
import { delimiter, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RESET = '\x1b[0m';
const DIM = '\x1b[2m';
const API_PORT = Number(process.env.PORT) || 4000;

// Resolved from this file, not the cwd, so `npm run dev` behaves the same
// wherever it is invoked from.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * True if the port is already taken.
 *
 * Tries to bind it, exactly as the server does, rather than connecting to it.
 * A connect probe to 127.0.0.1 misses a server bound only to :: — which is how
 * the API binds — so it reported the port free and the spawn then died with
 * EADDRINUSE on :::4000.
 */
function isTaken(port) {
  return new Promise(done => {
    const probe = createServer();
    probe.once('error', err => done(err.code === 'EADDRINUSE'));
    probe.once('listening', () => probe.close(() => done(false)));
    probe.listen(port);
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

function start({ tag, colour, half, command }) {
  const cwd = join(ROOT, half);
  // npm puts node_modules/.bin on PATH for its own scripts; spawning directly
  // does not, so vite would not be found. Each half installs its own
  // dependencies, so each gets its own bin folder.
  const path = [join(cwd, 'node_modules', '.bin'), process.env.PATH].join(delimiter);

  const child = spawn(command, {
    cwd,
    // shell: true so this behaves the same on Windows, where these are .cmd
    // shims rather than executables.
    shell: true,
    env: { ...process.env, PATH: path, Path: path },
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

if (await isTaken(API_PORT)) {
  console.log(
    `${DIM}api   | already running on :${API_PORT} — reusing it. ` +
      `Stop that process first if you want a fresh one.${RESET}`,
  );
} else {
  start({ tag: 'api  ', colour: '\x1b[36m', half: 'backend', command: 'node --watch index.ts' });
}

start({ tag: 'admin', colour: '\x1b[35m', half: 'frontend', command: 'vite' });

process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));
