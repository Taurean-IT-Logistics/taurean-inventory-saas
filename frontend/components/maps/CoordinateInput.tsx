import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CoordinateInputProps {
  latitude: string;
  longitude: string;
  onLatitudeChange: (value: string) => void;
  onLongitudeChange: (value: string) => void;
  onCoordinateBlur: () => void;
  coordinates?: { latitude: number; longitude: number };
}

export const CoordinateInput: React.FC<CoordinateInputProps> = ({
  latitude,
  longitude,
  onLatitudeChange,
  onLongitudeChange,
  onCoordinateBlur,
  coordinates,
}) => {
  return (
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
            value={latitude}
            onChange={(e) => onLatitudeChange(e.target.value)}
            onBlur={onCoordinateBlur}
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
            value={longitude}
            onChange={(e) => onLongitudeChange(e.target.value)}
            onBlur={onCoordinateBlur}
            placeholder="e.g., -0.187"
            className="text-sm"
          />
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Enter coordinates manually or use the address search above
      </p>

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
  );
};
