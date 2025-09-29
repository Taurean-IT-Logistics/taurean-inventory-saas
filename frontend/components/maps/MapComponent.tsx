import React, { useRef, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";

interface MapComponentProps {
  map: google.maps.Map | null;
  marker: google.maps.marker.AdvancedMarkerElement | null;
  coordinates?: { latitude: number; longitude: number };
  userLocation?: { lat: number; lng: number } | null;
  isGettingLocation: boolean;
  onMapClick: (event: google.maps.MapMouseEvent) => void;
  onMarkerDrag: (lat: number, lng: number) => void;
  onGetUserLocation: () => void;
  mapRef: React.RefObject<HTMLDivElement>;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  map,
  marker,
  coordinates,
  userLocation,
  isGettingLocation,
  onMapClick,
  onMarkerDrag,
  onGetUserLocation,
  mapRef,
}) => {
  // Add map click listener
  useEffect(() => {
    if (map) {
      const listener = map.addListener("click", onMapClick);
      return () => {
        window.google.maps.event.removeListener(listener);
      };
    }
  }, [map, onMapClick]);

  // Update map center when coordinates change
  useEffect(() => {
    if (map && coordinates) {
      map.setCenter({ lat: coordinates.latitude, lng: coordinates.longitude });
      map.setZoom(15);

      // Update marker position
      if (marker) {
        marker.position = new window.google.maps.LatLng(
          coordinates.latitude,
          coordinates.longitude
        );
      } else {
        // Create marker if it doesn't exist
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
          position: new window.google.maps.LatLng(
            coordinates.latitude,
            coordinates.longitude
          ),
          map: map,
          content: markerElement,
          title: "Facility Location",
          gmpDraggable: true,
        });

        // Add drag end listener
        newMarker.addListener("dragend", () => {
          const position = newMarker.position;
          if (position) {
            const lat =
              typeof position.lat === "function"
                ? position.lat()
                : position.lat;
            const lng =
              typeof position.lng === "function"
                ? position.lng()
                : position.lng;
            onMarkerDrag(lat, lng);
          }
        });
      }
    }
  }, [map, marker, coordinates, onMarkerDrag]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Location Map</Label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (userLocation) {
                if (map) {
                  map.setCenter(userLocation);
                  map.setZoom(15);
                }
              } else {
                onGetUserLocation();
              }
            }}
            disabled={isGettingLocation}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors disabled:opacity-50"
          >
            <MapPin className="h-3 w-3" />
            {isGettingLocation
              ? "Getting..."
              : userLocation
              ? "My Location"
              : "Get Location"}
          </button>
        </div>
      </div>
      <div className="relative">
        <div
          ref={mapRef}
          className="h-64 w-full rounded-lg border border-gray-200"
        />
        {!map && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">
                {isGettingLocation
                  ? "Getting your location..."
                  : "Loading map..."}
              </p>
            </div>
          </div>
        )}
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs text-gray-600">
          Click on the map to set location or type an address above
        </div>
      </div>
    </div>
  );
};
