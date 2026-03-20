#!/usr/bin/env node

const { spawnSync } = require('child_process');
const path = require('path');

const localLibraryPaths = [
  path.resolve(__dirname, '../tmp/libgbm/extracted/usr/lib/x86_64-linux-gnu'),
  path.resolve(__dirname, '../tmp/chromium-libs/libasound2_1.2.6.1-1ubuntu1_amd64/usr/lib/x86_64-linux-gnu'),
  path.resolve(__dirname, '../tmp/chromium-libs/libwayland-server0_1.20.0-1ubuntu0.1_amd64/usr/lib/x86_64-linux-gnu')
];

const env = {
  ...process.env,
  LD_LIBRARY_PATH: [...localLibraryPaths, process.env.LD_LIBRARY_PATH || '']
    .filter(Boolean)
    .join(':')
};

const result = spawnSync('npx', ['playwright', 'test'], {
  env,
  stdio: 'inherit'
});

process.exit(result.status ?? 1);
