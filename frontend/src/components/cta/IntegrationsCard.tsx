import React from 'react';
import bgIllustrations from 'assets/img/spot-illustrations/interations.png';
import { Card } from 'react-bootstrap';
import Button from 'components/base/Button';
import { Link } from 'react-router-dom';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const IntegrationsCard = () => {
  return (
    <Card className="mb-3">
      <div
        className="bg-holder bg-card"
        style={{
          backgroundImage: `url(${bgIllustrations})`,
          backgroundSize: 'auto',
          backgroundPosition: 'bottom right 0px'
        }}
      />
      <Card.Body className="z-5">
        <div>
          <h3 className="text-body-highlight mb-3">Phoenix integrations</h3>
          <p className="text-body-tertiary mb-4 w-75 w-xl-100">
            Phoenix improves efficiency instantly and effortlessly
            <br className="d-none d-xxl-block" /> by allowing easy & simple
            connection <br className="d-none d-xxl-block" /> to other popular
            programs
          </p>
          <Button
            variant="phoenix-primary"
            size="sm"
            as={Link}
            to={`#!`}
            startIcon={<FontAwesomeIcon icon={faLink} className="me-1" />}
          >
            Connect Now
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};
