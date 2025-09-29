"use client";

import React from "react";
import { Wrapper, Status } from "@googlemaps/react-wrapper";

interface GoogleMapsWrapperProps {
  children: React.ReactNode;
  apiKey: string;
}

const render = (status: Status): React.ReactElement => {
  switch (status) {
    case Status.LOADING:
      return (
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      );
    case Status.FAILURE:
      return (
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="text-red-500 mb-2">⚠️</div>
            <p className="text-gray-600">Failed to load map</p>
            <p className="text-sm text-gray-500">
              Please check your internet connection
            </p>
          </div>
        </div>
      );
    case Status.SUCCESS:
      return <></>;
    default:
      return <></>;
  }
};

export const GoogleMapsWrapper: React.FC<GoogleMapsWrapperProps> = ({
  children,
  apiKey,
}) => {
  console.log("GoogleMapsWrapper:", {
    apiKey: !!apiKey,
    apiKeyLength: apiKey?.length,
  });

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-gray-600">Google Maps API key not configured</p>
          <p className="text-sm text-gray-500">
            Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment
          </p>
        </div>
      </div>
    );
  }

  return (
    <Wrapper apiKey={apiKey} render={render} libraries={["marker", "places"]}>
      {children}
    </Wrapper>
  );
};
