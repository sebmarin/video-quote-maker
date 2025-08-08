import readline from 'readline';
import { VIDEO_TYPES, VideoTypeKey } from './videoTypes';
import { VIDEO_LENGTH_MULTIPLIERS, MOTION_GRAPHICS_COMPLEXITY, QUANTITY_DISCOUNTS, HOURLY_RATE } from './config';
import { calculateVideoHours } from './calculator';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

export interface QuoteData {
  clientName: string;
  projectName: string;
  numVideos: number;
  videoType: VideoTypeKey;
  videoLength: string;
  needsFacecam: boolean;
  needsMotionGraphics: boolean;
  motionGraphicsComplexity: string;
  showRateCalculation: boolean;
  hoursPerVideo: number;
  extraNotes: string;
  discountTier?: string;
  additionalOptions: Record<string, boolean>;
}

export async function promptUser(): Promise<QuoteData> {
  const clientName = (await question("Client Name: ")).trim();
  const projectName = (await question("Project Name: ")).trim();
  const numVideos = parseInt(await question("Number of Videos: "), 10);
  
  // Video type selection
  console.log("\nVideo Type:");
  const videoTypeEntries = Object.entries(VIDEO_TYPES);
  videoTypeEntries.forEach(([key, type], index) => {
    console.log(`${index + 1}. ${type.name}`);
    console.log(`   ${type.description}`);
  });
  
  const videoTypeChoice = (await question(`Choose video type (1-${videoTypeEntries.length}): `)).trim();
  const videoType = videoTypeEntries[parseInt(videoTypeChoice) - 1]?.[0] as VideoTypeKey || "technical";
  
  // Video length selection
  console.log("\nVideo Length:");
  console.log("1. Short (30s-2min)");
  console.log("2. Standard (2-5min)");
  console.log("3. Long (5-10min)");
  console.log("4. Extended (10min+)");
  const videoLengthChoice = (await question("Choose video length (1-4): ")).trim();
  const videoLengthMap = ["short", "standard", "long", "extended"];
  const videoLength = videoLengthMap[parseInt(videoLengthChoice) - 1] || "standard";
  
  // Get additional options based on video type
  const additionalOptions: Record<string, boolean> = {};
  const selectedVideoType = VIDEO_TYPES[videoType];
  
  // Facecam/talent recording (varies by type)
  const facecamQuestion = videoType === 'animation' ? 
    "Do you need voiceover recording? (y/n): " : 
    "Do you need facecam/talent recording? (y/n): ";
  const needsFacecam = (await question(facecamQuestion)).trim().toLowerCase() === 'y';
  
  // Type-specific additional options
  if (videoType === 'documentary') {
    additionalOptions.needsBRoll = (await question("Do you need B-Roll footage? (y/n): ")).trim().toLowerCase() === 'y';
  }
  
  if (videoType === 'creative') {
    additionalOptions.needsColorGrading = (await question("Do you need advanced color grading? (y/n): ")).trim().toLowerCase() === 'y';
  }
  
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
  
  // Calculate hours based on all selections
  const hoursPerVideo = calculateVideoHours(
    videoType, 
    videoLength, 
    needsFacecam, 
    needsMotionGraphics, 
    motionGraphicsComplexity,
    additionalOptions
  );
  
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
    videoType,
    videoLength,
    needsFacecam,
    needsMotionGraphics,
    motionGraphicsComplexity,
    showRateCalculation,
    hoursPerVideo, 
    extraNotes, 
    discountTier,
    additionalOptions
  };
}
