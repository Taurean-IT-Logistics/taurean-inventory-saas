"use client";

import { useState } from "react";
import {
  Star,
  Wifi,
  Car,
  Tv,
  Snowflake,
  Users,
  MessageCircle,
  Shield,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  DollarSign,
} from "lucide-react";
import type { Facility } from "@/types";
import Image from "next/image";
import { FacilitiesAPI, getResourceUrl } from "@/lib/api";
import { Button } from "../ui/button";
import { useQuery } from "@tanstack/react-query";

interface FacilityDetailPageProps {
  facility: Facility;
}

export default function FacilityDetailPage({
  facility,
}: FacilityDetailPageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("photos");

  const defaultPricing =
    facility.pricing.find((p) => p.isDefault) || facility.pricing[0];

  const formatAvailability = () => {
    const availableDays = facility.availability
      .filter((a) => a.isAvailable)
      .map((a) => a.day.charAt(0).toUpperCase() + a.day.slice(1));
    return availableDays.join(", ");
  };

  const getAmenityIcon = (amenity: string) => {
    const iconMap: { [key: string]: any } = {
      wifi: Wifi,
      parking: Car,
      tv: Tv,
      "air conditioning": Snowflake,
      kitchen: Users,
      pool: Users,
      washer: Users,
      refrigerator: Users,
      security: Shield,
    };

    const key = amenity.toLowerCase();
    return iconMap[key] || Users;
  };

  // Tab Components
  const PhotosTab = () => (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Photo Gallery
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {facility.images.map((image, index) => (
          <div
            key={index}
            className="aspect-square relative rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => setCurrentImageIndex(index)}
          >
            <Image
              src={getResourceUrl(image.path) || "/placeholder.svg"}
              alt={`${facility.name} - ${image.originalName}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              width={500}
              height={500}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const AmenitiesTab = () => (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        What this place offers
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {facility.amenities.map((amenity, index) => {
          const IconComponent = getAmenityIcon(amenity);
          return (
            <div key={index} className="flex items-center space-x-4 py-3">
              <IconComponent className="h-6 w-6 text-gray-600 flex-shrink-0" />
              <span className="text-gray-900">{amenity}</span>
            </div>
          );
        })}
      </div>
      <button className="mt-6 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
        Show all {facility.amenities.length} amenities
      </button>
    </div>
  );

  const ReviewsTab = () => (
    <div className="mb-8">
      <div className="flex items-center mb-6">
        <Star className="h-5 w-5 text-black fill-current mr-2" />
        <span className="text-xl font-semibold">
          {facility.rating.average} · {facility.rating.totalReviews} reviews
        </span>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-6">
        {facility.reviews.map((review, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-center space-x-3">
              <img
                src={review.user.name || "/placeholder.svg"}
                alt={review.user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-sm">{review.user.name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
              {review.isVerified && (
                <Shield className="h-4 w-4 text-green-500" />
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < review.rating
                        ? "text-black fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span>·</span>
              <span>{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-gray-700">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const LocationTab = () => (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Where you'll be
      </h3>
      <p className="text-gray-600 mb-6 flex items-center">
        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
        {facility.location.address}
      </p>

      {facility.location.coordinates && (
        <div className="mb-4 text-sm text-gray-500">
          <p>
            Coordinates: {facility.location.coordinates.latitude},{" "}
            {facility.location.coordinates.longitude}
          </p>
        </div>
      )}

      <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl h-64 sm:h-80 lg:h-96 flex items-center justify-center border border-gray-200">
        <div className="text-center px-4">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            Interactive map would be embedded here
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Showing exact location at {facility.location.address}
          </p>
        </div>
      </div>
    </div>
  );

  const DetailsTab = () => (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Facility Details
      </h3>

      {/* Capacity */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Capacity
        </h4>
        <p className="text-sm text-gray-600">
          Maximum: {facility.capacity.maximum} people | Recommended:{" "}
          {facility.capacity.recommended} people
        </p>
      </div>

      {/* Operational Hours */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Operating Hours
        </h4>
        <p className="text-sm text-gray-600">
          {facility.operationalHours.opening} -{" "}
          {facility.operationalHours.closing}
        </p>
      </div>

      {/* Availability */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Available Days
        </h4>
        <p className="text-sm text-gray-600">{formatAvailability()}</p>
      </div>

      {/* Pricing */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2 flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Pricing Options
        </h4>
        <div className="space-y-2">
          {facility.pricing.map((price, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-gray-600 capitalize">
                Per {price.unit} {price.isDefault && "(Default)"}
              </span>
              <span className="font-medium">
                GH₵{price.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Terms */}
      {facility.terms && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Terms & Conditions</h4>
          <p className="text-sm text-gray-600">{facility.terms}</p>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "photos":
        return <PhotosTab />;
      case "amenities":
        return <AmenitiesTab />;
      case "reviews":
        return <ReviewsTab />;
      case "location":
        return <LocationTab />;
      case "details":
        return <DetailsTab />;
      default:
        return <PhotosTab />;
    }
  };

  const {
    data: availabilityCalendar,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["availability", facility._id],
    queryFn: () => FacilitiesAPI.calendar(facility._id),
  });

  console.log("Calendar Availability:", availabilityCalendar);

  return (
    <div className="min-h-screen mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">
            {facility.name}
          </h1>
        </div>

        {/* Image Gallery - Mobile: Single image with navigation, Desktop: Grid */}
        <div className="mb-8">
          {/* Mobile Image Gallery */}
          <div className="block sm:hidden">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <img
                src={
                  facility.images[currentImageIndex]?.path || "/placeholder.svg"
                }
                alt={
                  facility.images[currentImageIndex]?.originalName ||
                  facility.name
                }
                className="w-full h-full object-cover"
              />
              <button
                onClick={() =>
                  setCurrentImageIndex(
                    currentImageIndex === 0
                      ? facility.images.length - 1
                      : currentImageIndex - 1
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() =>
                  setCurrentImageIndex(
                    (currentImageIndex + 1) % facility.images.length
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {facility.images.length}
              </div>
            </div>
          </div>

          {/* Desktop Image Gallery */}
          <div className="hidden sm:block">
            <div className="grid grid-cols-4 gap-2 h-[300px] sm:h-[400px] lg:h-[500px]">
              {facility.images.slice(0, 5).map((image, idx) => {
                // First image spans 2 columns
                if (idx === 0) {
                  return (
                    <div
                      key={idx}
                      className="col-span-2 relative rounded-l-xl overflow-hidden"
                    >
                      <img
                        src={getResourceUrl(image.path) || "/placeholder.svg"}
                        alt={image.originalName || facility.name}
                        className="w-full h-full object-cover hover:brightness-90 transition-all cursor-pointer"
                      />
                    </div>
                  );
                }
                // Next 4 images in 2x2 grid
                const isTop = idx === 1 || idx === 3;
                const isRight = idx === 3 || idx === 4;
                const roundedClass =
                  idx === 3
                    ? "rounded-tr-xl"
                    : idx === 4
                    ? "rounded-br-xl"
                    : "";
                return (
                  <div
                    key={idx}
                    className={`relative overflow-hidden ${roundedClass} ${
                      isRight ? "" : ""
                    }`}
                    style={{
                      gridColumn: isRight ? 4 : 3,
                      gridRow: isTop ? 1 : 2,
                    }}
                  >
                    <img
                      src={getResourceUrl(image.path) || "/placeholder.svg"}
                      alt={image.originalName || facility.name}
                      className="w-full h-full object-cover hover:brightness-90 transition-all cursor-pointer"
                    />
                    {idx === 4 && (
                      <button className="absolute bottom-4 right-4 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium shadow-sm flex items-center">
                        <div className="grid grid-cols-3 gap-1 mr-2">
                          {[...Array(9)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1 h-1 bg-gray-900 rounded-full"
                            />
                          ))}
                        </div>
                        Show all photos
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 xl:gap-12">
          {/* Main Content */}
          <div className="xl:col-span-2">
            {/* Facility Info */}
            <div className="mb-8 pb-8 border-b">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                    {facility.name}
                  </h2>
                  <p className="text-gray-600 mb-2">
                    Capacity: {facility.capacity.maximum} people ·{" "}
                    {facility.location.address}
                  </p>
                  {facility.description && (
                    <p className="text-gray-600 mt-6">{facility.description}</p>
                  )}
                </div>
                <img
                  src={facility.createdBy.name || "/placeholder.svg"}
                  alt={facility.createdBy.name}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover ml-4 flex-shrink-0"
                />
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-4 sm:space-x-8 mb-8 border-b overflow-x-auto">
              {["Photos", "Amenities", "Reviews", "Location", "Details"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    className={`pb-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.toLowerCase()
                        ? "border-black text-black"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>

            {/* Tab Content */}
            {renderTabContent()}

            {/* Meet the owner */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Meet the Host
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start space-y-6 sm:space-y-0 sm:space-x-6">
                  <div className="text-center flex-shrink-0">
                    <div className="relative">
                      <img
                        src={facility.createdBy.name || "/placeholder.svg"}
                        alt={facility.createdBy.name}
                        className="w-20 h-20 rounded-full object-cover mx-auto"
                      />
                    </div>
                    <h4 className="text-2xl font-semibold mt-4">
                      {facility.createdBy.name}
                    </h4>
                    <p className="text-gray-500 text-sm">Owner</p>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-4 sm:gap-8 w-full">
                    <div className="text-center">
                      <p className="text-xl sm:text-2xl font-semibold">
                        {facility.rating.totalReviews}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Reviews
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl sm:text-2xl font-semibold">
                        {facility.rating.average}★
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">Rating</p>
                    </div>
                  </div>
                </div>

                <button className="mt-6 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message owner
                </button>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="xl:col-span-1">
            <div className="xl:sticky xl:top-8">
              <div className="border border-gray-200 rounded-xl p-6 shadow-lg bg-white">
                <div className="flex flex-col sm:flex-row xl:flex-col items-start sm:items-center xl:items-start justify-between mb-6">
                  <div className="flex items-baseline mb-2 sm:mb-0 xl:mb-2">
                    <span className="text-2xl font-semibold">
                      GH₵{defaultPricing?.amount.toLocaleString()}
                    </span>
                    <span className="text-gray-600 ml-2">
                      per {defaultPricing?.unit}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-black fill-current mr-1" />
                    <span className="font-medium">
                      {facility.rating.average}
                    </span>
                    <span className="text-gray-500 ml-1">
                      · {facility.rating.totalReviews} reviews
                    </span>
                  </div>
                </div>

                <div className="border border-gray-300 rounded-lg mb-4">
                  <div className="p-3 border-t border-gray-300">
                    <label className="block text-xs font-medium text-gray-900 mb-1">
                      GUESTS
                    </label>
                    <div className="text-sm text-gray-600">
                      Max {facility.capacity.maximum} guests
                    </div>
                  </div>
                </div>

                <button className="w-full bg-red-500 hover:bg-red-600 text-white py-3 text-base font-medium mb-4 rounded-lg transition-colors">
                  Book Now
                </button>

                <Button className="text-center  text-sm mb-6 w-full">
                  Check availability first
                </Button>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Base price per {defaultPricing?.unit}</span>
                    <span>GH₵{defaultPricing?.amount.toLocaleString()}</span>
                  </div>
                  {facility.isTaxable && (
                    <div className="flex justify-between">
                      <span>Taxes</span>
                      <span>Calculated at checkout</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield className="h-4 w-4 mr-2 text-green-500" />
                    <span>Secure booking</span>
                  </div>
                </div>

                <button className="w-full mt-4 text-sm text-gray-600 underline hover:text-gray-800 transition-colors flex items-center justify-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Report this listing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
