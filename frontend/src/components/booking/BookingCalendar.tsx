import { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  faPlus,
  faEdit,
  faDownload,
  faSyncAlt
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Booking, Facility } from 'types';
import { mockFacilities, mockBookings } from 'data';
import { currencyFormat } from 'helpers/utils';
import {
  Spinner,
  Card,
  Row,
  Col,
  Button,
  Badge,
  Form,
  Modal
} from 'react-bootstrap';

interface BookingEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    booking: Booking;
    facility: Facility;
  };
}

const BookingCalendar = () => {
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [viewType, setViewType] = useState<
    'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'
  >('dayGridMonth');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterFacility, setFilterFacility] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadBookings();
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    loadBookings();
  }, [filterStatus, filterFacility]);

  const loadBookings = () => {
    const filtered = mockBookings
      .filter(b => filterStatus === 'all' || b.status === filterStatus)
      .filter(
        b => filterFacility === 'all' || b.facility.name === filterFacility
      )
      .map(b => ({
        id: `booking-${b.createdAt.getTime()}`,
        title: `${b.facility.name} - ${b.user.name}`,
        start: b.startDate.toISOString(),
        end: b.endDate.toISOString(),
        backgroundColor: getStatusColor(b.status),
        borderColor: getStatusColor(b.status),
        extendedProps: {
          booking: b,
          facility: b.facility
        }
      }));

    setEvents(filtered);
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

  const handleEventClick = info => {
    setSelectedBooking(info.event.extendedProps.booking);
    setShowBookingModal(true);
  };

  const handleDateSelect = selectInfo => {
    const title = prompt('Enter booking title:');
    if (title) {
      const newBooking: BookingEvent = {
        id: `new-${new Date().getTime()}`,
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        backgroundColor: '#0d6efd',
        borderColor: '#0d6efd',
        extendedProps: {
          booking: {
            id: new Date().getTime().toString(),
            user: { name: 'New User', email: 'user@example.com' },
            facility: { name: 'New Facility' },
            startDate: new Date(selectInfo.startStr),
            endDate: new Date(selectInfo.endStr),
            duration: '1 hour',
            status: 'pending',
            paymentStatus: 'pending',
            totalPrice: 0,
            createdAt: new Date()
          },
          facility: { name: 'New Facility' }
        }
      };
      setEvents(prev => [...prev, newBooking]);
    }
  };

  const refreshCalendar = () => {
    setIsLoading(true);
    setTimeout(() => {
      loadBookings();
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="bmin-vh-100">
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 fw-bold">Booking Calendar</h1>
            <p className="text-muted">Manage facility bookings and schedules</p>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-primary">
              <FontAwesomeIcon icon={faPlus} className="me-2" /> New Booking
            </Button>
            <Button variant="outline-secondary" onClick={refreshCalendar}>
              <FontAwesomeIcon icon={faSyncAlt} className="me-2" /> Refresh
            </Button>
            <Button variant="outline-success">
              <FontAwesomeIcon icon={faDownload} className="me-2" /> Export
            </Button>
          </div>
        </div>

        <Card className="border-secondary mb-4">
          <Card.Body>
            <Row>
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
                  {mockFacilities.map((f, idx) => (
                    <option key={idx} value={f.name}>
                      {f.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3} className="d-flex flex-column gap-1">
                <Form.Label className="text-muted small">Stats</Form.Label>
                <div>
                  <Badge bg="success" className="me-2">
                    {mockBookings.filter(b => b.status === 'confirmed').length}{' '}
                    Confirmed
                  </Badge>
                  <Badge bg="warning">
                    {mockBookings.filter(b => b.status === 'pending').length}{' '}
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
              <h5 className="text-primary mb-3">
                {selectedBooking.facility.name}
              </h5>
              <Row className="mb-3">
                <Col md={6}>
                  <p>
                    <strong>Customer:</strong> {selectedBooking.user.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedBooking.user.email}
                  </p>
                  <p>
                    <strong>Status:</strong> {selectedBooking.status}
                  </p>
                  <p>
                    <strong>Payment Status:</strong>{' '}
                    {selectedBooking.paymentStatus}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Date:</strong>{' '}
                    {selectedBooking.startDate.toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Time:</strong>{' '}
                    {selectedBooking.startDate.toLocaleTimeString()} -{' '}
                    {selectedBooking.endDate.toLocaleTimeString()}
                  </p>
                  <p>
                    <strong>Duration:</strong> {selectedBooking.duration}
                  </p>
                  <p>
                    <strong>Total Price:</strong>{' '}
                    {currencyFormat(selectedBooking.totalPrice)}
                  </p>
                </Col>
              </Row>
              {selectedBooking.notes && (
                <p>
                  <strong>Notes:</strong> {selectedBooking.notes}
                </p>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-primary">
            <FontAwesomeIcon icon={faEdit} className="me-2" /> Edit Booking
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowBookingModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BookingCalendar;
