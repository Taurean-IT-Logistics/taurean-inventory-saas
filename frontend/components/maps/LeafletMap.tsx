"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon, LatLngTuple, Polyline } from "leaflet";
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

// Custom component to handle routing between user and facility
const RouteController: React.FC<{
  facilityPosition: LatLngTuple;
  userPosition?: LatLngTuple;
}> = ({ facilityPosition, userPosition }) => {
  const map = useMap();
  const [routePolyline, setRoutePolyline] = useState<Polyline | null>(null);

  useEffect(() => {
    if (userPosition) {
      // Remove existing route if any
      if (routePolyline) {
        map.removeLayer(routePolyline);
      }

      // Try to get a real route using OpenRouteService API
      const getRoute = async () => {
        try {
          // Using OpenRouteService API for routing (free tier available)
          const apiKey = process.env.NEXT_PUBLIC_OPENROUTE_API_KEY;

          if (apiKey && apiKey !== "your-api-key-here") {
            const response = await fetch(
              `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${userPosition[1]},${userPosition[0]}&end=${facilityPosition[1]},${facilityPosition[0]}`
            );

            if (response.ok) {
              const data = await response.json();

              if (data.features && data.features[0]) {
                const coordinates = data.features[0].geometry.coordinates;
                const routePoints = coordinates.map(
                  (coord: [number, number]) =>
                    [coord[1], coord[0]] as LatLngTuple
                );

                const polyline = new Polyline(routePoints, {
                  color: "#3b82f6",
                  weight: 4,
                  opacity: 0.8,
                }).addTo(map);

                setRoutePolyline(polyline);

                // Fit map to show entire route
                map.fitBounds(polyline.getBounds(), { padding: [20, 20] });
                return;
              }
            }
          }
        } catch (error) {
          console.warn("Failed to fetch route, using straight line:", error);
        }

        // Fallback: draw straight line if routing fails or no API key
        const straightLine = new Polyline([userPosition, facilityPosition], {
          color: "#ef4444",
          weight: 3,
          opacity: 0.6,
          dashArray: "10, 10",
        }).addTo(map);

        setRoutePolyline(straightLine);
        map.fitBounds(straightLine.getBounds(), { padding: [20, 20] });
      };

      getRoute();
    } else {
      // Center on facility location if no user location
      map.setView(facilityPosition, 15);
    }

    // Cleanup function
    return () => {
      if (routePolyline) {
        map.removeLayer(routePolyline);
      }
    };
  }, [map, facilityPosition, userPosition, routePolyline]);

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
              {address && (
                <p className="text-sm text-gray-600 mb-2">{address}</p>
              )}
              <div className="text-xs text-gray-500">
                <p>
                  Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
              </div>
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
                <p className="text-sm text-gray-600 mb-2">
                  {distance !== null && travelTime !== null && (
                    <>
                      {formatDistance(distance)} away
                      <br />
                      {formatTravelTime(travelTime)} drive
                    </>
                  )}
                </p>
                <div className="text-xs text-gray-500">
                  <p>
                    Coordinates: {userPosition[0].toFixed(6)},{" "}
                    {userPosition[1].toFixed(6)}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route controller */}
        <RouteController
          facilityPosition={facilityPosition}
          userPosition={userPosition}
        />
      </MapContainer>

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
