import { QuoteData } from '../types';
import { SERVICES, VIDEO_LENGTH_MULTIPLIERS, MOTION_GRAPHICS_COMPLEXITY } from '../config/pricing';
import { VIDEO_TYPES } from '../config/video-types';
import { roundToHalfHour } from '../utils/helpers';

export function calculateVideoHours(
  videoType: string,
  videoLength: string,
  services: Partial<QuoteData>
): number {
  const lengthMultipliers = VIDEO_LENGTH_MULTIPLIERS[videoLength];
  const videoTypeConfig = VIDEO_TYPES[videoType];
  const mgComplexity = MOTION_GRAPHICS_COMPLEXITY[services.motionGraphicsComplexity || "simple"];
  
  let totalHours = 0;
  
  // Calculate each service based on video type multipliers
  const serviceCalculations = {
    scriptPlanning: SERVICES.scriptPlanning.baseTime * videoTypeConfig.services.scriptPlanning.multiplier,
    
    screenRecording: services.needsFacecam !== false ? 
      SERVICES.screenRecording.baseTime * lengthMultipliers.recordingMultiplier * videoTypeConfig.services.screenRecording.multiplier : 0,
    
    facecamRecording: services.needsFacecam ? 
      SERVICES.facecamRecording.baseTime * lengthMultipliers.recordingMultiplier * videoTypeConfig.services.facecamRecording.multiplier : 0,
    
    editing: SERVICES.editing.baseTime * lengthMultipliers.editingMultiplier * videoTypeConfig.services.editing.multiplier,
    
    motionGraphics: services.needsMotionGraphics ? 
      SERVICES.motionGraphics.baseTime * mgComplexity.multiplier * videoTypeConfig.services.motionGraphics.multiplier : 0,
    
    admin: SERVICES.admin.baseTime * videoTypeConfig.services.admin.multiplier,
    
    // Additional services based on video type
    locationScouting: services.needsLocationScouting ? 
      SERVICES.locationScouting.baseTime * (videoTypeConfig.services.locationScouting?.multiplier || 0) : 0,
    
    actorDirection: services.needsActorDirection ? 
      SERVICES.actorDirection.baseTime * (videoTypeConfig.services.actorDirection?.multiplier || 0) : 0,
    
    colorGrading: services.needsColorGrading ? 
      SERVICES.colorGrading.baseTime * (videoTypeConfig.services.colorGrading?.multiplier || 0) : 0,
    
    soundDesign: services.needsSoundDesign ? 
      SERVICES.soundDesign.baseTime * (videoTypeConfig.services.soundDesign?.multiplier || 0) : 0,
    
    storyboarding: services.needsStoryboarding ? 
      SERVICES.storyboarding.baseTime * (videoTypeConfig.services.storyboarding?.multiplier || 0) : 0,
    
    illustration: services.needsIllustration ? 
      SERVICES.illustration.baseTime * (videoTypeConfig.services.illustration?.multiplier || 0) : 0,
    
    characterDesign: services.needsCharacterDesign ? 
      SERVICES.characterDesign.baseTime * (videoTypeConfig.services.characterDesign?.multiplier || 0) : 0
  };
  
  // Sum all services
  totalHours = Object.values(serviceCalculations).reduce((sum, hours) => sum + hours, 0);
  
  return roundToHalfHour(totalHours);
}

