"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Check,
  Star,
  MapPin,
  Users,
  Clock,
  Wifi,
  Car,
  Coffee,
  Monitor,
  Snowflake,
  Calendar,
} from "lucide-react";
import { currencyFormat } from "@/lib/utils";
import type { Facility, User } from "@/types";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  FacilitiesAPI,
  getResourceUrl,
  CompanyJoinRequestsAPI,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/ui/loader";
import { ErrorComponent } from "@/components/ui/error";
import Image from "next/image";
import ReviewForm from "@/components/ReviewForm";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "@/hooks/use-toast";

// Define Review interface locally to avoid conflicts
interface Review {
  _id: string;
  user: User;
  facility: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface FacilityImageGalleryProps {
  images: { path: string }[];
  facility: Partial<Facility>;
}

const FacilityImageGallery = ({
  images,
  facility,
}: FacilityImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(0);

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge className="bg-green-500 hover:bg-green-600">Available</Badge>
    ) : (
      <Badge variant="destructive">Unavailable</Badge>
    );
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-0">
        <div className="relative">
          <Image
            src={
              getResourceUrl(images[selectedImage]?.path) ||
              "/placeholder.svg?height=400&width=800"
            }
            alt={facility.name || ""}
            className="w-full h-96 object-cover rounded-t-lg"
            width={800}
            height={400}
          />
          <div className="absolute top-4 left-4">
            {getStatusBadge(!!facility.isActive)}
          </div>
        </div>
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2 p-4">
            {images.map((image, index) => (
              <Image
                key={index}
                src={
                  getResourceUrl(image.path) ||
                  "/placeholder.svg?height=80&width=120"
                }
                alt={`${facility.name} ${index + 1}`}
                className={cn(
                  "h-20 w-full object-cover rounded cursor-pointer border-2 transition-colors",
                  selectedImage === index
                    ? "border-blue-500"
                    : "border-gray-200 hover:border-gray-300"
                )}
                onClick={() => setSelectedImage(index)}
                width={120}
                height={80}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface FacilityDetailsProps {
  facility: Facility;
  hasVerifiedReviews: boolean;
}

const FacilityDetails = ({
  facility,
  hasVerifiedReviews,
}: FacilityDetailsProps) => {
  const amPm = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = Number.parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-4xl font-bold mb-3">{facility.name}</h1>
          <div className="flex items-center gap-6 text-gray-600">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{facility.location.address}</span>
            </div>
            {facility.rating && (
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 mr-1 fill-current" />
                <span className="font-semibold">{facility.rating.average}</span>
                <span className="ml-1 text-gray-500">
                  ({facility.rating.totalReviews} reviews)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {hasVerifiedReviews && (
          <Badge className="bg-green-500 hover:bg-green-600 flex items-center">
            <Check className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        )}
        {facility.isActive ? (
          <Badge className="bg-blue-500 hover:bg-blue-600">Available</Badge>
        ) : (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            Currently Unavailable
          </Badge>
        )}
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">About this space</h3>
        <p className="text-gray-600 leading-relaxed">{facility.description}</p>
        {facility.terms && (
          <div className="mt-4">
            <h5 className="font-semibold mb-2">Terms & Conditions</h5>
            <p className="text-gray-600 text-sm">{facility.terms}</p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-blue-500 mr-4" />
          <div>
            <div className="font-semibold">Capacity</div>
            <div className="text-gray-600 text-sm">
              Up to {facility.capacity.maximum} guests
            </div>
            <div className="text-gray-600 text-sm">
              Recommended: {facility.capacity.recommended}
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <Clock className="h-8 w-8 text-blue-500 mr-4" />
          <div>
            <div className="font-semibold">Operating Hours</div>
            <div className="text-gray-600 text-sm">
              {amPm(facility.operationalHours.opening)} -{" "}
              {amPm(facility.operationalHours.closing)}
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <Calendar className="h-8 w-8 text-blue-500 mr-4" />
          <div>
            <div className="font-semibold">Availability</div>
            <div className="text-gray-600 text-sm">
              {
                facility.availability.filter(
                  (a: { isAvailable: boolean }) => a.isAvailable
                ).length
              }{" "}
              days/week
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getAmenityIcon = (amenity: string) => {
  const amenityLower = amenity.toLowerCase();
  if (amenityLower.includes("wifi")) return Wifi;
  if (amenityLower.includes("parking")) return Car;
  if (amenityLower.includes("coffee") || amenityLower.includes("catering"))
    return Coffee;
  if (amenityLower.includes("projector") || amenityLower.includes("video"))
    return Monitor;
  if (amenityLower.includes("air") || amenityLower.includes("climate"))
    return Snowflake;
  return Check;
};

interface FacilityAmenitiesProps {
  amenities: string[];
}

const FacilityAmenities = ({ amenities }: FacilityAmenitiesProps) => (
  <div className="mb-8">
    <h3 className="text-xl font-semibold mb-4">What this place offers</h3>
    <div className="grid md:grid-cols-2 gap-4">
      {amenities.map((amenity: string, idx: number) => {
        const IconComponent = getAmenityIcon(amenity);
        return (
          <div key={idx} className="flex items-center">
            <IconComponent className="h-5 w-5 text-blue-500 mr-3" />
            <span>{amenity}</span>
          </div>
        );
      })}
    </div>
  </div>
);

interface ReviewFormProps {
  facilityId: string;
  existingReview: Review | null;
  onSubmit: (reviewData: { rating: number; comment: string }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

interface FacilityReviewsProps {
  reviews: {
    reviews: Review[];
    pagination: {
      currentPage: number;
      itemsPerPage: number;
      totalItems: number;
      totalPages: number;
    };
  };
  facility: Partial<Facility>;
  setFacility: React.Dispatch<React.SetStateAction<Partial<Facility>>>;
}

const FacilityReviews = ({
  reviews,
  facility,
  setFacility,
}: FacilityReviewsProps) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewsData, setReviewsData] = useState(reviews.reviews);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const queryClient = useQueryClient();

  // Get user's existing review for this facility
  const { data: userReview } = useQuery({
    queryKey: ["userReview", facility._id],
    queryFn: () => FacilitiesAPI.getUserReview(facility._id!),
    enabled: !!facility._id,
  });

  // Create/Update review mutation
  const createReviewMutation = useMutation({
    mutationFn: (reviewData: { rating: number; comment: string }) =>
      existingReview
        ? FacilitiesAPI.updateReview(existingReview._id, reviewData)
        : FacilitiesAPI.createReview(facility._id!, reviewData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facility", facility._id] });
      queryClient.invalidateQueries({
        queryKey: ["facility", facility._id, "reviews"],
      });
      setShowReviewForm(false);
      setExistingReview(null);
    },
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: string) => FacilitiesAPI.deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facility", facility._id] });
      queryClient.invalidateQueries({
        queryKey: ["facility", facility._id, "reviews"],
      });
      setExistingReview(null);
    },
  });

  // Helper function to check if an object is a valid Review
  const isValidReview = (obj: any): obj is Review => {
    return obj && typeof obj === "object" && typeof obj._id === "string";
  };

  useEffect(() => {
    if (userReview && isValidReview(userReview)) {
      setExistingReview(userReview);
    }
  }, [userReview]);

  const handleSubmitReview = async (reviewData: {
    rating: number;
    comment: string;
  }) => {
    try {
      await createReviewMutation.mutateAsync(reviewData);
    } catch (error) {
      console.error("Failed to submit review:", error);
    }
  };

  const handleDeleteReview = async () => {
    if (existingReview) {
      try {
        await deleteReviewMutation.mutateAsync(existingReview._id);
      } catch (error) {
        console.error("Failed to delete review:", error);
      }
    }
  };

  const handleCancelReview = () => {
    setShowReviewForm(false);
    setExistingReview(null);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Star className="h-5 w-5 text-yellow-400 mr-2 fill-current" />
          <h3 className="text-xl font-semibold">
            {facility.rating?.average?.toFixed(1) || "0"} ·{" "}
            {facility.rating?.totalReviews || 0} reviews
          </h3>
        </div>
        {!existingReview && (
          <Button onClick={() => setShowReviewForm(true)}>
            Leave a Review
          </Button>
        )}
      </div>

      {/* User's existing review */}
      {existingReview && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="bg-blue-500 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                  <span className="text-white font-bold">
                    {existingReview.user?.name?.charAt(0) || "U"}
                  </span>
                </div>
                <div>
                  <div className="font-semibold">Your Review</div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < existingReview.rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReviewForm(true)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteReview}
                  disabled={deleteReviewMutation.isPending}
                >
                  {deleteReviewMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
            <p className="text-gray-600">{existingReview.comment}</p>
          </CardContent>
        </Card>
      )}

      {/* Review form */}
      {showReviewForm && (
        <div className="mb-6">
          <ReviewForm
            facilityId={facility._id!}
            existingReview={existingReview}
            onSubmit={handleSubmitReview}
            onCancel={handleCancelReview}
            isSubmitting={createReviewMutation.isPending}
          />
        </div>
      )}

      {/* Other reviews */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviewsData
          .filter((review: Review) => review._id !== existingReview?._id)
          .map((review: Review, idx: number) => (
            <Card key={idx} className="bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-500 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                    <span className="text-white font-bold">
                      {review.user?.name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold">
                      {review.user?.name || "Anonymous"}
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < review.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

interface Pricing {
  amount: number;
  unit: string;
  isDefault?: boolean;
}

interface FacilityBookingCardProps {
  facility: Facility;
  defaultPricing: Pricing;
}

const FacilityBookingCard = ({
  facility,
  defaultPricing,
}: FacilityBookingCardProps) => {
  const { user } = useAuth();
  const [isJoining, setIsJoining] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  // Check if user already has a pending request
  const { data: userRequests } = useQuery({
    queryKey: ["user-join-requests"],
    queryFn: CompanyJoinRequestsAPI.getUserRequests,
    enabled: !!user && !user.company,
  });

  useEffect(() => {
    if (userRequests && user) {
      const pendingRequest = (userRequests as any)?.requests?.find(
        (req: any) =>
          req.company === facility.company && req.status === "pending"
      );
      setHasPendingRequest(!!pendingRequest);
    }
  }, [userRequests, user, facility.company]);

  const handleJoinCompany = async () => {
    if (!user) {
      toast({
        title: "You must be logged in to join a company.",
        description: "Please log in to your account.",
      });
      return;
    }

    setIsJoining(true);
    try {
      await CompanyJoinRequestsAPI.requestToJoin(facility.company!);
      setHasPendingRequest(true);
      toast({
        title: "Join request sent!",
        description: `Your join request for ${facility.name} has been sent.`,
      });
    } catch (error: any) {
      console.error("Failed to send join request:", error);
      toast({
        title: "Failed to join company",
        description:
          error.message || "Could not send join request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Card className="shadow-lg mb-4">
      <CardContent className="p-6">
        <div className="flex items-baseline mb-4">
          <span className="text-3xl font-bold">
            {currencyFormat(defaultPricing.amount || 0)}
          </span>
          <span className="text-gray-600 ml-2">per {defaultPricing.unit}</span>
        </div>

        {facility.pricing.length > 1 && (
          <div className="mb-4">
            <small className="text-gray-600">Other pricing options:</small>
            {facility.pricing
              .filter((p: Pricing) => !p.isDefault)
              .map((pricing: Pricing, idx: number) => (
                <div key={idx} className="text-sm text-gray-600">
                  {currencyFormat(pricing?.amount || 0)} per {pricing.unit}
                </div>
              ))}
          </div>
        )}

        <Button asChild className="w-full mb-4 text-lg py-3">
          <Link href={`/facility/${facility._id}/book`}>Book Now</Link>
        </Button>

        <div className="text-center mb-4">
          <small className="text-gray-600">You won&apos;t be charged yet</small>
        </div>

        <hr className="border-gray-200 mb-4" />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Response time:</span>
            <span>Within 1 hour</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Cancellation:</span>
            <span>Free until 24h before</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Languages:</span>
            <span>English, Spanish</span>
          </div>
        </div>

        {user && !user.company && !hasPendingRequest && (
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={handleJoinCompany}
            disabled={isJoining}
          >
            {isJoining ? "Joining..." : "Join Company"}
          </Button>
        )}

        {user && !user.company && hasPendingRequest && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <p className="text-sm text-blue-800">
              ✓ Join request sent! Waiting for approval.
            </p>
            <Button
              variant="link"
              className="text-blue-600 p-0 h-auto text-sm mt-1"
              asChild
            >
              <Link href="/user/join-requests">View Request Status</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const FacilityContactCard = () => (
  <Card className="shadow-lg">
    <CardContent className="p-6 text-center">
      <h5 className="font-semibold mb-3">Need help?</h5>
      <p className="text-gray-600 text-sm mb-4">
        Our team is here to assist you with your booking
      </p>
      <Button variant="outline" className="w-full bg-transparent">
        Contact Support
      </Button>
    </CardContent>
  </Card>
);

const FacilityDetailPage = ({ params }: { params: { id: string } }) => {
  const {
    data: facility,
    isLoading,
    refetch: refetchFacility,
  } = useQuery({
    queryKey: ["facility", params.id],
    queryFn: () => FacilitiesAPI.detail(params.id),
  });
  const {
    data: reviews,
    isLoading: isLoadingReviews,
    refetch: refetchReviews,
  } = useQuery({
    queryKey: ["facility", params.id, "reviews"],
    queryFn: () => FacilitiesAPI.reviews(params.id),
  });

  const handleRefetch = () => {
    refetchFacility();
    refetchReviews();
  };

  if (isLoading || isLoadingReviews) {
    return <Loader text="Loading facility details..." />;
  }

  if (!facility || !reviews) {
    return (
      <ErrorComponent
        message="Error loading facilities"
        onRetry={handleRefetch}
      />
    );
  }

  const defaultPricing =
    (facility as Facility).pricing.find((p: Pricing) => p.isDefault) ||
    (facility as Facility).pricing[0];
  // Note: hasVerifiedReviews is now calculated from the separate reviews API
  const hasVerifiedReviews = false; // This will be updated when we have review verification logic

  return (
    <div className="pt-6 mt-20">
      <div className="container mx-auto px-20">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <FacilityImageGallery
              images={(facility as Facility).images}
              facility={facility}
            />
            <FacilityDetails
              facility={facility as Facility}
              hasVerifiedReviews={hasVerifiedReviews}
            />
            <FacilityAmenities amenities={(facility as Facility).amenities} />
            {reviews && (
              <FacilityReviews
                facility={facility}
                setFacility={() => facility}
                reviews={reviews as FacilityReviewsProps["reviews"]}
              />
            )}
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <FacilityBookingCard
                facility={facility as Facility}
                defaultPricing={defaultPricing}
              />
              <FacilityContactCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityDetailPage;
