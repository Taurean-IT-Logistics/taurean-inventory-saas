// Google Maps configuration
// Add your Google Maps API key to your .env.local file:
// NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here

interface GoogleMapsConfig {
  apiKey: string;
}

const GOOGLE_MAPS_CONFIG: GoogleMapsConfig = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
};

export default GOOGLE_MAPS_CONFIG;
