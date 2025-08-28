import PDFDocument from 'pdfkit';
import fs from 'fs';
import { QuoteData } from '../types';
import { BRAND } from '../config/brand';
import { HOURLY_RATE, QUANTITY_DISCOUNTS, VIDEO_LENGTH_MULTIPLIERS } from '../config/pricing';
import { VIDEO_TYPES } from '../config/video-types';
import { titleCase } from '../utils/helpers';
import { getServiceBreakdown } from './calculator';

interface PDFData extends QuoteData {
  total: number;
  outPath: string;
  dateStr: string;
}

export function createPDF(data: PDFData): Promise<void> {
  const doc = new PDFDocument({ margin: 50 });
  const writeStream = fs.createWriteStream(data.outPath);
  doc.pipe(writeStream);

  // Modern header with prominent service title and compact contact column
  const headerY = 40;
  const logoSize = 80;
  const rightColumnX = doc.page.width - 145;
  
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

  // Name and contact info below logo in right column
  doc
    .fontSize(11)
    .fillColor('#1a1a1a')
    .font('Helvetica-Bold')
    .text(BRAND.name, rightColumnX, headerY - 20 + logoSize + 11);

  doc
    .fontSize(9)
    .fillColor('#6a6a6a')
    .font('Helvetica')
    .text(BRAND.email, rightColumnX, headerY - 20 + logoSize + 28)
    .text(BRAND.phone || '+1 (555) 123-4567', rightColumnX, headerY - 20 + logoSize + 41)
    .text(BRAND.location || 'Your City, Country', rightColumnX, headerY - 20 + logoSize + 54);

  // Subtle tagline with generous spacing
  doc
    .fontSize(10)
    .fillColor('#8a8a8a')
    .font('Helvetica')
    .text(BRAND.tagline || 'Your professional tagline • Your specialties • Your unique value proposition', 50, headerY + 90, { 
      align: 'left', 
      width: rightColumnX - 70,
    });

  // Ultra-minimal gradient separator line - fades from gray to white, stops before contact column
  const separatorY = headerY + 110;
  const separatorStartX = 50;
  const separatorEndX = rightColumnX - 30; // Stop 30px before contact column
  
  // Create gradient from gray to white
  const gradient = doc.linearGradient(separatorStartX, separatorY, separatorEndX, separatorY);
  gradient.stop(0, '#e6e6e6')  // Start with current gray color
          .stop(0.8, '#f5f5f5')  // Fade to light gray
          .stop(1, '#ffffff');   // End with white
  
  // Draw the gradient line
  doc
    .rect(separatorStartX, separatorY, separatorEndX - separatorStartX, 0.5)
    .fill(gradient);

// Clean, minimal quote header with tighter spacing
doc
    .fontSize(20)
    .fillColor('#1a1a1a')
    .font('Helvetica')
    .text('Quote', 50, headerY + 120); // moved up

// Project info with clean typography
let infoY = headerY + 150; // moved up
const videoTypeConfig = VIDEO_TYPES[data.videoType];
  
  doc
    .fontSize(11)
    .fillColor('#333333')
    .font('Helvetica')
    .text(`Date: ${data.dateStr}`, 50, infoY)
    .text(`Client: ${titleCase(data.clientName)}`, 50, infoY + 15)
    .text(`Project: ${data.projectName}`, 50, infoY + 30)
    .text(`Video Type: ${videoTypeConfig.name}`, 50, infoY + 45);

  let currentY = infoY + 70; // 65 + 5 (1/3 back towards 80)

  // Service breakdown header - only show "Per Video" if multiple videos
  const breakdownTitle = data.numVideos > 1 ? 'Service Breakdown (Per Video)' : 'Service Breakdown';
  doc
    .fontSize(14)
    .fillColor('#000000')
    .font('Helvetica-Bold')
    .text(breakdownTitle, 50, currentY);

  currentY += 27; // 25 + 2 (1/3 back towards 30)

  // Clean table headers with better spacing
  doc
    .fontSize(11)
    .fillColor('#666666')
    .font('Helvetica-Bold')
    .text('Service', 50, currentY);
  
  if (data.showRateCalculation) {
    doc.text('Hours Needed', 280, currentY);
  }
  
  doc.text('Total', 450, currentY, { align: 'right', width: 100 });

  currentY += 20;

  // Service breakdown with dynamic service calculation
  const serviceBreakdown = getServiceBreakdown(data.videoType, data.videoLength, data);
  let totalPerVideo = 0;

  serviceBreakdown.forEach(service => {
    if (service.time > 0) { // Only show services that have time allocated
      doc
        .fontSize(10)
        .fillColor('#000000')
        .font('Helvetica')
        .text(service.name, 50, currentY);
      
      if (data.showRateCalculation) {
        doc
          .text(`${service.time.toFixed(1)}h`, 280, currentY)
          .text(`EUR ${(service.time * service.rate).toFixed(2)}`, 450, currentY, { align: 'right', width: 100 });
      } else {
        doc.text(`EUR ${(service.time * service.rate).toFixed(2)}`, 450, currentY, { align: 'right', width: 100 });
      }
      
      totalPerVideo += service.time * service.rate;
      currentY += 15; // 14 + 1 (1/3 back towards 16)
    }
  });

  currentY += 9; // 8 + 1 (1/3 back towards 10)
  
  // Add separator line
  doc
    .moveTo(50, currentY)
    .lineTo(500, currentY)
    .strokeColor('#E5E5E5')
    .lineWidth(1)
    .stroke();
  
  currentY += 13; // 12 + 1 (1/3 back towards 15)

  // Dynamic video length display
  const videoLengthDisplay = VIDEO_LENGTH_MULTIPLIERS[data.videoLength].name;
  const actualHours = data.hoursPerVideo;
  
  // Extract video type and duration for cleaner display
  const videoType = videoLengthDisplay.split(' ')[0];
  const videoDuration = videoLengthDisplay.match(/\(([^)]+)\)/)?.[1] || "2-5min";
  
  const displayTitle = videoType === "Standard" 
    ? `Total per Video (${videoDuration})` 
    : `Total per ${videoType} Video (${videoDuration})`;
  
  doc
    .fontSize(11)
    .fillColor('#000000')
    .font('Helvetica-Bold')
    .text(displayTitle, 50, currentY);
  
  if (data.showRateCalculation) {
    doc
      .text(`${actualHours}h`, 280, currentY)
      .text(`EUR ${totalPerVideo.toFixed(2)}`, 450, currentY, { align: 'right', width: 100 });
  } else {
    doc.text(`EUR ${totalPerVideo.toFixed(2)}`, 450, currentY, { align: 'right', width: 100 });
  }

  currentY += 27; // 25 + 2 (1/3 back towards 30)

  // Project scope with enhanced details
  doc
    .fontSize(14)
    .fillColor('#000000')
    .font('Helvetica-Bold')
    .text('PROJECT SCOPE', 50, currentY);

  currentY += 19; // 18 + 1 (1/3 back towards 20)

  const regularTotal = data.numVideos * data.hoursPerVideo * HOURLY_RATE;
  const totalHours = data.numVideos * data.hoursPerVideo;
  
  // Calculate delivery estimate based on 40-hour work week
  const workWeeks = Math.ceil(totalHours / 40);
  const deliveryDays = workWeeks * 7;
  
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
    .text(`Videos: ${data.numVideos} × ${videoTypeConfig.name}`, 50, currentY)
    .text(`Hours per video: ${data.hoursPerVideo}`, 50, currentY + 13) // 12 + 1 (1/3 back towards 15)
    .text(`Total hours needed: ${totalHours}`, 50, currentY + 26)      // 24 + 2 (1/3 back towards 30)
    .text(`Estimated delivery: ${deliveryEstimate} (before feedback rounds)`, 50, currentY + 39); // 36 + 3 (1/3 back towards 45)

  currentY += 60; // 55 + 5 (1/3 back towards 75)

  doc
    .fontSize(12)
    .fillColor('#000000')
    .font('Helvetica-Bold')
    .text(`Subtotal:`, 50, currentY)
    .text(`EUR ${regularTotal.toFixed(2)}`, 450, currentY, { align: 'right', width: 100 });

  currentY += 22; // 20 + 2 (1/3 back towards 25)

  // Quantity discount section (if applicable)
  if (data.discountTier) {
    const discount = QUANTITY_DISCOUNTS[data.discountTier as keyof typeof QUANTITY_DISCOUNTS];
    const discountAmount = regularTotal * discount.discount;
    const discountPercentage = (discount.discount * 100).toFixed(0);
    
    doc
      .fontSize(12)
      .fillColor('#000000')
      .font('Helvetica-Bold')
      .text('QUANTITY DISCOUNT APPLIED', 50, currentY);

    currentY += 19; // 18 + 1 (1/3 back towards 20)

    doc
      .fontSize(10)
      .fillColor('#333333')
      .font('Helvetica')
      .text(`${discount.name} (${discountPercentage}% off)`, 50, currentY);

    currentY += 13; // 12 + 1 (1/3 back towards 15)

    doc
      .fontSize(10)
      .fillColor('#DC2626')
      .font('Helvetica')
      .text(`Quantity discount savings:`, 50, currentY)
      .text(`-EUR ${discountAmount.toFixed(2)}`, 450, currentY, { align: 'right', width: 100 });

    currentY += 19; // 18 + 1 (1/3 back towards 20)
  }

  // Add separator line before total
  doc
    .moveTo(50, currentY)
    .lineTo(500, currentY)
    .strokeColor('#E5E5E5')
    .lineWidth(1)
    .stroke();
  
  currentY += 13; // 12 + 1 (1/3 back towards 15)

  // Final total with subtle accent color
  doc
    .fontSize(16)
    .fillColor('#2563EB')
    .font('Helvetica-Bold')
    .text(`TOTAL QUOTE:`, 50, currentY)
    .text(`EUR ${data.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 400, currentY, { align: 'right', width: 150 });

  currentY += 33; // 30 + 3 (1/3 back towards 40)

  // Notes section with clean formatting
  if (data.extraNotes) {
    doc
      .fontSize(12)
      .fillColor('#000000')
      .font('Helvetica-Bold')
      .text('NOTES', 50, currentY);

    currentY += 16; // 15 + 1 (1/3 back towards 18)

    doc
      .fontSize(10)
      .fillColor('#333333')
      .font('Helvetica')
      .text(data.extraNotes, 50, currentY, { width: 400, align: 'left' });

    currentY += 28; // 25 + 3 (1/3 back towards 35)
  }

    // Enhanced footer with comprehensive professional terms - single block with line breaks
  const footerWidth = doc.page.width - 100; // Full width minus margins
  
  const footerText = BRAND.footerTerms.replace('{HOURLY_RATE}', HOURLY_RATE.toString());
  
  doc
    .fontSize(8)
    .fillColor('#666666')
    .font('Helvetica')
    .text(footerText, 50, currentY, { width: footerWidth, align: 'justify' });

  doc.end();

  return new Promise<void>((resolve, reject) => {
    writeStream.on('finish', () => resolve());
    writeStream.on('error', reject);
  });
}
