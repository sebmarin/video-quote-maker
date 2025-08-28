import { Brand } from '../types';
import path from 'path';

// Dynamic path resolution that works from both src and dist directories
const getLogoPath = () => {
  const currentDir = __dirname;
  // If running from compiled dist directory
  if (currentDir.includes('dist')) {
    return path.resolve(process.cwd(), 'Logo-Black.png');
  }
  // If running from source directory
  return path.resolve(__dirname, "../../Logo-Black.png");
};

export const HOURLY_RATE = 60; // Define your hourly rate here

export const BRAND = {
    name: "Sebastián Marín",
    email: "contact@sebmarin.me", 
    website: "www.sebmarin.me",
    phone: "+39 347 8698888",
    location: "Rome, Italy",
    tagline: "Digital content specialist • Technical video producer • Growth business strategist",
    logo: getLogoPath(),
    footerTerms: `This quote is valid for 30 days from the date above. All prices are in EUR and exclude VAT where applicable.
Payment Terms: 50% upfront, 50% upon delivery. Includes two rounds of revisions.
Intellectual Property: The client retains full usage rights to all final delivered content. Raw footage and editable project files can be provided upon request.
Deliverables: Final videos will be delivered in 4K (UHD) MP4 format when applicable. Lower resolutions (e.g. 1080p) and alternative formats are available upon request. Music licensing is not included unless explicitly specified in the project scope.
Schedule & Cancellation: A minimum of 48 hours' notice is required for any changes to scheduled production. Cancellation after production begins may incur charges for work completed up to that point.`,
};
