/**
 * Starts both halves of Hello Manage.
 *
 * `npm run dev` used to alias the frontend alone, so running it in a folder
 * that holds a backend and an admin UI started the UI on :5174 and left every
 * request to :4000 refused. Both now come up together, tagged so the output is
 * readable, and stopping one stops the other.
 */
import { spawn } from 'node:child_process';
import { delimiter, resolve } from 'node:path';

const parts = [
  { tag: 'api  ', colour: '\x1b[36m', command: 'node --watch backend/index.ts' },
  { tag: 'admin', colour: '\x1b[35m', command: 'vite --config frontend/vite.config.ts' },
];

const RESET = '\x1b[0m';
const children = [];
let stopping = false;

for (const { tag, colour, command } of parts) {
  // shell: true so this works the same on Windows, where the binaries are .cmd
  // shims rather than executables.
  const child = spawn(command, {
    shell: true,
    env: { ...process.env, PATH: PATH_WITH_BINS, Path: PATH_WITH_BINS },
    stdio: ['ignore', 'pipe', 'pipe'] });
  children.push(child);

  const label = `${colour}${tag}${RESET} │ `;
  const write = (stream) => (chunk) => {
    for (const line of chunk.toString().split(/\r?\n/)) {
      if (line.trim()) stream.write(label + line + '\n');
    }
  };
  child.stdout.on('data', write(process.stdout));
  child.stderr.on('data', write(process.stderr));

  child.on('exit', (code) => {
    if (stopping) return;
    console.log(`${label}exited with code ${code} — stopping the other half too.`);
    stopAll(code ?? 1);
  });
}

function stopAll(code) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill();
  process.exit(code);
}

process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));
