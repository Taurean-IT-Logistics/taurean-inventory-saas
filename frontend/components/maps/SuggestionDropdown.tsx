import React from "react";
import { Card } from "@/components/ui/card";
import { MapPin, Search } from "lucide-react";
import { PlaceResult } from "@/types/PlaceResult";

interface SuggestionDropdownProps {
  suggestions: PlaceResult[];
  showSuggestions: boolean;
  inputValue: string;
  onSuggestionClick: (
    suggestion: PlaceResult,
    event?: React.MouseEvent
  ) => void;
  onManualAddressInput: (address: string) => void;
}

export const SuggestionDropdown: React.FC<SuggestionDropdownProps> = ({
  suggestions,
  showSuggestions,
  inputValue,
  onSuggestionClick,
  onManualAddressInput,
}) => {
  if (!showSuggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto">
      {suggestions.map((suggestion, index) => {
        console.log("🎯 Rendering suggestion button:", {
          index,
          suggestion,
          hasPlaceId: !!suggestion.place_id,
        });
        return (
          <button
            key={index}
            type="button"
            onClick={(e) => {
              console.log("🎯 Suggestion button clicked:", {
                index,
                suggestion,
              });
              console.log("🎯 About to call handleSuggestionClick");
              try {
                onSuggestionClick(suggestion, e);
                console.log("🎯 handleSuggestionClick called successfully");
              } catch (error) {
                console.error("🎯 Error calling handleSuggestionClick:", error);
              }
            }}
            className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
          >
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">{suggestion.name}</p>
                <p className="text-sm text-gray-500">
                  {suggestion.formatted_address}
                </p>
              </div>
            </div>
          </button>
        );
      })}

      {/* Manual input option */}
      {inputValue && inputValue.length > 2 && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onManualAddressInput(inputValue);
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
  );
};
