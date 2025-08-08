#!/usr/bin/env node

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Personal branding
const BRAND = {
  name: "Sebastián Marín",
  email: "contact@sebmarin.me",
  website: "www.sebmarin.me",
  logo: path.resolve(__dirname, "../Logo-Black.png"), // PNG format for PDFKit compatibility
};

// Constants
const HOURLY_RATE = 46; // €
const QUOTES_DIR = path.resolve(__dirname, '../quotes');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

// Service definitions with base times that can be modified by complexity
interface Service {
  name: string;
  baseTime: number; // Base time that gets modified by video length and complexity
  rate: number;
  optional?: boolean;
}

const SERVICES: Record<string, Service> = {
  scriptPlanning: { name: "Script + Planning", baseTime: 1.5, rate: HOURLY_RATE },
  screenRecording: { name: "Screen Recording + Voiceover", baseTime: .5, rate: HOURLY_RATE },
  facecamRecording: { name: "Camera Equipment + Recording Time", baseTime: 1, rate: HOURLY_RATE, optional: true },
  editing: { name: "Editing + Assembly", baseTime: 2, rate: HOURLY_RATE },
  motionGraphics: { name: "Motion Graphics", baseTime: 2, rate: HOURLY_RATE, optional: true },
  admin: { name: "Admin / Export / Feedback", baseTime: 0.5, rate: HOURLY_RATE }
};

// Video length multipliers
const VIDEO_LENGTH_MULTIPLIERS = {
  short: { name: "Short (30s-2min)", editingMultiplier: 0.5, recordingMultiplier: 1.0 },
  standard: { name: "Standard (2-5min)", editingMultiplier: 2, recordingMultiplier: 1.0 },
  long: { name: "Long (5-10min)", editingMultiplier: 5, recordingMultiplier: 1.5 },
  extended: { name: "Extended (10min+)", editingMultiplier: 10, recordingMultiplier: 2.0 }
};

// Motion graphics complexity multipliers
const MOTION_GRAPHICS_COMPLEXITY = {
  simple: { name: "Simple (text animations, basic transitions)", multiplier: 1.0 },
  standard: { name: "Standard (icons, charts, moderate animations)", multiplier: 3.0 },
  complex: { name: "Complex (custom animations, 3D elements)", multiplier: 15.0 }
};

// Discount tiers based on quantity
const QUANTITY_DISCOUNTS = {
  small: { minVideos: 3, maxVideos: 5, discount: 0.10, name: "Small Batch Discount (3-5 videos)" },
  medium: { minVideos: 6, maxVideos: 10, discount: 0.20, name: "Medium Batch Discount (6-10 videos)" },
  large: { minVideos: 11, maxVideos: Infinity, discount: 0.25, name: "Large Batch Discount (11+ videos)" }
};

