import { Row, Col, Card } from 'components/ui';
import {  } from '';
import {
  faBuilding,
  CheckCircle,
  faTimesCircle,
  Star
} from 'lucide-react';
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
      icon: CheckCircle,
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
      icon: Star,
      variant: 'warning',
      bgClass: 'bg-warning'
    }
  ];

  return (
    <Row className="mb-4">
      {stats.map((stat, index) => (
        <Col lg={3} md={6} key={index} className="mb-3">
          <Card className="border-secondary h-100">
            <Card.Body className="flex align-items-center">
              <div className={`rounded-circle px-3 py-3 me-3 ${stat.bgClass}`}>
                <
                  icon={stat.icon}
                  className="text-white"
                  size="lg"
                />
              </div>
              <div>
                <h3 className={`text-${stat.variant} mb-0`}>{stat.value}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-0 small">{stat.title}</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default FacilityStatsCards;
