"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { GoogleMapsWrapper } from "./GoogleMapsWrapper";
import { AddressInput } from "./AddressInput";
import { SuggestionDropdown } from "./SuggestionDropdown";
import { PlaceResult } from "@/types/PlaceResult";
import { MapComponent } from "./MapComponent";
import { CoordinateInput } from "./CoordinateInput";
import { useGoogleMapsServices } from "@/hooks/useGoogleMapsServices";
import { useUserLocation } from "@/hooks/useUserLocation";
import { PlaceService } from "@/services/PlaceService";
import GOOGLE_MAPS_CONFIG from "@/lib/mapsConfig";

interface AddressPickerProps {
  value?: string;
  coordinates?: { latitude: number; longitude: number };
  onChange: (
    address: string,
    coordinates?: { latitude: number; longitude: number }
  ) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  mapControls?: {
    mapTypeControl?: boolean;
    streetViewControl?: boolean;
    fullscreenControl?: boolean;
    zoomControl?: boolean;
    rotateControl?: boolean;
    scaleControl?: boolean;
    locationControl?: boolean;
  };
}

export const AddressPicker: React.FC<AddressPickerProps> = ({
  value = "",
  coordinates,
  onChange,
  placeholder = "Search for an address...",
  label = "Address",
  className = "",
  mapControls = {
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true,
    zoomControl: true,
    rotateControl: false,
    scaleControl: false,
    locationControl: true,
  },
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [marker, setMarker] =
    useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [manualLat, setManualLat] = useState(
    coordinates?.latitude?.toString() || ""
  );
  const [manualLng, setManualLng] = useState(
    coordinates?.longitude?.toString() || ""
  );

  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use custom hooks
  const { userLocation, isGettingLocation, getUserLocation } =
    useUserLocation();
  const { autocompleteService, placesService, map, isLoaded } =
    useGoogleMapsServices(mapRef, coordinates, userLocation, isGettingLocation);

  // Get user location on component mount
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  // Function to update map and marker with coordinates
  const updateMapWithCoordinates = useCallback(
    (lat: number, lng: number, address: string) => {
      // Update manual coordinate inputs
      setManualLat(lat.toString());
      setManualLng(lng.toString());

      // Update map and marker
      if (map) {
        map.setCenter({ lat, lng });
        map.setZoom(15);
      }

      if (marker) {
        marker.position = new window.google.maps.LatLng(lat, lng);
      } else if (map) {
        const markerElement = document.createElement("div");
        markerElement.innerHTML = `
          <div style="
            background-color: #4285f4;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            cursor: pointer;
          "></div>
        `;

        const newMarker = new window.google.maps.marker.AdvancedMarkerElement({
          position: new window.google.maps.LatLng(lat, lng),
          map: map,
          content: markerElement,
          title: "Facility Location",
          gmpDraggable: true,
        });

        // Add drag end listener
        newMarker.addListener("dragend", async () => {
          const position = newMarker.position;
          if (position) {
            const newLat =
              typeof position.lat === "function"
                ? position.lat()
                : position.lat;
            const newLng =
              typeof position.lng === "function"
                ? position.lng()
                : position.lng;

            // Update manual coordinate inputs
            setManualLat(newLat.toString());
            setManualLng(newLng.toString());

            // Reverse geocode to get address
            const address = await PlaceService.reverseGeocode(newLat, newLng);
            if (address) {
              setInputValue(address);
              onChange(address, { latitude: newLat, longitude: newLng });
            }
          }
        });

        setMarker(newMarker);
      }

      onChange(address, { latitude: lat, longitude: lng });
    },
    [map, marker, onChange]
  );

  // Handle manual address input
  const handleManualAddressInput = useCallback(
    async (address: string) => {
      if (!address.trim()) return;

      if (
        !window.google ||
        !window.google.maps ||
        !window.google.maps.Geocoder
      ) {
        console.error("Google Maps Geocoder not available");
        onChange(address, undefined);
        return;
      }

      setShowSuggestions(false);

      const result = await PlaceService.geocodeAddress(address);
      if (result) {
        updateMapWithCoordinates(result.lat, result.lng, result.address);
      } else {
        onChange(address, undefined);
      }
    },
    [onChange, updateMapWithCoordinates]
  );

  // Handle input change and search suggestions
  const handleInputChange = useCallback(
    (query: string) => {
      setInputValue(query);

      if (query.length > 2 && autocompleteService) {
        setIsLoading(true);
        try {
          autocompleteService.getPlacePredictions(
            {
              input: query,
              componentRestrictions: { country: "gh" }, // Restrict to Ghana
            },
            (predictions, status) => {
              setIsLoading(false);
              if (
                status === window.google.maps.places.PlacesServiceStatus.OK &&
                predictions
              ) {
                console.log("🔍 Predictions received:", predictions);
                const mappedSuggestions = predictions.map((prediction) => ({
                  formatted_address: prediction.description,
                  place_id: prediction.place_id,
                  geometry: {
                    location: {
                      lat: () => 0,
                      lng: () => 0,
                    },
                  },
                  name: prediction.structured_formatting.main_text,
                }));
                console.log("🔍 Mapped suggestions:", mappedSuggestions);
                setSuggestions(mappedSuggestions);
                setShowSuggestions(true);
              } else {
                setSuggestions([]);
                setShowSuggestions(false);
              }
            }
          );
        } catch (error) {
          console.error("Error getting place predictions:", error);
          setIsLoading(false);
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    },
    [autocompleteService]
  );

  // Handle Enter key press for manual input
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        handleManualAddressInput(inputValue);
      }
    },
    [inputValue, handleManualAddressInput]
  );

  // Handle suggestion selection
  const handleSuggestionClick = useCallback(
    async (suggestion: PlaceResult, event?: React.MouseEvent) => {
      console.log("🔥🔥🔥 handleSuggestionClick STARTED");
      console.log("🔥 handleSuggestionClick called with:", {
        suggestion,
        hasPlaceId: !!suggestion.place_id,
        placeId: suggestion.place_id,
        description: suggestion.formatted_address,
        hasPlacesService: !!placesService,
      });

      // Prevent form submission
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      setInputValue(suggestion.formatted_address);
      setShowSuggestions(false);

      // Try to get place details first if we have a place_id
      console.log("🔍 Checking Places service availability:", {
        hasPlacesService: !!placesService,
        placesServiceType: typeof placesService,
        hasPlaceId: !!suggestion.place_id,
        placeId: suggestion.place_id,
      });

      if (placesService && suggestion.place_id) {
        console.log(
          "✅ Places service available, attempting to get place details for:",
          {
            placeId: suggestion.place_id,
            description: suggestion.formatted_address,
          }
        );

        const result = await PlaceService.getPlaceDetails(
          placesService,
          suggestion.place_id
        );
        if (result) {
          updateMapWithCoordinates(result.lat, result.lng, result.address);
        } else {
          // Fallback: try geocoding the address
          const geocodeResult = await PlaceService.geocodeAddress(
            suggestion.formatted_address
          );
          if (geocodeResult) {
            updateMapWithCoordinates(
              geocodeResult.lat,
              geocodeResult.lng,
              geocodeResult.address
            );
          } else {
            console.error("Both Places API and Geocoding failed");
            onChange(suggestion.formatted_address, undefined);
          }
        }
      } else {
        // No place_id available, use geocoding directly
        console.log(
          "❌ Places service not available or no place_id, using geocoding directly for:",
          {
            hasPlacesService: !!placesService,
            hasPlaceId: !!suggestion.place_id,
            placeId: suggestion.place_id,
            description: suggestion.formatted_address,
          }
        );

        const result = await PlaceService.geocodeAddress(
          suggestion.formatted_address
        );
        if (result) {
          updateMapWithCoordinates(result.lat, result.lng, result.address);
        } else {
          console.error("Direct geocoding failed");
          onChange(suggestion.formatted_address, undefined);
        }
      }
    },
    [placesService, updateMapWithCoordinates, onChange]
  );

  // Handle map click
  const handleMapClick = useCallback(
    async (event: google.maps.MapMouseEvent) => {
      event.stop?.();

      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        // Reverse geocode to get address
        const address = await PlaceService.reverseGeocode(lat, lng);
        if (address) {
          setInputValue(address);
          onChange(address, { latitude: lat, longitude: lng });

          // Update manual coordinate inputs
          setManualLat(lat.toString());
          setManualLng(lng.toString());

          // Update marker position
          if (marker) {
            marker.position = new window.google.maps.LatLng(lat, lng);
          } else if (map) {
            const markerElement = document.createElement("div");
            markerElement.innerHTML = `
              <div style="
                background-color: #4285f4;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                cursor: pointer;
              "></div>
            `;

            const newMarker =
              new window.google.maps.marker.AdvancedMarkerElement({
                position: new window.google.maps.LatLng(lat, lng),
                map: map,
                content: markerElement,
                title: "Facility Location",
                gmpDraggable: true,
              });

            // Add drag end listener
            newMarker.addListener("dragend", async () => {
              const position = newMarker.position;
              if (position) {
                const newLat =
                  typeof position.lat === "function"
                    ? position.lat()
                    : position.lat;
                const newLng =
                  typeof position.lng === "function"
                    ? position.lng()
                    : position.lng;

                // Update manual coordinate inputs
                setManualLat(newLat.toString());
                setManualLng(newLng.toString());

                // Reverse geocode to get address
                const address = await PlaceService.reverseGeocode(
                  newLat,
                  newLng
                );
                if (address) {
                  setInputValue(address);
                  onChange(address, { latitude: newLat, longitude: newLng });
                }
              }
            });

            setMarker(newMarker);
          }
        }
      }
    },
    [map, marker, onChange]
  );

  // Handle marker drag
  const handleMarkerDrag = useCallback(
    async (lat: number, lng: number) => {
      // Update manual coordinate inputs
      setManualLat(lat.toString());
      setManualLng(lng.toString());

      // Reverse geocode to get address
      const address = await PlaceService.reverseGeocode(lat, lng);
      if (address) {
        setInputValue(address);
        onChange(address, { latitude: lat, longitude: lng });
      }
    },
    [onChange]
  );

  // Handle manual coordinate input
  const handleManualCoordinates = useCallback(
    async (lat: string, lng: string) => {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      if (isNaN(latitude) || isNaN(longitude)) return;

      if (!window.google || !window.google.maps) {
        console.error("Google Maps API not available");
        onChange(inputValue || "", { latitude, longitude });
        return;
      }

      // Update map and marker
      if (map) {
        map.setCenter({ lat: latitude, lng: longitude });
        map.setZoom(15);
      }

      if (marker) {
        marker.position = new window.google.maps.LatLng(latitude, longitude);
      } else if (map) {
        const markerElement = document.createElement("div");
        markerElement.innerHTML = `
          <div style="
            background-color: #4285f4;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            cursor: pointer;
          "></div>
        `;

        const newMarker = new window.google.maps.marker.AdvancedMarkerElement({
          position: new window.google.maps.LatLng(latitude, longitude),
          map: map,
          content: markerElement,
          title: "Facility Location",
          gmpDraggable: true,
        });

        // Add drag end listener
        newMarker.addListener("dragend", async () => {
          const position = newMarker.position;
          if (position) {
            const newLat =
              typeof position.lat === "function"
                ? position.lat()
                : position.lat;
            const newLng =
              typeof position.lng === "function"
                ? position.lng()
                : position.lng;

            // Update manual coordinate inputs
            setManualLat(newLat.toString());
            setManualLng(newLng.toString());

            // Reverse geocode to get address
            const address = await PlaceService.reverseGeocode(newLat, newLng);
            if (address) {
              setInputValue(address);
              onChange(address, { latitude: newLat, longitude: newLng });
            }
          }
        });

        setMarker(newMarker);
      }

      // Reverse geocode to get address
      const address = await PlaceService.reverseGeocode(latitude, longitude);
      if (address) {
        setInputValue(address);
        onChange(address, { latitude: latitude, longitude: longitude });
      } else {
        // If geocoding fails, still call onChange with coordinates
        onChange(inputValue || "", {
          latitude: latitude,
          longitude: longitude,
        });
      }
    },
    [map, marker, onChange, inputValue]
  );

  const clearAddress = () => {
    setInputValue("");
    setManualLat("");
    setManualLng("");
    onChange("", undefined);
    if (marker) {
      marker.map = null;
      setMarker(null);
    }
  };

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <GoogleMapsWrapper apiKey={GOOGLE_MAPS_CONFIG.apiKey}>
      <div className={`space-y-4 ${className}`}>
        <div className="relative">
          <AddressInput
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onClear={clearAddress}
            placeholder={placeholder}
            label={label}
          />

          <SuggestionDropdown
            suggestions={suggestions}
            showSuggestions={showSuggestions}
            inputValue={inputValue}
            onSuggestionClick={handleSuggestionClick}
            onManualAddressInput={handleManualAddressInput}
          />
        </div>

        <MapComponent
          map={map}
          marker={marker}
          coordinates={coordinates}
          userLocation={userLocation}
          isGettingLocation={isGettingLocation}
          onMapClick={handleMapClick}
          onMarkerDrag={handleMarkerDrag}
          onGetUserLocation={getUserLocation}
          mapRef={mapRef}
        />

        <CoordinateInput
          latitude={manualLat}
          longitude={manualLng}
          onLatitudeChange={setManualLat}
          onLongitudeChange={setManualLng}
          onCoordinateBlur={() => {
            if (manualLat && manualLng) {
              handleManualCoordinates(manualLat, manualLng);
            }
          }}
          coordinates={coordinates}
        />
      </div>
    </GoogleMapsWrapper>
  );
};