async function promptUser() {
  const clientName = (await question("Client Name: ")).trim();
  const projectName = (await question("Project Name: ")).trim();
  const numVideos = parseInt(await question("Number of Videos: "), 10);
  
  // Video length selection
  console.log("\nVideo Length:");
  console.log("1. Short (30s-2min)");
  console.log("2. Standard (2-5min)");
  console.log("3. Long (5-10min)");
  console.log("4. Extended (10min+)");
  const videoLengthChoice = (await question("Choose video length (1-4): ")).trim();
  const videoLengthMap = ["short", "standard", "long", "extended"];
  const videoLength = videoLengthMap[parseInt(videoLengthChoice) - 1] || "standard";
  
  // Facecam recording
  const needsFacecam = (await question("Do you need facecam recording? (y/n): ")).trim().toLowerCase() === 'y';
  
  // Motion graphics complexity
  const needsMotionGraphics = (await question("Do you need motion graphics? (y/n): ")).trim().toLowerCase() === 'y';
  let motionGraphicsComplexity = "simple";
  
  if (needsMotionGraphics) {
    console.log("\nMotion Graphics Complexity:");
    console.log("1. Simple (text animations, basic transitions)");
    console.log("2. Standard (icons, charts, moderate animations)");
    console.log("3. Complex (custom animations, 3D elements)");
    const complexityChoice = (await question("Choose complexity (1-3): ")).trim();
    const complexityMap = ["simple", "standard", "complex"];
    motionGraphicsComplexity = complexityMap[parseInt(complexityChoice) - 1] || "simple";
  }
  
  // Ask about rate calculation display
  const showRateCalculation = (await question("\nShow detailed hourly breakdown in PDF? (y/n): ")).trim().toLowerCase() === 'y';
  
  // For all quotes, calculate based on complexity first
  const hoursPerVideo = calculateVideoHours(videoLength, needsFacecam, needsMotionGraphics, motionGraphicsComplexity);
  
  let discountTier: string | undefined = undefined;
  
  // Check if eligible for batch discounts (3+ videos)
  const availableDiscounts = Object.entries(QUANTITY_DISCOUNTS).filter(([, tier]) => 
    numVideos >= tier.minVideos && numVideos <= tier.maxVideos
  );
  
  if (availableDiscounts.length > 0) {
    console.log("\n🎯 Batch Discount Available!");
    console.log("Your project qualifies for volume pricing:");
    
    availableDiscounts.forEach(([key, tier], index) => {
      const regularTotal = numVideos * hoursPerVideo * HOURLY_RATE;
      const discountAmount = regularTotal * tier.discount;
      const finalPrice = regularTotal - discountAmount;
      const discountPercent = (tier.discount * 100).toFixed(0);
      console.log(`${index + 1}. ${tier.name} - ${discountPercent}% off (save €${discountAmount.toFixed(0)}, pay €${finalPrice.toFixed(0)})`);
    });
    console.log(`${availableDiscounts.length + 1}. No batch discount (pay full price)`);
    
    const discountChoice = (await question(`Apply batch discount? (1-${availableDiscounts.length + 1}): `)).trim();
    const selectedIndex = parseInt(discountChoice) - 1;
    
    if (selectedIndex >= 0 && selectedIndex < availableDiscounts.length) {
      discountTier = availableDiscounts[selectedIndex][0];
    }
  }
  
  const extraNotes = (await question("Extra Notes (optional): ")).trim();
  rl.close();

  return { 
    clientName, 
    projectName, 
    numVideos, 
    hoursPerVideo, 
    extraNotes, 
    discountTier,
    videoLength,
    needsFacecam,
    needsMotionGraphics,
    motionGraphicsComplexity,
    showRateCalculation
  };
}

// Function to calculate hours based on video complexity
function calculateVideoHours(
  videoLength: string,
  needsFacecam: boolean,
  needsMotionGraphics: boolean,
  motionGraphicsComplexity: string
): number {
  const lengthMultipliers = VIDEO_LENGTH_MULTIPLIERS[videoLength as keyof typeof VIDEO_LENGTH_MULTIPLIERS];
  const mgComplexity = MOTION_GRAPHICS_COMPLEXITY[motionGraphicsComplexity as keyof typeof MOTION_GRAPHICS_COMPLEXITY];
  
  let totalHours = 0;
  
  // Script + Planning (always included)
  totalHours += SERVICES.scriptPlanning.baseTime;
  
  // Recording (screen + optional facecam)
  totalHours += SERVICES.screenRecording.baseTime * lengthMultipliers.recordingMultiplier;
  if (needsFacecam) {
    totalHours += SERVICES.facecamRecording.baseTime * lengthMultipliers.recordingMultiplier;
  }
  
  // Editing (affected by video length)
  totalHours += SERVICES.editing.baseTime * lengthMultipliers.editingMultiplier;
  
  // Motion Graphics (optional, affected by complexity)
  if (needsMotionGraphics) {
    totalHours += SERVICES.motionGraphics.baseTime * mgComplexity.multiplier;
  }
  
  // Admin (always included)
  totalHours += SERVICES.admin.baseTime;
  
  return roundToHalfHour(totalHours); // Round to nearest half hour
}

// Helper function to round to nearest half hour (0.5)
function roundToHalfHour(hours: number): number {
  return Math.ceil(hours * 2) / 2;
}

