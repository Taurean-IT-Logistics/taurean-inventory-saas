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
  faExclamationTriangle,
  faCheck,
  faCalendarCheck,
  faCalendarTimes
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Card,
  Button,
  Spinner,
  Row,
  Col,
  Form,
  Modal,
  Alert,
  Table,
  Badge,
  Tabs,
  Tab
} from 'react-bootstrap';
import { Booking, Facility } from 'types';
import { currencyFormat } from 'helpers/utils';
import { useAppSelector } from 'hooks/useAppDispatch';
import { StateManagement } from 'lib';

interface BookingManagementProps {
  bookings: Booking[];
  facilities: Facility[];
  onRefresh?: () => void;
  onUpdateBooking?: (booking: Booking) => Promise<void>;
  onDeleteBooking?: (bookingId: string) => Promise<void>;
  onCreateBooking?: (booking: Partial<Booking>) => Promise<void>;
}

const BookingManagement = ({
  bookings,
  facilities,
  onRefresh,
  onUpdateBooking,
  onDeleteBooking,
  onCreateBooking
}: BookingManagementProps) => {
  const { user } = useAppSelector(
    (state: StateManagement.RootState) => state.auth
  );

  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState<Partial<Booking>>({});

  useEffect(() => {
    const filtered = bookings.filter(booking => {
      if (!booking || booking.isDeleted) return false;

      const matchesSearch =
        booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.facility?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || booking.status === statusFilter;
      const matchesPayment =
        paymentFilter === 'all' || booking.paymentStatus === paymentFilter;

      let matchesDate = true;
      if (dateFilter === 'today') {
        const today = new Date();
        matchesDate =
          new Date(booking.startDate).toDateString() === today.toDateString();
      } else if (dateFilter === 'week') {
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        matchesDate = new Date(booking.startDate) <= weekFromNow;
      } else if (dateFilter === 'month') {
        const monthFromNow = new Date();
        monthFromNow.setMonth(monthFromNow.getMonth() + 1);
        matchesDate = new Date(booking.startDate) <= monthFromNow;
      }

      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    });

    setFilteredBookings(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, paymentFilter, dateFilter, bookings]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return faCheckCircle;
      case 'pending':
        return faClock;
      case 'cancelled':
        return faTimesCircle;
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

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setFormData({
      ...booking,
      startDate: new Date(booking.startDate),
      endDate: new Date(booking.endDate)
    });
    setShowDetailsModal(false);
    setShowEditModal(true);
  };

  const handleStatusChange = async (booking: Booking, newStatus: string) => {
    setIsSaving(true);
    try {
      const updatedBooking = {
        ...booking,
        status: newStatus as Booking['status'],
        updatedAt: new Date()
      };

      if (onUpdateBooking) {
        await onUpdateBooking(updatedBooking);
        setSelectedBooking(updatedBooking);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update booking status');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBooking = async () => {
    if (!formData.facility || !formData.startDate || !formData.endDate) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const bookingData = {
        ...formData,
        user: formData.user || user,
        duration: calculateDuration(
          formData.startDate.toISOString(),
          formData.endDate.toISOString()
        )
      };

      if (editingBooking) {
        if (onUpdateBooking) {
          await onUpdateBooking({
            ...editingBooking,
            ...bookingData
          } as Booking);
          if (onRefresh) onRefresh();
        }
      } else {
        // Create new booking
        if (onCreateBooking) {
          await onCreateBooking({
            ...bookingData,
            createdAt: new Date(),
            isDeleted: false
          });
          if (onRefresh) onRefresh();
        }
      }

      setShowEditModal(false);
      setFormData({});
      setEditingBooking(null);
    } catch (err) {
      console.error('Error saving booking:', err);
      setError('Failed to save booking');
    } finally {
      setIsSaving(false);
    }
  };
  const handleDeleteBooking = async (booking: Booking) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) {
      return;
    }

    setIsSaving(true);
    try {
      if (onDeleteBooking && booking._id) {
        await onDeleteBooking(booking._id);
        setShowDetailsModal(false);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Error deleting booking:', err);
      setError('Failed to delete booking');
    } finally {
      setIsSaving(false);
    }
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  };

  return (
    <div className="min-vh-100">
      <div className="container-fluid py-4">
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1">Booking Management</h1>
            <p className="text-muted mb-0">
              Manage all facility bookings and reservations
            </p>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="primary"
              onClick={() => {
                setFormData({
                  startDate: new Date(),
                  endDate: new Date(Date.now() + 60 * 60 * 1000),
                  status: 'pending',
                  paymentStatus: 'pending',
                  totalPrice: 0,
                  duration: '1 hour',
                  notes: '',
                  internalNotes: ''
                });
                setEditingBooking(null);
                setShowEditModal(true);
              }}
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              New Booking
            </Button>
            <Button variant="outline-success">
              <FontAwesomeIcon icon={faDownload} className="me-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="bg-primary bg-opacity-10 border-primary">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon
                    icon={faCalendarAlt}
                    className="text-primary fs-3 me-3"
                  />
                  <div>
                    <h5 className="text-primary mb-0">{bookings.length}</h5>
                    <small className="text-muted">Total Bookings</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="bg-success bg-opacity-10 border-success">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-success fs-3 me-3"
                  />
                  <div>
                    <h5 className="text-success mb-0">
                      {
                        bookings.filter(
                          b =>
                            b &&
                            (b.status === 'confirmed' ||
                              b.status === 'completed')
                        ).length
                      }
                    </h5>
                    <small className="text-muted">Confirmed</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="bg-warning bg-opacity-10 border-warning">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon
                    icon={faClock}
                    className="text-warning fs-3 me-3"
                  />
                  <div>
                    <h5 className="text-warning mb-0">
                      {bookings.filter(b => b && b.status === 'pending').length}
                    </h5>
                    <small className="text-muted">Pending</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="bg-info bg-opacity-10 border-info">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon
                    icon={faDollarSign}
                    className="text-info fs-3 me-3"
                  />
                  <div>
                    <h5 className="text-info mb-0">
                      {currencyFormat(
                        bookings.reduce((sum, b) => {
                          if (
                            b?.status === 'confirmed' ||
                            b?.status === 'completed'
                          ) {
                            return sum + (b.totalPrice || 0);
                          }
                          return sum;
                        }, 0)
                      )}
                    </h5>
                    <small className="text-muted">Total Revenue</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="border-secondary mb-4">
          <Card.Body className="p-3">
            <Row className="align-items-center">
              <Col md={3} className="mb-2">
                <div className="input-group">
                  <span className="input-group-text border-secondary text-muted">
                    <FontAwesomeIcon icon={faSearch} />
                  </span>
                  <Form.Control
                    type="text"
                    className="border-secondary"
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </Col>
              <Col md={2} className="mb-2">
                <Form.Select
                  className="border-secondary"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </Form.Select>
              </Col>
              <Col md={2} className="mb-2">
                <Form.Select
                  className="border-secondary"
                  value={paymentFilter}
                  onChange={e => setPaymentFilter(e.target.value)}
                >
                  <option value="all">All Payments</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </Form.Select>
              </Col>
              <Col md={2} className="mb-2">
                <Form.Select
                  className="border-secondary"
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </Form.Select>
              </Col>
              <Col md={3} className="mb-2">
                <div className="text-muted small">
                  Showing {filteredBookings.length} of {bookings.length}{' '}
                  bookings
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Bookings Table */}
        <Card className="border-secondary">
          <Card.Body className="px-2">
            <div className="table-responsive">
              <Table hover className="mb-0">
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
                          #
                          {booking.createdAt
                            ? new Date(booking.createdAt)
                                .getTime()
                                .toString()
                                .slice(-6)
                            : 'N/A'}
                        </span>
                      </td>
                      <td>
                        <div>
                          <div className="fw-semibold">
                            {booking.user?.name || 'N/A'}
                          </div>
                          <small className="text-muted">
                            {booking.user?.email || 'N/A'}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div>{booking.facility?.name || 'N/A'}</div>
                      </td>
                      <td>
                        <div>
                          <div>
                            {booking.startDate
                              ? new Date(booking.startDate).toLocaleDateString()
                              : 'N/A'}
                          </div>
                          <small className="text-muted">
                            {booking.startDate
                              ? new Date(booking.startDate).toLocaleTimeString(
                                  [],
                                  {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }
                                )
                              : ''}{' '}
                            -{' '}
                            {booking.endDate
                              ? new Date(booking.endDate).toLocaleTimeString(
                                  [],
                                  {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }
                                )
                              : ''}
                          </small>
                        </div>
                      </td>
                      <td>
                        <span>{booking.duration || 'N/A'}</span>
                      </td>
                      <td>
                        <Badge
                          bg={getStatusColor(booking.status)}
                          className="d-flex align-items-center"
                        >
                          <FontAwesomeIcon
                            icon={getStatusIcon(booking.status)}
                            className="me-1"
                          />
                          {booking.status?.toUpperCase() || 'N/A'}
                        </Badge>
                      </td>
                      <td>
                        <Badge
                          bg={getPaymentStatusColor(booking.paymentStatus)}
                        >
                          {booking.paymentStatus?.toUpperCase() || 'N/A'}
                        </Badge>
                      </td>
                      <td>
                        <span className="fw-bold">
                          {currencyFormat(booking.totalPrice || 0)}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleViewDetails(booking)}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </Button>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => handleEditBooking(booking)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteBooking(booking)}
                            disabled={isSaving}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
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
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => (
                      <li
                        key={i}
                        className={`page-item ${
                          currentPage === i + 1 ? 'active' : ''
                        }`}
                      >
                        <Button
                          variant={
                            currentPage === i + 1
                              ? 'primary'
                              : 'outline-secondary'
                          }
                          size="sm"
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      </li>
                    ))}
                    <li
                      className={`page-item ${
                        currentPage === totalPages ? 'disabled' : ''
                      }`}
                    >
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Booking Details Modal */}
      <Modal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        centered
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Booking Details - #
            {selectedBooking?.createdAt
              ? new Date(selectedBooking.createdAt)
                  .getTime()
                  .toString()
                  .slice(-6)
              : 'N/A'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <>
              <Tabs defaultActiveKey="details" className="mb-3">
                <Tab eventKey="details" title="Details">
                  <Row className="mb-3">
                    <Col md={6}>
                      <h6 className="text-primary mb-3">
                        Customer Information
                      </h6>
                      <p>
                        <strong>Name:</strong>{' '}
                        {selectedBooking.user?.name || 'N/A'}
                      </p>
                      <p>
                        <strong>Email:</strong>{' '}
                        {selectedBooking.user?.email || 'N/A'}
                      </p>
                      <p>
                        <strong>Phone:</strong>{' '}
                        {selectedBooking.user?.phone || 'N/A'}
                      </p>
                      <p>
                        <strong>Duration:</strong>{' '}
                        {selectedBooking.duration || 'N/A'}
                      </p>
                    </Col>
                    <Col md={6}>
                      <h6 className="text-primary mb-3">Booking Information</h6>
                      <p>
                        <strong>Facility:</strong>{' '}
                        {selectedBooking.facility?.name || 'N/A'}
                      </p>
                      <p>
                        <strong>Date:</strong>{' '}
                        {selectedBooking.startDate
                          ? new Date(
                              selectedBooking.startDate
                            ).toLocaleDateString()
                          : 'N/A'}
                      </p>
                      <p>
                        <strong>Start Time:</strong>{' '}
                        {selectedBooking.startDate
                          ? new Date(
                              selectedBooking.startDate
                            ).toLocaleTimeString()
                          : 'N/A'}
                      </p>
                      <p>
                        <strong>End Time:</strong>{' '}
                        {selectedBooking.endDate
                          ? new Date(
                              selectedBooking.endDate
                            ).toLocaleTimeString()
                          : 'N/A'}
                      </p>
                      <p>
                        <strong>Total Price:</strong>{' '}
                        {currencyFormat(selectedBooking.totalPrice || 0)}
                      </p>
                    </Col>
                  </Row>

                  {selectedBooking.notes && (
                    <p>
                      <strong>Notes:</strong> {selectedBooking.notes}
                    </p>
                  )}
                </Tab>
              </Tabs>

              <div className="d-flex gap-2 flex-wrap">
                {selectedBooking.status === 'pending' && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() =>
                      handleStatusChange(selectedBooking, 'confirmed')
                    }
                    disabled={isSaving}
                  >
                    <FontAwesomeIcon icon={faCheck} className="me-1" />
                    Confirm
                  </Button>
                )}

                {selectedBooking.status === 'confirmed' && (
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() =>
                      handleStatusChange(selectedBooking, 'completed')
                    }
                    disabled={isSaving}
                  >
                    <FontAwesomeIcon icon={faCalendarCheck} className="me-1" />
                    Complete
                  </Button>
                )}

                {['pending', 'confirmed'].includes(selectedBooking.status) && (
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() =>
                      handleStatusChange(selectedBooking, 'cancelled')
                    }
                    disabled={isSaving}
                  >
                    <FontAwesomeIcon icon={faCalendarTimes} className="me-1" />
                    Cancel
                  </Button>
                )}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-primary"
            onClick={() =>
              selectedBooking && handleEditBooking(selectedBooking)
            }
          >
            <FontAwesomeIcon icon={faEdit} className="me-2" /> Edit
          </Button>
          <Button
            variant="outline-danger"
            onClick={() =>
              selectedBooking && handleDeleteBooking(selectedBooking)
            }
            disabled={isSaving}
          >
            <FontAwesomeIcon icon={faTrash} className="me-2" /> Delete
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowDetailsModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit/Create Booking Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingBooking ? 'Edit Booking' : 'New Booking'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Facility *</Form.Label>
                  <Form.Select
                    value={formData.facility?.name || ''}
                    onChange={e => {
                      const selectedFacility = facilities.find(
                        f => f.name === e.target.value
                      );
                      setFormData(prev => ({
                        ...prev,
                        facility: selectedFacility
                      }));
                    }}
                    required
                  >
                    <option value="">Select a facility</option>
                    {facilities.map(facility => (
                      <option key={facility._id} value={facility.name}>
                        {facility.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.status || 'pending'}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        status: e.target.value as Booking['status']
                      }))
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no_show">No Show</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date & Time *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={
                      formData.startDate
                        ? new Date(
                            formData.startDate.getTime() -
                              formData.startDate.getTimezoneOffset() * 60000
                          )
                            .toISOString()
                            .slice(0, 16)
                        : ''
                    }
                    onChange={e => {
                      const date = new Date(e.target.value);
                      setFormData(prev => ({ ...prev, startDate: date }));
                    }}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date & Time *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={
                      formData.endDate
                        ? new Date(
                            formData.endDate.getTime() -
                              formData.endDate.getTimezoneOffset() * 60000
                          )
                            .toISOString()
                            .slice(0, 16)
                        : ''
                    }
                    onChange={e => {
                      const date = new Date(e.target.value);
                      setFormData(prev => ({ ...prev, endDate: date }));
                    }}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Payment Status</Form.Label>
                  <Form.Select
                    value={formData.paymentStatus || 'pending'}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        paymentStatus: e.target
                          .value as Booking['paymentStatus']
                      }))
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                    <option value="partial_refund">Partial Refund</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Total Price</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.totalPrice || 0}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        totalPrice: parseFloat(e.target.value) || 0
                      }))
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.notes || ''}
                onChange={e =>
                  setFormData(prev => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Customer notes..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Internal Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.internalNotes || ''}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    internalNotes: e.target.value
                  }))
                }
                placeholder="Internal staff notes..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={handleSaveBooking}
            disabled={
              isSaving ||
              !formData.facility ||
              !formData.startDate ||
              !formData.endDate
            }
          >
            {isSaving ? <Spinner size="sm" className="me-2" /> : null}
            {editingBooking ? 'Update' : 'Create'} Booking
          </Button>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BookingManagement;
