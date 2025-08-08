import readline from 'readline';
import { QuoteData } from '../types';
import { VIDEO_TYPES } from '../config/video-types';
import { QUANTITY_DISCOUNTS, HOURLY_RATE } from '../config/pricing';
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

export async function promptUser(): Promise<QuoteData> {
  const clientName = (await question("Client Name: ")).trim();
  const projectName = (await question("Project Name: ")).trim();
  const numVideos = parseInt(await question("Number of Videos: "), 10);
  
  // Video type selection
  console.log("\nVideo Type:");
  const videoTypeEntries = Object.entries(VIDEO_TYPES);
  videoTypeEntries.forEach(([key, config], index) => {
    console.log(`${index + 1}. ${config.name}`);
    console.log(`   ${config.description}`);
  });
  
  const videoTypeChoice = (await question(`Choose video type (1-${videoTypeEntries.length}): `)).trim();
  const videoTypeKeys = videoTypeEntries.map(([key]) => key);
  const videoType = videoTypeKeys[parseInt(videoTypeChoice) - 1] || "technical";
  
  const selectedVideoType = VIDEO_TYPES[videoType];
  console.log(`\n✅ Selected: ${selectedVideoType.name}`);
  
  // Video length selection
  console.log("\nVideo Length:");
  console.log("1. Short (30s-2min)");
  console.log("2. Standard (2-5min)");
  console.log("3. Long (5-10min)");
  console.log("4. Extended (10min+)");
  const videoLengthChoice = (await question("Choose video length (1-4): ")).trim();
  const videoLengthMap = ["short", "standard", "long", "extended"];
  const videoLength = videoLengthMap[parseInt(videoLengthChoice) - 1] || "standard";
  
  // Smart service prompts based on video type
  const services = await promptServicesForVideoType(videoType);
  
  // Ask about rate calculation display
  const showRateCalculation = (await question("\nShow detailed hourly breakdown in PDF? (y/n): ")).trim().toLowerCase() === 'y';
  
  // Calculate hours based on selections
  const hoursPerVideo = calculateVideoHours(videoType, videoLength, services);
  
  // Batch discount logic
  let discountTier: string | undefined = undefined;
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
    videoType,
    videoLength,
    showRateCalculation,
    needsFacecam: services.needsFacecam || false,
    needsMotionGraphics: services.needsMotionGraphics || false,
    motionGraphicsComplexity: services.motionGraphicsComplexity || "simple",
    needsLocationScouting: services.needsLocationScouting || false,
    needsActorDirection: services.needsActorDirection || false,
    needsColorGrading: services.needsColorGrading || false,
    needsSoundDesign: services.needsSoundDesign || false,
    needsStoryboarding: services.needsStoryboarding || false,
    needsIllustration: services.needsIllustration || false,
    needsCharacterDesign: services.needsCharacterDesign || false
  };
}

async function promptServicesForVideoType(videoType: string): Promise<Partial<QuoteData>> {
  const config = VIDEO_TYPES[videoType];
  const services: Partial<QuoteData> = {};
  
  console.log(`\n📋 Services for ${config.name}:`);
  
  // Always ask about typical services for this video type
  if (config.typicalServices.includes('facecamRecording') || config.optionalServices.includes('facecamRecording')) {
    services.needsFacecam = (await question("Do you need facecam/on-camera recording? (y/n): ")).trim().toLowerCase() === 'y';
  } else {
    services.needsFacecam = false;
  }
  
  if (config.typicalServices.includes('motionGraphics') || config.optionalServices.includes('motionGraphics')) {
    services.needsMotionGraphics = (await question("Do you need motion graphics/animations? (y/n): ")).trim().toLowerCase() === 'y';
    
    if (services.needsMotionGraphics) {
      console.log("\nMotion Graphics Complexity:");
      console.log("1. Simple (text animations, basic transitions)");
      console.log("2. Standard (icons, charts, moderate animations)");
      console.log("3. Complex (custom animations, 3D elements)");
      const complexityChoice = (await question("Choose complexity (1-3): ")).trim();
      const complexityMap = ["simple", "standard", "complex"];
      services.motionGraphicsComplexity = complexityMap[parseInt(complexityChoice) - 1] || "simple";
    } else {
      services.motionGraphicsComplexity = "simple";
    }
  } else {
    services.needsMotionGraphics = false;
    services.motionGraphicsComplexity = "simple";
  }
  
  // Ask about video-type specific services
  if (videoType === 'creative') {
    console.log("\n🎬 Creative Video Services:");
    services.needsLocationScouting = (await question("Do you need location scouting/setup? (y/n): ")).trim().toLowerCase() === 'y';
    services.needsActorDirection = (await question("Do you need talent/actor direction? (y/n): ")).trim().toLowerCase() === 'y';
    services.needsColorGrading = (await question("Do you need color grading/correction? (y/n): ")).trim().toLowerCase() === 'y';
    services.needsSoundDesign = (await question("Do you need sound design/audio enhancement? (y/n): ")).trim().toLowerCase() === 'y';
  }
  
  if (videoType === 'animation') {
    console.log("\n🎨 Animation Services:");
    services.needsStoryboarding = (await question("Do you need storyboarding? (y/n): ")).trim().toLowerCase() === 'y';
    services.needsIllustration = (await question("Do you need custom illustrations/assets? (y/n): ")).trim().toLowerCase() === 'y';
    services.needsCharacterDesign = (await question("Do you need character design? (y/n): ")).trim().toLowerCase() === 'y';
    services.needsSoundDesign = (await question("Do you need sound design? (y/n): ")).trim().toLowerCase() === 'y';
  }
  
  return services;
}
