import { useState, useCallback } from "react";

export interface UserLocation {
  lat: number;
  lng: number;
}

export const useUserLocation = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const getUserLocation = useCallback(() => {
    if (navigator.geolocation && !userLocation && !isGettingLocation) {
      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          setIsGettingLocation(false);
        },
        (error) => {
          console.log("Geolocation error:", error);
          setIsGettingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000, // 5 minutes
        }
      );
    }
  }, [userLocation, isGettingLocation]);

  return {
    userLocation,
    isGettingLocation,
    getUserLocation,
  };
};
