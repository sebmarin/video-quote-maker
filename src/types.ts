export interface Service {
  name: string;
  baseTime: number;
  rate: number;
  optional?: boolean;
}

export interface VideoLengthMultiplier {
  name: string;
  editingMultiplier: number;
  recordingMultiplier: number;
}

export interface MotionGraphicsComplexity {
  name: string;
  multiplier: number;
}

export interface ServiceMultiplier {
  multiplier: number;
}

export interface VideoTypeConfig {
  name: string;
  description?: string;
  services: {
    scriptPlanning: ServiceMultiplier;
    screenRecording: ServiceMultiplier;
    facecamRecording: ServiceMultiplier;
    editing: ServiceMultiplier;
    motionGraphics: ServiceMultiplier;
    admin: ServiceMultiplier;
    // Marketing/Creative specific services
    locationScouting?: ServiceMultiplier;
    actorDirection?: ServiceMultiplier;
    colorGrading?: ServiceMultiplier;
    soundDesign?: ServiceMultiplier;
    // Animation specific services
    storyboarding?: ServiceMultiplier;
    illustration?: ServiceMultiplier;
    characterDesign?: ServiceMultiplier;
  };
  // What services are typically needed for this video type
  typicalServices: string[];
  // What services are rarely needed
  optionalServices: string[];
}

export interface QuantityDiscount {
  minVideos: number;
  maxVideos: number;
  discount: number;
  name: string;
}

export interface Brand {
  name: string;
  email: string;
  website: string;
  logo: string;
  phone?: string;
  location?: string;
  tagline?: string;
}

export interface QuoteData {
  clientName: string;
  projectName: string;
  numVideos: number;
  hoursPerVideo: number;
  extraNotes: string;
  discountTier?: string;
  videoType: string;
  videoLength: string;
  needsFacecam: boolean;
  needsMotionGraphics: boolean;
  motionGraphicsComplexity: string;
  showRateCalculation: boolean;
  // Additional services based on video type
  needsLocationScouting?: boolean;
  needsActorDirection?: boolean;
  needsColorGrading?: boolean;
  needsSoundDesign?: boolean;
  needsStoryboarding?: boolean;
  needsIllustration?: boolean;
  needsCharacterDesign?: boolean;
}
