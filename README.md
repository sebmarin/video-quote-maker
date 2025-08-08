# Video Quote Maker

A CLI tool for generating professional PDF quotes for video production projects.

## Features

- Interactive command-line interface
- Professional PDF generation with branding
- Customizable hourly rates
- Automatic file naming with date stamps
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
