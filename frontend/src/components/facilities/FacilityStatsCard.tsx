import { Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faCheckCircle,
  faTimesCircle,
  faStar
} from '@fortawesome/free-solid-svg-icons';
import { Facility } from 'types';

interface FacilityStatsCardsProps {
  facilities: Facility[];
}

const FacilityStatsCards = ({ facilities }: FacilityStatsCardsProps) => {
  const totalFacilities = facilities.length;
  const activeFacilities = facilities.filter(
    f => f.isActive && !f.isDeleted
  ).length;
  const inactiveFacilities = facilities.filter(
    f => !f.isActive || f.isDeleted
  ).length;
  const averageRating =
    facilities.reduce((sum, f) => sum + (f.rating?.average || 0), 0) /
      totalFacilities || 0;

  const stats = [
    {
      title: 'Total Facilities',
      value: totalFacilities,
      icon: faBuilding,
      variant: 'primary',
      bgClass: 'bg-primary'
    },
    {
      title: 'Active Facilities',
      value: activeFacilities,
      icon: faCheckCircle,
      variant: 'success',
      bgClass: 'bg-success'
    },
    {
      title: 'Inactive Facilities',
      value: inactiveFacilities,
      icon: faTimesCircle,
      variant: 'danger',
      bgClass: 'bg-danger'
    },
    {
      title: 'Average Rating',
      value: averageRating.toFixed(1),
      icon: faStar,
      variant: 'warning',
      bgClass: 'bg-warning'
    }
  ];

  return (
    <Row className="mb-4">
      {stats.map((stat, index) => (
        <Col lg={3} md={6} key={index} className="mb-3">
          <Card className="border-secondary h-100">
            <Card.Body className="d-flex align-items-center">
              <div className={`rounded-circle px-3 py-3 me-3 ${stat.bgClass}`}>
                <FontAwesomeIcon
                  icon={stat.icon}
                  className="text-white"
                  size="lg"
                />
              </div>
              <div>
                <h3 className={`text-${stat.variant} mb-0`}>{stat.value}</h3>
                <p className="text-muted mb-0 small">{stat.title}</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default FacilityStatsCards;
