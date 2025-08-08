import path from 'path';

// Personal branding
export const BRAND = {
  name: "Your Name",
  email: "your.email@example.com",
  website: "www.yourwebsite.com",
  logo: path.resolve(__dirname, __dirname.includes('dist') ? '../../logo.png' : '../logo.png'), // PNG format for PDFKit compatibility
};

// Constants
export const HOURLY_RATE = 50; // € - Update this with your hourly rate
export const QUOTES_DIR = path.resolve(__dirname, __dirname.includes('dist') ? '../../quotes' : '../quotes');

// Discount tiers based on quantity
export const QUANTITY_DISCOUNTS = {
  small: { minVideos: 3, maxVideos: 5, discount: 0.05, name: "Small Batch Discount (3-5 videos)" },
  medium: { minVideos: 6, maxVideos: 10, discount: 0.10, name: "Medium Batch Discount (6-10 videos)" },
  large: { minVideos: 11, maxVideos: Infinity, discount: 0.15, name: "Large Batch Discount (11+ videos)" }
};

// Video length multipliers (applies to all video types)
export const VIDEO_LENGTH_MULTIPLIERS = {
  short: { name: "Short (30s-2min)", editingMultiplier: 0.8, recordingMultiplier: 0.8 },
  standard: { name: "Standard (2-5min)", editingMultiplier: 1.0, recordingMultiplier: 1.0 },
  long: { name: "Long (5-10min)", editingMultiplier: 1.4, recordingMultiplier: 1.2 },
  extended: { name: "Extended (10min+)", editingMultiplier: 1.8, recordingMultiplier: 1.5 }
};

// Motion graphics complexity multipliers
export const MOTION_GRAPHICS_COMPLEXITY = {
  simple: { name: "Simple (text animations, basic transitions)", multiplier: 1.0 },
  standard: { name: "Standard (icons, charts, moderate animations)", multiplier: 1.5 },
  complex: { name: "Complex (custom animations, 3D elements)", multiplier: 2.5 }
};
