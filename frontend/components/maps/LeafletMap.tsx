"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon, LatLngTuple } from "leaflet";
import { MapPin, Navigation, User, Clock, Route } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";
import {
  calculateDistance,
  formatDistance,
  calculateTravelTime,
  formatTravelTime,
} from "@/lib/distanceUtils";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LeafletMapProps {
  latitude: number;
  longitude: number;
  address?: string;
  facilityName?: string;
  className?: string;
}

// Custom component to fit map bounds when user location is available
const MapBoundsController: React.FC<{
  facilityPosition: LatLngTuple;
  userPosition?: LatLngTuple;
}> = ({ facilityPosition, userPosition }) => {
  const map = useMap();

  useEffect(() => {
    if (userPosition) {
      // Fit map to show both facility and user location
      const bounds = [facilityPosition, userPosition] as LatLngTuple[];
      map.fitBounds(bounds, { padding: [20, 20] });
    } else {
      // Center on facility location
      map.setView(facilityPosition, 15);
    }
  }, [map, facilityPosition, userPosition]);

  return null;
};

export const LeafletMap: React.FC<LeafletMapProps> = ({
  latitude,
  longitude,
  address,
  facilityName,
  className = "h-64 w-full",
}) => {
  const [distance, setDistance] = useState<number | null>(null);
  const [travelTime, setTravelTime] = useState<number | null>(null);
  const { location, error, isLoading, requestLocation } = useLocation();

  const facilityPosition: LatLngTuple = [latitude, longitude];
  const userPosition: LatLngTuple | undefined = location
    ? [location.latitude, location.longitude]
    : undefined;

  // Calculate distance when user location is available
  useEffect(() => {
    if (location) {
      const dist = calculateDistance(
        { latitude, longitude },
        { latitude: location.latitude, longitude: location.longitude }
      );
      setDistance(dist);
      setTravelTime(calculateTravelTime(dist));
    }
  }, [location, latitude, longitude]);

  const handleGetDirections = () => {
    const url = location
      ? `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${latitude},${longitude}`
      : `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, "_blank");
  };

  // Custom marker icons
  const facilityIcon = new Icon({
    iconUrl:
      "data:image/svg+xml;base64," +
      btoa(`
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="#ffffff" stroke-width="2"/>
        <circle cx="16" cy="16" r="4" fill="#ffffff"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

  const userIcon = new Icon({
    iconUrl:
      "data:image/svg+xml;base64," +
      btoa(`
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#10B981" stroke="#ffffff" stroke-width="2"/>
        <circle cx="12" cy="12" r="4" fill="#ffffff"/>
      </svg>
    `),
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={facilityPosition}
        zoom={15}
        className="w-full h-full rounded-lg"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Facility marker */}
        <Marker position={facilityPosition} icon={facilityIcon}>
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-gray-900 mb-1">
                {facilityName || "Facility"}
              </h3>
              {address && <p className="text-sm text-gray-600">{address}</p>}
            </div>
          </Popup>
        </Marker>

        {/* User location marker */}
        {userPosition && (
          <Marker position={userPosition} icon={userIcon}>
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Your Location
                </h3>
                <p className="text-sm text-gray-600">
                  {distance !== null && travelTime !== null && (
                    <>
                      {formatDistance(distance)} away
                      <br />
                      {formatTravelTime(travelTime)} drive
                    </>
                  )}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Map bounds controller */}
        <MapBoundsController
          facilityPosition={facilityPosition}
          userPosition={userPosition}
        />
      </MapContainer>

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
