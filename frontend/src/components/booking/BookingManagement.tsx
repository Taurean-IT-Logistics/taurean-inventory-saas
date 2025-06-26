import { useState, useEffect } from 'react';
import {
  faSearch,
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faDownload,
  faCalendarAlt,
  faDollarSign,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Booking } from 'types';
import { mockBookings } from 'data';
import { currencyFormat } from 'helpers/utils';

const BookingManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setBookings(mockBookings);
      setFilteredBookings(mockBookings);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const filtered = bookings.filter(booking => {
      const matchesSearch =
        booking.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.facility.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        booking.user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || booking.status === statusFilter;
      const matchesPayment =
        paymentFilter === 'all' || booking.paymentStatus === paymentFilter;

      let matchesDate = true;
      if (dateFilter === 'today') {
        const today = new Date();
        matchesDate = booking.startDate.toDateString() === today.toDateString();
      } else if (dateFilter === 'week') {
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        matchesDate = booking.startDate <= weekFromNow;
      } else if (dateFilter === 'month') {
        const monthFromNow = new Date();
        monthFromNow.setMonth(monthFromNow.getMonth() + 1);
        matchesDate = booking.startDate <= monthFromNow;
      }

      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    });

    setFilteredBookings(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, paymentFilter, dateFilter, bookings]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return faCheckCircle;
      case 'pending':
        return faClock;
      case 'cancelled':
        return faTimesCircle;
      case 'completed':
        return faCheckCircle;
      case 'no_show':
        return faExclamationTriangle;
      default:
        return faClock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      case 'completed':
        return 'info';
      case 'no_show':
        return 'secondary';
      default:
        return 'primary';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
      case 'refunded':
        return 'info';
      case 'partial_refund':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = filteredBookings.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div
            className="spinner-border text-primary mb-3"
            style={{ width: '3rem', height: '3rem' }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="muted">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100">
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1">Booking Management</h1>
            <p className="text-muted mb-0">
              Manage all facility bookings and reservations
            </p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary">
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              New Booking
            </button>
            <button className="btn btn-outline-success">
              <FontAwesomeIcon icon={faDownload} className="me-2" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card bg-primary bg-opacity-10 border-primary">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon
                    icon={faCalendarAlt}
                    className="text-primary fs-3 me-3"
                  />
                  <div>
                    <h5 className="text-primary mb-0">{bookings.length}</h5>
                    <small className="text-muted-50">Total Bookings</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card bg-success bg-opacity-10 border-success">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-success fs-3 me-3"
                  />
                  <div>
                    <h5 className="text-success mb-0">
                      {bookings.filter(b => b.status === 'confirmed').length}
                    </h5>
                    <small className="text-muted">Confirmed</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card bg-warning bg-opacity-10 border-warning">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon
                    icon={faClock}
                    className="text-warning fs-3 me-3"
                  />
                  <div>
                    <h5 className="text-warning mb-0">
                      {bookings.filter(b => b.status === 'pending').length}
                    </h5>
                    <small className="text-muted">Pending</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card bg-info bg-opacity-10 border-info">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon
                    icon={faDollarSign}
                    className="text-info fs-3 me-3"
                  />
                  <div>
                    <h5 className="text-info mb-0">
                      {currencyFormat(
                        bookings.reduce((sum, b) => sum + b.totalPrice, 0)
                      )}
                    </h5>
                    <small className="text-muted">Total Revenue</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card border-secondary mb-4">
          <div className="card-body p-3">
            <div className="row align-items-center">
              <div className="col-md-3 mb-2">
                <div className="input-group">
                  <span className="input-group-text  border-secondary text-muted">
                    <FontAwesomeIcon icon={faSearch} />
                  </span>
                  <input
                    type="text"
                    className="form-control  border-secondary "
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-2 mb-2">
                <select
                  className="form-select  border-secondary "
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </select>
              </div>
              <div className="col-md-2 mb-2">
                <select
                  className="form-select  border-secondary "
                  value={paymentFilter}
                  onChange={e => setPaymentFilter(e.target.value)}
                >
                  <option value="all">All Payments</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <div className="col-md-2 mb-2">
                <select
                  className="form-select  border-secondary "
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
              <div className="col-md-3 mb-2">
                <div className="text-muted small">
                  Showing {filteredBookings.length} of {bookings.length}{' '}
                  bookings
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="card  border-secondary">
          <div className="card-body px-2">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Facility</th>
                    <th>Date & Time</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBookings.map((booking, index) => (
                    <tr key={index}>
                      <td>
                        <span className="text-primary fw-semibold">
                          #{booking.createdAt.getTime().toString().slice(-6)}
                        </span>
                      </td>
                      <td>
                        <div>
                          <div className=" fw-semibold">
                            {booking.user.name}
                          </div>
                          <small className="text-muted">
                            {booking.user.email}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div className="">{booking.facility.name}</div>
                      </td>
                      <td>
                        <div>
                          <div className="">
                            {booking.startDate.toLocaleDateString()}
                          </div>
                          <small className="text-muted">
                            {booking.startDate.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}{' '}
                            -
                            {booking.endDate.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </small>
                        </div>
                      </td>
                      <td>
                        <span className="">{booking.duration}</span>
                      </td>
                      <td>
                        <span
                          className={`badge bg-${getStatusColor(
                            booking.status
                          )} d-flex align-items-center`}
                        >
                          <FontAwesomeIcon
                            icon={getStatusIcon(booking.status)}
                            className="me-1"
                          />
                          {booking.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge bg-${getPaymentStatusColor(
                            booking.paymentStatus
                          )}`}
                        >
                          {booking.paymentStatus.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className=" fw-bold">
                          {currencyFormat(booking.totalPrice)}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleViewDetails(booking)}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button className="btn btn-outline-warning btn-sm">
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button className="btn btn-outline-danger btn-sm">
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center p-3 border-top border-secondary">
                <div className="text-muted small">
                  Showing {indexOfFirstItem + 1} to{' '}
                  {Math.min(indexOfLastItem, filteredBookings.length)} of{' '}
                  {filteredBookings.length} entries
                </div>
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li
                      className={`page-item ${
                        currentPage === 1 ? 'disabled' : ''
                      }`}
                    >
                      <button
                        className="page-link  border-secondary "
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => (
                      <li
                        key={i}
                        className={`page-item ${
                          currentPage === i + 1 ? 'active' : ''
                        }`}
                      >
                        <button
                          className="page-link  border-secondary "
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li
                      className={`page-item ${
                        currentPage === totalPages ? 'disabled' : ''
                      }`}
                    >
                      <button
                        className="page-link  border-secondary "
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content  border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title ">
                  Booking Details - #
                  {selectedBooking.createdAt.getTime().toString().slice(-6)}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowDetailsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="text-primary mb-3">Customer Information</h6>
                    <div className="mb-2">
                      <small className="text-muted">Name:</small>
                      <div className="">{selectedBooking.user.name}</div>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Email:</small>
                      <div className="">{selectedBooking.user.email}</div>
                    </div>
                    {selectedBooking.user.phone && (
                      <div className="mb-2">
                        <small className="text-muted">Phone:</small>
                        <div className="">{selectedBooking.user.phone}</div>
                      </div>
                    )}
                    <div className="mb-2">
                      <small className="text-muted">Customer Since:</small>
                      <div className="">
                        {selectedBooking.user.createdAt?.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-primary mb-3">Booking Information</h6>
                    <div className="mb-2">
                      <small className="text-muted">Facility:</small>
                      <div className="">{selectedBooking.facility.name}</div>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Location:</small>
                      <div className="">
                        {selectedBooking.facility.location.address}
                      </div>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Date & Time:</small>
                      <div className="">
                        {selectedBooking.startDate.toLocaleDateString()} <br />
                        {selectedBooking.startDate.toLocaleTimeString()} -{' '}
                        {selectedBooking.endDate.toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Duration:</small>
                      <div className="">{selectedBooking.duration}</div>
                    </div>
                  </div>
                </div>

                <hr className="border-secondary" />

                <div className="row">
                  <div className="col-md-6">
                    <h6 className="text-primary mb-3">Status & Payment</h6>
                    <div className="mb-2">
                      <small className="text-muted">Booking Status:</small>
                      <div>
                        <span
                          className={`badge bg-${getStatusColor(
                            selectedBooking.status
                          )}`}
                        >
                          {selectedBooking.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Payment Status:</small>
                      <div>
                        <span
                          className={`badge bg-${getPaymentStatusColor(
                            selectedBooking.paymentStatus
                          )}`}
                        >
                          {selectedBooking.paymentStatus.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Total Amount:</small>
                      <div className=" fw-bold fs-5">
                        {currencyFormat(selectedBooking.totalPrice)}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-primary mb-3">Timeline</h6>
                    <div className="mb-2">
                      <small className="text-muted">Booking Created:</small>
                      <div className="">
                        {selectedBooking.createdAt.toLocaleString()}
                      </div>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Last Updated:</small>
                      <div className="">
                        {selectedBooking.updatedAt.toLocaleString()}
                      </div>
                    </div>
                    {selectedBooking.checkIn && (
                      <div className="mb-2">
                        <small className="text-muted">Check-in:</small>
                        <div className="">
                          {selectedBooking.checkIn.time.toLocaleString()}
                        </div>
                        <small className="text-success">
                          Verified by {selectedBooking.checkIn.verifiedBy.name}
                        </small>
                      </div>
                    )}
                    {selectedBooking.checkOut && (
                      <div className="mb-2">
                        <small className="text-muted">Check-out:</small>
                        <div className="">
                          {selectedBooking.checkOut.time.toLocaleString()}
                        </div>
                        <small className="text-success">
                          Condition:{' '}
                          {selectedBooking.checkOut.condition.toUpperCase()}
                        </small>
                      </div>
                    )}
                  </div>
                </div>

                {selectedBooking.notes && (
                  <>
                    <hr className="border-secondary" />
                    <div>
                      <h6 className="text-primary mb-2">Customer Notes</h6>
                      <p className="text-muted">{selectedBooking.notes}</p>
                    </div>
                  </>
                )}

                {selectedBooking.cancellation && (
                  <>
                    <hr className="border-secondary" />
                    <div>
                      <h6 className="text-danger mb-2">Cancellation Details</h6>
                      <div className="mb-2">
                        <small className="text-muted">Reason:</small>
                        <div className="">
                          {selectedBooking.cancellation.reason}
                        </div>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted">Cancelled By:</small>
                        <div className="">
                          {selectedBooking.cancellation.cancelledBy.name}
                        </div>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted">Cancelled At:</small>
                        <div className="">
                          {selectedBooking.cancellation.cancelledAt.toLocaleString()}
                        </div>
                      </div>
                      {selectedBooking.cancellation.refundAmount && (
                        <div className="mb-2">
                          <small className="text-muted">Refund Amount:</small>
                          <div className="text-success fw-bold">
                            {currencyFormat(
                              selectedBooking.cancellation.refundAmount
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer border-secondary">
                <button className="btn btn-outline-primary">
                  <FontAwesomeIcon icon={faEdit} className="me-2" />
                  Edit Booking
                </button>
                <button className="btn btn-outline-success">
                  <FontAwesomeIcon icon={faDownload} className="me-2" />
                  Download Invoice
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
