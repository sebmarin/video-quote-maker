import PDFDocument from 'pdfkit';
import fs from 'fs';
import { BRAND, HOURLY_RATE, QUANTITY_DISCOUNTS } from './config';
import { VIDEO_TYPES, VideoTypeKey } from './videoTypes';
import { getServiceBreakdown } from './calculator';
import { QuoteData } from './prompt';

function titleCase(str: string) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function createPDF({
  clientName,
  projectName,
  numVideos,
  videoType,
  videoLength,
  needsFacecam,
  needsMotionGraphics,
  motionGraphicsComplexity,
  showRateCalculation,
  hoursPerVideo,
  extraNotes,
  total,
  outPath,
  dateStr,
  discountTier,
  additionalOptions
}: QuoteData & {
  total: number;
  outPath: string;
  dateStr: string;
}) {
  const doc = new PDFDocument({ margin: 50 });
  const writeStream = fs.createWriteStream(outPath);
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
    .fillColor('#0066cc')
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
    .text('+1 (555) 123-4567', rightColumnX, headerY - 20 + logoSize + 41)
    .text('Your City, Country', rightColumnX, headerY - 20 + logoSize + 54);

  // Subtle tagline with generous spacing
  doc
    .fontSize(10)
    .fillColor('#8a8a8a')
    .font('Helvetica')
    .text('Your professional tagline • Your specialties • Your unique value proposition', 50, headerY + 100, { 
      align: 'left', 
      width: rightColumnX - 70,
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
    .text(`Project: ${projectName}`, 50, infoY + 30)
    .text(`Video Type: ${VIDEO_TYPES[videoType].name}`, 50, infoY + 45);

  let currentY = infoY + 80;

  // Service breakdown header
  const breakdownTitle = numVideos > 1 ? 'Service Breakdown (Per Video)' : 'Service Breakdown';
  doc
    .fontSize(14)
    .fillColor('#000000')
    .font('Helvetica-Bold')
    .text(breakdownTitle, 50, currentY);

  currentY += 30;

  // Clean table headers
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

  // Get service breakdown based on video type
  const services = getServiceBreakdown(
    videoType,
    videoLength,
    needsFacecam,
    needsMotionGraphics,
    motionGraphicsComplexity,
    additionalOptions
  );

  let totalPerVideo = 0;

  services.forEach(service => {
    doc
      .fontSize(10)
      .fillColor('#000000')
      .font('Helvetica')
      .text(service.name, 50, currentY);
    
    if (showRateCalculation) {
      doc
        .text(`${service.time.toFixed(1)}h`, 280, currentY)
        .text(`EUR ${(service.time * service.rate).toFixed(2)}`, 450, currentY, { align: 'right', width: 100 });
    } else {
      doc.text(`EUR ${(service.time * service.rate).toFixed(2)}`, 450, currentY, { align: 'right', width: 100 });
    }
    
    totalPerVideo += service.time * service.rate;
    currentY += 16;
  });

  currentY += 10;
  
  // Add separator line
  doc
    .moveTo(50, currentY)
    .lineTo(500, currentY)
    .strokeColor('#E5E5E5')
    .lineWidth(1)
    .stroke();
  
  currentY += 15;

  // Total per video
  doc
    .fontSize(11)
    .fillColor('#000000')
    .font('Helvetica-Bold')
    .text(`Total per Video`, 50, currentY);
  
  if (showRateCalculation) {
    doc
      .text(`${hoursPerVideo}h`, 280, currentY)
      .text(`EUR ${totalPerVideo.toFixed(2)}`, 450, currentY, { align: 'right', width: 100 });
  } else {
    doc.text(`EUR ${totalPerVideo.toFixed(2)}`, 450, currentY, { align: 'right', width: 100 });
  }

  currentY += 30;

  // Project scope
  doc
    .fontSize(14)
    .fillColor('#000000')
    .font('Helvetica-Bold')
    .text('PROJECT SCOPE', 50, currentY);

  currentY += 20;

  const regularTotal = numVideos * hoursPerVideo * HOURLY_RATE;
  const totalHours = numVideos * hoursPerVideo;
  
  // Calculate delivery estimate
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

  // Quantity discount section
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

  // Final total
  doc
    .fontSize(16)
    .fillColor('#2563EB')
    .font('Helvetica-Bold')
    .text(`TOTAL QUOTE:`, 50, currentY)
    .text(`EUR ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 400, currentY, { align: 'right', width: 150 });

  currentY += 40;

  // Notes section
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

  // Footer
  doc
    .fontSize(8)
    .fillColor('#666666')
    .font('Helvetica')
    .text('This quote is valid for 30 days from the date above. All prices are in EUR and exclude VAT where applicable.', 50, currentY - 10, { width: 450, align: 'left' });

  doc
    .fontSize(8)
    .fillColor('#666666')
    .font('Helvetica')
    .text('Payment Terms: 50% upfront, 50% upon delivery. Includes 2 revision rounds — additional rounds billed at €' + HOURLY_RATE + '/hour.', 50, currentY, { width: 450, align: 'left' });

  doc.end();

  return new Promise<void>((resolve, reject) => {
    writeStream.on('finish', () => resolve());
    writeStream.on('error', reject);
  });
}
