import {
  UilBuilding,
  UilCheckCircle,
  UilClock,
  UilDollarAlt,
  UilEnvelopeAlt,
  UilFileCheckAlt,
  UilGlobe,
  UilPhone,
  UilPostcard
} from '@iconscout/react-unicons';
import classNames from 'classnames';
import Badge from 'components/base/Badge';
import Button from 'components/base/Button';
import LeadInfoItem from 'components/info-items/LeadInfoItem';
import { currencyFormat } from 'helpers/utils';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const AboutLeadCard = ({ className }: { className?: string }) => {
  return (
    <Card className={classNames(className)}>
      <Card.Body>
        <div className="d-flex align-items-center mb-5">
          <h3>About lead</h3>
          <Button variant="link" className="px-3">
            Edit
          </Button>
        </div>
        <LeadInfoItem className="mb-4" label="Email" icon={UilEnvelopeAlt}>
          <Link to="mailto:ansolo5@jeemail.com">ansolo5@jeemail.com</Link>
        </LeadInfoItem>
        <LeadInfoItem className="mb-4" label="Phone" icon={UilPhone}>
          <a href="tel:+1234567890">+1234567890</a>
        </LeadInfoItem>

        <LeadInfoItem className="mb-4" label="Website" icon={UilGlobe}>
          <a href="#!">www.bb.ru.com</a>
        </LeadInfoItem>

        <LeadInfoItem className="mb-4" label="Industry" icon={UilBuilding}>
          <p className="mb-0 text-body-secondary">Large Enterprise</p>
        </LeadInfoItem>

        <LeadInfoItem
          className="mb-4"
          label="Number of employees"
          icon={UilPostcard}
        >
          <p className="mb-0 text-body-secondary">126</p>
        </LeadInfoItem>

        <LeadInfoItem
          className="mb-4"
          label="Annual Revenue"
          icon={UilDollarAlt}
        >
          <p className="mb-0 text-body-secondary">{currencyFormat(12000)}</p>
        </LeadInfoItem>

        <LeadInfoItem className="mb-4" label="Last contacted" icon={UilClock}>
          <p className="mb-0 text-body-secondary">12 November 2021, 10:54 AM</p>
        </LeadInfoItem>

        <LeadInfoItem
          className="mb-4"
          label="Lead source"
          icon={UilFileCheckAlt}
        >
          <p className="mb-0 text-body-secondary">Advertisement</p>
        </LeadInfoItem>

        <LeadInfoItem label="Lead status" icon={UilCheckCircle}>
          <Badge variant="phoenix" bg="primary">
            New Lead
          </Badge>
        </LeadInfoItem>
      </Card.Body>
    </Card>
  );
};

export default AboutLeadCard;
