"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, X, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader } from "@/components/ui/loader";
import { ErrorComponent } from "@/components/ui/error";

interface Review {
  _id: string;
  user: {
    name?: string;
    username?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface ReviewModalProps {
  show: boolean;
  onHide: () => void;
  facility: {
    _id: string;
    name?: string;
  } | null;
}

const ReviewModal = ({ show, onHide, facility }: ReviewModalProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchReviews = useCallback(
    async (page = 1) => {
      if (!facility) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/facilities/${facility._id}/reviews?page=${page}`
        );
        if (!response.ok) throw new Error("Failed to fetch reviews");

        const data = await response.json();
        setReviews(data.reviews || []);
        setPagination(data.pagination);
      } catch (err) {
        setError("Failed to load reviews. Please try again.");
        setReviews([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    },
    [facility]
  );

  useEffect(() => {
    if (facility?._id && show) {
      setCurrentPage(1);
      fetchReviews(1);
    }

    if (!show) {
      setReviews([]);
      setPagination(null);
      setError(null);
      setCurrentPage(1);
    }
  }, [facility?._id, show, fetchReviews]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">
          ({rating.toFixed(1)})
        </span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!facility?._id) return null;

  return (
    <Dialog open={show} onOpenChange={onHide}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Facility Reviews {facility.name && `- ${facility.name}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {pagination && (
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * pagination.itemsPerPage + 1} to{" "}
              {Math.min(
                currentPage * pagination.itemsPerPage,
                pagination.totalItems
              )}{" "}
              of {pagination.totalItems} reviews
            </div>
          )}

          {loading && <Loader />}

          {error && (
            <ErrorComponent
              title="Error loading reviews"
              message={error}
              onRetry={() => fetchReviews(currentPage)}
            />
          )}

          {!loading && !error && reviews.length === 0 && (
            <Alert>
              <AlertDescription className="text-center">
                <div className="py-8">
                  <h5 className="text-lg font-semibold mb-2">No Reviews Yet</h5>
                  <p>This facility hasn&apos;t received any reviews yet.</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {!loading && !error && reviews.length > 0 && (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h6 className="font-semibold">{review.user.name}</h6>
                      <p className="text-sm text-gray-600">
                        @{review.user.username}
                      </p>
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 mt-2">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center pt-4">
            <Button variant="outline" onClick={onHide}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            <Button
              onClick={() => fetchReviews(currentPage)}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Reviews
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
