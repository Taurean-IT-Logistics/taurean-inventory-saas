import { PlaceResult } from "@/types/PlaceResult";

export class PlaceService {
  static async getPlaceDetails(
    placesService: google.maps.places.PlacesService,
    placeId: string
  ): Promise<{ lat: number; lng: number; address: string } | null> {
    return new Promise((resolve) => {
      placesService.getDetails(
        {
          placeId,
          fields: ["formatted_address", "geometry", "name"],
        },
        (place, status) => {
          console.log("Places API Response:", {
            status,
            place,
            placeType: typeof place,
            placeId,
            hasGeometry: place?.geometry ? true : false,
            hasLocation: place?.geometry?.location ? true : false,
          });

          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            place &&
            place.geometry &&
            place.geometry.location
          ) {
            const location = place.geometry.location;
            const lat =
              typeof location.lat === "function"
                ? location.lat()
                : Number(location.lat);
            const lng =
              typeof location.lng === "function"
                ? location.lng()
                : Number(location.lng);

            console.log("Successfully extracted coordinates from Places API:", {
              lat,
              lng,
            });
            console.log(place);
            resolve({
              lat,
              lng,
              address: place.formatted_address || "",
            });
          } else {
            console.warn("Places API failed:", {
              status: status,
              statusText: status,
              hasPlace: !!place,
              hasGeometry: place?.geometry ? true : false,
              hasLocation: place?.geometry?.location ? true : false,
            });
            resolve(null);
          }
        }
      );
    });
  }

  static async geocodeAddress(
    address: string
  ): Promise<{ lat: number; lng: number; address: string } | null> {
    return new Promise((resolve) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        console.log("Geocoding response:", {
          status,
          resultsCount: results?.length,
        });

        if (status === "OK" && results && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          console.log("Successfully extracted coordinates from Geocoding:", {
            lat,
            lng,
          });
          resolve({
            lat,
            lng,
            address: results[0].formatted_address,
          });
        } else {
          console.error("Geocoding failed:", {
            status,
            address,
            resultsCount: results?.length,
          });
          resolve(null);
        }
      });
    });
  }

  static async reverseGeocode(
    lat: number,
    lng: number
  ): Promise<string | null> {
    return new Promise((resolve) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          resolve(null);
        }
      });
    });
  }
}
