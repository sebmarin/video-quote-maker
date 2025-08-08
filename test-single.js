#!/usr/bin/env node

// Test script for single video (should not show "Per Video")
const { spawn } = require('child_process');

console.log('Testing single video quote (no "Per Video" text)...\n');

const child = spawn('node', ['dist/cli-quote.js'], {
  stdio: ['pipe', 'inherit', 'inherit'],
  cwd: __dirname
});

const inputs = [
  'Solo Client',         // Client Name
  'Single Video Demo',   // Project Name  
  '1',                  // Number of Videos (single video)
  '2',                  // Video Length (2 = Standard)
  'n',                  // Facecam recording
  'y',                  // Motion graphics
  '1',                  // Motion graphics complexity (1 = Simple)
  'y',                  // Show detailed hourly breakdown
  'Single video test'   // Extra Notes
];

let inputIndex = 0;

function sendNextInput() {
  if (inputIndex < inputs.length) {
    setTimeout(() => {
      child.stdin.write(inputs[inputIndex] + '\n');
      inputIndex++;
      sendNextInput();
    }, 200);
  } else {
    setTimeout(() => {
      child.stdin.end();
    }, 200);
  }
}

child.on('spawn', () => {
  sendNextInput();
});

child.on('close', (code) => {
  console.log(`\nSingle video quote generated with code ${code}`);
  console.log('Check quotes/ directory - header should say "Service Breakdown" (no "Per Video")');
});
