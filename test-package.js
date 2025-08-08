#!/usr/bin/env node

// Test script for batch discount pricing with new CLI flow
const { spawn } = require('child_process');

console.log('Generating a batch discount quote with new streamlined CLI...\n');

const child = spawn('node', ['dist/cli-quote.js'], {
  stdio: ['pipe', 'inherit', 'inherit'],
  cwd: __dirname
});

// Updated inputs for new CLI flow - testing 5 videos for batch discount
const inputs = [
  'Creative Agency',        // Client Name
  'Marketing Campaign',     // Project Name  
  '5',                     // Number of Videos (qualifies for batch discount)
  '3',                     // Video Length (3 = Long 5-10min)
  'n',                     // Facecam recording (n = no)
  'y',                     // Motion graphics (y = yes)
  '3',                     // Motion graphics complexity (3 = Complex)
  'n',                     // Show detailed hourly breakdown (n = hide rates for client)
  '1',                     // Apply batch discount (1 = yes, apply Small Batch Discount)
  'Includes revisions and source files\nExciting project for social media campaign!' // Extra Notes
];

let inputIndex = 0;

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
  console.log(`\nBatch discount quote generated with code ${code}`);
  console.log('Check the quotes/ directory for your PDF!');
});
