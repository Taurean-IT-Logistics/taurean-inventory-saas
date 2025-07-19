import { useState } from 'react';
import { motion } from 'framer-motion';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faArrowRight,
  faUsers,
  faBuilding,
  faStar,
  faPhone,
  faEnvelope,
  faGift,
  faPercent,
  faClock,
  faShield,
  faFire,
  faHeart,
  faTrophy,
  faRocket,
  faHeadset,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import CompanyInfo from 'data';

// Floating Shape Component
const FloatingShape = ({
  shape,
  color,
  size,
  position,
  delay = 0
}: {
  shape: 'circle' | 'square' | 'triangle' | 'hexagon';
  color: string;
  size: number;
  position: { x: string; y: string };
  delay?: number;
}) => {
  const shapeStyles = {
    circle: {
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${color}40, ${color}80)`
    },
    square: {
      borderRadius: '20%',
      background: `linear-gradient(135deg, ${color}40, ${color}80)`,
      transform: 'rotate(45deg)'
    },
    triangle: {
      width: 0,
      height: 0,
      borderLeft: `${size / 2}px solid transparent`,
      borderRight: `${size / 2}px solid transparent`,
      borderBottom: `${size}px solid ${color}60`,
      background: 'transparent'
    },
    hexagon: {
      background: `linear-gradient(135deg, ${color}40, ${color}80)`,
      clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
    }
  };

  return (
    <motion.div
      className="position-absolute"
      style={{
        left: position.x,
        top: position.y,
        width: shape === 'triangle' ? 'auto' : `${size}px`,
        height: shape === 'triangle' ? 'auto' : `${size}px`,
        ...shapeStyles[shape],
        zIndex: 1
      }}
      animate={{
        y: [0, -15, 0],
        rotate: [0, 360],
        scale: [1, 1.1, 1]
      }}
      transition={{
        duration: 12,
        repeat: Number.POSITIVE_INFINITY,
        delay,
        ease: 'easeInOut'
      }}
    />
  );
};

// Holiday Booking Promotion Section
export const HolidayBookingSection = () => {
  return (
    <section
      className="d-flex align-items-center position-relative overflow-hidden"
      style={{
        height: '33vh',
        minHeight: '400px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      {/* Floating Shapes */}
      <FloatingShape
        shape="circle"
        color="#ffffff"
        size={40}
        position={{ x: '10%', y: '20%' }}
        delay={0}
      />
      <FloatingShape
        shape="hexagon"
        color="#ffffff"
        size={35}
        position={{ x: '85%', y: '15%' }}
        delay={2}
      />
      <FloatingShape
        shape="square"
        color="#ffffff"
        size={30}
        position={{ x: '15%', y: '75%' }}
        delay={4}
      />

      <Container style={{ zIndex: 10 }}>
        <Row className="align-items-center">
          <Col lg={8}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge bg="warning" className="mb-3 px-3 py-2 rounded-pill fs-6">
                <FontAwesomeIcon icon={faGift} className="me-2" />
                Limited Time Offer
              </Badge>

              <h1
                className="display-5 fw-bold text-white mb-3"
                style={{ lineHeight: 1.1 }}
              >
                Get <span className="text-warning">10 Holiday Days</span>
                <br />
                Book Your Perfect Venue Now!
              </h1>

              <p className="text-white opacity-90 mb-4 fs-5">
                Reserve any facility for 10+ days and unlock exclusive holiday
                rates. Perfect for corporate retreats, events, and extended
                bookings.
              </p>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  to="/facilities"
                  as={Link}
                  className="rounded-pill px-4 py-3 fw-semibold me-3"
                  style={{
                    background: 'linear-gradient(45deg, #ffeaa7, #fdcb6e)',
                    color: '#2d3436',
                    border: 'none'
                  }}
                >
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                  Book Facilities
                  <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                </Button>
              </motion.div>
            </motion.div>
          </Col>

          <Col lg={4}>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.div
                className="rounded-4 mx-auto d-flex align-items-center justify-content-center"
                style={{
                  width: '200px',
                  height: '200px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
                animate={{
                  y: [0, -10, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut'
                }}
              >
                <div className="text-center text-white">
                  <FontAwesomeIcon
                    icon={faBuilding}
                    size="4x"
                    className="mb-3"
                  />
                  <h4 className="fw-bold">Premium Venues</h4>
                </div>
              </motion.div>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

// Booking Stats Section
export const BookingStatsSection = () => {
  const stats = [
    {
      icon: faUsers,
      number: '2,500+',
      label: 'Happy Clients',
      color: '#00b894'
    },
    {
      icon: faBuilding,
      number: '150+',
      label: 'Premium Facilities',
      color: '#0984e3'
    },
    {
      icon: faStar,
      number: '4.9',
      label: 'Average Rating',
      color: '#fdcb6e'
    },
    {
      icon: faTrophy,
      number: '98%',
      label: 'Success Rate',
      color: '#e17055'
    }
  ];

  return (
    <section
      className="d-flex align-items-center position-relative overflow-hidden"
      style={{
        height: '33vh',
        minHeight: '400px',
        background: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)'
      }}
    >
      {/* Floating Shapes */}
      <FloatingShape
        shape="circle"
        color="#00b894"
        size={45}
        position={{ x: '8%', y: '15%' }}
        delay={0}
      />
      <FloatingShape
        shape="square"
        color="#0984e3"
        size={35}
        position={{ x: '88%', y: '20%' }}
        delay={2}
      />
      <FloatingShape
        shape="hexagon"
        color="#fdcb6e"
        size={40}
        position={{ x: '12%', y: '80%' }}
        delay={4}
      />

      <Container style={{ zIndex: 10 }}>
        <Row className="text-center mb-4">
          <Col>
            <motion.h2
              className="display-6 fw-bold text-white mb-3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Trusted by Thousands
            </motion.h2>
            <motion.p
              className="text-white opacity-75 fs-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Numbers that speak for our excellence
            </motion.p>
          </Col>
        </Row>

        <Row className="g-3">
          {stats.map((stat, index) => (
            <Col md={6} lg={3} key={index}>
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <motion.div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: '80px',
                    height: '80px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <FontAwesomeIcon
                    icon={stat.icon}
                    size="2x"
                    className="text-white"
                  />
                </motion.div>

                <motion.h3
                  className="display-6 fw-bold text-white mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                >
                  {stat.number}
                </motion.h3>

                <p className="text-white opacity-75 fw-semibold mb-0">
                  {stat.label}
                </p>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

// Facility Advertisement Section
export const FacilityAdvertisementSection = () => {
  return (
    <section
      className="d-flex align-items-center position-relative overflow-hidden"
      style={{
        height: '33vh',
        minHeight: '400px',
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'
      }}
    >
      {/* Floating Shapes */}
      <FloatingShape
        shape="hexagon"
        color="#ffffff"
        size={50}
        position={{ x: '12%', y: '25%' }}
        delay={0}
      />
      <FloatingShape
        shape="circle"
        color="#ffffff"
        size={40}
        position={{ x: '85%', y: '20%' }}
        delay={3}
      />
      <FloatingShape
        shape="square"
        color="#ffffff"
        size={35}
        position={{ x: '10%', y: '75%' }}
        delay={6}
      />

      <Container style={{ zIndex: 10 }}>
        <Row className="align-items-center">
          <Col lg={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge
                bg="light"
                text="dark"
                className="mb-3 px-3 py-2 rounded-pill fs-6"
              >
                <FontAwesomeIcon icon={faFire} className="me-2" />
                Hot Deal
              </Badge>

              <h1
                className="display-5 fw-bold text-white mb-3"
                style={{ lineHeight: 1.1 }}
              >
                Premium Facilities
                <br />
                <span className="text-warning">Up to 40% OFF</span>
              </h1>

              <p className="text-white opacity-90 mb-4 fs-5">
                Book our top-rated meeting rooms, event halls, and conference
                centers at unbeatable prices. Limited slots available!
              </p>

              <div className="d-flex flex-column flex-sm-row gap-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="rounded-pill px-4 py-3 fw-semibold"
                    style={{
                      background: 'linear-gradient(45deg, #ffeaa7, #fdcb6e)',
                      color: '#2d3436',
                      border: 'none'
                    }}
                  >
                    <FontAwesomeIcon icon={faPercent} className="me-2" />
                    View Deals
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline-light"
                    size="lg"
                    className="rounded-pill px-4 py-3 fw-semibold"
                  >
                    <FontAwesomeIcon icon={faBuilding} className="me-2" />
                    Browse All
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </Col>

          <Col lg={6}>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Row className="g-3">
                <Col xs={6}>
                  <motion.div
                    className="rounded-4 p-3 text-center text-white"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      height: '120px'
                    }}
                    whileHover={{ scale: 1.05 }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faBuilding}
                      size="2x"
                      className="mb-2"
                    />
                    <h6 className="fw-bold mb-0">Meeting Rooms</h6>
                  </motion.div>
                </Col>
                <Col xs={6}>
                  <motion.div
                    className="rounded-4 p-3 text-center text-white"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      height: '120px'
                    }}
                    whileHover={{ scale: 1.05 }}
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: 1
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faUsers}
                      size="2x"
                      className="mb-2"
                    />
                    <h6 className="fw-bold mb-0">Event Halls</h6>
                  </motion.div>
                </Col>
              </Row>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

// Contact Team Section
export const ContactTeamSection = () => {
  const [hoveredContact, setHoveredContact] = useState<number | null>(null);

  const contactMethods = [
    {
      icon: faPhone,
      title: 'Call Us',
      info: CompanyInfo.phone,
      color: '#00b894'
    },
    {
      icon: faEnvelope,
      title: 'Email Us',
      info: CompanyInfo.support,
      color: '#0984e3'
    },
    {
      icon: faHeadset,
      title: 'Live Chat',
      info: 'Available 24/7',
      color: '#6c5ce7'
    }
  ];

  return (
    <section
      className="d-flex align-items-center position-relative overflow-hidden"
      style={{
        height: '33vh',
        minHeight: '400px',
        background: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)'
      }}
    >
      {/* Floating Shapes */}
      <FloatingShape
        shape="circle"
        color="#ffffff"
        size={45}
        position={{ x: '10%', y: '20%' }}
        delay={0}
      />
      <FloatingShape
        shape="hexagon"
        color="#ffffff"
        size={40}
        position={{ x: '85%', y: '15%' }}
        delay={3}
      />
      <FloatingShape
        shape="square"
        color="#ffffff"
        size={35}
        position={{ x: '15%', y: '80%' }}
        delay={6}
      />

      <Container style={{ zIndex: 10 }}>
        <Row className="align-items-center">
          <Col lg={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge
                bg="light"
                text="dark"
                className="mb-3 px-3 py-2 rounded-pill fs-6"
              >
                <FontAwesomeIcon icon={faHeadset} className="me-2" />
                Expert Support
              </Badge>

              <h1
                className="display-5 fw-bold text-white mb-3"
                style={{ lineHeight: 1.1 }}
              >
                Need Help?
                <br />
                <span className="text-warning">Contact Our Team</span>
              </h1>

              <p className="text-white opacity-90 mb-4 fs-5">
                Our dedicated support team is here to help you find the perfect
                facility and make your booking process seamless.
              </p>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  as={Link}
                  to={`mailto:${CompanyInfo.support}`}
                  className="rounded-pill px-4 py-3 fw-semibold"
                  style={{
                    background: 'linear-gradient(45deg, #ffeaa7, #fdcb6e)',
                    color: '#2d3436',
                    border: 'none'
                  }}
                >
                  <FontAwesomeIcon icon={faRocket} className="me-2" />
                  Get Started
                </Button>
              </motion.div>
            </motion.div>
          </Col>

          <Col lg={6}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Row className="g-3">
                {contactMethods.map((method, index) => (
                  <Col xs={12} key={index}>
                    <motion.div
                      className="rounded-4 p-3 d-flex align-items-center text-white"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        cursor: 'pointer'
                      }}
                      whileHover={{ scale: 1.02, x: 10 }}
                      onMouseEnter={() => setHoveredContact(index)}
                      onMouseLeave={() => setHoveredContact(null)}
                    >
                      <motion.div
                        className="rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{
                          width: '50px',
                          height: '50px',
                          background: `linear-gradient(135deg, ${method.color}40, ${method.color}80)`
                        }}
                        animate={
                          hoveredContact === index
                            ? { rotate: 10, scale: 1.1 }
                            : { rotate: 0, scale: 1 }
                        }
                        transition={{ duration: 0.3 }}
                      >
                        <FontAwesomeIcon icon={method.icon} size="lg" />
                      </motion.div>
                      <div>
                        <h6 className="fw-bold mb-1">{method.title}</h6>
                        <p className="mb-0 opacity-75 small">{method.info}</p>
                      </div>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

// Special Deals Section
export const SpecialDealsSection = () => {
  return (
    <section
      className="d-flex align-items-center position-relative overflow-hidden"
      style={{
        height: '33vh',
        minHeight: '400px',
        background: 'linear-gradient(135deg, #00cec9 0%, #55a3ff 100%)'
      }}
    >
      {/* Floating Shapes */}
      <FloatingShape
        shape="hexagon"
        color="#ffffff"
        size={50}
        position={{ x: '8%', y: '20%' }}
        delay={0}
      />
      <FloatingShape
        shape="circle"
        color="#ffffff"
        size={40}
        position={{ x: '88%', y: '25%' }}
        delay={2}
      />
      <FloatingShape
        shape="square"
        color="#ffffff"
        size={35}
        position={{ x: '12%', y: '75%' }}
        delay={4}
      />

      <Container style={{ zIndex: 10 }} className="p-4">
        <Row className="align-items-center text-center">
          <Col lg={8} className="mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge bg="warning" className="mb-3 px-3 py-2 rounded-pill fs-6">
                <FontAwesomeIcon icon={faChartLine} className="me-2" />
                Growing Fast
              </Badge>

              <h1
                className="display-5 fw-bold text-white mb-3"
                style={{ lineHeight: 1.1 }}
              >
                Join <span className="text-warning">2,500+ Clients</span>
                <br />
                Who Trust Our Facilities
              </h1>

              <p className="text-white opacity-90 mb-4 fs-5">
                From startups to Fortune 500 companies, businesses choose our
                premium facilities for their most important events and meetings.
              </p>

              <Row className="g-3 mb-4">
                <Col md={4}>
                  <motion.div
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faShield}
                      size="2x"
                      className="text-white mb-2"
                    />
                    <h6 className="text-white fw-bold">Secure Booking</h6>
                  </motion.div>
                </Col>
                <Col md={4}>
                  <motion.div
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: 1
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faClock}
                      size="2x"
                      className="text-white mb-2"
                    />
                    <h6 className="text-white fw-bold">24/7 Support</h6>
                  </motion.div>
                </Col>
                <Col md={4}>
                  <motion.div
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                      duration: 3.5,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: 2
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faHeart}
                      size="2x"
                      className="text-white mb-2"
                    />
                    <h6 className="text-white fw-bold">Loved by All</h6>
                  </motion.div>
                </Col>
              </Row>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  as={Link}
                  to="/facilities"
                  className="rounded-pill px-5 py-3 mb-2 fw-semibold"
                  style={{
                    background: 'linear-gradient(45deg, #ffeaa7, #fdcb6e)',
                    color: '#2d3436',
                    border: 'none'
                  }}
                >
                  <FontAwesomeIcon icon={faBuilding} className="me-2" />
                  Explore Facilities
                  <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                </Button>
              </motion.div>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};
