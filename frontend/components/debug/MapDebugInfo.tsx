"use client";

import React from "react";
import GOOGLE_MAPS_CONFIG from "@/lib/mapsConfig";

export const MapDebugInfo: React.FC = () => {
  const apiKey = GOOGLE_MAPS_CONFIG.apiKey;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-yellow-800 mb-2">
        Map Debug Information
      </h3>
      <div className="text-sm text-yellow-700 space-y-1">
        <div>API Key Present: {apiKey ? "✅ Yes" : "❌ No"}</div>
        <div>API Key Length: {apiKey?.length || 0} characters</div>
        <div>
          API Key Preview:{" "}
          {apiKey ? `${apiKey.substring(0, 10)}...` : "Not set"}
        </div>
        <div>
          Environment Variable:{" "}
          {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
            ? "✅ Set"
            : "❌ Not set"}
        </div>
      </div>
      {!apiKey && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          <strong>Action Required:</strong> Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          in your .env.local file
        </div>
      )}
    </div>
  );
};
