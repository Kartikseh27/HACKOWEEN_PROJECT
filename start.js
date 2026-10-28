#!/usr/bin/env node
/**
 * Adaptive Start Script for KISAN CULTURE
 * Detects whether the runtime environment has Node/Express dependencies installed,
 * or whether this is a Python container running FastAPI with Uvicorn.
 */

const { spawn } = require('child_process');

try {
  // Check if express is installed in node_modules
  require.resolve('express');
  console.log('🚀 Starting KISAN CULTURE Node Fullstack Server (server.ts)...');
  const proc = spawn('npx', ['tsx', 'server.ts'], { stdio: 'inherit' });
  proc.on('exit', (code) => process.exit(code ?? 0));
} catch (err) {
  // Fallback for Render Python Web Service where pip install ran instead of npm install
  console.log('🌾 Node dependencies not detected. Launching FastAPI Backend (Uvicorn)...');
  const port = process.env.PORT || '8000';
  const proc = spawn('uvicorn', ['backend.main:app', '--host', '0.0.0.0', '--port', port], { stdio: 'inherit' });
  proc.on('exit', (code) => process.exit(code ?? 0));
}

