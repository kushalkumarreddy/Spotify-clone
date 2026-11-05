import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('--------------------------------------------------');
console.log('🎵 Starting Spotify Web Player Full-Stack App... 🎵');
console.log('--------------------------------------------------');

// 1. Start Server
const server = spawn('node', ['index.js'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true
});

// 2. Start Client
const client = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true
});

process.on('SIGINT', () => {
  console.log('\nStopping servers...');
  server.kill('SIGINT');
  client.kill('SIGINT');
  process.exit(0);
});

