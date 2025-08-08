import { HOURLY_RATE } from './config';

// Service definitions
export interface Service {
  name: string;
  baseTime: number;
  rate: number;
  optional?: boolean;
}

// Service type for video type configurations
export interface VideoTypeService {
  name: string;
  baseTime: number;
  rate: number;
  optional?: boolean;
}

// Different service structures for different video types
export const VIDEO_TYPES = {
  technical: {
    name: "Technical Tutorial / Product Demo",
    description: "Screen recordings, software tutorials, product demonstrations",
    services: {
      scriptPlanning: { name: "Script + Planning", baseTime: 1.5, rate: HOURLY_RATE } as VideoTypeService,
      screenRecording: { name: "Screen Recording + Voiceover", baseTime: 1, rate: HOURLY_RATE } as VideoTypeService,
      facecamRecording: { name: "Camera Equipment + Recording Time", baseTime: 0.5, rate: HOURLY_RATE, optional: true } as VideoTypeService,
      editing: { name: "Editing + Assembly", baseTime: 3, rate: HOURLY_RATE } as VideoTypeService,
      motionGraphics: { name: "Motion Graphics", baseTime: 1, rate: HOURLY_RATE, optional: true } as VideoTypeService,
      admin: { name: "Admin / Export / Feedback", baseTime: 0.5, rate: HOURLY_RATE } as VideoTypeService
    },
    multipliers: {
      scriptPlanning: 1.0,
      screenRecording: 1.0,
      facecamRecording: 1.0,
      editing: 1.0,
      motionGraphics: 0.8, // Less motion graphics typically
      admin: 1.0
    }
  },
  
  creative: {
    name: "Creative / Marketing Video",
    description: "Brand videos, commercials, social media content, promotional materials",
    services: {
      scriptPlanning: { name: "Creative Brief + Storyboarding", baseTime: 2, rate: HOURLY_RATE } as VideoTypeService,
      videoShooting: { name: "Video Production + B-Roll", baseTime: 4, rate: HOURLY_RATE } as VideoTypeService,
      facecamRecording: { name: "Talent Coordination + Recording", baseTime: 1, rate: HOURLY_RATE, optional: true } as VideoTypeService,
      editing: { name: "Creative Editing + Color Grading", baseTime: 4, rate: HOURLY_RATE } as VideoTypeService,
      motionGraphics: { name: "Graphics + Branding Elements", baseTime: 1.5, rate: HOURLY_RATE, optional: true } as VideoTypeService,
      admin: { name: "Client Revisions + Final Delivery", baseTime: 1, rate: HOURLY_RATE } as VideoTypeService
    },
    multipliers: {
      scriptPlanning: 1.5, // More planning for creative direction
      videoShooting: 1.0,
      facecamRecording: 1.2, // More setup for lighting/aesthetics
      editing: 1.4, // More creative editing
      motionGraphics: 1.5, // More graphics work
      admin: 1.2 // More revisions typically
    }
  },
  
  animation: {
    name: "Animation Heavy / Motion Graphics",
    description: "Explainer videos, animated content, heavy motion graphics work",
    services: {
      scriptPlanning: { name: "Script + Storyboard + Style Frames", baseTime: 3, rate: HOURLY_RATE } as VideoTypeService,
      assetCreation: { name: "Asset Design + Illustration", baseTime: 2, rate: HOURLY_RATE } as VideoTypeService,
      voiceoverRecording: { name: "Voiceover Recording + Direction", baseTime: 1, rate: HOURLY_RATE, optional: true } as VideoTypeService,
      animation: { name: "Animation + Motion Design", baseTime: 6, rate: HOURLY_RATE } as VideoTypeService,
      motionGraphics: { name: "Advanced Motion Graphics", baseTime: 3, rate: HOURLY_RATE } as VideoTypeService,
      admin: { name: "Revisions + Final Rendering", baseTime: 1.5, rate: HOURLY_RATE } as VideoTypeService
    },
    multipliers: {
      scriptPlanning: 1.8, // Heavy storyboarding
      assetCreation: 1.0,
      voiceoverRecording: 1.0,
      animation: 1.0, // Base animation time is already high
      motionGraphics: 3.0, // Heavy animation work
      admin: 1.5 // More iterations
    }
  },
  
  documentary: {
    name: "Documentary / Interview Style",
    description: "Interviews, testimonials, documentary-style content",
    services: {
      scriptPlanning: { name: "Interview Prep + Question Development", baseTime: 2, rate: HOURLY_RATE } as VideoTypeService,
      locationShooting: { name: "Multi-Camera Interview Setup", baseTime: 3, rate: HOURLY_RATE } as VideoTypeService,
      bRollShooting: { name: "B-Roll + Supplementary Footage", baseTime: 2, rate: HOURLY_RATE, optional: true } as VideoTypeService,
      editing: { name: "Multi-Cam Editing + Story Assembly", baseTime: 5, rate: HOURLY_RATE } as VideoTypeService,
      motionGraphics: { name: "Lower Thirds + Graphics", baseTime: 1, rate: HOURLY_RATE, optional: true } as VideoTypeService,
      admin: { name: "Review + Final Export", baseTime: 1, rate: HOURLY_RATE } as VideoTypeService
    },
    multipliers: {
      scriptPlanning: 1.2,
      locationShooting: 1.0,
      bRollShooting: 1.0,
      editing: 1.3, // More footage to review
      motionGraphics: 1.0,
      admin: 1.1
    }
  }
};

export type VideoTypeKey = keyof typeof VIDEO_TYPES;
