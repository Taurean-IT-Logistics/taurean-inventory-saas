export interface PlaceResult {
  formatted_address: string;
  place_id?: string;
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
  name: string;
}
