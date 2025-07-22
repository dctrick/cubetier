import { spawn } from 'child_process';

const child = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

child.on('exit', code => process.exit(code)); 