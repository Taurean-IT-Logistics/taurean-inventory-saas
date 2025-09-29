import { useState, useCallback, useEffect } from "react";

export interface GoogleMapsServices {
  autocompleteService: google.maps.places.AutocompleteService | null;
  placesService: google.maps.places.PlacesService | null;
  map: google.maps.Map | null;
  isLoaded: boolean;
}

export const useGoogleMapsServices = (
  mapRef: React.RefObject<HTMLDivElement>,
  coordinates?: { latitude: number; longitude: number },
  userLocation?: { lat: number; lng: number } | null,
  isGettingLocation?: boolean
) => {
  const [autocompleteService, setAutocompleteService] =
    useState<google.maps.places.AutocompleteService | null>(null);
  const [placesService, setPlacesService] =
    useState<google.maps.places.PlacesService | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const initializeGoogleMaps = useCallback(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.log("Google Maps API not fully loaded yet");
      return false;
    }

    try {
      const autocomplete = new window.google.maps.places.AutocompleteService();
      setAutocompleteService(autocomplete);
      setIsLoaded(true);
      return true;
    } catch (error) {
      console.error("Error creating AutocompleteService:", error);
      return false;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initMaps = async () => {
      if (!isMounted) return;

      if (initializeGoogleMaps()) {
        if (mapRef.current && !map) {
          try {
            // Determine center location
            let center: { lat: number; lng: number };
            let zoom = 10;

            if (coordinates) {
              center = {
                lat: coordinates.latitude,
                lng: coordinates.longitude,
              };
              zoom = 15;
            } else if (userLocation) {
              center = userLocation;
              zoom = 15;
            } else {
              // Use default location if no coordinates or user location
              center = { lat: 5.6037, lng: -0.187 }; // Default to Accra, Ghana
              zoom = 10;
            }

            const mapInstance = new window.google.maps.Map(mapRef.current, {
              center,
              zoom,
              mapId: "address-picker-map",
              mapTypeControl: true,
              streetViewControl: true,
              fullscreenControl: true,
              zoomControl: true,
              rotateControl: false,
              scaleControl: false,
              clickableIcons: true,
              gestureHandling: "greedy",
            });

            const places = new window.google.maps.places.PlacesService(
              mapInstance
            );
            setPlacesService(places);
            setMap(mapInstance);
          } catch (error) {
            console.error("Error creating map:", error);
            return;
          }
        }
      } else {
        setTimeout(() => {
          if (isMounted) {
            initMaps();
          }
        }, 1000);
      }
    };

    initMaps();

    return () => {
      isMounted = false;
    };
  }, [
    initializeGoogleMaps,
    mapRef,
    map,
    coordinates,
    userLocation,
    isGettingLocation,
  ]);

  return {
    autocompleteService,
    placesService,
    map,
    isLoaded,
  };
};
