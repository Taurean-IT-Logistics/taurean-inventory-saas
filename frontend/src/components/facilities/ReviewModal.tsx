import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert, Pagination } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRefresh, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FacilityController } from 'controllers';
import { showToast } from 'components/toaster/toaster';
import { User } from 'types';

interface Review {
  _id: string;
  user: Partial<User>;
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

interface ReviewsResponse {
  success: boolean;
  reviews: Review[];
  pagination: PaginationInfo;
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

  const fetchReviews = async (page: number = 1) => {
    if (!facility) return;

    setLoading(true);
    setError(null);

    try {
      const response = await FacilityController.getReviews(facility._id, {
        page
      });
      const data = response;

      if (data.success) {
        setReviews((data.data as unknown as ReviewsResponse).reviews || []);
        setPagination((data.data as unknown as ReviewsResponse).pagination);
        showToast('success', 'Reviews fetched successfully');
      }
    } catch (err) {
      setError('Failed to load reviews. Please try again.');
      setReviews([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (facility?._id && show) {
      setCurrentPage(1);
      fetchReviews(1);
    }

    // Reset state when modal is closed
    if (!show) {
      setReviews([]);
      setPagination(null);
      setError(null);
      setCurrentPage(1);
    }
  }, [facility?._id, show]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchReviews(page);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

    return (
      <div className="d-flex align-items-center">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="text-warning">
            ★
          </span>
        ))}
        {hasHalfStar && <span className="text-warning">☆</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="text-muted">
            ☆
          </span>
        ))}
        <span className="ms-2 text-muted">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(
      pagination.totalPages,
      startPage + maxVisiblePages - 1
    );

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page
    if (startPage > 1) {
      items.push(
        <Pagination.Item key={1} onClick={() => handlePageChange(1)}>
          1
        </Pagination.Item>
      );
      if (startPage > 2) {
        items.push(<Pagination.Ellipsis key="start-ellipsis" />);
      }
    }

    // Visible pages
    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }

    // Last page
    if (endPage < pagination.totalPages) {
      if (endPage < pagination.totalPages - 1) {
        items.push(<Pagination.Ellipsis key="end-ellipsis" />);
      }
      items.push(
        <Pagination.Item
          key={pagination.totalPages}
          onClick={() => handlePageChange(pagination.totalPages)}
        >
          {pagination.totalPages}
        </Pagination.Item>
      );
    }

    return (
      <div className="d-flex justify-content-center align-items-center mt-4">
        <Pagination>
          <Pagination.Prev
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          />
          {items}
          <Pagination.Next
            disabled={currentPage === pagination.totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          />
        </Pagination>
      </div>
    );
  };

  if (!facility?._id) return null;

  //   const handleUpdate = () => {
  //     if (onUpdate) {
  //       onUpdate();
  //     }
  //     onHide();
  //   };

  const refresh = async () => {
    await fetchReviews(currentPage);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" scrollable>
      <Modal.Header closeButton className="border-secondary">
        <Modal.Title>
          Facility Reviews {facility.name && `- ${facility.name}`}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ maxHeight: '60vh' }}>
        {pagination && (
          <div className="mb-3 text-muted">
            <small>
              Showing {(currentPage - 1) * pagination.itemsPerPage + 1} to{' '}
              {Math.min(
                currentPage * pagination.itemsPerPage,
                pagination.totalItems
              )}{' '}
              of {pagination.totalItems} reviews
            </small>
          </div>
        )}

        {loading && (
          <div className="text-center py-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading reviews...</span>
            </Spinner>
            <div className="mt-2">Loading reviews...</div>
          </div>
        )}

        {error && (
          <Alert variant="danger" className="mb-3">
            <Alert.Heading>Error</Alert.Heading>
            {error}
            <div className="mt-2">
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => fetchReviews(currentPage)}
              >
                Try Again
              </Button>
            </div>
          </Alert>
        )}

        {!loading && !error && reviews.length === 0 && (
          <Alert variant="info" className="text-center">
            <h5>No Reviews Yet</h5>
            <p className="mb-0">
              This facility hasn't received any reviews yet.
            </p>
          </Alert>
        )}

        {!loading && !error && reviews.length > 0 && (
          <div className="reviews-container">
            {reviews.map(review => (
              <div
                key={review._id}
                className="review-item border-bottom pb-3 mb-3"
              >
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6>{review.user.name}</h6>
                    <p className="mb-1 text-muted">@{review.user.username}</p>
                    {renderStars(review.rating)}
                  </div>
                  <small className="text-muted">
                    {formatDate(review.createdAt)}
                  </small>
                </div>

                {review.comment && (
                  <p className="mb-0 mt-2">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {renderPagination()}
      </Modal.Body>

      <Modal.Footer className="border-secondary">
        <Button variant="secondary" onClick={onHide}>
          <FontAwesomeIcon icon={faTimes} className="me-2" />
          Close
        </Button>
        <Button variant="primary" onClick={refresh} disabled={loading}>
          <FontAwesomeIcon icon={faRefresh} className="me-2" />
          Refresh Reviews
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReviewModal;
