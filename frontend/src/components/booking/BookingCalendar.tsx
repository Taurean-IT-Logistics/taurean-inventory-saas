import { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  faPlus,
  faEdit,
  faDownload,
  faSyncAlt,
  faTrash,
  faCheck,
  faTimes,
  faCalendarCheck,
  faCalendarTimes
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Booking, Facility } from 'types';
import { currencyFormat } from 'helpers/utils';
import {
  Spinner,
  Card,
  Row,
  Col,
  Button,
  Badge,
  Form,
  Modal,
  Alert,
  Tabs,
  Tab
} from 'react-bootstrap';
import { useAppSelector } from 'hooks/useAppDispatch';
import { StateManagement } from 'lib';

interface BookingEvent {
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    booking: Partial<Booking>;
    facility: string | Facility;
  };
}

interface BookingCalendarProps {
  bookings: Booking[];
  facilities: Facility[];
  onRefresh?: () => void;
  onUpdateBooking?: (booking: Booking) => Promise<void>;
  onDeleteBooking?: (bookingId: string) => Promise<void>;
  onCreateBooking?: (booking: Partial<Booking>) => Promise<void>;
}

const BookingCalendar = ({
  bookings,
  facilities,
  onRefresh,
  onUpdateBooking,
  onDeleteBooking,
  onCreateBooking
}: BookingCalendarProps) => {
  const { user } = useAppSelector(
    (state: StateManagement.RootState) => state.auth
  );

  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [newBookingTitle, setNewBookingTitle] = useState<string>('');
  const [selectedDateRange, setSelectedDateRange] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [viewType, setViewType] = useState<
    'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'
  >('dayGridMonth');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterFacility, setFilterFacility] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const calendarRef = useRef<FullCalendar>(null);

  const [formData, setFormData] = useState<Partial<Booking>>({});

  useEffect(() => {
    loadBookings();
  }, [bookings]);

  useEffect(() => {
    loadBookings();
  }, [filterStatus, filterFacility]);

  useEffect(() => {
    loadBookings();
  }, [newBookingTitle, selectedDateRange]);

  const loadBookings = () => {
    try {
      if (!bookings || !Array.isArray(bookings)) {
        setEvents([]);
        setIsLoading(false);
        return;
      }

      const filtered = bookings
        .filter(b => filterStatus === 'all' || b.status === filterStatus)
        .filter(b => {
          if (filterFacility === 'all') return true;
          return b.facility && b.facility._id === filterFacility;
        })
        .map(b => ({
          title: `${b.facility?.name || 'Unknown Facility'} - ${
            b.user?.name || 'Unknown User'
          }`,
          start: b.startDate
            ? new Date(b.startDate).toISOString()
            : new Date().toISOString(),
          end: b.endDate
            ? new Date(b.endDate).toISOString()
            : new Date().toISOString(),
          backgroundColor: getStatusColor(b.status),
          borderColor: getStatusColor(b.status),
          extendedProps: {
            booking: b,
            facility: b.facility
          }
        }));

      setEvents(filtered);
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading bookings:', err);
      setError('Failed to load bookings');
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#198754';
      case 'pending':
        return '#ffc107';
      case 'cancelled':
        return '#dc3545';
      case 'completed':
        return '#0dcaf0';
      case 'no_show':
        return '#6c757d';
      default:
        return '#0d6efd';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
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

  const handleEventClick = (info: any) => {
    const booking = info.event.extendedProps.booking;
    if (booking) {
      setSelectedBooking(booking);
      setShowBookingModal(true);
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    setSelectedDateRange({
      start: selectInfo.startStr,
      end: selectInfo.endStr
    });
    setNewBookingTitle('');
    setFormData({
      startDate: new Date(selectInfo.startStr),
      endDate: new Date(selectInfo.endStr),
      status: 'pending',
      paymentStatus: 'pending',
      totalPrice: 0,
      duration: calculateDuration(selectInfo.startStr, selectInfo.endStr),
      notes: '',
      internalNotes: ''
    });
    setShowEditModal(true);
    setEditingBooking(null);
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setFormData({
      ...booking,
      startDate: new Date(booking.startDate),
      endDate: new Date(booking.endDate)
    });
    setShowBookingModal(false);
    setShowEditModal(true);
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
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
      loadBookings();
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
        setShowBookingModal(false);
        if (onRefresh) onRefresh();
        loadBookings();
      }
    } catch (err) {
      console.error('Error deleting booking:', err);
      setError('Failed to delete booking');
    } finally {
      setIsSaving(false);
    }
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
        loadBookings();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update booking status');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadBookings();
    setRefresh(false);
  }, [refresh]);

  return (
    <div className="min-vh-100">
      <div className="container-fluid py-4">
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <div className="d-flex justify-content-end align-items-center mb-4">
          <div className="d-flex gap-2">
            <Button
              variant="outline-primary"
              onClick={() => {
                setFormData({
                  startDate: new Date(),
                  endDate: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
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
              <FontAwesomeIcon icon={faPlus} className="me-2" /> New Booking
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => setRefresh(!refresh)}
            >
              <FontAwesomeIcon icon={faSyncAlt} className="me-2" /> Refresh
            </Button>
            <Button variant="outline-success">
              <FontAwesomeIcon icon={faDownload} className="me-2" /> Export
            </Button>
          </div>
        </div>

        <Card className="border-secondary mb-4">
          <Card.Body>
            <Row className="gap-3">
              <Col md={3}>
                <Form.Label className="text-muted small">View</Form.Label>
                <Form.Select
                  size="sm"
                  value={viewType}
                  onChange={e => setViewType(e.target.value as any)}
                >
                  <option value="dayGridMonth">Month</option>
                  <option value="timeGridWeek">Week</option>
                  <option value="timeGridDay">Day</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label className="text-muted small">Status</Form.Label>
                <Form.Select
                  size="sm"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label className="text-muted small">Facility</Form.Label>
                <Form.Select
                  size="sm"
                  value={filterFacility}
                  onChange={e => setFilterFacility(e.target.value)}
                >
                  <option value="all">All</option>
                  {facilities.map(f => (
                    <option key={f._id} value={f._id}>
                      {f.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3} className="d-flex flex-column gap-1">
                <Form.Label className="text-muted small">Stats</Form.Label>
                <div>
                  <Badge bg="success" className="me-2">
                    {
                      bookings.filter(
                        b =>
                          b &&
                          (b.status === 'confirmed' || b.status === 'completed')
                      ).length
                    }{' '}
                    Confirmed
                  </Badge>
                  <Badge bg="warning">
                    {bookings.filter(b => b && b.status === 'pending').length}{' '}
                    Pending
                  </Badge>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="border-secondary">
          <Card.Body>
            {isLoading ? (
              <div className="d-flex justify-content-center py-5">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center text-muted py-5">
                No bookings found for selected filters.
              </div>
            ) : (
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={viewType}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                events={events}
                eventClick={handleEventClick}
                selectable
                selectMirror
                select={handleDateSelect}
                height="auto"
                themeSystem="bootstrap5"
                dayMaxEvents={3}
                eventTimeFormat={{
                  hour: 'numeric',
                  minute: '2-digit',
                  meridiem: 'short'
                }}
              />
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Booking Details Modal */}
      <Modal
        show={showBookingModal}
        onHide={() => setShowBookingModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Booking Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="text-primary mb-0">
                  {selectedBooking.facility?.name || 'Unknown Facility'}
                </h5>
                <div className="d-flex gap-2">
                  <div className="d-flex flex-column gap-1">
                    <small className="fw-bold"> Booking Status</small>
                    <Badge bg={getStatusBadgeVariant(selectedBooking.status)}>
                      {selectedBooking.status}
                    </Badge>
                  </div>
                  <div className="d-flex flex-column gap-1">
                    <small className="fw-bold">Payment Status</small>
                    <Badge
                      bg={
                        selectedBooking.paymentStatus === 'completed'
                          ? 'success'
                          : 'warning'
                      }
                    >
                      {selectedBooking.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              <Tabs defaultActiveKey="details" className="mb-3">
                <Tab eventKey="details" title="Details">
                  <Row className="mb-3">
                    <Col md={6}>
                      <p>
                        <strong>Customer:</strong>{' '}
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

                  {selectedBooking.discount && (
                    <Alert variant="info">
                      <strong>Discount Applied:</strong>{' '}
                      {selectedBooking.discount.type === 'percentage'
                        ? `${selectedBooking.discount.value}%`
                        : currencyFormat(selectedBooking.discount.value)}
                      <br />
                      <strong>Reason:</strong> {selectedBooking.discount.reason}
                    </Alert>
                  )}

                  {selectedBooking.notes && (
                    <p>
                      <strong>Notes:</strong> {selectedBooking.notes}
                    </p>
                  )}

                  {selectedBooking.internalNotes && (
                    <p>
                      <strong>Internal Notes:</strong>{' '}
                      {selectedBooking.internalNotes}
                    </p>
                  )}
                </Tab>

                <Tab eventKey="checkin" title="Check-in/Out">
                  {selectedBooking.checkIn ? (
                    <Alert variant="success">
                      <strong>Checked In:</strong>{' '}
                      {new Date(selectedBooking.checkIn.time).toLocaleString()}
                      <br />
                      <strong>Verified By:</strong>{' '}
                      {selectedBooking.checkIn.verifiedBy?.name || 'N/A'}
                      {selectedBooking.checkIn.notes && (
                        <>
                          <br />
                          <strong>Notes:</strong>{' '}
                          {selectedBooking.checkIn.notes}
                        </>
                      )}
                    </Alert>
                  ) : (
                    <Alert variant="warning">Not checked in yet</Alert>
                  )}

                  {selectedBooking.checkOut ? (
                    <Alert variant="info">
                      <strong>Checked Out:</strong>{' '}
                      {new Date(selectedBooking.checkOut.time).toLocaleString()}
                      <br />
                      <strong>Verified By:</strong>{' '}
                      {selectedBooking.checkOut.verifiedBy?.name || 'N/A'}
                      <br />
                      <strong>Condition:</strong>{' '}
                      {selectedBooking.checkOut.condition}
                      {selectedBooking.checkOut.notes && (
                        <>
                          <br />
                          <strong>Notes:</strong>{' '}
                          {selectedBooking.checkOut.notes}
                        </>
                      )}
                      {selectedBooking.checkOut.damageReport && (
                        <>
                          <br />
                          <strong>Damage Report:</strong>{' '}
                          {selectedBooking.checkOut.damageReport}
                        </>
                      )}
                    </Alert>
                  ) : (
                    <Alert variant="warning">Not checked out yet</Alert>
                  )}
                </Tab>

                {selectedBooking.cancellation && (
                  <Tab eventKey="cancellation" title="Cancellation">
                    <Alert variant="danger">
                      <strong>Cancelled At:</strong>{' '}
                      {new Date(
                        selectedBooking.cancellation.cancelledAt
                      ).toLocaleString()}
                      <br />
                      <strong>Cancelled By:</strong>{' '}
                      {selectedBooking.cancellation.cancelledBy?.name || 'N/A'}
                      <br />
                      <strong>Reason:</strong>{' '}
                      {selectedBooking.cancellation.reason}
                      {selectedBooking.cancellation.refundAmount && (
                        <>
                          <br />
                          <strong>Refund Amount:</strong>{' '}
                          {currencyFormat(
                            selectedBooking.cancellation.refundAmount
                          )}
                        </>
                      )}
                    </Alert>
                  </Tab>
                )}
              </Tabs>

              {/* Quick Actions */}
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

                {selectedBooking.status === 'confirmed' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      handleStatusChange(selectedBooking, 'no_show')
                    }
                    disabled={isSaving}
                  >
                    <FontAwesomeIcon icon={faTimes} className="me-1" />
                    No Show
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
            onClick={() => setShowBookingModal(false)}
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
                  <Form.Label>Booking Status</Form.Label>
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

export default BookingCalendar;
