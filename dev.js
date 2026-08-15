// Starts backend and frontend dev servers together; Ctrl+C stops both.
import { spawn } from 'node:child_process';

const run = (name) =>
  spawn(`npm --prefix ${name} run dev`, { stdio: 'inherit', shell: true })
    .on('exit', (code) => { console.log(`[${name}] exited (${code})`); process.exit(code ?? 0); });

const procs = [run('backend'), run('frontend')];
process.on('SIGINT', () => procs.forEach((p) => p.kill('SIGINT')));
