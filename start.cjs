#!/usr/bin/env node
/**
 * Adaptive Start Script (CommonJS) for KISAN CULTURE
 * Detects whether the runtime environment has Node/Express dependencies installed,
 * or whether this is a Python container running FastAPI with Uvicorn.
 */

const { spawn } = require('node:child_process');
const process = require('node:process');

let isExpressAvailable = false;
try {
  require.resolve('express');
  isExpressAvailable = true;
} catch {
  isExpressAvailable = false;
}

const port = process.env.PORT || '8000';

if (isExpressAvailable) {
  console.log(`🚀 Starting KISAN CULTURE Node Server on port ${port}...`);
  const proc = spawn('npx', ['tsx', 'server.ts'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: String(port) },
  });

  proc.on('exit', (code) => {
    process.exit(code ?? 0);
  });

  proc.on('error', (err) => {
    console.error('Failed to spawn Node server via tsx:', err);
    process.exit(1);
  });
} else {
  console.log(`🌾 Node dependencies not detected. Launching FastAPI Backend (Uvicorn) on 0.0.0.0:${port}...`);
  const proc = spawn('uvicorn', ['backend.main:app', '--host', '0.0.0.0', '--port', String(port)], {
    stdio: 'inherit',
    env: process.env,
  });

  proc.on('exit', (code) => {
    process.exit(code ?? 0);
  });

  proc.on('error', (err) => {
    console.warn('Direct uvicorn spawn failed, retrying with python3 -m uvicorn...', err.message);
    const fallback = spawn('python3', ['-m', 'uvicorn', 'backend.main:app', '--host', '0.0.0.0', '--port', String(port)], {
      stdio: 'inherit',
      env: process.env,
    });
    fallback.on('exit', (fallbackCode) => {
      process.exit(fallbackCode ?? 0);
    });
    fallback.on('error', (fallbackErr) => {
      console.error('Failed to launch FastAPI backend with python3 -m uvicorn:', fallbackErr);
      process.exit(1);
    });
  });
}
