"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, User, Clock, Route } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";
import {
  calculateDistance,
  formatDistance,
  calculateTravelTime,
  formatTravelTime,
} from "@/lib/distanceUtils";

interface FacilityMapProps {
  latitude: number;
  longitude: number;
  address?: string;
  facilityName?: string;
  className?: string;
}

export const FacilityMap: React.FC<FacilityMapProps> = ({
  latitude,
  longitude,
  address,
  facilityName,
  className = "h-64 w-full",
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] =
    useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [userMarker, setUserMarker] =
    useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [travelTime, setTravelTime] = useState<number | null>(null);

  const { location, error, isLoading, requestLocation, clearLocation } =
    useLocation();

  useEffect(() => {
    if (!mapRef.current || !window.google) {
      console.log("Map not initialized:", {
        mapRef: !!mapRef.current,
        google: !!window.google,
      });
      return;
    }

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: { lat: latitude, lng: longitude },
      zoom: 15,
      mapId: "facility-map", // Required for Advanced Markers
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
      // Note: styles cannot be set when mapId is present
      // Styles must be configured in Google Cloud Console
    });

    // Create facility marker element
    const facilityMarkerElement = document.createElement("div");
    facilityMarkerElement.innerHTML = `
      <div style="
        width: 32px;
        height: 32px;
        background: #3B82F6;
        border: 2px solid #ffffff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: #ffffff;
          border-radius: 50%;
        "></div>
      </div>
    `;

    const markerInstance = new window.google.maps.marker.AdvancedMarkerElement({
      position: { lat: latitude, lng: longitude },
      map: mapInstance,
      title: facilityName || "Facility Location",
      content: facilityMarkerElement,
    });

    // Create info window
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div class="p-2">
          <h3 class="font-semibold text-gray-900 mb-1">${
            facilityName || "Facility"
          }</h3>
          ${address ? `<p class="text-sm text-gray-600">${address}</p>` : ""}
        </div>
      `,
    });

    // Add click listener to marker
    markerInstance.addListener("click", () => {
      infoWindow.open(mapInstance, markerInstance);
    });

    setMap(mapInstance);
    setMarker(markerInstance);

    return () => {
      if (markerInstance) {
        markerInstance.map = null;
      }
    };
  }, [latitude, longitude, address, facilityName]);

  // Handle user location updates
  useEffect(() => {
    if (!map || !location) return;

    // Calculate distance
    const dist = calculateDistance(
      { latitude, longitude },
      { latitude: location.latitude, longitude: location.longitude }
    );
    setDistance(dist);
    setTravelTime(calculateTravelTime(dist));

    // Create user location marker element
    const userMarkerElement = document.createElement("div");
    userMarkerElement.innerHTML = `
      <div style="
        width: 24px;
        height: 24px;
        background: #10B981;
        border: 2px solid #ffffff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
      ">
        <div style="
          width: 6px;
          height: 6px;
          background: #ffffff;
          border-radius: 50%;
        "></div>
      </div>
    `;

    // Add user location marker
    const userMarkerInstance =
      new window.google.maps.marker.AdvancedMarkerElement({
        position: { lat: location.latitude, lng: location.longitude },
        map: map,
        title: "Your Location",
        content: userMarkerElement,
      });

    setUserMarker(userMarkerInstance);

    // Fit map to show both markers
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend({ lat: latitude, lng: longitude });
    bounds.extend({ lat: location.latitude, lng: location.longitude });
    map.fitBounds(bounds);

    return () => {
      if (userMarkerInstance) {
        userMarkerInstance.map = null;
      }
    };
  }, [map, location, latitude, longitude]);

  const handleGetDirections = () => {
    const url = location
      ? `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${latitude},${longitude}`
      : `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, "_blank");
  };

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {/* Action buttons overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={handleGetDirections}
          className="bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-full shadow-lg border border-gray-200 transition-colors"
          title="Get directions"
        >
          <Navigation className="h-4 w-4" />
        </button>

        {!location && !isLoading && (
          <button
            onClick={requestLocation}
            className="bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-full shadow-lg border border-gray-200 transition-colors"
            title="Show my location"
          >
            <User className="h-4 w-4" />
          </button>
        )}

        {isLoading && (
          <div className="bg-white p-2 rounded-full shadow-lg border border-gray-200">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Address and distance overlay */}
      {address && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <span className="text-sm text-gray-700 font-medium">
                {address}
              </span>
            </div>

            {/* Distance and travel time */}
            {distance !== null && travelTime !== null && (
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Route className="h-3 w-3" />
                  <span>{formatDistance(distance)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTravelTime(travelTime)}</span>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
};
