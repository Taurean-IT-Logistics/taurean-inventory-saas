import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  faFilePdf,
  faImage,
  faPrint,
  faArrowLeft,
  faCalendarAlt,
  faMapMarkerAlt,
  faUsers,
  faClock,
  faCheckCircle,
  faExclamationTriangle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Booking, Transaction } from 'types';
import { mockFacilities } from 'data';
import logo from 'assets/img/logo.png';
import { currencyFormat } from 'helpers/utils';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Badge,
  Table
} from 'react-bootstrap';
import { useAppContext } from 'providers/AppProvider';

interface UserInvoiceData {
  invoiceNumber: string;
  booking: Booking;
  transaction: Transaction;
  issueDate: Date;
  dueDate: Date;
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    logo?: string;
  };
}

// Status Banner Component
const StatusBanner = ({ booking }: { booking: Booking }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'confirmed':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
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
      default:
        return 'secondary';
    }
  };

  return (
    <Row className="mb-4">
      <Col>
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={3}>
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon
                    icon={
                      booking.status === 'confirmed'
                        ? faCheckCircle
                        : faExclamationTriangle
                    }
                    className={`text-${getStatusColor(booking.status)} me-2`}
                  />
                  <div>
                    <small className="text-muted">Booking Status</small>
                    <div
                      className={`fw-semibold text-${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status?.toUpperCase()}
                    </div>
                  </div>
                </div>
              </Col>
              <Col md={3}>
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon
                    icon={
                      booking.paymentStatus === 'completed'
                        ? faCheckCircle
                        : faExclamationTriangle
                    }
                    className={`text-${getPaymentStatusColor(
                      booking.paymentStatus
                    )} me-2`}
                  />
                  <div>
                    <small className="text-muted">Payment Status</small>
                    <div
                      className={`fw-semibold text-${getPaymentStatusColor(
                        booking.paymentStatus
                      )}`}
                    >
                      {booking.paymentStatus?.toUpperCase()}
                    </div>
                  </div>
                </div>
              </Col>
              <Col md={3}>
                <div>
                  <small className="text-muted">Total Amount</small>
                  <div className="fw-bold text-dark fs-5">
                    {currencyFormat(booking.totalPrice)}
                  </div>
                </div>
              </Col>
              <Col md={3}>
                <div>
                  <small className="text-muted">Booking Date</small>
                  <div className="fw-semibold text-dark">
                    {booking.startDate?.toLocaleDateString()}
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

// Booking Details Card
const BookingDetailsCard = ({ booking }: { booking: Booking }) => (
  <Card className="border-0 shadow-sm h-100">
    <Card.Header>
      <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
      Booking Details
    </Card.Header>
    <Card.Body>
      <div className="d-flex mb-3">
        <img
          src={
            booking.facility.images[0]?.path ||
            '/placeholder.svg?height=80&width=120'
          }
          alt={booking.facility.name}
          className="rounded me-3"
          style={{ width: '120px', height: '80px', objectFit: 'cover' }}
        />
        <div>
          <h6 className="fw-bold mb-1">{booking.facility.name}</h6>
          <div className="text-muted small mb-1">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
            {booking.facility.location.address}
          </div>
          <div className="text-muted small mb-1">
            <FontAwesomeIcon icon={faUsers} className="me-1" />
            Capacity: {booking.facility.capacity.maximum} guests
          </div>
          <div className="text-muted small">
            <FontAwesomeIcon icon={faClock} className="me-1" />
            {booking.duration}
          </div>
        </div>
      </div>
      <div className="border-top pt-3">
        <Row>
          <Col xs={6}>
            <small className="text-muted">Start Time</small>
            <div className="fw-semibold">
              {booking.startDate?.toLocaleString()}
            </div>
          </Col>
          <Col xs={6}>
            <small className="text-muted">End Time</small>
            <div className="fw-semibold">
              {booking.endDate?.toLocaleString()}
            </div>
          </Col>
        </Row>
      </div>
      {booking.notes && (
        <div className="border-top pt-3 mt-3">
          <small className="text-muted">Special Requests</small>
          <div className="text-dark">{booking.notes}</div>
        </div>
      )}
    </Card.Body>
  </Card>
);

// Payment Info Card
const PaymentInfoCard = ({
  transaction,
  paymentStatus
}: {
  transaction: Transaction;
  paymentStatus: string;
}) => {
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
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Header className="bg-success text-white">
        <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
        Payment Information
      </Card.Header>
      <Card.Body>
        <div className="mb-3">
          <Row>
            <Col xs={6}>
              <small className="text-muted">Payment Method</small>
              <div className="fw-semibold text-capitalize">
                {transaction.method}
              </div>
            </Col>
            <Col xs={6}>
              <small className="text-muted">Transaction ID</small>
              <div className="fw-semibold font-monospace">
                {transaction.ref}
              </div>
            </Col>
          </Row>
        </div>
        <div className="mb-3">
          <Row>
            <Col xs={6}>
              <small className="text-muted">Payment Date</small>
              <div className="fw-semibold">
                {transaction.createdAt?.toLocaleDateString()}
              </div>
            </Col>
            <Col xs={6}>
              <small className="text-muted">Amount Paid</small>
              <div className="fw-bold text-success fs-5">
                {currencyFormat(transaction.amount)}
              </div>
            </Col>
          </Row>
        </div>
        {transaction.paymentDetails?.paystackReference && (
          <div className="border-top pt-3">
            <small className="text-muted">Paystack Reference</small>
            <div className="fw-semibold font-monospace">
              {transaction.paymentDetails.paystackReference}
            </div>
          </div>
        )}
        <div className="border-top pt-3 mt-3">
          <div className="d-flex align-items-center justify-content-between">
            <span className="text-muted">Status</span>
            <Badge bg={getPaymentStatusColor(paymentStatus)} className="fs-6">
              {paymentStatus?.toUpperCase()}
            </Badge>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

// Help Section
const HelpSection = ({
  companyInfo
}: {
  companyInfo: UserInvoiceData['companyInfo'];
}) => (
  <Card className="border-0 shadow-sm">
    <Card.Body className="p-4 text-center">
      <h5 className="text-dark mb-3">Need Help?</h5>
      <p className="text-muted mb-3">
        If you have any questions about this invoice or your booking, our
        support team is here to help.
      </p>
      <div className="d-flex justify-content-center gap-3">
        <a
          href={`mailto:${companyInfo.email}`}
          className="btn btn-outline-primary"
        >
          Email Support
        </a>
        <a
          href={`tel:${companyInfo.phone}`}
          className="btn btn-outline-secondary"
        >
          Call Us
        </a>
      </div>
    </Card.Body>
  </Card>
);

// Invoice Template
const UserInvoiceTemplate = ({ invoice }: { invoice: UserInvoiceData }) => {
  const subtotal = invoice.booking.totalPrice * 0.85;
  const serviceFee = invoice.booking.totalPrice * 0.1;
  const tax = invoice.booking.totalPrice * 0.05;

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <img
            src={logo}
            alt={invoice.companyInfo.name}
            style={{ height: '60px', marginBottom: '15px' }}
          />
          <h2 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>
            {invoice.companyInfo.name}
          </h2>
          <div
            style={{ color: '#7f8c8d', fontSize: '14px', lineHeight: '1.6' }}
          >
            <div>{invoice.companyInfo.address}</div>
            <div>{invoice.companyInfo.phone}</div>
            <div>{invoice.companyInfo.email}</div>
            <div>{invoice.companyInfo.website}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h1
            style={{ color: '#e74c3c', margin: '0 0 15px 0', fontSize: '36px' }}
          >
            INVOICE
          </h1>
          <div
            style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#2c3e50'
            }}
          >
            {invoice.invoiceNumber}
          </div>
          <div
            style={{ color: '#7f8c8d', fontSize: '14px', lineHeight: '1.6' }}
          >
            <div>
              <strong>Issue Date:</strong>{' '}
              {invoice.issueDate?.toLocaleDateString()}
            </div>
            <div>
              <strong>Due Date:</strong> {invoice.dueDate?.toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
      {/* Customer and Booking Info */}
      <Row className="mb-4">
        <Col md={6} className="mb-4">
          <div>
            <h4>Bill To:</h4>
            <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                {invoice.booking.user.name}
              </div>
              <div style={{ marginBottom: '3px' }}>
                {invoice.booking.user.email}
              </div>
              <div>{invoice.booking.user.phone}</div>
            </div>
          </div>
        </Col>
        <Col md={6}>
          <div>
            <h4 className="text-info">Booking Summary:</h4>
            <div
              style={{ fontSize: '14px', lineHeight: '1.6', color: '#424242' }}
            >
              <div>
                <strong>Date:</strong>{' '}
                {invoice.booking.startDate?.toLocaleDateString()}
              </div>
              <div>
                <strong>Time:</strong>{' '}
                {invoice.booking.startDate?.toLocaleTimeString()} -{' '}
                {invoice.booking.endDate?.toLocaleTimeString()}
              </div>
              <div>
                <strong>Duration:</strong> {invoice.booking.duration}
              </div>
              <div>
                <strong>Status:</strong>{' '}
                <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                  {invoice.booking.status?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </Col>
      </Row>
      {/* Facility Information */}
      <div className="mb-4">
        <h4 className="text-info mb-2">Facility Booked:</h4>
        <div className="d-flex align-items-center">
          <img
            src={
              invoice.booking.facility.images[0]?.path ||
              '/placeholder.svg?height=100&width=150'
            }
            alt={invoice.booking.facility.name}
            style={{
              width: '300px',
              height: '250px',
              objectFit: 'cover',
              borderRadius: '8px',
              marginRight: '20px'
            }}
          />
          <div>
            <h5>{invoice.booking.facility.name}</h5>
            <div>
              <div className="mb-1">
                {invoice.booking.facility.location.address}
              </div>
              <div className="mb-1">
                Capacity: {invoice.booking.facility.capacity.maximum} guests
              </div>
              <div className="mb-1">
                Rating: {invoice.booking.facility.rating.average}/5 (
                {invoice.booking.facility.rating.totalReviews} reviews)
              </div>
              <div>
                Recommended: {invoice.booking.facility.capacity.recommended}{' '}
                guests
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Invoice Items Table */}
      <Table bordered hover responsive>
        <thead>
          <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
            <th>Description</th>
            <th className="text-center">Duration</th>
            <th className="text-end">Rate</th>
            <th className="text-end">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div
                style={{
                  fontWeight: 'bold',
                  fontSize: '16px',
                  marginBottom: '5px'
                }}
              >
                {invoice.booking.facility.name}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#7f8c8d',
                  marginBottom: '3px'
                }}
              >
                <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                {invoice.booking.startDate?.toLocaleDateString()} -{' '}
                {invoice.booking.endDate?.toLocaleDateString()}
              </div>
              <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                <FontAwesomeIcon icon={faClock} className="me-1" />
                {invoice.booking.startDate?.toLocaleTimeString()} -{' '}
                {invoice.booking.endDate?.toLocaleTimeString()}
              </div>
            </td>
            <td className="text-center">{invoice.booking.duration}</td>
            <td className="text-end">
              {currencyFormat(
                invoice.booking.facility.pricing.find(p => p.isDefault)
                  ?.amount || 0
              )}
              /
              {invoice.booking.facility.pricing.find(p => p.isDefault)?.unit ||
                'hour'}
            </td>
            <td className="text-end fw-bold">{currencyFormat(subtotal)}</td>
          </tr>
        </tbody>
      </Table>
      {/* Totals Section */}
      <Row>
        <Col md={6} className="mb-4">
          {invoice.booking.notes && (
            <div>
              <h5>Special Requests:</h5>
              <div>"{invoice.booking.notes}"</div>
            </div>
          )}
        </Col>
        <Col md={6}>
          <Table>
            <tbody>
              <tr>
                <td className="text-end fw-semibold">Subtotal:</td>
                <td className="text-end">{currencyFormat(subtotal)}</td>
              </tr>
              <tr>
                <td className="text-end fw-semibold">Service Fee:</td>
                <td className="text-end">{currencyFormat(serviceFee)}</td>
              </tr>
              <tr>
                <td className="text-end fw-semibold">Tax:</td>
                <td className="text-end">{currencyFormat(tax)}</td>
              </tr>
              <tr>
                <td className="text-end fw-bold">Total:</td>
                <td className="text-end fw-bold">
                  {currencyFormat(invoice.booking.totalPrice)}
                </td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
      {/* Payment Information */}
      <div>
        <h5
          style={{ color: '#2e7d32', marginBottom: '15px', fontSize: '18px' }}
        >
          <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
          Payment Confirmed
        </h5>
        <Row style={{ fontSize: '14px' }}>
          <Col md={6}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Payment Method:</strong>{' '}
              {invoice.transaction.method?.toUpperCase()}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Transaction ID: </strong>
              <span>{invoice.transaction.ref}</span>
            </div>
          </Col>
          <Col md={6}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Payment Date:</strong>{' '}
              {invoice.transaction.createdAt?.toLocaleDateString()}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Status:</strong>{' '}
              <span
                style={{
                  color: '#2e7d32',
                  fontWeight: 'bold',
                  backgroundColor: '#c8e6c9',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
              >
                {invoice.booking.paymentStatus?.toUpperCase()}
              </span>
            </div>
          </Col>
        </Row>
      </div>
      {/* Footer */}
      <div className="mt-8 border-top pt-4 text-center">
        <h4>Thank you for choosing {invoice.companyInfo.name}!</h4>
        <div className="mb-1">
          For questions about this invoice, please contact us at{' '}
          {invoice.companyInfo.email}
        </div>
        <div>
          Visit us online at {invoice.companyInfo.website} | Call us at{' '}
          {invoice.companyInfo.phone}
        </div>
      </div>
    </div>
  );
};

const UserInvoicePage = () => {
  const {
    config: { theme }
  } = useAppContext();
  const { transactionId } = useParams<{ transactionId: string }>();
  const [invoice, setInvoice] = useState<UserInvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'image' | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Mock invoice data - in real app, this would come from API
  const mockInvoice: UserInvoiceData = {
    invoiceNumber: transactionId || 'INV-2024-001',
    booking: {
      user: {
        _id: '1',
        name: 'John Smith',
        username: 'john.smith',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'hashed',
        role: 'user',
        cart: [],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      facility: mockFacilities[0],
      startDate: new Date('2024-12-25T09:00:00'),
      endDate: new Date('2024-12-25T17:00:00'),
      duration: '8 hours',
      status: 'confirmed',
      paymentStatus: 'completed',
      totalPrice: 1000,
      paymentDetails: {} as Transaction,
      notes: 'Corporate meeting setup required',
      isDeleted: false,
      createdAt: new Date('2024-12-20'),
      updatedAt: new Date('2024-12-20')
    },
    transaction: {
      user: {
        _id: '1',
        name: 'John Smith',
        username: 'john.smith',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'hashed',
        role: 'user',
        cart: [],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      type: 'booking_payment',
      category: 'facility_booking',
      amount: 1000,
      method: 'paystack',
      paymentDetails: {
        paystackReference: 'PSK_123456789'
      },
      ref: 'TXN_001',
      reconciled: true,
      facility: mockFacilities[0],
      description: 'Booking payment for Executive Conference Room Alpha',
      attachments: [],
      tags: ['booking', 'facility', 'payment'],
      isDeleted: false,
      createdAt: new Date('2024-12-20'),
      updatedAt: new Date('2024-12-20')
    },
    issueDate: new Date('2024-12-20'),
    dueDate: new Date('2024-12-25'),
    companyInfo: {
      name: 'Premium Facilities Co.',
      address: '123 Business District, Downtown Financial District',
      phone: '+1 (555) 123-4567',
      email: 'billing@premiumfacilities.com',
      website: 'www.premiumfacilities.com',
      logo: '/placeholder.svg?height=60&width=200'
    }
  };

  useEffect(() => {
    // Simulate loading invoice data
    const timer = setTimeout(() => {
      setInvoice(mockInvoice);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [transactionId]);

  const exportToPDF = async () => {
    if (!invoiceRef.current || !invoice) return;

    setIsExporting(true);
    setExportType('pdf');

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: invoiceRef.current.scrollWidth,
        height: invoiceRef.current.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${invoice.invoiceNumber}.pdf`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const exportToImage = async () => {
    if (!invoiceRef.current || !invoice) return;

    setIsExporting(true);
    setExportType('image');

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: invoiceRef.current.scrollWidth,
        height: invoiceRef.current.scrollHeight
      });

      const link = document.createElement('a');
      link.download = `${invoice.invoiceNumber}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error generating image:', error);
      alert('Error generating image. Please try again.');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const printInvoice = () => {
    if (!invoiceRef.current) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
                <html>
                    <head>
                        <title>Invoice ${invoice?.invoiceNumber}</title>
                        <style>
                            body { 
                                font-family: Arial, sans-serif; 
                                margin: 0; 
                                padding: 20px; 
                                background: white;
                                color: black;
                            }
                            .invoice-container { 
                                max-width: 800px; 
                                margin: 0 auto; 
                            }
                            @media print { 
                                body { margin: 0; padding: 10px; } 
                                .no-print { display: none !important; }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="invoice-container">
                            ${invoiceRef.current.innerHTML}
                        </div>
                    </body>
                </html>
            `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <Spinner
            animation="border"
            variant="primary"
            style={{ width: '3rem', height: '3rem' }}
            className="mb-3"
          />
          <p className="text-muted">Loading your invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h2 className="mb-3">Invoice not found</h2>
          <p className="text-muted mb-4">
            The requested invoice could not be found.
          </p>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100">
      <Container fluid className="py-4">
        {/* Header */}
        <Link to="/" className="mb-3 d-inline-block">
          <Button variant="outline">
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Back
          </Button>
        </Link>

        <div
          className={`d-flex justify-content-between align-items-center mb-4 px-2 ${
            theme === 'dark' ? 'bg-dark text-white' : 'bg-dark text-dark'
          }`}
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            padding: '1.5rem 0',
            borderBottom: '1px solid #e9ecef'
          }}
        >
          <div className="d-flex align-items-center">
            <div>
              <h1 className="h3 fw-bold mb-0">{`Invoice ${invoice.invoiceNumber}`}</h1>
              <p className="text-muted mb-0">
                Issued on {invoice.issueDate?.toLocaleDateString()}
              </p>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="d-flex gap-2">
            <Button
              variant="outline-primary"
              onClick={printInvoice}
              disabled={isExporting}
            >
              <FontAwesomeIcon icon={faPrint} className="me-2" />
              Print
            </Button>
            <Button
              variant="outline-success"
              onClick={exportToPDF}
              disabled={isExporting}
            >
              {isExporting && exportType === 'pdf' ? (
                <FontAwesomeIcon icon={faSpinner} className="fa-spin me-2" />
              ) : (
                <FontAwesomeIcon icon={faFilePdf} className="me-2" />
              )}
              PDF
            </Button>
            <Button
              variant="outline-info"
              onClick={exportToImage}
              disabled={isExporting}
            >
              {isExporting && exportType === 'image' ? (
                <FontAwesomeIcon icon={faSpinner} className="fa-spin me-2" />
              ) : (
                <FontAwesomeIcon icon={faImage} className="me-2" />
              )}
              Image
            </Button>
          </div>
        </div>
        {/* Status Banner */}
        <StatusBanner booking={invoice.booking} />
        {/* Invoice Content */}
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            <div className="p-4" ref={invoiceRef}>
              <UserInvoiceTemplate invoice={invoice} />
            </div>
          </Card.Body>
        </Card>
        {/* Booking Summary */}
        <Row className="mt-4">
          <Col md={6}>
            <BookingDetailsCard booking={invoice.booking} />
          </Col>
          <Col md={6}>
            <PaymentInfoCard
              transaction={invoice.transaction}
              paymentStatus={invoice.booking.paymentStatus}
            />
          </Col>
        </Row>
        {/* Help Section */}
        <Row className="mt-4">
          <Col>
            <HelpSection companyInfo={invoice.companyInfo} />
          </Col>
        </Row>
      </Container>
      {/* Loading Overlay */}
      {isExporting && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999 }}
        >
          <div className="text-center">
            <Spinner
              animation="border"
              variant="primary"
              style={{ width: '3rem', height: '3rem' }}
              className="mb-3"
            />
            <p className="text-white">
              Generating {exportType === 'pdf' ? 'PDF' : 'image'}...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInvoicePage;
