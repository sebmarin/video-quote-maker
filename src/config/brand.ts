import { Brand } from '../types';
import path from 'path';

export const BRAND: Brand = {
  name: "Your Name",
  email: "your.email@example.com",
  website: "www.yourwebsite.com",
  logo: path.resolve(__dirname, "../../logo.png"),
  phone: "+1 (555) 123-4567",
  location: "Your City, Country",
  tagline: "Your professional tagline • Your specialties • Your unique value proposition"
};
