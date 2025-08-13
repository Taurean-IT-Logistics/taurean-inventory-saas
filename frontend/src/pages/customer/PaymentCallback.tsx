import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card,
  Container,
  Row,
  Col,
  Alert,
  Spinner,
  Button
} from 'components/ui';
import {  } from '';
import {
  CheckCircle,
  faTimesCircle,
  faReceipt,
  ListOl,
  faArrowLeft,
  Calendar,
  faRedo,
  faEnvelope,
  faPhone,
  faMobileAlt,
  faUser
} from 'lucide-react';
import { TransactionController } from 'controllers';
import { useAppSelector } from 'hooks/useAppDispatch';
import { RootState } from 'lib/store';

const PaymentCallback = () => {
  const { tokens } = useAppSelector((state: RootState) => state.auth);
  const accessToken = tokens.accessToken;
  const [status, setStatus] = useState('pending');
  const [paymentData, setPaymentData] = useState(null);
  const [accessCode, setAccessCode] = useState<string>('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Read payment reference from localStorage
        const paymentReference = localStorage.getItem('paymentReference');

        // Validate localStorage data exists
        if (!paymentReference) {
          setStatus('failed');
          setError('No payment reference found. Please try the payment again.');
          setLoading(false);
          return;
        }

        // Verify payment with backend
        const response = await TransactionController.verifyTransaction(
          paymentReference,
          accessToken
        );

        setAccessCode(response.data.transaction.accessCode || '');
        if (response?.success && response?.data) {
          const { data } = response;

          // Check if payment was successful
          if (data.status === 'success') {
            setStatus('success');
            setPaymentData(data);

            try {
              // Optionally save successful payment data
              localStorage.setItem(
                'lastSuccessfulPayment',
                JSON.stringify({
                  reference: data.reference,
                  amount: data.amount,
                  currency: data.currency,
                  timestamp: new Date().toISOString()
                })
              );
            } catch (storageError) {
              console.error('Error updating localStorage:', storageError);
              // Don't fail the whole process for storage errors
            }
          } else {
            setStatus('failed');
            setError(
              'Payment was not successful. Please try again or contact support.'
            );
          }
        } else {
          setStatus('failed');
          setError(
            response?.message ||
              'Payment verification failed. Please contact support.'
          );
        }
      } catch (err) {
        console.error('Payment verification error:', err);

        // Handle different types of errors
        if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
          setStatus('failed');
          setError(
            'Payment verification timed out. Please contact support to confirm your payment status.'
          );
        } else if (err.response?.status === 404) {
          setStatus('failed');
          setError(
            'Payment verification service not found. Please contact support.'
          );
        } else if (err.response?.status === 500) {
          setStatus('failed');
          setError(
            'Server error during payment verification. Please contact support.'
          );
        } else if (err.response?.data?.message) {
          setStatus('failed');
          setError(err.response.data.message);
        } else if (!navigator.onLine) {
          setStatus('failed');
          setError(
            'No internet connection. Please check your connection and try again.'
          );
        } else {
          setStatus('failed');
          setError(
            'Unable to verify payment. Please contact support with your payment reference.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to ensure the page has loaded completely
    const timer = setTimeout(verifyPayment, 1000);
    return () => clearTimeout(timer);
  }, [accessToken]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return (
          <
            icon={CheckCircle}
            className="text-success"
            style={{ fontSize: '4rem' }}
          />
        );
      case 'failed':
        return (
          <
            icon={faTimesCircle}
            className="text-danger"
            style={{ fontSize: '4rem' }}
          />
        );
      default:
        return (
          <Spinner
            animation="border"
            variant="warning"
            style={{ width: '4rem', height: '4rem' }}
          />
        );
    }
  };

  const getStatusVariant = () => {
    switch (status) {
      case 'success':
        return 'success';
      case 'failed':
        return 'danger';
      default:
        return 'warning';
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'success':
        return 'Payment Successful!';
      case 'failed':
        return 'Payment Failed';
      default:
        return 'Verifying Payment...';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'success':
        return `Your ${
          paymentData.transaction.category === 'booking' ? 'booking' : 'rental'
        } has been received and your payment was processed successfully.`;
      case 'failed':
        return (
          error ||
          'Unfortunately, your payment could not be processed at this time.'
        );
      default:
        return 'Please wait while we verify your payment...';
    }
  };

  const getNextSteps = () => {
    switch (status) {
      case 'success':
        return [
          `Your ${
            paymentData.transaction.category === 'booking'
              ? 'booking'
              : 'rental'
          } request has been sent to our staff for review and approval`,
          `You will receive a call or confirmation email once your ${
            paymentData.transaction.category === 'booking'
              ? 'booking'
              : 'rental'
          } is approved`,
          'Our team will contact you within 24 hours if additional information is needed',
          `You can track your ${
            paymentData.transaction.category === 'booking'
              ? 'booking'
              : 'rental'
          } status in the dashboard`
        ];
      case 'failed':
        return [
          'Please check your payment information and try again',
          'Ensure you have sufficient funds in your account',
          'Contact your bank if the issue persists',
          'Reach out to our support team for assistance'
        ];
      default:
        return [
          'Please do not close this page while payment is being verified',
          'This process usually takes a few seconds',
          'If this takes longer than expected, please contact support'
        ];
    }
  };

  const formatCurrency = (amount, currency = 'GHS') => {
    const currencySymbols = {
      GHS: '₵',
      NGN: '₦',
      USD: '$'
    };

    const symbol = currencySymbols[currency] || currency;
    const formattedAmount = isNaN(parseFloat(amount))
      ? '0'
      : parseFloat(amount).toLocaleString();

    return `${symbol}${formattedAmount}`;
  };
  const formatDate = dateString => {
    if (!dateString) return new Date().toLocaleDateString();

    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return new Date().toLocaleDateString();
    }
  };

  const getPaymentMethodDisplay = channel => {
    switch (channel?.toLowerCase()) {
      case 'mobile_money':
        return 'Mobile Money';
      case 'card':
        return 'Card Payment';
      case 'bank_transfer':
        return 'Bank Transfer';
      default:
        return channel || 'Unknown';
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center py-5">
      <Container fluid>
        <Row className="justify-center">
          <Col lg={8} xl={6}>
            <Card className="shadow-lg border-0">
              <Card.Body className="p-5">
                {/* Status Icon */}
                <div className="text-center mb-4">{getStatusIcon()}</div>

                {/* Status Title */}
                <h1 className="text-center mb-4 fw-bold">{getStatusTitle()}</h1>

                {/* Status Message */}
                <Alert variant={getStatusVariant()} className="text-center">
                  {getStatusMessage()}
                </Alert>

                {/* Loading State */}
                {loading && (
                  <div className="text-center py-5">
                    <Spinner
                      animation="border"
                      variant="primary"
                      className="mb-3"
                    />
                    <p className="text-gray-600 dark:text-gray-400">Verifying your payment...</p>
                  </div>
                )}

                {/* Error State - No Data */}
                {!loading && !paymentData && status === 'failed' && (
                  <Alert variant="danger" className="mb-4">
                    <Alert.Heading>Missing Payment Information</Alert.Heading>
                    <p>{error}</p>
                    <hr />
                    <div className="flex justify-content-center">
                      <Button
                        as={Link}
                        to="/facilities"
                        variant="outline-danger"
                      >
                        Start New Booking
                      </Button>
                    </div>
                  </Alert>
                )}

                {/* Payment Details */}
                {!loading && paymentData && (
                  <Card className="mb-4">
                    <Card.Header>
                      <h5 className="mb-0">
                        < icon={faReceipt} className="me-2" />
                        Transaction Details
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col md={6} className="mb-3">
                          <small className="text-gray-600 dark:text-gray-400">Reference Number</small>
                          <div className="font-bold font-monospace">
                            {paymentData.reference || 'N/A'}
                          </div>
                        </Col>
                        <Col md={6} className="mb-3">
                          <small className="text-gray-600 dark:text-gray-400">Amount Paid</small>
                          <div className="font-bold">
                            {formatCurrency(
                              paymentData.amount,
                              paymentData.currency
                            )}
                          </div>
                        </Col>
                        <Col md={6} className="mb-3">
                          <small className="text-gray-600 dark:text-gray-400">Payment Date</small>
                          <div className="font-bold">
                            {formatDate(paymentData.paid_at)}
                          </div>
                        </Col>
                        <Col md={6} className="mb-3">
                          <small className="text-gray-600 dark:text-gray-400">Payment Method</small>
                          <div className="font-bold d-flex align-items-center">
                            <
                              icon={
                                paymentData.channel === 'mobile_money'
                                  ? faMobileAlt
                                  : faReceipt
                              }
                              className="me-2 text-primary"
                            />
                            {getPaymentMethodDisplay(paymentData.channel)}
                          </div>
                        </Col>
                        <Col md={6} className="mb-3">
                          <small className="text-gray-600 dark:text-gray-400">Status</small>
                          <div
                            className={`fw-bold ${
                              status === 'success'
                                ? 'text-success'
                                : status === 'failed'
                                ? 'text-danger'
                                : 'text-warning'
                            }`}
                          >
                            {status
                              ? status.charAt(0).toUpperCase() + status.slice(1)
                              : 'Unknown'}
                          </div>
                        </Col>
                        <Col md={6} className="mb-3">
                          <small className="text-gray-600 dark:text-gray-400">Currency</small>
                          <div className="font-bold">
                            {paymentData.currency || 'N/A'}
                          </div>
                        </Col>
                      </Row>

                      {/* Customer Information */}
                      {paymentData.customer && (
                        <>
                          <hr className="my-3" />
                          <h6 className="mb-3">
                            < icon={faUser} className="me-2" />
                            Customer Information
                          </h6>
                          <Row>
                            <Col md={6} className="mb-3">
                              <small className="text-gray-600 dark:text-gray-400">Email</small>
                              <div className="font-bold">
                                {paymentData.customer.email || 'N/A'}
                              </div>
                            </Col>
                            <Col md={6} className="mb-3">
                              <small className="text-gray-600 dark:text-gray-400">
                                Customer Code
                              </small>
                              <div className="font-bold font-monospace">
                                {paymentData.customer.customer_code || 'N/A'}
                              </div>
                            </Col>
                          </Row>
                        </>
                      )}

                      {/* Transaction Information */}
                      {paymentData.transaction && (
                        <>
                          <hr className="my-3" />
                          <h6 className="mb-3">Additional Transaction Info</h6>
                          <Row>
                            <Col md={6} className="mb-3">
                              <small className="text-gray-600 dark:text-gray-400">
                                Transaction ID
                              </small>
                              <div className="font-bold font-monospace">
                                {paymentData.transaction._id || 'N/A'}
                              </div>
                            </Col>
                            <Col md={6} className="mb-3">
                              <small className="text-gray-600 dark:text-gray-400">Category</small>
                              <div className="font-bold">
                                {!paymentData.transaction.category
                                  ? 'N/A'
                                  : paymentData.transaction.category ===
                                    'booking'
                                  ? 'booking'
                                  : 'rental'}
                              </div>
                            </Col>
                            {paymentData.transaction.reconciledAt && (
                              <Col md={6} className="mb-3">
                                <small className="text-gray-600 dark:text-gray-400">
                                  Reconciled At
                                </small>
                                <div className="font-bold">
                                  {formatDate(
                                    paymentData.transaction.reconciledAt
                                  )}
                                </div>
                              </Col>
                            )}
                          </Row>
                        </>
                      )}
                    </Card.Body>
                  </Card>
                )}

                {/* Next Steps */}
                {!loading && (paymentData || status === 'failed') && (
                  <Card className="mb-4">
                    <Card.Header>
                      <h5 className="mb-0">
                        < icon={ListOl} className="me-2" />
                        What happens next?
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <ol className="list-unstyled">
                        {getNextSteps().map((step, index) => (
                          <li key={index} className="flex mb-3">
                            <span
                              className={`badge ${
                                status === 'success'
                                  ? 'bg-success'
                                  : status === 'failed'
                                  ? 'bg-danger'
                                  : 'bg-primary'
                              } rounded-pill me-3 mt-1`}
                              style={{ minWidth: '24px' }}
                            >
                              {index + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </Card.Body>
                  </Card>
                )}

                {/* Action Buttons */}
                {!loading && (
                  <div className="flex flex-column flex-sm-row gap-3 justify-content-center">
                    <Button as={Link} to="/" variant="outline-primary">
                      < icon={faArrowLeft} className="me-2" />
                      Back to Home
                    </Button>

                    {status === 'success' && (
                      <Button as={Link} to="/facilities" variant="primary">
                        <
                          icon={Calendar}
                          className="me-2"
                        />
                        View Facilities
                      </Button>
                    )}

                    {status === 'failed' && (
                      <>
                        <Button
                          onClick={() =>
                            (window.location.href = `https://checkout.paystack.com/${accessCode}`)
                          }
                          variant="danger"
                          disabled={!accessCode}
                        >
                          < icon={faRedo} className="me-2" />
                          Try Again
                        </Button>
                        <Button
                          variant="outline-secondary"
                          onClick={() => {
                            try {
                              localStorage.removeItem('paymentReference');
                              localStorage.removeItem('lastSuccessfulPayment');
                            } catch (e) {
                              console.error('Error clearing localStorage:', e);
                            }
                            navigate('/facilities');
                          }}
                        >
                          Start Fresh
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {/* Contact Support */}
                <hr className="my-4" />
                <div className="text-center">
                  <small className="text-gray-600 dark:text-gray-400 d-block mb-2">
                    Need help or have questions?
                  </small>
                  <div className="flex flex-column flex-sm-row gap-2 justify-content-center">
                    <small>
                      < icon={faEnvelope} className="me-1" />
                      <a
                        href="mailto:support@example.com"
                        className="text-decoration-none"
                      >
                        support@example.com
                      </a>
                    </small>
                    <small className="text-gray-600 dark:text-gray-400 d-none d-sm-inline">|</small>
                    <small>
                      < icon={faPhone} className="me-1" />
                      <a
                        href="tel:+1234567890"
                        className="text-decoration-none"
                      >
                        +123 456 7890
                      </a>
                    </small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PaymentCallback;