export function getServiceBreakdown(
  videoType: string,
  videoLength: string,
  services: Partial<QuoteData>
): Array<{ name: string; time: number; rate: number }> {
  const lengthMultipliers = VIDEO_LENGTH_MULTIPLIERS[videoLength];
  const videoTypeConfig = VIDEO_TYPES[videoType];
  const mgComplexity = MOTION_GRAPHICS_COMPLEXITY[services.motionGraphicsComplexity || "simple"];
  
  const breakdown = [];
  
  // Core services
  breakdown.push({
    name: "Scripting + Planning",
    time: SERVICES.scriptPlanning.baseTime * videoTypeConfig.services.scriptPlanning.multiplier,
    rate: SERVICES.scriptPlanning.rate
  });
  
  if (videoTypeConfig.services.screenRecording.multiplier > 0.1) { // Only show if significant
    breakdown.push({
      name: "Screen Recording + Voiceover",
      time: SERVICES.screenRecording.baseTime * lengthMultipliers.recordingMultiplier * videoTypeConfig.services.screenRecording.multiplier,
      rate: SERVICES.screenRecording.rate
    });
  }
  
  if (services.needsFacecam) {
    breakdown.push({
      name: "Camera Equipment + Recording Time",
      time: SERVICES.facecamRecording.baseTime * lengthMultipliers.recordingMultiplier * videoTypeConfig.services.facecamRecording.multiplier,
      rate: SERVICES.facecamRecording.rate
    });
  }
  
  breakdown.push({
    name: "Editing + Assembly",
    time: SERVICES.editing.baseTime * lengthMultipliers.editingMultiplier * videoTypeConfig.services.editing.multiplier,
    rate: SERVICES.editing.rate
  });
  
  if (services.needsMotionGraphics) {
    breakdown.push({
      name: `Motion Graphics (${mgComplexity.name.split(' ')[0]})`,
      time: SERVICES.motionGraphics.baseTime * mgComplexity.multiplier * videoTypeConfig.services.motionGraphics.multiplier,
      rate: SERVICES.motionGraphics.rate
    });
  }
  
  // Additional services
  if (services.needsLocationScouting) {
    breakdown.push({
      name: SERVICES.locationScouting.name,
      time: SERVICES.locationScouting.baseTime * (videoTypeConfig.services.locationScouting?.multiplier || 1),
      rate: SERVICES.locationScouting.rate
    });
  }
  
  if (services.needsActorDirection) {
    breakdown.push({
      name: SERVICES.actorDirection.name,
      time: SERVICES.actorDirection.baseTime * (videoTypeConfig.services.actorDirection?.multiplier || 1),
      rate: SERVICES.actorDirection.rate
    });
  }
  
  if (services.needsColorGrading) {
    breakdown.push({
      name: SERVICES.colorGrading.name,
      time: SERVICES.colorGrading.baseTime * (videoTypeConfig.services.colorGrading?.multiplier || 1),
      rate: SERVICES.colorGrading.rate
    });
  }
  
  if (services.needsSoundDesign) {
    breakdown.push({
      name: SERVICES.soundDesign.name,
      time: SERVICES.soundDesign.baseTime * (videoTypeConfig.services.soundDesign?.multiplier || 1),
      rate: SERVICES.soundDesign.rate
    });
  }
  
  if (services.needsStoryboarding) {
    breakdown.push({
      name: SERVICES.storyboarding.name,
      time: SERVICES.storyboarding.baseTime * (videoTypeConfig.services.storyboarding?.multiplier || 1),
      rate: SERVICES.storyboarding.rate
    });
  }
  
  if (services.needsIllustration) {
    breakdown.push({
      name: SERVICES.illustration.name,
      time: SERVICES.illustration.baseTime * (videoTypeConfig.services.illustration?.multiplier || 1),
      rate: SERVICES.illustration.rate
    });
  }
  
  if (services.needsCharacterDesign) {
    breakdown.push({
      name: SERVICES.characterDesign.name,
      time: SERVICES.characterDesign.baseTime * (videoTypeConfig.services.characterDesign?.multiplier || 1),
      rate: SERVICES.characterDesign.rate
    });
  }
  
  breakdown.push({
    name: SERVICES.admin.name,
    time: SERVICES.admin.baseTime * videoTypeConfig.services.admin.multiplier,
    rate: SERVICES.admin.rate
  });
  
  // Round all times to half hours
  return breakdown.map(item => ({
    ...item,
    time: roundToHalfHour(item.time)
  }));
}