function formatDate(date: Date) {
  // YYYY-MM-DD
  return date.toISOString().split('T')[0];
}

function titleCase(str: string) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

function createPDF({
  clientName,
  projectName,
  numVideos,
  hoursPerVideo,
  extraNotes,
  total,
  outPath,
  dateStr,
  discountTier,
  videoLength,
  needsFacecam,
  needsMotionGraphics,
  motionGraphicsComplexity,
  showRateCalculation,
}: {
  clientName: string;
  projectName: string;
  numVideos: number;
  hoursPerVideo: number;
  extraNotes: string;
  total: number;
  outPath: string;
  dateStr: string;
  discountTier?: string;
  videoLength?: string;
  needsFacecam?: boolean;
  needsMotionGraphics?: boolean;
  motionGraphicsComplexity?: string;
  showRateCalculation?: boolean;
}) {
  const doc = new PDFDocument({ margin: 50 });
  const writeStream = fs.createWriteStream(outPath);
  doc.pipe(writeStream);

  // Modern header with prominent service title and compact contact column
  const headerY = 40;
  const logoSize = 80; // Bigger logo
  const rightColumnX = doc.page.width - 145; // Slightly wider right column to accommodate bigger logo
  
  // Large, prominent service title on the left
  doc
    .fontSize(32)
    .fillColor('#1a1a1a')
    .font('Helvetica-Bold')
    .text('Video Production', 50, headerY);
  
  doc
    .fontSize(32)
    .fillColor('#0066cc') // Apple-like blue accent
    .font('Helvetica-Bold')
    .text('Services', 50, headerY + 35);

  // Compact right column with logo and contact info
  if (BRAND.logo && fs.existsSync(BRAND.logo)) {
    try {
      doc.image(BRAND.logo, rightColumnX, headerY, { 
        fit: [logoSize, logoSize]
      });
    } catch (error) {
      console.log("Logo error:", error);
    }
  }

  // Name and contact info below logo in right column - more spacing
  doc
    .fontSize(11)
    .fillColor('#1a1a1a')
    .font('Helvetica-Bold')
    .text('Sebastian Marin', rightColumnX, headerY - 20 + logoSize + 11);

  doc
    .fontSize(9)
    .fillColor('#6a6a6a')
    .font('Helvetica')
    .text(BRAND.email, rightColumnX, headerY - 20 + logoSize + 28)
    .text('+39 347 869 8888', rightColumnX, headerY - 20 + logoSize + 41)
    .text('Rome, Italy', rightColumnX, headerY - 20 + logoSize + 54);

  // Subtle tagline with generous spacing
  doc
    .fontSize(10)
    .fillColor('#8a8a8a')
    .font('Helvetica')
    .text('Digital content specialist • Technical video producer • Growth business strategist', 50, headerY + 100, { 
      align: 'left', 
      width: rightColumnX - 70, // Constrain to left area only
    });

  // Ultra-minimal separator line
  doc
    .moveTo(50, headerY + 120)
    .lineTo(doc.page.width - 50, headerY + 130)
    .strokeColor('#e6e6e6')
    .lineWidth(0.5)
    .stroke();

  // Clean, minimal quote header
  doc
    .fontSize(28)
    .fillColor('#1a1a1a')
    .font('Helvetica')
    .text('Quote', 50, headerY + 140);

  // Project info with clean typography
  let infoY = headerY + 185;
  doc
    .fontSize(11)
    .fillColor('#333333')
    .font('Helvetica')
    .text(`Date: ${dateStr}`, 50, infoY)
    .text(`Client: ${titleCase(clientName)}`, 50, infoY + 15)
    .text(`Project: ${projectName}`, 50, infoY + 30);

  let currentY = infoY + 65;

  // Service breakdown header - only show "Per Video" if multiple videos
  const breakdownTitle = numVideos > 1 ? 'Service Breakdown (Per Video)' : 'Service Breakdown';
  doc
    .fontSize(14)
    .fillColor('#000000')
    .font('Helvetica-Bold')
    .text(breakdownTitle, 50, currentY);

  currentY += 30;

  // Clean table headers with better spacing
  doc
    .fontSize(11)
    .fillColor('#666666')
    .font('Helvetica-Bold')
    .text('Service', 50, currentY);
  
  if (showRateCalculation) {
    doc.text('Hours Needed', 280, currentY);
  }
  
  doc.text('Total', 450, currentY, { align: 'right', width: 100 });

  currentY += 20;

  // Service breakdown with complexity-aware formatting
  let totalPerVideo = 0;
  
  if (videoLength && needsFacecam !== undefined && needsMotionGraphics !== undefined && motionGraphicsComplexity) {
    // Calculate actual times based on complexity
    const lengthMultipliers = VIDEO_LENGTH_MULTIPLIERS[videoLength as keyof typeof VIDEO_LENGTH_MULTIPLIERS];
    const mgComplexity = MOTION_GRAPHICS_COMPLEXITY[motionGraphicsComplexity as keyof typeof MOTION_GRAPHICS_COMPLEXITY];
    
    const serviceCalculations = [
      { 
        name: "Scripting + Planning", 
        time: SERVICES.scriptPlanning.baseTime, 
        rate: SERVICES.scriptPlanning.rate 
      },
      { 
        name: "Screen Recording + Voiceover", 
        time: SERVICES.screenRecording.baseTime * lengthMultipliers.recordingMultiplier, 
        rate: SERVICES.screenRecording.rate 
      },
      ...(needsFacecam ? [{ 
        name: "Camera Equipment + Recording Time", 
        time: SERVICES.facecamRecording.baseTime * lengthMultipliers.recordingMultiplier, 
        rate: SERVICES.facecamRecording.rate 
      }] : []),
      { 
        name: "Editing + Assembly", 
        time: SERVICES.editing.baseTime * lengthMultipliers.editingMultiplier, 
        rate: SERVICES.editing.rate 
      },
      ...(needsMotionGraphics ? [{ 
        name: `Motion Graphics (${mgComplexity.name.split(' ')[0]})`, 
        time: SERVICES.motionGraphics.baseTime * mgComplexity.multiplier, 
        rate: SERVICES.motionGraphics.rate 
      }] : []),
      { 
        name: "Admin / Export / Feedback", 
        time: SERVICES.admin.baseTime, 
        rate: SERVICES.admin.rate 
      }
    ];

    serviceCalculations.forEach(service => {
      // Round each service to nearest half hour for display and billing
      const halfHourTime = roundToHalfHour(service.time);
      doc
        .fontSize(10)
        .fillColor('#000000')
        .font('Helvetica')
        .text(service.name, 50, currentY);
      
      if (showRateCalculation) {
        doc
          .text(`${halfHourTime.toFixed(1)}h`, 280, currentY)
          .text(`EUR ${(halfHourTime * service.rate).toFixed(2)}`, 450, currentY, { align: 'right', width: 100 });
      } else {
        doc.text(`EUR ${(halfHourTime * service.rate).toFixed(2)}`, 450, currentY, { align: 'right', width: 100 });
      }
      
      currentY += 16;
    });

    // Total per video calculation with half-hour rounded times
    totalPerVideo = serviceCalculations.reduce((sum, service) => 
      sum + (roundToHalfHour(service.time) * service.rate), 0);
      
  } else {
    // Fallback to basic service display
    Object.values(SERVICES).forEach(service => {
      const halfHourTime = roundToHalfHour(service.baseTime); // Round base times to half hours
      doc
        .fontSize(10)
        .fillColor('#000000')
        .font('Helvetica')
        .text(service.name.replace(' + ', ' & ').replace(' (if needed)', ''), 50, currentY);
      
      if (showRateCalculation) {
        doc
          .text(`${halfHourTime.toFixed(1)}h`, 280, currentY)
          .text(`EUR ${(halfHourTime * service.rate).toFixed(2)}`, 450, currentY, { align: 'right', width: 100 });
      } else {
        doc.text(`EUR ${(halfHourTime * service.rate).toFixed(2)}`, 450, currentY, { align: 'right', width: 100 });
      }
      
      currentY += 16;
    });

    // Total per video calculation with half-hour rounded base times
    totalPerVideo = Object.values(SERVICES).reduce((sum, service) => 
      sum + (roundToHalfHour(service.baseTime) * service.rate), 0);
  }

  currentY += 10;
  
  // Add separator line
  doc
    .moveTo(50, currentY)
    .lineTo(500, currentY)
    .strokeColor('#E5E5E5')
    .lineWidth(1)
    .stroke();
  
  currentY += 15;

  // Dynamic video length display based on selection - with better formatting and context
  const videoLengthDisplay = videoLength ? VIDEO_LENGTH_MULTIPLIERS[videoLength as keyof typeof VIDEO_LENGTH_MULTIPLIERS].name : "Standard (2-5min)";
  const actualHours = hoursPerVideo;
  
  // Extract video type and duration for cleaner display
  const videoType = videoLengthDisplay.split(' ')[0]; // "Short", "Standard", etc.
  const videoDuration = videoLengthDisplay.match(/\(([^)]+)\)/)?.[1] || "2-5min"; // Extract just the duration part
  
  // Show clean video length description - omit "Standard" as it's redundant
  const displayTitle = videoType === "Standard" 
    ? `Total per Video (${videoDuration})` 
    : `Total per ${videoType} Video (${videoDuration})`;
  
  doc
    .fontSize(11)
    .fillColor('#000000')
    .font('Helvetica-Bold')
    .text(displayTitle, 50, currentY);
  
  if (showRateCalculation) {
    doc
      .text(`${actualHours}h`, 280, currentY)
      .text(`EUR ${totalPerVideo.toFixed(2)}`, 450, currentY, { align: 'right', width: 100 });
  } else {
    doc.text(`EUR ${totalPerVideo.toFixed(2)}`, 450, currentY, { align: 'right', width: 100 });
  }

  currentY += 30;

  // Project scope with enhanced details
  doc
    .fontSize(14)
    .fillColor('#000000')
    .font('Helvetica-Bold')
    .text('PROJECT SCOPE', 50, currentY);

  currentY += 20;

  const regularTotal = numVideos * hoursPerVideo * HOURLY_RATE;
  const totalHours = numVideos * hoursPerVideo;
  
  // Calculate delivery estimate based on 40-hour work week
  const workWeeks = Math.ceil(totalHours / 40);
  const deliveryDays = workWeeks * 7; // Convert weeks to days for more granular display
  
  // Format delivery estimate
  let deliveryEstimate = "";
  if (deliveryDays <= 7) {
    deliveryEstimate = "1 week";
  } else if (deliveryDays <= 14) {
    deliveryEstimate = "2 weeks";
  } else if (deliveryDays <= 21) {
    deliveryEstimate = "3 weeks";
  } else if (deliveryDays <= 30) {
    deliveryEstimate = "1 month";
  } else {
    const months = Math.ceil(deliveryDays / 30);
    deliveryEstimate = `${months} months`;
  }

  doc
    .fontSize(11)
    .fillColor('#333333')
    .font('Helvetica')
    .text(`Videos: ${numVideos}`, 50, currentY)
    .text(`Hours per video: ${hoursPerVideo}`, 50, currentY + 15)
    .text(`Total hours needed: ${totalHours}`, 50, currentY + 30)
    .text(`Estimated delivery: ${deliveryEstimate} (before feedback rounds)`, 50, currentY + 45);

  currentY += 75;

  doc
    .fontSize(12)
    .fillColor('#000000')
    .font('Helvetica-Bold')
    .text(`Subtotal:`, 50, currentY)
    .text(`EUR ${regularTotal.toFixed(2)}`, 450, currentY, { align: 'right', width: 100 });

  currentY += 25;

  // Quantity discount section (if applicable)
  if (discountTier) {
    const discount = QUANTITY_DISCOUNTS[discountTier as keyof typeof QUANTITY_DISCOUNTS];
    const discountAmount = regularTotal * discount.discount;
    const discountPercentage = (discount.discount * 100).toFixed(0);
    
    doc
      .fontSize(12)
      .fillColor('#000000')
      .font('Helvetica-Bold')
      .text('QUANTITY DISCOUNT APPLIED', 50, currentY);

    currentY += 20;

    doc
      .fontSize(10)
      .fillColor('#333333')
      .font('Helvetica')
      .text(`${discount.name} (${discountPercentage}% off)`, 50, currentY);

    currentY += 15;

    doc
      .fontSize(10)
      .fillColor('#DC2626')
      .font('Helvetica')
      .text(`Quantity discount savings:`, 50, currentY)
      .text(`-EUR ${discountAmount.toFixed(2)}`, 450, currentY, { align: 'right', width: 100 });

    currentY += 20;
  }

  // Add separator line before total
  doc
    .moveTo(50, currentY)
    .lineTo(500, currentY)
    .strokeColor('#E5E5E5')
    .lineWidth(1)
    .stroke();
  
  currentY += 15;

  // Final total with subtle accent color
  doc
    .fontSize(16)
    .fillColor('#2563EB') // Professional blue accent instead of pink
    .font('Helvetica-Bold')
    .text(`TOTAL QUOTE:`, 50, currentY)
    .text(`EUR ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 400, currentY, { align: 'right', width: 150 });

  currentY += 40;

  // Notes section with clean formatting
  if (extraNotes) {
    doc
      .fontSize(12)
      .fillColor('#000000')
      .font('Helvetica-Bold')
      .text('NOTES', 50, currentY);

    currentY += 18;

    doc
      .fontSize(10)
      .fillColor('#333333')
      .font('Helvetica')
      .text(extraNotes, 50, currentY, { width: 400, align: 'left' });

    currentY += 35;
  }

  // Enhanced footer with more context and professionalism
  doc
    .fontSize(8)
    .fillColor('#666666')
    .font('Helvetica')
    .text('This quote is valid for 30 days from the date above. All prices are in EUR and exclude VAT where applicable.', 50, currentY - 10, { width: 450, align: 'left' });

  doc
    .fontSize(8)
    .fillColor('#666666')
    .font('Helvetica')
    .text('Payment Terms: 50% upfront, 50% upon delivery. Includes 2 revision rounds — additional rounds billed at €46/hour.', 50, currentY, { width: 450, align: 'left' });


    doc.end();

  return new Promise<void>((resolve, reject) => {
    writeStream.on('finish', () => resolve());
    writeStream.on('error', reject);
  });
}

async function main() {
  if (!fs.existsSync(QUOTES_DIR)) {
    fs.mkdirSync(QUOTES_DIR);
  }

  console.log("Welcome to the PDF Quote Generator!\n");

  const { clientName, projectName, numVideos, hoursPerVideo, extraNotes, discountTier, videoLength, needsFacecam, needsMotionGraphics, motionGraphicsComplexity, showRateCalculation } = await promptUser();

  if (!clientName || !projectName || isNaN(numVideos)) {
    console.error("Missing or invalid input. Exiting.");
    process.exit(1);
  }

  let total = 0;
  const regularTotal = numVideos * hoursPerVideo * HOURLY_RATE;
  
  if (discountTier) {
    // Apply quantity discount
    const discount = QUANTITY_DISCOUNTS[discountTier as keyof typeof QUANTITY_DISCOUNTS];
    const discountAmount = regularTotal * discount.discount;
    total = regularTotal - discountAmount;
  } else {
    // Regular pricing
    total = regularTotal;
  }

  const today = new Date();
  const dateStr = formatDate(today);
  const safeClientName = clientName.replace(/\W+/g, '-').toLowerCase();
  const outPath = path.join(QUOTES_DIR, `quote-${safeClientName}-${dateStr}.pdf`);

  await createPDF({
    clientName,
    projectName,
    numVideos,
    hoursPerVideo,
    extraNotes,
    total,
    outPath,
    dateStr,
    discountTier,
    videoLength,
    needsFacecam,
    needsMotionGraphics,
    motionGraphicsComplexity,
    showRateCalculation,
  });

  console.log(`Quote generated: ${outPath}`);
}

main().catch((err) => {
  console.error("An error occurred:", err);
  process.exit(1);
});