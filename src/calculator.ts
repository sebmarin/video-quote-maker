import { VIDEO_TYPES, VideoTypeKey } from './videoTypes';
import { VIDEO_LENGTH_MULTIPLIERS, MOTION_GRAPHICS_COMPLEXITY } from './config';

// Helper function to round to nearest half hour (0.5)
export function roundToHalfHour(hours: number): number {
  return Math.ceil(hours * 2) / 2;
}

// Function to calculate hours based on video type and complexity
export function calculateVideoHours(
  videoType: VideoTypeKey,
  videoLength: string,
  needsFacecam: boolean,
  needsMotionGraphics: boolean,
  motionGraphicsComplexity: string,
  additionalOptions: Record<string, boolean> = {}
): number {
  const typeConfig = VIDEO_TYPES[videoType];
  const lengthMultipliers = VIDEO_LENGTH_MULTIPLIERS[videoLength as keyof typeof VIDEO_LENGTH_MULTIPLIERS];
  const mgComplexity = MOTION_GRAPHICS_COMPLEXITY[motionGraphicsComplexity as keyof typeof MOTION_GRAPHICS_COMPLEXITY];
  
  let totalHours = 0;
  
  // Process each service based on video type
  Object.entries(typeConfig.services).forEach(([serviceKey, service]) => {
    let includeService = !service.optional;
    
    // Special handling for optional services
    if (service.optional) {
      switch (serviceKey) {
        case 'facecamRecording':
        case 'voiceoverRecording':
          includeService = needsFacecam;
          break;
        case 'motionGraphics':
          includeService = needsMotionGraphics;
          break;
        case 'bRollShooting':
          includeService = additionalOptions.needsBRoll || false;
          break;
        default:
          includeService = additionalOptions[serviceKey] || false;
      }
    }
    
    if (includeService) {
      let serviceTime = service.baseTime;
      
      // Apply video type multiplier
      const typeMultiplier = typeConfig.multipliers[serviceKey as keyof typeof typeConfig.multipliers] || 1.0;
      serviceTime *= typeMultiplier;
      
      // Apply length multipliers for relevant services
      if (serviceKey.includes('Recording') || serviceKey.includes('Shooting')) {
        serviceTime *= lengthMultipliers.recordingMultiplier;
      } else if (serviceKey.includes('editing') || serviceKey.includes('animation')) {
        serviceTime *= lengthMultipliers.editingMultiplier;
      }
      
      // Apply motion graphics complexity
      if (serviceKey === 'motionGraphics' && needsMotionGraphics) {
        serviceTime *= mgComplexity.multiplier;
      }
      
      totalHours += serviceTime;
    }
  });
  
  return roundToHalfHour(totalHours);
}

// Get service breakdown for PDF generation
export function getServiceBreakdown(
  videoType: VideoTypeKey,
  videoLength: string,
  needsFacecam: boolean,
  needsMotionGraphics: boolean,
  motionGraphicsComplexity: string,
  additionalOptions: Record<string, boolean> = {}
) {
  const typeConfig = VIDEO_TYPES[videoType];
  const lengthMultipliers = VIDEO_LENGTH_MULTIPLIERS[videoLength as keyof typeof VIDEO_LENGTH_MULTIPLIERS];
  const mgComplexity = MOTION_GRAPHICS_COMPLEXITY[motionGraphicsComplexity as keyof typeof MOTION_GRAPHICS_COMPLEXITY];
  
  const services: Array<{
    name: string;
    time: number;
    rate: number;
  }> = [];
  
  Object.entries(typeConfig.services).forEach(([serviceKey, service]) => {
    let includeService = !service.optional;
    
    // Special handling for optional services
    if (service.optional) {
      switch (serviceKey) {
        case 'facecamRecording':
        case 'voiceoverRecording':
          includeService = needsFacecam;
          break;
        case 'motionGraphics':
          includeService = needsMotionGraphics;
          break;
        case 'bRollShooting':
          includeService = additionalOptions.needsBRoll || false;
          break;
        default:
          includeService = additionalOptions[serviceKey] || false;
      }
    }
    
    if (includeService) {
      let serviceTime = service.baseTime;
      
      // Apply video type multiplier
      const typeMultiplier = typeConfig.multipliers[serviceKey as keyof typeof typeConfig.multipliers] || 1.0;
      serviceTime *= typeMultiplier;
      
      // Apply length multipliers for relevant services
      if (serviceKey.includes('Recording') || serviceKey.includes('Shooting')) {
        serviceTime *= lengthMultipliers.recordingMultiplier;
      } else if (serviceKey.includes('editing') || serviceKey.includes('animation')) {
        serviceTime *= lengthMultipliers.editingMultiplier;
      }
      
      // Apply motion graphics complexity
      if (serviceKey === 'motionGraphics' && needsMotionGraphics) {
        serviceTime *= mgComplexity.multiplier;
        
        // Add complexity indicator to service name
        const complexityLabel = mgComplexity.name.split(' ')[0]; // "Simple", "Standard", "Complex"
        services.push({
          name: `${service.name} (${complexityLabel})`,
          time: roundToHalfHour(serviceTime),
          rate: service.rate
        });
      } else {
        services.push({
          name: service.name,
          time: roundToHalfHour(serviceTime),
          rate: service.rate
        });
      }
    }
  });
  
  return services;
}
