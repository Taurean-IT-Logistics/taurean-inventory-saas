# Google Maps Integration Setup

This project now includes Google Maps integration for facility address display and picking. Follow these steps to set it up:

## 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:

   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**
   - **Maps Embed API** (optional)

4. Go to "Credentials" and create an API key
5. **Enable Billing**: Go to "Billing" and link a payment method (required for Maps API)
6. Restrict the API key to your domain for security

## 2. Environment Configuration

Add your Google Maps API key to your environment file:

```bash
# Create .env.local file in the frontend directory
echo "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here" > frontend/.env.local
```

## 3. Map Styling & Configuration

### Map ID Configuration

This project uses `mapId: "facility-map"` for Advanced Markers support. When using a mapId:

- **Custom styles must be configured in Google Cloud Console**
- **Cannot set styles in JavaScript code**
- **Go to Maps Platform > Map Management > Map Styles**
- **Create a new map style or use default**

### Billing Requirements

⚠️ **Important**: Google Maps API requires billing to be enabled:

- **Free tier**: $200/month credit (covers most small applications)
- **Maps JavaScript API**: $7 per 1,000 loads
- **Places API**: $17 per 1,000 requests
- **Geocoding API**: $5 per 1,000 requests

## 4. Features Implemented

### 🗺️ Interactive Maps

- **Facility Detail Page**: Shows interactive map with facility location
- **Facility Cards**: Small map preview on facility cards
- **Address Picker**: Interactive map for selecting addresses during facility creation/editing

### 📍 Address Management

- **Search & Autocomplete**: Search for addresses with Google Places autocomplete
- **Click to Set**: Click on map to set location
- **Drag & Drop**: Drag marker to adjust location
- **Reverse Geocoding**: Automatically get address from coordinates

### 🎯 User Experience

- **Loading States**: Proper loading indicators while maps load
- **Error Handling**: Graceful fallbacks when maps fail to load
- **Responsive Design**: Maps work on all screen sizes
- **Get Directions**: One-click directions to facility

## 4. Components Added

- `GoogleMapsWrapper`: Handles Google Maps API loading and error states
- `FacilityMap`: Displays facility location with interactive features
- `AddressPicker`: Complete address selection with map integration

## 5. Usage Examples

### Display Facility Map

```tsx
import { GoogleMapsWrapper } from "../maps/GoogleMapsWrapper";
import { FacilityMap } from "../maps/FacilityMap";

<GoogleMapsWrapper apiKey={GOOGLE_MAPS_CONFIG.apiKey}>
  <FacilityMap
    latitude={facility.location.coordinates.latitude}
    longitude={facility.location.coordinates.longitude}
    address={facility.location.address}
    facilityName={facility.name}
  />
</GoogleMapsWrapper>;
```

### Address Picker

```tsx
import { AddressPicker } from "../maps/AddressPicker";

<AddressPicker
  value={address}
  coordinates={coordinates}
  onChange={(address, coordinates) => {
    // Handle address and coordinates update
  }}
  label="Facility Address"
  placeholder="Search for address..."
/>;
```

## 6. Security Notes

- Always restrict your API key to specific domains
- Monitor API usage in Google Cloud Console
- Consider implementing rate limiting for production use

## 7. Troubleshooting

### Maps Not Loading

- Check if API key is correctly set in environment variables
- Verify all required APIs are enabled
- **Enable billing** in Google Cloud Console (required for Maps API)
- Check browser console for error messages

### Address Search Not Working

- Ensure Places API is enabled
- Check if API key has Places API permissions
- Verify country restrictions if any

### Coordinates Not Saving

- Check if Geocoding API is enabled
- Verify form data handling in parent components

### BillingNotEnabledMapError

- **Enable billing** in Google Cloud Console
- Go to "Billing" section and link a payment method
- Wait a few minutes for billing to activate
- Refresh the page after enabling billing

## 8. Cost Considerations

Google Maps API has usage-based pricing:

- Maps JavaScript API: $7 per 1,000 loads
- Places API: $17 per 1,000 requests
- Geocoding API: $5 per 1,000 requests

Monitor usage in Google Cloud Console and set up billing alerts.
