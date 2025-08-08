#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { promptUser } from './services/prompt';
import { QUANTITY_DISCOUNTS, HOURLY_RATE } from './config/pricing';
import { formatDate, createSafeFilename } from './utils/helpers';
import { createPDF } from './services/pdf-generator';

const QUOTES_DIR = path.resolve(__dirname, __dirname.includes('dist') ? '../../quotes' : '../quotes');

async function main() {
  if (!fs.existsSync(QUOTES_DIR)) {
    fs.mkdirSync(QUOTES_DIR);
  }

  console.log("Welcome to the Enhanced PDF Quote Generator!\n");

  const quoteData = await promptUser();

  if (!quoteData.clientName || !quoteData.projectName || isNaN(quoteData.numVideos)) {
    console.error("Missing or invalid input. Exiting.");
    process.exit(1);
  }

  let total = 0;
  const regularTotal = quoteData.numVideos * quoteData.hoursPerVideo * HOURLY_RATE;
  
  if (quoteData.discountTier) {
    // Apply quantity discount
    const discount = QUANTITY_DISCOUNTS[quoteData.discountTier as keyof typeof QUANTITY_DISCOUNTS];
    const discountAmount = regularTotal * discount.discount;
    total = regularTotal - discountAmount;
  } else {
    // Regular pricing
    total = regularTotal;
  }

  const today = new Date();
  const dateStr = formatDate(today);
  const safeClientName = createSafeFilename(quoteData.clientName);
  const outPath = path.join(QUOTES_DIR, `quote-${safeClientName}-${dateStr}.pdf`);

  await createPDF({
    ...quoteData,
    total,
    outPath,
    dateStr
  });

  console.log(`\n✅ Quote generated: ${outPath}`);
  console.log(`💰 Total: €${total.toFixed(2)}`);
  console.log(`📊 Hours: ${quoteData.hoursPerVideo}h per video × ${quoteData.numVideos} videos = ${quoteData.numVideos * quoteData.hoursPerVideo}h total`);
}

main().catch((err) => {
  console.error("An error occurred:", err);
  process.exit(1);
});
