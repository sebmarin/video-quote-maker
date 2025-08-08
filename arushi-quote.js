#!/usr/bin/env node

// Simple test script to generate a sample quote with new CLI flow
const { spawn } = require('child_process');
const path = require('path');

console.log('Generating a test quote with new streamlined CLI...\n');

const child = spawn('node', ['dist/cli-quote.js'], {
  stdio: ['pipe', 'inherit', 'inherit'],
  cwd: __dirname
});

// Updated inputs for new CLI flow
const inputs = [
  'Arushi Gupta',           // Client Name
  'Passbolt Youtube Shorts Production', // Project Name  
  '3',                  // Number of Videos
  '1',                  // Video Length (1 = Short 30s-2min)
  'y',                  // Facecam recording (y/n)
  'y',                  // Motion graphics (y/n)
  '1',                  // Motion graphics complexity (1 = Simple)
  'y',                  // Show detailed hourly breakdown (y/n)
  '1',                  // Apply batch discount (1 = yes, 2 = no discount)
  ''                    // Extra Notes
];

let inputIndex = 0;

// Send inputs with delays
function sendNextInput() {
  if (inputIndex < inputs.length) {
    setTimeout(() => {
      child.stdin.write(inputs[inputIndex] + '\n');
      inputIndex++;
      sendNextInput();
    }, 200); // Increased delay for better interaction
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
  console.log(`\nQuote generation completed with code ${code}`);
  console.log('Check the quotes/ directory for your PDF!');
});
