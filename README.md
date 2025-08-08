# Video Quote Generator

A professional CLI tool for generating detailed PDF quotes for video production services. Features dynamic pricing based on video complexity, batch discounts, and professional invoice-style formatting.

## Features

- 🎬 **Complex Video Pricing**: Automatic calculations based on video length, motion graphics complexity, and facecam requirements
- 📊 **Professional PDFs**: Clean, Apple/GitHub-inspired design with detailed service breakdowns
- 💰 **Batch Discounts**: Automatic volume pricing for 3+ videos (5%, 10%, 15% tiers)
- ⏰ **Half-Hour Billing**: Consistent half-hour increments for professional billing
- 📈 **Project Scope**: Includes delivery estimates based on 40-hour work weeks
- 🎛️ **Flexible Display**: Option to show/hide detailed hourly breakdowns for client presentation

## Quick Start

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone this repository
```bash
git clone https://github.com/yourusername/video-quote-maker.git
cd video-quote-maker
```

2. Install dependencies
```bash
npm install
```

3. **Customize your settings** (see Configuration section below)

4. Build the project
```bash
npm run build
```

5. Generate your first quote
```bash
npm run dev
```

## Configuration

### 1. Personal Branding

Edit the `BRAND` object in `cli-quote.ts`:

```typescript
const BRAND = {
  name: "Your Name",
  email: "your.email@example.com", 
  website: "www.yourwebsite.com",
  logo: path.resolve(__dirname, "../logo.png")
};
```

### 2. Pricing & Services

Update your hourly rate:
```typescript
const HOURLY_RATE = 50; // Your rate in EUR
```

Customize service base times:
```typescript
const SERVICES = {
  scriptPlanning: { name: "Script + Planning", baseTime: 1.5, rate: HOURLY_RATE },
  screenRecording: { name: "Screen Recording + Voiceover", baseTime: 1, rate: HOURLY_RATE },
  // ... adjust times based on your workflow
};
```

### 3. Video Length Multipliers

Adjust complexity multipliers based on your editing speed:
```typescript
const VIDEO_LENGTH_MULTIPLIERS = {
  short: { editingMultiplier: 0.8, recordingMultiplier: 0.8 },
  standard: { editingMultiplier: 1.0, recordingMultiplier: 1.0 },
  // ... customize based on your workflow
};
```

### 4. Motion Graphics Complexity

Set motion graphics time multipliers:
```typescript
const MOTION_GRAPHICS_COMPLEXITY = {
  simple: { multiplier: 1.0 },
  standard: { multiplier: 1.5 },
  complex: { multiplier: 2.5 }
};
```

### 5. Batch Discounts

Configure your volume pricing:
```typescript
const QUANTITY_DISCOUNTS = {
  small: { minVideos: 3, maxVideos: 5, discount: 0.05 },  // 5% off
  medium: { minVideos: 6, maxVideos: 10, discount: 0.10 }, // 10% off
  large: { minVideos: 11, maxVideos: Infinity, discount: 0.15 } // 15% off
};
```

### 6. Contact Information

Update the PDF contact section:
```typescript
.text('+1 (555) 123-4567', rightColumnX, headerY - 20 + logoSize + 41) // Your phone
.text('Your City, Country', rightColumnX, headerY - 20 + logoSize + 54) // Your location
```

### 7. Professional Tagline

Customize your tagline:
```typescript
.text('Your professional tagline • Your specialties • Your unique value proposition', ...)
```

## Usage

### Interactive Mode
```bash
npm run dev
```

Follow the prompts to:
1. Enter client and project details
2. Specify number of videos
3. Choose video length (Short/Standard/Long/Extended)
4. Select facecam requirements
5. Choose motion graphics complexity
6. Decide on hourly breakdown visibility
7. Apply batch discounts (if eligible)
8. Add notes

### Test Scripts

Generate sample quotes for testing:

```bash
# Standard quote with detailed breakdown
node test-quote.js

# Batch discount quote (5 videos, no rate display)
node test-package.js

# Single video quote (tests "Service Breakdown" header)
node test-single.js
```

## Project Structure

```
video-quote-maker/
├── src/
│   └── cli-quote.ts          # Main application
├── dist/                     # Compiled JavaScript
├── quotes/                   # Generated PDF quotes
├── test-quote.js             # Test script - standard quote
├── test-package.js           # Test script - batch discount
├── test-single.js            # Test script - single video
├── logo.png                  # Your logo (add this file)
└── package.json
```

## Quote Features

### Service Breakdown
- **Script + Planning**: Initial consultation and planning
- **Screen Recording + Voiceover**: Recording time with length-based multipliers  
- **Camera Equipment + Recording**: Optional facecam setup and recording
- **Editing + Assembly**: Post-production with complexity-based time calculations
- **Motion Graphics**: Optional graphics work with complexity multipliers
- **Admin / Export / Feedback**: Project management and delivery

### Dynamic Calculations
- Video length affects editing and recording time
- Motion graphics complexity multiplies graphics work time
- Facecam adds equipment setup time
- All times rounded to professional half-hour increments

### Project Scope
- Total hours calculation
- Delivery estimates based on 40-hour work weeks
- Clear project timeline communication

### Professional Presentation
- Clean, minimal design inspired by Apple/GitHub
- Option to hide/show detailed hourly breakdowns
- Receipt-style financial alignment
- Professional footer with terms

## Development

### Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run the quote generator
- `npm run clean` - Clean the dist folder

### Adding Logo

1. Add your logo as `logo.png` in the project root
2. Recommended size: 80x80px or larger (will be auto-resized)
3. Supports PNG format for best compatibility

## Customization Tips

### For Freelancers
- Adjust `HOURLY_RATE` to your market rate
- Customize service times based on your workflow speed
- Set batch discount thresholds based on your preferred project sizes

### For Agencies  
- Update branding to agency information
- Adjust multipliers for team-based workflows
- Consider higher batch discount percentages
- Customize tagline for agency positioning

### For Different Video Types
- Adjust `VIDEO_LENGTH_MULTIPLIERS` for your content type
- Modify `MOTION_GRAPHICS_COMPLEXITY` based on your style
- Update service names to match your offerings

## License

MIT License - feel free to customize for your business needs.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with the provided test scripts
5. Submit a pull request

## Support

For questions or customization help, please open an issue on GitHub.

---

**Pro Tip**: Keep your personal configuration in a separate branch (`personal-config`) to easily update the template while maintaining your custom settings.
- Clean, professional quote layout

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Development Mode
```bash
npm run dev
```

### Build and Run
```bash
npm run build
npm start
```

### Global Installation
```bash
npm install -g .
quote-gen
```

## Configuration

Edit the `BRAND` object in `cli-quote.ts` to customize your branding:

```typescript
const BRAND = {
  name: "Your Name",
  email: "your@email.com", 
  website: "www.yourwebsite.com",
  logo: "", // Path to logo image or leave blank
};
```

Also update the `HOURLY_RATE` constant to match your pricing.

## Output

Generated quotes are saved to the `quotes/` directory with the format:
`quote-{client-name}-{date}.pdf`

## Requirements

- Node.js 18+
- TypeScript
