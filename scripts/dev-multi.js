/* eslint-disable */
const { spawn } = require('child_process')
process.env.ELECTRON_RENDERER_URL = 'http://localhost:5173'
const cmd = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'

spawn(cmd, ['electron', '.', '--multi-instance'], {
  stdio: 'inherit',
  shell: true
})
