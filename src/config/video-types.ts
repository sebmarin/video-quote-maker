import { VideoTypeConfig } from '../types';

export const VIDEO_TYPES: Record<string, VideoTypeConfig> = {
  technical: {
    name: "Technical Tutorial / Product Demo",
    description: "Screen recordings, software tutorials, product demonstrations",
    services: {
      scriptPlanning: { multiplier: 1.0 },
      screenRecording: { multiplier: 1.0 }, // Primary focus
      facecamRecording: { multiplier: 1.0 },
      editing: { multiplier: 1.0 },
      motionGraphics: { multiplier: 0.8 }, // Less motion graphics typically
      admin: { multiplier: 1.0 },
      // Rarely needed for technical videos
      locationScouting: { multiplier: 0.1 },
      actorDirection: { multiplier: 0.2 },
      colorGrading: { multiplier: 0.3 },
      soundDesign: { multiplier: 0.5 },
      storyboarding: { multiplier: 0.2 },
      illustration: { multiplier: 0.3 },
      characterDesign: { multiplier: 0.1 }
    },
    typicalServices: ["scriptPlanning", "screenRecording", "editing", "admin"],
    optionalServices: ["facecamRecording", "motionGraphics", "soundDesign"]
  },
  
  creative: {
    name: "Creative / Marketing Video",
    description: "Brand videos, commercials, promotional content, testimonials",
    services: {
      scriptPlanning: { multiplier: 1.5 }, // More planning for creative direction
      screenRecording: { multiplier: 0.3 }, // Much less screen recording
      facecamRecording: { multiplier: 1.2 }, // More setup for lighting/aesthetics
      editing: { multiplier: 1.4 }, // More creative editing
      motionGraphics: { multiplier: 1.3 }, // More graphics work
      admin: { multiplier: 1.2 }, // More revisions typically
      // Marketing specific services
      locationScouting: { multiplier: 1.0 }, // Often needed
      actorDirection: { multiplier: 1.0 }, // Often needed
      colorGrading: { multiplier: 1.0 }, // Important for brand consistency
      soundDesign: { multiplier: 0.8 }, // Sometimes needed
      storyboarding: { multiplier: 0.7 }, // Sometimes needed
      illustration: { multiplier: 0.5 }, // Less common
      characterDesign: { multiplier: 0.2 } // Rare
    },
    typicalServices: ["scriptPlanning", "facecamRecording", "editing", "colorGrading", "admin"],
    optionalServices: ["locationScouting", "actorDirection", "motionGraphics", "soundDesign", "storyboarding"]
  },
  
  animation: {
    name: "Animation Heavy / Explainer Video",
    description: "Animated explainers, motion graphics videos, character animations",
    services: {
      scriptPlanning: { multiplier: 1.8 }, // Heavy storyboarding and planning
      screenRecording: { multiplier: 0.1 }, // Almost no screen recording
      facecamRecording: { multiplier: 0.2 }, // Minimal facecam
      editing: { multiplier: 1.0 }, // Assembly focused, less traditional editing
      motionGraphics: { multiplier: 2.5 }, // Heavy animation work
      admin: { multiplier: 1.5 }, // More iterations and feedback
      // Animation specific services
      locationScouting: { multiplier: 0.1 }, // Rare
      actorDirection: { multiplier: 0.3 }, // Voice actors sometimes
      colorGrading: { multiplier: 0.4 }, // Less traditional color grading
      soundDesign: { multiplier: 1.2 }, // Important for animations
      storyboarding: { multiplier: 1.5 }, // Essential for animation
      illustration: { multiplier: 1.8 }, // Heavy illustration work
      characterDesign: { multiplier: 1.5 } // Often needed
    },
    typicalServices: ["scriptPlanning", "storyboarding", "illustration", "motionGraphics", "soundDesign", "admin"],
    optionalServices: ["characterDesign", "actorDirection"]
  }
};
