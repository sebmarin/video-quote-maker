import { Service, VideoLengthMultiplier, MotionGraphicsComplexity, QuantityDiscount } from '../types';

export const HOURLY_RATE = 46; // € - Update this with your hourly rate

export const SERVICES: Record<string, Service> = {
  scriptPlanning: { name: "Script + Planning", baseTime: 1.5, rate: HOURLY_RATE },
  screenRecording: { name: "Screen Recording + Voiceover", baseTime: 0.5, rate: HOURLY_RATE },
  facecamRecording: { name: "Camera Equipment + Recording Time", baseTime: 1, rate: HOURLY_RATE, optional: true },
  editing: { name: "Editing + Assembly", baseTime: 2, rate: HOURLY_RATE },
  motionGraphics: { name: "Motion Graphics", baseTime: 2, rate: HOURLY_RATE, optional: true },
  admin: { name: "Post-Production + Delivery", baseTime: 0.5, rate: HOURLY_RATE },
  
  // Marketing/Creative specific services
  locationScouting: { name: "Location Scouting + Setup", baseTime: 2, rate: HOURLY_RATE, optional: true },
  actorDirection: { name: "Talent Direction + Coordination", baseTime: 1.5, rate: HOURLY_RATE, optional: true },
  colorGrading: { name: "Color Grading + Color Correction", baseTime: 2, rate: HOURLY_RATE, optional: true },
  soundDesign: { name: "Sound Design + Audio Enhancement", baseTime: 1.5, rate: HOURLY_RATE, optional: true },
  
  // Animation specific services
  storyboarding: { name: "Storyboarding + Visual Planning", baseTime: 3, rate: HOURLY_RATE, optional: true },
  illustration: { name: "Illustration + Asset Creation", baseTime: 4, rate: HOURLY_RATE, optional: true },
  characterDesign: { name: "Character Design + Development", baseTime: 5, rate: HOURLY_RATE, optional: true }
};

export const VIDEO_LENGTH_MULTIPLIERS: Record<string, VideoLengthMultiplier> = {
  short: { name: "Short (30s-2min)", editingMultiplier: 0.5, recordingMultiplier: 1.0 },
  standard: { name: "Standard (2-5min)", editingMultiplier: 2.0, recordingMultiplier: 1.0 },
  long: { name: "Long (5-10min)", editingMultiplier: 5.0, recordingMultiplier: 1.5 },
  extended: { name: "Extended (10min+)", editingMultiplier: 10.0, recordingMultiplier: 2.0 }
};

export const MOTION_GRAPHICS_COMPLEXITY: Record<string, MotionGraphicsComplexity> = {
  simple: { name: "Simple (text animations, basic transitions)", multiplier: 1.0 },
  standard: { name: "Standard (icons, charts, moderate animations)", multiplier: 3.0 },
  complex: { name: "Complex (custom animations, 3D elements)", multiplier: 15.0 }
};

export const QUANTITY_DISCOUNTS: Record<string, QuantityDiscount> = {
  small: { minVideos: 3, maxVideos: 5, discount: 0.10, name: "Small Batch Discount (3-5 videos)" },
  medium: { minVideos: 6, maxVideos: 10, discount: 0.20, name: "Medium Batch Discount (6-10 videos)" },
  large: { minVideos: 11, maxVideos: Infinity, discount: 0.25, name: "Large Batch Discount (11+ videos)" }
};
