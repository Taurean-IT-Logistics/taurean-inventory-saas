"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Search, X } from "lucide-react";
import { GoogleMapsWrapper } from "./GoogleMapsWrapper";
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
}

interface PlaceResult {
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

interface AutocompleteSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export const AddressPicker: React.FC<AddressPickerProps> = ({
  value = "",
  coordinates,
  onChange,
  placeholder = "Search for an address...",
  label = "Address",
  className = "",
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] =
    useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [autocompleteService, setAutocompleteService] =
    useState<google.maps.places.AutocompleteService | null>(null);
  const [placesService, setPlacesService] =
    useState<google.maps.places.PlacesService | null>(null);
  const [manualLat, setManualLat] = useState(
    coordinates?.latitude?.toString() || ""
  );
  const [manualLng, setManualLng] = useState(
    coordinates?.longitude?.toString() || ""
  );
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Function to initialize Google Maps services
  const initializeGoogleMaps = useCallback(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.log("Google Maps API not fully loaded yet");
      return false;
    }

    try {
      // Note: Using legacy API until new API is fully available
      const autocomplete = new window.google.maps.places.AutocompleteService();
      setAutocompleteService(autocomplete);
      setIsGoogleMapsLoaded(true);
      return true;
    } catch (error) {
      console.error("Error creating AutocompleteService:", error);
      return false;
    }
  }, []);

  // Initialize Google Maps services
  useEffect(() => {
    const initMaps = () => {
      if (initializeGoogleMaps()) {
        // Google Maps is loaded, proceed with map initialization
        if (mapRef.current) {
          try {
            const mapInstance = new window.google.maps.Map(mapRef.current, {
              center: coordinates
                ? { lat: coordinates.latitude, lng: coordinates.longitude }
                : { lat: 5.6037, lng: -0.187 }, // Default to Accra, Ghana
              zoom: coordinates ? 15 : 10,
              mapId: "address-picker-map", // Required for AdvancedMarkerElement
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
              zoomControl: true,
            });

            const places = new window.google.maps.places.PlacesService(
              mapInstance
            );
            setPlacesService(places);
            setMap(mapInstance);

            // Add marker if coordinates exist
            if (coordinates) {
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

              const markerInstance =
                new window.google.maps.marker.AdvancedMarkerElement({
                  position: {
                    lat: coordinates.latitude,
                    lng: coordinates.longitude,
                  },
                  map: mapInstance,
                  content: markerElement,
                  title: "Facility Location",
                  gmpDraggable: true,
                });

              // Add drag end listener
              markerInstance.addListener("dragend", () => {
                const position = markerInstance.position;
                if (position) {
                  const lat =
                    typeof position.lat === "function"
                      ? position.lat()
                      : position.lat;
                  const lng =
                    typeof position.lng === "function"
                      ? position.lng()
                      : position.lng;

                  // Reverse geocode to get address
                  const geocoder = new window.google.maps.Geocoder();
                  geocoder.geocode(
                    { location: { lat, lng } },
                    (results, status) => {
                      if (status === "OK" && results && results[0]) {
                        const address = results[0].formatted_address;
                        setInputValue(address);
                        onChange(address, { latitude: lat, longitude: lng });
                      }
                    }
                  );
                }
              });

              setMarker(markerInstance);
            }
          } catch (error) {
            console.error("Error creating map:", error);
            return;
          }
        }
      } else {
        // Google Maps not loaded yet, retry after a delay
        const retryTimer = setTimeout(() => {
          initMaps();
        }, 1000);
        return () => clearTimeout(retryTimer);
      }
    };

    // Try to initialize immediately
    initMaps();

    // Also set up a retry mechanism
    const retryInterval = setInterval(() => {
      if (!isGoogleMapsLoaded) {
        initMaps();
      } else {
        clearInterval(retryInterval);
      }
    }, 1000);

    return () => {
      clearInterval(retryInterval);
    };
  }, [coordinates, onChange, initializeGoogleMaps, isGoogleMapsLoaded]);

  // Handle manual address input (when user presses Enter or clicks "Use this address")
  const handleManualAddressInput = useCallback(
    (address: string) => {
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

      // Use geocoding service to get coordinates for the manually entered address
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: address }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();

          // Update map and marker
          if (map) {
            map.setCenter({ lat, lng });
            map.setZoom(15);
          }

          if (marker) {
            marker.position = { lat, lng };
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
                position: { lat, lng },
                map: map,
                content: markerElement,
                title: "Facility Location",
                gmpDraggable: true,
              });

            // Add drag end listener
            newMarker.addListener("dragend", () => {
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

                // Reverse geocode to get address
                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode(
                  { location: { lat: newLat, lng: newLng } },
                  (results, status) => {
                    if (status === "OK" && results && results[0]) {
                      const address = results[0].formatted_address;
                      setInputValue(address);
                      onChange(address, {
                        latitude: newLat,
                        longitude: newLng,
                      });
                    }
                  }
                );
              }
            });

            setMarker(newMarker);
          }

          // Call onChange with the geocoded address and coordinates
          onChange(results[0].formatted_address, {
            latitude: lat,
            longitude: lng,
          });

          // Update manual coordinate inputs
          setManualLat(lat.toString());
          setManualLng(lng.toString());
        } else {
          // If geocoding fails, still call onChange with the manual address but no coordinates
          onChange(address, undefined);
        }
      });
    },
    [map, marker, onChange]
  );

  // Handle input change and search suggestions
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
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
                setSuggestions(
                  predictions.map((prediction) => ({
                    formatted_address: prediction.description,
                    place_id: prediction.place_id,
                    geometry: {
                      location: {
                        lat: () => 0,
                        lng: () => 0,
                      },
                    },
                    name: prediction.structured_formatting.main_text,
                  }))
                );
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
    (suggestion: PlaceResult, event?: React.MouseEvent) => {
      // Prevent form submission
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      setInputValue(suggestion.formatted_address);
      setShowSuggestions(false);

      if (placesService) {
        placesService.getDetails(
          {
            placeId: suggestion.place_id || suggestion.formatted_address,
            fields: ["formatted_address", "geometry"],
          },
          (place, status) => {
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              place
            ) {
              const location = place.geometry?.location;
              if (location) {
                const lat = location.lat();
                const lng = location.lng();

                // Update manual coordinate inputs
                setManualLat(lat.toString());
                setManualLng(lng.toString());

                // Update map and marker
                if (map) {
                  map.setCenter({ lat, lng });
                  map.setZoom(15);
                }

                if (marker) {
                  marker.position = { lat, lng };
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
                      position: { lat, lng },
                      map: map,
                      content: markerElement,
                      title: "Facility Location",
                      gmpDraggable: true,
                    });

                  // Add drag end listener
                  newMarker.addListener("dragend", () => {
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
                      const geocoder = new window.google.maps.Geocoder();
                      geocoder.geocode(
                        { location: { lat: newLat, lng: newLng } },
                        (results, status) => {
                          if (status === "OK" && results && results[0]) {
                            const address = results[0].formatted_address;
                            setInputValue(address);
                            onChange(address, {
                              latitude: newLat,
                              longitude: newLng,
                            });
                          }
                        }
                      );
                    }
                  });

                  setMarker(newMarker);
                }

                onChange(suggestion.formatted_address, {
                  latitude: lat,
                  longitude: lng,
                });
              }
            }
          }
        );
      }
    },
    [placesService, map, marker, onChange]
  );

  // Handle map click
  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      // Prevent any form submission
      event.stop?.();

      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        // Reverse geocode to get address
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            const address = results[0].formatted_address;
            setInputValue(address);
            onChange(address, { latitude: lat, longitude: lng });

            // Update manual coordinate inputs
            setManualLat(lat.toString());
            setManualLng(lng.toString());

            // Update marker position
            if (marker) {
              marker.position = { lat, lng };
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
                  position: { lat, lng },
                  map: map,
                  content: markerElement,
                  title: "Facility Location",
                  gmpDraggable: true,
                });

              // Add drag end listener
              newMarker.addListener("dragend", () => {
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

                  // Reverse geocode to get address
                  const geocoder = new window.google.maps.Geocoder();
                  geocoder.geocode(
                    { location: { lat: newLat, lng: newLng } },
                    (results, status) => {
                      if (status === "OK" && results && results[0]) {
                        const address = results[0].formatted_address;
                        setInputValue(address);
                        onChange(address, {
                          latitude: newLat,
                          longitude: newLng,
                        });
                      }
                    }
                  );
                }
              });

              setMarker(newMarker);
            }
          }
        });
      }
    },
    [map, marker, onChange]
  );

  // Add map click listener
  useEffect(() => {
    if (map) {
      const listener = map.addListener("click", handleMapClick);
      return () => {
        window.google.maps.event.removeListener(listener);
      };
    }
  }, [map, handleMapClick]);

  // Handle manual coordinate input
  const handleManualCoordinates = useCallback(
    (lat: string, lng: string) => {
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
        marker.position = { lat: latitude, lng: longitude };
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
          position: { lat: latitude, lng: longitude },
          map: map,
          content: markerElement,
          title: "Facility Location",
          gmpDraggable: true,
        });

        // Add drag end listener
        newMarker.addListener("dragend", () => {
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
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode(
              { location: { lat: newLat, lng: newLng } },
              (results, status) => {
                if (status === "OK" && results && results[0]) {
                  const address = results[0].formatted_address;
                  setInputValue(address);
                  onChange(address, {
                    latitude: newLat,
                    longitude: newLng,
                  });
                }
              }
            );
          }
        });

        setMarker(newMarker);
      }

      // Reverse geocode to get address
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(
        { location: { lat: latitude, lng: longitude } },
        (results, status) => {
          if (status === "OK" && results && results[0]) {
            const address = results[0].formatted_address;
            setInputValue(address);
            onChange(address, {
              latitude: latitude,
              longitude: longitude,
            });
          } else {
            // If geocoding fails, still call onChange with coordinates
            onChange(inputValue || "", {
              latitude: latitude,
              longitude: longitude,
            });
          }
        }
      );
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
        <div className="space-y-2">
          <Label htmlFor="address-picker">{label}</Label>
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                ref={inputRef}
                id="address-picker"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="pl-10 pr-10"
              />
              {inputValue && (
                <button
                  onClick={clearAddress}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Suggestions dropdown */}
            {(showSuggestions && suggestions.length > 0) ||
            (inputValue && inputValue.length > 2) ? (
              <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={(e) => handleSuggestionClick(suggestion, e)}
                    className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {suggestion.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {suggestion.formatted_address}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}

                {/* Manual input option */}
                {inputValue && inputValue.length > 2 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleManualAddressInput(inputValue);
                    }}
                    className="w-full text-left p-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 bg-blue-25"
                  >
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-blue-900">
                          Use this address: &quot;{inputValue}&quot;
                        </p>
                        <p className="text-sm text-blue-600">
                          Press Enter or click to geocode this address
                        </p>
                      </div>
                    </div>
                  </button>
                )}
              </Card>
            ) : null}
          </div>
        </div>

        {/* Map */}
        <div className="space-y-2">
          <Label>Location Map</Label>
          <div className="relative">
            <div
              ref={mapRef}
              className="h-64 w-full rounded-lg border border-gray-200"
            />
            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs text-gray-600">
              Click on the map to set location or type an address above
            </div>
          </div>
        </div>

        {/* Manual coordinate input */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">
            Manual Coordinates (Optional)
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude" className="text-xs text-gray-600">
                Latitude
              </Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                onBlur={() => {
                  if (manualLat && manualLng) {
                    handleManualCoordinates(manualLat, manualLng);
                  }
                }}
                placeholder="e.g., 5.6037"
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="longitude" className="text-xs text-gray-600">
                Longitude
              </Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={manualLng}
                onChange={(e) => setManualLng(e.target.value)}
                onBlur={() => {
                  if (manualLat && manualLng) {
                    handleManualCoordinates(manualLat, manualLng);
                  }
                }}
                placeholder="e.g., -0.187"
                className="text-sm"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Enter coordinates manually or use the address search above
          </p>
        </div>

        {/* Selected coordinates display */}
        {coordinates && coordinates.latitude && coordinates.longitude && (
          <div className="text-sm text-gray-500">
            <p>
              Current Coordinates: {Number(coordinates.latitude).toFixed(6)},{" "}
              {Number(coordinates.longitude).toFixed(6)}
            </p>
          </div>
        )}
      </div>
    </GoogleMapsWrapper>
  );
};
