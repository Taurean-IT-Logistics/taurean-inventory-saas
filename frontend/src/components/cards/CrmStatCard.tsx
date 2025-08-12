import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Badge, { BadgeBg } from 'components/base/Badge';
import { Card } from 'react-bootstrap';

interface CrmStatCardProps {
  icon: IconProp;
  color: string;
  label: string;
  title: string;
  value: number;
  badgeLabel: string;
  badgeBg: BadgeBg;
  footerText: string;
}

const CrmStatCard = ({
  icon,
  color,
  label,
  title,
  value,
  badgeLabel,
  footerText,
  badgeBg
}: CrmStatCardProps) => {
  return (
    <Card className="h-100">
      <Card.Body>
        <div className="d-flex d-sm-block justify-content-between">
          <div className="border-bottom-sm mb-sm-4">
            <div className="d-flex align-items-center">
              <div
                className={`d-flex align-items-center icon-wrapper-sm shadow-${color}-100`}
                style={{ transform: 'rotate(-7.45deg)' }}
              >
                <FontAwesomeIcon
                  icon={icon}
                  className={`text-${color} fs-7 z-1 ms-2`}
                />
              </div>
              <p className="text-body-tertiary fs-9 mb-0 ms-2 mt-3">{label}</p>
            </div>
            <p className={`text-${color} mt-2 fs-6 fw-bold mb-0 mb-sm-4`}>
              {value} <span className="fs-8 text-body lh-lg">{title}</span>
            </p>
          </div>
          <div className="d-flex flex-column justify-content-center flex-between-end d-sm-block text-end text-sm-start">
            <Badge variant="phoenix" bg={badgeBg} className="fs-10 mb-2">
              {badgeLabel}
            </Badge>
            <p className="mb-0 fs-9 text-body-tertiary">{footerText}</p>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CrmStatCard;
