#!/usr/bin/env node

// Video Quote Maker - Professional CLI
// This is the main entry point for the video quote generator

const { spawn } = require('child_process');
const path = require('path');

// Run the modular version
const quoteMaker = spawn('node', [path.join(__dirname, 'dist/src/index.js')], {
  stdio: 'inherit'
});

quoteMaker.on('error', (error) => {
  console.error('Error starting quote maker:', error.message);
  process.exit(1);
});

quoteMaker.on('close', (code) => {
  process.exit(code);
});
