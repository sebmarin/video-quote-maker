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
  'Tech Corp',           // Client Name
  'Product Demo Videos', // Project Name  
  '10',                  // Number of Videos
  '3',                  // Video Length (3 = Long 5-10min)
  'y',                  // Facecam recording (y/n)
  'y',                  // Motion graphics (y/n)
  '3',                  // Motion graphics complexity (3 = Complex)
  'y',                  // Show detailed hourly breakdown (y/n)
  '1',                  // Apply batch discount (1 = yes, 2 = no discount)
  'Looking forward to working with you!' // Extra Notes
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
